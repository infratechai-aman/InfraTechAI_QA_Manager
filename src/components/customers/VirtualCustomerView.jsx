import React, { useState, useMemo } from 'react';
import { 
  Users, Bot, Sparkles, Send, Play, RefreshCw, 
  BarChart3, CheckCircle2, AlertTriangle, TrendingUp, 
  DollarSign, Shield, Zap, ChevronRight, MessageSquare,
  ThumbsUp, ThumbsDown, Sliders, Plus, ExternalLink,
  Target, Eye, Check, Copy, HelpCircle, Layers
} from 'lucide-react';

/**
 * VIRTUAL CUSTOMER SWARM SIMULATOR (POWERED BY MIROFISH MULTI-AGENT ENGINE)
 * Inspired by https://github.com/666ghj/MiroFish
 * 
 * Features:
 * 1. Multi-Agent Customer Swarm with diverse neural personas
 * 2. Multi-Round Simulation (First Impression -> Pricing Elasticity -> Feature Objections)
 * 3. Live Persona Debate & Raw Opinion Feed
 * 4. MiroFish Market Consensus Matrix & Willingness-to-Pay (WTP) Curve
 * 5. Custom Persona Generator
 */
export const VirtualCustomerView = ({ currentUser }) => {
  // Input product pitch for simulation
  const [productPitch, setProductPitch] = useState(
    "InfratechAI Suite: Autonomous QA Manager + Harvey 24h Outbound AI Sales SDR with zero manual test execution and guaranteed verified leads for $499/month."
  );
  const [pricingTier, setPricingTier] = useState(499);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(3); // 1 | 2 | 3
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);

  // Swarm Customer Personas
  const [personas, setPersonas] = useState([
    {
      id: 'elena',
      name: 'Elena Vance',
      role: 'VP of Engineering (Series B SaaS)',
      avatar: 'EV',
      avatarBg: 'from-blue-600 to-indigo-800',
      skepticism: 85, // 0 - 100
      budget: '$2,500/mo',
      stance: 'Skeptical but Interested',
      wtp: '$699/mo',
      sentimentScore: 74,
      opinion: "Autonomous QA sounds great on paper, but how do you guarantee determinism? If an AI test suite flakes on a Friday staging deploy, my on-call dev gets paged. I need verifiable SOC2 compliance before connecting our production database.",
      keyObjection: "Lack of zero-trust audit logs and flake-rate guarantees.",
      mustHave: "Deterministic test assertions & SOC2 Type II cert.",
      decision: 'CONSIDERING' // 'BUY' | 'CONSIDERING' | 'REJECT'
    },
    {
      id: 'kenji',
      name: 'Kenji Sato',
      role: 'YC Founder & Full-Stack Solo Dev',
      avatar: 'KS',
      avatarBg: 'from-emerald-500 to-teal-700',
      skepticism: 40,
      budget: '$300/mo',
      stance: 'Strong Buy Signal',
      wtp: '$349/mo',
      sentimentScore: 92,
      opinion: "If Harvey can actually hunt 240 verified local business leads and send cold emails without getting my domain blacklisted, this easily pays for itself with 1 closed client. Just give me raw API access so I can pipe leads into Supabase.",
      keyObjection: "Price point at $499 is slightly high for bootstrappers; $299 is no-brainer.",
      mustHave: "Webhooks / REST API & clean domain warmup.",
      decision: 'BUY'
    },
    {
      id: 'maya',
      name: 'Maya Lin',
      role: 'Managing Director (Digital Agency)',
      avatar: 'ML',
      avatarBg: 'from-purple-500 to-pink-700',
      skepticism: 55,
      budget: '$1,500/mo',
      stance: 'High Intent / Scaler',
      wtp: '$599/mo',
      sentimentScore: 88,
      opinion: "We manage 12 client web apps simultaneously. If the QA regression workspace allows multi-tenant client portals with white-labeled PDF test run summaries, we will buy 3 agency seats immediately.",
      keyObjection: "Need client sub-accounts with permission boundaries.",
      mustHave: "White-labeled PDF test reports & team invites.",
      decision: 'BUY'
    },
    {
      id: 'dr_thorne',
      name: 'Dr. Aris Thorne',
      role: 'Chief AI Scientist & ML Skeptic',
      avatar: 'AT',
      avatarBg: 'from-amber-500 to-red-700',
      skepticism: 92,
      budget: '$1,000/mo',
      stance: 'Deep Technical Skeptic',
      wtp: '$450/mo',
      sentimentScore: 62,
      opinion: "Most 'autonomous agents' are simply brittle prompt wrappers around LLMs that hallucinate after 3 conversation turns. The real test is whether Harvey handles complex objection replies (like budget pushbacks) without human intervention.",
      keyObjection: "High probability of prompt drift and brittle email copy.",
      mustHave: "Human-in-the-loop fallback toggle before outbound send.",
      decision: 'CONSIDERING'
    },
    {
      id: 'marcus',
      name: 'Marcus Brody',
      role: 'Owner, Austin Maid Service (SMB)',
      avatar: 'MB',
      avatarBg: 'from-orange-500 to-amber-600',
      skepticism: 70,
      budget: '$250/mo',
      stance: 'Practical Buyer',
      wtp: '$299/mo',
      sentimentScore: 80,
      opinion: "I don't care about algorithms or neural networks. I only care if my cleaning schedule gets booked. Harvey's initial email to me was actually short and to the point. If it gets me 5 bookings a month, I'm in.",
      keyObjection: "Needs human phone onboarding to setup email credentials.",
      mustHave: "1-click automated setup with Google Workspace.",
      decision: 'BUY'
    }
  ]);

  // Swarm Consensus & Analytics Computed
  const swarmConsensus = useMemo(() => {
    const total = personas.length;
    const buys = personas.filter(p => p.decision === 'BUY').length;
    const considering = personas.filter(p => p.decision === 'CONSIDERING').length;
    const avgSentiment = Math.round(personas.reduce((acc, p) => acc + p.sentimentScore, 0) / total);
    const buyPercentage = Math.round((buys / total) * 100);

    return {
      buyPercentage,
      avgSentiment,
      buysCount: buys,
      consideringCount: considering,
      marketFitRating: buyPercentage >= 60 ? 'STRONG MARKET FIT' : 'NEEDS PRICING / FEATURE PIVOT',
      recommendedPrice: '$349 - $449/mo'
    };
  }, [personas]);

  // Live Swarm Simulation Runner
  const handleRunSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      // Simulate emergent persona evolution based on pricingTier
      setPersonas(prev => prev.map(persona => {
        let newSentiment = persona.sentimentScore;
        let newDecision = persona.decision;

        if (pricingTier <= 299) {
          newSentiment = Math.min(98, persona.sentimentScore + 10);
          newDecision = 'BUY';
        } else if (pricingTier > 599) {
          newSentiment = Math.max(45, persona.sentimentScore - 15);
          if (persona.id === 'kenji' || persona.id === 'marcus') {
            newDecision = 'REJECT';
          }
        }

        return {
          ...persona,
          sentimentScore: newSentiment,
          decision: newDecision
        };
      }));

      setIsSimulating(false);
      setSimulationRound(prev => (prev % 3) + 1);
    }, 1400);
  };

  // Add Custom Persona Modal / Form
  const [showAddPersona, setShowAddPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaRole, setNewPersonaRole] = useState('');
  const [newPersonaSkepticism, setNewPersonaSkepticism] = useState(60);

  const handleCreatePersona = (e) => {
    e.preventDefault();
    if (!newPersonaName.trim()) return;

    const newPersona = {
      id: `p_${Date.now()}`,
      name: newPersonaName.trim(),
      role: newPersonaRole.trim() || 'Software Engineer',
      avatar: newPersonaName.substring(0, 2).toUpperCase(),
      avatarBg: 'from-cyan-600 to-blue-800',
      skepticism: Number(newPersonaSkepticism),
      budget: '$500/mo',
      stance: 'Custom Evaluator',
      wtp: '$399/mo',
      sentimentScore: 75,
      opinion: `Evaluating ${productPitch.substring(0, 60)}... Expecting strong reliability and competitive pricing.`,
      keyObjection: 'Requires real-world stress test proof.',
      mustHave: 'Clear onboarding and developer documentation.',
      decision: 'CONSIDERING'
    };

    setPersonas(prev => [newPersona, ...prev]);
    setNewPersonaName('');
    setNewPersonaRole('');
    setShowAddPersona(false);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#030712] text-slate-100 cyber-grid-bg relative overflow-x-hidden font-sans select-none pb-20 md:pb-8">
      {/* Laser Cyan Scanline FX */}
      <div className="cyber-scanline" />

      {/* ======================================================== */}
      {/* TOP CYBERPUNK HEADER (MIROFISH MULTI-AGENT SWARM)         */}
      {/* ======================================================== */}
      <header className="px-4 md:px-8 py-4 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-cyan-500 flex items-center justify-center p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 uppercase">
                Virtual Customer Swarm
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full uppercase">
                MiroFish Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>{personas.length} Active AI Personas</span>
              <span className="text-slate-600">|</span> 
              <span className="text-emerald-400">{swarmConsensus.buyPercentage}% Intent Score</span>
              <span className="text-slate-600">|</span> 
              <a 
                href="https://github.com/666ghj/MiroFish" 
                target="_blank" 
                rel="noreferrer" 
                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>gh/666ghj/MiroFish</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddPersona(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Persona</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Swarm...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Round #{simulationRound}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN SIMULATION SANDBOX                                  */}
      {/* ======================================================== */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* Product Pitch Input & Swarm Controls */}
        <div className="cyber-card-purple rounded-2xl p-6 relative">
          <div className="hud-corner-tl" />
          <div className="hud-corner-br" />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block mb-1">
                  MiroFish Swarm Seed Proposition
                </span>
                <h2 className="text-lg md:text-xl font-black text-white">
                  Test Your Product Proposition Against AI Customer Minds
                </h2>
              </div>

              {/* Price Tier Switcher */}
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 pl-2">Pricing:</span>
                {[
                  { label: '$199/mo', value: 199 },
                  { label: '$499/mo', value: 499 },
                  { label: '$999/mo', value: 999 }
                ].map(tier => (
                  <button
                    key={tier.value}
                    onClick={() => setPricingTier(tier.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      pricingTier === tier.value
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Textarea */}
            <div className="relative">
              <textarea
                rows={2}
                value={productPitch}
                onChange={(e) => setProductPitch(e.target.value)}
                placeholder="Enter what you are building, key features, and offer details..."
                className="w-full p-3.5 rounded-xl bg-slate-950/90 border border-purple-500/30 text-xs text-white focus:outline-none focus:border-purple-400 font-sans leading-relaxed"
              />
              <button
                onClick={handleRunSimulation}
                className="absolute right-3 bottom-3 px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>Simulate</span>
              </button>
            </div>
          </div>
        </div>

        {/* MiroFish Consensus Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="cyber-card rounded-2xl p-4">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Intent / Buy Signal</span>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <span>{swarmConsensus.buyPercentage}%</span>
              <ThumbsUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              {swarmConsensus.buysCount} of {personas.length} Will Purchase
            </span>
          </div>

          <div className="cyber-card rounded-2xl p-4">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Sentiment Rating</span>
            <div className="text-2xl font-black text-purple-400">
              {swarmConsensus.avgSentiment} / 100
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              Autonomous Consensus
            </span>
          </div>

          <div className="cyber-card rounded-2xl p-4">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Market Fit Verdict</span>
            <div className="text-xs font-black text-cyan-400 tracking-wider uppercase mt-1">
              {swarmConsensus.marketFitRating}
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              MiroFish Prediction
            </span>
          </div>

          <div className="cyber-card rounded-2xl p-4">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Optimum Sweet Spot</span>
            <div className="text-2xl font-black text-amber-400">
              {swarmConsensus.recommendedPrice}
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              Max Profit Yield Point
            </span>
          </div>
        </div>

        {/* Personas Cards & Live Raw Feedback */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Simulated Persona Minds & Unfiltered Opinions</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Round #{simulationRound} Consensus Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Personas List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {personas.map(persona => {
                const isSelected = selectedPersonaId === persona.id;
                return (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersonaId(persona.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'cyber-card hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${persona.avatarBg} flex items-center justify-center font-bold text-xs text-white`}>
                          {persona.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{persona.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">{persona.role}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        persona.decision === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : persona.decision === 'CONSIDERING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {persona.decision}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
                      <span>WTP: <span className="text-purple-300 font-bold">{persona.wtp}</span></span>
                      <span>Skepticism: <span className="text-amber-400">{persona.skepticism}%</span></span>
                      <span>Sentiment: <span className="text-emerald-400">{persona.sentimentScore}%</span></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Detailed Deep-Dive Opinion HUD (7 cols) */}
            <div className="lg:col-span-7">
              {(() => {
                const activePersona = personas.find(p => p.id === selectedPersonaId) || personas[0];
                return (
                  <div className="cyber-card rounded-2xl p-6 space-y-5 h-full">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${activePersona.avatarBg} flex items-center justify-center font-black text-sm text-white shadow-lg`}>
                          {activePersona.avatar}
                        </div>
                        <div>
                          <h3 className="font-black text-base text-white">{activePersona.name}</h3>
                          <p className="text-xs text-purple-300 font-mono">{activePersona.role}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">Stance Vector</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">{activePersona.stance}</span>
                      </div>
                    </div>

                    {/* Unfiltered Thought Transcript */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Candid Neural Internal Monologue
                      </span>
                      <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/30 text-xs text-slate-200 leading-relaxed italic">
                        "{activePersona.opinion}"
                      </div>
                    </div>

                    {/* Objection & Dealbreaker Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-red-500/30 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-red-400 flex items-center gap-1.5 uppercase">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Biggest Objection
                        </span>
                        <p className="text-xs text-slate-300">{activePersona.keyObjection}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Must-Have to Close Deal
                        </span>
                        <p className="text-xs text-slate-300">{activePersona.mustHave}</p>
                      </div>
                    </div>

                    {/* Simulation Parameters */}
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Monthly Budget: <span className="text-white font-bold">{activePersona.budget}</span></span>
                      <span className="text-slate-400">Max Willingness-To-Pay: <span className="text-emerald-400 font-bold">{activePersona.wtp}</span></span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* MiroFish Emergent Prediction Report */}
        <div className="cyber-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">MiroFish Swarm Emergent Forecast</h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">Confidence: 91.8%</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong className="text-cyan-400 font-mono">1. Conversion Prediction: </strong>
              At <span className="text-white font-bold">${pricingTier}/month</span>, the product will convert approximately <span className="text-emerald-400 font-bold">{swarmConsensus.buyPercentage}%</span> of inbound agency & SMB prospects. Solo founders (Kenji persona) demonstrate pricing friction above $349/mo.
            </p>
            <p>
              <strong className="text-purple-400 font-mono">2. Recommended Action: </strong>
              Introduce a $299/mo Starter Tier for solo developers (1 project, 50 cold emails/mo) and keep the $499/mo Tier for full autonomous agency capacity (unlimited tests + 240 leads).
            </p>
            <p>
              <strong className="text-amber-400 font-mono">3. Churn Risk Warning: </strong>
              Elena (Enterprise VP) will stall deals without explicit SOC2 certification and deterministic assertion logging.
            </p>
          </div>
        </div>

      </main>

      {/* Add Custom Persona Modal */}
      {showAddPersona && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl max-w-md w-full p-6 space-y-4 relative">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Spawn Custom Virtual Customer Mind</span>
            </h3>

            <form onSubmit={handleCreatePersona} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Role / Industry</label>
                <input
                  type="text"
                  required
                  value={newPersonaRole}
                  onChange={(e) => setNewPersonaRole(e.target.value)}
                  placeholder="e.g. Lead QA Engineer at FinTech"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Skepticism Level:</span>
                  <span className="text-purple-400 font-bold">{newPersonaSkepticism}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={newPersonaSkepticism}
                  onChange={(e) => setNewPersonaSkepticism(e.target.value)}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPersona(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg"
                >
                  Spawn into Swarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
