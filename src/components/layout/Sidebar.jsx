import React, { useRef } from 'react';
import { 
  Briefcase, LayoutDashboard, Play, 
  Bug as BugIcon, Upload, List,
  Download, UploadCloud, LogOut, DoorOpen, BookOpen,
  FileText, UserPlus, Users
} from 'lucide-react';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
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
}) => {
  const fileInputRef = useRef(null);

  const navItems = [
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

  const userInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A';

  return (
    <aside className="hidden md:flex w-64 border-r border-white/10 flex-col shrink-0 z-20 bg-slate-900/90 backdrop-blur-xl shadow-2xl h-screen text-slate-200">
      
      {/* Brand Header with Logo */}
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-3">
        <img 
          src="/qa-logo.png" 
          alt="QA Manager Logo" 
          className="w-9 h-9 object-contain shrink-0 rounded-xl"
        />
        <div>
          <span className="font-extrabold text-white text-base tracking-tight block leading-tight">
            InfratechAI
          </span>
          <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
            QA Manager
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        
        {/* === NOT INSIDE A PROJECT: Show "All Projects" button === */}
        {!activeProjectId && (
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Briefcase size={18} className={activeTab === 'projects' ? 'text-white' : 'text-slate-400'} />
            <span>All Projects</span>
          </button>
        )}

        {/* === INSIDE A PROJECT: Show project context + Exit button === */}
        {activeProjectId && (
          <div className="space-y-2">
            {/* Active Project Display Card */}
            <div className="px-3.5 py-3 bg-indigo-950/40 rounded-2xl border border-indigo-500/30">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-indigo-600 rounded-xl text-white shrink-0 mt-0.5 shadow-sm">
                  <Briefcase size={13} />
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Active Project</p>
                  <p className="text-xs font-extrabold text-white truncate">{activeProject?.name || 'Project'}</p>
                </div>
              </div>
            </div>

            {/* Invite Collaborator Button */}
            {onOpenInviteModal && (
              <button
                onClick={onOpenInviteModal}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs"
                title="Invite team member to collaborate"
              >
                <div className="flex items-center gap-2">
                  <UserPlus size={14} className="text-indigo-400" />
                  <span>Invite Member</span>
                </div>
                {activeProject?.members && activeProject.members.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-500/30 text-indigo-200 font-extrabold border border-indigo-400/30">
                    {activeProject.members.length}
                  </span>
                )}
              </button>
            )}

            {/* Exit Workspace Button */}
            <button
              onClick={onExitProject}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40"
            >
              <DoorOpen size={15} className="text-rose-400" />
              <span>Exit Workspace</span>
            </button>

            {/* Active Test Case / File Display Card + Exit TestCase Button */}
            {activeFile && (
              <div className="pt-2 space-y-2 animate-fadeIn border-t border-white/10">
                <div className="px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-800 rounded-lg text-white shrink-0 mt-0.5">
                      <FileText size={13} />
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Suite</p>
                      <p className="text-xs font-bold text-white truncate" title={activeFile.name}>{activeFile.name}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onExitTestFile}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer shadow-xs"
                  title="Deselect active test case file"
                >
                  <DoorOpen size={13} className="text-amber-400" />
                  <span>Exit Suite</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Core Module Nav Items */}
        <div className="space-y-1">
          {activeProjectId && (
            <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Workspace
            </div>
          )}
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 mb-1 cursor-pointer ${
                  item.disabled
                    ? 'opacity-30 cursor-not-allowed text-slate-500'
                    : isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Account Info Bar */}
      {currentUser && (
        <div className="px-4 py-2.5 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate" title={currentUser.email}>
                {currentUser.email}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}

      {/* Bottom Footer — Export/Import */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />
        <div className="flex gap-1.5">
          <button
            onClick={onExportBackup}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Download JSON Backup"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Import JSON Backup"
          >
            <UploadCloud size={13} /> Import
          </button>
        </div>
      </div>

    </aside>
  );
};
