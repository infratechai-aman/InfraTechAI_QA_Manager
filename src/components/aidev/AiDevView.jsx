import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, Cpu, Volume2, VolumeX, Square,
  RotateCcw, ArrowRight, Activity, Building2, 
  CheckSquare, Bot, Copy, Check, ShieldAlert,
  FileText, Phone, PhoneOff, Mic, MicOff, Radio,
  Globe
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
import JarvisVocalCore from './JarvisVocalCore';

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
  onSwitchApp,
  agentVoice: externalAgentVoice,
  onAgentVoiceChange,
  speechLang: externalSpeechLang,
  onSpeechLangChange,
  isLiveCallActive: externalLiveCallActive,
  onLiveCallActiveChange,
  isVoiceEnabled: externalVoiceEnabled,
  onVoiceEnabledChange,
  resetSignal
}) => {
  // Voice Agent Selection: 'jarvis' (Male) | 'friday' (Female)
  const [internalAgentVoice, setInternalAgentVoice] = useState('jarvis');
  const agentVoice = externalAgentVoice !== undefined ? externalAgentVoice : internalAgentVoice;
  const setAgentVoice = (newV) => {
    setInternalAgentVoice(newV);
    onAgentVoiceChange?.(newV);
  };

  const [internalSpeechLang, setInternalSpeechLang] = useState('hi-IN'); // 'hi-IN' | 'en-US'
  const speechLang = externalSpeechLang !== undefined ? externalSpeechLang : internalSpeechLang;
  const setSpeechLang = (newLang) => {
    setInternalSpeechLang(newLang);
    onSpeechLangChange?.(newLang);
  };

  // Speech & Voice State
  const [internalVoiceEnabled, setInternalVoiceEnabled] = useState(true);
  const isVoiceEnabled = externalVoiceEnabled !== undefined ? externalVoiceEnabled : internalVoiceEnabled;
  const setIsVoiceEnabled = (val) => {
    const next = typeof val === 'function' ? val(isVoiceEnabled) : val;
    setInternalVoiceEnabled(next);
    onVoiceEnabledChange?.(next);
  };

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
  const [internalLiveCallActive, setInternalLiveCallActive] = useState(false);
  const isLiveCallActive = externalLiveCallActive !== undefined ? externalLiveCallActive : internalLiveCallActive;
  const setIsLiveCallActive = (val) => {
    const next = typeof val === 'function' ? val(isLiveCallActive) : val;
    setInternalLiveCallActive(next);
    onLiveCallActiveChange?.(next);
  };
  const [liveCallState, setLiveCallState] = useState('idle'); // 'connecting' | 'listening' | 'user_speaking' | 'thinking' | 'ai_speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastAiSpeech, setLastAiSpeech] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);

  const isLiveCallActiveRef = useRef(false);
  const liveCallStateRef = useRef('idle');
  const isMicMutedRef = useRef(false);
  const agentVoiceRef = useRef('jarvis');
  const speechLangRef = useRef('hi-IN');
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

  useEffect(() => {
    agentVoiceRef.current = agentVoice;
  }, [agentVoice]);

  useEffect(() => {
    speechLangRef.current = speechLang;
  }, [speechLang]);

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
    const isFriday = agentVoice === 'friday';
    const personaTitle = isFriday ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.';
    const personaName = isFriday ? 'Friday' : 'Jarvis';
    const greetingSpoken = `Hello Boss. ${personaName} is online. All modules are synchronized across client contracts, QA test suites, and the sales pipeline. How may I assist you today?`;
    
    const greetingMd = `### ${personaTitle} • Executive Copilot Online

Autonomous platform intelligence synchronized across business operations, quality engineering, and outbound sales:

- **Business Command Center:** All **${liveContext.business.totalContracts} client accounts**, expiration tracking, and **$${liveContext.business.totalMRR.toLocaleString()}/mo MRR**.
- **Quality Engineering (QA):** **${liveContext.qa.projectsCount} workspaces**, **${liveContext.qa.totalTests} tests** (${liveContext.qa.passRate}% pass rate), and **${liveContext.qa.openBugsCount} open defects**.
- **Sales SDR (Harvey):** **${liveContext.sales.totalLeads} prospects** and **${liveContext.sales.pendingApprovalsCount} pending outbox drafts**.

> **Dual-Voice Engine Active:** Switch between **J.A.R.V.I.S. (Male)** and **F.R.I.D.A.Y. (Female)** anytime using the top header selector. Click **"Live Talk"** for real-time full-duplex voice calling.`;

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
      agent: agentVoice,
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

  // Copy response markdown to clipboard
  const handleCopy = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Process and send query
  const handleSend = useCallback(async (rawText, meta = {}) => {
    const query = (rawText || '').trim();
    if (!query && (!meta.attachments || meta.attachments.length === 0)) return;

    const userMessageId = `msg_user_${Date.now()}`;
    const userMessage = {
      id: userMessageId,
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
        effort: selectedEffort,
        agent: meta.agent || agentVoiceRef.current
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

      if (meta.onResponseReady) {
        meta.onResponseReady(response);
      }

      if (isVoiceEnabled && response.spokenText && !isLiveCallActiveRef.current) {
        handleSpeakText(aiMessageId, response.spokenText);
      }
    } catch (err) {
      console.error("AI Dev processing error:", err);
      setIsThinking(false);
      const fallback = aiDevService.processFallbackQuery(query, liveContext, {
        agent: meta.agent || agentVoiceRef.current
      });
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
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    if (isMicMutedRef.current || !isLiveCallActiveRef.current) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLangRef.current || 'hi-IN'; // Robust support for Hindi, Hinglish, or English
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      let accumulated = '';

      recognition.onstart = () => {
        if (isLiveCallActiveRef.current && liveCallStateRef.current !== 'ai_speaking') {
          setLiveCallState('listening');
          liveCallStateRef.current = 'listening';
        }
      };

      recognition.onresult = (e) => {
        if (!isLiveCallActiveRef.current) return;

        // Auto-interrupt if AI is speaking and user starts talking!
        if (liveCallStateRef.current === 'ai_speaking') {
          aiDevService.stopSpeaking();
          liveCallStateRef.current = 'user_speaking';
          setLiveCallState('user_speaking');
        }

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
          liveCallStateRef.current = 'user_speaking';

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
                agent: agentVoiceRef.current,
                onResponseReady: (response) => {
                  liveCallStateRef.current = 'ai_speaking';
                  setLiveCallState('ai_speaking');
                  setLastAiSpeech(response.spokenText);

                  aiDevService.speak(response.spokenText, {
                    agent: agentVoiceRef.current,
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
                        }, 200);
                      }
                    },
                    onError: () => {
                      if (isLiveCallActiveRef.current) {
                        liveCallStateRef.current = 'listening';
                        setLiveCallState('listening');
                        setTimeout(() => {
                          if (isLiveCallActiveRef.current) startRecognitionLoop();
                        }, 200);
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
            if (isLiveCallActiveRef.current && liveCallStateRef.current === 'listening') {
              try { recognition.start(); } catch {}
            }
          }, 500);
        }
      };

      recognition.onend = () => {
        // If ended unexpectedly while call is active and in listening mode, restart
        if (isLiveCallActiveRef.current && liveCallStateRef.current === 'listening') {
          setTimeout(() => {
            if (isLiveCallActiveRef.current && liveCallStateRef.current === 'listening') {
              try { recognition.start(); } catch {}
            }
          }, 250);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition initialization error:", err);
    }
  }, [handleSend]);

  // Start Real-Time Live Voice Call
  const handleStartLiveCall = () => {
    setIsLiveCallActive(true);
    onLiveCallActiveChange?.(true);
    setLiveCallState('connecting');
    setLiveTranscript('');
    setLastAiSpeech('');

    const isFriday = agentVoice === 'friday';
    const greeting = isFriday
      ? "Systems calibrated, Boss! Friday dynamic vocal interface online. At your service Boss, what are your orders?"
      : "Systems online, Boss! Jarvis dynamic vocal interface online. At your service Boss, what are your orders?";

    setLastAiSpeech(greeting);

    aiDevService.speak(greeting, {
      agent: agentVoice,
      onStart: () => {
        setLiveCallState('ai_speaking');
        liveCallStateRef.current = 'ai_speaking';
      },
      onEnd: () => {
        if (isLiveCallActiveRef.current) {
          setLiveCallState('listening');
          liveCallStateRef.current = 'listening';
          startRecognitionLoop();
        }
      },
      onError: () => {
        if (isLiveCallActiveRef.current) {
          setLiveCallState('listening');
          liveCallStateRef.current = 'listening';
          startRecognitionLoop();
        }
      }
    });
  };

  // End Real-Time Live Voice Call
  const handleEndLiveCall = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    aiDevService.stopSpeaking();
    setIsLiveCallActive(false);
    onLiveCallActiveChange?.(false);
    setLiveCallState('idle');
    liveCallStateRef.current = 'idle';
    setLiveTranscript('');
  };

  // Sync external live call trigger from mobile bottom nav
  useEffect(() => {
    if (externalLiveCallActive !== undefined) {
      if (externalLiveCallActive && !isLiveCallActiveRef.current) {
        handleStartLiveCall();
      } else if (!externalLiveCallActive && isLiveCallActiveRef.current) {
        handleEndLiveCall();
      }
    }
  }, [externalLiveCallActive]);

  // Sync external conversation reset signal
  useEffect(() => {
    if (resetSignal) {
      handleStopSpeech();
      setMessages(prev => prev.slice(0, 1));
    }
  }, [resetSignal]);

  // Interrupt AI while speaking - foolproof instant restart
  const handleInterruptAi = useCallback(() => {
    aiDevService.stopSpeaking();
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    liveCallStateRef.current = 'listening';
    setLiveCallState('listening');
    setLiveTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    setTimeout(() => {
      if (isLiveCallActiveRef.current) {
        startRecognitionLoop();
      }
    }, 60);
  }, [startRecognitionLoop]);

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

  // Switch Voice Agent
  const handleToggleAgentVoice = (newAgent) => {
    setAgentVoice(newAgent);
    agentVoiceRef.current = newAgent;
    onAgentVoiceChange?.(newAgent);
    if (isLiveCallActive) {
      const notice = newAgent === 'friday'
        ? "Friday vocal core online. Listening Boss."
        : "Jarvis vocal core online. Listening Boss.";
      setLastAiSpeech(notice);
      aiDevService.speak(notice, {
        agent: newAgent,
        onStart: () => {
          setLiveCallState('ai_speaking');
          liveCallStateRef.current = 'ai_speaking';
        },
        onEnd: () => {
          if (isLiveCallActiveRef.current) {
            setLiveCallState('listening');
            liveCallStateRef.current = 'listening';
            startRecognitionLoop();
          }
        }
      });
    }
  };

  // Switch Language
  const handleToggleLanguage = (newLang) => {
    setSpeechLang(newLang);
    speechLangRef.current = newLang;
    onSpeechLangChange?.(newLang);
    if (isLiveCallActive && liveCallState === 'listening') {
      startRecognitionLoop();
    }
  };

  // Mic dictation helper for PromptBar
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
        recognition.lang = speechLang;
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

  // Clean suggestion cards
  const suggestionCards = [
    {
      icon: <Building2 className="w-5 h-5 text-cyan-400" />,
      title: 'Contract Schedule & Expirations',
      desc: 'Check all client accounts, renewal dates, and MRR cash flow',
      query: 'Kiska contract kabtak hain aur kab expire hoga?'
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      title: 'Expiring Within 30 Days',
      desc: 'Detect imminent renewal deadlines and SLA obligations',
      query: 'Konsa contract agle 30 din me expire ho raha hai?'
    },
    {
      icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
      title: 'QA Test Execution & Pass Rate',
      desc: 'Inspect test suites, passed vs failed count, and execution health',
      query: 'QA test execution aur pass rate ka live status do'
    },
    {
      icon: <Bot className="w-5 h-5 text-rose-400" />,
      title: 'Open Defects & Defect Status',
      desc: 'Break down all open bugs by workspace with critical defect list',
      query: 'Kitne bugs open hain aur critical bugs ki list do'
    }
  ];

  const isOnlyWelcome = messages.length === 1;
  const isFriday = agentVoice === 'friday';

  return (
    <div className="w-full h-full flex flex-col bg-[#020609] font-sans text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden relative">
      
      {/* Background Cyber Layering matching Iron Man MK VII */}
      <div className={isFriday ? "bg-atmosphere-friday" : "bg-atmosphere"} />
      <div className="bg-grid" />
      <div className="bg-scanlines" />

      {/* ======================================================== */}
      {/* 1. TOP MINIMAL EXECUTIVE HEADER BAR                     */}
      {/* ======================================================== */}
      <header className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 bg-[#030d14]/90 backdrop-blur-xl shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        
        {/* Left: Copilot Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative shrink-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg transition-colors ${
              isFriday 
                ? 'bg-gradient-to-tr from-rose-600 to-pink-500 shadow-rose-500/20' 
                : 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/20'
            }`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-wider font-orbitron text-white">
                {isFriday ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'}
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider px-1 sm:px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300">
                MK VII
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-wide text-slate-400 font-sans truncate max-w-[140px] xs:max-w-none">
              Autonomous Copilot
            </span>
          </div>
        </div>

        {/* Center: DUAL VOICE AGENT TOGGLE (MALE JARVIS vs FEMALE FRIDAY) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md shadow-inner">
            <button
              onClick={() => handleToggleAgentVoice('jarvis')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                agentVoice === 'jarvis'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to J.A.R.V.I.S. (Male Voice)"
            >
              <span>JARVIS</span>
              <span className="hidden xs:inline text-[9px] opacity-75">Male</span>
            </button>

            <button
              onClick={() => handleToggleAgentVoice('friday')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                agentVoice === 'friday'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to F.R.I.D.A.Y. (Female Voice)"
            >
              <span>FRIDAY</span>
              <span className="hidden xs:inline text-[9px] opacity-75">Female</span>
            </button>
          </div>

          {/* Hindi / English Language Switcher */}
          <div className="hidden xs:flex items-center p-0.5 sm:p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-[10px] sm:text-[11px]">
            <button
              onClick={() => handleToggleLanguage('hi-IN')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-semibold transition-all ${
                speechLang === 'hi-IN'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Listen & speak in Hindi / Hinglish"
            >
              HI
            </button>
            <button
              onClick={() => handleToggleLanguage('en-US')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-semibold transition-all ${
                speechLang === 'en-US'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Listen & speak in English"
            >
              EN
            </button>
          </div>
        </div>

        {/* Right: Live Talk Button & Voice Audio Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Prominent Live Voice Call Button */}
          <button
            onClick={isLiveCallActive ? handleEndLiveCall : handleStartLiveCall}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold font-orbitron tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-lg ${
              isLiveCallActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-400 animate-pulse shadow-rose-600/30'
                : isFriday
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 text-white border border-rose-400 shadow-rose-600/30 hover:scale-105 active:scale-95'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 hover:from-cyan-400 text-black border border-cyan-300 shadow-cyan-500/30 hover:scale-105 active:scale-95'
            }`}
            title={isLiveCallActive ? 'Disconnect Dynamic Vocal Interface' : 'Launch Dynamic Vocal Interface'}
          >
            {isLiveCallActive ? (
              <>
                <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">TERMINATE</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>LIVE TALK</span>
              </>
            )}
          </button>

          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) aiDevService.stopSpeaking();
              setIsVoiceEnabled(!isVoiceEnabled);
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
              isVoiceEnabled 
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/40' 
                : 'bg-black/60 text-slate-500 border-white/10 hover:text-slate-300'
            }`}
            title={isVoiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[11px]">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline text-[11px]">MUTED</span>
              </>
            )}
          </button>

          {/* Reset Conversation */}
          <button
            onClick={() => {
              handleStopSpeech();
              setMessages(messages.slice(0, 1));
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-colors cursor-pointer"
            title="Reset Conversation Stream"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. SUB-BAR: LIVE PLATFORM TELEMETRY PILLS               */}
      {/* ======================================================== */}
      <div className="px-5 py-2 bg-[#03090e]/90 border-b border-white/10 flex items-center gap-3 text-xs overflow-x-auto shrink-0 select-none backdrop-blur-md z-20">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 shrink-0 font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400" /> Telemetry:
        </span>

        {/* Business Feed */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300 shrink-0 text-[11px]">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">Contracts:</span>
          <span>{liveContext.business.totalContracts} Active</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-cyan-300">${liveContext.business.totalMRR.toLocaleString()}/mo MRR</span>
          {liveContext.business.expiringSoonCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30">
              {liveContext.business.expiringSoonCount} Expiring
            </span>
          )}
        </div>

        {/* QA Feed */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300 shrink-0 text-[11px]">
          <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">QA Suites:</span>
          <span>{liveContext.qa.totalTests} Tests</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-emerald-400">{liveContext.qa.passRate}% Pass</span>
          <span className="text-slate-600">•</span>
          <span className={`font-semibold ${liveContext.qa.openBugsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {liveContext.qa.openBugsCount} Defects ({liveContext.qa.criticalBugsCount} Critical)
          </span>
        </div>

        {/* Sales Feed */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300 shrink-0 text-[11px]">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">Sales SDR:</span>
          <span>{liveContext.sales.totalLeads} Prospects</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-amber-300">{liveContext.sales.pendingApprovalsCount} Drafts Pending</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CHAT CONTAINER (STARK TACTICAL TERMINAL)        */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 pb-64 md:pb-48 z-10">
        <div className="max-w-3xl mx-auto w-full space-y-6">

          {/* Clean Executive Welcome Hero when starting fresh */}
          {isOnlyWelcome && (
            <div className="pt-4 pb-6 text-center space-y-4 animate-fadeIn">
              <div className={`inline-flex p-3.5 rounded-2xl border shadow-xl ${
                isFriday 
                  ? 'bg-rose-950/30 border-rose-500/20 text-rose-400' 
                  : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-400'
              }`}>
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
                {isFriday ? 'FRIDAY' : 'JARVIS'} Executive Copilot
              </h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
                Autonomous platform intelligence synchronized across enterprise client contracts, QA test execution, and outbound sales.
              </p>

              {/* 2x2 Suggestion Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 text-left">
                {suggestionCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(card.query)}
                    className="p-4 rounded-xl bg-[#030d14]/90 border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.02] transition-all text-left flex flex-col justify-between group cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-black/60 border border-white/10 group-hover:border-cyan-400/50">
                        {card.icon}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors tracking-wide">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
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
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
                          <FileText className="w-3 h-3" />
                          <span>{file}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* User Command Bubble */}
                  <div className="bg-cyan-950/30 hover:bg-cyan-950/40 border border-cyan-500/30 text-slate-100 rounded-2xl px-5 py-3 text-[13px] font-sans leading-relaxed max-w-[85%] shadow-md">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mr-2 tracking-wider font-mono">{msg.timestamp}</span>
                </div>
              );
            }

            // AI Assistant Response (Clean Executive Card)
            return (
              <div key={msg.id} className="flex items-start gap-3.5 animate-fadeIn">
                
                {/* Assistant Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg mt-0.5 border ${
                  isFriday
                    ? 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                    : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
                }`}>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>

                {/* Assistant Message Body */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wide font-sans text-white">
                      {isFriday ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'}
                    </span>
                    <span className="text-[9px] text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-medium tracking-wide">
                      Briefing
                    </span>
                    <span className="text-[10px] text-slate-500">• {msg.timestamp}</span>
                  </div>

                  {/* Card Container with clean typography */}
                  <div className="p-4.5 rounded-2xl bg-[#030d14]/90 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)] text-slate-200 text-[13px] leading-relaxed font-sans">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node: _node, ...props }) => (
                          <p className="text-slate-300 leading-relaxed text-[13px] my-1.5" {...props} />
                        ),
                        ul: ({ node: _node, ...props }) => (
                          <ul className="space-y-1.5 my-2 pl-4 list-disc marker:text-cyan-400 text-slate-300 text-[13px]" {...props} />
                        ),
                        li: ({ node: _node, ...props }) => (
                          <li className="leading-relaxed text-slate-300" {...props} />
                        ),
                        table: ({ node: _node, ...props }) => (
                          <div className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-black/40 shadow-inner">
                            <table className="w-full text-left text-xs border-collapse" {...props} />
                          </div>
                        ),
                        th: ({ node: _node, ...props }) => (
                          <th className="py-2.5 px-3.5 font-semibold text-slate-200 bg-white/[0.04] border-b border-white/10 text-xs tracking-wider" {...props} />
                        ),
                        td: ({ node: _node, ...props }) => (
                          <td className="py-2 px-3.5 text-slate-300 border-b border-white/5 text-xs font-sans" {...props} />
                        ),
                        blockquote: ({ node: _node, ...props }) => (
                          <blockquote className="border-l-2 border-cyan-400/80 bg-cyan-950/20 pl-3.5 py-2 rounded-r-lg text-slate-200 my-2.5 text-xs leading-relaxed" {...props} />
                        ),
                        h3: ({ node: _node, ...props }) => (
                          <h3 className="text-sm font-bold text-white mb-2 mt-3 tracking-wide" {...props} />
                        ),
                        h4: ({ node: _node, ...props }) => (
                          <h4 className="text-xs font-bold text-slate-200 mb-1.5 mt-2.5 tracking-wide" {...props} />
                        )
                      }}
                    >
                      {msg.markdown}
                    </ReactMarkdown>
                  </div>

                  {/* Deep Link Action Pill */}
                  {msg.actionSuggestion && onSwitchApp && (
                    <div className="pt-1 flex items-center">
                      <button
                        onClick={() => onSwitchApp(msg.actionSuggestion.targetApp)}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                      >
                        <span>{msg.actionSuggestion.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
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
                            ? 'text-cyan-300 font-bold' 
                            : 'hover:text-cyan-300'
                        }`}
                        title="Vocalize telemetry dispatch"
                      >
                        {isSpeaking && currentSpeakingId === msg.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-cyan-400" />
                            <span className="text-cyan-300">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Vocalize</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(msg.id, msg.markdown)}
                      className="flex items-center gap-1.5 hover:text-cyan-300 font-medium transition-colors cursor-pointer text-xs"
                      title="Copy response markdown"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
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
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#030e17]/80 border border-cyan-500/30 text-xs text-cyan-300 font-medium tracking-wide">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Processing live platform telemetry for Boss...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME LIVE VOICE CALL OVERLAY (IRON MAN MK_VII)   */}
      {/* ======================================================== */}
      {isLiveCallActive && (
        <div className="fixed inset-0 z-50 bg-[#020609] flex flex-col justify-between p-4 sm:p-6 text-white animate-fadeIn select-none overflow-hidden">
          
          {/* Atmospheric Layering */}
          <div className={isFriday ? "bg-atmosphere-friday" : "bg-atmosphere"} />
          <div className="bg-grid" />
          <div className="bg-scanlines" />

          {/* Fullscreen Interactive Canvas for Particles, Orbital Geometry & Vocal Core */}
          <div className="absolute inset-0 z-10">
            <JarvisVocalCore 
              mode={liveCallState} 
              agent={agentVoice} 
              onCoreClick={liveCallState === 'ai_speaking' ? handleInterruptAi : undefined}
            />
          </div>

          {/* Top HUD Row with Telemetry Brackets */}
          <div className="relative z-20 w-full flex items-start justify-between pointer-events-none">
            
            {/* Top-Left Telemetry Bracket */}
            <div className="hud-bracket-left pointer-events-auto">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] sm:text-xs tracking-[0.28em] text-slate-400/90 font-orbitron font-bold">
                    &bull; {isFriday ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'} // MK_VII
                  </span>
                </div>
                <div className="text-[10px] tracking-[0.18em] glow-cyan font-medium -mt-1 ml-1">
                  SYS.CORP.MK7
                </div>

                <div className="w-28 h-[1px] bg-cyan-400/40 my-2 shadow-[0_0_6px_rgba(0,229,255,0.5)]" />

                <div className="text-[10px] tracking-[0.16em] glow-cyan font-medium">
                  UPLINK: ESTABLISHED
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isMicMuted ? 'bg-rose-500' : 'bg-cyan-400 animate-ping'} shadow-[0_0_8px_#00e5ff]`} />
                  <span className="text-[10px] tracking-[0.18em] text-cyan-300">
                    {isMicMuted ? 'MIC MUTED' : 'MIC ACTIVE'}
                  </span>
                </div>
                <div className="text-[9px] tracking-[0.2em] text-slate-400 mt-1 font-light">
                  FREQ: {liveCallState === 'ai_speaking' ? '240 Hz // 48.2 dB' : liveCallState === 'user_speaking' ? '180 Hz // 44.0 dB' : '000 Hz // 0.0 dB'}
                </div>
              </div>
            </div>

            {/* Top Center: Voice Agent Switcher & Language Switcher inside Call */}
            <div className="pointer-events-auto flex flex-col items-center gap-1.5">
              <div className="flex items-center p-1 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md shadow-2xl">
                <button
                  onClick={() => handleToggleAgentVoice('jarvis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                    agentVoice === 'jarvis'
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch to J.A.R.V.I.S. (Male Voice)"
                >
                  <span>JARVIS (Male)</span>
                </button>
                <button
                  onClick={() => handleToggleAgentVoice('friday')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                    agentVoice === 'friday'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch to F.R.I.D.A.Y. (Female Voice)"
                >
                  <span>FRIDAY (Female)</span>
                </button>
              </div>

              {/* Language Pill */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/60 border border-white/10 text-[10px]">
                <button
                  onClick={() => handleToggleLanguage('hi-IN')}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    speechLang === 'hi-IN' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hindi / Hinglish
                </button>
                <button
                  onClick={() => handleToggleLanguage('en-US')}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    speechLang === 'en-US' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Top-Right Telemetry Bracket */}
            <div className="hud-bracket-right pointer-events-auto">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs tracking-[0.28em] text-slate-300 font-orbitron">
                    {liveCallState === 'listening' ? 'LISTENING' : liveCallState === 'user_speaking' ? 'RECEIVING' : liveCallState === 'thinking' ? 'PROCESSING' : liveCallState === 'ai_speaking' ? 'VOCALIZING' : 'STANDBY'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff]" />
                </div>
                <div className="text-[10px] tracking-[0.16em] glow-cyan font-medium -mt-1 mr-2">
                  MEM: 44.2 TB
                </div>

                {/* 4 Animated Equalizer Telemetry Bars */}
                <div className="flex items-end gap-1.5 mt-2 mr-1">
                  <div className="eq-bar"><div className="eq-bar-fill" style={{ height: liveCallState === 'ai_speaking' ? '85%' : '35%' }} /></div>
                  <div className="eq-bar"><div className="eq-bar-fill" style={{ height: liveCallState === 'ai_speaking' ? '95%' : '65%' }} /></div>
                  <div className="eq-bar"><div className="eq-bar-fill" style={{ height: liveCallState === 'user_speaking' ? '90%' : '45%' }} /></div>
                  <div className="eq-bar"><div className="eq-bar-fill" style={{ height: liveCallState === 'user_speaking' ? '80%' : '50%' }} /></div>
                </div>
              </div>
            </div>

          </div>

          {/* Center-Bottom Vocal Status & Interactive Prompt */}
          <div className="relative z-20 flex flex-col items-center justify-end flex-1 pb-4 pointer-events-auto">
            
            {/* Spacer */}
            <div className="h-[28vh] sm:h-[44vh] pointer-events-none" />

            {/* TAP TO INTERRUPT / TERMINATE BUTTON */}
            {liveCallState === 'ai_speaking' ? (
              <button
                onClick={handleInterruptAi}
                className="terminate-btn glow-danger uppercase font-bold py-2.5 px-6 rounded-lg bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900/60 text-rose-300 transition-all cursor-pointer shadow-lg shadow-rose-950/50 font-orbitron"
              >
                TAP TO INTERRUPT & SPEAK
              </button>
            ) : (
              <div className="status-track text-cyan-400/80 uppercase font-orbitron tracking-[0.3em] text-xs">
                {liveCallState === 'connecting' && "INITIALIZING DUPLEX VOCAL LINK..."}
                {liveCallState === 'listening' && "AWAITING VOCAL INPUT // SPEAK NOW"}
                {liveCallState === 'user_speaking' && "RECEIVING VOCAL COMMAND..."}
                {liveCallState === 'thinking' && "NEURAL TELEMETRY MATRIX PROCESSING..."}
              </div>
            )}

            {/* Live Subtitle Transcript */}
            <div className="mt-3 flex flex-col items-center text-center max-w-lg px-4 min-h-[3rem]">
              {liveTranscript ? (
                <div className="text-sm md:text-base tracking-wide text-cyan-200 font-bold glow-cyan">
                  "{liveTranscript}"
                </div>
              ) : liveCallState === 'ai_speaking' && lastAiSpeech ? (
                <div className="text-xs md:text-sm tracking-wide text-cyan-100 font-medium line-clamp-2">
                  "{lastAiSpeech}"
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 font-light tracking-widest">
                  Speak anytime in Hindi, Hinglish, or English. {isFriday ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'} will respond instantly.
                </div>
              )}
            </div>

            {/* Quick Command Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg pt-3">
              <button
                onClick={() => {
                  setLiveTranscript("Kiska contract kabtak hai?");
                  liveCallStateRef.current = 'thinking';
                  setLiveCallState('thinking');
                  handleSend("Kiska contract kabtak hain aur kab expire hoga?", {
                    agent: agentVoice,
                    onResponseReady: (resp) => {
                      liveCallStateRef.current = 'ai_speaking';
                      setLiveCallState('ai_speaking');
                      setLastAiSpeech(resp.spokenText);
                      aiDevService.speak(resp.spokenText, {
                        agent: agentVoice,
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
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white font-medium transition-all cursor-pointer"
              >
                Contracts & Expirations
              </button>

              <button
                onClick={() => {
                  setLiveTranscript("Critical bugs dikhao");
                  liveCallStateRef.current = 'thinking';
                  setLiveCallState('thinking');
                  handleSend("Kitne bugs open hain aur critical bugs ki list do", {
                    agent: agentVoice,
                    onResponseReady: (resp) => {
                      liveCallStateRef.current = 'ai_speaking';
                      setLiveCallState('ai_speaking');
                      setLastAiSpeech(resp.spokenText);
                      aiDevService.speak(resp.spokenText, {
                        agent: agentVoice,
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
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white font-medium transition-all cursor-pointer"
              >
                Critical Defect Status
              </button>

              <button
                onClick={() => {
                  setLiveTranscript("Poora platform briefing do");
                  liveCallStateRef.current = 'thinking';
                  setLiveCallState('thinking');
                  handleSend("Pura platform ka comprehensive real-time briefing do", {
                    agent: agentVoice,
                    onResponseReady: (resp) => {
                      liveCallStateRef.current = 'ai_speaking';
                      setLiveCallState('ai_speaking');
                      setLastAiSpeech(resp.spokenText);
                      aiDevService.speak(resp.spokenText, {
                        agent: agentVoice,
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
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white font-medium transition-all cursor-pointer"
              >
                Executive Summary
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="w-full max-w-sm flex items-center justify-around pt-4 mt-2 border-t border-cyan-500/20">
              <button
                onClick={handleToggleMute}
                className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                  isMicMuted
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-black/60 hover:bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                }`}
                title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleEndLiveCall}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold font-orbitron text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-600/40"
                title="Terminate Vocal Interface"
              >
                <PhoneOff className="w-4 h-4" />
                <span>TERMINATE</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 5. BOTTOM FLOATING PROMPTBAR DOCK (STARK CYBER THEME)    */}
      {/* ======================================================== */}
      <div className="absolute bottom-[max(4.25rem,calc(env(safe-area-inset-bottom,0px)+4.25rem))] md:bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#020609] via-[#020609]/95 to-transparent pt-6 pb-2 md:pb-4 px-3 sm:px-4 flex flex-col items-center pointer-events-auto">
        <div className="w-full max-w-3xl flex flex-col items-center">
          
          <div className="w-full flex items-center gap-2">
            <div className="flex-1">
              <PromptBar
                placeholder={isFriday ? "Ask FRIDAY anything in Hindi or English..." : "Ask JARVIS anything in Hindi or English..."}
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
                background="#030d14"
                color="#e2e8f0"
                menuBackground="#020609"
                sparkColor={isFriday ? '#f43f5e' : '#00e5ff'}
                sparkBoost={1.2}
                width={768}
                radius={16}
                maxRows={6}
                morphDuration={240}
                squash={0.12}
                tilt={8}
                pressScale={0.96}
                className="w-full shadow-2xl shadow-cyan-950/40 border border-white/10"
              />
            </div>

            {/* Quick Live Talk Button right next to PromptBar */}
            <button
              onClick={handleStartLiveCall}
              className={`h-12 px-4 rounded-xl font-orbitron font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
                isFriday
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-cyan-500/30'
              }`}
              title="Launch Dynamic Vocal Interface with Boss"
            >
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">LIVE TALK</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 text-center tracking-wider font-sans">
            {isFriday ? 'FRIDAY' : 'JARVIS'} EXECUTIVE COPILOT • FULL-DUPLEX AUDIO • PLATFORM SYNCHRONIZED
          </p>
        </div>
      </div>

    </div>
  );
};
export default AiDevView;
