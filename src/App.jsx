import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import { generateId, getTimestamp } from './utils/formatters';

import { Sidebar } from './components/layout/Sidebar';
import { ProjectsView } from './components/projects/ProjectsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExecutionWorkspace } from './components/execution/ExecutionWorkspace';
import { TestFilesView } from './components/testFiles/TestFilesView';
import { BugsView } from './components/bugs/BugsView';
import { BulkImportView } from './components/import/BulkImportView';
import { FirebaseModal } from './components/modals/FirebaseModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [tests, setTests] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      // 1. Load from local cache immediately
      const loadedProjects = db.getProjects();
      const loadedFiles = db.getFiles();
      const loadedTests = db.getTestCases();
      const loadedBugs = db.getBugs();

      setProjects(loadedProjects);
      setFiles(loadedFiles);
      setTests(loadedTests);
      setBugs(loadedBugs);

      if (loadedProjects.length > 0) {
        setActiveProjectId(loadedProjects[0].id);
        setActiveTab('dashboard');
      }

      // 2. If Firebase is configured, check for any newer cloud updates
      try {
        const cloudData = await db.pullFromFirestore();
        if (cloudData) {
          if (cloudData.projects) setProjects(cloudData.projects);
          if (cloudData.files) setFiles(cloudData.files);
          if (cloudData.tests) setTests(cloudData.tests);
          if (cloudData.bugs) setBugs(cloudData.bugs);
        }
      } catch (err) {
        console.warn('Initial cloud sync check completed with note:', err);
      }
    };

    initData();
  }, []);

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
      db.saveProjects(updated);
      return updated;
    });
    setActiveProjectId(newProject.id);
    setActiveTab('dashboard');
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

    db.saveProjects(updatedProjects);
    db.saveFiles(updatedFiles);
    db.saveTestCases(updatedTests);
    db.saveBugs(updatedBugs);

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
      db.saveFiles(updated);
      return updated;
    });

    // Clone tests if requested
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
        db.saveTestCases(updated);
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

    db.saveFiles(updatedFiles);
    db.saveTestCases(updatedTests);
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
        db.saveTestCases(updated);
        return updated;
      });
    },
    []
  );

  const handleUpdateTest = useCallback((id, updates) => {
    setTests((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: getTimestamp() } : t));
      db.saveTestCases(updated);
      return updated;
    });
  }, []);

  const handleDeleteTest = (testId) => {
    setTests((prev) => {
      const updated = prev.filter((t) => t.id !== testId);
      db.saveTestCases(updated);
      return updated;
    });
  };

  const handleImportTests = useCallback((newTests) => {
    setTests((prev) => {
      const updated = [...prev, ...newTests];
      db.saveTestCases(updated);
      return updated;
    });
    setActiveTab('execute');
  }, []);

  // --- Defects & Bugs Management ---
  const handleAddBug = useCallback((newBugData) => {
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
      db.saveBugs(updated);
      return updated;
    });
  }, []);

  const handleUpdateBug = useCallback((bugId, updates) => {
    setBugs((prev) => {
      const updated = prev.map((b) => (b.id === bugId ? { ...b, ...updates, updatedAt: getTimestamp() } : b));
      db.saveBugs(updated);
      return updated;
    });
  }, []);

  const handleDeleteBug = (bugId) => {
    setBugs((prev) => {
      const updated = prev.filter((b) => b.id !== bugId);
      db.saveBugs(updated);
      return updated;
    });
  };

  // --- Backup & Reset ---
  const handleWipeData = async () => {
    if (window.confirm('Are you sure you want to delete ALL projects, files, and test cases? This action cannot be undone.')) {
      await db.wipeAllData();
      setProjects([]);
      setFiles([]);
      setTests([]);
      setBugs([]);
      setActiveProjectId(null);
      setActiveTab('projects');
    }
  };

  const handleExportBackup = () => {
    db.exportToJson();
  };

  const handleImportBackup = (jsonData) => {
    try {
      db.importFromJson(jsonData);
      setProjects(db.getProjects());
      setFiles(db.getFiles());
      setTests(db.getTestCases());
      setBugs(db.getBugs());
      if (jsonData.projects && jsonData.projects.length > 0) {
        setActiveProjectId(jsonData.projects[0].id);
      }
      alert('Backup imported successfully!');
    } catch (e) {
      alert('Failed to import backup: ' + e.message);
    }
  };

  const handlePullSync = async () => {
    const cloudData = await db.pullFromFirestore();
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
        onWipeData={handleWipeData}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
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
