import { firestore, isFirebaseConfigured } from '../config/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

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

/**
 * Cloud sync helper scoped to the authenticated user's private collection:
 * /users/{userId}/qa_manager/{docId}
 */
const syncToFirestore = async (userId, docId, data) => {
  if (!isFirebaseConfigured || !firestore || !userId) return;
  try {
    const docRef = doc(firestore, 'users', userId, 'qa_manager', docId);
    await setDoc(docRef, { 
      payload: JSON.stringify(data), 
      updatedAt: new Date().toISOString(),
      ownerId: userId
    });
  } catch (error) {
    console.warn(`[Firebase] Failed to sync ${docId} to user ${userId}:`, error.message);
  }
};

export const db = {
  // --- Projects ---
  getProjects: (userId) => {
    const key = getStorageKey('projects', userId);
    return load(key, []);
  },
  saveProjects: (projects, userId) => {
    const key = getStorageKey('projects', userId);
    save(key, projects);
    syncToFirestore(userId, 'projects', projects);
  },

  // --- Test Files ---
  getFiles: (userId) => {
    const key = getStorageKey('files', userId);
    return load(key, []);
  },
  saveFiles: (files, userId) => {
    const key = getStorageKey('files', userId);
    save(key, files);
    syncToFirestore(userId, 'files', files);
  },

  // --- Test Cases ---
  getTestCases: (userId) => {
    const key = getStorageKey('tests', userId);
    return load(key, []);
  },
  saveTestCases: (tests, userId) => {
    const key = getStorageKey('tests', userId);
    save(key, tests);
    syncToFirestore(userId, 'tests', tests);
  },

  // --- Bugs & Issues ---
  getBugs: (userId) => {
    const key = getStorageKey('bugs', userId);
    return load(key, []);
  },
  saveBugs: (bugs, userId) => {
    const key = getStorageKey('bugs', userId);
    save(key, bugs);
    syncToFirestore(userId, 'bugs', bugs);
  },

  // --- Reports ---
  getReports: (userId) => {
    const key = getStorageKey('reports', userId);
    return load(key, []);
  },
  saveReports: (reports, userId) => {
    const key = getStorageKey('reports', userId);
    save(key, reports);
    syncToFirestore(userId, 'reports', reports);
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
      const [projSnap, filesSnap, testsSnap, bugsSnap] = await Promise.all([
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'projects')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'files')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'tests')),
        getDoc(doc(firestore, 'users', userId, 'qa_manager', 'bugs')),
      ]);

      const result = {};
      if (projSnap.exists() && projSnap.data().payload) {
        result.projects = JSON.parse(projSnap.data().payload);
        save(getStorageKey('projects', userId), result.projects);
      }
      if (filesSnap.exists() && filesSnap.data().payload) {
        result.files = JSON.parse(filesSnap.data().payload);
        save(getStorageKey('files', userId), result.files);
      }
      if (testsSnap.exists() && testsSnap.data().payload) {
        result.tests = JSON.parse(testsSnap.data().payload);
        save(getStorageKey('tests', userId), result.tests);
      }
      if (bugsSnap.exists() && bugsSnap.data().payload) {
        result.bugs = JSON.parse(bugsSnap.data().payload);
        save(getStorageKey('bugs', userId), result.bugs);
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

            const projectMap = new Map(currentProjects.map(p => [p.id, p]));
            const fileMap = new Map(currentFiles.map(f => [f.id, f]));
            const testMap = new Map(currentTests.map(t => [t.id, t]));
            const bugMap = new Map(currentBugs.map(b => [b.id, b]));

            sharedWorkspaces.forEach(({ project, files, tests, bugs }) => {
              if (project) projectMap.set(project.id, project);
              if (files) files.forEach(f => fileMap.set(f.id, f));
              if (tests) tests.forEach(t => testMap.set(t.id, t));
              if (bugs) bugs.forEach(b => bugMap.set(b.id, b));
            });

            result.projects = Array.from(projectMap.values());
            result.files = Array.from(fileMap.values());
            result.tests = Array.from(testMap.values());
            result.bugs = Array.from(bugMap.values());

            save(getStorageKey('projects', userId), result.projects);
            save(getStorageKey('files', userId), result.files);
            save(getStorageKey('tests', userId), result.tests);
            save(getStorageKey('bugs', userId), result.bugs);
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
            parsedPayload = wsData.payload ? JSON.parse(wsData.payload) : {};
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

          await setDoc(wsRef, {
            members: currentMembers,
            payload: JSON.stringify(parsedPayload),
            updatedAt: new Date().toISOString(),
            lastModifiedBy: currentUser.email || 'User'
          }, { merge: true });
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
   * Synchronize shared workspace payload (project, files, tests, bugs) to Firestore
   */
  syncSharedWorkspace: async (projectId, { project, files, tests, bugs, reports }, currentUser) => {
    if (!projectId) return;

    // Cache locally under shared project key
    const sharedCacheKey = `qa_shared_ws_${projectId}`;
    save(sharedCacheKey, { project, files, tests, bugs, reports, updatedAt: new Date().toISOString() });

    if (isFirebaseConfigured && firestore) {
      try {
        const memberEmails = (project?.members || []).map(m => m.email.toLowerCase());
        if (currentUser?.email && !memberEmails.includes(currentUser.email.toLowerCase())) {
          memberEmails.push(currentUser.email.toLowerCase());
        }

        const docRef = doc(firestore, 'shared_workspaces', projectId);
        await setDoc(docRef, {
          projectId,
          projectName: project?.name || 'Workspace',
          members: memberEmails,
          payload: JSON.stringify({ project, files, tests, bugs, reports }),
          updatedAt: new Date().toISOString(),
          lastModifiedBy: currentUser?.email || 'User',
        }, { merge: true });
      } catch (error) {
        console.warn(`[Firebase] Failed to sync shared workspace ${projectId}:`, error.message);
      }
    }
  },

  /**
   * Pull shared workspace data
   */
  pullSharedWorkspace: async (projectId) => {
    if (!projectId) return null;

    // 1. Try Firestore
    if (isFirebaseConfigured && firestore) {
      try {
        const docRef = doc(firestore, 'shared_workspaces', projectId);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().payload) {
          const parsed = JSON.parse(snap.data().payload);
          save(`qa_shared_ws_${projectId}`, parsed);
          return parsed;
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
      snapshot.forEach(docSnap => {
        if (docSnap.data().payload) {
          list.push(JSON.parse(docSnap.data().payload));
        }
      });
      return list;
    } catch (err) {
      console.warn('[Firebase] Failed to query shared workspaces for user:', err.message);
      return [];
    }
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

