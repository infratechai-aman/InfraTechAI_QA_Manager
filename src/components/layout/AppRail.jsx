import React from 'react';
import { 
  CheckSquare, Bot, Layers, Building2, Cpu
} from 'lucide-react';
import { getUserInitial, getUserColor } from '../../utils/formatters';

export const AppRail = ({
  activeApp = 'qa', // 'qa' | 'sales' | 'business' | 'aidev' | 'hub'
  setActiveApp,
  openBugsCount = 0,
  pendingOutboxCount = 0,
  contractsExpiringSoon = 0,
  currentUser,
  onLogout
}) => {
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');
  const userColor = getUserColor(currentUser?.email || 'user');

  return (
    <nav 
      aria-label="macOS App Dock"
      className="hidden md:flex w-[68px] h-full flex-col items-center justify-between py-3 mac-sidebar select-none shrink-0 z-30 transition-colors"
    >
      {/* Top: Suite Brand App Icon */}
      <div className="flex flex-col items-center gap-3">
        <button 
          onClick={() => setActiveApp('hub')}
          className="w-10 h-10 rounded-[12px] bg-gradient-to-b from-white to-[#F2F2F7] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.08)] p-1.5 cursor-pointer apple-press group"
          title="InfratechAI Launchpad"
        >
          <img 
            src="/qa-logo.png" 
            alt="InfratechAI" 
            className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform" 
          />
        </button>

        <div className="w-8 h-[1px] bg-black/[0.08] my-0.5" />

        {/* Primary Apps */}
        <div className="flex flex-col items-center gap-2.5">
          
          {/* APPS LIBRARY / HUB */}
          <button
            onClick={() => setActiveApp('hub')}
            className={`relative w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-150 cursor-pointer apple-press group ${
              activeApp === 'hub'
                ? 'bg-[#AF52DE] text-white shadow-[0_3px_10px_rgba(175,82,222,0.35)]'
                : 'text-[#636366] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="Launchpad & App Store"
          >
            {activeApp === 'hub' && (
              <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#007AFF] rounded-r-full" />
            )}
            <Layers className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={activeApp === 'hub' ? 2.4 : 1.8} />
            <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#1D1D1F]/95 text-white text-[11px] font-medium whitespace-nowrap shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Apps Launchpad
            </span>
          </button>

          {/* APP 1: QA MANAGER */}
          <button
            onClick={() => setActiveApp('qa')}
            className={`relative w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-150 cursor-pointer apple-press group ${
              activeApp === 'qa'
                ? 'bg-[#007AFF] text-white shadow-[0_3px_10px_rgba(0,122,255,0.35)]'
                : 'text-[#636366] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="QA Manager — Test Execution & Bug Tracking"
          >
            {activeApp === 'qa' && (
              <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#007AFF] rounded-r-full" />
            )}

            <CheckSquare className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={activeApp === 'qa' ? 2.4 : 1.8} />

            {/* Bugs Badge */}
            {openBugsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 apple-badge text-[10px] flex items-center justify-center border border-white">
                {openBugsCount}
              </span>
            )}

            <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#1D1D1F]/95 text-white text-[11px] font-medium whitespace-nowrap shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              QA Manager
            </span>
          </button>

          {/* APP 2: SALES MANAGER (HARVEY AI SDR) */}
          <button
            onClick={() => setActiveApp('sales')}
            className={`relative w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-150 cursor-pointer apple-press group ${
              activeApp === 'sales'
                ? 'bg-[#FF9500] text-white shadow-[0_3px_10px_rgba(255,149,0,0.35)]'
                : 'text-[#636366] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="Sales Manager — Harvey Autonomous AI SDR"
          >
            {activeApp === 'sales' && (
              <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#007AFF] rounded-r-full" />
            )}

            <Bot className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={activeApp === 'sales' ? 2.4 : 1.8} />

            {/* Outbox Pending Approvals Badge */}
            {pendingOutboxCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF9500] text-white font-semibold text-[10px] flex items-center justify-center border border-white shadow-sm">
                {pendingOutboxCount}
              </span>
            )}

            <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#1D1D1F]/95 text-white text-[11px] font-medium whitespace-nowrap shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Sales Manager (Harvey)
            </span>
          </button>

          {/* APP 3: BUSINESS COMMAND CENTER */}
          <button
            onClick={() => setActiveApp('business')}
            className={`relative w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-150 cursor-pointer apple-press group ${
              activeApp === 'business'
                ? 'bg-[#34C759] text-white shadow-[0_3px_10px_rgba(52,199,89,0.35)]'
                : 'text-[#636366] hover:text-[#1D1D1F] hover:bg-black/[0.04]'
            }`}
            title="Business Command Center — Contracts & Scopes"
          >
            {activeApp === 'business' && (
              <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#007AFF] rounded-r-full" />
            )}
            <Building2 className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={activeApp === 'business' ? 2.4 : 1.8} />
            {contractsExpiringSoon > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF9500] text-white font-semibold text-[10px] flex items-center justify-center border border-white shadow-sm">
                {contractsExpiringSoon}
              </span>
            )}
            <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#1D1D1F]/95 text-white text-[11px] font-medium whitespace-nowrap shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Business Command Center
            </span>
          </button>

          {/* APP 4: AI DEV (AUTONOMOUS TECHNICAL COPILOT) */}
          <button
            onClick={() => setActiveApp('aidev')}
            className={`relative w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-150 cursor-pointer apple-press group ${
              activeApp === 'aidev'
                ? 'bg-gradient-to-b from-[#5856D6] to-[#007AFF] text-white shadow-[0_3px_10px_rgba(88,86,214,0.35)]'
                : 'text-[#636366] hover:text-[#007AFF] hover:bg-black/[0.04]'
            }`}
            title="AI DEV — Voice Copilot"
          >
            {activeApp === 'aidev' && (
              <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#007AFF] rounded-r-full" />
            )}
            <Cpu className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={activeApp === 'aidev' ? 2.4 : 1.8} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#34C759] border border-white" />
            <span className="absolute left-16 px-2.5 py-1 rounded-md bg-[#1D1D1F]/95 text-white text-[11px] font-medium whitespace-nowrap shadow-xl backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              AI Dev Copilot
            </span>
          </button>

        </div>
      </div>

      {/* Bottom: Apple System Status & User Profile */}
      <div className="flex flex-col items-center gap-3">
        {/* Heartbeat Status Indicator */}
        <div 
          className="flex flex-col items-center gap-1 group relative cursor-pointer"
          title="Engine Status: Online & Synced"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]"></span>
          </span>
          <span className="absolute left-14 bottom-0 px-2 py-0.5 rounded-md bg-[#1D1D1F]/95 text-[#34C759] text-[10px] font-mono whitespace-nowrap shadow-lg backdrop-blur-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            System Online
          </span>
        </div>

        <div className="w-8 h-[1px] bg-black/[0.08] my-0.5" />

        {/* User Avatar */}
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white shadow-sm ring-1 ring-black/5 bg-[#007AFF]"
          title={currentUser?.email || 'User Account'}
        >
          {userInitial}
        </div>
      </div>
    </nav>
  );
};
