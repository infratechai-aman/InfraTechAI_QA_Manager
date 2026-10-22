import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Check, ShieldAlert, ArrowRight, 
  Layers, Clock, MessageSquare, Flame, CheckCircle2, ExternalLink
} from 'lucide-react';

export const CampaignsPlaybookView = () => {
  const [selectedFramework, setSelectedFramework] = useState('PAS');

  const demoUrl = 'https://housecleaning-998d3.web.app/';

  const frameworks = [
    {
      id: 'PAS',
      name: 'PAS (Problem - Agitate - Solve)',
      bestFor: 'US Cleaning & Maid service owners with outdated 2012-2015 websites',
      structure: [
        { label: 'Problem', desc: 'Point out observable site issue (e.g., no mobile booking or slow cluttered layout).' },
        { label: 'Agitate', desc: 'Homeowners looking for cleaning on mobile bounce and book the first competitor with instant pricing.' },
        { label: 'Solve', desc: `Introduce our modern booking engine demo (${demoUrl}) and offer a free 24-hr custom preview.` }
      ]
    },
    {
      id: 'AIDA',
      name: 'AIDA (Attention - Interest - Desire - Action)',
      bestFor: 'High-volume residential & commercial cleaning businesses with strong Yelp/Google reviews',
      structure: [
        { label: 'Attention', desc: 'Praise their stellar 4.8+ star Google rating in their local city.' },
        { label: 'Interest', desc: 'Show how modern house cleaning sites convert 3x more bookings with instant bedroom/bathroom pricing.' },
        { label: 'Desire', desc: `Share the live booking demo (${demoUrl}) to show the exact user experience.` },
        { label: 'Action', desc: 'Offer to build their company custom preview in 24 hours at zero upfront cost.' }
      ]
    },
    {
      id: 'BAB',
      name: 'BAB (Before - After - Bridge)',
      bestFor: 'Maid services relying on slow phone calls and back-and-forth email quotes',
      structure: [
        { label: 'Before', desc: 'Losing evening and weekend booking requests because customers hate calling on the phone.' },
        { label: 'After', desc: 'Customers pick their cleaning frequency, select bedrooms, and book online in 20 seconds.' },
        { label: 'Bridge', desc: 'We build your custom turnkey website in 24 hours for $499-$899, payable only after you love it.' }
      ]
    }
  ];

  const currentFw = frameworks.find(f => f.id === selectedFramework) || frameworks[0];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn pb-32">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            House Cleaning Outbound Playbooks & Heuristics
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            $499 - $899 USD Deals
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Proven 3-step outbound sequences targeting US house cleaners with sloppy sites. Under 60 words, human employee tone, zero AI fluff.
        </p>
      </div>

      {/* 3-Step Cold Outreach Sequence Visualizer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Harvey 3-Stage Closing Funnel</h2>
            <p className="text-xs text-slate-500">Every prospect moves through an automated cadenced sequence until reply or deal closed.</p>
          </div>
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 transition-colors self-start sm:self-auto"
          >
            <span>Reference Demo: {demoUrl.replace('https://', '')}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                Day 1 • Max 55 Words
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">The Sloppy Site / Mobile Gap Hook</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Points out that their website lacks an instant quote calculator on mobile, losing homeowners to franchise competitors. Links to the live demo.
            </p>
            <div className="text-[11px] font-semibold text-indigo-800 bg-white p-2.5 rounded-xl border border-indigo-100">
              Hook: "Saw your site in Dallas — missing mobile instant booking. Tested this demo: housecleaning-998d3.web.app"
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Day 3 • Max 50 Words
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">The 24-Hour Custom Preview Offer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Offers to build a working, branded preview for their business in 24 hours at zero upfront risk. Removes all friction.
            </p>
            <div className="text-[11px] font-semibold text-emerald-800 bg-white p-2.5 rounded-xl border border-emerald-100">
              Hook: "Can build your company preview in 24h for free. Test it on your phone — pay only if you love it."
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                Day 7 • Max 40 Words
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">The $499 Introductory Close / Breakup</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Polite closure offering a special $499 introductory package to lock in their local territory before reaching out to competing cleaners.
            </p>
            <div className="text-[11px] font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
              Hook: "Closing out our schedule for this week — can hold the $499 rate if you want a peek, otherwise won't bug you."
            </div>
          </div>

        </div>
      </div>

      {/* Copywriting Frameworks Comparison */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Conversion Copy Frameworks</h2>
            <p className="text-xs text-slate-500">Select which copywriting structure Harvey should use when drafting cold outreach.</p>
          </div>
          
          <div className="flex items-center gap-2">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setSelectedFramework(fw.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFramework === fw.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {fw.id}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Framework Deep Dive */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{currentFw.name}</span>
            <span className="text-xs text-slate-500 font-medium">Best for: {currentFw.bestFor}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {currentFw.structure.map((part, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Stage {i + 1}: {part.label}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{part.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Harvey Anti-AI Rules & Tone Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white space-y-4 border border-indigo-500/20">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Harvey Human Identity & Anti-AI Directive</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Harvey never discloses or hints at being an AI or bot. He operates strictly as a real human Senior Web Consultant at InfratechAI.
          All messages are kept strictly under 60 words, conversational, and direct, ensuring maximum reply and conversion rates with US small business owners.
        </p>
      </div>

    </div>
  );
};
