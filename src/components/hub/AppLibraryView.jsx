import React, { useState } from 'react';
import { 
  Play, Bot, CheckSquare, Sparkles, Shield, ArrowRight, 
  Layers, CheckCircle2, Cpu, Globe, Sliders, LogOut,
  ChevronRight, RefreshCw, Briefcase, Zap, Flame, ExternalLink
} from 'lucide-react';
import { getUserInitial, getUserColor } from '../../utils/formatters';

export const AppLibraryView = ({
  onLaunchApp,
  projects = [],
  openBugsCount = 0,
  pendingOutboxCount = 0,
  currentUser,
  onLogout,
  onOpenSettings
}) => {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'qa' | 'sales'
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');
  const userColor = getUserColor(currentUser?.email || 'user');

  const apps = [
    {
      id: 'qa',
      name: 'InfratechAI QA Manager',
      category: 'Quality Engineering',
      description: 'High-velocity test execution with Linear-style hotkeys (P/F/B), full defect lifecycle tracking, test suites management, and real-time Firebase collaboration.',
      icon: CheckSquare,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      badge: 'Core Installed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      metrics: [
        { label: 'Workspaces', value: `${projects.length} Active` },
        { label: 'Defects', value: `${openBugsCount} Open`, highlight: openBugsCount > 0 },
        { label: 'Cloud Sync', value: 'Live' }
      ],
      features: [
        'Linear-style Hotkeys (P: Pass, F: Fail, B: Block)',
        'Defect Tracking with Severity & Lifecycle',
        'Real-time Multi-User Cloud Collaboration'
      ],
      ctaText: 'Launch QA Manager',
      isReady: true
    },
    {
      id: 'sales',
      name: 'Sales Manager (Harvey AI SDR)',
      category: 'Autonomous Sales AI',
      description: 'Autonomous B2B outbound prospecting engine. Discovers website buying signals, crafts hyper-personalized sequences, and queues human-vetted drafts in the Decisions Desk.',
      icon: Bot,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badge: 'Autonomous SDR Active',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      metrics: [
        { label: 'Outbox Desk', value: `${pendingOutboxCount} Pending`, highlight: pendingOutboxCount > 0 },
        { label: 'SDR Engine', value: 'Infratech Neural' },
        { label: 'Model Cost', value: '$0.00' }
      ],
      features: [
        'Harvey Decisions Desk (Keyboard A / R Approval)',
        'Anti-AI Fluff Policy (Banned robotic phrases)',
        'Inbound Replies & LAARC Objection Handling'
      ],
      ctaText: 'Launch Sales Manager',
      isReady: true
    },
    {
      id: 'sentinel',
      name: 'DevOps Release Sentinel',
      category: 'CI/CD & Deployment',
      description: 'Continuous staging regression analysis, automated canary rollouts verification, and deployment readiness scoring before promoting builds.',
      icon: Cpu,
      iconBg: 'bg-slate-100 text-slate-500 border border-slate-200',
      badge: 'Roadmap Preview',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      metrics: [
        { label: 'Integrations', value: 'GitHub Actions' },
        { label: 'Readiness', value: '99.8%' },
        { label: 'Status', value: 'Preview' }
      ],
      features: [
        'Automated Canary Health Assessment',
        'Staging Deployment Blockers Auto-Flagging',
        'Zero-Config Webhook Integrations'
      ],
      ctaText: 'Preview Roadmap',
      isReady: false
    }
  ];

  const filteredApps = apps.filter(app => {
    if (activeFilter === 'qa') return app.id === 'qa';
    if (activeFilter === 'sales') return app.id === 'sales';
    return true;
  });

  return (
    <div className="w-full min-h-full bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Clean Executive Header */}
      <header className="bg-white border-b border-slate-200/90 px-6 sm:px-10 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <img 
            src="/qa-logo.png" 
            alt="InfratechAI" 
            className="w-9 h-9 object-contain shrink-0 rounded-lg shadow-2xs" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                InfratechAI
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Suite Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Enterprise Unified Application Platform</p>
          </div>
        </div>

        {/* Right status & profile */}
        <div className="flex items-center gap-3">
          
          {/* System Engine Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">System:</span>
            <span className="font-bold text-slate-800">InfratechAI Neural Engine</span>
          </div>

          {/* User Capsule */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xs ${userColor?.badge || 'bg-indigo-600'}`}>
              {userInitial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[150px]">
                {currentUser?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                {currentUser?.email || 'Logged In'}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-8 space-y-8 animate-fadeIn">
        
        {/* Hero Section (Matching ProjectsView Header exactly) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Applications & Workspaces
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Select an enterprise application below to launch its workspace.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Modules ({apps.length})
            </button>
            <button
              onClick={() => setActiveFilter('qa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'qa'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              QA Engineering
            </button>
            <button
              onClick={() => setActiveFilter('sales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'sales'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Autonomous Sales AI
            </button>
          </div>
        </div>

        {/* Clean Application Cards Grid (Matching ProjectsView Card Language) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                onClick={() => app.isReady && onLaunchApp(app.id)}
                className={`group p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[340px] ${
                  app.isReady
                    ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg cursor-pointer'
                    : 'bg-slate-50/80 border-slate-200/60 opacity-80 cursor-default'
                }`}
              >
                {/* Card Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl shadow-2xs ${app.iconBg} group-hover:scale-105 transition-transform`}>
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${app.badgeClass}`}>
                      {app.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                      {app.category}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {app.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  {/* Clean Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100">
                    {app.metrics.map((m, idx) => (
                      <div key={idx} className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          {m.label}
                        </span>
                        <span className={`text-xs font-bold ${m.highlight ? 'text-amber-600' : 'text-slate-800'}`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Highlights checklist */}
                  <div className="space-y-1.5 pt-1">
                    {app.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <CheckCircle2 size={13} className="text-indigo-500 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    disabled={!app.isReady}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      app.isReady
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs group-hover:shadow-md'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Play size={13} className="fill-current" />
                      <span>{app.ctaText}</span>
                    </div>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </main>

    </div>
  );
};
