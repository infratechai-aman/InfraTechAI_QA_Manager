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
import { LoginView } from './components/auth/LoginView';

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
  const [activeFileId, setActiveFileId] = useState(null);

  const activeFile = files.find((f) => f.id === activeFileId && f.projectId === activeProjectId) || null;

  // Initialize and load data whenever authenticated user changes
  useEffect(() => {
    if (!userId) return;

    const initUserData = async () => {
      // 1. Load user's private local cache
      const loadedProjects = db.getProjects(userId);
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

      // 2. Check for latest cloud updates from user's private Firestore collection
      try {
        const cloudData = await db.pullFromFirestore(userId);
        if (cloudData) {
          if (cloudData.projects) setProjects(cloudData.projects);
          if (cloudData.files) setFiles(cloudData.files);
          if (cloudData.tests) setTests(cloudData.tests);
          if (cloudData.bugs) setBugs(cloudData.bugs);
        }
      } catch (err) {
        console.warn('Private cloud pull check completed:', err);
      }
    };

    initUserData();
  }, [userId]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const projectFiles = files.filter((f) => f.projectId === activeProjectId);
  const projectTests = tests.filter((t) => t.projectId === activeProjectId);
  const projectBugs = bugs.filter((b) => b.projectId === activeProjectId);
  const openBugsCount = projectBugs.filter((b) => ['Open', 'In Progress', 'Reopened'].includes(b.status)).length;

  // --- Project Management ---
  const handleAddProject = (newProjData) => {
    const newProject = {
      ...newProjData,
      id: `p${generateId()}`,
      createdAt: getTimestamp(),
    };
    setProjects((prev) => {
      const updated = [...prev, newProject];
      db.saveProjects(updated, userId);
      return updated;
    });
    setActiveProjectId(newProject.id);
    setActiveTab('dashboard');
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
    const newFile = {
      id: newFileId,
      projectId: activeProjectId,
      name,
      date: getTimestamp(),
      createdAt: getTimestamp(),
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
      const newTest = {
        ...newTestData,
        id: generateId(),
        externalId: `TC-${generateId().substring(0, 4).toUpperCase()}`,
        status: 'Not Run',
        actualResult: '',
        testerNotes: '',
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      };
      setTests((prev) => {
        const updated = [...prev, newTest];
        db.saveTestCases(updated, userId);
        return updated;
      });
    },
    [userId]
  );

  const handleUpdateTest = useCallback(
    (id, updates) => {
      setTests((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: getTimestamp() } : t));
        db.saveTestCases(updated, userId);
        return updated;
      });
    },
    [userId]
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
    const cloudData = await db.pullFromFirestore(userId);
    if (cloudData) {
      if (cloudData.projects) setProjects(cloudData.projects);
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
      />

      {/* Main Content Area */}
      <main className="flex-1 relative bg-white overflow-y-auto">
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
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            tests={projectTests}
            bugs={projectBugs}
            project={activeProject}
            files={projectFiles}
            onNavigateToTab={(tab) => setActiveTab(tab)}
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
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            reports={reports.filter(r => r.projectId === activeProjectId)}
            project={activeProject}
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
