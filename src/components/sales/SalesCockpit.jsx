import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, CheckCircle2, Clock, Mail, Users, ArrowUpRight, 
  Send, AlertCircle, RefreshCw, Sliders, ShieldCheck, Zap,
  Play, Pause, Flame, Terminal, Eye, ExternalLink
} from 'lucide-react';

export const SalesCockpit = ({ 
  leads = [], 
  outbox = [], 
  conversations = [], 
  settings = {}, 
  onNavigateTab,
  onOpenSettings,
  onRunHeartbeat
}) => {
  const [countdown, setCountdown] = useState(8 * 60 + 42); // 8m 42s countdown
  const [isRunningCycle, setIsRunningCycle] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 15 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleManualCycle = async () => {
    setIsRunningCycle(true);
    if (onRunHeartbeat) await onRunHeartbeat();
    setTimeout(() => {
      setIsRunningCycle(false);
      setCountdown(15 * 60);
    }, 1800);
  };

  const pendingApprovals = outbox.filter(o => o.status === 'pending_approval');
  const verifiedLeads = leads.filter(l => l.emailStatus === 'verified');
  const activeConversations = conversations.length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner / Harvey SDR Status Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    Harvey Autonomous AI SDR
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online & Closing
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-300">
                  Targeting prospects & writing human-level cold outreach for <span className="font-semibold text-white">InfratechAI QA Manager</span>
                </p>
              </div>
            </div>
          </div>

          {/* Model Provider & Cycle Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Active AI Model Badge */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Engine</div>
                <div className="font-bold text-white">
                  {settings.provider === 'gemini' ? 'InfratechAI Neural SDR' : 
                   settings.provider === 'claude' ? 'Claude 3.7 Sonnet' : 'OpenAI GPT-4o'}
                </div>
              </div>
            </div>

            {/* Heartbeat Status */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
              <Clock className="w-4 h-4 text-indigo-300 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Heartbeat Timer</div>
                <div className="font-mono font-bold text-white">{formatCountdown(countdown)}</div>
              </div>
            </div>

            {/* Run Now Button */}
            <button
              onClick={handleManualCycle}
              disabled={isRunningCycle}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />
              {isRunningCycle ? 'Executing Cycle...' : 'Run Cycle Now'}
            </button>

            {/* Engine Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl border border-white/15 transition-all cursor-pointer"
              title="Configure Brain, ICP & Mailbox"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Pending Approvals (Decisions Desk) */}
        <div 
          onClick={() => onNavigateTab('outbox')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outbox Waiting</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{pendingApprovals.length}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Needs Your 'A'
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Harvey approval ladder</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </p>
        </div>

        {/* Metric 2: Discovered Leads */}
        <div 
          onClick={() => onNavigateTab('leads')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profiled Companies</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{leads.length}</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {verifiedLeads.length} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Buying signals analyzed</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </p>
        </div>

        {/* Metric 3: Active Conversations */}
        <div 
          onClick={() => onNavigateTab('conversations')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Replies & Objections</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeConversations}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              1 Ready to Book
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>LAARC objection handling</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </p>
        </div>

        {/* Metric 4: API Cost / Token Burn */}
        <div 
          onClick={onOpenSettings}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Token Cost</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">$0.00</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Zero Per-Token API
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Runs on free tier or sub</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </p>
        </div>
      </div>

      {/* Two Column Layout: Pending Outbox Desk Spotlight & Pipeline Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Decisions Desk Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Harvey Decisions Desk (Outbox)
              </h2>
              <p className="text-xs text-slate-500">
                Deterministic pre-send gate: Nothing sends until approved with 'A'
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('outbox')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Open Full Desk <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">All Outbox Emails Drained</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No drafts are waiting on your approval. Harvey will scout new prospects during the next heartbeat cycle.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.slice(0, 2).map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.recipientName}</span>
                        <span className="text-xs text-slate-500">• {item.recipientTitle} at {item.companyName}</span>
                      </div>
                      <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                        Hook: "{item.signalHook}"
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      {item.wordCount} words (Under 75 cap)
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 border border-slate-100 font-sans leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-slate-900 block mb-1">Subject: {item.subject}</span>
                    {item.body}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Framework: {item.framework}</span>
                    <button
                      onClick={() => onNavigateTab('outbox')}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Review in Decisions Desk →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Autonomous Agent Engine Activity & Rules */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              Harvey Sub-Agents
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Scout Agent</div>
                  <div className="text-slate-500 text-[11px]">Finds companies & extracts tech stack</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Idle</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Writer Agent</div>
                  <div className="text-slate-500 text-[11px]">Drafts 3-stage sequences (&lt;75 words)</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Active</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Handler Agent</div>
                  <div className="text-slate-500 text-[11px]">Polls inbox & applies LAARC objection logic</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Listening</span>
              </div>
            </div>

            {/* Anti-AI Fluff Policy */}
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/60 text-[11px] text-purple-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-purple-950">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Harvey Anti-AI Banned Phrases
              </div>
              <p className="text-purple-800/90 leading-tight">
                Hard banned: "Hope this finds you well", "I wanted to reach out", "delve", "game-changer". Guaranteed human conversion rates.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
