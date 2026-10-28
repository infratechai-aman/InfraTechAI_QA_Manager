import React, { useState } from 'react';
import { 
  Play, Bot, CheckSquare, Sparkles, Shield, ArrowRight, 
  Layers, CheckCircle2, Cpu, Globe, Sliders, LogOut,
  ChevronRight, RefreshCw, Briefcase, Zap, Flame, ExternalLink,
  Building2, Users
} from 'lucide-react';
import { getUserInitial, getUserColor } from '../../utils/formatters';
import { businessService } from '../../services/businessService';

export const AppLibraryView = ({
  onLaunchApp,
  projects = [],
  openBugsCount = 0,
  pendingOutboxCount = 0,
  contracts = [],
  currentUser,
  onLogout,
  onOpenSettings
}) => {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'business' | 'aidev' | 'qa' | 'sales'
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');
  const userColor = getUserColor(currentUser?.email || 'user');

  const businessMetrics = businessService.getPortfolioMetrics(contracts);

  const apps = [
    {
      id: 'company',
      name: 'Virtual Company',
      category: 'Autonomous Enterprise Operations',
      description: 'Autonomous enterprise control: Outbound Sales Division (Harvey), Operations Support & Ticket Bot (Sentinel-9), QA telemetry, real-time activity matrix, and daily executive briefing in INR (₹).',
      icon: Building2,
      iconBg: 'bg-[#163B32] text-[#DAF1DE]',
      badge: 'Autonomous HQ',
      badgeClass: 'bg-[#163B32]/10 text-[#163B32] border-[#163B32]/30',
      metrics: [
        { label: 'Departments', value: '4 Active' },
        { label: 'Currency', value: 'INR (₹)' },
        { label: 'Outbox', value: 'Real Live Sync' }
      ],
      features: [
        'Outbound Sales Division (Harvey AI SDR)',
        'Operations & Support Ticket Resolver',
        'QA Engineering Telemetry Integration',
        'Daily Operations Work Logs & Executive Brief'
      ],
      ctaText: 'Enter Desk',
      isReady: true
    },
    {
      id: 'customers',
      name: 'Virtual Customer Swarm',
      category: 'Multi-Agent Market Intelligence',
      description: 'Multi-agent customer archetype simulation in Indian Rupees (₹). Simulates purchasing intent, commercial objections, feature dealbreakers, and pricing elasticity curves.',
      icon: Users,
      iconBg: 'bg-[#225347] text-[#DAF1DE]',
      badge: 'Market Swarm',
      badgeClass: 'bg-[#225347]/10 text-[#225347] border-[#225347]/30',
      metrics: [
        { label: 'Archetypes', value: '5 Personas' },
        { label: 'Currency', value: 'INR (₹)' },
        { label: 'Simulation', value: 'Multi-Round' }
      ],
      features: [
        'Multi-Agent Customer Archetypes (Enterprise, Startup, Agency, SMB)',
        'Candid Decision Logic & Unfiltered Internal Monologues',
        'Commercial Price Elasticity & Willingness-To-Pay (WTP) in ₹',
        'Tactical Objection Diagnosis & Consensus Forecasting'
      ],
      ctaText: 'Launch Simulator',
      isReady: true
    },
    {
      id: 'business',
      name: 'Business Command Center',
      category: 'Enterprise Revenue & SLA',
      description: 'Active client portfolios, contract renewal countdowns, enterprise SLA guarantees, retainers/MRR, and detailed technical project scopes.',
      icon: Building2,
      iconBg: 'bg-gradient-to-b from-[#34C759] to-[#28A745] text-white',
      badge: contracts.length > 0 ? 'Active Portfolio' : 'Ready',
      badgeClass: 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20',
      metrics: [
        { label: 'Accounts', value: `${contracts.length} Active` },
        { label: 'Portfolio MRR', value: `$${businessMetrics.totalMRR.toLocaleString()}` },
        { label: 'Expiring Soon', value: `${businessMetrics.expiringSoonCount}`, highlight: businessMetrics.expiringSoonCount > 0 }
      ],
      features: [
        'Contract Expiration & Renewal Timeline',
        'Project Scopes & Deliverables Checklist',
        'Enterprise SLA Tiers & Retainer Tracking'
      ],
      ctaText: 'Open',
      isReady: true
    },
    {
      id: 'aidev',
      name: 'AI DEV Copilot',
      category: 'Voice Intelligence Engine',
      description: 'Autonomous technical lead with 100% real-time awareness across QA test suites, open defects, sales outbox, and contracts. Voice synthesis via Web Speech.',
      icon: Cpu,
      iconBg: 'bg-gradient-to-b from-[#5856D6] to-[#007AFF] text-white',
      badge: 'Live Voice Active',
      badgeClass: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20',
      metrics: [
        { label: 'Voice Link', value: 'Web Speech' },
        { label: 'Telemetry', value: '100% Live' },
        { label: 'Model Cost', value: '$0.00' }
      ],
      features: [
        'Live Web Speech Audio Engine',
        'Full Multi-App Telemetry Across QA, Sales & Biz',
        'Natural Language Comprehension (Hinglish/English)'
      ],
      ctaText: 'Open',
      isReady: true
    },
    {
      id: 'qa',
      name: 'InfratechAI QA Manager',
      category: 'Quality Engineering',
      description: 'High-velocity test execution with Linear-style hotkeys (P/F/B), full defect lifecycle tracking, test suites management, and real-time Firebase collaboration.',
      icon: CheckSquare,
      iconBg: 'bg-gradient-to-b from-[#007AFF] to-[#0051A8] text-white',
      badge: 'Core Installed',
      badgeClass: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20',
      metrics: [
        { label: 'Workspaces', value: `${projects.length} Active` },
        { label: 'Defects', value: `${openBugsCount} Open`, highlight: openBugsCount > 0 },
        { label: 'iCloud Sync', value: 'Live' }
      ],
      features: [
        'Linear-style Hotkeys (P: Pass, F: Fail, B: Block)',
        'Defect Tracking with Severity & Lifecycle',
        'Real-time Multi-User Cloud Collaboration'
      ],
      ctaText: 'Open',
      isReady: true
    },
    {
      id: 'sales',
      name: 'Sales Manager (Harvey)',
      category: 'Autonomous Sales AI',
      description: 'Autonomous B2B outbound prospecting engine. Discovers website buying signals, crafts hyper-personalized sequences, and queues human-vetted drafts in Decisions Desk.',
      icon: Bot,
      iconBg: 'bg-gradient-to-b from-[#FF9500] to-[#E07A00] text-white',
      badge: 'SDR Engine Active',
      badgeClass: 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20',
      metrics: [
        { label: 'Decisions Desk', value: `${pendingOutboxCount} Pending`, highlight: pendingOutboxCount > 0 },
        { label: 'Engine', value: 'Neural SDR' },
        { label: 'Model Cost', value: '$0.00' }
      ],
      features: [
        'Decisions Desk (Keyboard A / R Approval)',
        'Anti-AI Fluff Policy (Strict Quality Standards)',
        'Inbound Replies & Objection Handling'
      ],
      ctaText: 'Open',
      isReady: true
    },
    {
      id: 'sentinel',
      name: 'DevOps Release Sentinel',
      category: 'CI/CD & Deployment',
      description: 'Continuous staging regression analysis, automated canary rollouts verification, and deployment readiness scoring before promoting builds.',
      icon: Shield,
      iconBg: 'bg-gradient-to-b from-[#8E8E93] to-[#636366] text-white',
      badge: 'Preview',
      badgeClass: 'bg-black/[0.05] text-[#8E8E93] border-black/[0.08]',
      metrics: [
        { label: 'CI/CD', value: 'GitHub Actions' },
        { label: 'Readiness', value: '99.8%' },
        { label: 'Status', value: 'Preview' }
      ],
      features: [
        'Automated Canary Health Assessment',
        'Staging Deployment Blockers Auto-Flagging',
        'Zero-Config Webhook Integrations'
      ],
      ctaText: 'Preview',
      isReady: false
    }
  ];

  const filteredApps = apps.filter(app => {
    if (activeFilter === 'business') return app.id === 'business';
    if (activeFilter === 'aidev') return app.id === 'aidev';
    if (activeFilter === 'qa') return app.id === 'qa';
    if (activeFilter === 'sales') return app.id === 'sales';
    return true;
  });

  return (
    <div className="w-full min-h-full bg-[#F5F5F7] flex flex-col font-sans text-[#1D1D1F]">
      
      {/* Top Apple Navigation Header */}
      <header className="mac-titlebar px-5 sm:px-10 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-white shadow-2xs border border-black/5 p-1 flex items-center justify-center">
            <img 
              src="/qa-logo.png" 
              alt="InfratechAI" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1D1D1F] text-sm tracking-tight">
                InfratechAI Launchpad
              </span>
              <span className="text-[10px] font-medium text-[#007AFF] bg-[#007AFF]/10 border border-[#007AFF]/20 px-2 py-0.5 rounded-full">
                App Store
              </span>
            </div>
            <p className="text-[11px] text-[#86868B]">Enterprise Operations & Engineering</p>
          </div>
        </div>

        {/* Right user & system status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-black/[0.04] border border-black/[0.05] rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span className="text-[#8E8E93]">System:</span>
            <span className="font-medium text-[#1D1D1F]">Neural Core Online</span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs text-white bg-[#007AFF] shadow-xs">
              {userInitial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-[#1D1D1F] leading-none truncate max-w-[140px]">
                {currentUser?.email?.split('@')[0] || 'User'}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-md transition-colors cursor-pointer ml-1"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Launchpad Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-10 py-6 sm:py-8 pb-24 sm:pb-10 space-y-6 animate-fadeIn">
        
        {/* Apple Segmented Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/[0.06]">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] tracking-tight">
              Ecosystem Applications
            </h1>
            <p className="text-[#86868B] mt-0.5 text-xs sm:text-sm">
              Launch enterprise workspaces, AI copilots and defect suites.
            </p>
          </div>

          {/* Apple Segmented Switcher */}
          <div className="mac-segmented self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFilter('all')}
              className={`mac-segmented-item cursor-pointer apple-press ${activeFilter === 'all' ? 'mac-segmented-item-active' : ''}`}
            >
              All ({apps.length})
            </button>
            <button
              onClick={() => setActiveFilter('qa')}
              className={`mac-segmented-item cursor-pointer apple-press ${activeFilter === 'qa' ? 'mac-segmented-item-active' : ''}`}
            >
              QA Manager
            </button>
            <button
              onClick={() => setActiveFilter('sales')}
              className={`mac-segmented-item cursor-pointer apple-press ${activeFilter === 'sales' ? 'mac-segmented-item-active' : ''}`}
            >
              Sales AI
            </button>
            <button
              onClick={() => setActiveFilter('business')}
              className={`mac-segmented-item cursor-pointer apple-press ${activeFilter === 'business' ? 'mac-segmented-item-active' : ''}`}
            >
              Business
            </button>
            <button
              onClick={() => setActiveFilter('aidev')}
              className={`mac-segmented-item cursor-pointer apple-press ${activeFilter === 'aidev' ? 'mac-segmented-item-active' : ''}`}
            >
              AI Dev
            </button>
          </div>
        </div>

        {/* Application Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                onClick={() => app.isReady && onLaunchApp(app.id)}
                className={`group p-5 rounded-[20px] transition-all duration-200 flex flex-col justify-between min-h-[320px] border ${
                  app.isReady
                    ? 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.07)] cursor-pointer apple-press'
                    : 'bg-white/60 border-black/[0.04] opacity-70 cursor-default'
                }`}
              >
                {/* Card Header with Squircle Icon */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center p-2.5 ${app.iconBg} group-hover:scale-105 transition-transform`}>
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${app.badgeClass}`}>
                      {app.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-0.5">
                      {app.category}
                    </span>
                    <h2 className="text-base font-semibold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors">
                      {app.name}
                    </h2>
                    <p className="text-xs text-[#86868B] mt-1.5 line-clamp-3 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  {/* Clean Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-black/[0.05]">
                    {app.metrics.map((m, idx) => (
                      <div key={idx} className="text-center">
                        <span className="text-[9px] font-medium text-[#8E8E93] uppercase tracking-wider block">
                          {m.label}
                        </span>
                        <span className={`text-xs font-semibold ${m.highlight ? 'text-[#FF9500]' : 'text-[#1D1D1F]'}`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Highlights checklist */}
                  <div className="space-y-1 pt-0.5">
                    {app.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-[11px] text-[#636366]">
                        <CheckCircle2 size={13} className="text-[#007AFF] shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom CTA — Apple App Store Style Pill Button */}
                <div className="pt-4 mt-3 border-t border-black/[0.05] flex items-center justify-between">
                  <span className="text-xs text-[#8E8E93] font-medium">Free • Workspace</span>
                  <button
                    disabled={!app.isReady}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all apple-press cursor-pointer flex items-center gap-1.5 ${
                      app.isReady
                        ? 'bg-[#007AFF] hover:bg-[#0071E3] text-white shadow-xs'
                        : 'bg-black/[0.05] text-[#AEAEB2] cursor-not-allowed'
                    }`}
                  >
                    <span>{app.ctaText}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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
