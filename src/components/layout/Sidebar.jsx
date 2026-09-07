import React, { useRef } from 'react';
import { 
  CheckCircle, Briefcase, LayoutDashboard, Play, 
  Bug as BugIcon, Upload, List, Trash2, Cloud, 
  Download, UploadCloud, LogOut, LogIn, DoorOpen
} from 'lucide-react';
import { isFirebaseConfigured } from '../../config/firebase';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  activeProject, 
  activeProjectId,
  openBugsCount = 0,
  currentUser,
  onLogout,
  onWipeData,
  onExportBackup,
  onImportBackup,
  onOpenFirebaseModal,
  onExitProject,
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
    { id: 'import', icon: Upload, label: 'Bulk Import', disabled: !activeProjectId },
    { id: 'files', icon: List, label: 'All Test Cases', disabled: !activeProjectId },
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
    <aside className="w-64 border-r border-slate-200 flex flex-col shrink-0 z-20 bg-white shadow-[2px_0_15px_rgba(0,0,0,0.02)] h-screen">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
          <CheckCircle size={20} strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-extrabold text-slate-900 text-base tracking-tight block leading-tight">
            InfratechAI
          </span>
          <span className="text-[11px] font-semibold text-indigo-600 tracking-wider uppercase">
            QA Manager
          </span>
        </div>
      </div>

      {/* Cloud Sync Status Indicator */}
      <div className="px-4 pt-3">
        <button
          onClick={onOpenFirebaseModal}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
            isFirebaseConfigured
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title="Click to manage Firebase & Cloud settings"
        >
          <div className="flex items-center gap-2 truncate">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isFirebaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="truncate">
              {isFirebaseConfigured ? 'Firestore Synced' : 'Local Storage Mode'}
            </span>
          </div>
          <Cloud size={13} className={isFirebaseConfigured ? 'text-emerald-600' : 'text-slate-400'} />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        
        {/* === NOT INSIDE A PROJECT: Show "All Projects" button === */}
        {!activeProjectId && (
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Briefcase size={18} className={activeTab === 'projects' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>All Projects</span>
          </button>
        )}

        {/* === INSIDE A PROJECT: Show project context + Exit button === */}
        {activeProjectId && (
          <div className="space-y-2">
            {/* Active Project Display Card */}
            <div className="px-3.5 py-3 bg-indigo-50/80 rounded-xl border border-indigo-200/80">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-indigo-600 rounded-lg text-white shrink-0 mt-0.5">
                  <Briefcase size={13} />
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Active Project</p>
                  <p className="text-xs font-extrabold text-indigo-900 truncate">{activeProject?.name || 'Project'}</p>
                </div>
              </div>
            </div>

            {/* Exit Workspace Button */}
            <button
              onClick={onExitProject}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-rose-100 hover:border-rose-200"
            >
              <DoorOpen size={17} className="text-rose-500" />
              <span>Exit Workspace</span>
            </button>
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
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-rose-100 text-rose-700'
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
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate" title={currentUser.email}>
                {currentUser.email}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Protected</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />
        <div className="flex gap-1">
          <button
            onClick={onExportBackup}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Download JSON Backup"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Import JSON Backup"
          >
            <UploadCloud size={13} /> Import
          </button>
        </div>

        <button
          onClick={onWipeData}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 size={13} /> Wipe My Data
        </button>
      </div>

    </aside>
  );
};
