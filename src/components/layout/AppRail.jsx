import React from 'react';
import { 
  CheckSquare, Bot, Sparkles, Sliders, LogOut, 
  HelpCircle, ShieldCheck, Flame, Layers
} from 'lucide-react';
import { getUserInitial, getUserColor } from '../../utils/formatters';

export const AppRail = ({
  activeApp = 'qa', // 'qa' | 'sales'
  setActiveApp,
  openBugsCount = 0,
  pendingOutboxCount = 0,
  currentUser,
  onLogout
}) => {
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');
  const userColor = getUserColor(currentUser?.email || 'user');

  return (
    <nav 
      aria-label="InfratechAI App Dock"
      className="hidden md:flex w-[68px] flex-col items-center justify-between py-4 bg-slate-950 border-r border-slate-800 shrink-0 z-30 select-none"
    >
      {/* Top: Suite Brand Logo */}
      <div className="flex flex-col items-center gap-4">
        <div 
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 p-2 cursor-pointer group"
          title="InfratechAI Enterprise Suite"
        >
          <img 
            src="/qa-logo.png" 
            alt="InfratechAI" 
            className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform" 
          />
        </div>

        <div className="w-8 h-[1px] bg-slate-800/80 my-1" />

        {/* Primary Apps */}
        <div className="flex flex-col items-center gap-3">
          
          {/* APPS LIBRARY / HUB */}
          <button
            onClick={() => setActiveApp('hub')}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer group ${
              activeApp === 'hub'
                ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Apps Hub"
          >
            {activeApp === 'hub' && (
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-400 rounded-r-full shadow-sm" />
            )}
            <Layers className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Apps Hub
            </span>
          </button>

          {/* APP 1: QA MANAGER */}
          <button
            onClick={() => setActiveApp('qa')}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer group ${
              activeApp === 'qa'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="QA Manager — Test Execution & Bug Tracking"
          >
            {/* Active Pill Bar Indicator */}
            {activeApp === 'qa' && (
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-r-full shadow-sm" />
            )}

            <CheckSquare className="w-5 h-5 transition-transform group-hover:scale-110" />

            {/* Bugs Badge */}
            {openBugsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-sm border border-slate-950">
                {openBugsCount}
              </span>
            )}

            {/* Hover Tooltip */}
            <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              QA Manager
            </span>
          </button>

          {/* APP 2: SALES MANAGER (HARVEY AI SDR) */}
          <button
            onClick={() => setActiveApp('sales')}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer group ${
              activeApp === 'sales'
                ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Sales Manager — Harvey Autonomous AI SDR"
          >
            {/* Active Pill Bar Indicator */}
            {activeApp === 'sales' && (
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-400 rounded-r-full shadow-sm" />
            )}

            <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />

            {/* Outbox Pending Approvals Badge */}
            {pendingOutboxCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-sm border border-slate-950 animate-pulse">
                {pendingOutboxCount}
              </span>
            )}

            {/* Hover Tooltip */}
            <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Sales Manager (Harvey)
            </span>
          </button>

        </div>
      </div>

      {/* Bottom: Heartbeat pulse & User Profile */}
      <div className="flex flex-col items-center gap-3">
        {/* Harvey Heartbeat Pulse Indicator */}
        <div 
          className="flex flex-col items-center gap-1 group relative cursor-pointer"
          title="Harvey Engine Heartbeat: Live & Listening"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="absolute left-14 bottom-0 px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 text-[11px] font-mono whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Engine Heartbeat: Online
          </span>
        </div>

        <div className="w-8 h-[1px] bg-slate-800/80 my-1" />

        {/* User Avatar */}
        <div 
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-white/10 ${userColor?.badge || 'bg-indigo-600'}`}
          title={currentUser?.email || 'User Profile'}
        >
          {userInitial}
        </div>
      </div>
    </nav>
  );
};
