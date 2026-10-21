import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Check, ShieldAlert, ArrowRight, 
  Layers, Clock, MessageSquare, Flame, CheckCircle2 
} from 'lucide-react';

export const CampaignsPlaybookView = () => {
  const [selectedFramework, setSelectedFramework] = useState('PAS');

  const frameworks = [
    {
      id: 'PAS',
      name: 'PAS (Problem - Agitate - Solve)',
      bestFor: 'Technical leads & engineering heads experiencing sprint bottlenecks',
      structure: [
        { label: 'Problem', desc: 'State the observable challenge (e.g., release regressions or slow manual QA).' },
        { label: 'Agitate', desc: 'Highlight the business cost (e.g., missed deadlines or developer frustration).' },
        { label: 'Solve', desc: 'Introduce InfratechAI QA Manager as the streamlined fix, with a low-friction CTA.' }
      ]
    },
    {
      id: 'AIDA',
      name: 'AIDA (Attention - Interest - Desire - Action)',
      bestFor: 'Agencies and digital product studios building multi-client apps',
      structure: [
        { label: 'Attention', desc: 'Hook on their live client portfolio or current tech stack.' },
        { label: 'Interest', desc: 'Share how other teams execute 200+ tests 3x faster without leaving their keyboards.' },
        { label: 'Desire', desc: 'Paint the picture of zero-lag defect tracking and Firestore cloud sync.' },
        { label: 'Action', desc: 'Ask for a quick 5-minute video glance.' }
      ]
    },
    {
      id: 'BAB',
      name: 'BAB (Before - After - Bridge)',
      bestFor: 'Fast-growing startups with rapid release cycles',
      structure: [
        { label: 'Before', desc: 'Pain of messy spreadsheets and slow Jira clicks during crunch time.' },
        { label: 'After', desc: 'Clean, hotkey-driven execution with immediate pass/fail/block shortcuts.' },
        { label: 'Bridge', desc: 'InfratechAI QA Manager bridges the gap in minutes.' }
      ]
    }
  ];

  const currentFw = frameworks.find(f => f.id === selectedFramework) || frameworks[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-600" />
          Harvey Campaign Sequence & Copywriting Playbooks
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Based on Harvey's proven 2026 outbound email heuristics: 3-step sequences, under 75 words, zero fluff.
        </p>
      </div>

      {/* 3-Step Cold Outreach Sequence Visualizer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Harvey 3-Stage Outreach Engine</h2>
          <p className="text-xs text-slate-500">Every prospect moves through an automated cadenced sequence until reply or break-up.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                Day 1 • Max 75 Words
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">The Observable Signal Hook</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              References an exact fact from website profiling (e.g. "Saw you're scaling QA for your fintech app"). No generic openers.
            </p>
            <div className="text-[11px] font-semibold text-indigo-800 bg-white p-2.5 rounded-xl border border-indigo-100">
              Goal: Start a conversation, never pitch full pricing immediately.
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                Day 4 • Max 75 Words
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">The Specific Case Proof</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shares concrete workflow contrast (e.g., "Testers execute 200 test cases with P/F/B hotkeys in 12 mins instead of 45 mins in Jira").
            </p>
            <div className="text-[11px] font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
              Goal: Establish technical credibility and reduce friction.
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                Day 8 • Max 40 Words
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">The Polite Break-up</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Polite closure: "Assume testing cycles are dialed in right now. I'll step out of your inbox unless you'd like a link to test drive."
            </p>
            <div className="text-[11px] font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
              Highest conversion: 38% of responses occur on the break-up email.
            </div>
          </div>

        </div>
      </div>

      {/* Sales Frameworks & Anti-AI Fluff Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Framework Selector */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Select Framework</h3>
            <div className="flex gap-1.5">
              {frameworks.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFramework(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFramework === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.id}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="font-bold text-sm text-slate-900">{currentFw.name}</div>
            <div className="text-xs text-slate-500 font-medium">Best for: {currentFw.bestFor}</div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              {currentFw.structure.map((item, idx) => (
                <div key={idx} className="text-xs flex items-start gap-2">
                  <span className="font-bold text-indigo-700 min-w-[70px] shrink-0">{item.label}:</span>
                  <span className="text-slate-600">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Cliché Banned Words Monitor */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-base">Strict Anti-AI Ban List</h3>
          </div>
          <p className="text-xs text-slate-500">
            Harvey rejects any email draft containing these robotic phrases. Humans immediately recognize and delete AI spam.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              'Hope this finds you well',
              'I wanted to reach out',
              'Circling back on this',
              'Game-changer for your team',
              'In today’s fast-paced world',
              'Delve into your workflow',
              'Revolutionize testing',
              'Synergy across teams'
            ].map((phrase, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/70 border border-rose-200/60 text-rose-900 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>"{phrase}"</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Harvey writes like a busy founder typing a quick note between meetings.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
