import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import { generateId, getTimestamp } from './utils/formatters';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Sidebar } from './components/layout/Sidebar';
import { ProjectsView } from './components/projects/ProjectsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExecutionWorkspace } from './components/execution/ExecutionWorkspace';
import { TestFilesView } from './components/testFiles/TestFilesView';
import { BugsView } from './components/bugs/BugsView';
import { BulkImportView } from './components/import/BulkImportView';
import { ReportsView } from './components/reports/ReportsView';
import { FirebaseModal } from './components/modals/FirebaseModal';
import { InviteMemberModal } from './components/modals/InviteMemberModal';
import { InviteAcceptModal } from './components/modals/InviteAcceptModal';
import { InvitationBanner } from './components/layout/InvitationBanner';
import { LoginView } from './components/auth/LoginView';

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

  const activeFile = files.find((f) => f.id === activeFileId && f.projectId === activeProjectId) || null;

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
  const projectFiles = files.filter((f) => f.projectId === activeProjectId);
  const projectTests = tests.filter((t) => t.projectId === activeProjectId);
  const projectBugs = bugs.filter((b) => b.projectId === activeProjectId);
  const openBugsCount = projectBugs.filter((b) => ['Open', 'In Progress', 'Reopened'].includes(b.status)).length;

  // Auto sync shared workspace changes (tests, bugs, files) to Firestore if project is shared
  useEffect(() => {
    if (!activeProjectId || !activeProject || !currentUser) return;
    const isShared = activeProject.members && activeProject.members.length > 1;
    if (isShared) {
      db.syncSharedWorkspace(activeProjectId, {
        project: activeProject,
        files: projectFiles,
        tests: projectTests,
        bugs: projectBugs,
        reports: reports.filter(r => r.projectId === activeProjectId)
      }, currentUser);
    }
  }, [activeProjectId, tests.length, bugs.length, files.length]);

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
      } else {
        // Fallback: refresh from cloud
        const cloudData = await db.pullFromFirestore(userId, currentUser.email);
        if (cloudData && cloudData.projects) {
          setProjects(normalizeProjects(cloudData.projects, userId, currentUser.email));
          if (cloudData.files) setFiles(cloudData.files);
          if (cloudData.tests) setTests(cloudData.tests);
          if (cloudData.bugs) setBugs(cloudData.bugs);
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
        }, currentUser);
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
      } else if (!targetFileId && files.length > 0) {
        targetFileId = files.find((f) => f.projectId === activeProjectId)?.id;
      }

      if (targetFileId) {
        setActiveFileId(targetFileId);
      }
      setActiveTab('files');
    },
    [tests, files, activeProjectId, activeProject, userId]
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
      setTests((prev) => {
        const isOwner = activeProject?.ownerEmail?.toLowerCase() === currentUser?.email?.toLowerCase();
        const updated = prev.map((t) => {
          if (t.id === id) {
            const isStatusChange = updates.status && ['Pass', 'Fail', 'Blocked'].includes(updates.status);
            const executionMeta = isStatusChange ? {
              executedBy: updates.executedBy || currentUser?.email || 'Unknown',
              executedByName: updates.executedByName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
              executedByRole: updates.executedByRole || (isOwner ? 'Owner' : 'QA Tester'),
              executedAt: updates.executedAt || getTimestamp(),
            } : {};
            return { ...t, ...updates, ...executionMeta, updatedAt: getTimestamp() };
          }
          return t;
        });
        db.saveTestCases(updated, userId);
        return updated;
      });
    },
    [userId, activeProject, currentUser]
  );

  const handleDeleteTest = (testId) => {
    setTests((prev) => {
      const updated = prev.filter((t) => t.id !== testId);
      db.saveTestCases(updated, userId);
      return updated;
    });
  };

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
        status: 'Open',
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      };
      setBugs((prev) => {
        const updated = [newBug, ...prev];
        db.saveBugs(updated, userId);
        return updated;
      });
    },
    [userId]
  );

  const handleUpdateBug = useCallback(
    (bugId, updates) => {
      setBugs((prev) => {
        const updated = prev.map((b) => (b.id === bugId ? { ...b, ...updates, updatedAt: getTimestamp() } : b));
        db.saveBugs(updated, userId);
        return updated;
      });
    },
    [userId]
  );

  const handleDeleteBug = (bugId) => {
    setBugs((prev) => {
      const updated = prev.filter((b) => b.id !== bugId);
      db.saveBugs(updated, userId);
      return updated;
    });
  };

  // --- Backup & Reset ---
  const handleWipeData = async () => {
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
    const cloudData = await db.pullFromFirestore(userId, currentUser.email);
    if (cloudData) {
      if (cloudData.projects) setProjects(normalizeProjects(cloudData.projects, userId, currentUser.email));
      if (cloudData.files) setFiles(cloudData.files);
      if (cloudData.tests) setTests(cloudData.tests);
      if (cloudData.bugs) setBugs(cloudData.bugs);
      return true;
    }
    return false;
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Sidebar Navigation */}
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
      />

      {/* Main Content Area */}
      <main className="flex-1 relative bg-white overflow-y-auto flex flex-col">
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
            tests={projectTests}
            bugs={projectBugs}
            project={activeProject}
            files={projectFiles}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            currentUser={currentUser}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
          />
        )}

        {activeTab === 'execute' && (
          <ExecutionWorkspace
            tests={projectTests}
            updateTest={handleUpdateTest}
            project={activeProject}
            files={projectFiles}
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
            tests={projectTests}
            currentUser={currentUser}
          />
        )}

        {(activeTab === 'files' || activeTab === 'import') && (
          <TestFilesView
            files={projectFiles}
            tests={projectTests}
            project={activeProject}
            onAddFile={handleAddFile}
            onDeleteFile={(id) => {
              if (activeFileId === id) setActiveFileId(null);
              handleDeleteFile(id);
            }}
            onAddTest={handleAddTestCase}
            onDeleteTest={handleDeleteTest}
            onUpdateTest={handleUpdateTest}
            onImportTests={handleImportTests}
            activeFileId={activeFileId}
            onSelectFile={(id) => setActiveFileId(id)}
            onExitTestFile={handleExitTestFile}
            onNavigateToExecute={() => setActiveTab('execute')}
            currentUser={currentUser}
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
