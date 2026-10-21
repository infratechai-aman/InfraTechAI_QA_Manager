import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Cpu, Volume2, VolumeX, Send, Sparkles, Building2, 
  CheckSquare, Bot, AlertTriangle, Play, Square,
  RotateCcw, ArrowRight, ShieldCheck, Activity, Terminal
} from 'lucide-react';
import { aiDevService } from '../../services/aiDevService';

export const AiDevView = ({
  currentUser,
  projects = [],
  files = [],
  tests = [],
  bugs = [],
  contracts = [],
  leads = [],
  outbox = [],
  syncStatus = 'synced',
  onSwitchApp
}) => {
  // Speech & Voice State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Compute live context
  const liveContext = useMemo(() => {
    return aiDevService.gatherLiveContext({
      projects,
      files,
      tests,
      bugs,
      contracts,
      leads,
      outbox,
      currentUser,
      syncStatus
    });
  }, [projects, files, tests, bugs, contracts, leads, outbox, currentUser, syncStatus]);

  // Initial greeting
  const [messages, setMessages] = useState(() => {
    const greetingSpoken = `Namaste ${currentUser?.displayName || 'Engineer'}! Main aapka AI Dev copilot hoon. Mere paas QA Manager, Sales Manager aur Business Command Center ki 100% real-time jaankari hai. Aap mujhse kisi bhi project, contract expiry ya bugs ke baare me pooch sakte hain.`;
    
    const greetingMd = `### 👋 Hello ${currentUser?.displayName || 'Engineer'}, I am AI DEV!

I am your Autonomous Technical Lead & Unified Intelligence Copilot. I hold **live, real-time memory** across the entire InfratechAI platform:

- 🏢 **Business Command Center:** All **${liveContext.business.totalContracts} client contracts**, expiration deadlines, and **$${liveContext.business.totalMRR.toLocaleString()}/mo MRR**.
- 🧪 **QA Manager:** **${liveContext.qa.projectsCount} projects**, **${liveContext.qa.totalTests} tests** (${liveContext.qa.passRate}% pass rate), and **${liveContext.qa.openBugsCount} open defects**.
- 🤖 **Sales SDR (Harvey):** **${liveContext.sales.totalLeads} prospects** & **${liveContext.sales.pendingApprovalsCount} pending outbox drafts**.

> 🎙️ **Voice is active!** Ask me in Hindi or English: *"Kiska contract kabtak hain?"*, *"Kaunse bugs critical hain?"*, or click any quick prompt below.`;

    return [
      {
        id: 'msg_welcome',
        sender: 'ai',
        markdown: greetingMd,
        spokenText: greetingSpoken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      aiDevService.stopSpeaking();
    };
  }, []);

  const handleSpeakText = (spokenText) => {
    if (!spokenText) return;
    if (isSpeaking) {
      aiDevService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    aiDevService.speak(spokenText, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleStopSpeech = () => {
    aiDevService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleSend = (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsThinking(true);

    // Evaluate in real-time
    setTimeout(() => {
      const response = aiDevService.processQuery(query, liveContext);
      setIsThinking(false);

      const aiMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        markdown: response.markdown,
        spokenText: response.spokenText,
        actionSuggestion: response.actionSuggestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      // Automatically speak aloud if voice output is enabled
      if (isVoiceEnabled && response.spokenText) {
        setIsSpeaking(true);
        aiDevService.speak(response.spokenText, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false)
        });
      }
    }, 400);
  };

  const quickPrompts = [
    { label: '🏢 Kiska contract kabtak hain?', query: 'Kiska contract kabtak hain aur kab expire hoga?' },
    { label: '⚠️ Contracts expiring in 30 days', query: 'Konsa contract agle 30 din me expire ho raha hai?' },
    { label: '🐛 Kitne bugs open hain aur critical kisme hain?', query: 'Kitne bugs open hain aur critical bugs ki list do' },
    { label: '🧪 QA pass rate aur test status', query: 'QA test execution aur pass rate ka live status do' },
    { label: '📨 Sales outbox pending drafts', query: 'Sales outbox me kitne drafts pending review hain?' },
    { label: '⚡ Pura platform ka live executive summary do', query: 'Pura platform ka comprehensive real-time briefing do' }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-hidden">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TELEMETRY HUD                            */}
      {/* ======================================================== */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        
        {/* Left: AI Dev Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                AI DEV <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Autonomous Copilot</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time technical brain with Web Speech audio response across QA, Contracts & Sales.
            </p>
          </div>
        </div>

        {/* Right: Audio Waveform & Speech Toggle Controls */}
        <div className="flex items-center gap-3 self-end md:self-center">
          
          {/* Animated Audio Equalizer when speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-bold animate-fadeIn">
              <div className="flex items-end gap-0.5 h-4 w-6">
                <span className="w-1 bg-cyan-400 animate-bounce h-3 rounded-full" />
                <span className="w-1 bg-cyan-400 animate-bounce h-4 rounded-full [animation-delay:0.15s]" />
                <span className="w-1 bg-cyan-400 animate-bounce h-2 rounded-full [animation-delay:0.3s]" />
                <span className="w-1 bg-cyan-400 animate-bounce h-4 rounded-full [animation-delay:0.45s]" />
              </div>
              <span className="text-[11px] ml-1">AI Dev Speaking...</span>
              <button
                onClick={handleStopSpeech}
                className="ml-2 p-1 rounded-md hover:bg-cyan-900/60 text-cyan-200 transition-colors"
                title="Stop Speaking"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            </div>
          )}

          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) aiDevService.stopSpeaking();
              setIsVoiceEnabled(!isVoiceEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isVoiceEnabled 
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-500/40 shadow-md shadow-cyan-500/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={isVoiceEnabled ? 'Voice response enabled (Click to mute)' : 'Voice response disabled (Click to enable)'}
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-200 animate-pulse" />
                <span>Voice: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Voice: OFF</span>
              </>
            )}
          </button>

          {/* Reset Chat */}
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            title="Reset Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. REAL-TIME TELEMETRY HUD BAR                           */}
      {/* ======================================================== */}
      <div className="px-6 py-2 bg-slate-900/50 border-b border-slate-800/60 flex items-center gap-4 text-xs overflow-x-auto shrink-0 select-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 shrink-0">
          <Activity className="w-3 h-3 text-cyan-400" /> Live Feeds:
        </span>

        {/* Business Feed */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 shrink-0">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">Contracts:</span>
          <span className="font-bold text-white">{liveContext.business.totalContracts} Active</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-bold">${liveContext.business.totalMRR.toLocaleString()}/mo</span>
          {liveContext.business.expiringSoonCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
              {liveContext.business.expiringSoonCount} Expiring Soon
            </span>
          )}
        </div>

        {/* QA Feed */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 shrink-0">
          <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">QA:</span>
          <span className="font-bold text-white">{liveContext.qa.totalTests} Tests</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 font-bold">{liveContext.qa.passRate}% Pass</span>
          <span className="text-slate-500">•</span>
          <span className={`font-bold ${liveContext.qa.openBugsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {liveContext.qa.openBugsCount} Defects
          </span>
        </div>

        {/* Sales Feed */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 shrink-0">
          <Bot className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">Sales:</span>
          <span className="font-bold text-white">{liveContext.sales.totalLeads} Leads</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-bold">{liveContext.sales.pendingApprovalsCount} Drafts Pending</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CONVERSATION MESSAGES STREAM                          */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                isUser 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
              }`}>
                {isUser ? 'ME' : <Cpu className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}>
                {isUser ? (
                  <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none space-y-3">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node: _node, ...props }) => (
                          <div className="overflow-x-auto my-3">
                            <table className="w-full text-left text-xs border-collapse divide-y divide-slate-800" {...props} />
                          </div>
                        ),
                        th: ({ node: _node, ...props }) => (
                          <th className="py-2 px-3 font-bold text-slate-300 bg-slate-950/60 text-xs" {...props} />
                        ),
                        td: ({ node: _node, ...props }) => (
                          <td className="py-2 px-3 text-slate-300 border-t border-slate-800/60 text-xs" {...props} />
                        ),
                        blockquote: ({ node: _node, ...props }) => (
                          <blockquote className="border-l-2 border-cyan-500 pl-3 italic text-cyan-200 my-2" {...props} />
                        )
                      }}
                    >
                      {msg.markdown}
                    </ReactMarkdown>

                    {/* Action Suggestion Pill (e.g. "Open Business Command Center") */}
                    {msg.actionSuggestion && onSwitchApp && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                          onClick={() => onSwitchApp(msg.actionSuggestion.targetApp)}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{msg.actionSuggestion.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer with Timestamp and Read Aloud */}
                <div className="flex items-center justify-between gap-4 mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {!isUser && msg.spokenText && (
                    <button
                      onClick={() => handleSpeakText(msg.spokenText)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
                      title="Speak this response aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isSpeaking ? 'Listening...' : 'Read Aloud'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center animate-pulse">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Fetching real-time platform telemetry & computing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ======================================================== */}
      {/* 4. QUICK PROMPT DOCK                                     */}
      {/* ======================================================== */}
      <div className="px-4 md:px-6 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-cyan-400" /> Prompts:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 5. INPUT COMMAND BAR                                     */}
      {/* ======================================================== */}
      <div className="p-4 md:px-6 bg-slate-900/90 border-t border-slate-800 shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask anything in Hindi or English (e.g. 'Kiska contract kabtak hai?', 'Critical bugs dikhao')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className={`px-5 py-3 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              inputQuery.trim()
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-indigo-600 text-white shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Ask AI Dev</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
