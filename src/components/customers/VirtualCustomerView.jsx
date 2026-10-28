import React, { useState, useMemo } from 'react';
import { 
  Users, Bot, Sparkles, Play, RefreshCw, 
  CheckCircle2, AlertTriangle, TrendingUp, 
  ChevronRight, ThumbsUp, Plus, ArrowRight,
  ShieldCheck, HelpCircle, Check, DollarSign,
  Layers, Sliders
} from 'lucide-react';

/**
 * VIRTUAL CUSTOMER SWARM (EXECUTIVE SAGE & OBSIDIAN EDITION)
 * Designed with Emil Kowalski craft sensibility & Apple HIG aesthetics.
 * 
 * Palette:
 * - Obsidian Pine: #0B1F20
 * - Deep Forest: #0E2926
 * - Spruce Stone: #163B32
 * - Muted Alpine Sage: #225347
 * - Soft Sage Grey: #92B095
 * - Pale Mint Cream: #DAF1DE
 * 
 * Rules:
 * - All pricing, budgets, and willingness-to-pay in Indian Rupees (₹)
 * - Removed "Mirofish engine" from the title/name
 * - Clean, professional UI with zero tacky cyberpunk styling
 */
export const VirtualCustomerView = ({ currentUser }) => {
  // Input product proposition
  const [productPitch, setProductPitch] = useState(
    "InfratechAI Autonomous QA Suite + Outbound Lead Dispatcher with zero-human test verification and verified B2B customer pipelines for ₹24,999/month."
  );

  // Pricing tier in INR (₹)
  const [pricingTierINR, setPricingTierINR] = useState(24999);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(1);
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);

  // Real Archetype Customer Personas (All in INR ₹)
  const [personas, setPersonas] = useState([
    {
      id: 'enterprise_dir',
      name: 'Enterprise Engineering Director',
      segment: 'Mid-Market & Enterprise SaaS',
      location: 'Bengaluru / Hybrid',
      budgetINR: 150000,
      wtpINR: 45000,
      skepticism: 80,
      sentimentScore: 78,
      stance: 'Compliance Sensitive',
      decision: 'CONSIDERING', // 'BUY' | 'CONSIDERING' | 'REJECT'
      internalThought: "Automated QA and outbound lead gen solves two huge headcount costs. However, our security compliance team requires strict audit logging and deterministic test assertions before we connect client repos.",
      keyObjection: "Requires verifiable compliance certifications and flake-free test guarantees.",
      mustHaveFeature: "Detailed assertion audit logs and multi-user access permissions."
    },
    {
      id: 'startup_founder',
      name: 'High-Growth Startup Founder',
      segment: 'Early-stage Venture / Solo Team',
      location: 'Gurugram / Remote',
      budgetINR: 30000,
      wtpINR: 20000,
      skepticism: 35,
      sentimentScore: 94,
      stance: 'High Purchase Intent',
      decision: 'BUY',
      internalThought: "At ₹24,999/mo, if this saves me 15 hours of manual testing every week and Harvey sends cold emails that book even one paying client, the ROI is instantaneous.",
      keyObjection: "Needs transparent domain warmup so emails do not land in spam.",
      mustHaveFeature: "REST API webhooks and zero-friction Google Workspace integration."
    },
    {
      id: 'agency_head',
      name: 'Digital Agency Managing Partner',
      segment: 'Multi-Client Services Agency',
      location: 'Mumbai / Pune',
      budgetINR: 90000,
      wtpINR: 35000,
      skepticism: 50,
      sentimentScore: 88,
      stance: 'Scale Focused',
      decision: 'BUY',
      internalThought: "We manage 8 web applications for clients across retail and healthcare. If the regression suites allow multi-tenant client portals with downloadable executive reports, we will onboard immediately.",
      keyObjection: "Need client sub-accounts with separate workspace boundaries.",
      mustHaveFeature: "PDF test run summaries and branded team invitations."
    },
    {
      id: 'tech_lead',
      name: 'Senior Systems Architect',
      segment: 'FinTech & Critical Infrastructure',
      location: 'Hyderabad / Global',
      budgetINR: 60000,
      wtpINR: 30000,
      skepticism: 88,
      sentimentScore: 68,
      stance: 'Technical Pragmatist',
      decision: 'CONSIDERING',
      internalThought: "Many automation tools produce false positives that fatigue developers. I care about reproducibility — if a test fails, I need an exact trace and zero hallucination.",
      keyObjection: "High concern regarding test execution flakiness.",
      mustHaveFeature: "Human-in-the-loop verification gate before marking builds as blocked."
    },
    {
      id: 'smb_owner',
      name: 'Commercial SMB Operator',
      segment: 'Local Services & Contracting',
      location: 'Delhi NCR / Tier-1',
      budgetINR: 20000,
      wtpINR: 15000,
      skepticism: 65,
      sentimentScore: 76,
      stance: 'Practical Buyer',
      decision: 'BUY',
      internalThought: "I only care about two things: our customer booking form working smoothly on mobile, and getting qualified local leads without hiring an expensive marketing agency.",
      keyObjection: "Needs zero technical jargon and simple onboarding.",
      mustHaveFeature: "Clear phone/email notifications when inquiries arrive."
    }
  ]);

  // Formatter for Indian Rupees
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // Swarm Consensus Calculation
  const consensusMetrics = useMemo(() => {
    const total = personas.length;
    const buys = personas.filter(p => p.decision === 'BUY').length;
    const avgScore = Math.round(personas.reduce((sum, p) => sum + p.sentimentScore, 0) / total);
    const buyRate = Math.round((buys / total) * 100);

    return {
      buyRate,
      avgScore,
      buysCount: buys,
      verdict: buyRate >= 60 ? 'Favorable Commercial Demand' : 'Price Adjustment Recommended',
      sweetSpotINR: '₹18,000 — ₹26,000 / month'
    };
  }, [personas]);

  // Run Simulation Round
  const handleRunSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      setPersonas(prev => prev.map(persona => {
        let newSentiment = persona.sentimentScore;
        let newDecision = persona.decision;

        // Mathematical elasticity based on pricingTierINR
        if (pricingTierINR <= persona.wtpINR) {
          newSentiment = Math.min(98, persona.sentimentScore + 8);
          newDecision = 'BUY';
        } else if (pricingTierINR > persona.wtpINR * 1.3) {
          newSentiment = Math.max(45, persona.sentimentScore - 14);
          newDecision = 'REJECT';
        } else {
          newDecision = 'CONSIDERING';
        }

        return {
          ...persona,
          sentimentScore: newSentiment,
          decision: newDecision
        };
      }));

      setIsSimulating(false);
      setSimulationRound(prev => prev + 1);
    }, 800);
  };

  // Add Custom Customer Persona
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSegment, setCustomSegment] = useState('');
  const [customBudgetINR, setCustomBudgetINR] = useState(30000);
  const [customWtpINR, setCustomWtpINR] = useState(20000);

  const handleAddPersona = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newPersona = {
      id: `p_${Date.now()}`,
      name: customName.trim(),
      segment: customSegment.trim() || 'Software Enterprise',
      location: 'India',
      budgetINR: Number(customBudgetINR),
      wtpINR: Number(customWtpINR),
      skepticism: 55,
      sentimentScore: 78,
      stance: 'Active Evaluator',
      decision: Number(customWtpINR) >= pricingTierINR ? 'BUY' : 'CONSIDERING',
      internalThought: `Evaluating proposition: "${productPitch.substring(0, 70)}...". Checking budget fit and implementation timeline.`,
      keyObjection: 'Requires demonstration of real reliability.',
      mustHaveFeature: 'Clear SLA and onboarding documentation.'
    };

    setPersonas(prev => [newPersona, ...prev]);
    setCustomName('');
    setCustomSegment('');
    setShowAddModal(false);
  };

  const activePersona = personas.find(p => p.id === selectedPersonaId) || personas[0];

  return (
    <div className="min-h-full flex flex-col bg-[#0B1F20] text-slate-100 font-sans select-none pb-20 md:pb-8">

      {/* ======================================================== */}
      {/* TOP HEADER (SAGE & OBSIDIAN SOPHISTICATION)              */}
      {/* ======================================================== */}
      <header className="px-5 md:px-8 py-3.5 border-b border-[#163B32] bg-[#0E2926]/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#163B32] border border-[#225347] flex items-center justify-center text-[#DAF1DE] shadow-sm">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-semibold text-white tracking-tight">
                Virtual Customer Swarm
              </h1>
              <span className="luxury-badge">
                Multi-Agent Intelligence
              </span>
            </div>
            <p className="text-[11px] text-[#92B095] flex items-center gap-1.5 font-medium">
              <span>{personas.length} Customer Archetypes</span>
              <span>•</span>
              <span className="text-[#DAF1DE]">{consensusMetrics.buyRate}% Purchase Intent</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="luxury-btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Archetype</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="luxury-btn px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
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
      {/* MAIN SIMULATION LAB                                      */}
      {/* ======================================================== */}
      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full space-y-6">

        {/* Proposition Input & Pricing Tier (Rupees) */}
        <div className="luxury-card-elevated p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="luxury-badge">Product Proposition</span>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mt-1.5">
                Simulate Customer Purchasing Intent & Objections
              </h2>
            </div>

            {/* Pricing Tiers in Rupees */}
            <div className="flex items-center gap-1.5 bg-[#0B1F20] p-1 rounded-xl border border-[#163B32]">
              <span className="text-[11px] text-[#92B095] px-2 font-medium">Price:</span>
              {[
                { label: '₹9,999/mo', value: 9999 },
                { label: '₹24,999/mo', value: 24999 },
                { label: '₹49,999/mo', value: 49999 }
              ].map(tier => (
                <button
                  key={tier.value}
                  onClick={() => setPricingTierINR(tier.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    pricingTierINR === tier.value
                      ? 'bg-[#DAF1DE] text-[#0B1F20] font-semibold shadow-xs'
                      : 'text-[#92B095] hover:text-white'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={productPitch}
              onChange={(e) => setProductPitch(e.target.value)}
              placeholder="Describe product offering, key guarantees, and pricing scope..."
              className="w-full p-3.5 rounded-xl bg-[#0E2926] border border-[#163B32] text-xs text-white focus:outline-none focus:border-[#DAF1DE] font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* 4 Clean Metric Cards (Rupees) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="luxury-card p-4">
            <span className="text-[11px] text-[#92B095] font-medium block">Commercial Fit</span>
            <div className="text-xl font-bold text-[#DAF1DE] mt-1">{consensusMetrics.buyRate}%</div>
            <span className="text-[10px] text-[#92B095] font-mono mt-0.5 block">{consensusMetrics.buysCount} of {personas.length} Will Purchase</span>
          </div>

          <div className="luxury-card p-4">
            <span className="text-[11px] text-[#92B095] font-medium block">Sentiment Index</span>
            <div className="text-xl font-bold text-white mt-1">{consensusMetrics.avgScore} / 100</div>
            <span className="text-[10px] text-[#92B095] font-mono mt-0.5 block">Aggregate Score</span>
          </div>

          <div className="luxury-card p-4">
            <span className="text-[11px] text-[#92B095] font-medium block">Recommended Price</span>
            <div className="text-base font-bold text-[#DAF1DE] mt-1 font-mono">{consensusMetrics.sweetSpotINR}</div>
            <span className="text-[10px] text-[#92B095] font-mono mt-0.5 block">Optimal Elasticity</span>
          </div>

          <div className="luxury-card p-4">
            <span className="text-[11px] text-[#92B095] font-medium block">Market Verdict</span>
            <div className="text-xs font-bold text-white mt-1 tracking-tight">{consensusMetrics.verdict}</div>
            <span className="text-[10px] text-[#92B095] font-mono mt-0.5 block">Round #{simulationRound} Verified</span>
          </div>
        </div>

        {/* Customer Minds Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Personas (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#92B095] px-1">
              Customer Archetypes
            </h3>

            {personas.map(persona => {
              const isSelected = activePersona.id === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#163B32] border-[#225347] shadow-sm'
                      : 'luxury-card hover:border-[#225347]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{persona.name}</h4>
                      <p className="text-[10px] text-[#92B095]">{persona.segment}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                      persona.decision === 'BUY'
                        ? 'bg-[#225347] text-[#DAF1DE]'
                        : persona.decision === 'CONSIDERING'
                          ? 'bg-[#0E2926] text-white border border-[#163B32]'
                          : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                    }`}>
                      {persona.decision}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#163B32]/60 flex items-center justify-between text-[11px] font-mono text-[#92B095]">
                    <span>WTP: <strong className="text-[#DAF1DE]">{formatINR(persona.wtpINR)}</strong></span>
                    <span>Sentiment: <strong className="text-white">{persona.sentimentScore}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep-Dive Customer Monologue (7 cols) */}
          <div className="lg:col-span-7">
            <div className="luxury-card-elevated p-6 space-y-5 h-full">
              <div className="flex items-center justify-between border-b border-[#163B32] pb-4">
                <div>
                  <span className="luxury-badge">{activePersona.segment}</span>
                  <h3 className="text-base font-bold text-white mt-1">{activePersona.name}</h3>
                  <p className="text-xs text-[#92B095]">{activePersona.location}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#92B095] block font-mono">Stance Vector</span>
                  <span className="text-xs font-semibold text-[#DAF1DE]">{activePersona.stance}</span>
                </div>
              </div>

              {/* Internal Monologue */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#92B095] block">
                  Customer Evaluation & Decision Logic
                </span>
                <div className="p-4 rounded-xl bg-[#0E2926] border border-[#163B32] text-xs text-white leading-relaxed italic">
                  "{activePersona.internalThought}"
                </div>
              </div>

              {/* Objection & Dealbreaker Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="luxury-card p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-rose-300 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Primary Friction Point
                  </span>
                  <p className="text-xs text-[#92B095]">{activePersona.keyObjection}</p>
                </div>

                <div className="luxury-card p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#DAF1DE] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-[#DAF1DE]" />
                    Purchase Prerequisite
                  </span>
                  <p className="text-xs text-[#92B095]">{activePersona.mustHaveFeature}</p>
                </div>
              </div>

              {/* Budget Parameters in Rupees */}
              <div className="luxury-card p-3.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#92B095]">
                  Max Monthly Budget: <strong className="text-white">{formatINR(activePersona.budgetINR)}</strong>
                </span>
                <span className="text-[#92B095]">
                  Willingness To Pay: <strong className="text-[#DAF1DE]">{formatINR(activePersona.wtpINR)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Add Custom Archetype Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="luxury-card-elevated max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#DAF1DE]" />
              <span>Add Custom Customer Archetype</span>
            </h3>

            <form onSubmit={handleAddPersona} className="space-y-3">
              <div>
                <label className="text-[11px] text-[#92B095] block mb-1">Title / Segment</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Healthcare Clinic Owner"
                  className="w-full px-3 py-2 rounded-xl bg-[#0E2926] border border-[#163B32] text-xs text-white focus:outline-none focus:border-[#DAF1DE]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#92B095] block mb-1">Industry Context</label>
                <input
                  type="text"
                  required
                  value={customSegment}
                  onChange={(e) => setCustomSegment(e.target.value)}
                  placeholder="e.g. Private Medical Practice"
                  className="w-full px-3 py-2 rounded-xl bg-[#0E2926] border border-[#163B32] text-xs text-white focus:outline-none focus:border-[#DAF1DE]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#92B095] block mb-1">Budget (INR ₹)</label>
                  <input
                    type="number"
                    value={customBudgetINR}
                    onChange={(e) => setCustomBudgetINR(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0E2926] border border-[#163B32] text-xs text-white focus:outline-none focus:border-[#DAF1DE]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#92B095] block mb-1">Willingness to Pay (₹)</label>
                  <input
                    type="number"
                    value={customWtpINR}
                    onChange={(e) => setCustomWtpINR(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0E2926] border border-[#163B32] text-xs text-white focus:outline-none focus:border-[#DAF1DE]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#92B095] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="luxury-btn px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Save Archetype
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
