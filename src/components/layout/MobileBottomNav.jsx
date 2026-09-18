import React, { useRef } from 'react';
import { 
  Briefcase, LayoutDashboard, Play, Bug as BugIcon, 
  List, Plus, Sparkles, X, ChevronRight, UserPlus, 
  CloudRain, Download, UploadCloud, LogOut, FileText,
  Shield, BookOpen, Layers, RefreshCw
} from 'lucide-react';

export const MobileBottomNav = ({
  activeTab,
  setActiveTab,
  activeProjectId,
  activeProject,
  openBugsCount = 0,
  isOptionsOpen,
  setIsOptionsOpen,
  onOpenInviteModal,
  onOpenFirebaseModal,
  onExportBackup,
  onImportBackup,
  onExitProject,
  onLogout,
  currentUser,
  onTriggerNewFile,
  onTriggerNewBug,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportBackup(json);
        setIsOptionsOpen(false);
      } catch (err) {
        alert('Failed to parse backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navItems = [
    {
      id: 'projects',
      label: 'Projects',
      icon: Briefcase,
      onClick: () => {
        setActiveTab('projects');
      },
      isActive: activeTab === 'projects',
      disabled: false,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        if (activeProjectId) setActiveTab('dashboard');
      },
      isActive: activeTab === 'dashboard',
      disabled: !activeProjectId,
    },
    // Center Button (Options FAB) is handled separately
    {
      id: 'execute',
      label: 'Execute',
      icon: Play,
      onClick: () => {
        if (activeProjectId) setActiveTab('execute');
      },
      isActive: activeTab === 'execute',
      disabled: !activeProjectId,
    },
    {
      id: 'bugs',
      label: 'Bugs',
      icon: BugIcon,
      badge: openBugsCount > 0 ? openBugsCount : null,
      onClick: () => {
        if (activeProjectId) setActiveTab('bugs');
      },
      isActive: activeTab === 'bugs',
      disabled: !activeProjectId,
    },
    {
      id: 'files',
      label: 'Suites',
      icon: List,
      onClick: () => {
        if (activeProjectId) setActiveTab('files');
      },
      isActive: activeTab === 'files' || activeTab === 'import',
      disabled: !activeProjectId,
    },
  ];

  return (
    <>
      {/* Hidden file input for backup restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Floating iOS Glassmorphic Dock (Visible on mobile/tablet screens: md:hidden) */}
      <nav 
        className="fixed bottom-3 inset-x-3 max-w-lg mx-auto z-40 md:hidden glass-dock rounded-3xl p-1.5 flex items-center justify-between"
        aria-label="Mobile Navigation Dock"
      >
        {/* First 2 items (Projects, Dashboard) */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={item.onClick}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl relative transition-all active-spring ${
                item.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              } ${
                item.isActive 
                  ? 'text-white bg-white/10 font-bold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={item.isActive ? 'text-indigo-400' : ''} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-1"></span>
              )}
            </button>
          );
        })}

        {/* Center Glowing Action Trigger: Opens the Glassmorphic Options Sheet */}
        <div className="px-1 shrink-0">
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active-spring relative ${
              isOptionsOpen
                ? 'bg-rose-600 text-white rotate-45 shadow-rose-500/40'
                : 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-indigo-500/40 hover:shadow-indigo-500/60'
            }`}
            title="Open Quick Options"
            aria-label="Toggle Options Menu"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
            {isOptionsOpen ? (
              <X size={22} className="shrink-0" />
            ) : (
              <Sparkles size={20} className="shrink-0 animate-pulse" />
            )}
          </button>
        </div>

        {/* Next 3 items (Execute, Bugs, Files) */}
        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={item.onClick}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl relative transition-all active-spring ${
                item.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              } ${
                item.isActive 
                  ? 'text-white bg-white/10 font-bold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={18} className={item.isActive ? 'text-indigo-400' : ''} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center px-1 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-1"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* iOS-Style Glassmorphic Bottom Option List Sheet */}
      {isOptionsOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Frosted Backdrop */}
          <div 
            onClick={() => setIsOptionsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn"
          />

          {/* Glass Bottom Sheet */}
          <div className="relative z-10 w-full max-w-lg mx-auto glass-sheet rounded-t-[2.5rem] p-5 pb-safe animate-slideUp max-h-[85vh] overflow-y-auto">
            
            {/* iOS Grab Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 shrink-0"></div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">Quick Actions & Options</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                    {activeProject ? activeProject.name : 'InfratechAI QA Suite'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOptionsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors active-spring"
              >
                <X size={16} />
              </button>
            </div>

            {/* Options List Body */}
            <div className="space-y-4">
              
              {/* Inside Project Actions */}
              {activeProjectId ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 px-1">
                    Testing Actions
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* New Test Suite */}
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setActiveTab('files');
                        if (onTriggerNewFile) onTriggerNewFile();
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-indigo-500/40 active-spring transition-all"
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Plus size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">New Test Suite</p>
                        <p className="text-[10px] text-slate-400">Add or copy file</p>
                      </div>
                    </button>

                    {/* Bulk Import */}
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setActiveTab('files');
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-violet-500/40 active-spring transition-all"
                    >
                      <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Bulk Import</p>
                        <p className="text-[10px] text-slate-400">Parse plain text</p>
                      </div>
                    </button>

                    {/* Log New Bug */}
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setActiveTab('bugs');
                        if (onTriggerNewBug) onTriggerNewBug();
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-rose-500/40 active-spring transition-all"
                    >
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <BugIcon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Report Bug</p>
                        <p className="text-[10px] text-slate-400">Log defect/issue</p>
                      </div>
                    </button>

                    {/* Invite Member */}
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (onOpenInviteModal) onOpenInviteModal();
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-emerald-500/40 active-spring transition-all"
                    >
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <UserPlus size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Invite Member</p>
                        <p className="text-[10px] text-slate-400">Collaborate in RMS</p>
                      </div>
                    </button>
                  </div>

                  {/* Reports & Metrics */}
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setActiveTab('reports');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-card flex items-center justify-between border border-white/10 hover:border-indigo-500/30 text-white active-spring"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                        <BookOpen size={15} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">Executive QA Reports</p>
                        <p className="text-[10px] text-slate-400">Generate & export pass/fail metrics</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                </div>
              ) : (
                /* Outside Project */
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-1">
                  <p className="text-xs font-bold text-indigo-200">No Active Project Selected</p>
                  <p className="text-[11px] text-slate-400">
                    Open or create a project to access test execution, bug logging, and team suites.
                  </p>
                </div>
              )}

              {/* Data & Workspace Tools */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Cloud & Data
                </span>

                <div className="rounded-2xl glass-card border border-white/10 divide-y divide-white/5 overflow-hidden">
                  
                  {/* Cloud Pull & Sync */}
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      if (onOpenFirebaseModal) onOpenFirebaseModal();
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-slate-200 active-spring transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CloudRain size={16} className="text-cyan-400" />
                      <span className="text-xs font-semibold">Cloud Sync & Status</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>

                  {/* Export Backup */}
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onExportBackup();
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-slate-200 active-spring transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download size={16} className="text-emerald-400" />
                      <span className="text-xs font-semibold">Export JSON Backup</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>

                  {/* Import Backup */}
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-slate-200 active-spring transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <UploadCloud size={16} className="text-amber-400" />
                      <span className="text-xs font-semibold">Restore from JSON</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>

                  {/* Switch / Exit Project */}
                  {activeProjectId && (
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        onExitProject();
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-indigo-300 active-spring transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase size={16} />
                        <span className="text-xs font-bold">Switch / All Projects</span>
                      </div>
                      <ChevronRight size={14} className="text-indigo-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Account & Sign Out */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-white truncate">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {currentUser?.email}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onLogout();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 active-spring"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
