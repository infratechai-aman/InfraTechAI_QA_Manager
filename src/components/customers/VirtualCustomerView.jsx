import React, { useState, useMemo } from 'react';
import {
  Users, Bot, Sparkles, Play, RefreshCw, Search,
  CheckCircle2, AlertTriangle, TrendingUp, X,
  ThumbsUp, ThumbsDown, MessageSquare, Filter,
  Activity, ChevronRight, Send, ArrowLeft, Zap,
  DollarSign, Target, Award, ShieldCheck, HelpCircle
} from 'lucide-react';

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
    avatarColor: '#4F46E5',
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
    avatarColor: '#10B981',
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
    avatarColor: '#F59E0B',
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
    avatarColor: '#0EA5E9',
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
    avatarColor: '#EC4899',
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
    avatarColor: '#EF4444',
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
    avatarColor: '#8B5CF6',
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
    avatarColor: '#06B6D4',
    opinion: 'Cutting QA headcount while boosting test determinism will allow us to double product velocity. The 30-day money-back guarantee makes it a no-brainer.',
    keyObjection: 'Needs self-serve onboarding with minimal onboarding calls.',
    mustHave: '30-day money back guarantee + clear onboarding docs.'
  }
];

export const VirtualCustomerView = ({ currentUser }) => {
  const userId = currentUser?.uid || 'default';

  // Pitch simulation state
  const [pitchText, setPitchText] = useState('InfratechAI: Autonomous linear QA execution with Linear hotkeys (P/F/B) + Harvey AI SDR outbound for ₹24,999/mo with zero setup fee.');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState(null);

  // 1-on-1 Persona Chat state
  const [personaChatMessages, setPersonaChatMessages] = useState({});
  const [currentPersonaInput, setCurrentPersonaInput] = useState('');
  const [isPersonaTyping, setIsPersonaTyping] = useState(false);

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
    <div className="min-h-full flex flex-col bg-[#E5E7EE] text-[#141518] font-sans pb-24 md:pb-12">

      {/* ======================================================== */}
      {/* HEADER: CLEAN STITCH BANNER                              */}
      {/* ======================================================== */}
      <header className="px-5 md:px-8 py-4 border-b border-slate-300/80 bg-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#141518] text-white flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-[#141518] tracking-tight">
                Virtual Customer Panel
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Voice of Customer Engine
              </span>
            </div>
            <p className="text-[12px] text-[#5A6072] flex items-center gap-1.5 font-medium">
              <span>8 Strategic Buyer Personas</span>
              <span>•</span>
              <span className="text-indigo-700 font-mono">
                Evaluated in ₹ INR
              </span>
            </p>
          </div>
        </div>

        {/* Quick Pitch Action Button */}
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isSimulating ? 'Simulating Panel...' : 'Test Proposition'}</span>
        </button>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT CONTAINER                                   */}
      {/* ======================================================== */}
      <main className="flex-1 px-5 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">

        {/* Top Summary Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Net Promoter Score (NPS)
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              +{metrics.nps} NPS
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Top-decile B2B benchmark</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Buying Conversion Intent
            </span>
            <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">
              {metrics.buyCount} / 8 Buyers
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {metrics.considerCount} in pilot evaluation
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Avg. Willingness to Pay
            </span>
            <div className="text-2xl font-bold font-mono text-[#141518] mt-1">
              {inrFmt(metrics.avgWTP)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Monthly recurring retainer</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Customer Sentiment
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              {metrics.avgSentiment}% Positive
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Across 8 strategic buyer sectors</span>
          </div>
        </div>

        {/* Proposition / Pitch Simulator Input */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#141518] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Simulate Product Proposition or Pricing Tier</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Round {simulationRound}
            </span>
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-3">
            <textarea
              rows={3}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Enter your product feature, pricing model in ₹ INR, or value proposition to test..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#141518] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer border border-slate-200/60"
                  >
                    {pre}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="px-4 py-2 bg-[#141518] hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 8 Customer Personas Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#141518]">
              Strategic Buyer Panel Opinions ({CUSTOMER_PERSONAS.length})
            </h3>
            <span className="text-xs text-slate-500">
              Click &quot;Interview Persona&quot; to test objection handling
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CUSTOMER_PERSONAS.map(persona => {
              const isBuy = persona.decision === 'BUY';

              return (
                <div
                  key={persona.id}
                  className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Decision Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
                          style={{ backgroundColor: persona.avatarColor }}
                        >
                          {persona.avatar}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#141518]">
                            {persona.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {persona.title} • <span className="text-slate-800 font-semibold">{persona.company}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        isBuy 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {persona.decision}
                      </span>
                    </div>

                    {/* Sector & Financials Strip */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 mb-3 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">
                          Sector
                        </span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {persona.sector}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">
                          Budget
                        </span>
                        <span className="font-semibold font-mono text-slate-800">
                          {inrFmt(persona.budgetINR)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">
                          Willingness to Pay
                        </span>
                        <span className="font-semibold font-mono text-emerald-700">
                          {inrFmt(persona.wtpINR)}
                        </span>
                      </div>
                    </div>

                    {/* Persona Direct Quote */}
                    <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 mb-3">
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        &quot;{persona.opinion}&quot;
                      </p>
                    </div>

                    {/* Deal-Breaker Objection */}
                    <div className="text-xs text-slate-600 mb-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Key Deal-Breaker:</span>
                      </div>
                      <p className="text-[11px] text-slate-600 pl-4">
                        {persona.keyObjection}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action: 1-on-1 Interview */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Must Have: <span className="font-semibold text-slate-700">{persona.mustHave}</span>
                    </span>

                    <button
                      onClick={() => handleOpenPersonaChat(persona)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141518] hover:bg-indigo-600 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
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
      {/* 1-ON-1 INTERVIEW MODAL WITH CUSTOMER PERSONA             */}
      {/* ======================================================== */}
      {selectedPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: selectedPersona.avatarColor }}
                >
                  {selectedPersona.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#141518]">
                    Interviewing {selectedPersona.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedPersona.title} • {selectedPersona.company}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPersona(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[45vh] bg-slate-50/40">
              {(personaChatMessages[selectedPersona.id] || []).map((msg, idx) => {
                const isFounder = msg.sender === 'founder';

                return (
                  <div 
                    key={idx}
                    className={`flex flex-col ${isFounder ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span>{isFounder ? 'Founder (You)' : selectedPersona.name}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isFounder
                          ? 'bg-[#141518] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 shadow-xs rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isPersonaTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                  <span>{selectedPersona.name} is evaluating...</span>
                </div>
              )}
            </div>

            {/* Quick Objection Prompts */}
            <div className="px-6 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
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
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer border border-slate-200/50"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendToPersona} className="flex gap-2">
                <input
                  type="text"
                  value={currentPersonaInput}
                  onChange={(e) => setCurrentPersonaInput(e.target.value)}
                  placeholder={`Respond to ${selectedPersona.name}'s objection...`}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#141518] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!currentPersonaInput.trim() || isPersonaTyping}
                  className="px-4 py-2 bg-[#141518] hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
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
