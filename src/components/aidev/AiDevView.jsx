import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, Cpu, Volume2, VolumeX, Square,
  RotateCcw, ArrowRight, Activity, Building2, 
  CheckSquare, Bot, Copy, Check, ShieldAlert,
  FileText
} from 'lucide-react';
import {
  Attachment01Icon,
  Briefcase01Icon,
  Bug01Icon,
  Globe02Icon,
  Task01Icon,
  UserGroupIcon
} from '@hugeicons/core-free-icons';
import PromptBar from '../ui/PromptBar';
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
  const [currentSpeakingId, setCurrentSpeakingId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('infratech-neural');
  const [selectedEffort, setSelectedEffort] = useState('Balanced');
  const messagesEndRef = useRef(null);

  // Compute live system context
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

  // Initial welcome message
  const [messages, setMessages] = useState(() => {
    const greetingSpoken = `Namaste ${currentUser?.displayName || 'Engineer'}! Main aapka AI Dev copilot hoon. Mere paas QA Manager, Sales Manager aur Business Command Center ki 100% real-time jaankari hai. Aap mujhse kisi bhi project, contract expiry ya bugs ke baare me pooch sakte hain.`;
    
    const greetingMd = `### 👋 Hello ${currentUser?.displayName || 'Engineer'}, I am AI DEV!

I am your Autonomous Technical Lead & Unified Intelligence Copilot. I hold **live, real-time telemetry** across the entire InfratechAI platform:

- 🏢 **Business Command Center:** All **${liveContext.business.totalContracts} client contracts**, expiration deadlines, and **$${liveContext.business.totalMRR.toLocaleString()}/mo MRR**.
- 🧪 **QA Manager:** **${liveContext.qa.projectsCount} workspaces**, **${liveContext.qa.totalTests} tests** (${liveContext.qa.passRate}% pass rate), and **${liveContext.qa.openBugsCount} open defects**.
- 🤖 **Sales SDR (Harvey):** **${liveContext.sales.totalLeads} prospects** & **${liveContext.sales.pendingApprovalsCount} pending outbox drafts**.

> 🎙️ **Voice is active!** Ask me in Hindi or English: *"Kiska contract kabtak hain?"*, *"Kaunse bugs critical hain?"*, or use the quick prompts and command bar below.`;

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

  // Auto-scroll on new messages or thinking state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      aiDevService.stopSpeaking();
    };
  }, []);

  const handleSpeakText = (msgId, spokenText) => {
    if (!spokenText) return;
    if (isSpeaking && currentSpeakingId === msgId) {
      aiDevService.stopSpeaking();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      return;
    }

    setIsSpeaking(true);
    setCurrentSpeakingId(msgId);
    aiDevService.speak(spokenText, {
      onStart: () => {
        setIsSpeaking(true);
        setCurrentSpeakingId(msgId);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      }
    });
  };

  const handleStopSpeech = () => {
    aiDevService.stopSpeaking();
    setIsSpeaking(false);
    setCurrentSpeakingId(null);
  };

  const handleCopy = (id, text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSend = useCallback((rawText, meta = {}) => {
    const query = (rawText || '').trim();
    if (!query && (!meta.attachments || meta.attachments.length === 0)) return;

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      attachments: meta.attachments || [],
      model: meta.model?.name || 'Infratech Neural 4.5',
      effort: meta.effort || selectedEffort,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    // Evaluate query using real-time service
    setTimeout(() => {
      const response = aiDevService.processQuery(query, liveContext);
      setIsThinking(false);

      const aiMessageId = `msg_ai_${Date.now()}`;
      const aiMessage = {
        id: aiMessageId,
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
        setCurrentSpeakingId(aiMessageId);
        aiDevService.speak(response.spokenText, {
          onStart: () => {
            setIsSpeaking(true);
            setCurrentSpeakingId(aiMessageId);
          },
          onEnd: () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
          },
          onError: () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
          }
        });
      }
    }, 450);
  }, [liveContext, isVoiceEnabled, selectedEffort]);

  // Voice speech-to-text dictation integration
  const handleDictate = () => {
    return new Promise((resolve) => {
      const SpeechRecognition = typeof window !== 'undefined' && 
        (window.SpeechRecognition || window.webkitSpeechRecognition);

      if (!SpeechRecognition) {
        alert("Voice dictation is supported in Google Chrome, Microsoft Edge, and Safari.");
        return resolve('');
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Dual Hindi / Indian English recognition
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (e) => {
          const text = e.results?.[0]?.[0]?.transcript || '';
          resolve(text);
        };
        recognition.onerror = () => {
          resolve('');
        };
        recognition.onend = () => {
          resolve('');
        };
        recognition.start();
      } catch {
        resolve('');
      }
    });
  };

  // Device File Attachment Picker
  const handleAttach = () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = (e) => {
        const fileNames = Array.from(e.target.files || []).map(f => f.name);
        resolve(fileNames);
      };
      input.click();
    });
  };

  // Sources for PromptBar @ menu
  const promptSources = [
    {
      key: 'files',
      name: 'Photos & files',
      description: 'Upload logs, specs or test captures',
      icon: Attachment01Icon,
      attach: true
    },
    {
      key: 'contracts',
      name: 'Contracts & MRR',
      description: 'Active client retainers, renewal dates, SLA',
      icon: Briefcase01Icon
    },
    {
      key: 'qa',
      name: 'QA Test Suites',
      description: 'Test cases, pass rates and suites',
      icon: Task01Icon
    },
    {
      key: 'bugs',
      name: 'Defects & Bugs',
      description: 'Active bugs, blockers & high severity issues',
      icon: Bug01Icon
    },
    {
      key: 'sales',
      name: 'Sales SDR (Harvey)',
      description: 'Prospect pipeline and pending outbox drafts',
      icon: UserGroupIcon
    },
    {
      key: 'web',
      name: 'Web Telemetry',
      description: 'Real-time platform status & external feeds',
      icon: Globe02Icon
    }
  ];

  // Slash commands for PromptBar / menu
  const promptCommands = [
    { key: 'contracts', name: '/contracts', description: 'List all active client contracts and renewal dates' },
    { key: 'expiring', name: '/expiring', description: 'Check contracts expiring within 30 days' },
    { key: 'bugs', name: '/bugs', description: 'Show open bugs and breakdown by severity' },
    { key: 'passrate', name: '/passrate', description: 'QA test suites execution status and pass rate' },
    { key: 'summary', name: '/summary', description: 'Real-time executive briefing of entire platform' },
    { key: 'sales', name: '/sales', description: 'Inspect SDR leads and pending decisions desk drafts' },
    { key: 'explain', name: '/explain', description: 'A plain-language walkthrough of telemetry' }
  ];

  // Models for PromptBar model picker
  const promptModels = [
    { key: 'infratech-neural', name: 'Infratech Neural 4.5', tag: 'Flagship' },
    { key: 'gemini-2-flash', name: 'Gemini 2.0 Flash', tag: 'Fast' },
    { key: 'claude-3-7', name: 'Claude 3.7 Sonnet', tag: 'Deep' }
  ];

  // Reasoning efforts for PromptBar slider
  const promptEfforts = ['Instant', 'Fast', 'Balanced', 'Deep Think', 'Max Reasoning'];

  // Gemini-style quick suggestion cards
  const suggestionCards = [
    {
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      title: 'Kiska contract kabtak hai?',
      desc: 'Check all client contracts, expiration deadlines, and monthly MRR',
      query: 'Kiska contract kabtak hain aur kab expire hoga?'
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      title: 'Contracts expiring in 30 days',
      desc: 'Find imminent renewals and immediate retainer deadlines',
      query: 'Konsa contract agle 30 din me expire ho raha hai?'
    },
    {
      icon: <CheckSquare className="w-5 h-5 text-indigo-600" />,
      title: 'QA test execution & pass rate',
      desc: 'Inspect workspaces, total test cases, and live pass rate',
      query: 'QA test execution aur pass rate ka live status do'
    },
    {
      icon: <Bot className="w-5 h-5 text-purple-600" />,
      title: 'Critical defects & open bugs',
      desc: 'Break down all open defects by workspace and severity level',
      query: 'Kitne bugs open hain aur critical bugs ki list do'
    }
  ];

  const isOnlyWelcome = messages.length === 1;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER (CHATGPT / GEMINI MINIMAL BAR)             */}
      {/* ======================================================== */}
      <header className="px-6 py-3 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shrink-0 flex items-center justify-between gap-4 z-30 shadow-2xs">
        
        {/* Left: Model & Agent Branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">AI DEV</span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-600" />
              <span>{promptModels.find(m => m.key === selectedModel)?.name || 'Neural 4.5'}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Telemetry
            </span>
          </div>
        </div>

        {/* Right: Audio Waveform & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Animated Audio Equalizer when speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold animate-fadeIn shadow-2xs">
              <div className="flex items-end gap-0.5 h-3.5 w-5">
                <span className="w-1 bg-cyan-600 animate-bounce h-2.5 rounded-full" />
                <span className="w-1 bg-cyan-600 animate-bounce h-3.5 rounded-full [animation-delay:0.15s]" />
                <span className="w-1 bg-cyan-600 animate-bounce h-1.5 rounded-full [animation-delay:0.3s]" />
                <span className="w-1 bg-cyan-600 animate-bounce h-3 rounded-full [animation-delay:0.45s]" />
              </div>
              <span className="text-[11px] ml-0.5">Speaking</span>
              <button
                onClick={handleStopSpeech}
                className="ml-1 p-0.5 rounded hover:bg-cyan-100 text-cyan-900 transition-colors cursor-pointer"
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
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20 hover:bg-indigo-700' 
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 shadow-2xs'
            }`}
            title={isVoiceEnabled ? 'Voice response enabled (Click to mute)' : 'Voice response disabled (Click to enable)'}
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="text-[11px]">Voice: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Voice: OFF</span>
              </>
            )}
          </button>

          {/* Reset / New Chat */}
          <button
            onClick={() => {
              handleStopSpeech();
              setMessages(messages.slice(0, 1));
            }}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Start New Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. SUB-BAR: LIVE PLATFORM TELEMETRY PILLS               */}
      {/* ======================================================== */}
      <div className="px-6 py-2 bg-white/70 border-b border-slate-200/60 flex items-center gap-3 text-xs overflow-x-auto shrink-0 select-none backdrop-blur-xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
          <Activity className="w-3.5 h-3.5 text-indigo-600" /> Telemetry:
        </span>

        {/* Business Feed */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50/90 border border-emerald-200 text-emerald-800 shrink-0 text-[11px]">
          <Building2 className="w-3 h-3 text-emerald-600" />
          <span className="font-semibold">Contracts:</span>
          <span>{liveContext.business.totalContracts} Active</span>
          <span className="text-emerald-300">•</span>
          <span className="font-semibold">${liveContext.business.totalMRR.toLocaleString()}/mo</span>
          {liveContext.business.expiringSoonCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold text-[9px] border border-amber-200">
              {liveContext.business.expiringSoonCount} Expiring
            </span>
          )}
        </div>

        {/* QA Feed */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50/90 border border-indigo-200 text-indigo-800 shrink-0 text-[11px]">
          <CheckSquare className="w-3 h-3 text-indigo-600" />
          <span className="font-semibold">QA:</span>
          <span>{liveContext.qa.totalTests} Tests</span>
          <span className="text-indigo-300">•</span>
          <span className="font-semibold">{liveContext.qa.passRate}% Pass</span>
          <span className="text-indigo-300">•</span>
          <span className={`font-semibold ${liveContext.qa.openBugsCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {liveContext.qa.openBugsCount} Defects
          </span>
        </div>

        {/* Sales Feed */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-800 shrink-0 text-[11px]">
          <Bot className="w-3 h-3 text-amber-600" />
          <span className="font-semibold">Sales:</span>
          <span>{liveContext.sales.totalLeads} Leads</span>
          <span className="text-amber-300">•</span>
          <span className="font-semibold">{liveContext.sales.pendingApprovalsCount} Drafts Pending</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CHAT CONTAINER (CENTERED CHATGPT/GEMINI LAYOUT)   */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-44">
        <div className="max-w-3xl mx-auto w-full space-y-6">

          {/* Gemini-Style Welcome Hero when starting fresh */}
          {isOnlyWelcome && (
            <div className="pt-4 pb-6 text-center space-y-3 animate-fadeIn">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-100 shadow-inner">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hello, {currentUser?.displayName || 'Engineer'}
              </h2>
              <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto font-normal">
                How can I assist your engineering and business operations today? I hold real-time live telemetry across all active apps.
              </p>

              {/* Gemini 2x2 Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 text-left">
                {suggestionCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(card.query)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                        {card.icon}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Stream */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            if (isUser) {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1.5 animate-fadeIn">
                  {/* File Attachment Chips */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {msg.attachments.map((file, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
                          <FileText className="w-3 h-3" />
                          <span>{file}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* User Bubble */}
                  <div className="bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 text-slate-900 rounded-3xl px-5 py-3 text-[14px] leading-relaxed max-w-[85%] shadow-2xs font-normal">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mr-2">{msg.timestamp}</span>
                </div>
              );
            }

            // AI Assistant Response
            return (
              <div key={msg.id} className="flex items-start gap-3.5 animate-fadeIn">
                
                {/* Assistant Sparkle Avatar */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>

                {/* Assistant Message Body */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">AI DEV</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded-md font-semibold">
                      Neural Copilot
                    </span>
                    <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
                  </div>

                  <div className="text-slate-800 text-[14px] leading-relaxed prose prose-slate max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node: _node, ...props }) => (
                          <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse divide-y divide-slate-100" {...props} />
                          </div>
                        ),
                        th: ({ node: _node, ...props }) => (
                          <th className="py-2.5 px-3.5 font-bold text-slate-600 bg-slate-50 text-xs" {...props} />
                        ),
                        td: ({ node: _node, ...props }) => (
                          <td className="py-2 px-3.5 text-slate-700 border-t border-slate-100 text-xs" {...props} />
                        ),
                        blockquote: ({ node: _node, ...props }) => (
                          <blockquote className="border-l-3 border-indigo-500 bg-indigo-50/50 pl-3.5 py-2 rounded-r-xl text-indigo-950 my-3 text-xs leading-relaxed" {...props} />
                        )
                      }}
                    >
                      {msg.markdown}
                    </ReactMarkdown>
                  </div>

                  {/* Deep Link Action Pill */}
                  {msg.actionSuggestion && onSwitchApp && (
                    <div className="pt-2 flex items-center">
                      <button
                        onClick={() => onSwitchApp(msg.actionSuggestion.targetApp)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>{msg.actionSuggestion.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Action Toolbar: Read Aloud & Copy */}
                  <div className="flex items-center gap-3 pt-1 text-slate-400 text-xs">
                    {msg.spokenText && (
                      <button
                        onClick={() => handleSpeakText(msg.id, msg.spokenText)}
                        className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer text-xs ${
                          isSpeaking && currentSpeakingId === msg.id 
                            ? 'text-indigo-600 font-bold' 
                            : 'hover:text-slate-700'
                        }`}
                        title="Read aloud with Web Speech synthesis"
                      >
                        {isSpeaking && currentSpeakingId === msg.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(msg.id, msg.markdown)}
                      className="flex items-center gap-1.5 hover:text-slate-700 font-medium transition-colors cursor-pointer text-xs"
                      title="Copy response markdown"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thinking State Indicator */}
          {isThinking && (
            <div className="flex items-start gap-3.5 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs text-indigo-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>AI Dev is analyzing live telemetry across QA suites, client contracts & SDR outbox...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. BOTTOM FLOATING PROMPTBAR DOCK (REACT BITS PROMPTBAR)  */}
      {/* ======================================================== */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-8 pb-4 px-4 flex flex-col items-center pointer-events-auto">
        <div className="w-full max-w-3xl flex flex-col items-center">
          <PromptBar
            placeholder="Ask anything about contracts, QA, bugs, or type / for commands..."
            sources={promptSources}
            commands={promptCommands}
            models={promptModels}
            defaultModel={selectedModel}
            efforts={promptEfforts}
            defaultEffort={selectedEffort}
            onEffortChange={(eff) => setSelectedEffort(eff)}
            busy={isThinking}
            onSend={(text, meta) => handleSend(text, meta)}
            onStop={() => {
              handleStopSpeech();
              setIsThinking(false);
            }}
            onAttach={handleAttach}
            onDictate={handleDictate}
            background="#ffffff"
            color="#0f172a"
            menuBackground="#ffffff"
            sparkColor="#6366f1"
            sparkBoost={1.2}
            width={768}
            radius={20}
            maxRows={6}
            morphDuration={240}
            squash={0.12}
            tilt={8}
            pressScale={0.96}
            className="w-full shadow-lg shadow-indigo-500/5"
          />

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            AI Dev uses live in-memory telemetry across InfratechAI. Verify critical contract terms & QA sign-offs.
          </p>
        </div>
      </div>

    </div>
  );
};
