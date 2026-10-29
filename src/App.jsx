import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { db } from './services/db';
import { generateId, getTimestamp } from './utils/formatters';
import { AuthProvider, useAuth } from './context/AuthContext';

import { AppRail } from './components/layout/AppRail';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ProjectsView } from './components/projects/ProjectsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExecutionWorkspace } from './components/execution/ExecutionWorkspace';
import { TestFilesView } from './components/testFiles/TestFilesView';
import { BugsView } from './components/bugs/BugsView';
import { ReportsView } from './components/reports/ReportsView';
import { AppLibraryView } from './components/hub/AppLibraryView';
import { SalesManagerView } from './components/sales/SalesManagerView';
import { BusinessCommandCenterView } from './components/business/BusinessCommandCenterView';
import { AiDevView } from './components/aidev/AiDevView';
import { VirtualCompanyView } from './components/company/VirtualCompanyView';
import { VirtualCustomerView } from './components/customers/VirtualCustomerView';
import { HarveySettingsModal } from './components/sales/HarveySettingsModal';
import { FirebaseModal } from './components/modals/FirebaseModal';
import { InviteMemberModal } from './components/modals/InviteMemberModal';
import { InviteAcceptModal } from './components/modals/InviteAcceptModal';
import { InvitationBanner } from './components/layout/InvitationBanner';
import { LoginView } from './components/auth/LoginView';
import { mergeTestCases, mergeBugs, mergeFiles, isExecuted } from './utils/workspaceMerger';
import { salesService } from './services/salesService';
import { businessService } from './services/businessService';

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

  // Initialize active app from URL search parameter (e.g. ?app=company)
  const [activeApp, setActiveAppState] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const app = params.get('app');
      if (app && ['hub', 'company', 'customers', 'qa', 'business', 'sales', 'aidev'].includes(app)) {
        return app;
      }
    } catch {}
    return 'hub';
  });

  const setActiveApp = useCallback((newApp) => {
    setActiveAppState(newApp);
    try {
      const url = new URL(window.location.href);
      if (newApp === 'hub') {
        url.searchParams.delete('app');
      } else {
        url.searchParams.set('app', newApp);
      }
      window.history.pushState({}, '', url.toString());
    } catch {}
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const app = params.get('app') || 'hub';
        setActiveAppState(app);
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [salesTab, setSalesTab] = useState('cockpit');
  const [isHarveySettingsOpen, setIsHarveySettingsOpen] = useState(false);
  const [salesSettings, setSalesSettings] = useState(() => salesService.getSettings());
  const [pendingOutboxCount, setPendingOutboxCount] = useState(() => {
    try {
      return salesService.getOutbox(userId).filter(o => o.status === 'pending_approval').length;
    } catch {
      return 0;
    }
  });
  const [contracts, setContracts] = useState(() => {
    try {
      return businessService.getContracts(userId);
    } catch {
      return [];
    }
  });
  const contractMetrics = useMemo(() => businessService.getPortfolioMetrics(contracts), [contracts]);
  const [businessTab, setBusinessTab] = useState('portfolio');
  const [triggerAddContractModal, setTriggerAddContractModal] = useState(false);
  const [aiDevVoice, setAiDevVoice] = useState('jarvis');
  const [aiDevLang, setAiDevLang] = useState('hi-IN');
  const [aiDevLiveCallActive, setAiDevLiveCallActive] = useState(false);
  const [aiDevVoiceEnabled, setAiDevVoiceEnabled] = useState(true);
  const [aiDevResetSignal, setAiDevResetSignal] = useState(0);
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
  const remoteUpdateCooldownRef = useRef(0);
  const isInitialPullCompleteRef = useRef(false);

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
    if (!activeProjectId || !currentUser) {
      isInitialPullCompleteRef.current = false;
      return;
    }
    isInitialPullCompleteRef.current = false;

    // 1. Immediately pull latest workspace data from Firestore on opening project
    db.pullSharedWorkspace(activeProjectId)
      .then((initialData) => {
        if (!initialData) return;
        remoteUpdateCooldownRef.current = Date.now() + 3000;
        if (initialData.project) {
          setProjects((prev) => {
            const updated = prev.map((p) => (p.id === activeProjectId ? { ...p, ...initialData.project } : p));
            db.saveProjects(updated, userId, false);
            return normalizeProjects(updated, userId, currentUser.email);
          });
        }
        if (Array.isArray(initialData.files) && initialData.files.length > 0) {
          setFiles((prev) => {
            const others = prev.filter((f) => f.projectId && f.projectId !== activeProjectId);
            const currentWsFiles = prev.filter((f) => !f.projectId || f.projectId === activeProjectId);
            const incomingMapped = initialData.files.map((f) => ({ ...f, projectId: activeProjectId }));
            const merged = mergeFiles(currentWsFiles, incomingMapped);
            const updated = [...others, ...merged];
            db.saveFiles(updated, userId, false);
            return updated;
          });
        }
        if (Array.isArray(initialData.tests) && initialData.tests.length > 0) {
          setTests((prev) => {
            const others = prev.filter((t) => t.projectId && t.projectId !== activeProjectId);
            const currentWsTests = prev.filter((t) => !t.projectId || t.projectId === activeProjectId);
            const incomingMapped = initialData.tests.map((t) => ({ ...t, projectId: activeProjectId }));
            const merged = mergeTestCases(currentWsTests, incomingMapped);
            const updated = [...others, ...merged];
            db.saveTestCases(updated, userId, false);
            return updated;
          });
        }
        if (Array.isArray(initialData.bugs)) {
          setBugs((prev) => {
            const others = prev.filter((b) => b.projectId && b.projectId !== activeProjectId);
            const currentWsBugs = prev.filter((b) => !b.projectId || b.projectId === activeProjectId);
            const incomingMapped = initialData.bugs.map((b) => ({ ...b, projectId: activeProjectId }));
            const merged = mergeBugs(currentWsBugs, incomingMapped);
            const updated = [...others, ...merged];
            db.saveBugs(updated, userId, false);
            return updated;
          });
        }
        if (Array.isArray(initialData.reports)) {
          setReports((prev) => {
            const others = prev.filter((r) => r.projectId !== activeProjectId);
            const updated = [...others, ...initialData.reports];
            db.saveReports(updated, userId, false);
            return updated;
          });
        }
        console.log('[QA Sync] 📥 Initial workspace pull complete:', {
          files: initialData.files?.length || 0,
          tests: initialData.tests?.length || 0,
        });
      })
      .catch((err) => console.warn('[Firebase] Initial workspace pull error:', err))
      .finally(() => {
        isInitialPullCompleteRef.current = true;
      });

    // 2. Subscribe to real-time changes
    const unsubscribe = db.subscribeToSharedWorkspace(
      activeProjectId,
      (remoteData) => {
        // Skip update if it originated from this tab/client
        if (remoteData.lastModifiedClientId && remoteData.lastModifiedClientId === clientId) {
          return;
        }

        // Suppress auto-sync echo writes for 3s after remote update arrives
        remoteUpdateCooldownRef.current = Date.now() + 3000;

        // Apply incoming project updates
        if (remoteData.project) {
          setProjects((prev) => {
            const updated = prev.map((p) => (p.id === activeProjectId ? { ...p, ...remoteData.project } : p));
            db.saveProjects(updated, userId, false);
            return normalizeProjects(updated, userId, currentUser.email);
          });
        }

        console.log(`[QA Sync] 📡 Real-time update received for workspace:`, {
          projectId: activeProjectId,
          files: remoteData.files?.length || 0,
          tests: remoteData.tests?.length || 0,
          bugs: remoteData.bugs?.length || 0,
          from: remoteData.lastModifiedBy,
        });

        // Apply incoming files directly in real-time
        if (Array.isArray(remoteData.files) && remoteData.files.length > 0) {
          setFiles((prev) => {
            const others = prev.filter((f) => f.projectId && f.projectId !== activeProjectId);
            const currentWsFiles = prev.filter((f) => !f.projectId || f.projectId === activeProjectId);
            const incomingMapped = remoteData.files.map((f) => ({ ...f, projectId: activeProjectId }));
            const merged = mergeFiles(currentWsFiles, incomingMapped);
            const updated = [...others, ...merged];
            db.saveFiles(updated, userId, false);
            return updated;
          });
        }

        // Apply incoming tests directly in real-time (instant status & execution updates)
        if (Array.isArray(remoteData.tests) && remoteData.tests.length > 0) {
          setTests((prev) => {
            const others = prev.filter((t) => t.projectId && t.projectId !== activeProjectId);
            const currentWsTests = prev.filter((t) => !t.projectId || t.projectId === activeProjectId);
            const incomingMapped = remoteData.tests.map((t) => ({ ...t, projectId: activeProjectId }));
            const merged = mergeTestCases(currentWsTests, incomingMapped);
            const updated = [...others, ...merged];
            db.saveTestCases(updated, userId, false);
            return updated;
          });
        }

        // Apply incoming bugs directly in real-time (instant defects, comments, status changes)
        if (Array.isArray(remoteData.bugs)) {
          setBugs((prev) => {
            const others = prev.filter((b) => b.projectId && b.projectId !== activeProjectId);
            const currentWsBugs = prev.filter((b) => !b.projectId || b.projectId === activeProjectId);
            const incomingMapped = remoteData.bugs.map((b) => ({ ...b, projectId: activeProjectId }));
            const merged = mergeBugs(currentWsBugs, incomingMapped);
            const updated = [...others, ...merged];
            db.saveBugs(updated, userId, false);
            return updated;
          });
        }

        // Apply incoming reports
        if (Array.isArray(remoteData.reports)) {
          setReports((prev) => {
            const others = prev.filter((r) => r.projectId !== activeProjectId);
            const updated = [...others, ...remoteData.reports];
            db.saveReports(updated, userId, false);
            return updated;
          });
        }

        setSyncStatus('synced');
        if (remoteData.lastModifiedBy && remoteData.lastModifiedBy.toLowerCase() !== currentUser.email?.toLowerCase()) {
          const editor = remoteData.lastModifiedBy.split('@')[0];
          setLastSyncNotice(`🟢 Real-time: Live update from ${editor}`);
          setTimeout(() => setLastSyncNotice(null), 4000);
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

  // In collaborative QA workspaces, all test files and test cases belonging to the active project
  // are immediately visible to all team members without hiding or drafting restrictions.
  const visibleProjectFiles = projectFiles;
  const visibleProjectTests = projectTests;

  const activeFile = visibleProjectFiles.find((f) => f.id === activeFileId) || null;
  const openBugsCount = projectBugs.filter((b) => ['Open', 'In Progress', 'Reopened'].includes(b.status)).length;

  // Auto sync shared workspace changes (tests, bugs, files) to Firestore whenever active project is open
  useEffect(() => {
    if (!activeProjectId || !activeProject || !currentUser) return;
    if (!isInitialPullCompleteRef.current) return;

    // Resilient cooldown delay: Instead of silently dropping writes, schedule timer after cooldown expires
    const remainingCooldown = Math.max(0, remoteUpdateCooldownRef.current - Date.now());
    const syncDelay = Math.max(300, remainingCooldown);

    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      const currentFiles = files.filter((f) => !f.projectId || f.projectId === activeProjectId);
      const currentTests = tests
        .filter((t) => !t.projectId || t.projectId === activeProjectId)
        .map((t) => ({ ...t, projectId: activeProjectId }));
      const currentBugs = bugs.filter((b) => !b.projectId || b.projectId === activeProjectId);
      const currentReports = reports.filter((r) => r.projectId === activeProjectId);

      console.log(`[QA Sync] 🔄 Auto-syncing workspace "${activeProject.name}" (${currentFiles.length} files, ${currentTests.length} tests, ${currentBugs.length} bugs)...`);

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
        .then(() => {
          setSyncStatus('synced');
          console.log(`[QA Sync] 🟢 Workspace "${activeProject.name}" successfully synced to Firestore`);
        })
        .catch((err) => {
          console.warn('[Firebase] Auto sync failed:', err);
          setSyncStatus('error');
        });
    }, syncDelay);

    return () => clearTimeout(timer);
  }, [activeProjectId, tests, bugs, files, reports, activeProject, currentUser, clientId]);

  // Synchronize document body & root background for seamless cyber dark theme in AI Dev
  useEffect(() => {
    if (activeApp === 'aidev') {
      document.body.style.backgroundColor = '#020609';
      document.documentElement.style.backgroundColor = '#020609';
      document.body.classList.add('bg-[#020609]');
      document.body.classList.remove('bg-slate-50');
    } else {
      document.body.style.backgroundColor = '#f8fafc';
      document.documentElement.style.backgroundColor = '#f8fafc';
      document.body.classList.remove('bg-[#020609]');
      document.body.classList.add('bg-slate-50');
    }
  }, [activeApp]);

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
  const handleAddFile = (name, copyFromId, initialTests = []) => {
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

    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    db.saveFiles(updatedFiles, userId);

    let updatedTests = tests;
    if (copyFromId) {
      const testsToCopy = tests.filter((t) => t.fileId === copyFromId);
      const duplicatedTests = testsToCopy.map((t) => ({
        ...t,
        id: generateId(),
        fileId: newFileId,
        status: 'Not Run',
        actualResult: '',
        testerNotes: '',
        executedBy: null,
        executedByName: null,
        executedByRole: null,
        executedAt: null,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      }));
      updatedTests = [...tests, ...duplicatedTests];
      setTests(updatedTests);
      db.saveTestCases(updatedTests, userId);
    } else if (Array.isArray(initialTests) && initialTests.length > 0) {
      const mappedInitialTests = initialTests.map((t) => ({
        ...t,
        id: t.id || generateId(),
        fileId: newFileId,
        projectId: activeProjectId,
        status: t.status || 'Not Run',
        actualResult: t.actualResult || '',
        testerNotes: t.testerNotes || '',
        createdAt: t.createdAt || getTimestamp(),
        updatedAt: t.updatedAt || getTimestamp(),
        createdBy: t.createdBy || currentUser?.email || 'Unknown',
        createdByName: t.createdByName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
      }));
      updatedTests = [...tests, ...mappedInitialTests];
      setTests(updatedTests);
      db.saveTestCases(updatedTests, userId);
    }

    console.log(`[QA Sync] 📁 Created new test suite: "${name}" (${newFileId}) with ${updatedTests.length - tests.length} test cases`);

    if (activeProjectId && activeProject && currentUser) {
      db.syncSharedWorkspace(
        activeProjectId,
        {
          project: activeProject,
          files: updatedFiles.filter((f) => !f.projectId || f.projectId === activeProjectId),
          tests: updatedTests.filter((t) => !t.projectId || t.projectId === activeProjectId),
          bugs: bugs.filter((b) => !b.projectId || b.projectId === activeProjectId),
          reports: reports.filter((r) => r.projectId === activeProjectId),
        },
        currentUser,
        clientId
      )
        .then(() => console.log(`[QA Sync] 🟢 Atomic cloud sync complete for suite: "${name}"`))
        .catch((e) => console.warn('[Firebase] New suite sync error:', e));
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
            const updatedItem = { ...t, ...updates, ...executionMeta, projectId: activeProjectId, updatedAt: getTimestamp() };
            console.log(`[QA Sync] ⚡ Test updated in state: [${updatedItem.externalId || id}] -> "${updatedItem.status}" by ${updatedItem.executedBy || 'Tester'}`);
            return updatedItem;
          }
          return t;
        });
        db.saveTestCases(updated, userId);
        return updated;
      });
    },
    [userId, activeProjectId, activeProject, currentUser]
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
      console.log(`[QA Sync] 📥 Imported ${newTests?.length || 0} test cases into active workspace`);
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
      setBugs((prev) => {
        const updated = [newBug, ...prev];
        db.saveBugs(updated, userId);
        return updated;
      });
    },
    [userId, activeProjectId]
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
    remoteUpdateCooldownRef.current = Date.now() + 3000;
    setSyncStatus('syncing');
    let pulledSomething = false;

    if (activeProjectId) {
      try {
        const sharedWs = await db.pullSharedWorkspace(activeProjectId);
        if (sharedWs) {
          if (sharedWs.project) {
            setProjects((prev) => {
              const updated = prev.map((p) => (p.id === activeProjectId ? { ...p, ...sharedWs.project } : p));
              db.saveProjects(updated, userId, false);
              return normalizeProjects(updated, userId, currentUser.email);
            });
          }
          if (Array.isArray(sharedWs.files) && sharedWs.files.length > 0) {
            setFiles((prev) => {
              const others = prev.filter((f) => f.projectId && f.projectId !== activeProjectId);
              const incomingMapped = sharedWs.files.map((f) => ({ ...f, projectId: activeProjectId }));
              const updated = [...others, ...incomingMapped];
              db.saveFiles(updated, userId, false);
              return updated;
            });
          }
          if (Array.isArray(sharedWs.tests) && sharedWs.tests.length > 0) {
            setTests((prev) => {
              const others = prev.filter((t) => t.projectId && t.projectId !== activeProjectId);
              const incomingMapped = sharedWs.tests.map((t) => ({ ...t, projectId: activeProjectId }));
              const updated = [...others, ...incomingMapped];
              db.saveTestCases(updated, userId, false);
              return updated;
            });
          }
          if (Array.isArray(sharedWs.bugs)) {
            setBugs((prev) => {
              const others = prev.filter((b) => b.projectId && b.projectId !== activeProjectId);
              const incomingMapped = sharedWs.bugs.map((b) => ({ ...b, projectId: activeProjectId }));
              const updated = [...others, ...incomingMapped];
              db.saveBugs(updated, userId, false);
              return updated;
            });
          }
          pulledSomething = true;
          setSyncStatus('synced');
          setLastSyncNotice('✅ Synced latest workspace updates from cloud');
          setTimeout(() => setLastSyncNotice(null), 3500);
          return true;
        }
      } catch (wsErr) {
        console.warn('[Firebase] Error pulling active shared workspace:', wsErr);
        setSyncStatus('error');
      }
    } else {
      const cloudData = await db.pullFromFirestore(userId, currentUser.email);
      if (cloudData) {
        if (cloudData.projects) setProjects(normalizeProjects(cloudData.projects, userId, currentUser.email));
        if (cloudData.files) setFiles(cloudData.files);
        if (cloudData.tests) setTests(cloudData.tests);
        if (cloudData.bugs) setBugs(cloudData.bugs);
        if (cloudData.reports) setReports(cloudData.reports);
        pulledSomething = true;
      }
    }
    setSyncStatus('synced');
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
      setLastSyncNotice(`✅ Workspace "${activeProject.name}" synced (${execCount}/${currentTests.length} tests executed)`);
      setTimeout(() => setLastSyncNotice(null), 4500);
    } catch (err) {
      console.error('Force push sync failed:', err);
      setSyncStatus('error');
      setLastSyncNotice(`⚠️ Sync failed: ${err.message || 'Check network connection'}`);
      setTimeout(() => setLastSyncNotice(null), 5000);
    }
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full bg-[#E5E7EE] text-[#141518] font-sans overflow-hidden relative selection:bg-[#2B2D33] selection:text-white">

      {/* Main Workspace Frame (Full Screen, No Left Dock Squishing Apps) */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full h-full relative">

        {/* Desktop Sidebar Navigation (shown only inside QA for workspace tabs: Projects, Dashboard, Execution, Files, Bugs, Reports) */}
        {activeApp === 'qa' && (
          <Sidebar
            activeApp={activeApp}
            onReturnToHub={() => setActiveApp('hub')}
            salesTab={salesTab}
            setSalesTab={setSalesTab}
            pendingOutboxCount={pendingOutboxCount}
            onOpenHarveySettings={() => setIsHarveySettingsOpen(true)}
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
        )}

        {/* Main Content Area — Full Screen Viewport */}
        <main className="flex-1 relative flex flex-col min-w-0 w-full h-full bg-[#E5E7EE] overflow-y-auto">
        
        {/* Mobile Header Bar (hidden on desktop, hub, and cyberpunk command views) */}
        {activeApp !== 'hub' && activeApp !== 'company' && activeApp !== 'customers' && (
          <MobileHeader
            activeApp={activeApp}
            setActiveApp={setActiveApp}
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
        )}

        {/* ======================================================== */}
        {/* MODE 0: INFRATECHAI GAMES & APPS LIBRARY (HOME ON LOGIN) */}
        {/* ======================================================== */}
        {activeApp === 'hub' && (
          <AppLibraryView
            onLaunchApp={(appId) => setActiveApp(appId)}
            projects={projects}
            openBugsCount={openBugsCount}
            pendingOutboxCount={pendingOutboxCount}
            contractsCount={contractMetrics.totalContracts}
            contractsExpiringSoon={contractMetrics.expiringSoonCount}
            contractsMRR={contractMetrics.totalMRR}
            currentUser={currentUser}
            onLogout={logout}
            onOpenSettings={() => setIsHarveySettingsOpen(true)}
          />
        )}

        {/* ======================================================== */}
        {/* MODE 1: SALES MANAGER (HARVEY AUTONOMOUS AI SDR SUITE)   */}
        {/* ======================================================== */}
        {activeApp === 'sales' && (
          <SalesManagerView 
            currentUser={currentUser}
            salesTab={salesTab}
            setSalesTab={setSalesTab}
            onOpenSettings={() => setIsHarveySettingsOpen(true)}
            onUpdateOutboxCount={(count) => setPendingOutboxCount(count)}
          />
        )}

        {/* ======================================================== */}
        {/* MODE 2: QA MANAGER SUITE                                 */}
        {/* ======================================================== */}
        {activeApp === 'qa' && (
          <>
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
          </>
        )}

        {/* ======================================================== */}
        {/* MODE 3: BUSINESS COMMAND CENTER                         */}
        {/* ======================================================== */}
        {activeApp === 'business' && (
          <BusinessCommandCenterView
            currentUser={currentUser}
            qaProjects={projects}
            qaBugs={bugs}
            qaTests={tests}
            onContractsChange={(updated) => setContracts(updated)}
            activeTab={businessTab}
            onTabChange={setBusinessTab}
            triggerAddModal={triggerAddContractModal}
            onNavigateToApp={(appId) => setActiveApp(appId)}
            onNavigateToQA={(projectId) => {
              setActiveApp('qa');
              if (projectId) {
                setActiveProjectId(projectId);
                setActiveTab('dashboard');
              }
            }}
          />
        )}

        {/* ======================================================== */}
        {/* MODE 4: AI DEV (AUTONOMOUS TECHNICAL COPILOT)           */}
        {/* ======================================================== */}
        {activeApp === 'aidev' && (
          <AiDevView
            currentUser={currentUser}
            projects={projects}
            files={files}
            tests={tests}
            bugs={bugs}
            contracts={contracts}
            leads={salesService.getLeads(userId)}
            outbox={salesService.getOutbox(userId)}
            syncStatus={syncStatus}
            onSwitchApp={(targetApp) => setActiveApp(targetApp)}
            agentVoice={aiDevVoice}
            onAgentVoiceChange={setAiDevVoice}
            speechLang={aiDevLang}
            onSpeechLangChange={setAiDevLang}
            isLiveCallActive={aiDevLiveCallActive}
            onLiveCallActiveChange={setAiDevLiveCallActive}
            isVoiceEnabled={aiDevVoiceEnabled}
            onVoiceEnabledChange={setAiDevVoiceEnabled}
            resetSignal={aiDevResetSignal}
          />
        )}

        {/* ======================================================== */}
        {/* MODE 5: VIRTUAL COMPANY (STARK CYBERPUNK HQ & HARVEY)    */}
        {/* ======================================================== */}
        {activeApp === 'company' && (
          <VirtualCompanyView
            currentUser={currentUser}
            projects={projects}
            tests={tests}
            bugs={bugs}
            contracts={contracts}
            onNavigateToApp={(appId) => setActiveApp(appId)}
            onOpenHarveySettings={() => setIsHarveySettingsOpen(true)}
          />
        )}

        {/* ======================================================== */}
        {/* MODE 6: VIRTUAL CUSTOMER SWARM (MIROFISH MULTI-AGENT)    */}
        {/* ======================================================== */}
        {activeApp === 'customers' && (
          <VirtualCustomerView
            currentUser={currentUser}
            onNavigateToApp={(appId) => setActiveApp(appId)}
          />
        )}
      </main>
      </div>

      {/* Mobile Floating Glass Dock & Options Sheet (shown across ecosystem apps) */}
      {activeApp !== 'hub' && (
        <MobileBottomNav
          activeApp={activeApp}
          onSwitchApp={(newApp) => setActiveApp(newApp)}
          // QA Props
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
          onTriggerNewFile={() => setTriggerNewFileModal(prev => !prev)}
          onTriggerNewBug={() => setTriggerNewBugModal(prev => !prev)}
          // Sales Props
          salesTab={salesTab}
          setSalesTab={setSalesTab}
          pendingOutboxCount={pendingOutboxCount}
          // Business Props
          businessTab={businessTab}
          setBusinessTab={setBusinessTab}
          contractsCount={contracts.length}
          expiringSoonCount={contractMetrics.expiringSoonCount}
          onTriggerAddContract={() => setTriggerAddContractModal(prev => !prev)}
          // AI Dev Vocal Copilot Props
          aidevTab={aiDevLiveCallActive ? 'live' : 'chat'}
          isLiveCallActive={aiDevLiveCallActive}
          onToggleLiveCall={() => setAiDevLiveCallActive(prev => !prev)}
          agentVoice={aiDevVoice}
          onToggleAgentVoice={() => setAiDevVoice(prev => prev === 'jarvis' ? 'friday' : 'jarvis')}
          speechLang={aiDevLang}
          onToggleSpeechLang={() => setAiDevLang(prev => prev === 'hi-IN' ? 'en-US' : 'hi-IN')}
          isVoiceEnabled={aiDevVoiceEnabled}
          onToggleVoiceEnabled={() => setAiDevVoiceEnabled(prev => !prev)}
          onResetConversation={() => setAiDevResetSignal(prev => prev + 1)}
          // Options Sheet & Global Controls
          isOptionsOpen={isMobileOptionsOpen}
          setIsOptionsOpen={setIsMobileOptionsOpen}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onExitProject={handleExitProject}
          onLogout={logout}
          currentUser={currentUser}
        />
      )}

      {/* Harvey Engine Settings Modal */}
      <HarveySettingsModal
        isOpen={isHarveySettingsOpen}
        onClose={() => setIsHarveySettingsOpen(false)}
        settings={salesSettings}
        onSave={(newS) => {
          const saved = salesService.saveSettings(newS, userId);
          setSalesSettings(saved);
        }}
        onClearData={() => {
          salesService.clearAllSalesData(userId);
          setPendingOutboxCount(0);
        }}
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
