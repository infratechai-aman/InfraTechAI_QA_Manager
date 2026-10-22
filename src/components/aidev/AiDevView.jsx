import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, Cpu, Volume2, VolumeX, Square,
  RotateCcw, ArrowRight, Activity, Building2, 
  CheckSquare, Bot, Copy, Check, ShieldAlert,
  FileText, Phone, PhoneOff, Mic, MicOff, Radio
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
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [selectedEffort, setSelectedEffort] = useState('Balanced');
  const messagesEndRef = useRef(null);

  // ========================================================
  // REAL-TIME TALKING / LIVE VOICE CALL MODE STATE
  // ========================================================
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  const [liveCallState, setLiveCallState] = useState('idle'); // 'connecting' | 'listening' | 'user_speaking' | 'thinking' | 'ai_speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastAiSpeech, setLastAiSpeech] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);

  const isLiveCallActiveRef = useRef(false);
  const liveCallStateRef = useRef('idle');
  const isMicMutedRef = useRef(false);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Sync refs with state
  useEffect(() => {
    isLiveCallActiveRef.current = isLiveCallActive;
  }, [isLiveCallActive]);

  useEffect(() => {
    liveCallStateRef.current = liveCallState;
  }, [liveCallState]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

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

  // Initial welcome message addressing user as "Boss"
  const [messages, setMessages] = useState(() => {
    const greetingSpoken = `Jai Hind Boss! Main aapka AI Dev copilot hoon. Mere paas QA Manager, Sales Manager aur Business Command Center ki 100% real-time jaankari hai. Boliye Boss, kis cheez ka direct update chahiye?`;
    
    const greetingMd = `### 🫡 Jai Hind Boss! AI DEV Live on Duty

I am your Autonomous Technical Lead & Unified Intelligence Copilot. I hold **live, real-time telemetry** across the entire InfratechAI platform for **Boss**:

- 🏢 **Business Command Center:** All **${liveContext.business.totalContracts} client contracts**, expiration deadlines, and **$${liveContext.business.totalMRR.toLocaleString()}/mo MRR**.
- 🧪 **QA Manager:** **${liveContext.qa.projectsCount} workspaces**, **${liveContext.qa.totalTests} tests** (${liveContext.qa.passRate}% pass rate), and **${liveContext.qa.openBugsCount} open defects**.
- 🤖 **Sales SDR (Harvey):** **${liveContext.sales.totalLeads} prospects** & **${liveContext.sales.pendingApprovalsCount} pending outbox drafts**.

> 🎙️ **Real-Time Voice Call is Active, Boss!** Click the **"Live Voice Call"** button to speak with me hands-free in real time, or ask me directly below!`;

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

  // Clean up speech synthesis & speech recognition on unmount
  useEffect(() => {
    return () => {
      aiDevService.stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
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

  // Process and send query
  const handleSend = useCallback(async (rawText, meta = {}) => {
    const query = (rawText || '').trim();
    if (!query && (!meta.attachments || meta.attachments.length === 0)) return;

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      attachments: meta.attachments || [],
      model: meta.model?.name || 'Infratech Neural (Gemini)',
      effort: meta.effort || selectedEffort,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await aiDevService.processQuery(query, liveContext, {
        model: selectedModel,
        effort: selectedEffort
      });
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

      // If called from live call loop callback
      if (meta.onResponseReady) {
        meta.onResponseReady(response);
      } else if (isVoiceEnabled && response.spokenText) {
        // Automatically speak aloud if voice output is enabled
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
    } catch (err) {
      console.error("AI Dev processing error:", err);
      setIsThinking(false);
      const fallback = aiDevService.processFallbackQuery(query, liveContext);
      const aiMessageId = `msg_ai_${Date.now()}`;
      const aiMessage = {
        id: aiMessageId,
        sender: 'ai',
        markdown: fallback.markdown,
        spokenText: fallback.spokenText,
        actionSuggestion: fallback.actionSuggestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      if (meta.onResponseReady) {
        meta.onResponseReady(fallback);
      }
    }
  }, [liveContext, isVoiceEnabled, selectedEffort, selectedModel]);

  // ========================================================
  // REAL-TIME CONTINUOUS TWO-WAY VOICE CALL LOOP (GEMINI LIVE)
  // ========================================================
  const startRecognitionLoop = useCallback(() => {
    const SpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      alert("Live voice calls require Google Chrome, Microsoft Edge, or Safari.");
      setIsLiveCallActive(false);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    if (isMicMutedRef.current) {
      setLiveCallState('listening');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Robust support for Hindi, Indian English, and Hinglish
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      let accumulated = '';

      recognition.onstart = () => {
        if (isLiveCallActiveRef.current && liveCallStateRef.current !== 'ai_speaking') {
          setLiveCallState('listening');
        }
      };

      recognition.onresult = (e) => {
        if (!isLiveCallActiveRef.current || liveCallStateRef.current === 'ai_speaking') return;

        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const trans = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            accumulated += ' ' + trans;
          } else {
            interim += trans;
          }
        }

        const currentWords = (accumulated + ' ' + interim).trim();
        if (currentWords) {
          setLiveTranscript(currentWords);
          setLiveCallState('user_speaking');

          // Reset silence timer on every speech event
          if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
          
          // Debounce: when Boss pauses speaking for 1.3 seconds, automatically trigger query!
          silenceTimeoutRef.current = setTimeout(() => {
            if (currentWords.trim() && isLiveCallActiveRef.current && liveCallStateRef.current !== 'ai_speaking') {
              try { recognition.stop(); } catch {}
              
              const queryToSend = currentWords.trim();
              accumulated = '';
              liveCallStateRef.current = 'thinking';
              setLiveCallState('thinking');
              setLiveTranscript('');

              // Send to AI Dev and loop back audio
              handleSend(queryToSend, {
                onResponseReady: (response) => {
                  liveCallStateRef.current = 'ai_speaking';
                  setLiveCallState('ai_speaking');
                  setLastAiSpeech(response.spokenText);

                  aiDevService.speak(response.spokenText, {
                    onStart: () => {
                      liveCallStateRef.current = 'ai_speaking';
                      setLiveCallState('ai_speaking');
                    },
                    onEnd: () => {
                      if (isLiveCallActiveRef.current) {
                        liveCallStateRef.current = 'listening';
                        setLiveCallState('listening');
                        // Automatically restart listening for Boss's next command!
                        setTimeout(() => {
                          if (isLiveCallActiveRef.current) startRecognitionLoop();
                        }, 250);
                      }
                    },
                    onError: () => {
                      if (isLiveCallActiveRef.current) {
                        liveCallStateRef.current = 'listening';
                        setLiveCallState('listening');
                        startRecognitionLoop();
                      }
                    }
                  });
                }
              });
            }
          }, 1300);
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== 'aborted' && isLiveCallActiveRef.current && liveCallStateRef.current !== 'ai_speaking') {
          setTimeout(() => {
            if (isLiveCallActiveRef.current && liveCallStateRef.current !== 'ai_speaking') {
              try { recognition.start(); } catch {}
            }
          }, 600);
        }
      };

      recognition.onend = () => {
        // If ended unexpectedly while call is active and not AI speaking, restart
        if (isLiveCallActiveRef.current && liveCallStateRef.current === 'listening') {
          setTimeout(() => {
            if (isLiveCallActiveRef.current && liveCallStateRef.current === 'listening') {
              try { recognition.start(); } catch {}
            }
          }, 300);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition initialization:", err);
    }
  }, [handleSend]);

  // Start Real-Time Live Voice Call
  const handleStartLiveCall = () => {
    setIsLiveCallActive(true);
    setLiveCallState('connecting');
    setLiveTranscript('');
    setLastAiSpeech('');

    const greeting = "Systems online, Boss! JARVIS live command channel connected. At your service Boss, what are your orders?";
    setLastAiSpeech(greeting);

    aiDevService.speak(greeting, {
      onStart: () => {
        setLiveCallState('ai_speaking');
      },
      onEnd: () => {
        if (isLiveCallActiveRef.current) {
          setLiveCallState('listening');
          startRecognitionLoop();
        }
      },
      onError: () => {
        if (isLiveCallActiveRef.current) {
          setLiveCallState('listening');
          startRecognitionLoop();
        }
      }
    });
  };

  // End Real-Time Live Voice Call
  const handleEndLiveCall = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    aiDevService.stopSpeaking();
    setIsLiveCallActive(false);
    setLiveCallState('idle');
    setLiveTranscript('');
  };

  // Interrupt AI while speaking
  const handleInterruptAi = () => {
    aiDevService.stopSpeaking();
    liveCallStateRef.current = 'listening';
    setLiveCallState('listening');
    startRecognitionLoop();
  };

  // Toggle Mic mute during live call
  const handleToggleMute = () => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    if (next) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    } else {
      if (liveCallState === 'listening') {
        startRecognitionLoop();
      }
    }
  };

  // Single-shot Voice dictation into PromptBar input
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
        recognition.lang = 'hi-IN';
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
    { key: 'gemini-3.5-flash', name: 'Infratech Neural (Gemini 3.5 Flash)', tag: 'Flagship' },
    { key: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', tag: 'Fast' },
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

        {/* Right: Audio Waveform, Live Call Trigger & Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Prominent Live Voice Call Button (Boss Mode) */}
          <button
            onClick={isLiveCallActive ? handleEndLiveCall : handleStartLiveCall}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isLiveCallActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 animate-pulse shadow-rose-600/20'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border border-indigo-600 shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            title={isLiveCallActive ? 'Disconnect Live Voice Call' : 'Start Real-time Voice Call with Boss'}
          >
            {isLiveCallActive ? (
              <>
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-200" />
                <span>Live Voice Call</span>
              </>
            )}
          </button>

          {/* Animated Audio Equalizer when speaking */}
          {isSpeaking && !isLiveCallActive && (
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
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 shadow-2xs'
            }`}
            title={isVoiceEnabled ? 'Voice response enabled (Click to mute)' : 'Voice response disabled (Click to enable)'}
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
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
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-48">
        <div className="max-w-3xl mx-auto w-full space-y-6">

          {/* Gemini-Style Welcome Hero when starting fresh */}
          {isOnlyWelcome && (
            <div className="pt-4 pb-6 text-center space-y-3 animate-fadeIn">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-100 shadow-inner">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Command Center Ready, Boss
              </h2>
              <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto font-normal">
                Autonomous technical copilot with live real-time telemetry across Contracts, QA & Sales. Speak or type your command.
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
                      Boss Copilot
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
                        title="Read aloud with strict authoritative voice"
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
                <span>AI Dev is analyzing live platform telemetry for Boss...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME LIVE VOICE CALL OVERLAY (GEMINI LIVE STYLE) */}
      {/* ======================================================== */}
      {isLiveCallActive && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col justify-between items-center p-6 text-white animate-fadeIn">
          
          {/* Top Bar inside Live Call */}
          <div className="w-full max-w-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                JARVIS LIVE • ENERGETIC MALE VOICE • BOSS COMMAND
              </span>
            </div>

            <button
              onClick={handleEndLiveCall}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
              <span>End Call</span>
            </button>
          </div>

          {/* Centerpiece: Animated Glowing Voice Orb & Live Waveform */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto">
            
            {/* The Orb */}
            <div className="relative cursor-pointer" onClick={liveCallState === 'ai_speaking' ? handleInterruptAi : undefined}>
              {/* Outer Pulsing Waves */}
              <div className={`absolute -inset-6 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 opacity-30 blur-xl transition-all duration-500 ${
                liveCallState === 'user_speaking' || liveCallState === 'ai_speaking'
                  ? 'scale-125 opacity-50 animate-pulse'
                  : 'scale-100 opacity-20'
              }`} />

              {/* Central Glowing Sphere */}
              <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 relative border-2 border-white/20 transition-all duration-300 ${
                liveCallState === 'ai_speaking'
                  ? 'scale-105 ring-8 ring-indigo-400/30'
                  : liveCallState === 'user_speaking'
                    ? 'scale-110 ring-8 ring-cyan-400/40 animate-pulse'
                    : 'scale-100'
              }`}>
                {liveCallState === 'user_speaking' ? (
                  <Mic className="w-12 h-12 text-white animate-bounce" />
                ) : liveCallState === 'ai_speaking' ? (
                  <div className="flex items-end gap-1.5 h-8">
                    <span className="w-1.5 bg-white animate-bounce h-5 rounded-full" />
                    <span className="w-1.5 bg-white animate-bounce h-8 rounded-full [animation-delay:0.15s]" />
                    <span className="w-1.5 bg-white animate-bounce h-4 rounded-full [animation-delay:0.3s]" />
                    <span className="w-1.5 bg-white animate-bounce h-7 rounded-full [animation-delay:0.45s]" />
                  </div>
                ) : liveCallState === 'thinking' ? (
                  <Sparkles className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <Sparkles className="w-12 h-12 text-white/90 animate-pulse" />
                )}
              </div>
            </div>

            {/* Status Heading */}
            <div className="space-y-2 max-w-lg px-4">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {liveCallState === 'connecting' && "Connecting Live Channel..."}
                {liveCallState === 'listening' && "🎙️ Listening to Boss..."}
                {liveCallState === 'user_speaking' && "Boss is Speaking..."}
                {liveCallState === 'thinking' && "⚡ Analyzing Telemetry for Boss..."}
                {liveCallState === 'ai_speaking' && "🔊 AI Dev Speaking..."}
              </h3>

              {/* Live Subtitle Transcript */}
              {liveTranscript && (
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-sm md:text-base text-cyan-200 font-medium max-w-md mx-auto shadow-inner">
                  "{liveTranscript}"
                </div>
              )}

              {/* Last Spoken AI Output */}
              {liveCallState === 'ai_speaking' && lastAiSpeech && !liveTranscript && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-xs md:text-sm text-indigo-200 font-medium max-w-md mx-auto line-clamp-3">
                  "{lastAiSpeech}"
                </div>
              )}

              {liveCallState === 'listening' && !liveTranscript && (
                <p className="text-xs text-white/60 font-normal">
                  Speak anytime in Hindi or English. Main automatically sunkar turant bolkar update dunga Boss.
                </p>
              )}
            </div>

            {/* Quick Command Pills for Boss inside Call */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-2">
              <button
                onClick={() => {
                  setLiveTranscript("Kiska contract kabtak hai?");
                  liveCallStateRef.current = 'thinking';
                  setLiveCallState('thinking');
                  handleSend("Kiska contract kabtak hain aur kab expire hoga?", {
                    onResponseReady: (resp) => {
                      liveCallStateRef.current = 'ai_speaking';
                      setLiveCallState('ai_speaking');
                      setLastAiSpeech(resp.spokenText);
                      aiDevService.speak(resp.spokenText, {
                        onEnd: () => {
                          if (isLiveCallActiveRef.current) {
                            liveCallStateRef.current = 'listening';
                            setLiveCallState('listening');
                            startRecognitionLoop();
                          }
                        }
                      });
                    }
                  });
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-white/90 transition-all cursor-pointer"
              >
                🏢 Contracts kab expire honge?
              </button>

              <button
                onClick={() => {
                  setLiveTranscript("Critical bugs dikhao");
                  liveCallStateRef.current = 'thinking';
                  setLiveCallState('thinking');
                  handleSend("Kitne bugs open hain aur critical bugs ki list do", {
                    onResponseReady: (resp) => {
                      liveCallStateRef.current = 'ai_speaking';
                      setLiveCallState('ai_speaking');
                      setLastAiSpeech(resp.spokenText);
                      aiDevService.speak(resp.spokenText, {
                        onEnd: () => {
                          if (isLiveCallActiveRef.current) {
                            liveCallStateRef.current = 'listening';
                            setLiveCallState('listening');
                            startRecognitionLoop();
                          }
                        }
                      });
                    }
                  });
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-white/90 transition-all cursor-pointer"
              >
                🚨 Critical bugs status
              </button>

              <button
                onClick={() => {
                  setLiveTranscript("Poora platform briefing do");
                  liveCallStateRef.current = 'thinking';
                  setLiveCallState('thinking');
                  handleSend("Pura platform ka comprehensive real-time briefing do", {
                    onResponseReady: (resp) => {
                      liveCallStateRef.current = 'ai_speaking';
                      setLiveCallState('ai_speaking');
                      setLastAiSpeech(resp.spokenText);
                      aiDevService.speak(resp.spokenText, {
                        onEnd: () => {
                          if (isLiveCallActiveRef.current) {
                            liveCallStateRef.current = 'listening';
                            setLiveCallState('listening');
                            startRecognitionLoop();
                          }
                        }
                      });
                    }
                  });
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-white/90 transition-all cursor-pointer"
              >
                ⚡ Executive summary
              </button>
            </div>

          </div>

          {/* Bottom Live Call Controls */}
          <div className="w-full max-w-sm flex items-center justify-around pb-6 pt-4 border-t border-white/10">
            {/* Mute Button */}
            <button
              onClick={handleToggleMute}
              className={`p-4 rounded-full border transition-all cursor-pointer ${
                isMicMuted
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Interrupt AI Button */}
            {liveCallState === 'ai_speaking' && (
              <button
                onClick={handleInterruptAi}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                title="Interrupt AI Dev to speak now"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Interrupt & Speak</span>
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={handleEndLiveCall}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-lg shadow-rose-600/30"
              title="End Voice Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 5. BOTTOM FLOATING PROMPTBAR DOCK (REACT BITS PROMPTBAR)  */}
      {/* ======================================================== */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-8 pb-4 px-4 flex flex-col items-center pointer-events-auto">
        <div className="w-full max-w-3xl flex flex-col items-center">
          
          <div className="w-full flex items-center gap-2">
            <div className="flex-1">
              <PromptBar
                placeholder="Ask anything about contracts, QA, bugs, or click Live Call to talk with Boss mode..."
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
            </div>

            {/* Quick Call Pill right next to PromptBar */}
            <button
              onClick={handleStartLiveCall}
              className="h-12 px-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
              title="Start Real-time Voice Call with Boss"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Live Talk</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            AI Dev references live in-memory telemetry across InfratechAI. Boss command channel active.
          </p>
        </div>
      </div>

    </div>
  );
};
