import { firestore, isFirebaseConfigured } from '../config/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { mergeTestCases, mergeBugs, mergeFiles } from '../utils/workspaceMerger';

// Generate user-scoped storage keys
const getStorageKey = (key, userId) => {
  const scope = userId ? `_${userId}` : '_guest';
  return `qa_${key}_v2${scope}`;
};

// Safe JSON loader
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
};

// Safe JSON saver
const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
};

// Firestore has a hard 1 MiB (1,048,576 byte) document limit.
// We chunk payloads only if they exceed 850,000 characters to keep single-document real-time onSnapshot instant.
const CHUNK_SIZE = 850000;

const splitIntoChunks = (str, chunkSize = CHUNK_SIZE) => {
  const chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Writes document data to Firestore, automatically chunking large payloads across
 * sibling documents only if total string length exceeds CHUNK_SIZE (~850KB).
 */
const writeChunkedDoc = async (collectionPath, docId, baseData, payloadString) => {
  if (!isFirebaseConfigured || !firestore) return;

  const totalLength = (payloadString || '').length;
  const isChunked = totalLength > CHUNK_SIZE;

  if (!isChunked) {
    const docRef = doc(firestore, collectionPath, docId);
    await setDoc(docRef, {
      ...baseData,
      payload: payloadString,
      isChunked: false,
      chunkCount: 1,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Clean up any old sibling chunk document so queries and listeners are purely single-doc
    try {
      const oldChunkRef = doc(firestore, collectionPath, `${docId}__chunk_1`);
      await deleteDoc(oldChunkRef);
    } catch (_) {}
    return;
  }

  // Chunked storage
  const chunks = splitIntoChunks(payloadString, CHUNK_SIZE);
  const mainDocRef = doc(firestore, collectionPath, docId);

  // 1. Write sibling chunks 1..N-1 FIRST so they are guaranteed to exist before onSnapshot triggers
  const subChunkWrites = [];
  for (let i = 1; i < chunks.length; i++) {
    const chunkDocRef = doc(firestore, collectionPath, `${docId}__chunk_${i}`);
    subChunkWrites.push(setDoc(chunkDocRef, {
      parentId: docId,
      isChunkDoc: true,
      chunkIndex: i,
      chunk: chunks[i],
      payload: chunks[i], // both keys for backwards compatibility
      updatedAt: new Date().toISOString(),
    }));
  }
  await Promise.all(subChunkWrites);

  // 2. Write main document (triggers onSnapshot listener with guaranteed chunk availability)
  await setDoc(mainDocRef, {
    ...baseData,
    payload: chunks[0],
    isChunked: true,
    chunkCount: chunks.length,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

/**
 * Reads document data and reassembles chunks if isChunked is true.
 * Includes retries for temporary eventual-consistency delays on newly written chunks.
 */
const readChunkedDocPayload = async (collectionPath, docId, docData) => {
  if (!docData) return null;
  if (!docData.isChunked || !docData.chunkCount || docData.chunkCount <= 1) {
    return docData.payload || null;
  }

  let fullPayload = docData.payload || '';
  for (let i = 1; i < docData.chunkCount; i++) {
    const chunkRef = doc(firestore, collectionPath, `${docId}__chunk_${i}`);
    let chunkSnap = await getDoc(chunkRef);

    // Resilient retry in case replication delay makes sibling chunk momentarily unavailable
    if (!chunkSnap.exists()) {
      for (let attempt = 0; attempt < 3 && !chunkSnap.exists(); attempt++) {
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
        chunkSnap = await getDoc(chunkRef);
      }
    }

    if (chunkSnap.exists()) {
      const data = chunkSnap.data();
      fullPayload += (data?.chunk || data?.payload || '');
    } else {
      console.warn(`[Firebase] Missing chunk ${i} for ${collectionPath}/${docId}`);
    }
  }

  return fullPayload;
};

const pendingUserSyncs = new Map();

/**
 * Cloud sync helper scoped to the authenticated user's private collection:
 * /users/{userId}/qa_manager/{docId}
 * Debounced by 1 second to prevent write stream exhaustion.
 */
const syncToFirestore = (userId, docId, data) => {
  if (!isFirebaseConfigured || !firestore || !userId) return;
  const key = `${userId}_${docId}`;
  if (pendingUserSyncs.has(key)) {
    clearTimeout(pendingUserSyncs.get(key));
  }
  const timer = setTimeout(async () => {
    pendingUserSyncs.delete(key);
    try {
      const payloadString = JSON.stringify(data);
      await writeChunkedDoc(`users/${userId}/qa_manager`, docId, { ownerId: userId }, payloadString);
    } catch (error) {
      console.warn(`[Firebase] Failed to sync ${docId} to user ${userId}:`, error.message);
    }
  }, 1000);
  pendingUserSyncs.set(key, timer);
};

export const db = {
  // --- Projects ---
  getProjects: (userId) => {
    const key = getStorageKey('projects', userId);
    return load(key, []);
  },
  saveProjects: (projects, userId, syncRemote = true) => {
    const key = getStorageKey('projects', userId);
    save(key, projects);
    if (syncRemote) syncToFirestore(userId, 'projects', projects);
  },

  // --- Test Files ---
  getFiles: (userId) => {
    const key = getStorageKey('files', userId);
    return load(key, []);
  },
  saveFiles: (files, userId, syncRemote = true) => {
    const key = getStorageKey('files', userId);
    save(key, files);
    if (syncRemote) syncToFirestore(userId, 'files', files);
  },

  // --- Test Cases ---
  getTestCases: (userId) => {
    const key = getStorageKey('tests', userId);
    return load(key, []);
  },
  saveTestCases: (tests, userId, syncRemote = true) => {
    const key = getStorageKey('tests', userId);
    save(key, tests);
    if (syncRemote) syncToFirestore(userId, 'tests', tests);
  },

  // --- Bugs & Issues ---
  getBugs: (userId) => {
    const key = getStorageKey('bugs', userId);
    return load(key, []);
  },
  saveBugs: (bugs, userId, syncRemote = true) => {
    const key = getStorageKey('bugs', userId);
    save(key, bugs);
    if (syncRemote) syncToFirestore(userId, 'bugs', bugs);
  },

  // --- Reports ---
  getReports: (userId) => {
    const key = getStorageKey('reports', userId);
    return load(key, []);
  },
  saveReports: (reports, userId, syncRemote = true) => {
    const key = getStorageKey('reports', userId);
    save(key, reports);
    if (syncRemote) syncToFirestore(userId, 'reports', reports);
  },

  // --- Wipe User Data ---
  wipeAllData: async (userId) => {
    localStorage.removeItem(getStorageKey('projects', userId));
    localStorage.removeItem(getStorageKey('files', userId));
    localStorage.removeItem(getStorageKey('tests', userId));
    localStorage.removeItem(getStorageKey('bugs', userId));
    localStorage.removeItem(getStorageKey('reports', userId));
    
    if (isFirebaseConfigured && firestore && userId) {
      try {
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'projects'), { payload: '[]' });
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'files'), { payload: '[]' });
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'tests'), { payload: '[]' });
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'bugs'), { payload: '[]' });
        await setDoc(doc(firestore, 'users', userId, 'qa_manager', 'reports'), { payload: '[]' });
      } catch (err) {
        console.warn('[Firebase] Clear cloud error for user:', err);
      }
    }
  },

  // --- Cloud Pull (Loads this user's private data from Firestore) ---
  pullFromFirestore: async (userId, userEmail) => {
    if (!isFirebaseConfigured || !firestore || !userId) return null;
    try {
      const [projSnap, filesSnap, testsSnap, bugsSnap, reportsSnap] = await Promise.all([
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'projects')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'files')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'tests')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'bugs')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'reports')),
      ]);

      const collectionPath = `users/${userId}/qa_manager`;
      const [projPayload, filesPayload, testsPayload, bugsPayload, reportsPayload] = await Promise.all([
        projSnap.exists() ? readChunkedDocPayload(collectionPath, 'projects', projSnap.data()) : null,
        filesSnap.exists() ? readChunkedDocPayload(collectionPath, 'files', filesSnap.data()) : null,
        testsSnap.exists() ? readChunkedDocPayload(collectionPath, 'tests', testsSnap.data()) : null,
        bugsSnap.exists() ? readChunkedDocPayload(collectionPath, 'bugs', bugsSnap.data()) : null,
        reportsSnap.exists() ? readChunkedDocPayload(collectionPath, 'reports', reportsSnap.data()) : null,
      ]);

      const result = {};
      if (projPayload) {
        result.projects = JSON.parse(projPayload);
        save(getStorageKey('projects', userId), result.projects);
      }
      if (filesPayload) {
        result.files = JSON.parse(filesPayload);
        save(getStorageKey('files', userId), result.files);
      }
      if (testsPayload) {
        result.tests = JSON.parse(testsPayload);
        save(getStorageKey('tests', userId), result.tests);
      }
      if (bugsPayload) {
        result.bugs = JSON.parse(bugsPayload);
        save(getStorageKey('bugs', userId), result.bugs);
      }
      if (reportsPayload) {
        result.reports = JSON.parse(reportsPayload);
        save(getStorageKey('reports', userId), result.reports);
      }

      // Check shared workspaces where this user is an active member
      if (userEmail) {
        try {
          const sharedWorkspaces = await db.getSharedWorkspacesForUser(userEmail);
          if (sharedWorkspaces && sharedWorkspaces.length > 0) {
            const currentProjects = result.projects || db.getProjects(userId);
            const currentFiles = result.files || db.getFiles(userId);
            const currentTests = result.tests || db.getTestCases(userId);
            const currentBugs = result.bugs || db.getBugs(userId);
            const currentReports = result.reports || db.getReports(userId);

            const projectMap = new Map(currentProjects.map(p => [p.id, p]));
            const fileMap = new Map(currentFiles.map(f => [f.id, f]));
            const testMap = new Map(currentTests.map(t => [t.id, t]));
            const bugMap = new Map(currentBugs.map(b => [b.id, b]));
            const reportMap = new Map(currentReports.map(r => [r.id, r]));

            sharedWorkspaces.forEach(({ project, files, tests, bugs, reports }) => {
              if (project) projectMap.set(project.id, project);
              if (files) files.forEach(f => fileMap.set(f.id, f));
              if (tests) tests.forEach(t => testMap.set(t.id, t));
              if (bugs) bugs.forEach(b => bugMap.set(b.id, b));
              if (reports) reports.forEach(r => reportMap.set(r.id, r));
            });

            result.projects = Array.from(projectMap.values());
            result.files = Array.from(fileMap.values());
            result.tests = Array.from(testMap.values());
            result.bugs = Array.from(bugMap.values());
            result.reports = Array.from(reportMap.values());

            save(getStorageKey('projects', userId), result.projects);
            save(getStorageKey('files', userId), result.files);
            save(getStorageKey('tests', userId), result.tests);
            save(getStorageKey('bugs', userId), result.bugs);
            save(getStorageKey('reports', userId), result.reports);
          }
        } catch (sharedErr) {
          console.warn('[Firebase] Error fetching shared workspaces for user:', sharedErr);
        }
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (err) {
      console.warn('[Firebase] Could not pull from Firestore for user:', err);
      return null;
    }
  },

  // =========================================================================
  // --- Workspace Invitations & Team Collaboration System ---
  // =========================================================================

  /**
   * Create an invitation to collaborate on a project workspace
   */
  createInvitation: async ({ projectId, projectName, inviterEmail, inviterName, inviteeEmail, role = 'QA Tester' }) => {
    const inviteId = 'inv_' + Math.random().toString(36).substring(2, 10);
    const normalizedEmail = inviteeEmail.trim().toLowerCase();

    const inviteData = {
      id: inviteId,
      projectId,
      projectName,
      inviterEmail: inviterEmail || 'Owner',
      inviterName: inviterName || inviterEmail?.split('@')[0] || 'Owner',
      inviteeEmail: normalizedEmail,
      role,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 1. Local Cache for instant retrieval
    const localInvites = load('qa_workspace_invitations_v2', []);
    // Replace any existing pending invite for same email + project
    const filtered = localInvites.filter(i => !(i.projectId === projectId && i.inviteeEmail === normalizedEmail));
    filtered.push(inviteData);
    save('qa_workspace_invitations_v2', filtered);

    // 2. Sync to Firestore invitations collection
    if (isFirebaseConfigured && firestore) {
      try {
        await setDoc(doc(firestore, 'invitations', inviteId), inviteData);
      } catch (err) {
        console.warn('[Firebase] Failed to write invitation to Firestore:', err.message);
      }
    }

    return inviteData;
  },

  /**
   * Fetch all pending invitations for a given user email
   */
  getPendingInvitations: async (userEmail) => {
    if (!userEmail) return [];
    const normalizedEmail = userEmail.trim().toLowerCase();
    const invitesMap = new Map();

    // Check Local Storage
    const localInvites = load('qa_workspace_invitations_v2', []);
    localInvites.forEach(inv => {
      if (inv.inviteeEmail === normalizedEmail && inv.status === 'pending') {
        invitesMap.set(inv.id, inv);
      }
    });

    // Query Firestore
    if (isFirebaseConfigured && firestore) {
      try {
        const q = query(
          collection(firestore, 'invitations'),
          where('inviteeEmail', '==', normalizedEmail),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
          invitesMap.set(docSnap.id, { ...docSnap.data(), id: docSnap.id });
        });
      } catch (err) {
        console.warn('[Firebase] Error fetching invitations from Firestore:', err.message);
      }
    }

    return Array.from(invitesMap.values());
  },

  /**
   * Get all invitations sent for a specific project
   */
  getProjectInvitations: async (projectId) => {
    if (!projectId) return [];
    const invitesMap = new Map();

    const localInvites = load('qa_workspace_invitations_v2', []);
    localInvites.forEach(inv => {
      if (inv.projectId === projectId) {
        invitesMap.set(inv.id, inv);
      }
    });

    if (isFirebaseConfigured && firestore) {
      try {
        const q = query(
          collection(firestore, 'invitations'),
          where('projectId', '==', projectId)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
          invitesMap.set(docSnap.id, { ...docSnap.data(), id: docSnap.id });
        });
      } catch (err) {
        console.warn('[Firebase] Error fetching project invitations:', err.message);
      }
    }

    return Array.from(invitesMap.values());
  },

  /**
   * Fetch a single invitation directly by ID (from local storage or Firestore)
   */
  getInvitationById: async (inviteId) => {
    if (!inviteId) return null;

    // 1. Check local storage
    const localInvites = load('qa_workspace_invitations_v2', []);
    const localMatch = localInvites.find(i => i.id === inviteId);
    if (localMatch) return localMatch;

    // 2. Query Firestore
    if (isFirebaseConfigured && firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'invitations', inviteId));
        if (snap.exists()) {
          return { ...snap.data(), id: snap.id };
        }
      } catch (err) {
        console.warn('[Firebase] Error fetching invitation by id:', err.message);
      }
    }
    return null;
  },

  /**
   * Accept an invitation and gain access to the workspace
   */
  acceptInvitation: async (inviteId, currentUser, fallbackProjectId) => {
    if (!currentUser) return null;

    // 1. Update local invitations
    const localInvites = load('qa_workspace_invitations_v2', []);
    const inv = localInvites.find(i => i.id === inviteId);
    if (inv) {
      inv.status = 'accepted';
      inv.acceptedAt = new Date().toISOString();
      inv.acceptedByUid = currentUser.uid;
      inv.acceptedByEmail = currentUser.email;
      save('qa_workspace_invitations_v2', localInvites);
    }

    // 2. Update Firestore
    let inviteData = inv;
    if (isFirebaseConfigured && firestore && inviteId) {
      try {
        const inviteRef = doc(firestore, 'invitations', inviteId);
        const snap = await getDoc(inviteRef);
        if (snap.exists()) {
          inviteData = { ...snap.data(), id: snap.id };
          await setDoc(inviteRef, {
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            acceptedByUid: currentUser.uid,
            acceptedByEmail: currentUser.email
          }, { merge: true });
        }
      } catch (err) {
        console.warn('[Firebase] Failed to update accepted invitation:', err.message);
      }
    }

    const projectId = inviteData?.projectId || fallbackProjectId;
    if (!projectId) return null;

    // 3. Ensure currentUser.email is added to shared_workspaces/{projectId}.members in Firestore
    if (isFirebaseConfigured && firestore) {
      try {
        const wsRef = doc(firestore, 'shared_workspaces', projectId);
        const wsSnap = await getDoc(wsRef);
        if (wsSnap.exists()) {
          const wsData = wsSnap.data();
          const currentMembers = Array.isArray(wsData.members) ? [...wsData.members] : [];
          const normalizedEmail = (currentUser.email || '').toLowerCase();
          if (normalizedEmail && !currentMembers.includes(normalizedEmail)) {
            currentMembers.push(normalizedEmail);
          }

          let parsedPayload = {};
          try {
            const rawPayload = await readChunkedDocPayload('shared_workspaces', projectId, wsData);
            parsedPayload = rawPayload ? JSON.parse(rawPayload) : {};
          } catch (e) {
            console.warn('Error parsing payload:', e);
          }

          if (parsedPayload.project) {
            const projMembers = Array.isArray(parsedPayload.project.members) ? [...parsedPayload.project.members] : [];
            const existingMember = projMembers.find(m => m.email?.toLowerCase() === normalizedEmail);
            if (existingMember) {
              existingMember.status = 'active';
            } else {
              projMembers.push({
                email: normalizedEmail,
                role: inviteData?.role || 'QA Tester',
                status: 'active',
                addedAt: new Date().toISOString()
              });
            }
            parsedPayload.project.members = projMembers;
          }

          await writeChunkedDoc(
            'shared_workspaces',
            projectId,
            {
              projectId,
              projectName: parsedPayload.project?.name || wsData.projectName || 'Workspace',
              members: currentMembers,
              lastModifiedBy: currentUser.email || 'User'
            },
            JSON.stringify(parsedPayload)
          );
        }
      } catch (wsErr) {
        console.warn('[Firebase] Error updating shared workspace on accept:', wsErr.message);
      }
    }

    // 4. Pull shared workspace data for this project
    const sharedData = await db.pullSharedWorkspace(projectId);
    return { 
      invite: inviteData || { id: inviteId, projectId, status: 'accepted' }, 
      workspace: sharedData 
    };
  },

  /**
   * Decline an invitation
   */
  declineInvitation: async (inviteId) => {
    const localInvites = load('qa_workspace_invitations_v2', []);
    const inv = localInvites.find(i => i.id === inviteId);
    if (inv) {
      inv.status = 'declined';
      save('qa_workspace_invitations_v2', localInvites);
    }
    if (isFirebaseConfigured && firestore && inviteId) {
      try {
        await setDoc(doc(firestore, 'invitations', inviteId), { status: 'declined' }, { merge: true });
      } catch (err) {
        console.warn('[Firebase] Failed to decline invitation:', err.message);
      }
    }
    return true;
  },

  /**
   * Revoke/Delete an invitation
   */
  revokeInvitation: async (inviteId) => {
    const localInvites = load('qa_workspace_invitations_v2', []);
    const updated = localInvites.filter(i => i.id !== inviteId);
    save('qa_workspace_invitations_v2', updated);

    if (isFirebaseConfigured && firestore && inviteId) {
      try {
        await deleteDoc(doc(firestore, 'invitations', inviteId));
      } catch (err) {
        console.warn('[Firebase] Failed to delete invitation doc:', err.message);
      }
    }
    return true;
  },

  /**
   * Synchronize shared workspace payload (project, files, tests, bugs, reports) to Firestore
   * with automatic chunking for payloads > 600KB to guarantee 1MB limit is never exceeded.
   */
  syncSharedWorkspace: async (projectId, { project, files, tests, bugs, reports }, currentUser, clientId = null) => {
    if (!projectId) return;

    // Cache locally under shared project key
    const sharedCacheKey = `qa_shared_ws_${projectId}`;
    const existingWs = load(sharedCacheKey, null);

    let safeTests = tests || [];
    let safeBugs = bugs || [];
    let safeFiles = files || [];

    // Guard: Prevent an uninitialized client (empty tests/bugs) from wiping out existing data
    if (safeTests.length === 0 && Array.isArray(existingWs?.tests) && existingWs.tests.length > 0) {
      safeTests = existingWs.tests;
    }
    if (safeBugs.length === 0 && Array.isArray(existingWs?.bugs) && existingWs.bugs.length > 0) {
      safeBugs = existingWs.bugs;
    }
    if (safeFiles.length === 0 && Array.isArray(existingWs?.files) && existingWs.files.length > 0) {
      safeFiles = existingWs.files;
    }

    // Sanitize bugs to prevent duplicate base64 strings in both b.images and b.imageUrl (keeps payload < 650KB)
    safeBugs = safeBugs.map((b) => {
      if (b && Array.isArray(b.images) && b.images.length > 0 && b.imageUrl) {
        const { imageUrl, ...rest } = b;
        return rest;
      }
      return b;
    });

    // Update local cache immediately
    save(sharedCacheKey, {
      project,
      files: safeFiles,
      tests: safeTests,
      bugs: safeBugs,
      reports,
      updatedAt: new Date().toISOString(),
    });

    if (isFirebaseConfigured && firestore) {
      try {
        const memberEmails = (project?.members || [])
          .map(m => (m.email || '').toLowerCase())
          .filter(Boolean);

        if (currentUser?.email && !memberEmails.includes(currentUser.email.toLowerCase())) {
          memberEmails.push(currentUser.email.toLowerCase());
        }

        const payloadString = JSON.stringify({ project, files: safeFiles, tests: safeTests, bugs: safeBugs, reports });

        await writeChunkedDoc(
          'shared_workspaces',
          projectId,
          {
            projectId,
            projectName: project?.name || 'Workspace',
            members: memberEmails,
            lastModifiedBy: currentUser?.email || 'User',
            lastModifiedClientId: clientId || null,
          },
          payloadString
        );
      } catch (error) {
        console.warn(`[Firebase] Failed to sync shared workspace ${projectId}:`, error.message);
      }
    }
  },

  /**
   * Pull shared workspace data (with automatic chunk reassembly)
   */
  pullSharedWorkspace: async (projectId) => {
    if (!projectId) return null;

    // 1. Try Firestore
    if (isFirebaseConfigured && firestore) {
      try {
        const docRef = doc(firestore, 'shared_workspaces', projectId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const docData = snap.data();
          const fullPayload = await readChunkedDocPayload('shared_workspaces', projectId, docData);
          if (fullPayload) {
            const parsed = JSON.parse(fullPayload);
            save(`qa_shared_ws_${projectId}`, parsed);
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[Firebase] Error loading shared workspace ${projectId}:`, err.message);
      }
    }

    // 2. Fallback to local cache
    return load(`qa_shared_ws_${projectId}`, null);
  },

  /**
   * Get all shared workspaces where userEmail is in members array
   */
  getSharedWorkspacesForUser: async (userEmail) => {
    if (!userEmail || !isFirebaseConfigured || !firestore) return [];
    const normalizedEmail = userEmail.trim().toLowerCase();
    try {
      const q = query(
        collection(firestore, 'shared_workspaces'),
        where('members', 'array-contains', normalizedEmail)
      );
      const snapshot = await getDocs(q);
      const list = [];
      for (const docSnap of snapshot.docs) {
        const docData = docSnap.data();
        if (docData.payload) {
          const fullPayload = await readChunkedDocPayload('shared_workspaces', docSnap.id, docData);
          if (fullPayload) {
            try {
              list.push(JSON.parse(fullPayload));
            } catch (e) {
              console.warn('Error parsing shared workspace:', e);
            }
          }
        }
      }
      return list;
    } catch (err) {
      console.warn('[Firebase] Failed to query shared workspaces for user:', err.message);
      return [];
    }
  },

  /**
   * Real-time listener for a shared workspace document.
   * Subscribes to Firestore onSnapshot changes, reassembles chunked payloads if needed,
   * and invokes onUpdate with latest workspace data. Returns unsubscribe function.
   */
  subscribeToSharedWorkspace: (projectId, onUpdate, onError) => {
    if (!projectId || !isFirebaseConfigured || !firestore) {
      return () => {};
    }

    const docRef = doc(firestore, 'shared_workspaces', projectId);
    return onSnapshot(
      docRef,
      async (snapshot) => {
        if (!snapshot.exists()) return;

        try {
          const data = snapshot.data();
          if (!data) return;

          const fullPayload = await readChunkedDocPayload('shared_workspaces', projectId, data);
          if (fullPayload) {
            const parsed = JSON.parse(fullPayload);
            onUpdate({
              ...parsed,
              updatedAt: data.updatedAt,
              lastModifiedBy: data.lastModifiedBy,
              lastModifiedClientId: data.lastModifiedClientId || null,
            });
          }
        } catch (err) {
          console.warn(`[Firebase] Error processing real-time workspace update for ${projectId}:`, err);
          if (onError) onError(err);
        }
      },
      (err) => {
        console.warn(`[Firebase] Workspace subscription error for ${projectId}:`, err);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Real-time listener for pending invitations for a given user email
   */
  subscribeToInvitations: (userEmail, onUpdate, onError) => {
    if (!userEmail || !isFirebaseConfigured || !firestore) {
      return () => {};
    }
    const normalizedEmail = userEmail.trim().toLowerCase();
    const q = query(
      collection(firestore, 'invitations'),
      where('inviteeEmail', '==', normalizedEmail),
      where('status', '==', 'pending')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const invites = [];
        snapshot.forEach((docSnap) => {
          invites.push({ ...docSnap.data(), id: docSnap.id });
        });
        onUpdate(invites);
      },
      (err) => {
        console.warn('[Firebase] Invitations subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Helper to construct a 1-click Gmail composer URL
   */
  buildGmailInviteUrl: ({ inviteeEmail, projectName, inviteLink, inviterName, role }) => {
    const subject = `QA Workspace Invitation: Join "${projectName}" on InfratechAI QA Manager`;
    const body = `Hi,\n\nYou have been invited by ${inviterName || 'your team member'} to collaborate as a ${role || 'QA Tester'} on the "${projectName}" QA Workspace in InfratechAI QA Manager.\n\nYou can execute test cases, log defects, and track QA progress with clear work attribution.\n\n👉 Join Workspace directly using this link:\n${inviteLink}\n\nLooking forward to testing together!`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inviteeEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },

  /**
   * Generate an invite link for sharing
   */
  generateInviteLink: (inviteId, projectId) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infratechai-qa-manager.vercel.app';
    return `${origin}/?invite=${inviteId}&project=${projectId}`;
  },

  // --- Export User Backup ---
  exportToJson: (userId) => {
    const data = {
      userId,
      projects: db.getProjects(userId),
      files: db.getFiles(userId),
      tests: db.getTestCases(userId),
      bugs: db.getBugs(userId),
      exportedAt: new Date().toISOString(),
      version: '2.2'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfratechAI_QA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // --- Import Backup ---
  importFromJson: (jsonData, userId) => {
    if (!jsonData || typeof jsonData !== 'object') throw new Error('Invalid backup file');
    if (Array.isArray(jsonData.projects)) db.saveProjects(jsonData.projects, userId);
    if (Array.isArray(jsonData.files)) db.saveFiles(jsonData.files, userId);
    if (Array.isArray(jsonData.tests)) db.saveTestCases(jsonData.tests, userId);
    if (Array.isArray(jsonData.bugs)) db.saveBugs(jsonData.bugs, userId);
  }
};

