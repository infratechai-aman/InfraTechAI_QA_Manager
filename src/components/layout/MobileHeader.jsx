import React from 'react';
import { Briefcase, UserPlus, Users, Sparkles, FolderOpen, ArrowLeft } from 'lucide-react';
import { getUserInitial, getUserColor } from '../../utils/formatters';

export const MobileHeader = ({
  activeProject,
  activeProjectId,
  onExitProject,
  onOpenInviteModal,
  onSelectProjectsTab,
  currentUser,
  onOpenOptionsSheet,
}) => {
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');
  const userColor = getUserColor(currentUser?.email || 'user');

  return (
    <header className="flex md:hidden items-center justify-between px-3.5 py-2.5 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shrink-0">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onSelectProjectsTab}
          className="flex items-center gap-2 shrink-0 group active:scale-95 transition-transform"
          title="All Projects"
        >
          <img 
            src="/qa-logo.png" 
            alt="QA Manager Logo" 
            className="w-8 h-8 object-contain rounded-lg shadow-sm"
          />
          {!activeProjectId && (
            <div className="flex flex-col text-left leading-none">
              <span className="font-extrabold text-sm text-white tracking-tight">InfratechAI</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">QA Manager</span>
            </div>
          )}
        </button>

        {/* If inside active project: Show Project Pill */}
        {activeProjectId && (
          <div className="flex items-center gap-1.5 min-w-0 bg-white/5 border border-white/10 rounded-full py-1 px-2.5">
            <Briefcase size={12} className="text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200 truncate max-w-[130px] sm:max-w-[200px]">
              {activeProject?.name || 'Project'}
            </span>
            {activeProject?.members && activeProject.members.length > 1 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {activeProject.members.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Invite & User Avatar / Options */}
      <div className="flex items-center gap-2 shrink-0">
        {activeProjectId && onOpenInviteModal && (
          <button
            onClick={onOpenInviteModal}
            className="p-2 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 active-spring"
            title="Invite Collaborator"
          >
            <UserPlus size={14} />
          </button>
        )}

        <button
          onClick={onOpenOptionsSheet}
          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-white/20 active-spring ${userColor?.badge || 'bg-indigo-600 text-white'}`}
          title="User menu & options"
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
};
