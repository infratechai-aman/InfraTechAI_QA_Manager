import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, CheckCircle2, Clock, Mail, Users, ArrowUpRight, 
  RefreshCw, Sliders, ShieldCheck, Zap, Flame, Terminal, Plus,
  ExternalLink, Moon, Sun, DollarSign, Check
} from 'lucide-react';

export const SalesCockpit = ({ 
  leads = [], 
  outbox = [], 
  conversations = [], 
  settings = {}, 
  onNavigateTab,
  onOpenSettings,
  onRunHeartbeat,
  onToggleAutopilot,
  onToggleSession,
  sessionActive,
  onAddConversation
}) => {
  const [countdown, setCountdown] = useState(15 * 60);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [isAutopilot, setIsAutopilot] = useState(() => settings.autopilotMode !== false);
  const [isSessionActive, setIsSessionActive] = useState(() => sessionActive ?? (settings.sessionActive ?? false));

  useEffect(() => {
    setIsSessionActive(sessionActive ?? (settings.sessionActive ?? false));
  }, [sessionActive, settings.sessionActive]);

  const handleToggleSessionClick = () => {
    const nextState = !isSessionActive;
    setIsSessionActive(nextState);
    if (onToggleSession) {
      onToggleSession(nextState);
    }
  };

  const handleSimulateSampleDeal = () => {
    if (!onAddConversation) return;
    const sample = {
      companyName: 'Lone Star Maid Co (Dallas, TX)',
      contactName: 'Sarah Jenkins',
      contactEmail: 'sarah@lonestarmaids.com',
      stage: 'demo_in_progress',
      dealValue: 499,
      summary: 'Sarah inquired about replacing their slow 2014 WordPress site. Harvey negotiated $499 flat rate and promised a 24-hr live custom preview.',
      lastReplyTime: 'Just now',
      messages: [
        {
          sender: 'prospect',
          sentAt: '2 hours ago',
          content: 'Hi Harvey, saw your note. How much does a redesign cost? Our current WordPress site is slow and we don\'t have mobile instant booking.'
        },
        {
          sender: 'harvey',
          sentAt: '1 hour ago',
          content: 'Hi Sarah — our full turnkey redesign with instant mobile booking is usually $799, but we can do it for $499 flat all-inclusive for Lone Star Maids.\n\nBetter yet: I\'ll build a live custom preview for your company within 24 hours so you can test it on your phone first. If you love it, we hook up your domain; if not, you pay nothing.\n\nFair enough?'
        },
        {
          sender: 'prospect',
          sentAt: 'Just now',
          content: 'Sounds great Harvey! Show me the preview tomorrow and if my partner likes it we will take it.'
        },
        {
          sender: 'harvey',
          sentAt: 'Just now',
          content: 'Awesome Sarah! I\'m putting our team on it right now. You\'ll receive your custom interactive preview link in under 24 hours.\n\nYou can tap through on your phone and test the quote calculator. Once you\'re 100% happy with it, we take the $499 payment and switch your domain over live.'
        }
      ]
    };
    onAddConversation(sample);
  };

  useEffect(() => {
    setIsAutopilot(settings.autopilotMode !== false);
  }, [settings.autopilotMode]);

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

  const handleToggleAutopilotMode = () => {
    const nextVal = !isAutopilot;
    setIsAutopilot(nextVal);
    if (onToggleAutopilot) onToggleAutopilot(nextVal);
  };

  const pendingApprovals = outbox.filter(o => o.status === 'pending_approval');
  const verifiedLeads = leads.filter(l => l.emailStatus === 'verified');
  const activeConversations = conversations.length;
  const demosPromisedCount = conversations.filter(c => ['demo_in_progress', 'ready_to_book', 'closed_won'].includes(c.stage)).length;
  const demoUrl = settings.portfolioUrl || 'https://housecleaning-998d3.web.app/';

  return (
    <div className="p-3.5 sm:p-6 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Top Banner / Harvey SDR Status Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    Harvey Autonomous Sales Engine
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isAutopilot 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isAutopilot ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {isAutopilot ? 'Sleep Autopilot Active (24/7)' : 'Manual Review Gate'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs md:text-sm text-slate-300 mt-0.5">
                  <span>Targeting US House Cleaning companies with outdated sites</span>
                  <span className="text-slate-500">•</span>
                  <a 
                    href={demoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition-colors"
                  >
                    <span>Live Demo: {demoUrl.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Autopilot & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sleep Autopilot Toggle */}
            <button
              onClick={handleToggleAutopilotMode}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isAutopilot 
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-white/10 border-white/15 text-slate-300 hover:bg-white/15'
              }`}
              title="When active, Harvey drafts, negotiates $499-$899, and books 24-hr custom previews even as you sleep"
            >
              <Moon className={`w-3.5 h-3.5 ${isAutopilot ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isAutopilot ? 'Sleep Mode: ON' : 'Sleep Mode: OFF'}</span>
            </button>

            {/* Price Anchor Badge */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
              <DollarSign className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pricing Anchor</div>
                <div className="font-bold text-white">$499 - $899 USD</div>
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

      {/* Live Niche Callout Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-emerald-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Niche: House Keeping & Maid Services Modernization</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                24H Custom Demo Close
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-0.5">
              Pitching USA cleaners with sloppy sites • Harvey negotiates <strong className="text-slate-900">$499 - $899 USD</strong> and guarantees a custom live preview in 24 hours.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-300 shadow-xs transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Demo Site</span>
          </a>
          <button
            onClick={() => onNavigateTab('leads')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cleaners List</span>
          </button>
        </div>
      </div>

      {/* MASTER HARVEY WORKING SESSION CONTROLLER (START / REST) */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isSessionActive 
          ? 'bg-gradient-to-r from-slate-950 via-emerald-950/80 to-slate-950 text-white border-emerald-500/50 shadow-lg shadow-emerald-950/20' 
          : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-slate-800 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-transform ${
              isSessionActive 
                ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/25 shadow-lg shadow-emerald-500/30 animate-pulse' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isSessionActive ? '⚡' : '😴'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-black text-base sm:text-lg text-white">
                  {isSessionActive ? 'Harvey Session: ACTIVE (Working)' : 'Harvey Is Resting (Standby Mode)'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                  isSessionActive 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isSessionActive ? '🟢 Working Nationwide USA' : '⏸️ Resting — Mails & Replies Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {isSessionActive
                  ? 'Harvey is actively scanning USA cleaners (outdated sites + zero-website profiles), sending 1-to-1 outreach via your Gmail, auto-negotiating $499-$899 + $20/mo maintenance, and promising 24h custom live previews.'
                  : 'Harvey will NOT send any cold emails or automatic replies while resting. Click "Start Harvey Working Session" whenever you want him to begin operating.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span className="font-semibold text-emerald-300">
                  ✓ Turnkey Build: $499 - $899 USD
                </span>
                <span>•</span>
                <span className="font-semibold text-purple-300">
                  ✓ Maintenance: $20/mo or $200/yr
                </span>
                <span>•</span>
                <span className="font-semibold text-amber-300">
                  ✓ Calls: Fixed within 24 hours
                </span>
                <span>•</span>
                <span className="font-semibold text-sky-300">
                  ✓ 24h Custom Demo Guarantee
                </span>
              </div>
            </div>
          </div>

          {/* Master Start / Rest Button */}
          <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
            {isSessionActive ? (
              <button
                onClick={handleToggleSessionClick}
                className="w-full md:w-auto px-6 py-3.5 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 hover:text-amber-200 border border-amber-500/50 font-black text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>⏸️ Put Harvey to Rest</span>
              </button>
            ) : (
              <button
                onClick={handleToggleSessionClick}
                className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>▶️ Start Harvey Working Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Metric 1: Pending Approvals (Decisions Desk) */}
        <div 
          onClick={() => onNavigateTab('outbox')}
          className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Outbox Waiting</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">{pendingApprovals.length}</span>
            <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full border truncate ${
              pendingApprovals.length > 0 
                ? 'text-amber-600 bg-amber-50 border-amber-200' 
                : 'text-slate-500 bg-slate-50 border-slate-200'
            }`}>
              {pendingApprovals.length > 0 ? "Pending 'A'" : 'Clean'}
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
          className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">US Cleaners</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">{leads.length}</span>
            <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-indigo-200 truncate">
              {verifiedLeads.length} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Sloppy site signals</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </p>
        </div>

        {/* Metric 3: Active Negotiations */}
        <div 
          onClick={() => onNavigateTab('conversations')}
          className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Negotiations</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">{activeConversations}</span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200 truncate">
              {demosPromisedCount > 0 ? `${demosPromisedCount} Demos Booked` : `${activeConversations} Threads`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>$499-$899 Deal Engine</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </p>
        </div>

        {/* Metric 4: Pricing Target */}
        <div 
          onClick={onOpenSettings}
          className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Deal Size Range</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">$499-$899</span>
            <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-200 truncate">
              Turnkey
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>24h Demo → Pay to Launch</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </p>
        </div>
      </div>

      {/* SECTION: CLIENT WORK ORDERS & 24-HOUR DEMOS ("JO KAAM AAYA WOH") */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Active Client Work Orders & 24h Demos ("Jo Kaam Aaya")
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {conversations.length} Orders In Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live deals negotiated by Harvey ($499 - $899 USD). Clients waiting for custom live previews before domain switch & payment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('conversations')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Inbound & Replies Desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">No Active Client Orders Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Jab Harvey cold outreach bhejega aur client reply karega, unki poori summary, negotiated price ($499-$899), aur 24h demo order yahan live dikhega!
              </p>
            </div>
            <div className="pt-1">
              <button
                onClick={handleSimulateSampleDeal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Sample Client Order ($499 + 24h Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversations.map((c) => {
              const lastMsg = (c.messages || []).slice(-1)[0]?.content || '';
              return (
                <div
                  key={c.id}
                  onClick={() => onNavigateTab('conversations')}
                  className="bg-slate-50 hover:bg-indigo-50/40 p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {c.companyName}
                      </h4>
                      <p className="text-xs text-slate-500">{c.contactName} • {c.contactEmail}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      ${c.dealValue || 499} USD
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 line-clamp-3 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-0.5 text-[11px] uppercase tracking-wider text-indigo-700">
                      Latest Activity:
                    </span>
                    "{lastMsg}"
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Clock className="w-3 h-3" />
                      24h Demo In Progress
                    </span>
                    <span className="font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
                      View Thread <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Layout: Decisions Desk Spotlight & Harvey Autonomous Sub-Agents */}
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
                {isAutopilot 
                  ? 'Sleep Autopilot active: Previews generated and sent autonomously according to rules'
                  : "Deterministic pre-send gate: Nothing sends until approved with 'A'"}
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
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">All Outbox Outreach Drained</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {leads.length > 0 
                    ? "No cold emails are awaiting approval. You can draft tailored house cleaning outreach for any prospect in your pipeline." 
                    : "No drafts waiting. Add US cleaning companies to queue hyper-personalized 50-word cold emails."}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('leads')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <span>{leads.length > 0 ? 'Draft House Cleaning Outreach' : 'Find US Cleaning Prospects'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
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
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                        Hook: "{item.signalHook}"
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      {item.wordCount} words (Under 65 cap)
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 border border-slate-100 font-sans leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-slate-900 block mb-1">Subject: {item.subject}</span>
                    {item.body}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Framework: {item.framework || 'PAS'}</span>
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
              Harvey Autonomous Sub-Agents
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Scout Agent</div>
                  <div className="text-slate-500 text-[11px]">Finds US cleaners & flags sloppy/non-mobile sites</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  leads.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {leads.length > 0 ? `${leads.length} Profiled` : 'Ready to Scout'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Copywriter Agent</div>
                  <div className="text-slate-500 text-[11px]">Drafts 50-word cold emails referencing demo</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pendingApprovals.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {pendingApprovals.length > 0 ? `${pendingApprovals.length} In Outbox` : 'Standby'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Negotiator Agent</div>
                  <div className="text-slate-500 text-[11px]">Negotiates $499-$899 & locks 24h demos</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeConversations > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {activeConversations > 0 ? `${activeConversations} Dialogues` : 'Listening'}
                </span>
              </div>
            </div>

            {/* Persona Rule: Employee Mode */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/70 text-[11px] text-emerald-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Employee Persona Protocol
              </div>
              <p className="text-emerald-800/90 leading-tight">
                Harvey acts strictly as a real human Senior Web Consultant. Never reveals AI, bot, or virtual assistant identity. Closes clients with 24-hour custom live previews.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
