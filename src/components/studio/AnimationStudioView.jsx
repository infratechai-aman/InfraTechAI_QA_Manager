import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, Download, Film, Sparkles, Video,
  Volume2, VolumeX, Maximize2, Minimize2, ArrowLeft, ArrowRight,
  Layers, Sliders, Smartphone, Monitor, Square, Check, Copy,
  Share2, Wand2, Mic, Clock, Cpu, Zap, Radio, ChevronRight,
  TrendingUp, Shield, BarChart3, Users, Bot, Send, MessageSquare,
  UserCheck, RefreshCw, Eye, Camera, Palette, Music, Lightbulb,
  Plus, Trash2, Edit3, CheckCircle2
} from 'lucide-react';

/**
 * ANIMATIONS STUDIO — GAMMA.APP STYLE GUIDED CREATION WORKFLOW
 * 
 * Powered by:
 * - Gamma-Style Creation Pipeline:
 *     1. 📝 Storyboard (Narrative & Outline Cards)
 *     2. 🎨 Visual Styles (Theme Gallery & Color Palettes)
 *     3. ⏱️ Duration & Audio (Pacing, Aspect Ratio, Sound Synth)
 *     4. ⚡ Cinema Stage (60 FPS Device Player & AI Animator Siddharth Menon)
 * - Apple Human Interface Guidelines & Emil Kowalski Design Engineering
 * - Charcoal/Slate Specular Glass palette (#E5E7EE canvas, #141518 obsidian)
 * - In-Browser 60 FPS Video Export via MediaRecorder
 */

// 4 Curated Production Film Templates
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
        metric: '542 BUGS'
      },
      {
        id: 's2',
        title: 'THE CRISIS',
        duration: 4.0,
        tag: 'INDUSTRY DATA',
        mainText: '$40 BILLION WASTED',
        subText: 'In slow releases, flaky tests & broken pipelines.',
        highlight: '$40B',
        metric: 'FLAKY: 42%'
      },
      {
        id: 's3',
        title: 'THE SOLUTION',
        duration: 4.5,
        tag: 'GSTACK DEPLOYED',
        mainText: '64 AGENTS. 0 MANUAL CLICKS.',
        subText: 'InfratechAI auto-generates & executes test suites 24/7.',
        highlight: '64 AGENTS',
        metric: '0 DEFECTS'
      },
      {
        id: 's4',
        title: 'CALL TO ACTION',
        duration: 3.0,
        tag: 'LAUNCHPAD LIVE',
        mainText: 'SHIP FLAWLESS CODE.',
        subText: 'Try InfratechAI Enterprise • Link in Bio',
        highlight: 'SHIP NOW',
        metric: '100% PASS'
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
        metric: 'KEYNOTE 2026'
      },
      {
        id: 's2',
        title: 'CRAFTSMANSHIP',
        duration: 4.0,
        tag: 'PRECISION GLASS',
        mainText: 'Specular UI. Fluid Motion.',
        subText: 'Zero-latency interaction with 14 autonomous departments.',
        highlight: 'Fluid Motion',
        metric: '60 FPS'
      },
      {
        id: 's3',
        title: 'INFRASTRUCTURE',
        duration: 4.5,
        tag: 'FULL STACK AGENTS',
        mainText: 'A Company of 64 Working Specialists.',
        subText: 'From YC Advisory to DevOps Cloud deployments.',
        highlight: '64 Specialists',
        metric: '14 DEPTS'
      },
      {
        id: 's4',
        title: 'FINALE',
        duration: 3.5,
        tag: 'AVAILABLE TODAY',
        mainText: 'Welcome to InfratechAI.',
        subText: 'Experience the Master App • Built for visionaries.',
        highlight: 'InfratechAI',
        metric: 'ENTERPRISE'
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
        metric: 'REPLY: 0.8%'
      },
      {
        id: 's2',
        title: 'AI RADAR',
        duration: 3.5,
        tag: 'SIGNAL DETECTION',
        mainText: 'HARVEY DETECTS BUYERS',
        subText: 'Real-time corporate website intent & hiring signals.',
        highlight: 'INTENT SIGNALS',
        metric: '48 PROSPECTS'
      },
      {
        id: 's3',
        title: 'COMMERCIALS',
        duration: 4.0,
        tag: 'INR PIPELINE',
        mainText: '₹2,00,000 RETAINER ARR',
        subText: 'Hyper-personalized sequences drafted autonomously.',
        highlight: '₹2,00,000',
        metric: '34.2% REPLIES'
      },
      {
        id: 's4',
        title: 'CTA',
        duration: 3.0,
        tag: 'SCALE YOUR AGENCY',
        mainText: 'AUTOMATE YOUR SALES.',
        subText: 'Book a demo today at infratech.ai/sales',
        highlight: 'DEMO TODAY',
        metric: 'HARVEY SDR'
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
        metric: 'SYSTEM 100%'
      },
      {
        id: 's2',
        title: 'NEURAL MESH',
        duration: 4.0,
        tag: 'TELEMETRY PULSE',
        mainText: '64 SPECIALISTS SYNCED.',
        subText: 'Strategy, Architecture, QA, Security, Sales & Release.',
        highlight: 'SYNCED.',
        metric: 'VELOCITY: 96.8%'
      },
      {
        id: 's3',
        title: 'ZERO FRICTION',
        duration: 4.0,
        tag: 'AUTONOMOUS EXECUTION',
        mainText: 'NO MANUAL APPROVAL CHOKEPOINTS.',
        subText: 'Direct NLP task dispatch from executive leadership.',
        highlight: 'ZERO FRICTION',
        metric: 'LATENCY: 12ms'
      },
      {
        id: 's4',
        title: 'JOIN',
        duration: 3.5,
        tag: 'INFRATECHAI',
        mainText: 'YOUR VIRTUAL EMPIRE.',
        subText: 'Explore the 3D HQ • Follow @infratechai',
        highlight: 'VIRTUAL EMPIRE',
        metric: 'LIVE NOW'
      }
    ]
  }
];

export const AnimationStudioView = ({ onNavigateToApp, currentUser }) => {
  // GAMMA-STYLE STEP WORKFLOW: 1: Storyboard | 2: Styles | 3: Duration & Audio | 4: Cinema Stage
  const [gammaStep, setGammaStep] = useState(4);

  // Active template & scenes state
  const [activeTemplate, setActiveTemplate] = useState(PRESET_TEMPLATES[0]);
  const [aspectRatio, setAspectRatio] = useState(PRESET_TEMPLATES[0].ratio); // '9:16' | '16:9' | '1:1'
  const [scenes, setScenes] = useState(PRESET_TEMPLATES[0].scenes);
  const [selectedPacing, setSelectedPacing] = useState('15s'); // '10s' | '15s' | '30s'
  const [audioPreset, setAudioPreset] = useState('tech-riser'); // 'tech-riser' | 'apple-ambient' | 'cyber-pulse' | 'muted'

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
      text: "Hey Founder Aman! I'm your dedicated AI Animator (Dept 04 • Design Engineering). I write and render 60 FPS code-driven cinema for social media (Reels, Shorts, Keynote). What video or motion design should we direct today?"
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

  // Canvas refs
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return scenes.reduce((sum, s) => sum + s.duration, 0);
  }, [scenes]);

  // Sync template changes
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
      sceneLocalTime: last.duration
    };
  }, [currentTime, scenes]);

  // Procedural Web Audio Sound Generator (Apple-grade tactile acoustics)
  const playSoundEffect = useCallback((type) => {
    if (!audioEnabled || audioPreset === 'muted') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

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
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'bass') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {}
  }, [audioEnabled, audioPreset]);

  // Track scene transitions for sound effects
  const prevSceneIndexRef = useRef(0);
  useEffect(() => {
    if (isPlaying && currentSceneInfo.index !== prevSceneIndexRef.current) {
      playSoundEffect('whoosh');
      playSoundEffect('bass');
      prevSceneIndexRef.current = currentSceneInfo.index;
    }
  }, [currentSceneInfo.index, isPlaying, playSoundEffect]);

  // Text to Speech preview using Web Speech API
  const handleSpeakScene = () => {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const current = currentSceneInfo.scene;
      const textToSpeak = `${current.tag}. ${current.mainText}. ${current.subText}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

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

    const { scene, index, sceneLocalTime } = currentSceneInfo;
    const accent = activeTemplate.accentColor || '#10B981';

    // 1. BACKGROUND RENDER (Deep Obsidian & Sonoma Mesh)
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.fillStyle = '#0B0D13';
    ctx.fillRect(0, 0, targetW, targetH);

    // Dynamic Atmospheric Mesh Aura
    const auraX = targetW * (0.5 + Math.sin(currentTime * 0.8) * 0.15);
    const auraY = targetH * (0.35 + Math.cos(currentTime * 0.7) * 0.1);
    const auraRadius = Math.max(targetW, targetH) * 0.65;
    const auraGrad = ctx.createRadialGradient(auraX, auraY, 60, auraX, auraY, auraRadius);
    auraGrad.addColorStop(0, `${accent}40`);
    auraGrad.addColorStop(0.4, `${accent}15`);
    auraGrad.addColorStop(1, 'rgba(11, 13, 19, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, 0, targetW, targetH);

    // Subtle Apple Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 64;
    for (let x = 0; x < targetW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, targetH);
      ctx.stroke();
    }
    for (let y = 0; y < targetH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(targetW, y);
      ctx.stroke();
    }

    // 2. BRANDING POD (Apple Specular Header)
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

    // 3. CENTER HERO CARD (Apple Specular Glass Box)
    const cardMarginX = targetW * 0.07;
    const cardW = targetW - cardMarginX * 2;
    const cardH = targetH * (aspectRatio === '9:16' ? 0.62 : 0.58);
    const cardY = targetH * 0.16;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    // Glass Background Fill
    ctx.fillStyle = 'rgba(24, 27, 36, 0.8)';
    ctx.beginPath();
    ctx.roundRect(cardMarginX, cardY, cardW, cardH, 36);
    ctx.fill();

    // Specular Glass Border
    ctx.shadowColor = 'transparent';
    const borderGrad = ctx.createLinearGradient(cardMarginX, cardY, cardMarginX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    borderGrad.addColorStop(1, `${accent}60`);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // 4. ANIMATED CONTENT (Kinetic Typography & Ease-Out)
    const enterEase = Math.min(1, sceneLocalTime * 2.8);
    const textOffsetY = (1 - enterEase) * 36;
    const opacity = enterEase;

    ctx.save();
    ctx.globalAlpha = opacity;

    // TAG BADGE
    const badgeY = cardY + 70 + textOffsetY * 0.5;
    ctx.fillStyle = `${accent}25`;
    const tagText = scene.tag || 'SYSTEM DIRECTIVE';
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
    const fontSize = aspectRatio === '9:16' ? 58 : 64;
    ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';

    const maxWidth = cardW - 96;
    const words = scene.mainText.split(' ');
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
    ctx.fillStyle = 'rgba(229, 231, 238, 0.8)';

    const subWords = scene.subText.split(' ');
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

    // METRIC POD
    if (scene.metric) {
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

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px -apple-system, BlinkMacSystemFont, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(scene.metric, cardMarginX + cardW - 80, metricPodY + 44);
    }

    ctx.restore();

    // 5. SOCIAL FOOTER & FREQUENCY BARS
    const footerY = targetH * 0.88;
    const barCount = 32;
    const barWidth = 8;
    const barSpacing = 10;
    const visualizerStartX = (targetW - (barCount * (barWidth + barSpacing))) / 2;

    for (let b = 0; b < barCount; b++) {
      const barHeight = 15 + Math.sin(currentTime * 8 + b * 0.4) * 20 * (isPlaying ? 1 : 0.2);
      ctx.fillStyle = b % 4 === 0 ? accent : 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.roundRect(visualizerStartX + b * (barWidth + barSpacing), footerY - barHeight / 2, barWidth, barHeight, 4);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('@infratechai • Code-Driven Enterprise Cinema', targetW / 2, footerY + 54);

    // Top Story Progress Bars
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
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentTime, totalDuration]);

  const handleRestart = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    playSoundEffect('whoosh');
  }, [playSoundEffect]);

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

  // Direct In-Browser Video Recording via MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setRecordingProgress(0);
      setCurrentTime(0);
      setIsPlaying(false);

      const stream = canvas.captureStream(60);

      let mimeType = 'video/webm;codecs=vp9';
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

        if (elapsed >= totalDuration + 0.2) {
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
    const caption = `🚀 ${scenes[0].mainText}

${scenes[1].subText}

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
      const generated = [
        {
          id: 'sc_1',
          title: 'HOOK',
          duration: 3.5,
          tag: 'VIRAL HOOK',
          mainText: `WHY ${topic.toUpperCase()} IS OBSOLETE.`,
          subText: 'The standard approach is costing teams 14+ hours every week.',
          highlight: 'OBSOLETE.',
          metric: 'RETENTION: 98%'
        },
        {
          id: 'sc_2',
          title: 'THE PROBLEM',
          duration: 4.0,
          tag: 'HIDDEN TAX',
          mainText: 'MANUAL OVERHEAD KILLS SPEED.',
          subText: 'Repetitive regressions and slow turnaround drag velocity to a halt.',
          highlight: 'KILLS SPEED',
          metric: 'LATENCY: -80%'
        },
        {
          id: 'sc_3',
          title: 'SOLUTION',
          duration: 4.5,
          tag: 'INFRATECHAI AGENTS',
          mainText: '64 AGENTS AUTOMATE EVERYTHING.',
          subText: 'End-to-end execution with zero manual confirmation friction.',
          highlight: '64 AGENTS',
          metric: '0 DEFECTS'
        },
        {
          id: 'sc_4',
          title: 'CALL TO ACTION',
          duration: 3.0,
          tag: 'SHIP WITH CONFIDENCE',
          mainText: 'SCALE WITHOUT BLOAT.',
          subText: 'Experience InfratechAI Enterprise • Link in Bio',
          highlight: 'SCALE NOW',
          metric: '100% PASS'
        }
      ];

      setScenes(generated);
      setIsSynthesizingOutline(false);
      playSoundEffect('whoosh');
    }, 700);
  };

  // Direct AI Animator Directive Handler
  const handleDirectAnimator = (directiveText) => {
    const text = (directiveText || animatorInput).trim();
    if (!text) return;

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

      if (lower.includes('9:16') || lower.includes('vertical') || lower.includes('reel') || lower.includes('tiktok') || lower.includes('short')) {
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
      } else if (lower.includes('bug') || lower.includes('qa') || lower.includes('manual') || lower.includes('death')) {
        handleSelectTemplate(PRESET_TEMPLATES[0]);
        replyText = "Activated 'The Death of Manual QA' viral reel template with the 542-to-0 defect counter drop!";
      } else {
        setScenes(prev => {
          const updated = [...prev];
          updated[0].mainText = text.toUpperCase().slice(0, 36);
          updated[0].subText = `Direct request executed by Animator Siddharth Menon for ${currentUser?.displayName || 'Aman'}.`;
          return updated;
        });
        replyText = `Directing request accepted! I updated Scene 01 with "${text.slice(0, 36)}..." and tuned typography curves for maximum visual retention.`;
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
    }, 750);
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
                  Animations
                </span>
                <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-700 border border-pink-500/30 uppercase tracking-wider">
                  Gamma.app Fluid Engine
                </span>
              </div>
              <span className="text-[11px] text-[#50545E] font-medium flex items-center gap-1.5">
                <span>AI Animator: Siddharth Menon</span>
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

        {/* Right Controls: Audio Synth, Frame Snapshot, Export Video */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            onClick={() => setAudioEnabled((prev) => !prev)}
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
                  Type a concept or feature launch. Siddharth Menon will structure the 4 scenes automatically.
                </p>
              </div>
            </div>

            {/* Input & Generator Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={storyboardPrompt}
                onChange={(e) => setStoryboardPrompt(e.target.value)}
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
                '64-Agent Workforce Swarm'
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

          {/* 4 Interactive Storyboard Outline Cards (Gamma style) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#50545E]">
                Narrative Outline (4 Scenes • {totalDuration.toFixed(1)}s Total)
              </h3>
              <span className="text-xs text-[#50545E] font-medium">
                Click any scene card to edit text inline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenes.map((sc, idx) => (
                <div
                  key={sc.id}
                  className="glass-specular bg-white/80 hover:bg-white rounded-3xl p-5 border border-white/80 shadow-apple-sm transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#141518]/5 text-[#141518] font-bold text-[10px] uppercase tracking-wider">
                      Scene 0{idx + 1} • {sc.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {sc.duration}s
                    </span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {tmpl.ratio} • {tmpl.platform}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#141518] mb-1">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-[#50545E] leading-relaxed mb-4">
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
                    <span className="text-[10px] text-[#50545E] ml-auto font-mono">{tmpl.fontPair}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs font-bold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Sparkles size={13} /> {isSel ? 'Selected Theme' : 'Click to Apply'}
                    </span>
                    <span className="text-[#141518]">
                      {isSel ? '✓ Active' : 'Select Style →'}
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
                <Clock size={15} /> Pacing & Duration
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
                      onClick={() => setSelectedPacing(pc.id)}
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
                  { id: 'tech-riser', title: '🎵 Cyber Tech Riser', desc: 'White noise whoosh + filtered sub-bass' },
                  { id: 'apple-ambient', title: '🔊 Minimal Studio Ambient', desc: 'Subtle high-frequency sine pulses' },
                  { id: 'muted', title: '🔇 Muted / Silent', desc: 'Export video without audio tracks' }
                ].map((snd) => {
                  const isSel = audioPreset === snd.id;
                  return (
                    <div
                      key={snd.id}
                      onClick={() => {
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
                setCurrentTime(0);
                setIsPlaying(true);
                playSoundEffect('whoosh');
                playSoundEffect('bass');
              }}
              className="btn-shine-effect px-10 py-4 rounded-3xl bg-[#141518] hover:bg-[#2B2D33] text-white font-bold text-sm shadow-xl flex items-center gap-2.5 cursor-pointer active:scale-[0.97] apple-motion-quick"
            >
              <Zap size={17} className="text-pink-400" />
              <span>Generate 60 FPS Video in Cinema Stage →</span>
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
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-semibold text-[10px]">
                    <Camera size={11} className="text-emerald-400" />
                    <span>1080p Engine</span>
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
                      onClick={handleSpeakScene}
                      className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 apple-motion-quick cursor-pointer active:scale-[0.97]"
                      title="Listen to Voiceover via Web Speech API"
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
                    setCurrentTime(parseFloat(e.target.value));
                    if (!isPlaying) playSoundEffect('tick');
                  }}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-white/20 rounded-lg appearance-none"
                />

                {/* 4 Interactive Scene Jump Markers */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {scenes.map((sc, i) => {
                    const isCurrent = currentSceneInfo.index === i;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          let acc = 0;
                          for (let k = 0; k < i; k++) acc += scenes[k].duration;
                          setCurrentTime(acc);
                          setSelectedSceneIndex(i);
                          playSoundEffect('tick');
                        }}
                        className={`px-3 py-2 rounded-2xl text-left border apple-motion-quick cursor-pointer active:scale-[0.97] ${
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
                <div className="glass-specular bg-white/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-apple-card flex flex-col h-[380px]">
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
                        '⚡ Viral Reel (9:16)',
                        '🍏 Apple Minimal Glass',
                        '💰 Harvey ₹2,00,000 ARR',
                        '🤖 64-Agent Swarm',
                        '🔥 The Death of Manual QA'
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
                        placeholder="Instruct Siddharth (e.g. 'Make a 9:16 vertical reel about why manual QA is dead')..."
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
                      <p className="text-xs text-[#50545E]">Edit on-screen text, metrics, and hooks in real time.</p>
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
                    </div>
                  </div>

                  {scenes[selectedSceneIndex] && (
                    <div className="space-y-3.5">
                      <div>
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
                  <p className="text-xs text-[#50545E]">Export high-bitrate video, thumbnail, and viral copy ready for posting.</p>
                </div>

                <div className="p-4 rounded-3xl bg-[#141518] text-white space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#9AA0AC]">
                    <span>Export Spec:</span>
                    <span className="text-emerald-400">1080p • 60 FPS • WebM / MP4</span>
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
