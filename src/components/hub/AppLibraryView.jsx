import React, { useState, useEffect, useRef } from 'react';
import {
  Building2, Users, CheckSquare, MessageSquare, Cpu, Bot, Shield,
  LogOut, LayoutGrid, Search, Grid, List, ChevronDown, ArrowRight,
  FolderKanban, Activity, Settings, X
} from 'lucide-react';
import { getUserInitial } from '../../utils/formatters';
import { businessService } from '../../services/businessService';

/* ─────────────────────────────────────────────────────────────────────────
   INLINE STYLES — Exact Apple Fluid & Sonoma Mesh decorations from code.html
   ───────────────────────────────────────────────────────────────────────── */
const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .stitch-portal-root * {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, "Plus Jakarta Sans", sans-serif;
    box-sizing: border-box;
  }

  /* macOS Sonoma / Apple Keynote Fluid Ambient Mesh with Obsidian & Metallic Slate Glow */
  .hero-apple-mesh {
    background: 
      radial-gradient(ellipse 85% 75% at 85% 15%, rgba(80, 84, 94, 0.55) 0%, transparent 65%),
      radial-gradient(ellipse 70% 60% at 20% 90%, rgba(43, 45, 51, 0.85) 0%, transparent 70%),
      radial-gradient(circle at 60% 40%, rgba(154, 160, 172, 0.18) 0%, transparent 75%),
      linear-gradient(135deg, #141518 0%, #1e2024 45%, #2B2D33 100%);
  }

  /* Apple Fluid Glass Specular & Frosted Layering */
  .glass-specular {
    box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.85), inset 0 -1px 1px rgba(0, 0, 0, 0.03), 0 10px 30px -5px rgba(20, 21, 24, 0.04);
  }

  .dark-glass-specular {
    box-shadow: inset 0 1px 0.5px rgba(255, 255, 255, 0.16), 0 8px 24px -4px rgba(0, 0, 0, 0.45);
  }

  /* Smooth Apple Physics Springs */
  .apple-motion {
    transition: all 420ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, box-shadow;
  }

  .apple-motion-quick {
    transition: all 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Interactive button shine animation */
  .btn-shine-effect {
    position: relative;
    overflow: hidden;
  }
  .btn-shine-effect::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 40%;
    height: 200%;
    background: linear-gradient(
      60deg,
      rgba(255, 255, 255, 0) 20%,
      rgba(255, 255, 255, 0.28) 50%,
      rgba(255, 255, 255, 0) 80%
    );
    transform: rotate(25deg);
    transition: all 750ms cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }
  .btn-shine-effect:hover::after {
    left: 140%;
  }

  /* Apple iOS activity spinner */
  .ios-spinner {
    position: relative;
    width: 38px;
    height: 38px;
  }
  .ios-spinner-blade {
    position: absolute;
    left: 46%;
    top: 30%;
    width: 8%;
    height: 24%;
    background-color: #141518;
    border-radius: 9999px;
    animation: ios-fade 1s linear infinite;
    transform-origin: center bottom;
  }
  .ios-spinner-blade:nth-child(1)  { transform: rotate(0deg) translate(0, -140%); animation-delay: 0s; }
  .ios-spinner-blade:nth-child(2)  { transform: rotate(30deg) translate(0, -140%); animation-delay: -0.916s; }
  .ios-spinner-blade:nth-child(3)  { transform: rotate(60deg) translate(0, -140%); animation-delay: -0.833s; }
  .ios-spinner-blade:nth-child(4)  { transform: rotate(90deg) translate(0, -140%); animation-delay: -0.75s; }
  .ios-spinner-blade:nth-child(5)  { transform: rotate(120deg) translate(0, -140%); animation-delay: -0.666s; }
  .ios-spinner-blade:nth-child(6)  { transform: rotate(150deg) translate(0, -140%); animation-delay: -0.583s; }
  .ios-spinner-blade:nth-child(7)  { transform: rotate(180deg) translate(0, -140%); animation-delay: -0.5s; }
  .ios-spinner-blade:nth-child(8)  { transform: rotate(210deg) translate(0, -140%); animation-delay: -0.416s; }
  .ios-spinner-blade:nth-child(9)  { transform: rotate(240deg) translate(0, -140%); animation-delay: -0.333s; }
  .ios-spinner-blade:nth-child(10) { transform: rotate(270deg) translate(0, -140%); animation-delay: -0.25s; }
  .ios-spinner-blade:nth-child(11) { transform: rotate(300deg) translate(0, -140%); animation-delay: -0.166s; }
  .ios-spinner-blade:nth-child(12) { transform: rotate(330deg) translate(0, -140%); animation-delay: -0.083s; }

  @keyframes ios-fade {
    0% { opacity: 1; }
    100% { opacity: 0.15; }
  }

  /* Skeleton shimmer */
  @keyframes shimmerLight {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .skeleton-light {
    background: linear-gradient(90deg, #e8eaed 25%, #f0f2f5 50%, #e8eaed 75%);
    background-size: 1200px 100%;
    animation: shimmerLight 1.4s infinite;
    border-radius: 8px;
  }
`;

/* ─────────────────────────────────────────────────────────────────────────
   FILTER CATEGORIES
   ───────────────────────────────────────────────────────────────────────── */
const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'qa',        label: 'QA Manager' },
  { id: 'sales',     label: 'Sales AI' },
  { id: 'business',  label: 'Business' },
  { id: 'aidev',     label: 'AI Dev' },
];

/* ─────────────────────────────────────────────────────────────────────────
   APP DEFINITIONS
   ───────────────────────────────────────────────────────────────────────── */
const makeApps = (projects, openBugsCount, pendingOutboxCount, contracts) => {
  const biz = businessService.getPortfolioMetrics(contracts);
  const inrFmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return [
    {
      id: 'company',
      category: 'AUTONOMOUS ENTERPRISE OPERATIONS',
      name: 'Virtual Company (Stark Cyberpunk HQ)',
      desc: '14 autonomous GSTACK departments with 64 real working employees. Chat 1-on-1 as Founder with any employee in real time, dispatch missions, manage Harvey Outbound Sales, Sentinel-9 Query & Ticket Resolution, and auto-generate daily executive briefings in ₹ INR.',
      status: 'Active',
      tags: ['14 Depts', '64 Employees', '1-on-1 Founder Chat', '₹ INR'],
      cta: 'Enter Command Deck',
      iconDark: true,
      filterCategory: 'qa',
    },
    {
      id: 'customers',
      category: 'MULTI-AGENT MARKET INTELLIGENCE',
      name: 'Virtual Customer Swarm (MiroFish)',
      desc: 'Next-gen multi-agent sandbox and strategic buyer panel. Spawns diverse customer personas (Enterprise CTOs, Seed Founders, QA Heads, CFOs) to test pricing elasticity in ₹ INR, Net Promoter Score (NPS), and simulated objection handling.',
      status: 'Live',
      tags: ['8 Buyer Personas', '₹ INR Elasticity', 'NPS Simulator'],
      cta: 'Launch Swarm Simulator',
      iconDark: false,
      filterCategory: 'sales',
    },
    {
      id: 'business',
      category: 'ENTERPRISE REVENUE & SLA',
      name: 'Business Command Center',
      desc: 'Active client portfolios, contract renewal countdowns, enterprise SLA guarantees, retainers and MRR tracking, and detailed technical project scopes.',
      status: biz.expiringSoonCount > 0 ? `${biz.expiringSoonCount} Expiring` : 'Ready',
      tags: [`${contracts.length} Active`, inrFmt(biz.totalMRR || 0), `${biz.expiringSoonCount} Expiring Soon`],
      cta: 'Open',
      iconDark: true,
      filterCategory: 'business',
    },
    {
      id: 'aidev',
      category: 'VOICE INTELLIGENCE ENGINE',
      name: 'AI DEV Copilot',
      desc: 'Autonomous technical lead with 100% real-time awareness across QA test suites, open defects, sales outbox, and contracts. Voice synthesis via Web Speech API.',
      status: 'Live Voice Active',
      statusPulse: true,
      tags: ['Web Speech', '100% Live', '₹0.00'],
      cta: 'Open',
      iconDark: false,
      filterCategory: 'aidev',
    },
    {
      id: 'qa',
      category: 'QUALITY ENGINEERING',
      name: 'InfraTechAI QA Manager',
      desc: 'High-velocity test execution with Linear-style hotkeys (P/F/B), full defect lifecycle tracking, test suites management, and real-time Firebase collaboration.',
      status: openBugsCount > 0 ? `${openBugsCount} Open Bugs` : 'Core Installed',
      statusAlt: true,
      tags: [`${projects.length} Active`, `${openBugsCount} Open`, 'Live'],
      cta: 'Open',
      iconDark: true,
      filterCategory: 'qa',
    },
    {
      id: 'sales',
      category: 'AUTONOMOUS SALES AI',
      name: 'Sales Manager (Harvey)',
      desc: 'Autonomous B2B outbound prospecting engine. Discovers website buying signals, crafts hyper-personalized sequences, and queues human-vetted drafts in Decisions Desk.',
      status: pendingOutboxCount > 0 ? `${pendingOutboxCount} Pending` : 'SDR Engine Active',
      tags: [`${pendingOutboxCount} Pending`, 'Neural SDR', '₹0.00'],
      cta: 'Open',
      iconDark: false,
      filterCategory: 'sales',
    },
    {
      id: 'sentinel',
      category: 'CI/CD & DEPLOYMENT',
      name: 'DevOps Release Sentinel',
      desc: 'Continuous staging, regression analysis, automated canary rollouts, verification, and deployment readiness scoring before promoting builds to production.',
      status: 'Preview',
      statusAlt: true,
      tags: ['GitHub Actions', '99.8%', 'Preview'],
      cta: 'Preview',
      disabled: true,
      iconDark: true,
      filterCategory: 'qa',
    },
  ];
};

/* ─────────────────────────────────────────────────────────────────────────
   SVG ICON BY APP ID (Matches code.html SVGs)
   ───────────────────────────────────────────────────────────────────────── */
const AppIcon = ({ id, dark }) => {
  const cls = dark ? 'text-[#E5E7EE]' : 'text-[#2B2D33]';

  const paths = {
    company: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
    customers: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
    qa: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
    ),
    business: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
    aidev: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    ),
    sales: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
    sentinel: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    ),
  };

  return (
    <svg className={`w-6 h-6 ${cls} apple-motion-quick`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      {paths[id]}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT: EXACT DITTO REPRODUCTION OF code.html
   ───────────────────────────────────────────────────────────────────────── */
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
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [activeNav, setActiveNav] = useState('launchpad');
  
  // Apple Fluid Launch Modal State
  const [launchOverlayOpen, setLaunchOverlayOpen] = useState(false);
  const [launchingApp, setLaunchingApp] = useState(null);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchPhase, setLaunchPhase] = useState('Authenticating');
  const [launchBadgeText, setLaunchBadgeText] = useState('Connecting Gateway');

  const searchInputRef = useRef(null);

  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');
  const userName = (currentUser?.displayName || currentUser?.email?.split('@')[0] || 'aman').toLowerCase();

  const apps = makeApps(projects, openBugsCount, pendingOutboxCount, contracts);

  // Filter apps by category and search query
  const filteredApps = apps.filter(app => {
    const matchesCategory = activeFilter === 'all' || app.filterCategory === activeFilter || app.id === activeFilter;
    const matchesSearch = !searchQuery.trim() ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 280);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut: ⌘K or Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apple Fluid App Launch Trigger Handler
  const handleTriggerLaunch = (app) => {
    if (app.disabled) return;

    setLaunchingApp(app);
    setLaunchProgress(0);
    setLaunchPhase('Authenticating');
    setLaunchBadgeText('Connecting Gateway');
    setLaunchOverlayOpen(true);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 9) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        setLaunchProgress(100);
        setLaunchPhase('Workspace Ready');
        setLaunchBadgeText('Active Session');

        setTimeout(() => {
          setLaunchOverlayOpen(false);
          onLaunchApp(app.id);
        }, 650);
      } else {
        setLaunchProgress(currentProgress);
        if (currentProgress > 60) {
          setLaunchPhase('Loading Assets');
          setLaunchBadgeText('Synchronizing Core');
        } else if (currentProgress > 25) {
          setLaunchPhase('Spawning Microservices');
        }
      }
    }, 65);
  };

  return (
    <>
      <style>{inlineStyles}</style>

      <div className="stitch-portal-root bg-[#E5E7EE] font-sans text-slate-800 antialiased h-screen flex overflow-hidden selection:bg-[#2B2D33] selection:text-white relative w-full">

        {/* ═══════════════════════════════════════════════════
            BEGIN: SIDEBAR NAVIGATION (macOS Dark Translucent Glass)
            ═══════════════════════════════════════════════════ */}
        <aside className="w-64 bg-[#141518] backdrop-blur-2xl text-white flex flex-col justify-between border-r border-[#2B2D33] flex-shrink-0 z-20 apple-motion shadow-2xl">
          <div className="p-6">
            {/* Logo Branding */}
            <div 
              onClick={() => setActiveNav('launchpad')}
              className="flex items-center gap-3.5 mb-8 px-1.5 cursor-pointer group active:scale-[0.98] apple-motion-quick"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#2B2D33] flex items-center justify-center shadow-lg border border-[#50545E]/40 ring-1 ring-white/10 group-hover:border-[#9AA0AC]/50 apple-motion-quick">
                <svg className="w-5 h-5 text-[#E5E7EE]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-bold tracking-tight text-[#E5E7EE] flex items-center">
                  InfraTech<span className="text-[#9AA0AC] font-extrabold ml-0.5">AI</span>
                </span>
                <span className="text-[10px] text-[#9AA0AC] font-semibold tracking-wider uppercase">
                  Enterprise OS
                </span>
              </div>
            </div>

            {/* Navigation Links (iOS App Bar Style) */}
            <nav aria-label="Main Navigation" className="space-y-1.5">
              {/* Launchpad (Active) */}
              <button
                onClick={() => setActiveNav('launchpad')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13px] apple-motion-quick active:scale-[0.96] cursor-pointer text-left ${
                  activeNav === 'launchpad'
                    ? 'bg-[#2B2D33] text-[#E5E7EE] font-semibold dark-glass-specular shadow-sm border border-[#50545E]/40'
                    : 'text-[#9AA0AC] hover:text-[#E5E7EE] hover:bg-[#2B2D33]/60 font-medium'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-[#50545E]/40 flex items-center justify-center text-[#E5E7EE] shadow-inner">
                  <LayoutGrid size={16} strokeWidth={2} />
                </div>
                <span>Launchpad</span>
              </button>

              {/* My Applications */}
              <button
                onClick={() => { setActiveNav('my-applications'); setActiveFilter('all'); }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13px] apple-motion-quick active:scale-[0.96] cursor-pointer text-left ${
                  activeNav === 'my-applications'
                    ? 'bg-[#2B2D33] text-[#E5E7EE] font-semibold dark-glass-specular shadow-sm border border-[#50545E]/40'
                    : 'text-[#9AA0AC] hover:text-[#E5E7EE] hover:bg-[#2B2D33]/60 font-medium'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-[#2B2D33]/40 flex items-center justify-center text-[#9AA0AC]">
                  <Shield size={16} strokeWidth={1.8} />
                </div>
                <span>My Applications</span>
              </button>

              {/* Projects */}
              <button
                onClick={() => onLaunchApp('qa')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13px] apple-motion-quick active:scale-[0.96] cursor-pointer text-left ${
                  activeNav === 'projects'
                    ? 'bg-[#2B2D33] text-[#E5E7EE] font-semibold dark-glass-specular shadow-sm border border-[#50545E]/40'
                    : 'text-[#9AA0AC] hover:text-[#E5E7EE] hover:bg-[#2B2D33]/60 font-medium'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-[#2B2D33]/40 flex items-center justify-center text-[#9AA0AC]">
                  <FolderKanban size={16} strokeWidth={1.8} />
                </div>
                <span>Projects</span>
              </button>

              {/* Activity / Virtual Company */}
              <button
                onClick={() => onLaunchApp('company')}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13px] apple-motion-quick active:scale-[0.96] cursor-pointer text-left ${
                  activeNav === 'activity'
                    ? 'bg-[#2B2D33] text-[#E5E7EE] font-semibold dark-glass-specular shadow-sm border border-[#50545E]/40'
                    : 'text-[#9AA0AC] hover:text-[#E5E7EE] hover:bg-[#2B2D33]/60 font-medium'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-[#2B2D33]/40 flex items-center justify-center text-[#9AA0AC]">
                  <Activity size={16} strokeWidth={1.8} />
                </div>
                <span>Activity (Company)</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => onOpenSettings && onOpenSettings()}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13px] apple-motion-quick active:scale-[0.96] cursor-pointer text-left ${
                  activeNav === 'settings'
                    ? 'bg-[#2B2D33] text-[#E5E7EE] font-semibold dark-glass-specular shadow-sm border border-[#50545E]/40'
                    : 'text-[#9AA0AC] hover:text-[#E5E7EE] hover:bg-[#2B2D33]/60 font-medium'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-[#2B2D33]/40 flex items-center justify-center text-[#9AA0AC]">
                  <Settings size={16} strokeWidth={1.8} />
                </div>
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Motto & User Profile */}
          <div className="p-6 border-t border-[#2B2D33]/80 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9AA0AC] animate-pulse" />
                <span className="text-[10px] tracking-wider uppercase text-[#9AA0AC] font-bold">
                  Mission Ready
                </span>
              </div>
              <p className="text-xs text-[#50545E] font-medium tracking-tight">
                &quot;Build. Automate. Grow.&quot;
              </p>
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#2B2D33]/50 hover:bg-[#2B2D33] border border-[#50545E]/20 text-xs font-semibold text-[#E5E7EE] transition-colors cursor-pointer"
            >
              <LogOut size={13} className="text-[#9AA0AC]" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
        {/* END: Sidebar Navigation */}

        {/* ═══════════════════════════════════════════════════
            BEGIN: MAIN DASHBOARD VIEWPORT
            ═══════════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* BEGIN: Top Global Header Bar (Apple Frosted Glass) */}
          <header className="h-20 px-8 flex items-center justify-between border-b border-white/50 bg-[#E5E7EE]/80 backdrop-blur-2xl sticky top-0 z-30 apple-motion shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            
            {/* Search Input (iOS Spotlight Style) */}
            <div className="relative w-96 group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#50545E] group-focus-within:text-[#141518] apple-motion-quick">
                <Search size={16} strokeWidth={2} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full pl-10 pr-12 py-2.5 bg-white/75 hover:bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl text-[13px] text-[#141518] placeholder-[#50545E] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40 focus:border-[#2B2D33] focus:bg-white apple-motion shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="text-[10px] font-semibold text-[#50545E] bg-white/90 border border-[#9AA0AC]/40 px-1.5 py-0.5 rounded-lg shadow-2xs group-hover:scale-105 apple-motion-quick">
                  ⌘K
                </kbd>
              </span>
            </div>

            {/* Right Header Actions & Profile */}
            <div className="flex items-center gap-4">
              {/* Live System Status Badge */}
              <div className="flex items-center gap-2 bg-[#2B2D33]/90 hover:bg-[#2B2D33] border border-[#50545E]/50 px-3.5 py-1.5 rounded-full shadow-xs text-white apple-motion-quick cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9AA0AC] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9AA0AC]" />
                </span>
                <span className="text-xs font-semibold text-[#E5E7EE] tracking-tight">
                  System Online
                </span>
              </div>

              {/* User Profile Avatar Pill */}
              <div 
                onClick={onLogout}
                title="Click to sign out"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-white/80 backdrop-blur-md border border-transparent hover:border-white/80 cursor-pointer apple-motion-quick active:scale-[0.96] group shadow-none hover:shadow-apple-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#141518] text-[#E5E7EE] flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#50545E]/40 group-hover:ring-[#2B2D33] apple-motion-quick">
                  {userInitial}
                </div>
                <span className="text-xs font-semibold text-[#141518] group-hover:text-[#2B2D33] apple-motion-quick tracking-tight">
                  {userName}
                </span>
                <ChevronDown size={14} className="text-[#50545E] group-hover:text-[#141518] apple-motion-quick" />
              </div>
            </div>
          </header>
          {/* END: Top Global Header Bar */}

          {/* BEGIN: Main Scrollable Content Area */}
          <div className="p-8 max-w-7xl mx-auto w-full space-y-7">

            {/* BEGIN: Hero Banner (Apple Keynote Fluid Squircle) */}
            <section className="hero-apple-mesh rounded-3xl p-9 text-white relative overflow-hidden shadow-apple-card border border-white/20 apple-motion hover:shadow-apple-hover">
              {/* Specular reflection top line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9AA0AC]/40 to-transparent" />
              {/* Ambient decorative glow blur shapes */}
              <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#50545E]/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-1/4 -top-16 w-60 h-60 bg-[#9AA0AC]/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-3.5">
                  <div className="inline-flex items-center gap-1.5 bg-[#141518]/70 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9AA0AC] animate-pulse" />
                    <span className="text-[11px] font-bold tracking-wider text-[#E5E7EE] uppercase">
                      Ecosystem Applications
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#E5E7EE] leading-tight drop-shadow-sm">
                    Powering Your Enterprise Operations
                  </h1>
                  <p className="text-sm text-[#9AA0AC] leading-relaxed font-normal max-w-xl">
                    Launch enterprise workspaces, automate processes, and manage your business with ease.
                  </p>
                </div>

                {/* Hero Motto Pill */}
                <div className="flex-shrink-0 self-start md:self-end">
                  <div className="bg-[#141518]/80 hover:bg-[#141518]/95 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl text-right shadow-xl apple-motion-quick hover:scale-[1.02]">
                    <span className="block text-[11px] font-bold tracking-widest text-[#E5E7EE] uppercase">
                      Better Tools.
                    </span>
                    <span className="block text-[11px] font-bold tracking-widest text-[#9AA0AC] uppercase">
                      Bigger Possibilities.
                    </span>
                  </div>
                </div>
              </div>
            </section>
            {/* END: Hero Banner */}

            {/* BEGIN: Filter Bar & Controls (iOS Segmented Control & Clean Toolbar) */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Pill Buttons */}
              <div className="inline-flex p-1 rounded-2xl bg-white/70 hover:bg-white/80 backdrop-blur-2xl border border-white/80 shadow-apple-sm relative transition-all">
                {FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold apple-motion-quick active:scale-[0.96] cursor-pointer ${
                      activeFilter === f.id
                        ? 'bg-[#141518] text-[#E5E7EE] shadow-sm'
                        : 'font-medium text-[#50545E] hover:text-[#141518] hover:bg-white/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Status Count & Layout Switcher */}
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className="text-xs font-medium text-[#50545E] tracking-tight">
                  <strong className="text-[#141518] font-semibold">{filteredApps.length}</strong> Applications
                </span>
                <div className="h-4 w-px bg-[#9AA0AC]/40" />
                <div className="flex items-center gap-1 bg-white/70 backdrop-blur-2xl p-1 rounded-2xl border border-white/80 shadow-apple-sm">
                  {/* Grid View Icon */}
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-1.5 rounded-xl apple-motion-quick active:scale-[0.96] cursor-pointer ${
                      layoutMode === 'grid'
                        ? 'bg-[#141518] text-[#E5E7EE] shadow-xs'
                        : 'text-[#50545E] hover:text-[#141518] hover:bg-white/60'
                    }`}
                    title="Grid View"
                  >
                    <Grid size={16} />
                  </button>
                  {/* List View Icon */}
                  <button
                    onClick={() => setLayoutMode('list')}
                    className={`p-1.5 rounded-xl apple-motion-quick active:scale-[0.96] cursor-pointer ${
                      layoutMode === 'list'
                        ? 'bg-[#141518] text-[#E5E7EE] shadow-xs'
                        : 'text-[#50545E] hover:text-[#141518] hover:bg-white/60'
                    }`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </section>
            {/* END: Filter Bar & Controls */}

            {/* BEGIN: Application Cards Grid / List (Exact Ditto code.html structure) */}
            <section className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12' : 'flex flex-col gap-4 pb-12'}>
              {loading ? (
                [...Array(6)].map((_, i) => <div key={i} className="skeleton-light h-80 rounded-3xl" />)
              ) : (
                filteredApps.map((app) => (
                  <article
                    key={app.id}
                    onClick={() => handleTriggerLaunch(app)}
                    className="glass-specular bg-white/70 hover:bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 hover:border-white shadow-apple-card hover:shadow-apple-hover hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] apple-motion flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Card Header: Icon & Status */}
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md apple-motion shadow-sm transition-transform ${
                          app.iconDark
                            ? 'bg-[#2B2D33] text-[#E5E7EE] border border-[#50545E]/40 group-hover:border-[#9AA0AC]/70'
                            : 'bg-[#50545E]/15 text-[#2B2D33] border border-[#50545E]/30 group-hover:border-[#50545E]/50'
                        }`}>
                          <AppIcon id={app.id} dark={app.iconDark} />
                        </div>

                        <div className="flex items-center gap-1.5 bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm group-hover:bg-[#2B2D33]/15 apple-motion-quick">
                          <span className={`w-1.5 h-1.5 rounded-full ${app.statusPulse ? 'bg-[#141518] animate-pulse' : 'bg-[#141518]'}`} />
                          {app.status}
                        </div>
                      </div>

                      {/* Titles & Sub-label */}
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-[#50545E] uppercase">
                          {app.category}
                        </span>
                        <h2 className="text-[15px] font-bold text-[#141518] group-hover:text-[#2B2D33] apple-motion-quick mt-0.5 tracking-tight">
                          {app.name}
                        </h2>
                        <p className="text-xs text-[#50545E] mt-2 leading-relaxed line-clamp-3">
                          {app.desc}
                        </p>
                      </div>

                      {/* Tags / Metrics */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {app.tags.map((tag, ti) => (
                          <span
                            key={ti}
                            className="px-2.5 py-1 rounded-xl bg-white/80 backdrop-blur-sm text-[11px] font-medium text-[#2B2D33] border border-[#9AA0AC]/40 shadow-2xs group-hover:border-[#50545E]/40 apple-motion-quick"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-5 mt-5 border-t border-[#9AA0AC]/25 flex items-center justify-between">
                      <span className="text-xs text-[#50545E] font-medium">Free • Workspace</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerLaunch(app);
                        }}
                        className={`btn-shine-effect inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-2xl apple-motion-quick shadow-sm hover:shadow-apple-sm cursor-pointer ${
                          app.disabled
                            ? 'bg-[#2B2D33] text-[#E5E7EE] border border-[#50545E]/40 cursor-not-allowed'
                            : 'bg-[#141518] hover:bg-[#2B2D33] active:scale-[0.94] text-[#E5E7EE]'
                        }`}
                      >
                        <span>{app.cta}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 apple-motion-quick" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
            {/* END: Application Cards Grid */}

          </div>
          {/* END: Main Scrollable Content Area */}

        </main>
        {/* END: Main Dashboard Viewport */}

        {/* ═══════════════════════════════════════════════════
            BEGIN: APPLE FLUID APP LAUNCH / LOADING OVERLAY
            (Exact reproduction from code.html lines 647-706)
            ═══════════════════════════════════════════════════ */}
        {launchOverlayOpen && launchingApp && (
          <div
            aria-modal="true"
            role="dialog"
            className="fixed inset-0 z-50 bg-[#141518]/50 backdrop-blur-2xl flex items-center justify-center transition-all duration-300 px-4 animate-fade-in"
            onClick={() => setLaunchOverlayOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[32px] bg-white/90 backdrop-blur-3xl border border-white/80 shadow-[0_32px_64px_-16px_rgba(20,21,24,0.35),0_0_0_1px_rgba(255,255,255,0.7)] p-8 text-center flex flex-col items-center justify-center apple-motion relative animate-scale-in"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setLaunchOverlayOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#141518]/5 hover:bg-[#141518]/10 text-[#50545E] hover:text-[#141518] flex items-center justify-center apple-motion-quick active:scale-90 cursor-pointer"
              >
                <X size={14} strokeWidth={2.2} />
              </button>

              {/* App Icon Pod with Ambient Pulsing Glow Rings */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-3xl bg-[#50545E]/20 blur-xl scale-125 animate-pulse" />
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-b from-[#2B2D33] to-[#141518] border border-[#50545E]/50 shadow-2xl flex items-center justify-center relative z-10 text-white">
                  <AppIcon id={launchingApp.id} dark={true} />
                </div>
                {/* Micro iOS Ring Activity Spinner positioned below icon */}
                <div className="absolute -bottom-2 -right-2 bg-white/95 rounded-full p-1.5 shadow-md border border-white/80 z-20 flex items-center justify-center">
                  <div className="ios-spinner !w-4 !h-4">
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                    <div className="ios-spinner-blade" />
                  </div>
                </div>
              </div>

              {/* Dynamic Launching Title & Status */}
              <div className="space-y-1.5 mb-6">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#50545E] bg-[#141518]/5 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141518] animate-ping" />
                  {launchBadgeText}
                </span>
                <h3 className="text-base font-bold text-[#141518] tracking-tight leading-snug px-2 line-clamp-1">
                  Launching {launchingApp.name}...
                </h3>
                <p className="text-xs text-[#50545E] font-normal leading-relaxed">
                  Initializing isolated sandboxed workspace session
                </p>
              </div>

              {/* Apple Fluid Progress Track */}
              <div className="w-full space-y-2 mb-2">
                <div className="w-full bg-[#E5E7EE] h-1.5 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#141518] via-[#2B2D33] to-[#50545E] rounded-full transition-all ease-out"
                    style={{ width: `${launchProgress}%`, transitionDuration: '100ms' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-[#50545E] px-0.5">
                  <span>{launchProgress}%</span>
                  <span className="flex items-center gap-1 text-[#141518] font-semibold">
                    {launchPhase}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* END: Apple Fluid App Launch / Loading Overlay */}

      </div>
    </>
  );
};
