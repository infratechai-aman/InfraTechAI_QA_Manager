import React, { useRef } from 'react';
import { 
  Briefcase, LayoutDashboard, Play, 
  Bug as BugIcon, List, Download, UploadCloud, LogOut, DoorOpen, BookOpen,
  FileText, UserPlus, RefreshCw, Bot, Mail,
  Layers, MessageSquare, Sliders, Building2, Radio, CheckSquare
} from 'lucide-react';

export const Sidebar = ({ 
  activeApp = 'qa',
  onReturnToHub,
  activeTab, 
  setActiveTab, 
  salesTab = 'cockpit',
  setSalesTab,
  pendingOutboxCount = 0,
  onOpenHarveySettings,
  activeProject, 
  activeProjectId,
  activeFile,
  onExitTestFile,
  openBugsCount = 0,
  currentUser,
  onLogout,
  onExportBackup,
  onImportBackup,
  onExitProject,
  onOpenInviteModal,
  syncStatus = 'synced',
  onPullSync,
  onForcePushSync,
}) => {
  const fileInputRef = useRef(null);

  const qaNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', disabled: !activeProjectId },
    { id: 'execute', icon: Play, label: 'Test Execution', disabled: !activeProjectId },
    { 
      id: 'bugs', 
      icon: BugIcon, 
      label: 'Bugs & Issues', 
      disabled: !activeProjectId,
      badge: openBugsCount > 0 ? openBugsCount : null 
    },
    { id: 'files', icon: List, label: 'All Test Cases', disabled: !activeProjectId },
    { id: 'reports', icon: BookOpen, label: 'Reports', disabled: !activeProjectId },
  ];

  const salesNavItems = [
    { id: 'cockpit', icon: LayoutDashboard, label: 'Cockpit Overview' },
    { 
      id: 'outbox', 
      icon: Mail, 
      label: 'Decisions Desk', 
      badge: pendingOutboxCount > 0 ? pendingOutboxCount : null,
      badgeColor: 'amber'
    },
    { id: 'leads', icon: List, label: 'Prospects & Signals' },
    { id: 'campaigns', icon: Layers, label: 'Sequence Playbooks' },
    { id: 'conversations', icon: MessageSquare, label: 'Inbound & Replies' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportBackup(json);
      } catch (err) {
        alert('Failed to parse backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isDark = activeApp === 'aidev';
  const userInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A';

  return (
    <aside className={`hidden md:flex w-60 flex-col shrink-0 z-20 h-full mac-sidebar select-none transition-colors ${
      isDark 
        ? 'bg-[#1C1C1E]/95 border-r border-white/10 text-white' 
        : 'text-[#1D1D1F]'
    }`}>
      
      {/* macOS Sidebar Header */}
      <div className={`px-3 py-3 border-b flex items-center justify-between ${
        isDark ? 'border-white/10' : 'border-black/[0.06]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-white to-[#F2F2F7] flex items-center justify-center shadow-xs border border-black/5 p-1">
            <img 
              src="/qa-logo.png" 
              alt="App Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className={`font-semibold text-xs tracking-tight block ${
              isDark ? 'text-white' : 'text-[#1D1D1F]'
            }`}>
              InfratechAI
            </span>
            <span className={`text-[10px] font-medium tracking-wide ${
              isDark
                ? 'text-[#5AC8FA]'
                : activeApp === 'sales' 
                  ? 'text-[#FF9500]' 
                  : activeApp === 'business' 
                    ? 'text-[#34C759]' 
                    : 'text-[#007AFF]'
            }`}>
              {activeApp === 'sales' 
                ? 'Sales SDR' 
                : activeApp === 'business' 
                  ? 'Business Hub' 
                  : activeApp === 'aidev' 
                    ? 'AI Copilot' 
                    : 'QA Manager'}
            </span>
          </div>
        </div>

        {onReturnToHub && (
          <button
            onClick={onReturnToHub}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all apple-press cursor-pointer border flex items-center gap-1 ${
              isDark
                ? 'bg-white/10 text-white border-white/10 hover:bg-white/15'
                : 'bg-white text-[#141518] border-black/[0.1] shadow-2xs hover:bg-[#141518] hover:text-white'
            }`}
            title="Return to Master App / Launchpad"
          >
            <span>◂ Launchpad</span>
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        
        {/* === MODE C: BUSINESS COMMAND CENTER NAVIGATION === */}
        {activeApp === 'business' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-white/70 rounded-lg border border-black/[0.06] shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">Portfolio</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#34C759] bg-[#34C759]/10 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1D1D1F]">Business Command</p>
              <p className="text-[11px] text-[#86868B]">Client contracts, retainers & SLAs</p>
            </div>

            <div className="space-y-1">
              <div className="px-2 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                Desk
              </div>
              <div className="p-2.5 rounded-lg bg-white/60 border border-black/[0.05] text-xs text-[#3C3C43] space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-[#1D1D1F]">
                  <Building2 size={15} className="text-[#34C759]" />
                  <span>Enterprise Portfolio</span>
                </div>
                <p className="text-[11px] text-[#86868B] leading-relaxed">
                  Active contracts, renewal expiration countdowns & SLA matrix.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* === MODE D: AI DEV COPILOT NAVIGATION === */}
        {activeApp === 'aidev' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#5AC8FA] uppercase tracking-wider font-mono">Telemetry</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#34C759] bg-[#34C759]/20 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs font-semibold text-white">AI Dev Copilot</p>
              <p className="text-[11px] text-slate-400">Autonomous voice-enabled technical copilot</p>
            </div>

            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Feeds
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-md bg-white/[0.03] border border-white/5">
                  <span className="text-slate-300 flex items-center gap-2 font-normal">
                    <CheckSquare size={13} className="text-[#5AC8FA]" /> QA Test Suites
                  </span>
                  <span className="text-[10px] font-medium text-[#34C759]">Live</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-white/[0.03] border border-white/5">
                  <span className="text-slate-300 flex items-center gap-2 font-normal">
                    <Building2 size={13} className="text-[#34C759]" /> Contracts
                  </span>
                  <span className="text-[10px] font-medium text-[#34C759]">Live</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-white/[0.03] border border-white/5">
                  <span className="text-slate-300 flex items-center gap-2 font-normal">
                    <Bot size={13} className="text-[#FF9500]" /> Harvey Pipeline
                  </span>
                  <span className="text-[10px] font-medium text-[#34C759]">Live</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === MODE A: SALES MANAGER (HARVEY) NAVIGATION === */}
        {activeApp === 'sales' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-white/70 rounded-lg border border-black/[0.06] shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">Agent Engine</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#34C759] bg-[#34C759]/10 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1D1D1F]">Harvey Autonomous SDR</p>
              <p className="text-[11px] text-[#86868B]">Autonomous prospecting & verification</p>
            </div>

            <div className="space-y-0.5">
              <div className="px-2 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                Sales Navigation
              </div>
              {salesNavItems.map(item => {
                const Icon = item.icon;
                const isActive = salesTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSalesTab && setSalesTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer apple-press ${
                      isActive
                        ? 'mac-item-active'
                        : 'text-[#3C3C43] hover:bg-black/[0.045] font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-[#636366]'} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${
                        isActive 
                          ? 'bg-white text-[#007AFF]' 
                          : 'bg-[#FF9500] text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-black/[0.06]">
              <button
                onClick={onOpenHarveySettings}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#1D1D1F] hover:bg-black/[0.04] rounded-md transition-colors cursor-pointer"
              >
                <Sliders size={14} className="text-[#007AFF]" />
                <span>Configure Engine</span>
              </button>
            </div>
          </div>
        )}

        {/* === MODE B: QA MANAGER NAVIGATION === */}
        {activeApp === 'qa' && (
          <>
            {!activeProjectId && (
              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer apple-press ${
                  activeTab === 'projects'
                    ? 'mac-item-active'
                    : 'text-[#3C3C43] hover:bg-black/[0.045] font-normal'
                }`}
              >
                <Briefcase size={16} className={activeTab === 'projects' ? 'text-white' : 'text-[#636366]'} strokeWidth={1.8} />
                <span>All Projects</span>
              </button>
            )}

            {activeProjectId && (
              <div className="space-y-2">
                {/* Active Project Card */}
                <div className="px-2.5 py-2 bg-white/70 rounded-lg border border-black/[0.06] shadow-2xs">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-[#007AFF] rounded-md text-white shrink-0 mt-0.5">
                      <Briefcase size={12} />
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">Project</p>
                      <p className="text-xs font-semibold text-[#1D1D1F] truncate">{activeProject?.name || 'Project'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {onOpenInviteModal && (
                    <button
                      onClick={onOpenInviteModal}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer bg-white/80 hover:bg-white text-[#007AFF] border border-black/[0.08] shadow-2xs apple-press"
                      title="Invite Member"
                    >
                      <UserPlus size={12} />
                      <span>Invite</span>
                    </button>
                  )}

                  <button
                    onClick={onExitProject}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer text-[#FF3B30] hover:bg-[#FF3B30]/10 border border-[#FF3B30]/20 apple-press"
                  >
                    <DoorOpen size={12} />
                    <span>Exit</span>
                  </button>
                </div>

                {activeFile && (
                  <div className="pt-1.5 space-y-1.5 border-t border-black/[0.06]">
                    <div className="px-2 py-1.5 bg-white/60 rounded-md border border-black/[0.05]">
                      <div className="flex items-center gap-2">
                        <FileText size={12} className="text-[#8E8E93]" />
                        <p className="text-xs font-medium text-[#1D1D1F] truncate" title={activeFile.name}>{activeFile.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={onExitTestFile}
                      className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-medium text-[#FF9500] hover:bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-md transition-colors cursor-pointer apple-press"
                    >
                      <DoorOpen size={11} />
                      <span>Deselect File</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Core QA Navigation Items */}
            <div className="space-y-0.5">
              {activeProjectId && (
                <div className="px-2 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                  Workspace
                </div>
              )}
              {qaNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => !item.disabled && setActiveTab(item.id)}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer apple-press ${
                      item.disabled
                        ? 'opacity-35 cursor-not-allowed text-[#AEAEB2]'
                        : isActive
                          ? 'mac-item-active'
                          : 'text-[#3C3C43] hover:bg-black/[0.045] font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-[#636366]'} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${
                        isActive ? 'bg-white text-[#007AFF]' : 'apple-badge'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* User Account Info Bar */}
      {currentUser && (
        <div className={`px-3 py-2 border-t flex items-center justify-between ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/[0.06] bg-white/40'
        }`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-6 h-6 rounded-full font-medium text-[11px] flex items-center justify-center shrink-0 ${
              isDark ? 'bg-white/20 text-white' : 'bg-[#007AFF] text-white shadow-2xs'
            }`}>
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`} title={currentUser.email}>
                {currentUser.email}
              </p>
              <button
                type="button"
                onClick={onPullSync}
                className="flex items-center gap-1 text-[10px] text-[#86868B] hover:text-[#007AFF] transition-colors cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'syncing' ? 'bg-[#FF9500] animate-pulse' :
                  syncStatus === 'error' ? 'bg-[#FF3B30]' : 'bg-[#34C759]'
                }`}></span>
                <span>{syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Paused' : 'Synced'}</span>
                <RefreshCw size={8} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1 rounded-md text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={13} />
          </button>
        </div>
      )}

      {/* Bottom Footer Backup Controls */}
      <div className={`p-2 border-t flex gap-1 ${isDark ? 'border-white/10' : 'border-black/[0.06]'}`}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />
        <button
          onClick={onExportBackup}
          className="flex-1 flex items-center justify-center gap-1 py-1 text-[11px] font-medium rounded-md text-[#636366] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer border border-transparent hover:border-black/[0.06]"
          title="Export JSON Backup"
        >
          <Download size={11} /> Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1 py-1 text-[11px] font-medium rounded-md text-[#636366] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer border border-transparent hover:border-black/[0.06]"
          title="Import JSON Backup"
        >
          <UploadCloud size={11} /> Import
        </button>
      </div>

    </aside>
  );
};
