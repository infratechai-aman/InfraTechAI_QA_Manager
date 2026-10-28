import React, { useState, useEffect } from 'react';
import {
  Play, Bot, CheckSquare, Sparkles, Shield, ArrowRight,
  LayoutGrid, Cpu, Globe, LogOut, Building2, Users,
  CheckCircle2, Zap, Lock, Activity, MessageSquare
} from 'lucide-react';
import { getUserInitial } from '../../utils/formatters';
import { businessService } from '../../services/businessService';

/* ──────────────────────────────────────────────────────────
   APP CATALOG
   ────────────────────────────────────────────────────────── */
const makeApps = (projects, openBugsCount, pendingOutboxCount, contracts) => {
  const biz = businessService.getPortfolioMetrics(contracts);
  return [
    {
      id: 'company',
      name: 'Virtual Company',
      category: 'Autonomous Enterprise',
      description: '14 autonomous GSTACK departments, full agentic mission dispatch, daily executive briefing in ₹ INR.',
      icon: Building2,
      color: '#3ECF8E',
      status: 'Live',
      statusVariant: 'green',
      metrics: [{ l: 'Departments', v: '14 Active' }, { l: 'Agents', v: '14 AI Leads' }, { l: 'Currency', v: '₹ INR' }],
      features: ['14 GSTACK Autonomous Dept. Leads', 'Agentic Mission Dispatcher', 'Daily Operations Report'],
    },
    {
      id: 'customers',
      name: 'Virtual Customer Swarm',
      category: 'Market Intelligence',
      description: '64 named agentic agents across 8 market sectors. Simulate pricing elasticity, feature debates, and NPS in ₹.',
      icon: Users,
      color: '#4A9EFF',
      status: 'Live',
      statusVariant: 'blue',
      metrics: [{ l: 'Agents', v: '64 Named' }, { l: 'Sectors', v: '8 Industries' }, { l: 'Rounds', v: '3-Round Sim' }],
      features: ['64 Distinct Customer Archetypes', '₹ WTP & Pricing Elasticity Curves', '1-on-1 Founder Chat'],
    },
    {
      id: 'qa',
      name: 'QA Manager',
      category: 'Quality Engineering',
      description: 'Test execution with Linear-style hotkeys, full defect lifecycle, real-time Firebase collaboration.',
      icon: CheckSquare,
      color: '#6E7BFF',
      status: openBugsCount > 0 ? `${openBugsCount} Open Bugs` : 'All Clear',
      statusVariant: openBugsCount > 0 ? 'amber' : 'green',
      metrics: [{ l: 'Projects', v: `${projects.length} Active` }, { l: 'Defects', v: `${openBugsCount} Open`, highlight: openBugsCount > 0 }, { l: 'Sync', v: 'Live' }],
      features: ['Hotkeys: P Pass · F Fail · B Block', 'Defect Tracking & Severity', 'Multi-User Collaboration'],
    },
    {
      id: 'business',
      name: 'Business Command',
      category: 'Revenue & SLA',
      description: 'Client portfolios, contract renewals, MRR tracking, and technical project scopes.',
      icon: MessageSquare,
      color: '#F6A943',
      status: biz.expiringSoonCount > 0 ? `${biz.expiringSoonCount} Expiring` : 'Portfolio Active',
      statusVariant: biz.expiringSoonCount > 0 ? 'amber' : 'green',
      metrics: [{ l: 'Accounts', v: `${contracts.length} Active` }, { l: 'MRR', v: `₹${biz.totalMRR?.toLocaleString('en-IN') || '0'}` }, { l: 'Expiring', v: `${biz.expiringSoonCount}`, highlight: biz.expiringSoonCount > 0 }],
      features: ['Contract Expiration Timeline', 'SLA Tiers & Retainer Tracking', 'Project Scopes Checklist'],
    },
    {
      id: 'aidev',
      name: 'AI Dev Copilot',
      category: 'Voice Intelligence',
      description: 'Autonomous technical lead with real-time awareness across QA, sales, and contracts. Voice synthesis via Web Speech.',
      icon: Cpu,
      color: '#A78BFA',
      status: 'Voice Active',
      statusVariant: 'purple',
      metrics: [{ l: 'Engine', v: 'Web Speech' }, { l: 'Telemetry', v: '100% Live' }, { l: 'Cost', v: '₹0' }],
      features: ['Live Web Speech Audio', 'Full Multi-App Telemetry', 'Hinglish / English NLP'],
    },
    {
      id: 'sales',
      name: 'Harvey (Sales AI)',
      category: 'Autonomous SDR',
      description: 'B2B outbound prospecting engine. Discovers buying signals, crafts personalised sequences, queues drafts for approval.',
      icon: Bot,
      color: '#F6A943',
      status: pendingOutboxCount > 0 ? `${pendingOutboxCount} Pending` : 'SDR Active',
      statusVariant: pendingOutboxCount > 0 ? 'amber' : 'green',
      metrics: [{ l: 'Outbox', v: `${pendingOutboxCount} Pending`, highlight: pendingOutboxCount > 0 }, { l: 'Engine', v: 'Neural SDR' }, { l: 'Cost', v: '₹0' }],
      features: ['Decisions Desk (A/R Approval)', 'Anti-AI Fluff Policy', 'Inbound Objection Handling'],
    },
    {
      id: 'sentinel',
      name: 'DevOps Sentinel',
      category: 'CI/CD & Deployment',
      description: 'Staging regression analysis, automated canary rollouts, and deployment readiness scoring.',
      icon: Shield,
      color: '#9AA0AC',
      status: 'Preview',
      statusVariant: 'muted',
      metrics: [{ l: 'CI/CD', v: 'GitHub Actions' }, { l: 'Readiness', v: '99.8%' }, { l: 'Status', v: 'Preview' }],
      features: ['Automated Canary Health Assessment', 'Staging Deployment Blockers', 'Zero-Config Webhooks'],
      disabled: true,
    },
  ];
};

const VARIANT_MAP = {
  green:  'cs-badge-green',
  blue:   'cs-badge-blue',
  amber:  'cs-badge-amber',
  purple: 'cs-badge-purple',
  muted:  'cs-badge-muted',
  red:    'cs-badge-red',
};

/* ──────────────────────────────────────────────────────────
   SKELETON LOADER
   ────────────────────────────────────────────────────────── */
const CardSkeleton = () => (
  <div className="cs-card p-5 flex flex-col gap-4 min-h-[280px]">
    <div className="flex items-start gap-3">
      <div className="skeleton w-10 h-10 rounded-[12px]" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-28 rounded" />
        <div className="skeleton h-2.5 w-16 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="skeleton h-2.5 w-full rounded" />
      <div className="skeleton h-2.5 w-4/5 rounded" />
    </div>
    <div className="grid grid-cols-3 gap-2 mt-auto">
      {[0,1,2].map(i => <div key={i} className="skeleton h-10 rounded-[8px]" />)}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────── */
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
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');

  // Simulate brief load for smooth entry
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const apps = makeApps(projects, openBugsCount, pendingOutboxCount, contracts);

  const FILTERS = [
    { id: 'all',      label: 'All Apps' },
    { id: 'qa',       label: 'QA' },
    { id: 'sales',    label: 'Sales' },
    { id: 'company',  label: 'Company' },
    { id: 'aidev',    label: 'AI Dev' },
  ];

  const filtered = apps.filter(a => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'company') return a.id === 'company' || a.id === 'customers';
    return a.id === activeFilter;
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div
      className="w-full min-h-full flex flex-col"
      style={{ background: 'var(--c-canvas)', color: 'var(--c-primary)' }}
    >

      {/* ── Top Header ── */}
      <header
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-30"
        style={{ background: 'rgba(20,21,24,0.92)', borderBottom: '1px solid var(--c-border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--c-white)' }}>
            {greeting}, {currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Founder'} 👋
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--c-muted)' }}>
            InfratechAI Workspace · {apps.filter(a => !a.disabled).length} apps ready
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px]"
            style={{ background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.2)', color: 'var(--c-green)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            Neural Core Online
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] text-white"
              style={{ background: '#6E7BFF' }}
            >
              {userInitial}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md transition-colors cursor-pointer"
                style={{ color: 'var(--c-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F25B5B'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 pb-24 md:pb-8">

        {/* Section Header + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--c-white)' }}>
              Applications
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--c-muted)' }}>
              Launch enterprise workspaces and AI agents
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all cursor-pointer"
                style={{
                  background: activeFilter === f.id ? 'rgba(110,123,255,0.18)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeFilter === f.id ? 'rgba(110,123,255,0.35)' : 'var(--c-border)'}`,
                  color: activeFilter === f.id ? '#A5B4FF' : 'var(--c-muted)',
                  fontWeight: activeFilter === f.id ? 600 : 500,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app, idx) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.id}
                  onClick={() => !app.disabled && onLaunchApp(app.id)}
                  className={`cs-card p-5 flex flex-col justify-between min-h-[270px] animate-fadeInUp ${!app.disabled ? 'cursor-pointer apple-press' : 'opacity-50 cursor-default'}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Top */}
                  <div className="flex-1">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                        style={{ background: `${app.color}18`, border: `1px solid ${app.color}30` }}
                      >
                        <Icon size={18} style={{ color: app.color }} strokeWidth={2} />
                      </div>
                      <span className={`cs-badge ${VARIANT_MAP[app.statusVariant] || 'cs-badge-muted'}`}>
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ background: 'currentColor' }}
                        />
                        {app.status}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--c-muted)' }}>
                      {app.category}
                    </p>
                    <h3 className="text-[15px] font-semibold mb-2 tracking-tight" style={{ color: 'var(--c-white)' }}>
                      {app.name}
                    </h3>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--c-secondary)' }}>
                      {app.description}
                    </p>

                    {/* Metrics Strip */}
                    <div
                      className="grid grid-cols-3 gap-0 mt-4 rounded-[10px] overflow-hidden"
                      style={{ border: '1px solid var(--c-border)' }}
                    >
                      {app.metrics.map((m, i) => (
                        <div
                          key={i}
                          className="py-2.5 px-2 text-center"
                          style={{
                            background: 'var(--c-raised)',
                            borderRight: i < 2 ? '1px solid var(--c-border)' : 'none'
                          }}
                        >
                          <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--c-muted)' }}>
                            {m.l}
                          </p>
                          <p
                            className="text-[12px] font-semibold truncate"
                            style={{ color: m.highlight ? 'var(--c-amber)' : 'var(--c-primary)' }}
                          >
                            {m.v}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="mt-3 space-y-1.5">
                      {app.features.slice(0, 3).map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--c-muted)' }}>
                          <CheckCircle2 size={11} style={{ color: app.color, flexShrink: 0 }} />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div
                    className="pt-4 mt-4 flex items-center justify-between"
                    style={{ borderTop: '1px solid var(--c-border)' }}
                  >
                    <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
                      {app.disabled ? 'Coming soon' : 'Free · Workspace'}
                    </span>
                    {!app.disabled && (
                      <button
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all apple-press cursor-pointer"
                        style={{
                          background: `${app.color}20`,
                          border: `1px solid ${app.color}35`,
                          color: app.color,
                        }}
                      >
                        Open
                        <ArrowRight size={12} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};
