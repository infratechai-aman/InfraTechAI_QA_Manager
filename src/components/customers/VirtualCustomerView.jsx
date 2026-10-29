import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, Bot, Sparkles, Play, RefreshCw, Search,
  CheckCircle2, AlertTriangle, TrendingUp, X,
  ThumbsUp, ThumbsDown, MessageSquare, Filter,
  Activity, ChevronRight, Send, ArrowLeft, Zap,
  DollarSign, Target, Award, ShieldCheck, HelpCircle,
  Maximize2, Minimize2, ExternalLink
} from 'lucide-react';
import { getUserInitial } from '../../utils/formatters';

/* ═══════════════════════════════════════════════════════════
   SYNTHETIC CUSTOMER PANEL — VOICE OF CUSTOMER ENGINE
   8 Curated Strategic Buyer Personas across Market Sectors
   All pricing and willingness-to-pay evaluated in ₹ INR
   ═══════════════════════════════════════════════════════════ */

const CUSTOMER_PERSONAS = [
  {
    id: 'cust_01',
    name: 'Rahul Mehta',
    title: 'CTO, FinTech Unicorn',
    company: 'FinVance (₹1,200Cr ARR)',
    sector: 'Enterprise FinTech',
    budgetINR: 250000,
    wtpINR: 65000,
    skepticism: 80,
    sentiment: 74,
    decision: 'CONSIDERING',
    avatar: 'RM',
    avatarColor: '#2B2D33',
    opinion: 'Automation ROI is strong, but I need SOC2 Type II and India DPDP compliance before connecting to production repo. Our board mandates quarterly security audits.',
    keyObjection: 'Requires strict data residency in Mumbai / India region.',
    mustHave: 'DPDP compliance, SAML/SSO, and VAPT certification.'
  },
  {
    id: 'cust_02',
    name: 'Sahil Agarwal',
    title: 'YC W25 Founder',
    company: 'HyperFlow AI (Pre-Seed)',
    sector: 'Early-Stage Founders',
    budgetINR: 30000,
    wtpINR: 22000,
    skepticism: 32,
    sentiment: 95,
    decision: 'BUY',
    avatar: 'SA',
    avatarColor: '#141518',
    opinion: '₹22,000/mo is one inbound close from Harvey. Autonomous linear QA lets me stop context switching between product and testing. Ready to onboard immediately.',
    keyObjection: 'Cannot sign annual lock-in; needs monthly billing.',
    mustHave: 'Month-to-month retainer, zero setup fee.'
  },
  {
    id: 'cust_03',
    name: 'Suresh Pillai',
    title: 'Chief Financial Officer',
    company: 'Apex Cloud Solutions (₹500Cr ARR)',
    sector: 'Finance & Procurement',
    budgetINR: 400000,
    wtpINR: 80000,
    skepticism: 88,
    sentiment: 68,
    decision: 'CONSIDERING',
    avatar: 'SP',
    avatarColor: '#2B2D33',
    opinion: 'The financial math works if we eliminate 3 manual QA contractor seats saving ₹36L annually. Send me a formal cost displacement schedule.',
    keyObjection: 'Requires formal ROI documentation for finance committee.',
    mustHave: 'Guaranteed cost displacement breakdown in ₹ INR.'
  },
  {
    id: 'cust_04',
    name: 'Tanmay Bhat',
    title: 'Head of Quality Assurance',
    company: 'QuickKart Logistics',
    sector: 'QA & Engineering Leaders',
    budgetINR: 100000,
    wtpINR: 45000,
    skepticism: 60,
    sentiment: 88,
    decision: 'BUY',
    avatar: 'TB',
    avatarColor: '#141518',
    opinion: 'Our Cypress test suites flake 25% of the time. The Linear-style keyboard hotkeys (P/F/B) and instant defect sync will cut our regression cycles from 3 days to 4 hours.',
    keyObjection: 'Wants integration with existing Jira sprint boards.',
    mustHave: 'Jira two-way defect synchronization.'
  },
  {
    id: 'cust_05',
    name: 'Manish Goel',
    title: 'VP of Global Sales',
    company: 'ZetaCloud Software',
    sector: 'Sales & Go-To-Market',
    budgetINR: 80000,
    wtpINR: 35000,
    skepticism: 52,
    sentiment: 86,
    decision: 'BUY',
    avatar: 'MG',
    avatarColor: '#2B2D33',
    opinion: 'Harvey SDR outbound is a massive leverage point. If email deliverability stays above 98% and replies automatically triage into meetings, ₹35k/mo is an easy ROI.',
    keyObjection: 'Needs assurance against domain reputation damage.',
    mustHave: 'DKIM/SPF alignment and custom domain warmup.'
  },
  {
    id: 'cust_06',
    name: 'Sneha Reddy',
    title: 'Engineering Director',
    company: 'MedPulse HealthTech',
    sector: 'HealthTech Enterprise',
    budgetINR: 300000,
    wtpINR: 70000,
    skepticism: 85,
    sentiment: 65,
    decision: 'CONSIDERING',
    avatar: 'SR',
    avatarColor: '#141518',
    opinion: 'Patient telemetry cannot be processed on foreign shared infrastructure. If InfratechAI offers on-premises test runner or encrypted tenant vault, we will pilot.',
    keyObjection: 'Encrypted tenant vault and HIPAA/DPDP certification.',
    mustHave: 'Zero plaintext data storage guarantee.'
  },
  {
    id: 'cust_07',
    name: 'Priya Nair',
    title: 'VP of Engineering',
    company: 'SaaSBridge Platform',
    sector: 'B2B SaaS Scale-up',
    budgetINR: 180000,
    wtpINR: 52000,
    skepticism: 70,
    sentiment: 82,
    decision: 'CONSIDERING',
    avatar: 'PN',
    avatarColor: '#2B2D33',
    opinion: 'We deploy 40 times a day. If automated regression gates hook into our GitHub Actions without slowing down CI, ₹50,000/mo is well within our budget.',
    keyObjection: 'Sub-60s webhook trigger latency in CI/CD pipeline.',
    mustHave: 'GitHub Actions integration and Slack alert webhooks.'
  },
  {
    id: 'cust_08',
    name: 'Vikram Singh',
    title: 'Tech Co-founder',
    company: 'EduLearn Scale-up',
    sector: 'Education & Consumer SaaS',
    budgetINR: 120000,
    wtpINR: 42000,
    skepticism: 58,
    sentiment: 84,
    decision: 'BUY',
    avatar: 'VS',
    avatarColor: '#141518',
    opinion: 'Cutting QA headcount while boosting test determinism will allow us to double product velocity. The 30-day money-back guarantee makes it a no-brainer.',
    keyObjection: 'Needs self-serve onboarding with minimal onboarding calls.',
    mustHave: '30-day money back guarantee + clear onboarding docs.'
  }
];

export const VirtualCustomerView = ({ currentUser, onNavigateToApp }) => {
  const userId = currentUser?.uid || 'default';
  const userName = (currentUser?.displayName || currentUser?.email?.split('@')[0] || 'aman').toLowerCase();
  const userInitial = getUserInitial(currentUser?.displayName || currentUser?.email || 'A');

  // Pitch simulation state
  const [pitchText, setPitchText] = useState('InfratechAI: Autonomous linear QA execution with Linear hotkeys (P/F/B) + Harvey AI SDR outbound for ₹24,999/mo with zero setup fee.');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState(null);

  // 1-on-1 Persona Chat state
  const [personaChatMessages, setPersonaChatMessages] = useState({});
  const [currentPersonaInput, setCurrentPersonaInput] = useState('');
  const [isPersonaTyping, setIsPersonaTyping] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Computed metrics from Customer Panel
  const metrics = useMemo(() => {
    const buyCount = CUSTOMER_PERSONAS.filter(p => p.decision === 'BUY').length;
    const considerCount = CUSTOMER_PERSONAS.filter(p => p.decision === 'CONSIDERING').length;
    const avgWTP = Math.round(CUSTOMER_PERSONAS.reduce((acc, p) => acc + p.wtpINR, 0) / CUSTOMER_PERSONAS.length);
    const avgSentiment = Math.round(CUSTOMER_PERSONAS.reduce((acc, p) => acc + p.sentiment, 0) / CUSTOMER_PERSONAS.length);
    
    // NPS Calculation: Promoters (Sentiment >= 80) - Detractors (Sentiment < 70)
    const promoters = CUSTOMER_PERSONAS.filter(p => p.sentiment >= 80).length;
    const detractors = CUSTOMER_PERSONAS.filter(p => p.sentiment < 70).length;
    const nps = Math.round(((promoters - detractors) / CUSTOMER_PERSONAS.length) * 100);

    return {
      buyCount,
      considerCount,
      avgWTP,
      avgSentiment,
      nps
    };
  }, []);

  const inrFmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleRunSimulation = (e) => {
    e?.preventDefault();
    if (!pitchText.trim()) return;

    setIsSimulating(true);
    setTimeout(() => {
      setSimulationRound(prev => prev + 1);
      setIsSimulating(false);
    }, 700);
  };

  const handleQuickPitchPreset = (preset) => {
    setPitchText(preset);
  };

  // Open 1-on-1 dialogue with customer persona
  const handleOpenPersonaChat = (persona) => {
    setSelectedPersona(persona);
    if (!personaChatMessages[persona.id]) {
      setPersonaChatMessages(prev => ({
        ...prev,
        [persona.id]: [
          {
            sender: 'persona',
            text: `Hi! I'm ${persona.name}, ${persona.title} at ${persona.company}. Regarding your proposition: "${persona.opinion}" What can you tell me about ${persona.keyObjection.toLowerCase()}?`,
            timestamp: 'Just now'
          }
        ]
      }));
    }
  };

  const handleSendToPersona = (e) => {
    e?.preventDefault();
    if (!currentPersonaInput.trim() || !selectedPersona) return;

    const pId = selectedPersona.id;
    const userMsg = {
      sender: 'founder',
      text: currentPersonaInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const existing = personaChatMessages[pId] || [];
    const updated = [...existing, userMsg];
    setPersonaChatMessages(prev => ({ ...prev, [pId]: updated }));
    setCurrentPersonaInput('');
    setIsPersonaTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = userMsg.text.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('retainer') || lower.includes('inr') || lower.includes('₹')) {
        reply = `From a budget standpoint, my discretionary spend ceiling is ${inrFmt(selectedPersona.budgetINR)}. At ${inrFmt(selectedPersona.wtpINR)} this is very appealing, assuming the ${selectedPersona.mustHave} is included.`;
      } else if (lower.includes('security') || lower.includes('dpdp') || lower.includes('soc2') || lower.includes('privacy') || lower.includes('data')) {
        reply = `Security is make-or-break for us. ${selectedPersona.mustHave} is a mandatory condition. If you can guarantee encrypted data residency and isolated tenant keys, we can fast-track the pilot.`;
      } else if (lower.includes('sla') || lower.includes('support') || lower.includes('uptime') || lower.includes('flake')) {
        reply = `That SLA commitment provides real peace of mind. If you include that in the written service order, I will champion this internally with our leadership team.`;
      } else {
        reply = `I appreciate the clarity on that. As ${selectedPersona.title}, my key priority remains addressing "${selectedPersona.keyObjection}". If your team can deliver that within our first 30 days, you have our commitment.`;
      }

      const botReply = {
        sender: 'persona',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setPersonaChatMessages(prev => ({ ...prev, [pId]: [...updated, botReply] }));
      setIsPersonaTyping(false);
    }, 650);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#E5E7EE] text-[#141518] font-sans antialiased selection:bg-[#2B2D33] selection:text-white">

      {/* ======================================================== */}
      {/* TOP GLOBAL HEADER: EXACT APPLE FROSTED GLASS BAR         */}
      {/* ======================================================== */}
      <header className="h-20 px-6 sm:px-8 flex items-center justify-between border-b border-white/50 bg-[#E5E7EE]/80 backdrop-blur-2xl sticky top-0 z-30 apple-motion shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        
        {/* Left: Back to Launchpad + Identity */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigateToApp && onNavigateToApp('hub')}
            className="btn-shine-effect flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white border border-white/80 text-xs font-semibold text-[#141518] shadow-apple-sm active:scale-[0.96] apple-motion-quick cursor-pointer"
            title="Return to Master App / Launchpad"
          >
            <ArrowLeft size={14} className="text-[#50545E]" />
            <span className="hidden sm:inline">Launchpad</span>
          </button>

          <div className="h-6 w-px bg-[#9AA0AC]/30 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2B2D33] text-[#E5E7EE] flex items-center justify-center shadow-lg border border-[#50545E]/40 ring-1 ring-white/10 apple-motion-quick">
              <Users size={20} className="text-[#E5E7EE]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold tracking-tight text-[#141518]">
                  Virtual Customer Swarm
                </span>
                <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2B2D33]/10 text-[#141518] border border-[#50545E]/30 uppercase tracking-wider">
                  8 Buyer Personas
                </span>
              </div>
              <span className="text-[11px] text-[#50545E] font-medium flex items-center gap-1.5">
                <span>MiroFish Intelligence Engine</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold font-mono">Evaluated in ₹ INR</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="btn-shine-effect px-4 py-2 text-xs font-semibold rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-[#E5E7EE] flex items-center gap-1.5 shadow-sm apple-motion-quick active:scale-[0.96] cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Simulating Panel...' : 'Test Proposition'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-[#50545E] hover:text-[#141518] border border-white/80 shadow-apple-sm apple-motion-quick active:scale-90 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Open in New Window */}
          <button
            onClick={() => window.open('?app=customers', '_blank')}
            title="Open in separate tab"
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-[#50545E] hover:text-[#141518] border border-white/80 shadow-apple-sm apple-motion-quick active:scale-90 cursor-pointer"
          >
            <ExternalLink size={15} />
          </button>

          {/* System Online Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[#2B2D33]/90 hover:bg-[#2B2D33] border border-[#50545E]/50 px-3.5 py-1.5 rounded-full shadow-xs text-white apple-motion-quick cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9AA0AC] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9AA0AC]" />
            </span>
            <span className="text-xs font-semibold text-[#E5E7EE] tracking-tight">System Online</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-white/80 backdrop-blur-md border border-transparent hover:border-white/80 cursor-pointer apple-motion-quick active:scale-[0.96]">
            <div className="w-8 h-8 rounded-full bg-[#141518] text-[#E5E7EE] flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#50545E]/40">
              {userInitial}
            </div>
            <span className="text-xs font-semibold text-[#141518] hidden sm:inline">{userName}</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT CONTAINER                                   */}
      {/* ======================================================== */}
      <main className="flex-1 px-6 sm:px-8 py-8 max-w-7xl w-full mx-auto space-y-7 pb-16">

        {/* Top Summary Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
            <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
              Net Promoter Score (NPS)
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">
              +{metrics.nps} NPS
            </div>
            <span className="text-[11px] text-[#50545E] mt-1 block">Top-decile B2B benchmark</span>
          </div>

          <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
            <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
              Buying Conversion Intent
            </span>
            <div className="text-2xl font-bold font-mono text-[#141518] mt-1.5">
              {metrics.buyCount} / 8 Buyers
            </div>
            <span className="text-[11px] text-[#50545E] mt-1 block">
              {metrics.considerCount} in pilot evaluation
            </span>
          </div>

          <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
            <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
              Avg. Willingness to Pay
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">
              {inrFmt(metrics.avgWTP)}
            </div>
            <span className="text-[11px] text-[#50545E] mt-1 block">Monthly recurring retainer</span>
          </div>

          <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card">
            <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider block">
              Customer Sentiment
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1.5">
              {metrics.avgSentiment}% Positive
            </div>
            <span className="text-[11px] text-[#50545E] mt-1 block">Across 8 strategic buyer sectors</span>
          </div>
        </div>

        {/* Proposition / Pitch Simulator Input */}
        <div className="glass-specular bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#141518] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#141518]" />
              <span>Simulate Product Proposition or Pricing Tier</span>
            </h2>
            <span className="text-xs text-[#50545E] font-mono">
              Round {simulationRound}
            </span>
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-3.5">
            <textarea
              rows={3}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Enter your product feature, pricing model in ₹ INR, or value proposition to test..."
              className="w-full p-4 bg-white/80 border border-white rounded-2xl text-xs text-[#141518] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40 font-medium"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider">
                  Presets:
                </span>
                {[
                  '₹24,999/mo QA + Harvey Outbound bundle',
                  '₹49,999/mo Enterprise Retainer with 99.9% SLA',
                  'Usage-based: ₹0.50/test with zero monthly fee'
                ].map((pre, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickPitchPreset(pre)}
                    className="px-3 py-1 rounded-full bg-white/80 hover:bg-[#141518] hover:text-white text-[#50545E] text-[10px] font-medium transition-colors cursor-pointer border border-[#9AA0AC]/30 shadow-2xs"
                  >
                    {pre}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="btn-shine-effect px-5 py-2.5 bg-[#141518] hover:bg-[#2B2D33] disabled:opacity-50 text-[#E5E7EE] rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 8 Customer Personas Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-[#141518]">
              Strategic Buyer Panel Opinions ({CUSTOMER_PERSONAS.length})
            </h3>
            <span className="text-xs text-[#50545E]">
              Click &quot;Interview Persona&quot; to test objection handling
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CUSTOMER_PERSONAS.map(persona => {
              const isBuy = persona.decision === 'BUY';

              return (
                <div
                  key={persona.id}
                  className="glass-specular bg-white/70 hover:bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-apple-card hover:shadow-apple-hover apple-motion flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Decision Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white/60 shrink-0"
                          style={{ backgroundColor: persona.avatarColor }}
                        >
                          {persona.avatar}
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-[#141518] tracking-tight">
                            {persona.name}
                          </h4>
                          <p className="text-xs text-[#50545E] font-medium">
                            {persona.title} • <strong className="text-[#141518]">{persona.company}</strong>
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        isBuy 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {persona.decision}
                      </span>
                    </div>

                    {/* Sector & Financials Strip */}
                    <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/80 border border-[#9AA0AC]/30 mb-3.5 text-xs shadow-2xs">
                      <div>
                        <span className="text-[9px] text-[#50545E] uppercase tracking-wider font-bold block mb-0.5">
                          Sector
                        </span>
                        <span className="font-semibold text-[#141518] truncate block">
                          {persona.sector}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#50545E] uppercase tracking-wider font-bold block mb-0.5">
                          Budget
                        </span>
                        <span className="font-semibold font-mono text-[#141518]">
                          {inrFmt(persona.budgetINR)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#50545E] uppercase tracking-wider font-bold block mb-0.5">
                          Willingness to Pay
                        </span>
                        <span className="font-semibold font-mono text-emerald-700">
                          {inrFmt(persona.wtpINR)}
                        </span>
                      </div>
                    </div>

                    {/* Persona Direct Quote */}
                    <div className="p-3.5 rounded-2xl bg-white/85 border border-[#9AA0AC]/30 mb-3.5">
                      <p className="text-xs text-[#141518] leading-relaxed italic">
                        &quot;{persona.opinion}&quot;
                      </p>
                    </div>

                    {/* Deal-Breaker Objection */}
                    <div className="text-xs text-[#50545E] mb-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Key Deal-Breaker:</span>
                      </div>
                      <p className="text-xs text-[#50545E] pl-5">
                        {persona.keyObjection}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action: 1-on-1 Interview */}
                  <div className="pt-4 border-t border-[#9AA0AC]/25 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#50545E] font-medium">
                      Must Have: <strong className="text-[#141518]">{persona.mustHave}</strong>
                    </span>

                    <button
                      onClick={() => handleOpenPersonaChat(persona)}
                      className="btn-shine-effect px-4 py-2 rounded-2xl text-xs font-semibold bg-[#141518] hover:bg-[#2B2D33] text-[#E5E7EE] flex items-center gap-1.5 shadow-sm apple-motion-quick active:scale-95 cursor-pointer shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Interview</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* ======================================================== */}
      {/* 1-ON-1 INTERVIEW MODAL (APPLE FLUID GLASS SPECULAR)      */}
      {/* ======================================================== */}
      {selectedPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141518]/60 backdrop-blur-2xl animate-fadeIn">
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-3xl rounded-[32px] border border-white/80 shadow-[0_32px_64px_-16px_rgba(20,21,24,0.35)] flex flex-col overflow-hidden apple-motion max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#9AA0AC]/25 bg-white/80 backdrop-blur-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0"
                  style={{ backgroundColor: selectedPersona.avatarColor }}
                >
                  {selectedPersona.avatar}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#141518] tracking-tight">
                    Interviewing {selectedPersona.name}
                  </h3>
                  <p className="text-xs text-[#50545E] font-medium">
                    {selectedPersona.title} • {selectedPersona.company}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPersona(null)}
                className="w-8 h-8 rounded-full bg-[#141518]/5 hover:bg-[#141518]/10 text-[#50545E] hover:text-[#141518] flex items-center justify-center apple-motion-quick active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[45vh] bg-slate-50/50">
              {(personaChatMessages[selectedPersona.id] || []).map((msg, idx) => {
                const isFounder = msg.sender === 'founder';

                return (
                  <div 
                    key={idx}
                    className={`flex flex-col ${isFounder ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-[#50545E] mb-1 px-1">
                      <span>{isFounder ? 'Founder (You)' : selectedPersona.name}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isFounder
                          ? 'bg-[#141518] text-[#E5E7EE] shadow-sm rounded-br-xs'
                          : 'glass-specular bg-white text-[#141518] border border-white shadow-apple-sm rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isPersonaTyping && (
                <div className="flex items-center gap-2.5 text-xs text-[#50545E]">
                  <div className="ios-spinner !w-4 !h-4">
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                    <div className="ios-spinner-blade"></div>
                  </div>
                  <span>{selectedPersona.name} is evaluating...</span>
                </div>
              )}
            </div>

            {/* Quick Objection Prompts */}
            <div className="px-6 py-2.5 border-t border-[#9AA0AC]/20 bg-white flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider shrink-0">
                Test Response:
              </span>
              {[
                'We guarantee India DPDP & zero plaintext storage',
                'We offer a 30-day money-back guarantee',
                'We can bundle Harvey SDR for ₹24,999/mo'
              ].map((qr, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPersonaInput(qr)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#141518] hover:text-white text-[#50545E] text-[10px] font-medium whitespace-nowrap apple-motion-quick cursor-pointer border border-[#9AA0AC]/30 active:scale-95"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-[#9AA0AC]/25 bg-white">
              <form onSubmit={handleSendToPersona} className="flex gap-2.5">
                <input
                  type="text"
                  value={currentPersonaInput}
                  onChange={(e) => setCurrentPersonaInput(e.target.value)}
                  placeholder={`Respond to ${selectedPersona.name}'s objection...`}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-[#9AA0AC]/30 rounded-2xl text-xs text-[#141518] placeholder-[#50545E] focus:outline-none focus:ring-2 focus:ring-[#50545E]/40"
                />
                <button
                  type="submit"
                  disabled={!currentPersonaInput.trim() || isPersonaTyping}
                  className="btn-shine-effect px-5 py-2.5 bg-[#141518] hover:bg-[#2B2D33] disabled:opacity-50 text-[#E5E7EE] rounded-2xl text-xs font-semibold apple-motion-quick flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
