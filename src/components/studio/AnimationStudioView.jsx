import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, Download, Film, Sparkles, Video,
  Volume2, VolumeX, Maximize2, Minimize2, ArrowLeft, ArrowRight,
  Layers, Sliders, Smartphone, Monitor, Square, Check, Copy,
  Share2, Wand2, Mic, MicOff, Clock, Cpu, Zap, Radio, ChevronRight,
  TrendingUp, Shield, BarChart3, Users, Bot, Send, MessageSquare,
  UserCheck, RefreshCw, Eye, Camera, Palette, Music, Lightbulb,
  Plus, Trash2, Edit3, CheckCircle2, MoveUp, MoveDown
} from 'lucide-react';

/**
 * ANIMATIONS STUDIO — FULLY FUNCTIONAL AI ANIMATOR & MOTION ENGINE
 * Directed by Siddharth Menon (Dept 04 • Design Engineering Studio)
 * 
 * Capabilities:
 * - 6 Curated Cinema Templates & Dynamic Prompt-to-Script Generator
 * - 60 FPS HTML5 Canvas Kinetic Cinema Engine with Particle Swarms & Specular Glass
 * - Procedural Web Audio Synth Clock (Tech Riser, Apple Ambient, Cyber Pulse)
 * - Synchronized Audio Recording into MediaRecorder (Exports real sound into WebM/MP4)
 * - Browser Web Speech API Voiceover Narration (SpeechSynthesis)
 * - Dynamic Metric Interpolation (Numbers count up/down in real time)
 * - Full Scene Timeline Management: Add, Delete, Reorder, Duration Tuning
 * - Gamma-Style 4-Step Guided Flow: Storyboard -> Styles -> Audio -> Cinema Stage
 * - Direct NLP AI Animator Co-Pilot (Siddharth Menon)
 */

// 6 Curated Production Film Templates
const PRESET_TEMPLATES = [
  {
    id: 'viral-qa',
    name: 'The Death of Manual QA',
    category: 'Viral Tech Reel',
    platform: 'Reels / Shorts / TikTok',
    ratio: '9:16',
    duration: 15,
    accentColor: '#10B981',
    description: 'High-energy kinetic typography, defect count dropping from 542 to 0, 64 autonomous agents swarm.',
    palette: ['#10B981', '#064E3B', '#141518', '#E5E7EE'],
    fontPair: 'Plus Jakarta Sans Bold + SF Pro Mono',
    scenes: [
      {
        id: 's1',
        title: 'HOOK',
        duration: 3.5,
        tag: 'CRITICAL ALERT',
        mainText: 'MANUAL QA IS DEAD.',
        subText: 'Engineers waste 14 hrs/week on regressions.',
        highlight: 'DEAD.',
        metric: '542 BUGS',
        startNum: 542,
        endNum: 0,
        numSuffix: ' BUGS'
      },
      {
        id: 's2',
        title: 'THE CRISIS',
        duration: 4.0,
        tag: 'INDUSTRY DATA',
        mainText: '$40 BILLION WASTED',
        subText: 'In slow releases, flaky tests & broken pipelines.',
        highlight: '$40B',
        metric: 'FLAKY: 42%',
        startNum: 10,
        endNum: 42,
        numSuffix: '% FLAKY'
      },
      {
        id: 's3',
        title: 'THE SOLUTION',
        duration: 4.5,
        tag: 'GSTACK DEPLOYED',
        mainText: '64 AGENTS. 0 MANUAL CLICKS.',
        subText: 'InfratechAI auto-generates & executes test suites 24/7.',
        highlight: '64 AGENTS',
        metric: '0 DEFECTS',
        startNum: 64,
        endNum: 64,
        numSuffix: ' AGENTS ONLINE'
      },
      {
        id: 's4',
        title: 'CALL TO ACTION',
        duration: 3.0,
        tag: 'LAUNCHPAD LIVE',
        mainText: 'SHIP FLAWLESS CODE.',
        subText: 'Try InfratechAI Enterprise • Link in Bio',
        highlight: 'SHIP NOW',
        metric: '100% PASS',
        startNum: 0,
        endNum: 100,
        numSuffix: '% PASS'
      }
    ]
  },
  {
    id: 'apple-keynote',
    name: 'Apple Glass Product Reveal',
    category: 'Minimalist Cinema',
    platform: 'YouTube / Widescreen',
    ratio: '16:9',
    duration: 16,
    accentColor: '#F59E0B',
    description: 'Sonoma mesh aura, 3D specular frosted glass prism, ultra-smooth Apple typography.',
    palette: ['#F59E0B', '#78350F', '#181A20', '#FFFFFF'],
    fontPair: 'SF Pro Display + SF Pro Text',
    scenes: [
      {
        id: 's1',
        title: 'INTRO',
        duration: 4.0,
        tag: 'INFRATECHAI SPECIAL EVENT',
        mainText: 'The Future of Autonomous Engineering.',
        subText: 'Designed for high-velocity teams refusing to compromise.',
        highlight: 'Autonomous',
        metric: 'KEYNOTE 2026',
        startNum: 2024,
        endNum: 2026,
        numSuffix: ' KEYNOTE'
      },
      {
        id: 's2',
        title: 'CRAFTSMANSHIP',
        duration: 4.0,
        tag: 'PRECISION GLASS',
        mainText: 'Specular UI. Fluid Motion.',
        subText: 'Zero-latency interaction with 14 autonomous departments.',
        highlight: 'Fluid Motion',
        metric: '60 FPS',
        startNum: 30,
        endNum: 60,
        numSuffix: ' FPS ENGINE'
      },
      {
        id: 's3',
        title: 'INFRASTRUCTURE',
        duration: 4.5,
        tag: 'FULL STACK AGENTS',
        mainText: 'A Company of 64 Working Specialists.',
        subText: 'From YC Advisory to DevOps Cloud deployments.',
        highlight: '64 Specialists',
        metric: '14 DEPTS',
        startNum: 1,
        endNum: 14,
        numSuffix: ' DEPARTMENTS'
      },
      {
        id: 's4',
        title: 'FINALE',
        duration: 3.5,
        tag: 'AVAILABLE TODAY',
        mainText: 'Welcome to InfratechAI.',
        subText: 'Experience the Master App • Built for visionaries.',
        highlight: 'InfratechAI',
        metric: 'ENTERPRISE',
        startNum: 0,
        endNum: 100,
        numSuffix: '% READY'
      }
    ]
  },
  {
    id: 'harvey-sdr',
    name: 'Harvey Neural Outbound Machine',
    category: 'B2B Sales Teaser',
    platform: 'LinkedIn / X / Reels',
    ratio: '9:16',
    duration: 14,
    accentColor: '#3B82F6',
    description: 'Radar sweep, ₹2,00,000 monthly pipeline ticker, 48 prospects analyzed in real time.',
    palette: ['#3B82F6', '#1E3A8A', '#0F172A', '#E2E8F0'],
    fontPair: 'Inter Tight Bold + JetBrains Mono',
    scenes: [
      {
        id: 's1',
        title: 'HOOK',
        duration: 3.5,
        tag: 'B2B GROWTH',
        mainText: 'STOP COLD CALLING.',
        subText: 'Traditional SDR outbound is returning 0.8% replies.',
        highlight: 'COLD CALLING.',
        metric: 'REPLY: 0.8%',
        startNum: 5,
        endNum: 0.8,
        numSuffix: '% REPLY'
      },
      {
        id: 's2',
        title: 'AI RADAR',
        duration: 3.5,
        tag: 'SIGNAL DETECTION',
        mainText: 'HARVEY DETECTS BUYERS',
        subText: 'Real-time corporate website intent & hiring signals.',
        highlight: 'INTENT SIGNALS',
        metric: '48 PROSPECTS',
        startNum: 0,
        endNum: 48,
        numSuffix: ' PROSPECTS'
      },
      {
        id: 's3',
        title: 'COMMERCIALS',
        duration: 4.0,
        tag: 'INR PIPELINE',
        mainText: '₹2,00,000 RETAINER ARR',
        subText: 'Hyper-personalized sequences drafted autonomously.',
        highlight: '₹2,00,000',
        metric: '₹2,00,000',
        startNum: 50000,
        endNum: 200000,
        numSuffix: ' INR'
      },
      {
        id: 's4',
        title: 'CTA',
        duration: 3.0,
        tag: 'SCALE YOUR AGENCY',
        mainText: 'AUTOMATE YOUR SALES.',
        subText: 'Book a demo today at infratech.ai/sales',
        highlight: 'DEMO TODAY',
        metric: 'HARVEY SDR',
        startNum: 0,
        endNum: 100,
        numSuffix: '% AUTONOMOUS'
      }
    ]
  },
  {
    id: 'company-swarm',
    name: '64-Agent Workforce Swarm',
    category: 'Cyberpunk HUD',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 15,
    accentColor: '#8B5CF6',
    description: 'Neural grid telemetry, department nodes booting up, velocity metrics flying.',
    palette: ['#8B5CF6', '#4C1D95', '#110E1B', '#F3E8FF'],
    fontPair: 'Space Grotesk + Fira Code',
    scenes: [
      {
        id: 's1',
        title: 'AWAKENING',
        duration: 3.5,
        tag: 'SYSTEM BOOT',
        mainText: 'GSTACK CORE ONLINE.',
        subText: 'Initializing 14 autonomous enterprise departments.',
        highlight: 'ONLINE.',
        metric: 'SYSTEM 100%',
        startNum: 0,
        endNum: 100,
        numSuffix: '% CORE BOOT'
      },
      {
        id: 's2',
        title: 'NEURAL MESH',
        duration: 4.0,
        tag: 'TELEMETRY PULSE',
        mainText: '64 SPECIALISTS SYNCED.',
        subText: 'Strategy, Architecture, QA, Security, Sales & Release.',
        highlight: 'SYNCED.',
        metric: 'VELOCITY: 96.8%',
        startNum: 50,
        endNum: 96.8,
        numSuffix: '% VELOCITY'
      },
      {
        id: 's3',
        title: 'ZERO FRICTION',
        duration: 4.0,
        tag: 'AUTONOMOUS EXECUTION',
        mainText: 'NO MANUAL APPROVAL CHOKEPOINTS.',
        subText: 'Direct NLP task dispatch from executive leadership.',
        highlight: 'ZERO FRICTION',
        metric: 'LATENCY: 12ms',
        startNum: 120,
        endNum: 12,
        numSuffix: 'ms LATENCY'
      },
      {
        id: 's4',
        title: 'JOIN',
        duration: 3.5,
        tag: 'INFRATECHAI',
        mainText: 'YOUR VIRTUAL EMPIRE.',
        subText: 'Explore the 3D HQ • Follow @infratechai',
        highlight: 'VIRTUAL EMPIRE',
        metric: 'LIVE NOW',
        startNum: 0,
        endNum: 64,
        numSuffix: ' AGENTS ACTIVE'
      }
    ]
  },
  {
    id: 'zero-bugs',
    name: 'The Zero-Defect Pipeline',
    category: 'Developer Reel',
    platform: 'Reels / Shorts / X',
    ratio: '9:16',
    duration: 14,
    accentColor: '#EF4444',
    description: 'Critical production outage stopped by autonomous self-healing test suites.',
    palette: ['#EF4444', '#991B1B', '#0F172A', '#FEE2E2'],
    fontPair: 'Plus Jakarta Sans Bold + SF Pro Mono',
    scenes: [
      {
        id: 's1',
        title: 'ALERT',
        duration: 3.5,
        tag: 'SEV-1 INCIDENT',
        mainText: 'PRODUCTION BREAKS AT 2 AM.',
        subText: 'Payment gateway crashed after an unvetted release.',
        highlight: '2 AM.',
        metric: 'CRASH 100%',
        startNum: 0,
        endNum: 100,
        numSuffix: '% RISK'
      },
      {
        id: 's2',
        title: 'INTERCEPT',
        duration: 3.5,
        tag: 'AUTONOMOUS INTERCEPT',
        mainText: 'DEFECT CAUGHT IN 4 SECONDS.',
        subText: 'Argus Prime & TestMaster Rex generated 120 regression passes.',
        highlight: '4 SECONDS.',
        metric: '120 TESTS RUN',
        startNum: 0,
        endNum: 120,
        numSuffix: ' TESTS'
      },
      {
        id: 's3',
        title: 'RESTORATION',
        duration: 4.0,
        tag: 'SELF-HEALING CODE',
        mainText: 'PATCH MERGED & VERIFIED.',
        subText: 'Helios Shift pushed clean build with zero downtime.',
        highlight: 'ZERO DOWNTIME',
        metric: '99.99% SLA',
        startNum: 95,
        endNum: 99.99,
        numSuffix: '% UPTIME'
      },
      {
        id: 's4',
        title: 'CONCLUSION',
        duration: 3.0,
        tag: 'SLEEP SOUNDLY',
        mainText: 'SLEEP THROUGH RELEASES.',
        subText: 'InfratechAI protects your infrastructure 24/7.',
        highlight: 'SLEEP SOUNDLY',
        metric: '0 ALARMS',
        startNum: 14,
        endNum: 0,
        numSuffix: ' CRITICAL BUGS'
      }
    ]
  },
  {
    id: 'fintech-audit',
    name: 'Fintech Compliance & Audit Armor',
    category: 'Enterprise Widescreen',
    platform: 'YouTube / Presentations',
    ratio: '16:9',
    duration: 16,
    accentColor: '#06B6D4',
    description: 'SOC2 Type II and ISO 27001 automated compliance telemetry with zero security CVEs.',
    palette: ['#06B6D4', '#155E75', '#082F49', '#ECFEFF'],
    fontPair: 'Space Grotesk + JetBrains Mono',
    scenes: [
      {
        id: 's1',
        title: 'AUDIT RISK',
        duration: 4.0,
        tag: 'FINTECH REGULATION',
        mainText: 'COMPLIANCE AUDITS TAKE MONTHS.',
        subText: 'Fintech and banking platforms dread manual spreadsheet audits.',
        highlight: 'TAKE MONTHS.',
        metric: '90 DAYS DELAY',
        startNum: 90,
        endNum: 1,
        numSuffix: ' DAYS TURNAROUND'
      },
      {
        id: 's2',
        title: 'SECURITY SHIELD',
        duration: 4.0,
        tag: 'ZERO CVE MANDATE',
        mainText: 'CONTINUOUS SOC2 ENFORCEMENT.',
        subText: 'Aegis Ward and Argus Prime scan every pull request for vulnerabilities.',
        highlight: 'SOC2 ENFORCEMENT.',
        metric: '0 CRITICAL CVES',
        startNum: 18,
        endNum: 0,
        numSuffix: ' VULNERABILITIES'
      },
      {
        id: 's3',
        title: 'AUDIT EVIDENCE',
        duration: 4.5,
        tag: 'INSTANT PROOF',
        mainText: 'CRYPTOGRAPHIC AUDIT LOGS.',
        subText: 'Export verifiable test attestations with one click for regulators.',
        highlight: 'AUDIT LOGS.',
        metric: '100% AUDIT READY',
        startNum: 40,
        endNum: 100,
        numSuffix: '% VERIFIED'
      },
      {
        id: 's4',
        title: 'ENTERPRISE',
        duration: 3.5,
        tag: 'BANK GRADE',
        mainText: 'TRUST IN EVERY COMMIT.',
        subText: 'Deploy with enterprise assurance at infratech.ai/security',
        highlight: 'TRUST',
        metric: 'ISO 27001 CERT',
        startNum: 0,
        endNum: 1,
        numSuffix: ' CERTIFIED'
      }
    ]
  }
];

// Dynamic Prompt-to-Script Generation Engine
const generateScriptFromTopic = (promptTopic) => {
  const t = promptTopic.toLowerCase().trim();

  if (t.includes('sale') || t.includes('harvey') || t.includes('outbound') || t.includes('revenue') || t.includes('pipeline') || t.includes('deal')) {
    return {
      template: PRESET_TEMPLATES[2],
      aspectRatio: '9:16',
      scenes: [
        {
          id: 'sc_1',
          title: 'HOOK',
          duration: 3.5,
          tag: 'B2B OUTBOUND',
          mainText: 'STOP WASTING WEEKS COLD CALLING.',
          subText: 'Traditional outbound emails get less than 1% positive responses.',
          highlight: 'COLD CALLING.',
          metric: 'REPLY: 0.9%',
          startNum: 5,
          endNum: 0.9,
          numSuffix: '% REPLY RATE'
        },
        {
          id: 'sc_2',
          title: 'INTENT RADAR',
          duration: 3.5,
          tag: 'AUTONOMOUS SDR',
          mainText: 'HARVEY DETECTS IN-MARKET BUYERS.',
          subText: 'Scans hiring spikes, tech stack changes, and website intent 24/7.',
          highlight: 'INTENT BUYERS.',
          metric: '48 PROSPECTS',
          startNum: 0,
          endNum: 48,
          numSuffix: ' INTENT LEADS'
        },
        {
          id: 'sc_3',
          title: 'REVENUE ENGINE',
          duration: 4.0,
          tag: 'INR REVENUE',
          mainText: '₹2,00,000 MONTHLY RETAINER PIPELINE.',
          subText: 'Hyper-tailored multi-channel pitches generated in 8 seconds.',
          highlight: '₹2,00,000',
          metric: '34.2% REPLIES',
          startNum: 0,
          endNum: 34.2,
          numSuffix: '% POSITIVE REPLY'
        },
        {
          id: 'sc_4',
          title: 'CALL TO ACTION',
          duration: 3.5,
          tag: 'SCALE NOW',
          mainText: 'SCALE YOUR AGENCY PIPELINE.',
          subText: 'Activate Harvey AI SDR today • Link in Bio',
          highlight: 'SCALE NOW.',
          metric: 'LIVE TODAY',
          startNum: 0,
          endNum: 100,
          numSuffix: '% AUTOMATED'
        }
      ]
    };
  }

  if (t.includes('apple') || t.includes('design') || t.includes('keynote') || t.includes('minimal') || t.includes('polish') || t.includes('glass')) {
    return {
      template: PRESET_TEMPLATES[1],
      aspectRatio: '16:9',
      scenes: [
        {
          id: 'sc_1',
          title: 'INTRO',
          duration: 4.0,
          tag: 'DESIGN REVELATION',
          mainText: 'SOFTWARE THAT FEELS PHYSICAL.',
          subText: 'Engineered with Apple Fluid tactile springs and specular frosted glass.',
          highlight: 'PHYSICAL.',
          metric: '60 FPS',
          startNum: 24,
          endNum: 60,
          numSuffix: ' FPS FLUIDITY'
        },
        {
          id: 'sc_2',
          title: 'ENGINEERING',
          duration: 4.0,
          tag: 'ZERO LATENCY',
          mainText: 'PRECISION AT THE MICRO-LEVEL.',
          subText: 'Instant keystroke feedback, zero mouse travel, pure speed.',
          highlight: 'PRECISION',
          metric: '12ms LATENCY',
          startNum: 150,
          endNum: 12,
          numSuffix: 'ms LATENCY'
        },
        {
          id: 'sc_3',
          title: 'WORKFORCE',
          duration: 4.5,
          tag: '14 DEPARTMENTS',
          mainText: '64 AGENTS OPERATING AS ONE.',
          subText: 'Architecture, QA, Design & Release coordinated by Antigravity.',
          highlight: 'OPERATING AS ONE',
          metric: '96.8% VELOCITY',
          startNum: 50,
          endNum: 96.8,
          numSuffix: '% VELOCITY'
        },
        {
          id: 'sc_4',
          title: 'CTA',
          duration: 3.5,
          tag: 'JOIN THE FUTURE',
          mainText: 'EXPERIENCE INFRATECHAI.',
          subText: 'Crafted for founders who refuse to ship clumsy software.',
          highlight: 'INFRATECHAI',
          metric: 'AVAILABLE NOW',
          startNum: 0,
          endNum: 100,
          numSuffix: '% POLISHED'
        }
      ]
    };
  }

  if (t.includes('security') || t.includes('audit') || t.includes('fintech') || t.includes('bank') || t.includes('compliance')) {
    return {
      template: PRESET_TEMPLATES[5],
      aspectRatio: '16:9',
      scenes: [
        {
          id: 'sc_1',
          title: 'SECURITY CRISIS',
          duration: 3.5,
          tag: 'SECURITY BREACH RISK',
          mainText: 'MANUAL AUDITS MISS CRITICAL ZERO-DAYS.',
          subText: 'Legacy compliance checklists fail against modern automated exploit chains.',
          highlight: 'MISS ZERO-DAYS.',
          metric: 'HIGH RISK',
          startNum: 100,
          endNum: 0,
          numSuffix: ' CVE TOLERANCE'
        },
        {
          id: 'sc_2',
          title: 'AI SHIELD',
          duration: 4.0,
          tag: 'CONTINUOUS SCANNING',
          mainText: 'AEGIS WARD BLOCKS EVERY EXPLOIT.',
          subText: 'Real-time static code analysis and dependency vulnerability fuzzing.',
          highlight: 'BLOCKS EXPLOITS.',
          metric: '0 VULNERABILITIES',
          startNum: 24,
          endNum: 0,
          numSuffix: ' EXPLOITS'
        },
        {
          id: 'sc_3',
          title: 'AUDIT PROOF',
          duration: 4.0,
          tag: 'SOC2 VERIFIED',
          mainText: 'CRYPTOGRAPHIC ATTESTATIONS.',
          subText: 'Regulator-ready verification reports generated on every commit.',
          highlight: 'ATTESTATIONS.',
          metric: '100% COMPLIANT',
          startNum: 50,
          endNum: 100,
          numSuffix: '% SOC2 PASS'
        },
        {
          id: 'sc_4',
          title: 'ENTERPRISE',
          duration: 3.5,
          tag: 'ENTERPRISE SHIELD',
          mainText: 'BANK-GRADE SECURITY GUARANTEED.',
          subText: 'Explore InfratechAI Security Suite • Link in Bio',
          highlight: 'GUARANTEED.',
          metric: 'BANK GRADE',
          startNum: 0,
          endNum: 100,
          numSuffix: '% ENCRYPTED'
        }
      ]
    };
  }

  // Default: Viral QA & Autonomous Agent Reel
  const topicCaps = promptTopic ? promptTopic.toUpperCase().slice(0, 32) : 'MANUAL TESTING';
  return {
    template: PRESET_TEMPLATES[0],
    aspectRatio: '9:16',
    scenes: [
      {
        id: 'sc_1',
        title: 'VIRAL HOOK',
        duration: 3.5,
        tag: 'VIRAL ALERT',
        mainText: `WHY ${topicCaps} IS OBSOLETE.`,
        subText: 'Engineering teams lose hundreds of hours each quarter to slow loops.',
        highlight: 'OBSOLETE.',
        metric: '542 REGRESSIONS',
        startNum: 542,
        endNum: 0,
        numSuffix: ' BUGS DETECTED'
      },
      {
        id: 'sc_2',
        title: 'THE CRISIS',
        duration: 4.0,
        tag: 'PRODUCTION OUTAGE',
        mainText: 'SLOW RELEASES KILL USER TRUST.',
        subText: 'Flaky test suites and manual validation drag sprint velocity to zero.',
        highlight: 'KILL USER TRUST.',
        metric: 'VELOCITY: -60%',
        startNum: 80,
        endNum: 15,
        numSuffix: '% FLAKY RATE'
      },
      {
        id: 'sc_3',
        title: 'THE SOLUTION',
        duration: 4.5,
        tag: '64 AGENTS DEPLOYED',
        mainText: 'INFRATECHAI AUTOMATES EVERY TEST.',
        subText: 'From unit smoke tests to full browser UI flows, running 24/7 autonomously.',
        highlight: 'AUTOMATES EVERY TEST.',
        metric: '0 DEFECTS',
        startNum: 0,
        endNum: 64,
        numSuffix: ' AGENTS ONLINE'
      },
      {
        id: 'sc_4',
        title: 'CALL TO ACTION',
        duration: 3.0,
        tag: 'SHIP TODAY',
        mainText: 'SHIP FLAWLESS CODE TODAY.',
        subText: 'Deploy with InfratechAI Enterprise • Link in Bio',
        highlight: 'SHIP FLAWLESS CODE.',
        metric: '100% PASS',
        startNum: 0,
        endNum: 100,
        numSuffix: '% REGRESSION PASS'
      }
    ]
  };
};

export const AnimationStudioView = ({ onNavigateToApp, currentUser }) => {
  // GAMMA-STYLE STEP WORKFLOW: 1: Storyboard | 2: Styles | 3: Duration & Audio | 4: Cinema Stage
  const [gammaStep, setGammaStep] = useState(4);

  // Active template & scenes state
  const [activeTemplate, setActiveTemplate] = useState(PRESET_TEMPLATES[0]);
  const [aspectRatio, setAspectRatio] = useState(PRESET_TEMPLATES[0].ratio); // '9:16' | '16:9' | '1:1'
  const [scenes, setScenes] = useState(PRESET_TEMPLATES[0].scenes);
  const [selectedPacing, setSelectedPacing] = useState('15s'); // '10s' | '15s' | '30s'
  const [audioPreset, setAudioPreset] = useState('tech-riser'); // 'tech-riser' | 'apple-ambient' | 'cyber-pulse' | 'muted'
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(false);

  // Studio Sub-tab (inside Cinema Stage): 'animator' | 'scenes' | 'export'
  const [studioTab, setStudioTab] = useState('animator');
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  // Dedicated AI Animator State: Siddharth Menon (Dept 04 • Design Studio)
  const [animatorShiftStatus, setAnimatorShiftStatus] = useState('ACTIVE');
  const [animatorMessages, setAnimatorMessages] = useState([
    {
      id: 1,
      sender: 'animator',
      name: 'Siddharth Menon',
      time: 'Just now',
      text: "Hey Founder Aman! I'm your dedicated AI Animator (Dept 04 • Design Engineering). I write, compose, and render 60 FPS code-driven cinema for social media (Reels, Shorts, Keynote). What video should we direct right now? Try typing a topic or tapping a prompt pill!"
    }
  ]);
  const [animatorInput, setAnimatorInput] = useState('');
  const [isAnimatorTyping, setIsAnimatorTyping] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Gamma Storyboard Prompt Input
  const [storyboardPrompt, setStoryboardPrompt] = useState('');
  const [isSynthesizingOutline, setIsSynthesizingOutline] = useState(false);

  // Canvas and Audio Refs
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioDestRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const beatTimerRef = useRef(null);

  // Floating particles simulation for 60 FPS canvas
  const particlesRef = useRef(
    Array.from({ length: 45 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.0008,
      speedY: -Math.random() * 0.001 - 0.0003,
      alpha: Math.random() * 0.7 + 0.2
    }))
  );

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return scenes.reduce((sum, s) => sum + s.duration, 0);
  }, [scenes]);

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setActiveTemplate(template);
    setAspectRatio(template.ratio);
    setScenes(JSON.parse(JSON.stringify(template.scenes)));
    setCurrentTime(0);
    setIsPlaying(false);
    setSelectedSceneIndex(0);
  };

  // Find current scene based on currentTime
  const currentSceneInfo = useMemo(() => {
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (currentTime >= accumulated && currentTime < accumulated + scene.duration) {
        return {
          scene,
          index: i,
          progress: (currentTime - accumulated) / scene.duration,
          sceneLocalTime: currentTime - accumulated
        };
      }
      accumulated += scene.duration;
    }
    const last = scenes[scenes.length - 1];
    return {
      scene: last,
      index: scenes.length - 1,
      progress: 1,
      sceneLocalTime: last ? last.duration : 0
    };
  }, [currentTime, scenes]);

  // Initialize or resume Web Audio Context
  const ensureAudioContext = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
        const gain = audioCtxRef.current.createGain();
        gain.gain.value = 0.3;
        gain.connect(audioCtxRef.current.destination);
        masterGainRef.current = gain;

        // Create MediaStreamDestination node for capturing audio during video recording
        if (audioCtxRef.current.createMediaStreamDestination) {
          const dest = audioCtxRef.current.createMediaStreamDestination();
          gain.connect(dest);
          audioDestRef.current = dest;
        }
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Procedural Web Audio Sound Generator
  const playSoundEffect = useCallback((type) => {
    if (!audioEnabled || audioPreset === 'muted') return;
    try {
      const ctx = ensureAudioContext();
      if (!ctx || !masterGainRef.current) return;

      const now = ctx.currentTime;

      if (type === 'whoosh') {
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(3600, now + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGainRef.current);
        noise.start(now);
      } else if (type === 'bass') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(masterGainRef.current);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(masterGainRef.current);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {}
  }, [audioEnabled, audioPreset, ensureAudioContext]);

  // Procedural Rhythmic Synthesizer Loop (Generates Background Beat / Chords)
  useEffect(() => {
    if (!isPlaying || !audioEnabled || audioPreset === 'muted') {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      return;
    }

    const ctx = ensureAudioContext();
    if (!ctx || !masterGainRef.current) return;

    // 120 BPM interval = 250ms per 8th note
    let stepCount = 0;
    const intervalMs = 250;

    beatTimerRef.current = setInterval(() => {
      try {
        const now = ctx.currentTime;
        stepCount++;

        if (audioPreset === 'tech-riser') {
          // Kick on 1 and 3 (step 0 and 4)
          if (stepCount % 4 === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(masterGainRef.current);
            osc.start(now);
            osc.stop(now + 0.15);
          }
          // Hi-hat on every 8th note
          if (stepCount % 2 === 1) {
            const hiHatGain = ctx.createGain();
            hiHatGain.gain.setValueAtTime(0.03, now);
            hiHatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            const osc = ctx.createOscillator();
            osc.type = 'highpass';
            osc.frequency.setValueAtTime(8000, now);
            osc.connect(hiHatGain);
            hiHatGain.connect(masterGainRef.current);
            osc.start(now);
            osc.stop(now + 0.05);
          }
        } else if (audioPreset === 'apple-ambient') {
          // Warm resonant pad pulse every 8 steps
          if (stepCount % 8 === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const notes = [220, 261.63, 329.63, 392]; // Am7
            const freq = notes[(stepCount / 8) % notes.length];
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
            osc.connect(gain);
            gain.connect(masterGainRef.current);
            osc.start(now);
            osc.stop(now + 1.8);
          }
        } else if (audioPreset === 'cyber-pulse') {
          // 16th note arp synth
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const arp = [130.81, 164.81, 196.00, 246.94]; // C-E-G-B
          osc.frequency.setValueAtTime(arp[stepCount % 4], now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(masterGainRef.current);
          osc.start(now);
          osc.stop(now + 0.18);
        }
      } catch {}
    }, intervalMs);

    return () => {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    };
  }, [isPlaying, audioEnabled, audioPreset, ensureAudioContext]);

  // Voiceover Speech Synthesis Handler
  const speakCurrentScene = useCallback((scene) => {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const textToSpeak = `${scene.tag}. ${scene.mainText}. ${scene.subText}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, []);

  // Track scene transitions for sound effects & voiceover
  const prevSceneIndexRef = useRef(0);
  useEffect(() => {
    if (isPlaying && currentSceneInfo.index !== prevSceneIndexRef.current) {
      playSoundEffect('whoosh');
      playSoundEffect('bass');
      if (voiceoverEnabled && currentSceneInfo.scene) {
        speakCurrentScene(currentSceneInfo.scene);
      }
      prevSceneIndexRef.current = currentSceneInfo.index;
    }
  }, [currentSceneInfo.index, currentSceneInfo.scene, isPlaying, playSoundEffect, voiceoverEnabled, speakCurrentScene]);

  // Main 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetW = 1080;
    let targetH = 1920;
    if (aspectRatio === '16:9') {
      targetW = 1920;
      targetH = 1080;
    } else if (aspectRatio === '1:1') {
      targetW = 1080;
      targetH = 1080;
    }

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const { scene, index, sceneLocalTime, progress } = currentSceneInfo;
    const accent = activeTemplate.accentColor || '#10B981';

    // 1. CLEAR & OBSIDIAN BASE
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.fillStyle = '#0B0D13';
    ctx.fillRect(0, 0, targetW, targetH);

    // 2. DYNAMIC ATMOSPHERIC MESH AURA
    const auraX = targetW * (0.5 + Math.sin(currentTime * 0.8) * 0.15);
    const auraY = targetH * (0.35 + Math.cos(currentTime * 0.7) * 0.1);
    const auraRadius = Math.max(targetW, targetH) * 0.65;
    const auraGrad = ctx.createRadialGradient(auraX, auraY, 60, auraX, auraY, auraRadius);
    auraGrad.addColorStop(0, `${accent}40`);
    auraGrad.addColorStop(0.4, `${accent}15`);
    auraGrad.addColorStop(1, 'rgba(11, 13, 19, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, 0, targetW, targetH);

    // 3. MOVING PERSPECTIVE FLOOR GRID
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 64;
    const gridOffset = (currentTime * 40) % gridSize;
    for (let x = 0; x < targetW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, targetH);
      ctx.stroke();
    }
    for (let y = gridOffset; y < targetH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(targetW, y);
      ctx.stroke();
    }

    // 4. FLOATING PARTICLES SIMULATION
    const particles = particlesRef.current;
    ctx.save();
    for (let p = 0; p < particles.length; p++) {
      const pt = particles[p];
      if (isPlaying) {
        pt.x += pt.speedX;
        pt.y += pt.speedY;
        if (pt.y < 0) pt.y = 1;
        if (pt.x < 0) pt.x = 1;
        if (pt.x > 1) pt.x = 0;
      }
      ctx.fillStyle = accent;
      ctx.globalAlpha = pt.alpha * (0.5 + Math.sin(currentTime * 2 + p) * 0.2);
      ctx.beginPath();
      ctx.arc(pt.x * targetW, pt.y * targetH, pt.size * (aspectRatio === '16:9' ? 1.5 : 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. BRANDING POD (Apple Specular Header)
    const headerY = targetH * 0.08;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('INFRATECHAI', targetW * 0.08, headerY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.fillText('• 64 AGENT WORKFORCE CINEMA', targetW * 0.08 + 195, headerY);

    // Live 60 FPS Pill
    const pillX = targetW * 0.92;
    ctx.fillStyle = 'rgba(20, 21, 24, 0.75)';
    ctx.beginPath();
    ctx.roundRect(pillX - 110, headerY - 24, 110, 34, 17);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(pillX - 90, headerY - 7, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('60 FPS', pillX - 50, headerY - 2);
    ctx.restore();

    // 6. CENTER HERO CARD (Apple Specular Glass Box)
    const cardMarginX = targetW * 0.07;
    const cardW = targetW - cardMarginX * 2;
    const cardH = targetH * (aspectRatio === '9:16' ? 0.62 : 0.58);
    const cardY = targetH * 0.16;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    // Glass Background Fill
    ctx.fillStyle = 'rgba(24, 27, 36, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cardMarginX, cardY, cardW, cardH, 36);
    ctx.fill();

    // Specular Glass Border with Dynamic Light Sheen
    ctx.shadowColor = 'transparent';
    const sheenPos = (currentTime * 0.5) % 2;
    const borderGrad = ctx.createLinearGradient(
      cardMarginX + cardW * (sheenPos - 0.5), cardY,
      cardMarginX + cardW * (sheenPos + 0.5), cardY + cardH
    );
    borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    borderGrad.addColorStop(1, `${accent}70`);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // 7. ANIMATED CONTENT (Kinetic Typography & Ease-Out)
    const enterEase = Math.min(1, Math.max(0, sceneLocalTime * 2.8));
    const smoothEase = 1 - Math.pow(1 - enterEase, 3); // Cubic Ease Out
    const textOffsetY = (1 - smoothEase) * 36;
    const opacity = smoothEase;

    ctx.save();
    ctx.globalAlpha = opacity;

    // TAG BADGE
    const badgeY = cardY + 70 + textOffsetY * 0.5;
    ctx.fillStyle = `${accent}25`;
    const tagText = scene?.tag || 'SYSTEM DIRECTIVE';
    ctx.font = '800 20px -apple-system, BlinkMacSystemFont, sans-serif';
    const tagMetrics = ctx.measureText(tagText);
    const tagPadding = 24;

    ctx.beginPath();
    ctx.roundRect(cardMarginX + 48, badgeY - 26, tagMetrics.width + tagPadding * 2, 42, 21);
    ctx.fill();
    ctx.strokeStyle = `${accent}70`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.textAlign = 'left';
    ctx.fillText(tagText, cardMarginX + 48 + tagPadding, badgeY);

    // SCENE COUNTER
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`0${index + 1} / 0${scenes.length}`, cardMarginX + cardW - 48, badgeY);

    // MAIN HEADLINE
    const mainY = cardY + 180 + textOffsetY;
    const fontSize = aspectRatio === '9:16' ? 56 : 64;
    ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';

    const maxWidth = cardW - 96;
    const words = (scene?.mainText || '').split(' ');
    let line = '';
    let curY = mainY;
    const lineHeight = fontSize * 1.18;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, cardMarginX + 48, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, cardMarginX + 48, curY);

    // SUBTITLE
    curY += 36;
    ctx.font = '500 26px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(229, 231, 238, 0.85)';

    const subWords = (scene?.subText || '').split(' ');
    let subLine = '';
    const subLineHeight = 38;
    for (let n = 0; n < subWords.length; n++) {
      const testLine = subLine + subWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(subLine, cardMarginX + 48, curY);
        subLine = subWords[n] + ' ';
        curY += subLineHeight;
      } else {
        subLine = testLine;
      }
    }
    ctx.fillText(subLine, cardMarginX + 48, curY);

    // 8. DYNAMIC INTERPOLATED METRIC POD
    if (scene?.metric) {
      const metricPodY = cardY + cardH - 120;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(cardMarginX + 48, metricPodY, cardW - 96, 74, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cardMarginX + 80, metricPodY + 37, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '700 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('TELEMETRY OUTPUT', cardMarginX + 104, metricPodY + 43);

      // Dynamic calculation if startNum and endNum exist
      let displayMetric = scene.metric;
      if (typeof scene.startNum === 'number' && typeof scene.endNum === 'number') {
        const val = scene.startNum + (scene.endNum - scene.startNum) * Math.min(1, progress * 1.2);
        const formatted = Number.isInteger(scene.endNum) ? Math.round(val) : val.toFixed(1);
        displayMetric = `${formatted}${scene.numSuffix || ''}`;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px -apple-system, BlinkMacSystemFont, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(displayMetric, cardMarginX + cardW - 80, metricPodY + 44);
    }

    ctx.restore();

    // 9. SOCIAL FOOTER & SOUND FREQUENCY VISUALIZER BARS
    const footerY = targetH * 0.88;
    const barCount = 36;
    const barWidth = 8;
    const barSpacing = 10;
    const visualizerStartX = (targetW - (barCount * (barWidth + barSpacing))) / 2;

    for (let b = 0; b < barCount; b++) {
      const waveFreq = isPlaying ? 10 : 2;
      const barHeight = 14 + Math.sin(currentTime * waveFreq + b * 0.35) * 22 * (isPlaying ? 1 : 0.25);
      ctx.fillStyle = b % 4 === 0 ? accent : 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.roundRect(visualizerStartX + b * (barWidth + barSpacing), footerY - barHeight / 2, barWidth, barHeight, 4);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('@infratechai • Code-Driven Enterprise Cinema', targetW / 2, footerY + 54);

    // 10. TOP INSTAGRAM/TIKTOK PROGRESS BARS
    const progY = 32;
    const progH = 6;
    const progTotalW = targetW - 64;
    const segSpacing = 12;
    const segW = (progTotalW - segSpacing * (scenes.length - 1)) / scenes.length;

    let accTime = 0;
    for (let s = 0; s < scenes.length; s++) {
      const segX = 32 + s * (segW + segSpacing);
      const scDuration = scenes[s].duration;
      let segFill = 0;
      if (currentTime >= accTime + scDuration) {
        segFill = 1;
      } else if (currentTime > accTime) {
        segFill = (currentTime - accTime) / scDuration;
      }
      accTime += scDuration;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(segX, progY, segW, progH, 3);
      ctx.fill();

      if (segFill > 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(segX, progY, segW * segFill, progH, 3);
        ctx.fill();
      }
    }

  }, [currentTime, scenes, currentSceneInfo, activeTemplate, aspectRatio, isPlaying]);

  // 60 FPS RequestAnimationFrame Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    ensureAudioContext();
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentTime, totalDuration, ensureAudioContext]);

  const handleRestart = useCallback(() => {
    ensureAudioContext();
    setCurrentTime(0);
    setIsPlaying(true);
    playSoundEffect('whoosh');
  }, [playSoundEffect, ensureAudioContext]);

  // Keyboard shortcut for Space (play/pause) & R (restart)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleRestart]);

  // Update Scene Text
  const updateSceneField = (index, field, value) => {
    setScenes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Add a new scene to the timeline
  const handleAddScene = () => {
    const newScene = {
      id: `sc_${Date.now()}`,
      title: `SCENE 0${scenes.length + 1}`,
      duration: 3.5,
      tag: 'NEW HIGHLIGHT',
      mainText: 'AUTONOMOUS IMPACT DELIVERED.',
      subText: 'Engineered with 64 AI specialists working in real-time consensus.',
      highlight: 'IMPACT.',
      metric: '100% OPERATIONAL',
      startNum: 0,
      endNum: 100,
      numSuffix: '%'
    };
    setScenes(prev => [...prev, newScene]);
    setSelectedSceneIndex(scenes.length);
    playSoundEffect('whoosh');
  };

  // Delete scene
  const handleDeleteScene = (index) => {
    if (scenes.length <= 2) {
      alert('A minimum of 2 scenes is required for narrative flow.');
      return;
    }
    setScenes(prev => prev.filter((_, i) => i !== index));
    if (selectedSceneIndex >= scenes.length - 1) {
      setSelectedSceneIndex(Math.max(0, scenes.length - 2));
    }
    playSoundEffect('tick');
  };

  // Reorder scene
  const handleMoveScene = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;
    setScenes(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    setSelectedSceneIndex(targetIdx);
    playSoundEffect('tick');
  };

  // Scale pacing presets (10s, 15s, 30s)
  const handleApplyPacing = (targetPacing) => {
    setSelectedPacing(targetPacing);
    const targetSec = targetPacing === '10s' ? 10 : targetPacing === '30s' ? 30 : 15;
    const factor = targetSec / totalDuration;
    setScenes(prev => prev.map(sc => ({
      ...sc,
      duration: Math.max(1.5, Math.round(sc.duration * factor * 10) / 10)
    })));
    playSoundEffect('whoosh');
  };

  // Direct In-Browser Video Recording via MediaRecorder (with Audio Destination)
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setRecordingProgress(0);
      setCurrentTime(0);
      setIsPlaying(false);

      ensureAudioContext();

      const canvasStream = canvas.captureStream(60);
      const combinedTracks = [...canvasStream.getVideoTracks()];

      // If audio is available, attach synthesized audio track
      if (audioDestRef.current && audioPreset !== 'muted' && audioEnabled) {
        const audioTracks = audioDestRef.current.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedTracks.push(audioTracks[0]);
        }
      }

      const stream = new MediaStream(combinedTracks);

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `${activeTemplate.id}-${aspectRatio.replace(':', 'x')}-${Date.now()}.webm`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordingProgress(100);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsPlaying(true);

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const percent = Math.min(99, Math.round((elapsed / totalDuration) * 100));
        setRecordingProgress(percent);

        if (elapsed >= totalDuration + 0.3) {
          clearInterval(interval);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 100);

    } catch (err) {
      alert('Video export failed: ' + err.message);
      setIsRecording(false);
    }
  };

  // Download high-resolution PNG poster frame
  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.id}-poster-frame-${Math.round(currentTime)}s.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Viral Social Media Caption
  const handleCopyCaption = () => {
    const caption = `🚀 ${scenes[0]?.mainText}

${scenes[1]?.subText}

With @infratechai, 64 autonomous AI agents execute your test suites, analyze regressions, and book outbound enterprise meetings 24/7.

👉 Try the Master App today: infratech.ai (Link in Bio)

#AI #TechStartup #Automation #QualityAssurance #SaaS #DevOps #Engineering #InfratechAI`;

    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Gamma Storyboard Generation
  const handleGenerateStoryboardOutline = (promptTopic) => {
    const topic = (promptTopic || storyboardPrompt).trim();
    if (!topic) return;
    setIsSynthesizingOutline(true);

    setTimeout(() => {
      const result = generateScriptFromTopic(topic);
      setActiveTemplate(result.template);
      setAspectRatio(result.aspectRatio);
      setScenes(result.scenes);
      setIsSynthesizingOutline(false);
      playSoundEffect('whoosh');
      playSoundEffect('bass');
    }, 600);
  };

  // Direct AI Animator Directive Handler (Siddharth Menon Co-Pilot)
  const handleDirectAnimator = (directiveText) => {
    const text = (directiveText || animatorInput).trim();
    if (!text) return;

    ensureAudioContext();

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      name: (currentUser?.displayName || 'Aman Talukdar (CEO)'),
      time: 'Just now',
      text
    };

    setAnimatorMessages(prev => [...prev, userMsg]);
    setAnimatorInput('');
    setIsAnimatorTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = "Directive applied! Updating our code-driven scene timeline.";

      if (lower.includes('export') || lower.includes('download') || lower.includes('render video')) {
        replyText = "Starting video render! Exporting 1080p 60 FPS WebM with embedded sound.";
        handleExportVideo();
      } else if (lower.includes('voice') || lower.includes('speech') || lower.includes('speak')) {
        const nextState = !voiceoverEnabled;
        setVoiceoverEnabled(nextState);
        replyText = nextState 
          ? "AI Voiceover enabled! I will narrate scene headlines automatically as each scene starts." 
          : "AI Voiceover turned off.";
      } else if (lower.includes('faster') || lower.includes('10s') || lower.includes('10 sec')) {
        handleApplyPacing('10s');
        replyText = "Tuned pacing to 10s Snappy Teaser! Scene cuts are now accelerated for peak retention.";
      } else if (lower.includes('30s') || lower.includes('longer') || lower.includes('30 sec')) {
        handleApplyPacing('30s');
        replyText = "Extended duration to 30s Explainer Reel for deeper technical storytelling.";
      } else if (lower.includes('9:16') || lower.includes('vertical') || lower.includes('reel') || lower.includes('tiktok') || lower.includes('short')) {
        setAspectRatio('9:16');
        replyText = "Switched to 9:16 Vertical Reel format (1080x1920) optimized for Instagram Reels and YouTube Shorts retention!";
      } else if (lower.includes('16:9') || lower.includes('widescreen') || lower.includes('youtube') || lower.includes('keynote')) {
        setAspectRatio('16:9');
        replyText = "Switched to 16:9 Cinema Widescreen format (1920x1080) for YouTube and executive presentations.";
      } else if (lower.includes('apple') || lower.includes('minimal') || lower.includes('glass') || lower.includes('product')) {
        handleSelectTemplate(PRESET_TEMPLATES[1]);
        replyText = "Activated the Apple Minimalist Glass Keynote style with Sonoma specular aura and 3D card tilt.";
      } else if (lower.includes('sales') || lower.includes('harvey') || lower.includes('outbound') || lower.includes('inr') || lower.includes('pipeline')) {
        handleSelectTemplate(PRESET_TEMPLATES[2]);
        replyText = "Activated Harvey SDR Outbound Machine with real-time ₹2,00,000 monthly ARR ticker and sonar radar sweeps.";
      } else if (lower.includes('swarm') || lower.includes('agent') || lower.includes('company') || lower.includes('64') || lower.includes('department')) {
        handleSelectTemplate(PRESET_TEMPLATES[3]);
        replyText = "Activated 64-Agent Workforce Swarm style with neural telemetry grid and 14 department boot sequences.";
      } else if (lower.includes('outage') || lower.includes('production') || lower.includes('zero bug') || lower.includes('crash')) {
        handleSelectTemplate(PRESET_TEMPLATES[4]);
        replyText = "Activated The Zero-Defect Pipeline template with Sev-1 incident self-healing telemetry!";
      } else if (lower.includes('security') || lower.includes('soc2') || lower.includes('fintech') || lower.includes('cve')) {
        handleSelectTemplate(PRESET_TEMPLATES[5]);
        replyText = "Activated Fintech Compliance & Audit Armor template with continuous SOC2 vulnerability scans.";
      } else if (lower.includes('add scene') || lower.includes('new scene')) {
        handleAddScene();
        replyText = "Added a new scene to your video timeline! You can edit its headline and subtext in the Scene Editor.";
      } else {
        // Dynamic generation based on prompt
        const generated = generateScriptFromTopic(text);
        setActiveTemplate(generated.template);
        setAspectRatio(generated.aspectRatio);
        setScenes(generated.scenes);
        replyText = `Generated a custom 4-scene video script for "${text}" with tailored hooks, metrics, and kinetic typography! Playing preview now.`;
      }

      const animatorReply = {
        id: Date.now() + 1,
        sender: 'animator',
        name: 'Siddharth Menon',
        time: 'Just now',
        text: replyText
      };

      setAnimatorMessages(prev => [...prev, animatorReply]);
      setIsAnimatorTyping(false);
      setCurrentTime(0);
      setIsPlaying(true);
      playSoundEffect('whoosh');
      playSoundEffect('bass');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#E5E7EE] text-[#141518] font-sans antialiased selection:bg-[#2B2D33] selection:text-white">

      {/* ======================================================== */}
      {/* 1. TOP GLOBAL HEADER: EXACT APPLE FROSTED GLASS BAR      */}
      {/* ======================================================== */}
      <header className="h-20 px-6 sm:px-8 flex items-center justify-between border-b border-white/50 bg-[#E5E7EE]/80 backdrop-blur-2xl sticky top-0 z-30 apple-motion shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        
        {/* Left: Back to Launchpad + Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigateToApp && onNavigateToApp('hub')}
            className="btn-shine-effect flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white border border-white/80 text-xs font-semibold text-[#141518] shadow-apple-sm active:scale-[0.97] apple-motion-quick cursor-pointer"
            title="Return to Master App / Launchpad"
          >
            <ArrowLeft size={14} className="text-[#50545E]" />
            <span className="hidden sm:inline">Launchpad</span>
          </button>

          <div className="h-6 w-px bg-[#9AA0AC]/30 hidden sm:block" />

          {/* Logo Branding Pod */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#141518] text-[#E5E7EE] flex items-center justify-center shadow-lg border border-[#50545E]/40 ring-1 ring-white/10 apple-motion-quick">
              <Film size={20} className="text-pink-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold tracking-tight text-[#141518]">
                  Animations Studio
                </span>
                <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-700 border border-pink-500/30 uppercase tracking-wider">
                  Gamma.app Fluid Engine
                </span>
              </div>
              <span className="text-[11px] text-[#50545E] font-medium flex items-center gap-1.5">
                <span>Director: Siddharth Menon (Dept 04)</span>
                <span>•</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Shift: {animatorShiftStatus} (60 FPS Engine)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: GAMMA.APP GUIDED CREATION STEP BREADCRUMBS */}
        <div className="hidden lg:flex items-center p-1 rounded-2xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-apple-sm">
          {[
            { step: 1, label: '1. Storyboard', icon: Layers },
            { step: 2, label: '2. Visual Styles', icon: Palette },
            { step: 3, label: '3. Duration & Audio', icon: Clock },
            { step: 4, label: '4. Cinema Stage', icon: Zap }
          ].map((item) => {
            const isCurrent = gammaStep === item.step;
            const isCompleted = gammaStep > item.step;
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                onClick={() => setGammaStep(item.step)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 apple-motion-quick cursor-pointer active:scale-[0.97] ${
                  isCurrent
                    ? 'bg-[#141518] text-[#E5E7EE] shadow-sm'
                    : isCompleted
                    ? 'text-emerald-700 hover:bg-emerald-50 font-bold'
                    : 'text-[#50545E] hover:text-[#141518] hover:bg-white/60'
                }`}
              >
                {isCompleted ? <Check size={13} className="text-emerald-600" /> : <Icon size={13} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Voiceover, Audio Synth, Frame Snapshot, Export Video */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* AI Voiceover Toggle */}
          <button
            onClick={() => setVoiceoverEnabled(prev => !prev)}
            className={`p-2 rounded-2xl border apple-motion-quick cursor-pointer active:scale-[0.97] flex items-center gap-1.5 text-xs font-semibold ${
              voiceoverEnabled
                ? 'bg-pink-500/10 text-pink-700 border-pink-500/30'
                : 'bg-white/40 text-[#50545E] border-transparent'
            }`}
            title={voiceoverEnabled ? 'AI Voiceover Active (Web Speech API)' : 'Voiceover Disabled'}
          >
            {voiceoverEnabled ? <Mic size={15} className="text-pink-600" /> : <MicOff size={15} />}
            <span className="hidden xl:inline">{voiceoverEnabled ? 'Voice Active' : 'Voice Off'}</span>
          </button>

          {/* Audio Synth Toggle */}
          <button
            onClick={() => {
              ensureAudioContext();
              setAudioEnabled((prev) => !prev);
            }}
            className={`p-2 rounded-2xl border apple-motion-quick cursor-pointer active:scale-[0.97] ${
              audioEnabled && audioPreset !== 'muted'
                ? 'bg-white/80 text-[#141518] border-white/80 shadow-apple-sm' 
                : 'bg-white/40 text-[#50545E] border-transparent'
            }`}
            title={audioEnabled ? 'Procedural Web Audio Enabled' : 'Muted'}
          >
            {audioEnabled && audioPreset !== 'muted' ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Download Poster Button */}
          <button
            onClick={handleDownloadPoster}
            className="hidden sm:flex btn-shine-effect items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 hover:bg-white border border-white/80 text-xs font-semibold text-[#141518] shadow-apple-sm active:scale-[0.97] apple-motion-quick cursor-pointer"
            title="Download HD Poster Frame"
          >
            <Download size={14} className="text-[#50545E]" />
            <span>Poster</span>
          </button>

          {/* Export MP4 / WebM Button */}
          <button
            onClick={handleExportVideo}
            disabled={isRecording}
            className="btn-shine-effect flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-[#E5E7EE] border border-[#50545E]/40 text-xs font-bold shadow-md active:scale-[0.97] apple-motion-quick cursor-pointer disabled:opacity-50"
          >
            <Video size={14} className="text-pink-400" />
            <span>{isRecording ? `Recording ${recordingProgress}%` : 'Export Video'}</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. GAMMA-STYLE STEP 1: STORYBOARD & OUTLINE CARDS        */}
      {/* ======================================================== */}
      {gammaStep === 1 && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
          
          {/* Hero Prompt Box (Gamma Style) */}
          <div className="glass-specular bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 border border-white/80 shadow-apple-card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Wand2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#141518] tracking-tight">
                  Step 1: What is the story of your video?
                </h2>
                <p className="text-xs text-[#50545E]">
                  Type any concept, product feature, or marketing angle. Siddharth Menon will structure the 4 scenes automatically.
                </p>
              </div>
            </div>

            {/* Input & Generator Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={storyboardPrompt}
                onChange={(e) => setStoryboardPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateStoryboardOutline();
                }}
                placeholder="e.g. Why manual QA is dead in 2026, or Launching Harvey SDR Outbound..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[#9AA0AC]/30 text-sm text-[#141518] font-medium focus:outline-none focus:ring-2 focus:ring-[#141518] shadow-apple-sm"
              />
              <button
                onClick={() => handleGenerateStoryboardOutline()}
                disabled={isSynthesizingOutline || !storyboardPrompt.trim()}
                className="btn-shine-effect px-6 py-3 rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.97] cursor-pointer disabled:opacity-40"
              >
                <Sparkles size={15} className="text-pink-400" />
                <span>{isSynthesizingOutline ? 'Structuring...' : 'Generate Outline'}</span>
              </button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-bold text-[#50545E] uppercase tracking-wider">Inspiration:</span>
              {[
                'The Death of Manual QA',
                'Harvey SDR Outbound Machine',
                'Apple Glass Keynote Reveal',
                '64-Agent Workforce Swarm',
                'Zero-Defect Production Intercept',
                'Fintech SOC2 Compliance Shield'
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setStoryboardPrompt(pill);
                    handleGenerateStoryboardOutline(pill);
                  }}
                  className="px-3 py-1 rounded-xl bg-white/90 hover:bg-white text-xs font-semibold text-[#141518] border border-black/10 shadow-2xs active:scale-95 apple-motion-quick cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Storyboard Outline Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#50545E]">
                Narrative Outline ({scenes.length} Scenes • {totalDuration.toFixed(1)}s Total)
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddScene}
                  className="btn-shine-effect inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#141518] border border-black/10 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus size={13} className="text-emerald-600" />
                  <span>Add Scene</span>
                </button>
                <span className="text-xs text-[#50545E] font-medium hidden sm:inline">
                  Click any card to edit text inline
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenes.map((sc, idx) => (
                <div
                  key={sc.id}
                  className="glass-specular bg-white/80 hover:bg-white rounded-3xl p-5 border border-white/80 shadow-apple-sm transition-all space-y-3 group relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#141518]/5 text-[#141518] font-bold text-[10px] uppercase tracking-wider">
                      Scene 0{idx + 1} • {sc.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1.5"
                        max="10"
                        step="0.5"
                        value={sc.duration}
                        onChange={(e) => updateSceneField(idx, 'duration', parseFloat(e.target.value) || 3.5)}
                        className="w-16 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-center focus:outline-none"
                      />
                      <span className="text-[10px] text-[#50545E]">sec</span>

                      {/* Move / Delete actions */}
                      <button
                        onClick={() => handleMoveScene(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-[#50545E] hover:text-[#141518] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveScene(idx, 1)}
                        disabled={idx === scenes.length - 1}
                        className="p-1 rounded-lg text-[#50545E] hover:text-[#141518] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteScene(idx)}
                        className="p-1 rounded-lg text-red-500 hover:text-red-700 cursor-pointer ml-1"
                        title="Delete Scene"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={sc.tag}
                      onChange={(e) => updateSceneField(idx, 'tag', e.target.value)}
                      placeholder="Tag / Pill"
                      className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-lg border border-pink-200 w-full mb-1.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={sc.mainText}
                      onChange={(e) => updateSceneField(idx, 'mainText', e.target.value)}
                      placeholder="Main Kinetic Headline"
                      className="text-sm font-extrabold text-[#141518] bg-transparent border-b border-transparent hover:border-black/20 focus:border-black/50 w-full py-0.5 focus:outline-none"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={sc.subText}
                    onChange={(e) => updateSceneField(idx, 'subText', e.target.value)}
                    placeholder="Subtext explanation"
                    className="w-full text-xs text-[#50545E] bg-white/60 p-2 rounded-xl border border-black/5 focus:outline-none focus:ring-1 focus:ring-black/20 leading-relaxed"
                  />

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-[#9AA0AC] font-medium">Metric pod:</span>
                    <input
                      type="text"
                      value={sc.metric || ''}
                      onChange={(e) => updateSceneField(idx, 'metric', e.target.value)}
                      placeholder="e.g. 542 BUGS"
                      className="text-[11px] font-mono font-bold text-[#141518] bg-white px-2 py-0.5 rounded-lg border border-black/10 text-right focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setGammaStep(2);
                playSoundEffect('whoosh');
              }}
              className="btn-shine-effect px-8 py-3.5 rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer active:scale-[0.97] apple-motion-quick"
            >
              <span>Continue to Visual Styles</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </main>
      )}

      {/* ======================================================== */}
      {/* 3. GAMMA-STYLE STEP 2: VISUAL STYLES & THEME GALLERY     */}
      {/* ======================================================== */}
      {gammaStep === 2 && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#141518] tracking-tight">
                Step 2: Choose your Visual Style & Aesthetic
              </h2>
              <p className="text-xs text-[#50545E]">
                Every style features tailored color chemistry, lighting, and typography physics.
              </p>
            </div>

            <button
              onClick={() => setGammaStep(1)}
              className="px-4 py-2 rounded-2xl bg-white/80 hover:bg-white text-xs font-semibold text-[#141518] border border-black/10 active:scale-95 cursor-pointer"
            >
              ◂ Back to Storyboard
            </button>
          </div>

          {/* Visual Theme Cards Grid (Gamma Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_TEMPLATES.map((tmpl) => {
              const isSel = activeTemplate.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden group active:scale-[0.98] ${
                    isSel
                      ? 'bg-white border-[#141518] shadow-2xl ring-2 ring-[#141518]/20'
                      : 'bg-white/75 hover:bg-white border-white/80 shadow-apple-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#141518]/5 text-[#141518]">
                      {tmpl.category}
                    </span>
                    <span className="text-xs font-semibold text-[#50545E]">
                      {tmpl.ratio}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#141518] mb-1">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-[#50545E] leading-relaxed mb-4 line-clamp-2">
                    {tmpl.description}
                  </p>

                  {/* Live Color Swatches */}
                  <div className="flex items-center gap-2 mb-4 p-2.5 rounded-2xl bg-[#141518]/5 border border-black/5">
                    <span className="text-[10px] font-bold text-[#50545E] uppercase tracking-wider mr-1">Palette:</span>
                    {tmpl.palette.map((color, cIdx) => (
                      <div
                        key={cIdx}
                        className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <span className="text-[10px] text-[#50545E] ml-auto font-mono truncate max-w-[90px]">{tmpl.fontPair.split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs font-bold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Sparkles size={13} /> {isSel ? 'Selected' : 'Apply'}
                    </span>
                    <span className="text-[#141518]">
                      {isSel ? '✓ Active' : 'Select →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Action */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setGammaStep(1)}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-white/90 text-xs font-semibold text-[#141518] border border-black/10 active:scale-95 cursor-pointer"
            >
              ◂ Back to Storyboard
            </button>

            <button
              onClick={() => {
                setGammaStep(3);
                playSoundEffect('whoosh');
              }}
              className="btn-shine-effect px-8 py-3.5 rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer active:scale-[0.97] apple-motion-quick"
            >
              <span>Continue to Duration & Audio</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </main>
      )}

      {/* ======================================================== */}
      {/* 4. GAMMA-STYLE STEP 3: DURATION, ASPECT RATIO & AUDIO    */}
      {/* ======================================================== */}
      {gammaStep === 3 && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
          
          <div>
            <h2 className="text-xl font-extrabold text-[#141518] tracking-tight">
              Step 3: Duration, Aspect Ratio & Sound Synthesis
            </h2>
            <p className="text-xs text-[#50545E]">
              Select platform dimensions, video pacing, and procedural acoustic risers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Format / Aspect Ratio */}
            <div className="glass-specular bg-white/80 rounded-3xl p-6 border border-white/80 shadow-apple-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#50545E] flex items-center gap-1.5">
                <Smartphone size={15} /> Aspect Ratio & Format
              </span>

              <div className="space-y-2.5">
                {[
                  { id: '9:16', title: '9:16 Vertical Reel', desc: 'Instagram Reels, TikTok, YouTube Shorts', icon: Smartphone },
                  { id: '16:9', title: '16:9 Widescreen', desc: 'YouTube, Presentations, Keynotes', icon: Monitor },
                  { id: '1:1',  title: '1:1 Square Feed', desc: 'LinkedIn Feed, Instagram Grid', icon: Square }
                ].map((ar) => {
                  const isSel = aspectRatio === ar.id;
                  const Icon = ar.icon;
                  return (
                    <div
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer apple-motion-quick active:scale-[0.98] ${
                        isSel
                          ? 'bg-[#141518] text-white border-[#141518] shadow-sm'
                          : 'bg-white hover:bg-white/80 text-[#141518] border-black/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs mb-0.5">
                        <Icon size={14} className={isSel ? 'text-pink-400' : 'text-[#50545E]'} />
                        <span>{ar.title}</span>
                      </div>
                      <p className={`text-[11px] ${isSel ? 'text-white/70' : 'text-[#50545E]'}`}>
                        {ar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pacing & Duration */}
            <div className="glass-specular bg-white/80 rounded-3xl p-6 border border-white/80 shadow-apple-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#50545E] flex items-center gap-1.5">
                <Clock size={15} /> Pacing Presets
              </span>

              <div className="space-y-2.5">
                {[
                  { id: '10s', title: '⚡ 10s Snappy Teaser', desc: 'High hook retention, 2.5s rapid cuts' },
                  { id: '15s', title: '🎬 15s Standard Viral Reel', desc: 'Sweet spot for Instagram Reels & Shorts' },
                  { id: '30s', title: '📹 30s Explainer Reel', desc: 'In-depth narrative with technical data' }
                ].map((pc) => {
                  const isSel = selectedPacing === pc.id;
                  return (
                    <div
                      key={pc.id}
                      onClick={() => handleApplyPacing(pc.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer apple-motion-quick active:scale-[0.98] ${
                        isSel
                          ? 'bg-[#141518] text-white border-[#141518] shadow-sm'
                          : 'bg-white hover:bg-white/80 text-[#141518] border-black/5'
                      }`}
                    >
                      <span className="block font-bold text-xs mb-0.5">{pc.title}</span>
                      <p className={`text-[11px] ${isSel ? 'text-white/70' : 'text-[#50545E]'}`}>
                        {pc.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Procedural Web Audio Synth */}
            <div className="glass-specular bg-white/80 rounded-3xl p-6 border border-white/80 shadow-apple-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#50545E] flex items-center gap-1.5">
                <Music size={15} /> Sound Synthesizer
              </span>

              <div className="space-y-2.5">
                {[
                  { id: 'tech-riser', title: '🎵 Cyber Tech Riser', desc: 'Procedural 120 BPM kick + hi-hat & whooshes' },
                  { id: 'apple-ambient', title: '🔊 Minimal Studio Ambient', desc: 'Warm analog sine chords & subtle resonance' },
                  { id: 'cyber-pulse', title: '⚡ Arp Synth Pulse', desc: '16th-note electronic pulse sequence' },
                  { id: 'muted', title: '🔇 Muted / Silent', desc: 'Export video without audio tracks' }
                ].map((snd) => {
                  const isSel = audioPreset === snd.id;
                  return (
                    <div
                      key={snd.id}
                      onClick={() => {
                        ensureAudioContext();
                        setAudioPreset(snd.id);
                        if (snd.id !== 'muted') playSoundEffect('whoosh');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer apple-motion-quick active:scale-[0.98] ${
                        isSel
                          ? 'bg-[#141518] text-white border-[#141518] shadow-sm'
                          : 'bg-white hover:bg-white/80 text-[#141518] border-black/5'
                      }`}
                    >
                      <span className="block font-bold text-xs mb-0.5">{snd.title}</span>
                      <p className={`text-[11px] ${isSel ? 'text-white/70' : 'text-[#50545E]'}`}>
                        {snd.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Continue / Generate Video Button */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setGammaStep(2)}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-white/90 text-xs font-semibold text-[#141518] border border-black/10 active:scale-95 cursor-pointer"
            >
              ◂ Back to Visual Styles
            </button>

            <button
              onClick={() => {
                setGammaStep(4);
                ensureAudioContext();
                setCurrentTime(0);
                setIsPlaying(true);
                playSoundEffect('whoosh');
                playSoundEffect('bass');
              }}
              className="btn-shine-effect px-10 py-4 rounded-3xl bg-[#141518] hover:bg-[#2B2D33] text-white font-bold text-sm shadow-xl flex items-center gap-2.5 cursor-pointer active:scale-[0.97] apple-motion-quick"
            >
              <Zap size={17} className="text-pink-400" />
              <span>Launch 60 FPS Video in Cinema Stage →</span>
            </button>
          </div>

        </main>
      )}

      {/* ======================================================== */}
      {/* 5. GAMMA-STYLE STEP 4: CINEMA STAGE & AI ANIMATOR        */}
      {/* ======================================================== */}
      {gammaStep === 4 && (
        <main className="flex-1 p-6 sm:p-8 max-w-[1700px] w-full mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 pb-16 animate-fadeIn">

          {/* ────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: THE HARDWARE VIEWPORT STAGE (COL 1-7)         */}
          {/* ────────────────────────────────────────────────────────── */}
          <section className="xl:col-span-7 flex flex-col items-center">
            
            {/* Hardware Device Shell Container */}
            <div className="w-full flex flex-col items-center justify-center p-6 sm:p-8 rounded-[36px] bg-[#141518] shadow-2xl border border-white/10 relative overflow-hidden group">
              
              {/* Ambient Backlight Mesh behind device */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-40 blur-3xl transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${activeTemplate.accentColor || '#10B981'}35 0%, transparent 70%)`
                }}
              />

              {/* Device Header Pill */}
              <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 text-xs text-[#9AA0AC] relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F25B5B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F6A943]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3ECF8E]" />
                  <span className="font-mono text-[11px] text-white/60 ml-2">
                    OPUSCAR • {aspectRatio} • {activeTemplate.name}
                  </span>
                </div>

                {isRecording ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-[10px] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    REC 60 FPS ({recordingProgress}%)
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {voiceoverEnabled && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                        <Mic size={10} /> Voiceover
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-semibold text-[10px]">
                      <Camera size={11} className="text-emerald-400" />
                      <span>1080p Engine</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas Device Frame with Dynamic Island Mockup */}
              <div className="py-6 flex items-center justify-center w-full min-h-[520px] relative z-10">
                <div 
                  className={`relative rounded-[32px] p-2 bg-[#1C1E24] border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] transition-all ${
                    aspectRatio === '9:16' ? 'max-w-[340px] sm:max-w-[360px]' : aspectRatio === '1:1' ? 'max-w-[460px]' : 'max-w-[640px]'
                  }`}
                  style={{
                    aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '16/9'
                  }}
                >
                  {/* iPhone Dynamic Island pill (for 9:16 vertical reels) */}
                  {aspectRatio === '9:16' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black/90 border border-white/10 z-20 flex items-center justify-between px-3 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-black border border-white/20" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                    </div>
                  )}

                  <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-[24px] object-contain block bg-[#0B0D13]"
                  />
                </div>
              </div>

              {/* Tactile Hardware Transport Bar */}
              <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-3.5 relative z-10">
                <div className="flex items-center justify-between text-xs text-[#E5E7EE]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-2xl bg-white text-[#141518] hover:bg-emerald-400 hover:text-black flex items-center justify-center font-bold apple-motion-quick cursor-pointer active:scale-[0.97] shadow-md"
                      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                    </button>

                    <button
                      onClick={handleRestart}
                      className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center apple-motion-quick cursor-pointer active:scale-[0.97]"
                      title="Restart from Beginning (R)"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <button
                      onClick={() => currentSceneInfo.scene && speakCurrentScene(currentSceneInfo.scene)}
                      className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 apple-motion-quick cursor-pointer active:scale-[0.97]"
                      title="Speak Current Scene aloud via Web Speech API"
                    >
                      <Mic size={14} className="text-pink-400" />
                      <span>Voice Preview</span>
                    </button>
                  </div>

                  {/* Millisecond Accurate Time Display */}
                  <div className="font-mono text-sm tracking-wider">
                    <span className="text-white font-bold">{currentTime.toFixed(1)}s</span>
                    <span className="text-[#9AA0AC] mx-1">/</span>
                    <span className="text-[#9AA0AC]">{totalDuration.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Scrubber slider */}
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => {
                    ensureAudioContext();
                    setCurrentTime(parseFloat(e.target.value));
                    if (!isPlaying) playSoundEffect('tick');
                  }}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-white/20 rounded-lg appearance-none"
                />

                {/* Interactive Scene Jump Markers */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {scenes.map((sc, i) => {
                    const isCurrent = currentSceneInfo.index === i;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          ensureAudioContext();
                          let acc = 0;
                          for (let k = 0; k < i; k++) acc += scenes[k].duration;
                          setCurrentTime(acc);
                          setSelectedSceneIndex(i);
                          playSoundEffect('tick');
                        }}
                        className={`flex-1 min-w-[90px] px-3 py-2 rounded-2xl text-left border apple-motion-quick cursor-pointer active:scale-[0.97] ${
                          isCurrent
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-sm'
                            : 'bg-white/5 border-white/5 text-[#9AA0AC] hover:bg-white/10'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Scene 0{i + 1}
                        </div>
                        <div className="text-xs font-semibold truncate text-white">
                          {sc.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Social Quick Bar Below Player */}
            <div className="w-full mt-4 flex items-center justify-between p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-apple-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#141518]">Gamma Stage:</span>
                <button
                  onClick={() => setGammaStep(1)}
                  className="px-2.5 py-1 rounded-xl bg-black/5 hover:bg-black/10 text-[11px] font-semibold text-[#141518] cursor-pointer"
                >
                  📝 Edit Storyboard
                </button>
                <button
                  onClick={() => setGammaStep(2)}
                  className="px-2.5 py-1 rounded-xl bg-black/5 hover:bg-black/10 text-[11px] font-semibold text-[#141518] cursor-pointer"
                >
                  🎨 Change Style
                </button>
              </div>

              <button
                onClick={handleCopyCaption}
                className="btn-shine-effect flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-white/90 border border-black/10 text-xs font-semibold text-[#141518] shadow-apple-sm active:scale-[0.97] cursor-pointer apple-motion-quick"
              >
                {copiedCaption ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedCaption ? 'Copied Post Copy!' : 'Copy Viral Caption'}</span>
              </button>
            </div>

          </section>

          {/* ────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: DIRECTOR DECK & ANIMATOR CONTROLS (COL 8-12) */}
          {/* ────────────────────────────────────────────────────────── */}
          <section className="xl:col-span-5 flex flex-col gap-6">

            {/* macOS Sonoma Segmented Tab Switcher */}
            <div className="p-1 rounded-2xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-apple-sm flex items-center justify-between">
              {[
                { id: 'animator',  label: 'AI Animator', icon: Bot },
                { id: 'scenes',    label: 'Scene Editor', icon: Layers },
                { id: 'export',    label: 'Publish & Export', icon: Share2 }
              ].map((tab) => {
                const isSel = studioTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStudioTab(tab.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 apple-motion-quick cursor-pointer active:scale-[0.97] ${
                      isSel
                        ? 'bg-[#141518] text-[#E5E7EE] shadow-sm'
                        : 'text-[#50545E] hover:text-[#141518] hover:bg-white/60'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 0: DEDICATED AI ANIMATOR (SIDDHARTH MENON) */}
            {studioTab === 'animator' && (
              <div className="space-y-4">
                
                {/* Animator Profile & Shift Card */}
                <div className="glass-specular bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold text-base shadow-md ring-2 ring-white/60">
                        SM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#141518]">Siddharth Menon</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 uppercase">
                            AI Animator
                          </span>
                        </div>
                        <p className="text-xs text-[#50545E] font-medium">
                          Lead Motion Director & 3D Animator • Dept 04 (Design Studio)
                        </p>
                      </div>
                    </div>

                    {/* Shift Toggle */}
                    <div className="flex items-center gap-1 bg-[#141518]/5 p-1 rounded-xl border border-black/5">
                      {['ACTIVE', 'REVIEW', 'STANDBY'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setAnimatorShiftStatus(st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer apple-motion-quick active:scale-[0.97] ${
                            animatorShiftStatus === st
                              ? 'bg-[#141518] text-white shadow-2xs'
                              : 'text-[#50545E] hover:text-[#141518]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#50545E] bg-white/60 p-3 rounded-2xl border border-black/5 leading-relaxed">
                    "I turn your technical specs, QA releases, and outbound sales signals into 60 FPS code-driven cinema. Tell me what to animate below or tap a quick directive!"
                  </p>
                </div>

                {/* Directing & Chat Console */}
                <div className="glass-specular bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card flex flex-col h-[400px]">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-3">
                    <span className="text-xs font-bold text-[#141518] flex items-center gap-1.5">
                      <Bot size={14} className="text-purple-600" />
                      <span>Directing Console</span>
                    </span>
                    <span className="text-[11px] text-[#50545E] font-medium">
                      Founder Aman ⇄ Siddharth
                    </span>
                  </div>

                  {/* Messages Log */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {animatorMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="font-bold text-[10px] text-[#50545E]">{msg.name}</span>
                          <span className="text-[9px] text-[#9AA0AC]">{msg.time}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#141518] text-[#E5E7EE] rounded-tr-xs shadow-sm font-medium'
                              : 'bg-white border border-[#9AA0AC]/30 text-[#141518] rounded-tl-xs shadow-apple-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {isAnimatorTyping && (
                      <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-2xl w-fit border border-black/5 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                        <span className="text-[11px] font-bold text-purple-700">Siddharth is updating the timeline...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Directive Pills */}
                  <div className="pt-3 border-t border-black/[0.06] mt-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
                      {[
                        '⚡ 9:16 Viral Reel',
                        '🍏 Apple Minimal Glass',
                        '💰 Harvey ₹2,00,000 ARR',
                        '🤖 64-Agent Swarm',
                        '🔥 Death of Manual QA',
                        '🛡️ SOC2 Security Audit',
                        '⏱️ 10s Snappy Teaser',
                        '📹 Export 1080p Video'
                      ].map((pill, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDirectAnimator(pill)}
                          className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white text-[10px] font-bold text-[#141518] border border-black/10 shadow-2xs whitespace-nowrap cursor-pointer active:scale-[0.97] apple-motion-quick"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleDirectAnimator();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={animatorInput}
                        onChange={(e) => setAnimatorInput(e.target.value)}
                        placeholder="Instruct Siddharth (e.g. 'Make a reel about our autonomous QA platform')..."
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-white border border-[#9AA0AC]/30 text-xs text-[#141518] font-medium focus:outline-none focus:ring-2 focus:ring-[#141518]"
                      />
                      <button
                        type="submit"
                        disabled={!animatorInput.trim() || isAnimatorTyping}
                        className="p-2 rounded-xl bg-[#141518] text-white hover:bg-[#2B2D33] shadow-sm cursor-pointer disabled:opacity-40 active:scale-[0.97] apple-motion-quick"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 1: SCENE EDITOR */}
            {studioTab === 'scenes' && (
              <div className="space-y-4">
                <div className="glass-specular bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card space-y-4">
                  <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#141518]">Direct Scene Overrides</h3>
                      <p className="text-xs text-[#50545E]">Edit on-screen text, metrics, and duration in real time.</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {scenes.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSceneIndex(idx)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs apple-motion-quick cursor-pointer active:scale-[0.97] ${
                            selectedSceneIndex === idx
                              ? 'bg-[#141518] text-white shadow-sm'
                              : 'bg-white/80 text-[#50545E] hover:bg-white'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={handleAddScene}
                        className="w-8 h-8 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center cursor-pointer active:scale-95"
                        title="Add New Scene"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {scenes[selectedSceneIndex] && (
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1">
                            Scene 0{selectedSceneIndex + 1} Title
                          </label>
                          <input
                            type="text"
                            value={scenes[selectedSceneIndex].title}
                            onChange={(e) => updateSceneField(selectedSceneIndex, 'title', e.target.value)}
                            className="w-full px-3.5 py-2 rounded-2xl bg-white border border-[#9AA0AC]/30 text-xs text-[#141518] font-semibold focus:outline-none focus:ring-2 focus:ring-[#141518]"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1">
                            Duration
                          </label>
                          <input
                            type="number"
                            min="1.5"
                            max="10"
                            step="0.5"
                            value={scenes[selectedSceneIndex].duration}
                            onChange={(e) => updateSceneField(selectedSceneIndex, 'duration', parseFloat(e.target.value) || 3.5)}
                            className="w-full px-3 py-2 rounded-2xl bg-white border border-[#9AA0AC]/30 text-xs text-[#141518] font-mono font-bold text-center focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1">
                          Pill Tag
                        </label>
                        <input
                          type="text"
                          value={scenes[selectedSceneIndex].tag}
                          onChange={(e) => updateSceneField(selectedSceneIndex, 'tag', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-2xl bg-white border border-[#9AA0AC]/30 text-xs text-[#141518] font-semibold focus:outline-none focus:ring-2 focus:ring-[#141518]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1">
                          Main Headline
                        </label>
                        <textarea
                          rows={2}
                          value={scenes[selectedSceneIndex].mainText}
                          onChange={(e) => updateSceneField(selectedSceneIndex, 'mainText', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-2xl bg-white border border-[#9AA0AC]/30 text-xs text-[#141518] font-bold focus:outline-none focus:ring-2 focus:ring-[#141518]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1">
                          Subtitle
                        </label>
                        <textarea
                          rows={2}
                          value={scenes[selectedSceneIndex].subText}
                          onChange={(e) => updateSceneField(selectedSceneIndex, 'subText', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-2xl bg-white border border-[#9AA0AC]/30 text-xs text-[#141518] focus:outline-none focus:ring-2 focus:ring-[#141518]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1">
                          Metric Pod Text
                        </label>
                        <input
                          type="text"
                          value={scenes[selectedSceneIndex].metric || ''}
                          onChange={(e) => updateSceneField(selectedSceneIndex, 'metric', e.target.value)}
                          placeholder="e.g. 542 BUGS"
                          className="w-full px-3.5 py-2 rounded-2xl bg-white border border-[#9AA0AC]/30 text-xs font-mono font-bold text-[#141518] focus:outline-none focus:ring-2 focus:ring-[#141518]"
                        />
                      </div>

                      <div className="pt-2 flex justify-between items-center">
                        <button
                          onClick={() => handleDeleteScene(selectedSceneIndex)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete Scene</span>
                        </button>

                        <button
                          onClick={handleAddScene}
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add Scene</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PUBLISH & EXPORT */}
            {studioTab === 'export' && (
              <div className="glass-specular bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#141518]">Publish & Share</h3>
                  <p className="text-xs text-[#50545E]">Export high-bitrate video with synchronized procedural audio and viral social copy.</p>
                </div>

                <div className="p-4 rounded-3xl bg-[#141518] text-white space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#9AA0AC]">
                    <span>Export Spec:</span>
                    <span className="text-emerald-400">1080p • 60 FPS • WebM / MP4</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#9AA0AC]">
                    <span>Audio Track:</span>
                    <span className="text-white">{audioPreset !== 'muted' ? `Synthesized (${audioPreset})` : 'Muted'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#9AA0AC]">
                    <span>Total Duration:</span>
                    <span className="text-white font-mono">{totalDuration.toFixed(1)} seconds</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#9AA0AC]">
                    <span>Aspect Ratio:</span>
                    <span className="text-white">{aspectRatio} ({aspectRatio === '9:16' ? 'Reels / Shorts' : aspectRatio === '16:9' ? 'YouTube' : 'Feed'})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportVideo}
                    disabled={isRecording}
                    className="btn-shine-effect py-2.5 rounded-2xl bg-[#141518] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.97]"
                  >
                    <Video size={14} className="text-pink-400" />
                    <span>{isRecording ? 'Exporting...' : 'Export Video'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPoster}
                    className="btn-shine-effect py-2.5 rounded-2xl bg-white hover:bg-white/90 border border-[#9AA0AC]/40 text-[#141518] text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.97]"
                  >
                    <Download size={14} className="text-[#50545E]" />
                    <span>Poster Frame</span>
                  </button>
                </div>

                <div className="border-t border-black/[0.08] pt-3">
                  <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1">
                    Ready-To-Post Caption
                  </label>
                  <button
                    onClick={handleCopyCaption}
                    className="w-full py-2.5 rounded-2xl bg-white/90 hover:bg-white border border-[#9AA0AC]/30 text-xs font-semibold text-[#141518] flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-[0.97]"
                  >
                    {copiedCaption ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedCaption ? 'Copied to Clipboard!' : 'Copy Caption & Hashtags'}</span>
                  </button>
                </div>
              </div>
            )}

          </section>

        </main>
      )}

    </div>
  );
};
