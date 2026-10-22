import React from 'react';
import { Briefcase, UserPlus, Users, Sparkles, FolderOpen, ArrowLeft, Building2, Bot } from 'lucide-react';
import { getUserInitial, getUserColor } from '../../utils/formatters';

export const MobileHeader = ({
  activeApp = 'qa',
  setActiveApp,
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

  const isAiDev = activeApp === 'aidev';

  return (
    <header className={`flex md:hidden items-center justify-between px-3 py-2 sticky top-0 z-30 shrink-0 transition-colors ${
      isAiDev
        ? 'bg-[#030d14]/95 border-b border-white/10 text-white backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
        : 'bg-white border-b border-slate-200 text-slate-900 shadow-2xs'
    }`}>
      {/* Brand & Project Info */}
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          onClick={onSelectProjectsTab}
          className="flex items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
          title="InfratechAI Platform Hub"
        >
          <img 
            src="/qa-logo.png" 
            alt="App Logo" 
            className="w-7 h-7 object-contain rounded-lg shadow-2xs"
          />
        </button>

        {/* Mobile App Switcher Capsule */}
        {setActiveApp && (
          <div className={`flex items-center p-0.5 rounded-lg border text-xs shrink-0 overflow-x-auto scrollbar-none max-w-[240px] ${
            isAiDev ? 'bg-black/60 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveApp('qa')}
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeApp === 'qa' 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : isAiDev ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              QA
            </button>
            <button
              onClick={() => setActiveApp('sales')}
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeApp === 'sales' 
                  ? 'bg-amber-500 text-slate-950 shadow-2xs' 
                  : isAiDev ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveApp('business')}
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeApp === 'business' 
                  ? 'bg-emerald-600 text-white shadow-2xs' 
                  : isAiDev ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Business
            </button>
            <button
              onClick={() => setActiveApp('aidev')}
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeApp === 'aidev' 
                  ? 'bg-cyan-500 text-black shadow-2xs font-extrabold' 
                  : isAiDev ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Dev
            </button>
          </div>
        )}

        {/* Context Pill based on Active App */}
        {activeApp === 'qa' && activeProjectId && (
          <div className="hidden min-[400px]:flex items-center gap-1 min-w-0 bg-indigo-50 border border-indigo-200 rounded-full py-0.5 px-2">
            <Briefcase size={10} className="text-indigo-600 shrink-0" />
            <span className="text-[10px] font-bold text-slate-800 truncate max-w-[70px]">
              {activeProject?.name || 'Project'}
            </span>
          </div>
        )}

        {activeApp === 'business' && (
          <div className="hidden min-[400px]:flex items-center gap-1 min-w-0 bg-emerald-50 border border-emerald-200 rounded-full py-0.5 px-2">
            <Building2 size={10} className="text-emerald-700 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-800 truncate">
              Command
            </span>
          </div>
        )}

        {activeApp === 'sales' && (
          <div className="hidden min-[400px]:flex items-center gap-1 min-w-0 bg-amber-50 border border-amber-200 rounded-full py-0.5 px-2">
            <Bot size={10} className="text-amber-700 shrink-0" />
            <span className="text-[10px] font-bold text-amber-800 truncate">
              Harvey
            </span>
          </div>
        )}

        {activeApp === 'aidev' && (
          <div className="hidden min-[400px]:flex items-center gap-1 min-w-0 bg-cyan-950/60 border border-cyan-500/40 rounded-full py-0.5 px-2">
            <Sparkles size={10} className="text-cyan-400 shrink-0" />
            <span className="text-[10px] font-bold text-cyan-300 truncate">
              Copilot
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Invite & User Avatar / Options */}
      <div className="flex items-center gap-2 shrink-0">
        {activeProjectId && onOpenInviteModal && (
          <button
            onClick={onOpenInviteModal}
            className={`p-2 rounded-full border active-spring ${
              isAiDev
                ? 'bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border-cyan-500/40'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
            }`}
            title="Invite Collaborator"
          >
            <UserPlus size={14} />
          </button>
        )}

        <button
          onClick={onOpenOptionsSheet}
          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-1 ${
            isAiDev ? 'ring-cyan-500/30' : 'ring-white/20'
          } active-spring ${userColor?.badge || 'bg-indigo-600 text-white'}`}
          title="User menu & options"
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
};
