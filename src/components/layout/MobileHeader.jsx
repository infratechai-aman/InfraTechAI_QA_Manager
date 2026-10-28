import React from 'react';
import { Briefcase, UserPlus, Sparkles, Building2, Bot } from 'lucide-react';
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
    <header className={`flex md:hidden items-center justify-between px-3 py-2.5 sticky top-0 z-30 shrink-0 transition-colors ios-glass-header ${
      isAiDev
        ? 'bg-[#1C1C1E]/90 border-b border-white/10 text-white'
        : 'text-[#1D1D1F]'
    }`} style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 8px))' }}>
      
      {/* Brand & Project Info */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onSelectProjectsTab}
          className="flex items-center gap-1.5 shrink-0 apple-press cursor-pointer"
          title="InfratechAI Platform Hub"
        >
          <div className="w-7 h-7 rounded-[8px] bg-white shadow-2xs border border-black/5 p-1 flex items-center justify-center">
            <img 
              src="/qa-logo.png" 
              alt="App Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </button>

        {/* iOS Native Segmented Picker Capsule */}
        {setActiveApp && (
          <div className={`flex items-center p-0.5 rounded-[9px] border text-xs shrink-0 overflow-x-auto scrollbar-none max-w-[230px] ${
            isAiDev ? 'bg-black/50 border-white/10' : 'bg-black/[0.06] border-black/[0.04]'
          }`}>
            <button
              onClick={() => setActiveApp('qa')}
              className={`px-2 py-0.5 rounded-[7px] text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer apple-press ${
                activeApp === 'qa' 
                  ? 'bg-white text-[#007AFF] shadow-xs font-semibold' 
                  : isAiDev ? 'text-slate-400' : 'text-[#636366]'
              }`}
            >
              QA
            </button>
            <button
              onClick={() => setActiveApp('sales')}
              className={`px-2 py-0.5 rounded-[7px] text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer apple-press ${
                activeApp === 'sales' 
                  ? 'bg-white text-[#FF9500] shadow-xs font-semibold' 
                  : isAiDev ? 'text-slate-400' : 'text-[#636366]'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveApp('business')}
              className={`px-2 py-0.5 rounded-[7px] text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer apple-press ${
                activeApp === 'business' 
                  ? 'bg-white text-[#34C759] shadow-xs font-semibold' 
                  : isAiDev ? 'text-slate-400' : 'text-[#636366]'
              }`}
            >
              Biz
            </button>
            <button
              onClick={() => setActiveApp('aidev')}
              className={`px-2 py-0.5 rounded-[7px] text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer apple-press ${
                activeApp === 'aidev' 
                  ? 'bg-[#007AFF] text-white shadow-xs font-semibold' 
                  : isAiDev ? 'text-slate-400' : 'text-[#636366]'
              }`}
            >
              AI Dev
            </button>
          </div>
        )}

        {/* Active Project Pill */}
        {activeApp === 'qa' && activeProjectId && (
          <div className="hidden min-[420px]:flex items-center gap-1 min-w-0 bg-black/[0.04] border border-black/[0.06] rounded-full py-0.5 px-2">
            <Briefcase size={10} className="text-[#007AFF] shrink-0" />
            <span className="text-[10px] font-medium text-[#1D1D1F] truncate max-w-[65px]">
              {activeProject?.name || 'Project'}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Invite & User Avatar / Options */}
      <div className="flex items-center gap-1.5 shrink-0">
        {activeProjectId && onOpenInviteModal && (
          <button
            onClick={onOpenInviteModal}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/[0.04] hover:bg-black/[0.08] text-[#007AFF] transition-colors apple-press cursor-pointer border border-black/[0.06]"
            title="Invite Collaborator"
          >
            <UserPlus size={13} />
          </button>
        )}

        <button
          onClick={onOpenOptionsSheet}
          className="w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs text-white shadow-xs apple-press cursor-pointer bg-[#007AFF]"
          title="Account & Settings"
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
};
