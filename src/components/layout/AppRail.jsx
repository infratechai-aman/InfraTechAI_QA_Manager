import React from 'react';
import {
  CheckSquare, Bot, Layers, Building2, Cpu, Users,
  LayoutGrid, MessageSquare
} from 'lucide-react';
import { getUserInitial } from '../../utils/formatters';

const NAV_ITEMS = [
  { id: 'hub',       label: 'Launchpad',       icon: LayoutGrid,    accent: '#6E7BFF' },
  { id: 'company',   label: 'Virtual Company',  icon: Building2,     accent: '#3ECF8E' },
  { id: 'customers', label: 'Agent Swarm',      icon: Users,         accent: '#4A9EFF' },
  { id: 'qa',        label: 'QA Manager',       icon: CheckSquare,   accent: '#6E7BFF' },
  { id: 'business',  label: 'Business',         icon: MessageSquare, accent: '#F6A943' },
  { id: 'sales',     label: 'Harvey SDR',       icon: Bot,           accent: '#F6A943' },
  { id: 'aidev',     label: 'AI Dev',           icon: Cpu,           accent: '#3ECF8E' },
];

export const AppRail = ({
  activeApp = 'hub',
  setActiveApp,
  openBugsCount = 0,
  pendingOutboxCount = 0,
  contractsExpiringSoon = 0,
  currentUser,
  onLogout
}) => {
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');

  return (
    <nav
      aria-label="App Sidebar"
      className="hidden md:flex w-[220px] h-full flex-col py-4 px-3 cs-sidebar select-none shrink-0 z-30"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-5">
        <div className="w-8 h-8 rounded-[10px] overflow-hidden shrink-0 bg-[#2B2D33] flex items-center justify-center shadow-sm">
          <img src="/qa-logo.png" alt="InfratechAI" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#E5E7EE] leading-none tracking-tight">InfratechAI</p>
          <p className="text-[10px] text-[#50545E] mt-0.5">Workspace</p>
        </div>
      </div>

      {/* Divider */}
      <div className="cs-divider mb-3" />

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon, accent }) => {
          const isActive = activeApp === id;
          const badge =
            id === 'qa'       ? openBugsCount :
            id === 'sales'    ? pendingOutboxCount :
            id === 'business' ? contractsExpiringSoon : 0;

          return (
            <button
              key={id}
              onClick={() => setActiveApp(id)}
              title={label}
              style={isActive ? { '--item-accent': accent } : {}}
              className={`cs-sidebar-item w-full apple-press relative group ${isActive ? 'active' : ''}`}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2.2 : 1.7}
                style={{ color: isActive ? accent : undefined }}
                className="shrink-0"
              />
              <span className="flex-1 text-left">{label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#F25B5B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="cs-divider mb-3" />

      {/* System Status */}
      <div className="px-2 mb-3 flex items-center gap-2">
        <span className="status-dot status-dot-online" />
        <span className="text-[11px] text-[#50545E] font-mono">System Online</span>
      </div>

      {/* User Profile */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] hover:bg-white/[0.04] transition-colors cursor-pointer group"
        title="Sign Out"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs text-white shrink-0"
          style={{ background: '#6E7BFF' }}
        >
          {userInitial}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[12px] font-medium text-[#E5E7EE] truncate leading-none">
            {currentUser?.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-[10px] text-[#50545E] mt-0.5 truncate">
            {currentUser?.email || ''}
          </p>
        </div>
      </button>
    </nav>
  );
};
