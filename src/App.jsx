import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './services/db';
import { generateId, getTimestamp } from './utils/formatters';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ProjectsView } from './components/projects/ProjectsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExecutionWorkspace } from './components/execution/ExecutionWorkspace';
import { TestFilesView } from './components/testFiles/TestFilesView';
import { BugsView } from './components/bugs/BugsView';
import { ReportsView } from './components/reports/ReportsView';
import { FirebaseModal } from './components/modals/FirebaseModal';
import { InviteMemberModal } from './components/modals/InviteMemberModal';
import { InviteAcceptModal } from './components/modals/InviteAcceptModal';
import { InvitationBanner } from './components/layout/InvitationBanner';
import { LoginView } from './components/auth/LoginView';
import { isFileVisibleToUser } from './utils/visibility';
import { mergeTestCases, mergeBugs, mergeFiles, isExecuted } from './utils/workspaceMerger';

// Helper to ensure projects have owner and member lists
const normalizeProjects = (projs, userId, userEmail) => {
  return projs.map(p => ({
    ...p,
    ownerId: p.ownerId || userId,
    ownerEmail: p.ownerEmail || userEmail,
    members: p.members && p.members.length > 0 ? p.members : [
      {
        email: p.ownerEmail || userEmail,
        role: 'Owner',
        status: 'active',
        addedAt: p.createdAt || getTimestamp()
      }
    ]
  }));
};

/**
 * AuthenticatedWorkspace is only rendered when currentUser is valid.
 * This guarantees consistent hook execution on every render (no React Error #310).
 */
function AuthenticatedWorkspace({ currentUser, logout }) {
  const userId = currentUser.uid;

  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [tests, setTests] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [reports, setReports] = useState([]);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [activeUrlInvite, setActiveUrlInvite] = useState(null);
  const [isInviteAcceptModalOpen, setIsInviteAcceptModalOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState(null);
  const [isMobileOptionsOpen, setIsMobileOptionsOpen] = useState(false);
  const [triggerNewFileModal, setTriggerNewFileModal] = useState(false);
  const [triggerNewBugModal, setTriggerNewBugModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'
  const [lastSyncNotice, setLastSyncNotice] = useState(null);

  // Unique tab/client identifier to prevent echo writes in real-time listeners
  const [clientId] = useState(() => 'client_' + Math.random().toString(36).substring(2, 9));
  const isRemoteUpdateRef = useRef(false);

  // Real-time subscription to incoming workspace invitations
  useEffect(() => {
    if (!currentUser?.email) return;
    const unsubscribe = db.subscribeToInvitations(currentUser.email, (invites) => {
      setPendingInvitations(invites);
    });
    return () => unsubscribe();
  }, [currentUser?.email]);

  // Real-time subscription to active shared workspace changes
  useEffect(() => {
    if (!activeProjectId || !currentUser) return;

    // 1. Immediately pull latest workspace data from Firestore on opening project
    db.pullSharedWorkspace(activeProjectId)
      .then((initialData) => {
        if (!initialData) return;
        isRemoteUpdateRef.current = true;
        if (initialData.project) {
          setProjects((prev) => {
            const updated = prev.map((p) => (p.id === activeProjectId ? { ...p, ...initialData.project } : p));
            db.saveProjects(updated, userId);
            return normalizeProjects(updated, userId, currentUser.email);
          });
        }
        if (Array.isArray(initialData.files)) {
          setFiles((prev) => {
            const others = prev.filter((f) => f.projectId && f.projectId !== activeProjectId);
            const currentProjFiles = prev.filter((f) => !f.projectId || f.projectId === activeProjectId);
            const incomingMapped = initialData.files.map((f) => ({ ...f, projectId: activeProjectId }));
            const mergedProjFiles = mergeFiles(currentProjFiles, incomingMapped);
            const updated = [...others, ...mergedProjFiles];
            db.saveFiles(updated, userId);
            return updated;
          });
        }
        if (Array.isArray(initialData.tests)) {
          setTests((prev) => {
            const others = prev.filter((t) => t.projectId && t.projectId !== activeProjectId);
            const currentProjTests = prev.filter((t) => !t.projectId || t.projectId === activeProjectId);
            const incomingMapped = initialData.tests.map((t) => ({ ...t, projectId: activeProjectId }));
            const mergedProjTests = mergeTestCases(currentProjTests, incomingMapped);
            const updated = [...others, ...mergedProjTests];
            db.saveTestCases(updated, userId);

            // AUTO-RECOVERY: If local tests had completed executions that cloud was missing:
            const hasUnpushedExecutions = mergedProjTests.some(
              (lt) => isExecuted(lt) && initialData.tests.find((rt) => String(rt.id) === String(lt.id) && !isExecuted(rt))
            );
            if (hasUnpushedExecutions) {
              console.info('[Firebase] Auto-syncing local test executions to cloud shared workspace...');
              setTimeout(() => {
                db.syncSharedWorkspace(
                  activeProjectId,
                  {
                    project: initialData.project || activeProject,
                    files: files.filter(f => !f.projectId || f.projectId === activeProjectId),
                    tests: mergedProjTests,
                    bugs: bugs.filter(b => !b.projectId || b.projectId === activeProjectId),
                    reports: reports.filter(r => r.projectId === activeProjectId),
                  },
                  currentUser,
                  clientId
                ).then(() => setSyncStatus('synced'))
                 .catch((err) => console.warn('[Firebase] Auto-push error:', err));
              }, 200);
            }

            return updated;
          });
        }
        if (Array.isArray(initialData.bugs)) {
          setBugs((prev) => {
            const others = prev.filter((b) => b.projectId && b.projectId !== activeProjectId);
            const currentProjBugs = prev.filter((b) => !b.projectId || b.projectId === activeProjectId);
            const incomingMapped = initialData.bugs.map((b) => ({ ...b, projectId: activeProjectId }));
            const mergedProjBugs = mergeBugs(currentProjBugs, incomingMapped);
            const updated = [...others, ...mergedProjBugs];
            db.saveBugs(updated, userId);
            return updated;
          });
        }
        if (Array.isArray(initialData.reports)) {
          setReports((prev) => {
            const others = prev.filter((r) => r.projectId !== activeProjectId);
            const updated = [...others, ...initialData.reports];
            db.saveReports(updated, userId);
            return updated;
          });
        }
      })
      .catch((err) => console.warn('[Firebase] Initial workspace pull error:', err));

    // 2. Subscribe to real-time changes
    const unsubscribe = db.subscribeToSharedWorkspace(
      activeProjectId,
      (remoteData) => {
        // Skip update if it originated from this tab/client
        if (remoteData.lastModifiedClientId && remoteData.lastModifiedClientId === clientId) {
          return;
        }

        // Flag as remote update so our auto-sync effect does not echo back to Firestore
        isRemoteUpdateRef.current = true;

        // Merge incoming project
        if (remoteData.project) {
          setProjects((prev) => {
            const updated = prev.map((p) => (p.id === activeProjectId ? { ...p, ...remoteData.project } : p));
            db.saveProjects(updated, userId);
            return normalizeProjects(updated, userId, currentUser.email);
          });
        }

        // Merge incoming files
        if (Array.isArray(remoteData.files)) {
          setFiles((prev) => {
            const others = prev.filter((f) => f.projectId && f.projectId !== activeProjectId);
            const currentProjFiles = prev.filter((f) => !f.projectId || f.projectId === activeProjectId);
            const incomingMapped = remoteData.files.map((f) => ({ ...f, projectId: activeProjectId }));
            const mergedProjFiles = mergeFiles(currentProjFiles, incomingMapped);
            const updated = [...others, ...mergedProjFiles];
            db.saveFiles(updated, userId);
            return updated;
          });
        }

        // Merge incoming tests
        if (Array.isArray(remoteData.tests)) {
          setTests((prev) => {
            const others = prev.filter((t) => t.projectId && t.projectId !== activeProjectId);
            const currentProjTests = prev.filter((t) => !t.projectId || t.projectId === activeProjectId);
            const incomingMapped = remoteData.tests.map((t) => ({ ...t, projectId: activeProjectId }));
            const mergedProjTests = mergeTestCases(currentProjTests, incomingMapped);
            const updated = [...others, ...mergedProjTests];
            db.saveTestCases(updated, userId);
            return updated;
          });
        }

        // Merge incoming bugs
        if (Array.isArray(remoteData.bugs)) {
          setBugs((prev) => {
            const others = prev.filter((b) => b.projectId && b.projectId !== activeProjectId);
            const currentProjBugs = prev.filter((b) => !b.projectId || b.projectId === activeProjectId);
            const incomingMapped = remoteData.bugs.map((b) => ({ ...b, projectId: activeProjectId }));
            const mergedProjBugs = mergeBugs(currentProjBugs, incomingMapped);
            const updated = [...others, ...mergedProjBugs];
            db.saveBugs(updated, userId);
            return updated;
          });
        }

        // Merge incoming reports
        if (Array.isArray(remoteData.reports)) {
          setReports((prev) => {
            const others = prev.filter((r) => r.projectId !== activeProjectId);
            const updated = [...others, ...remoteData.reports];
            db.saveReports(updated, userId);
            return updated;
          });
        }

        setSyncStatus('synced');
        if (remoteData.lastModifiedBy && remoteData.lastModifiedBy.toLowerCase() !== currentUser.email?.toLowerCase()) {
          setLastSyncNotice(`Workspace updated by ${remoteData.lastModifiedBy.split('@')[0]} in real-time`);
          setTimeout(() => setLastSyncNotice(null), 4500);
        }
      },
      (err) => {
        console.warn('[Firebase] Real-time sync error:', err);
        setSyncStatus('error');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeProjectId, currentUser, userId, clientId]);

  // Initialize and load data whenever authenticated user changes
  useEffect(() => {
    if (!userId) return;

    const initUserData = async () => {
      // 1. Load user's private local cache
      const loadedProjects = normalizeProjects(db.getProjects(userId), userId, currentUser.email);
      const loadedFiles = db.getFiles(userId);
      const loadedTests = db.getTestCases(userId);
      const loadedBugs = db.getBugs(userId);

      setProjects(loadedProjects);
      setFiles(loadedFiles);
      setTests(loadedTests);
      setBugs(loadedBugs);
      setReports(db.getReports(userId));

      // Always start at the Projects screen — user must explicitly open a project
      setActiveProjectId(null);
      setActiveTab('projects');

      // 2. Check for latest cloud updates from user's Firestore collection & shared workspaces
      try {
        const cloudData = await db.pullFromFirestore(userId, currentUser.email);
        if (cloudData) {
          if (cloudData.projects) setProjects(normalizeProjects(cloudData.projects, userId, currentUser.email));
          if (cloudData.files) setFiles(cloudData.files);
          if (cloudData.tests) setTests(cloudData.tests);
          if (cloudData.bugs) setBugs(cloudData.bugs);
          if (cloudData.reports) setReports(cloudData.reports);
        }
      } catch (err) {
        console.warn('Cloud pull check completed:', err);
      }

      // 3. Check for pending invitations for this user and URL invite parameters
      try {
        const invites = await db.getPendingInvitations(currentUser.email);
        setPendingInvitations(invites);

        // Check if URL has ?invite=... parameter
        const params = new URLSearchParams(window.location.search);
        const urlInviteId = params.get('invite');
        const urlProjectId = params.get('project');

        if (urlInviteId) {
          // A. Check if already in pending invites list
          let targetInvite = invites.find(i => i.id === urlInviteId);

          // B. Fetch direct from Firestore / local storage by ID
          if (!targetInvite) {
            targetInvite = await db.getInvitationById(urlInviteId);
          }

          // C. If still not found, check shared workspace directly by projectId
          if (!targetInvite && urlProjectId) {
            const ws = await db.pullSharedWorkspace(urlProjectId);
            targetInvite = {
              id: urlInviteId,
              projectId: urlProjectId,
              projectName: ws?.project?.name || 'PersianDarbar RMS',
              inviterEmail: ws?.project?.ownerEmail || 'Workspace Owner',
              role: 'QA Tester',
              status: 'pending'
            };
          }

          if (targetInvite) {
            // Check if user is already an active member of this project
            const alreadyJoined = loadedProjects.some(p => p.id === targetInvite.projectId);
            if (!alreadyJoined) {
              setActiveUrlInvite(targetInvite);
              setIsInviteAcceptModalOpen(true);
              setPendingInvitations(prev => {
                if (prev.some(i => i.id === targetInvite.id)) return prev;
                return [targetInvite, ...prev];
              });
            } else {
              // User is already a member, open the workspace directly
              setActiveProjectId(targetInvite.projectId);
              setActiveTab('dashboard');
            }
          }
        }
      } catch (inviteErr) {
        console.warn('Invitations check error:', inviteErr);
      }
    };

    initUserData();
  }, [userId, currentUser.email]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const projectFiles = files.filter((f) => !f.projectId || f.projectId === activeProjectId);
  const projectTests = tests.filter((t) => !t.projectId || t.projectId === activeProjectId);
  const projectBugs = bugs.filter((b) => !b.projectId || b.projectId === activeProjectId);

  // Apply Account A / Account B visibility rule:
  // When Account A and Account B are in the same project:
  // A test file generated by Account A is INVISIBLE to Account B until Account A (or any tester)
  // passes or fails at least 1 single test case in that file.
  const visibleProjectFiles = projectFiles.filter((f) =>
    isFileVisibleToUser(f, projectTests, currentUser)
  );
  const visibleFileIds = new Set(visibleProjectFiles.map((f) => f.id));
  const visibleProjectTests = projectTests.filter(
    (t) => !t.fileId || visibleFileIds.has(t.fileId)
  );

  const activeFile = visibleProjectFiles.find((f) => f.id === activeFileId) || null;
  const openBugsCount = projectBugs.filter((b) => ['Open', 'In Progress', 'Reopened'].includes(b.status)).length;

  // Auto sync shared workspace changes (tests, bugs, files) to Firestore whenever active project is open
  useEffect(() => {
    if (!activeProjectId || !activeProject || !currentUser) return;

    // Prevent echo writes if this update originated from a remote teammate
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    setSyncStatus('syncing');
    const currentFiles = files.filter((f) => f.projectId === activeProjectId);
    const currentTests = tests
      .filter((t) => !t.projectId || t.projectId === activeProjectId)
      .map((t) => ({ ...t, projectId: activeProjectId }));
    const currentBugs = bugs.filter((b) => b.projectId === activeProjectId);
    const currentReports = reports.filter((r) => r.projectId === activeProjectId);

    db.syncSharedWorkspace(
      activeProjectId,
      {
        project: activeProject,
        files: currentFiles,
        tests: currentTests,
        bugs: currentBugs,
        reports: currentReports,
      },
      currentUser,
      clientId
    )
      .then(() => setSyncStatus('synced'))
      .catch((err) => {
        console.warn('[Firebase] Auto sync failed:', err);
        setSyncStatus('error');
      });
  }, [activeProjectId, tests, bugs, files, reports, activeProject, currentUser, clientId]);

  // --- Project Management ---
  const handleAddProject = (newProjData) => {
    const newProject = {
      ...newProjData,
      id: `p${generateId()}`,
      createdAt: getTimestamp(),
      ownerId: userId,
      ownerEmail: currentUser.email,
      members: [
        {
          email: currentUser.email,
          role: 'Owner',
          status: 'active',
          addedAt: getTimestamp()
        }
      ]
    };
    setProjects((prev) => {
      const updated = [...prev, newProject];
      db.saveProjects(updated, userId);
      return updated;
    });
    setActiveProjectId(newProject.id);
    setActiveTab('dashboard');
  };

  // --- Workspace Invitations Handlers ---
  const handleAcceptInvitation = async (inv) => {
    try {
      const result = await db.acceptInvitation(inv.id, currentUser, inv.projectId);
      setPendingInvitations(prev => prev.filter(i => i.id !== inv.id));
      setIsInviteAcceptModalOpen(false);
      setActiveUrlInvite(null);

      // Clean URL query parameters (?invite=...&project=...)
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // If workspace payload was returned, merge directly into local state
      if (result?.workspace?.project) {
        const joinedProject = result.workspace.project;
        setProjects(prev => {
          const filtered = prev.filter(p => p.id !== joinedProject.id);
          const updated = [...filtered, joinedProject];
          db.saveProjects(updated, userId);
          return normalizeProjects(updated, userId, currentUser.email);
        });
        if (result.workspace.files) {
          setFiles(prev => {
            const filtered = prev.filter(f => f.projectId !== joinedProject.id);
            const updated = [...filtered, ...result.workspace.files];
            db.saveFiles(updated, userId);
            return updated;
          });
        }
        if (result.workspace.tests) {
          setTests(prev => {
            const filtered = prev.filter(t => t.projectId !== joinedProject.id);
            const updated = [...filtered, ...result.workspace.tests];
            db.saveTestCases(updated, userId);
            return updated;
          });
        }
        if (result.workspace.bugs) {
          setBugs(prev => {
            const filtered = prev.filter(b => b.projectId !== joinedProject.id);
            const updated = [...filtered, ...result.workspace.bugs];
            db.saveBugs(updated, userId);
            return updated;
          });
        }
        if (result.workspace.reports) {
          setReports(prev => {
            const filtered = prev.filter(r => r.projectId !== joinedProject.id);
            const updated = [...filtered, ...result.workspace.reports];
            db.saveReports(updated, userId);
            return updated;
          });
        }
      } else {
        // Fallback: refresh from cloud
        const cloudData = await db.pullFromFirestore(userId, currentUser.email);
        if (cloudData && cloudData.projects) {
          setProjects(normalizeProjects(cloudData.projects, userId, currentUser.email));
          if (cloudData.files) setFiles(cloudData.files);
          if (cloudData.tests) setTests(cloudData.tests);
          if (cloudData.bugs) setBugs(cloudData.bugs);
          if (cloudData.reports) setReports(cloudData.reports);
        }
      }

      setActiveProjectId(inv.projectId);
      setActiveTab('dashboard');
    } catch (err) {
      console.warn('Failed to accept invitation:', err);
    }
  };

  const handleDeclineInvitation = async (inviteId) => {
    try {
      await db.declineInvitation(inviteId);
      setPendingInvitations(prev => prev.filter(i => i.id !== inviteId));
      setIsInviteAcceptModalOpen(false);
      setActiveUrlInvite(null);

      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (err) {
      console.warn('Failed to decline invitation:', err);
    }
  };

  const handleMembersUpdated = (updatedMembers) => {
    setProjects(prev => {
      const updated = prev.map(p => p.id === activeProjectId ? { ...p, members: updatedMembers } : p);
      db.saveProjects(updated, userId);
      if (activeProject) {
        db.syncSharedWorkspace(activeProjectId, {
          project: { ...activeProject, members: updatedMembers },
          files: projectFiles,
          tests: projectTests,
          bugs: projectBugs,
          reports: reports.filter(r => r.projectId === activeProjectId)
        }, currentUser, clientId);
      }
      return updated;
    });
  };


  // --- Exit Project (enforce isolation) ---
  const handleExitProject = () => {
    setActiveProjectId(null);
    setActiveFileId(null);
    setActiveTab('projects');
  };

  const handleExitTestFile = () => {
    setActiveFileId(null);
  };

  const handleDeleteProject = (projectId) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    const updatedFiles = files.filter((f) => f.projectId !== projectId);
    const updatedTests = tests.filter((t) => t.projectId !== projectId);
    const updatedBugs = bugs.filter((b) => b.projectId !== projectId);

    setProjects(updatedProjects);
    setFiles(updatedFiles);
    setTests(updatedTests);
    setBugs(updatedBugs);

    db.saveProjects(updatedProjects, userId);
    db.saveFiles(updatedFiles, userId);
    db.saveTestCases(updatedTests, userId);
    db.saveBugs(updatedBugs, userId);

    if (activeProjectId === projectId) {
      setActiveProjectId(updatedProjects[0]?.id || null);
      if (updatedProjects.length === 0) setActiveTab('projects');
    }
  };

  // --- Test Suites / Files Management ---
  const handleAddFile = (name, copyFromId) => {
    const newFileId = `f${generateId()}`;
    const isOwner = activeProject?.ownerEmail?.toLowerCase() === currentUser?.email?.toLowerCase();
    const newFile = {
      id: newFileId,
      projectId: activeProjectId,
      name,
      date: getTimestamp(),
      createdAt: getTimestamp(),
      createdBy: currentUser?.email || 'Unknown',
      creatorId: currentUser?.uid || null,
      createdByName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
      creatorRole: isOwner ? 'Owner' : 'QA Tester',
    };

    setFiles((prev) => {
      const updated = [newFile, ...prev];
      db.saveFiles(updated, userId);
      return updated;
    });

    if (copyFromId) {
      const testsToCopy = tests.filter((t) => t.fileId === copyFromId);
      const duplicatedTests = testsToCopy.map((t) => ({
        ...t,
        id: generateId(),
        fileId: newFileId,
        status: 'Not Run',
        actualResult: '',
        testerNotes: '',
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      }));
      setTests((prev) => {
        const updated = [...prev, ...duplicatedTests];
        db.saveTestCases(updated, userId);
        return updated;
      });
    }

    return newFile;
  };

  // Auto-heal orphan test cases: Ensure every test case in active project belongs to a valid test file
  useEffect(() => {
    if (!activeProjectId || !userId) return;
    const currentProjectTests = tests.filter((t) => t.projectId === activeProjectId);
    if (currentProjectTests.length === 0) return;

    const projectFileIds = new Set(files.filter((f) => f.projectId === activeProjectId).map((f) => f.id));
    const orphanTests = currentProjectTests.filter((t) => !t.fileId || !projectFileIds.has(t.fileId));

    if (orphanTests.length > 0) {
      let targetFile = files.find((f) => f.projectId === activeProjectId);
      let updatedFiles = files;

      if (!targetFile) {
        targetFile = {
          id: `f${generateId()}`,
          projectId: activeProjectId,
          name: `${activeProject?.name || 'Sprint'} - Test Suite`,
          date: getTimestamp(),
          createdAt: getTimestamp(),
        };
        updatedFiles = [targetFile, ...files];
        setFiles(updatedFiles);
        db.saveFiles(updatedFiles, userId);
      }

      const updatedTests = tests.map((t) => {
        if (t.projectId === activeProjectId && (!t.fileId || !projectFileIds.has(t.fileId))) {
          return { ...t, fileId: targetFile.id, updatedAt: getTimestamp() };
        }
        return t;
      });

      setTests(updatedTests);
      db.saveTestCases(updatedTests, userId);
    }
  }, [activeProjectId, userId, tests, files, activeProject]);

  // Handle execution submit & view all test cases
  const handleSubmitExecution = useCallback(
    (preferredFileId) => {
      let targetFileId = preferredFileId;

      const currentProjectTests = tests.filter((t) => t.projectId === activeProjectId);
      const projectFileIds = new Set(files.filter((f) => f.projectId === activeProjectId).map((f) => f.id));
      const orphanTests = currentProjectTests.filter((t) => !t.fileId || !projectFileIds.has(t.fileId));

      if (orphanTests.length > 0) {
        let targetFile = files.find((f) => f.projectId === activeProjectId);
        let updatedFiles = files;

        if (!targetFile) {
          targetFile = {
            id: `f${generateId()}`,
            projectId: activeProjectId,
            name: `${activeProject?.name || 'Sprint'} - Execution Suite`,
            date: getTimestamp(),
            createdAt: getTimestamp(),
          };
          updatedFiles = [targetFile, ...files];
          setFiles(updatedFiles);
          db.saveFiles(updatedFiles, userId);
        }
        targetFileId = targetFile.id;

        const updatedTests = tests.map((t) => {
          if (t.projectId === activeProjectId && (!t.fileId || !projectFileIds.has(t.fileId))) {
            return { ...t, fileId: targetFile.id, updatedAt: getTimestamp() };
          }
          return t;
        });
        setTests(updatedTests);
        db.saveTestCases(updatedTests, userId);

        if (activeProjectId && activeProject && currentUser) {
          const syncFiles = updatedFiles.filter(f => !f.projectId || f.projectId === activeProjectId);
          const syncTests = updatedTests.filter(t => !t.projectId || t.projectId === activeProjectId);
          const syncBugs = bugs.filter(b => !b.projectId || b.projectId === activeProjectId);
          const syncReports = reports.filter(r => !r.projectId || r.projectId === activeProjectId);
          db.syncSharedWorkspace(
            activeProjectId,
            { project: activeProject, files: syncFiles, tests: syncTests, bugs: syncBugs, reports: syncReports },
            currentUser,
            clientId
          ).then(() => setSyncStatus('synced'))
           .catch((err) => console.warn('[Firebase] Execution submit sync error:', err));
        }
      } else if (!targetFileId && files.length > 0) {
        targetFileId = files.find((f) => f.projectId === activeProjectId)?.id;
      }

      if (targetFileId) {
        setActiveFileId(targetFileId);
      }
      setActiveTab('files');
    },
    [tests, files, bugs, reports, activeProjectId, activeProject, userId, currentUser, clientId]
  );

  const handleDeleteFile = (fileId) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    const updatedTests = tests.filter((t) => t.fileId !== fileId);

    setFiles(updatedFiles);
    setTests(updatedTests);

    db.saveFiles(updatedFiles, userId);
    db.saveTestCases(updatedTests, userId);
  };

  // --- Test Case Management ---
  const handleAddTestCase = useCallback(
    (newTestData) => {
      const isOwner = activeProject?.ownerEmail?.toLowerCase() === currentUser?.email?.toLowerCase();
      const newTest = {
        ...newTestData,
        id: generateId(),
        externalId: newTestData.externalId || `TC-${generateId().substring(0, 4).toUpperCase()}`,
        status: newTestData.status || 'Not Run',
        actualResult: newTestData.actualResult || '',
        testerNotes: newTestData.testerNotes || '',
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
        createdBy: newTestData.createdBy || currentUser?.email || 'Unknown',
        createdByName: newTestData.createdByName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
        creatorRole: newTestData.creatorRole || (isOwner ? 'Owner' : 'QA Tester'),
      };
      setTests((prev) => {
        const updated = [...prev, newTest];
        db.saveTestCases(updated, userId);
        return updated;
      });
    },
    [userId, activeProject, currentUser]
  );

  const handleUpdateTest = useCallback(
    (id, updates) => {
      let updatedTestsList = [];
      setTests((prev) => {
        const isOwner = activeProject?.ownerEmail?.toLowerCase() === currentUser?.email?.toLowerCase();
        const updated = prev.map((t) => {
          if (t.id === id) {
            const isStatusChange = updates.status && ['Pass', 'Fail', 'Blocked'].includes(updates.status);
            const isResetToNotRun = updates.status === 'Not Run';
            const executionMeta = isStatusChange ? {
              executedBy: updates.executedBy || currentUser?.email || 'Unknown',
              executedByName: updates.executedByName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
              executedByRole: updates.executedByRole || (isOwner ? 'Owner' : 'QA Tester'),
              executedAt: updates.executedAt || getTimestamp(),
            } : (isResetToNotRun ? {
              executedBy: null,
              executedByName: null,
              executedByRole: null,
              executedAt: null,
            } : {});
            return { ...t, ...updates, ...executionMeta, projectId: activeProjectId, updatedAt: getTimestamp() };
          }
          return t;
        });
        updatedTestsList = updated;
        db.saveTestCases(updated, userId);
        return updated;
      });

      // Immediate direct sync to Firestore so teammates see test executions in real time
      if (activeProjectId && activeProject && currentUser) {
        const syncFiles = files.filter(f => !f.projectId || f.projectId === activeProjectId);
        const syncTests = updatedTestsList
          .filter(t => !t.projectId || t.projectId === activeProjectId)
          .map(t => ({ ...t, projectId: activeProjectId }));
        const syncBugs = bugs.filter(b => !b.projectId || b.projectId === activeProjectId);
        const syncReports = reports.filter(r => !r.projectId || r.projectId === activeProjectId);

        db.syncSharedWorkspace(
          activeProjectId,
          {
            project: activeProject,
            files: syncFiles,
            tests: syncTests,
            bugs: syncBugs,
            reports: syncReports,
          },
          currentUser,
          clientId
        ).then(() => setSyncStatus('synced'))
         .catch((err) => console.warn('[Firebase] Direct test sync error:', err));
      }
    },
    [userId, activeProjectId, activeProject, currentUser, files, bugs, reports, clientId]
  );

  const handleDeleteTest = (testId) => {
    setTests((prev) => {
      const updated = prev.filter((t) => t.id !== testId);
      db.saveTestCases(updated, userId);
      return updated;
    });
  };

  const handleBulkAssignSuite = useCallback(
    (fileId, assignedToEmail, assignedToName) => {
      setTests((prev) => {
        const updated = prev.map((t) => {
          if (t.fileId === fileId) {
            return {
              ...t,
              assignedTo: assignedToEmail || null,
              assignedToName: assignedToName || null,
              updatedAt: getTimestamp(),
            };
          }
          return t;
        });
        db.saveTestCases(updated, userId);
        return updated;
      });
    },
    [userId]
  );

  const handleImportTests = useCallback(
    (newTests, shouldNavigate = false) => {
      setTests((prev) => {
        const updated = [...prev, ...newTests];
        db.saveTestCases(updated, userId);
        return updated;
      });
      if (shouldNavigate) {
        setActiveTab('execute');
      }
    },
    [userId]
  );

  // --- Defects & Bugs Management ---
  const handleAddBug = useCallback(
    (newBugData) => {
      const newBug = {
        ...newBugData,
        id: `b${generateId()}`,
        bugId: `BUG-${Math.floor(1000 + Math.random() * 9000)}`,
        projectId: newBugData.projectId || activeProjectId,
        status: 'Open',
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      };
      let updatedBugsList = [];
      setBugs((prev) => {
        const updated = [newBug, ...prev];
        updatedBugsList = updated;
        db.saveBugs(updated, userId);
        return updated;
      });

      if (activeProjectId && activeProject && currentUser) {
        const syncFiles = files.filter(f => !f.projectId || f.projectId === activeProjectId);
        const syncTests = tests.filter(t => !t.projectId || t.projectId === activeProjectId);
        const syncBugs = updatedBugsList.filter(b => !b.projectId || b.projectId === activeProjectId);
        const syncReports = reports.filter(r => !r.projectId || r.projectId === activeProjectId);

        db.syncSharedWorkspace(
          activeProjectId,
          { project: activeProject, files: syncFiles, tests: syncTests, bugs: syncBugs, reports: syncReports },
          currentUser,
          clientId
        ).then(() => setSyncStatus('synced'))
         .catch((err) => console.warn('[Firebase] Direct bug add sync error:', err));
      }
    },
    [userId, activeProjectId, activeProject, currentUser, files, tests, reports, clientId]
  );

  const handleUpdateBug = useCallback(
    (bugId, updates) => {
      let updatedBugsList = [];
      setBugs((prev) => {
        const updated = prev.map((b) => (b.id === bugId ? { ...b, ...updates, updatedAt: getTimestamp() } : b));
        updatedBugsList = updated;
        db.saveBugs(updated, userId);
        return updated;
      });

      if (activeProjectId && activeProject && currentUser) {
        const syncFiles = files.filter(f => !f.projectId || f.projectId === activeProjectId);
        const syncTests = tests.filter(t => !t.projectId || t.projectId === activeProjectId);
        const syncBugs = updatedBugsList.filter(b => !b.projectId || b.projectId === activeProjectId);
        const syncReports = reports.filter(r => !r.projectId || r.projectId === activeProjectId);

        db.syncSharedWorkspace(
          activeProjectId,
          { project: activeProject, files: syncFiles, tests: syncTests, bugs: syncBugs, reports: syncReports },
          currentUser,
          clientId
        ).then(() => setSyncStatus('synced'))
         .catch((err) => console.warn('[Firebase] Direct bug update sync error:', err));
      }
    },
    [userId, activeProjectId, activeProject, currentUser, files, tests, reports, clientId]
  );

  const handleDeleteBug = (bugId) => {
    setBugs((prev) => {
      const updated = prev.filter((b) => b.id !== bugId);
      db.saveBugs(updated, userId);
      return updated;
    });
  };

  // --- Backup & Reset ---
  const _handleWipeData = async () => {
    if (window.confirm('Are you sure you want to wipe ALL your projects and test cases? This cannot be undone.')) {
      await db.wipeAllData(userId);
      setProjects([]);
      setFiles([]);
      setTests([]);
      setBugs([]);
      setActiveProjectId(null);
      setActiveTab('projects');
    }
  };

  const handleExportBackup = () => {
    db.exportToJson(userId);
  };

  const handleImportBackup = (jsonData) => {
    try {
      db.importFromJson(jsonData, userId);
      setProjects(db.getProjects(userId));
      setFiles(db.getFiles(userId));
      setTests(db.getTestCases(userId));
      setBugs(db.getBugs(userId));
      if (jsonData.projects && jsonData.projects.length > 0) {
        setActiveProjectId(jsonData.projects[0].id);
      }
      alert('Backup imported successfully into your account!');
    } catch (e) {
      alert('Failed to import backup: ' + e.message);
    }
  };

  const handlePullSync = async () => {
    let pulledSomething = false;
    if (activeProjectId) {
      try {
        const sharedWs = await db.pullSharedWorkspace(activeProjectId);
        if (sharedWs) {
          if (sharedWs.project) {
            setProjects((prev) => {
              const updated = prev.map((p) => (p.id === activeProjectId ? { ...p, ...sharedWs.project } : p));
              db.saveProjects(updated, userId);
              return normalizeProjects(updated, userId, currentUser.email);
            });
          }
          if (Array.isArray(sharedWs.files)) {
            setFiles((prev) => {
              const others = prev.filter((f) => f.projectId && f.projectId !== activeProjectId);
              const currentProjFiles = prev.filter((f) => !f.projectId || f.projectId === activeProjectId);
              const incomingMapped = sharedWs.files.map((f) => ({ ...f, projectId: activeProjectId }));
              const mergedProjFiles = mergeFiles(currentProjFiles, incomingMapped);
              const updated = [...others, ...mergedProjFiles];
              db.saveFiles(updated, userId);
              return updated;
            });
          }
          if (Array.isArray(sharedWs.tests)) {
            setTests((prev) => {
              const others = prev.filter((t) => t.projectId && t.projectId !== activeProjectId);
              const currentProjTests = prev.filter((t) => !t.projectId || t.projectId === activeProjectId);
              const incomingMapped = sharedWs.tests.map((t) => ({ ...t, projectId: activeProjectId }));
              const mergedProjTests = mergeTestCases(currentProjTests, incomingMapped);
              const updated = [...others, ...mergedProjTests];
              db.saveTestCases(updated, userId);
              return updated;
            });
          }
          if (Array.isArray(sharedWs.bugs)) {
            setBugs((prev) => {
              const others = prev.filter((b) => b.projectId && b.projectId !== activeProjectId);
              const currentProjBugs = prev.filter((b) => !b.projectId || b.projectId === activeProjectId);
              const incomingMapped = sharedWs.bugs.map((b) => ({ ...b, projectId: activeProjectId }));
              const mergedProjBugs = mergeBugs(currentProjBugs, incomingMapped);
              const updated = [...others, ...mergedProjBugs];
              db.saveBugs(updated, userId);
              return updated;
            });
          }
          pulledSomething = true;
        }
      } catch (wsErr) {
        console.warn('[Firebase] Error pulling active shared workspace:', wsErr);
      }
    }

    const cloudData = await db.pullFromFirestore(userId, currentUser.email);
    if (cloudData) {
      if (cloudData.projects) setProjects(normalizeProjects(cloudData.projects, userId, currentUser.email));
      if (cloudData.files) setFiles(cloudData.files);
      if (cloudData.tests) setTests(cloudData.tests);
      if (cloudData.bugs) setBugs(cloudData.bugs);
      if (cloudData.reports) setReports(cloudData.reports);
      pulledSomething = true;
    }
    return pulledSomething;
  };

  const handleForcePushSync = async () => {
    if (!activeProjectId || !activeProject || !currentUser) {
      alert('Please open a project first to sync.');
      return;
    }
    setSyncStatus('syncing');
    try {
      const currentFiles = files.filter((f) => !f.projectId || f.projectId === activeProjectId);
      const currentTests = tests
        .filter((t) => !t.projectId || t.projectId === activeProjectId)
        .map((t) => ({ ...t, projectId: activeProjectId }));
      const currentBugs = bugs.filter((b) => !b.projectId || b.projectId === activeProjectId);
      const currentReports = reports.filter((r) => r.projectId === activeProjectId);

      await db.syncSharedWorkspace(
        activeProjectId,
        {
          project: activeProject,
          files: currentFiles,
          tests: currentTests,
          bugs: currentBugs,
          reports: currentReports,
        },
        currentUser,
        clientId
      );
      setSyncStatus('synced');
      const execCount = currentTests.filter(t => isExecuted(t)).length;
      alert(`✅ Workspace "${activeProject.name}" synced to cloud successfully!\n\n• ${currentTests.length} Total Test Cases (${execCount} Executed)\n• ${currentBugs.length} Defects & Issues\n• ${currentFiles.length} Test Files\n\nYour teammates can now see these updates in real-time.`);
    } catch (err) {
      console.error('Force push sync failed:', err);
      setSyncStatus('error');
      alert(`⚠️ Sync failed: ${err.message || 'Check network connection'}`);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
      
      {/* Desktop Sidebar Navigation (hidden on mobile/tablet screens) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProject={activeProject}
        activeProjectId={activeProjectId}
        activeFile={activeFile}
        onExitTestFile={handleExitTestFile}
        openBugsCount={openBugsCount}
        currentUser={currentUser}
        onLogout={logout}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onExitProject={handleExitProject}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        syncStatus={syncStatus}
        onPullSync={handlePullSync}
        onForcePushSync={handleForcePushSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative bg-white overflow-y-auto flex flex-col min-w-0 pb-dock-safe md:pb-0">
        
        {/* Mobile Header Bar (hidden on desktop) */}
        <MobileHeader
          activeProject={activeProject}
          activeProjectId={activeProjectId}
          onExitProject={handleExitProject}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onSelectProjectsTab={() => {
            setActiveProjectId(null);
            setActiveFileId(null);
            setActiveTab('projects');
          }}
          currentUser={currentUser}
          onOpenOptionsSheet={() => setIsMobileOptionsOpen(true)}
        />

        {/* Workspace Invitation Banner */}
        <InvitationBanner
          invitations={pendingInvitations}
          onAccept={handleAcceptInvitation}
          onDecline={handleDeclineInvitation}
        />

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            files={files}
            tests={tests}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            activeProjectId={activeProjectId}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              setActiveFileId(null);
              setActiveTab('dashboard');
            }}
            pendingInvitations={pendingInvitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            tests={visibleProjectTests}
            bugs={projectBugs}
            project={activeProject}
            files={visibleProjectFiles}
            reports={reports.filter(r => r.projectId === activeProjectId)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            currentUser={currentUser}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
          />
        )}

        {activeTab === 'execute' && (
          <ExecutionWorkspace
            tests={visibleProjectTests}
            updateTest={handleUpdateTest}
            project={activeProject}
            files={visibleProjectFiles}
            activeFileId={activeFileId}
            onSelectFile={(id) => setActiveFileId(id)}
            onExitTestFile={handleExitTestFile}
            onAddBug={handleAddBug}
            bugs={projectBugs}
            onNavigateToBugs={() => setActiveTab('bugs')}
            onNavigateToFiles={() => setActiveTab('files')}
            onSubmitExecution={handleSubmitExecution}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'bugs' && (
          <BugsView
            bugs={projectBugs}
            onAddBug={handleAddBug}
            onUpdateBug={handleUpdateBug}
            onDeleteBug={handleDeleteBug}
            project={activeProject}
            tests={visibleProjectTests}
            currentUser={currentUser}
            triggerNewBugModal={triggerNewBugModal}
          />
        )}

        {(activeTab === 'files' || activeTab === 'import') && (
          <TestFilesView
            files={visibleProjectFiles}
            tests={visibleProjectTests}
            allTests={projectTests}
            project={activeProject}
            onAddFile={handleAddFile}
            onDeleteFile={(id) => {
              if (activeFileId === id) setActiveFileId(null);
              handleDeleteFile(id);
            }}
            onAddTest={handleAddTestCase}
            onDeleteTest={handleDeleteTest}
            onUpdateTest={handleUpdateTest}
            onBulkAssignSuite={handleBulkAssignSuite}
            onImportTests={handleImportTests}
            activeFileId={activeFileId}
            onSelectFile={(id) => setActiveFileId(id)}
            onExitTestFile={handleExitTestFile}
            onNavigateToExecute={() => setActiveTab('execute')}
            currentUser={currentUser}
            triggerNewFileModal={triggerNewFileModal}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            reports={reports.filter(r => r.projectId === activeProjectId)}
            project={activeProject}
            currentUser={currentUser}
            onAddReport={(report) => {
              setReports(prev => {
                const updated = [report, ...prev];
                db.saveReports(updated, userId);
                return updated;
              });
            }}
            onUpdateReport={(id, updates) => {
              setReports(prev => {
                const updated = prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r);
                db.saveReports(updated, userId);
                return updated;
              });
            }}
            onDeleteReport={(id) => {
              setReports(prev => {
                const updated = prev.filter(r => r.id !== id);
                db.saveReports(updated, userId);
                return updated;
              });
            }}
          />
        )}
      </main>

      {/* Mobile Floating Glass Dock & Options Sheet */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProjectId={activeProjectId}
        activeProject={activeProject}
        projects={projects}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          setActiveFileId(null);
        }}
        openBugsCount={openBugsCount}
        isOptionsOpen={isMobileOptionsOpen}
        setIsOptionsOpen={setIsMobileOptionsOpen}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onExitProject={handleExitProject}
        onLogout={logout}
        currentUser={currentUser}
        onTriggerNewFile={() => setTriggerNewFileModal(prev => !prev)}
        onTriggerNewBug={() => setTriggerNewBugModal(prev => !prev)}
      />

      {/* Cloud & Firebase Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onPullSync={handlePullSync}
      />

      {/* Invite Team Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        project={activeProject}
        currentUser={currentUser}
        onMembersUpdated={handleMembersUpdated}
      />

      {/* Direct Workspace Invitation Acceptance Modal */}
      <InviteAcceptModal
        isOpen={isInviteAcceptModalOpen}
        invite={activeUrlInvite}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
        onClose={() => setIsInviteAcceptModalOpen(false)}
      />

      {/* Real-time Workspace Update Toast Notification */}
      {lastSyncNotice && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700/60 backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold animate-fadeIn pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>⚡ {lastSyncNotice}</span>
        </div>
      )}

    </div>
  );
}

function MainApp() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <LoginView />;
  }

  return <AuthenticatedWorkspace currentUser={currentUser} logout={logout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
