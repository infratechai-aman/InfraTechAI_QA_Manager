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
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

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
    setActiveTab('projects');
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
    (newTests) => {
      setTests((prev) => {
        const updated = [...prev, ...newTests];
        db.saveTestCases(updated, userId);
        return updated;
      });
      setActiveTab('execute');
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
        openBugsCount={openBugsCount}
        currentUser={currentUser}
        onLogout={logout}
        onWipeData={handleWipeData}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
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
            onAddBug={handleAddBug}
            bugs={projectBugs}
            onNavigateToBugs={() => setActiveTab('bugs')}
            onNavigateToFiles={() => setActiveTab('files')}
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

        {activeTab === 'import' && (
          <BulkImportView
            onImport={handleImportTests}
            project={activeProject}
            files={projectFiles}
            onAddFile={handleAddFile}
          />
        )}

        {activeTab === 'files' && (
          <TestFilesView
            files={projectFiles}
            tests={projectTests}
            project={activeProject}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onAddTest={handleAddTestCase}
            onDeleteTest={handleDeleteTest}
            onUpdateTest={handleUpdateTest}
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
