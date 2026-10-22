import React, { useRef } from 'react';
import { 
  Briefcase, LayoutDashboard, Play, Bug as BugIcon, 
  List, Plus, Sparkles, X, ChevronRight, UserPlus, 
  CloudRain, Download, UploadCloud, LogOut, FileText,
  BookOpen, Layers, Mail, Users, MessageSquare,
  Building2, Clock, Activity, Radio, Phone,
  Cpu, Bot, Sliders, Volume2, VolumeX, RotateCcw,
  RefreshCw, CheckCircle2
} from 'lucide-react';

export const MobileBottomNav = ({
  activeApp = 'qa',
  activeTab,
  setActiveTab,
  salesTab = 'cockpit',
  setSalesTab,
  pendingOutboxCount = 0,
  businessTab = 'portfolio',
  setBusinessTab,
  contractsCount = 0,
  expiringSoonCount = 0,
  onTriggerAddContract,
  aidevTab = 'chat',
  setAidevTab,
  isLiveCallActive = false,
  onToggleLiveCall,
  agentVoice = 'jarvis',
  onToggleAgentVoice,
  speechLang = 'hi-IN',
  onToggleSpeechLang,
  isVoiceEnabled = true,
  onToggleVoiceEnabled,
  onResetConversation,
  activeProjectId,
  activeProject,
  projects = [],
  onSelectProject,
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
  onSwitchApp
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

  const ensureProjectThen = (tabName) => {
    if (!activeProjectId && projects && projects.length > 0 && onSelectProject) {
      onSelectProject(projects[0].id);
    }
    setActiveTab(tabName);
  };

  // 1. QA Manager Navigation Items
  const qaNavItems = [
    {
      id: 'projects',
      label: 'Projects',
      icon: Briefcase,
      onClick: () => {
        if (activeProjectId) {
          onExitProject();
        } else {
          setActiveTab('projects');
        }
      },
      isActive: activeTab === 'projects',
      disabled: false,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => ensureProjectThen('dashboard'),
      isActive: activeTab === 'dashboard',
      disabled: false,
    },
    {
      id: 'execute',
      label: 'Execute',
      icon: Play,
      onClick: () => ensureProjectThen('execute'),
      isActive: activeTab === 'execute',
      disabled: false,
    },
    {
      id: 'bugs',
      label: 'Bugs',
      icon: BugIcon,
      badge: openBugsCount > 0 ? openBugsCount : null,
      onClick: () => ensureProjectThen('bugs'),
      isActive: activeTab === 'bugs',
      disabled: false,
    },
    {
      id: 'files',
      label: 'Suites',
      icon: List,
      onClick: () => ensureProjectThen('files'),
      isActive: activeTab === 'files' || activeTab === 'import',
      disabled: false,
    },
  ];

  // 2. Sales Manager Navigation Items
  const salesNavItems = [
    {
      id: 'cockpit',
      label: 'Cockpit',
      icon: LayoutDashboard,
      onClick: () => setSalesTab && setSalesTab('cockpit'),
      isActive: salesTab === 'cockpit',
      disabled: false,
    },
    {
      id: 'outbox',
      label: 'Outbox',
      icon: Mail,
      badge: pendingOutboxCount > 0 ? pendingOutboxCount : null,
      badgeColor: 'amber',
      onClick: () => setSalesTab && setSalesTab('outbox'),
      isActive: salesTab === 'outbox',
      disabled: false,
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users,
      onClick: () => setSalesTab && setSalesTab('leads'),
      isActive: salesTab === 'leads',
      disabled: false,
    },
    {
      id: 'campaigns',
      label: 'Playbooks',
      icon: Layers,
      onClick: () => setSalesTab && setSalesTab('campaigns'),
      isActive: salesTab === 'campaigns',
      disabled: false,
    },
    {
      id: 'conversations',
      label: 'Inbound',
      icon: MessageSquare,
      onClick: () => setSalesTab && setSalesTab('conversations'),
      isActive: salesTab === 'conversations',
      disabled: false,
    },
  ];

  // 3. Business Command Center Navigation Items
  const businessNavItems = [
    {
      id: 'portfolio',
      label: 'Accounts',
      icon: Building2,
      badge: contractsCount > 0 ? contractsCount : null,
      onClick: () => setBusinessTab && setBusinessTab('portfolio'),
      isActive: businessTab === 'portfolio',
      disabled: false,
    },
    {
      id: 'renewals',
      label: 'Renewals',
      icon: Clock,
      badge: expiringSoonCount > 0 ? expiringSoonCount : null,
      badgeColor: 'amber',
      onClick: () => setBusinessTab && setBusinessTab('renewals'),
      isActive: businessTab === 'renewals',
      disabled: false,
    },
    {
      id: 'scope',
      label: 'Scopes',
      icon: FileText,
      onClick: () => setBusinessTab && setBusinessTab('scope'),
      isActive: businessTab === 'scope',
      disabled: false,
    },
    {
      id: 'analytics',
      label: 'SLA Matrix',
      icon: Activity,
      onClick: () => setBusinessTab && setBusinessTab('analytics'),
      isActive: businessTab === 'analytics',
      disabled: false,
    },
  ];

  // 4. AI Dev Copilot Navigation Items
  const aidevNavItems = [
    {
      id: 'chat',
      label: 'Copilot',
      icon: Sparkles,
      onClick: () => setAidevTab && setAidevTab('chat'),
      isActive: aidevTab === 'chat',
      disabled: false,
    },
    {
      id: 'voice',
      label: isLiveCallActive ? 'Live Talking' : 'Live Talk',
      icon: Radio,
      badge: isLiveCallActive ? '●' : null,
      badgeColor: 'rose',
      onClick: () => onToggleLiveCall && onToggleLiveCall(),
      isActive: isLiveCallActive,
      disabled: false,
    },
    {
      id: 'voice_toggle',
      label: agentVoice === 'friday' ? 'FRIDAY' : 'JARVIS',
      icon: Cpu,
      onClick: () => onToggleAgentVoice && onToggleAgentVoice(),
      isActive: false,
      disabled: false,
    },
    {
      id: 'telemetry',
      label: 'Telemetry',
      icon: Activity,
      onClick: () => setAidevTab && setAidevTab('telemetry'),
      isActive: aidevTab === 'telemetry',
      disabled: false,
    },
  ];

  // Determine active item set
  const navItems = 
    activeApp === 'sales' ? salesNavItems :
    activeApp === 'business' ? businessNavItems :
    activeApp === 'aidev' ? aidevNavItems :
    qaNavItems;

  // Active theme gradient for center action button
  const centerButtonGradient = 
    activeApp === 'business'
      ? 'from-emerald-600 via-teal-600 to-emerald-500 shadow-emerald-500/40'
      : activeApp === 'sales'
        ? 'from-amber-500 via-orange-600 to-amber-600 shadow-amber-500/40'
        : activeApp === 'aidev'
          ? agentVoice === 'friday'
            ? 'from-rose-600 via-pink-600 to-rose-500 shadow-rose-500/40'
            : 'from-cyan-500 via-blue-600 to-cyan-400 shadow-cyan-500/40'
          : 'from-indigo-600 via-violet-600 to-fuchsia-500 shadow-indigo-500/40';

  const centerIconColor =
    activeApp === 'aidev' && agentVoice !== 'friday' ? 'text-black' : 'text-white';

  const activeAppLabel =
    activeApp === 'business' ? 'Business Operations' :
    activeApp === 'sales' ? 'Sales Manager (Harvey)' :
    activeApp === 'aidev' ? `${agentVoice === 'friday' ? 'FRIDAY' : 'JARVIS'} Copilot` :
    (activeProject ? activeProject.name : 'InfratechAI QA Suite');

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
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] inset-x-3 max-w-lg mx-auto z-40 md:hidden glass-dock rounded-3xl p-1.5 flex items-center justify-between"
        aria-label="Mobile Navigation Dock"
      >
        {/* Left items */}
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
              <div className="relative">
                <Icon size={18} className={item.isActive ? (activeApp === 'business' ? 'text-emerald-400' : activeApp === 'aidev' ? 'text-cyan-400' : 'text-indigo-400') : ''} />
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 min-w-[15px] h-[15px] rounded-full text-white text-[9px] font-black flex items-center justify-center px-1 shadow-sm ${
                    item.badgeColor === 'amber' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">{item.label}</span>
              {item.isActive && (
                <span className={`w-1 h-1 rounded-full absolute bottom-1 ${activeApp === 'business' ? 'bg-emerald-400' : activeApp === 'aidev' ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
              )}
            </button>
          );
        })}

        {/* Center Glowing Action Trigger */}
        <div className="px-1 shrink-0">
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active-spring relative ${
              isOptionsOpen
                ? 'bg-rose-600 text-white rotate-45 shadow-rose-500/40'
                : `bg-gradient-to-tr ${centerButtonGradient} hover:scale-105 active:scale-95`
            }`}
            title="Open Quick Options"
            aria-label="Toggle Options Menu"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
            {isOptionsOpen ? (
              <X size={22} className="shrink-0 text-white" />
            ) : activeApp === 'business' ? (
              <Building2 size={20} className="shrink-0 text-white" />
            ) : activeApp === 'sales' ? (
              <Bot size={20} className="shrink-0 text-white" />
            ) : activeApp === 'aidev' ? (
              <Radio size={20} className={`shrink-0 ${centerIconColor}`} />
            ) : (
              <Sparkles size={20} className="shrink-0 text-white animate-pulse" />
            )}
          </button>
        </div>

        {/* Right items */}
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
                <Icon size={18} className={item.isActive ? (activeApp === 'business' ? 'text-emerald-400' : activeApp === 'aidev' ? 'text-cyan-400' : 'text-indigo-400') : ''} />
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 min-w-[15px] h-[15px] rounded-full text-white text-[9px] font-black flex items-center justify-center px-1 shadow-sm ${
                    item.badgeColor === 'amber' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">{item.label}</span>
              {item.isActive && (
                <span className={`w-1 h-1 rounded-full absolute bottom-1 ${activeApp === 'business' ? 'bg-emerald-400' : activeApp === 'aidev' ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
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
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl bg-gradient-to-tr ${centerButtonGradient} text-white`}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">Quick Actions & Options</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                    {activeAppLabel}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOptionsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors active-spring cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1-Tap App Switcher Capsule inside Sheet */}
            {onSwitchApp && (
              <div className="mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 block mb-1.5">
                  Switch Active Workspace
                </span>
                <div className="grid grid-cols-4 gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
                  <button
                    onClick={() => { onSwitchApp('qa'); setIsOptionsOpen(false); }}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      activeApp === 'qa' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    QA Manager
                  </button>
                  <button
                    onClick={() => { onSwitchApp('sales'); setIsOptionsOpen(false); }}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      activeApp === 'sales' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sales AI
                  </button>
                  <button
                    onClick={() => { onSwitchApp('business'); setIsOptionsOpen(false); }}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      activeApp === 'business' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Business
                  </button>
                  <button
                    onClick={() => { onSwitchApp('aidev'); setIsOptionsOpen(false); }}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      activeApp === 'aidev' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Dev
                  </button>
                </div>
              </div>
            )}

            {/* Options List Body */}
            <div className="space-y-4">
              
              {/* ======================================================== */}
              {/* APP 1: BUSINESS OPERATIONS QUICK ACTIONS                */}
              {/* ======================================================== */}
              {activeApp === 'business' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 px-1">
                    Business Operations
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (onTriggerAddContract) onTriggerAddContract();
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-emerald-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Plus size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Add Client Contract</p>
                        <p className="text-[10px] text-slate-400">New retainer & SLA</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (setBusinessTab) setBusinessTab('renewals');
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-amber-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Renewal Deadlines</p>
                        <p className="text-[10px] text-slate-400">{expiringSoonCount} expiring soon</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (setBusinessTab) setBusinessTab('analytics');
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-teal-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <Activity size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">SLA Matrix & MRR</p>
                        <p className="text-[10px] text-slate-400">Guarantees & retainers</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (onSwitchApp) onSwitchApp('qa');
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-indigo-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">QA Workspace Link</p>
                        <p className="text-[10px] text-slate-400">View linked test runs</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* APP 2: SALES MANAGER (HARVEY AI) QUICK ACTIONS           */}
              {/* ======================================================== */}
              {activeApp === 'sales' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 px-1">
                    Sales Pipeline Actions
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (setSalesTab) setSalesTab('leads');
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-amber-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Plus size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Add Prospect</p>
                        <p className="text-[10px] text-slate-400">Manual or AI discovery</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (setSalesTab) setSalesTab('outbox');
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-indigo-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Review Outbox</p>
                        <p className="text-[10px] text-slate-400">{pendingOutboxCount} awaiting review</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* APP 3: AI DEV (JARVIS/FRIDAY) QUICK ACTIONS              */}
              {/* ======================================================== */}
              {activeApp === 'aidev' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 px-1">
                    Vocal Copilot Controls
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        if (onToggleLiveCall) onToggleLiveCall();
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-cyan-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <Radio size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          {isLiveCallActive ? 'Terminate Vocal Call' : 'Launch Live Talk'}
                        </p>
                        <p className="text-[10px] text-slate-400">Full-duplex conversation</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (onToggleAgentVoice) onToggleAgentVoice();
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-pink-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        <Cpu size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Switch Voice</p>
                        <p className="text-[10px] text-slate-400">
                          Now: {agentVoice === 'friday' ? 'FRIDAY (Female)' : 'JARVIS (Male)'}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (onToggleSpeechLang) onToggleSpeechLang(speechLang === 'hi-IN' ? 'en-US' : 'hi-IN');
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-indigo-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Language</p>
                        <p className="text-[10px] text-slate-400">
                          Mode: {speechLang === 'hi-IN' ? 'Hindi / Hinglish' : 'English'}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (onToggleVoiceEnabled) onToggleVoiceEnabled();
                      }}
                      className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-violet-500/40 active-spring transition-all cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Audio Output</p>
                        <p className="text-[10px] text-slate-400">
                          {isVoiceEnabled ? 'Speech ON' : 'Speech MUTED'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* APP 4: QA MANAGER QUICK ACTIONS                          */}
              {/* ======================================================== */}
              {activeApp === 'qa' && (
                activeProjectId ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 px-1">
                      Testing Actions
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setIsOptionsOpen(false);
                          setActiveTab('files');
                          if (onTriggerNewFile) onTriggerNewFile();
                        }}
                        className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-indigo-500/40 active-spring transition-all cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <Plus size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">New Test Suite</p>
                          <p className="text-[10px] text-slate-400">Add or copy file</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsOptionsOpen(false);
                          setActiveTab('files');
                        }}
                        className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-violet-500/40 active-spring transition-all cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">Bulk Import</p>
                          <p className="text-[10px] text-slate-400">Parse plain text</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsOptionsOpen(false);
                          setActiveTab('bugs');
                          if (onTriggerNewBug) onTriggerNewBug();
                        }}
                        className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-rose-500/40 active-spring transition-all cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <BugIcon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">Report Bug</p>
                          <p className="text-[10px] text-slate-400">Log defect/issue</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsOptionsOpen(false);
                          if (onOpenInviteModal) onOpenInviteModal();
                        }}
                        className="p-3 rounded-2xl glass-card flex flex-col items-start gap-1.5 text-left border border-white/10 hover:border-emerald-500/40 active-spring transition-all cursor-pointer"
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

                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setActiveTab('reports');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl glass-card flex items-center justify-between border border-white/10 hover:border-indigo-500/30 text-white active-spring cursor-pointer"
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
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-1">
                    <p className="text-xs font-bold text-indigo-200">No Active Project Selected</p>
                    <p className="text-[11px] text-slate-400">
                      Open or create a project to access test execution, bug logging, and team suites.
                    </p>
                  </div>
                )
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
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-slate-200 active-spring transition-colors cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-slate-200 active-spring transition-colors cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-slate-200 active-spring transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <UploadCloud size={16} className="text-amber-400" />
                      <span className="text-xs font-semibold">Restore from JSON</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>

                  {/* Switch / Exit Project */}
                  {activeApp === 'qa' && activeProjectId && (
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        onExitProject();
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 text-indigo-300 active-spring transition-colors cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 active-spring cursor-pointer"
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
