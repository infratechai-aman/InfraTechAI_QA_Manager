import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, Download, Film, Sparkles, Video,
  Volume2, VolumeX, Maximize2, Minimize2, ArrowLeft, ArrowRight,
  Layers, Sliders, Smartphone, Monitor, Square, Check, Copy,
  Share2, Wand2, Mic, MicOff, Clock, Cpu, Zap, Radio, ChevronRight,
  TrendingUp, Shield, BarChart3, Users, Bot, Send, MessageSquare,
  UserCheck, RefreshCw, Eye, Camera, Palette, Music, Lightbulb,
  Plus, Trash2, Edit3, CheckCircle2, MoveUp, MoveDown, Search, Filter
} from 'lucide-react';

/**
 * ANIMATIONS STUDIO — LEMO-OPUSCAR CODE-DRIVEN CINEMA ENGINE
 * Directed by Siddharth Menon (Dept 04 • Design Engineering Studio)
 * 
 * Includes 16 Official Lemo-Opuscar Styles with Live GitHub Posters:
 * - Dark Tech Keynote, Exploded Teardown, Hologram Cyber HUD, Satellite Briefing,
 *   Iso-Infographic, Dataviz Cinema, Circuit Board, Swiss Motion, Blueprint Schematic,
 *   Impasto Oil Painting, Ukiyo-e, Watercolor Brush, ASCII CRT, Whiteboard, Memphis Diorama, Risograph.
 */

// 16 Official Lemo-Opuscar Production Film Styles with Real GitHub Posters
const PRESET_TEMPLATES = [
  {
    id: 'dark-keynote',
    slug: 'dark-keynote',
    name: 'Dark Tech Keynote',
    category: 'Tech & Keynote',
    platform: 'YouTube / Widescreen',
    ratio: '16:9',
    duration: 16,
    accentColor: '#F59E0B',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/dark-keynote/poster.jpg',
    description: 'Apple keynote presentation aesthetic: obsidian glass, golden aura, 3D holographic medallions, and keynote reveal.',
    palette: ['#F59E0B', '#78350F', '#181A20', '#FFFFFF'],
    fontPair: 'SF Pro Display + SF Pro Text',
    visualType: 'keynote',
    scenes: [
      {
        id: 's1',
        title: 'INTRO',
        duration: 4.0,
        visualType: 'keynote',
        tag: 'INFRATECHAI SPECIAL EVENT',
        mainText: 'The Future of Autonomous Engineering.',
        subText: 'Engineered for high-velocity teams refusing to compromise on polish.',
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
        visualType: 'terminal',
        tag: 'PRECISION GLASS',
        mainText: 'Specular UI. Fluid Motion.',
        subText: 'Zero-latency interaction with 14 autonomous departments in consensus.',
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
        visualType: 'swarm',
        tag: 'FULL STACK AGENTS',
        mainText: 'A Company of 64 Working Specialists.',
        subText: 'From YC Advisory to DevOps Cloud deployments coordinated by Antigravity.',
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
        visualType: 'keynote',
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
    id: 'teardown',
    slug: 'teardown',
    name: 'Exploded Teardown',
    category: 'Engineering & 3D',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 15,
    accentColor: '#10B981',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/teardown/poster.jpg',
    description: '3D layered hardware and code disassembly, revealing internal microservices and self-healing pipelines.',
    palette: ['#10B981', '#064E3B', '#141518', '#E5E7EE'],
    fontPair: 'Space Grotesk + Fira Code',
    visualType: 'terminal',
    scenes: [
      {
        id: 's1',
        title: 'DISASSEMBLY',
        duration: 3.5,
        visualType: 'terminal',
        tag: 'SYSTEM TEARDOWN',
        mainText: 'UNPACKING THE CORE RUNTIME.',
        subText: 'Behind the interface lies an enterprise multi-agent engine.',
        highlight: 'CORE RUNTIME.',
        metric: '14 DEPTS',
        startNum: 1,
        endNum: 14,
        numSuffix: ' MODULES'
      },
      {
        id: 's2',
        title: 'CIRCUITRY',
        duration: 4.0,
        visualType: 'pipeline',
        tag: 'DATA FLOWS',
        mainText: 'HIGH-FREQUENCY PIPELINES.',
        subText: 'Zero-latency task routing from executive briefs to testing suites.',
        highlight: 'PIPELINES.',
        metric: '12ms LATENCY',
        startNum: 150,
        endNum: 12,
        numSuffix: 'ms TURNAROUND'
      },
      {
        id: 's3',
        title: 'INTERCEPT',
        duration: 4.0,
        visualType: 'swarm',
        tag: 'AUTONOMOUS FIX',
        mainText: 'SELF-HEALING AUTO-PATCH.',
        subText: 'Argus Prime & Rex verify 120 regressions with zero human clicks.',
        highlight: 'AUTO-PATCH.',
        metric: '0 DEFECTS',
        startNum: 18,
        endNum: 0,
        numSuffix: ' REGRESSIONS'
      },
      {
        id: 's4',
        title: 'REASSEMBLED',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'SHIP WITH PRIDE',
        mainText: 'ROBUST BY DESIGN.',
        subText: 'Explore InfratechAI Engineering • Link in Bio',
        highlight: 'ROBUST.',
        metric: '100% AUDITED',
        startNum: 0,
        endNum: 100,
        numSuffix: '% SECURE'
      }
    ]
  },
  {
    id: 'hologram-hud',
    slug: 'hologram-hud',
    name: 'Hologram Cyber HUD',
    category: 'Cyber & Telemetry',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 15,
    accentColor: '#8B5CF6',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/hologram-hud/poster.jpg',
    description: 'Futuristic sci-fi cybernetic HUD: glowing neon rings, neural mesh connections, and holographic agent telemetry.',
    palette: ['#8B5CF6', '#4C1D95', '#110E1B', '#F3E8FF'],
    fontPair: 'Space Grotesk + JetBrains Mono',
    visualType: 'swarm',
    scenes: [
      {
        id: 's1',
        title: 'AWAKENING',
        duration: 3.5,
        visualType: 'radar',
        tag: 'HUD BOOT SEQUENCE',
        mainText: 'GSTACK NEURAL MESH ONLINE.',
        subText: 'Synchronizing 64 specialist agents across 14 enterprise divisions.',
        highlight: 'ONLINE.',
        metric: 'CORE 100%',
        startNum: 0,
        endNum: 100,
        numSuffix: '% INITIALIZED'
      },
      {
        id: 's2',
        title: 'TELEMETRY',
        duration: 4.0,
        visualType: 'swarm',
        tag: 'AGENT CONSENSUS',
        mainText: '64 SPECIALISTS CONNECTED.',
        subText: 'Strategy, QA, Security, Sales & Release working in lockstep.',
        highlight: 'CONNECTED.',
        metric: 'VELOCITY: 96.8%',
        startNum: 40,
        endNum: 96.8,
        numSuffix: '% VELOCITY'
      },
      {
        id: 's3',
        title: 'INTERCEPT',
        duration: 4.0,
        visualType: 'terminal',
        tag: 'ZERO LATENCY',
        mainText: 'AUTONOMOUS DIRECTIVES FIRED.',
        subText: 'Direct natural language brief executed without approval friction.',
        highlight: 'AUTONOMOUS.',
        metric: '12ms LATENCY',
        startNum: 100,
        endNum: 12,
        numSuffix: 'ms RESPONSE'
      },
      {
        id: 's4',
        title: 'EMPIRE',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'INFRATECHAI LIVE',
        mainText: 'YOUR VIRTUAL EMPIRE.',
        subText: 'Join the next era of software engineering.',
        highlight: 'VIRTUAL EMPIRE.',
        metric: 'LIVE NOW',
        startNum: 0,
        endNum: 64,
        numSuffix: ' AGENTS ACTIVE'
      }
    ]
  },
  {
    id: 'satellite-briefing',
    slug: 'satellite-briefing',
    name: 'Satellite Briefing',
    category: 'Data & Intelligence',
    platform: 'LinkedIn / Reels',
    ratio: '9:16',
    duration: 14,
    accentColor: '#3B82F6',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/satellite-briefing/poster.jpg',
    description: 'Military-grade tactical satellite briefing: rotating radar sweeps, coordinate grids, and buyer intent telemetry.',
    palette: ['#3B82F6', '#1E3A8A', '#0F172A', '#E2E8F0'],
    fontPair: 'Inter Tight Bold + JetBrains Mono',
    visualType: 'radar',
    scenes: [
      {
        id: 's1',
        title: 'RECONNAISSANCE',
        duration: 3.5,
        visualType: 'radar',
        tag: 'TACTICAL RADAR',
        mainText: 'SCANNING IN-MARKET INTENT.',
        subText: 'Harvey scans 1,200 tech companies for buying signals every minute.',
        highlight: 'IN-MARKET INTENT.',
        metric: 'RADAR LIVE',
        startNum: 0,
        endNum: 1200,
        numSuffix: ' DOMAINS'
      },
      {
        id: 's2',
        title: 'TARGET ACQUIRED',
        duration: 3.5,
        visualType: 'revenue',
        tag: 'PROSPECT PINPOINT',
        mainText: '48 QUALIFIED BUYERS DETECTED.',
        subText: 'Hiring spikes and tech stack changes identified in real time.',
        highlight: '48 QUALIFIED BUYERS.',
        metric: '48 PROSPECTS',
        startNum: 0,
        endNum: 48,
        numSuffix: ' VERIFIED'
      },
      {
        id: 's3',
        title: 'COMMERCIALS',
        duration: 4.0,
        visualType: 'revenue',
        tag: 'REVENUE VELOCITY',
        mainText: '₹2,00,000 ARR PIPELINE.',
        subText: 'Multi-channel outbound sequences tailored autonomously in seconds.',
        highlight: '₹2,00,000',
        metric: '₹2,00,000 ARR',
        startNum: 50000,
        endNum: 200000,
        numSuffix: ' INR'
      },
      {
        id: 's4',
        title: 'DEPLOY',
        duration: 3.0,
        visualType: 'keynote',
        tag: 'ACTIVATE HARVEY',
        mainText: 'DOMINATE YOUR MARKET.',
        subText: 'Book a demo today at infratech.ai/sales',
        highlight: 'DOMINATE.',
        metric: '100% AUTONOMOUS',
        startNum: 0,
        endNum: 100,
        numSuffix: '% SCALE'
      }
    ]
  },
  {
    id: 'iso-infographic',
    slug: 'iso-infographic',
    name: 'Iso-Infographic 3D',
    category: 'Engineering & 3D',
    platform: 'YouTube / Widescreen',
    ratio: '16:9',
    duration: 16,
    accentColor: '#06B6D4',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/iso-infographic/poster.jpg',
    description: '3D isometric infrastructure diagrams, connecting distributed API boundaries, databases, and autonomous agents.',
    palette: ['#06B6D4', '#155E75', '#082F49', '#ECFEFF'],
    fontPair: 'Space Grotesk + JetBrains Mono',
    visualType: 'pipeline',
    scenes: [
      {
        id: 's1',
        title: 'TOPOLOGY',
        duration: 4.0,
        visualType: 'pipeline',
        tag: 'ISOMETRIC TOPOLOGY',
        mainText: 'DISTRIBUTED ARCHITECTURE AT SCALE.',
        subText: 'Mapping multi-region microservices and cloud workloads.',
        highlight: 'AT SCALE.',
        metric: '99.99% UPTIME',
        startNum: 90,
        endNum: 99.99,
        numSuffix: '% UPTIME'
      },
      {
        id: 's2',
        title: 'CONSENSUS',
        duration: 4.0,
        visualType: 'swarm',
        tag: 'DATA CONTRACTS',
        mainText: 'SCHEMA GUARDS NEVER SLEEP.',
        subText: 'Continuous API verification and zero-latency breaking change detection.',
        highlight: 'NEVER SLEEP.',
        metric: '0 BREAKS',
        startNum: 12,
        endNum: 0,
        numSuffix: ' CONTRACT ERRORS'
      },
      {
        id: 's3',
        title: 'VERIFICATION',
        duration: 4.5,
        visualType: 'terminal',
        tag: 'ARGUS PRIME ACTIVE',
        mainText: 'FULL REGRESSION INTERCEPT.',
        subText: 'Cross-model validation running parallel suites in 4.2 seconds.',
        highlight: 'REGRESSION INTERCEPT.',
        metric: '4.2s DURATION',
        startNum: 60,
        endNum: 4.2,
        numSuffix: 's SUITE TIME'
      },
      {
        id: 's4',
        title: 'SCALE',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'ENTERPRISE ARCHITECTURE',
        mainText: 'BUILT FOR SCALE.',
        subText: 'Deploy with confidence at infratech.ai',
        highlight: 'BUILT FOR SCALE.',
        metric: 'ENTERPRISE',
        startNum: 0,
        endNum: 100,
        numSuffix: '% AUDITED'
      }
    ]
  },
  {
    id: 'dataviz',
    slug: 'dataviz',
    name: 'Dataviz Cinema',
    category: 'Data & Intelligence',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 15,
    accentColor: '#EC4899',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/dataviz/poster.jpg',
    description: 'High-contrast data visualization: kinetic charts, velocity sparklines, and commercial growth metrics.',
    palette: ['#EC4899', '#831843', '#110D16', '#FDF2F8'],
    fontPair: 'Plus Jakarta Sans Bold + SF Pro Mono',
    visualType: 'revenue',
    scenes: [
      {
        id: 's1',
        title: 'METRICS',
        duration: 3.5,
        visualType: 'pipeline',
        tag: 'VELOCITY AUDIT',
        mainText: 'ENGINEERING VELOCITY UNLOCKED.',
        subText: 'Sprint completion rate accelerated by autonomous test generation.',
        highlight: 'VELOCITY UNLOCKED.',
        metric: '96.8% VELOCITY',
        startNum: 40,
        endNum: 96.8,
        numSuffix: '% SPRINT PACE'
      },
      {
        id: 's2',
        title: 'GROWTH',
        duration: 4.0,
        visualType: 'revenue',
        tag: 'ARR GROWTH',
        mainText: 'RETAINER ARR SCALING 4X.',
        subText: 'Automated outbound engine driving continuous enterprise pipeline.',
        highlight: 'SCALING 4X.',
        metric: '₹2,00,000 / MO',
        startNum: 50000,
        endNum: 200000,
        numSuffix: ' INR'
      },
      {
        id: 's3',
        title: 'QUALITY',
        duration: 4.0,
        visualType: 'radar',
        tag: 'DEFECT DROP',
        mainText: 'ZERO PRODUCTION REGRESSIONS.',
        subText: 'Defect density reduced to absolute zero before code hits production.',
        highlight: 'ZERO REGRESSIONS.',
        metric: '0 DEFECTS',
        startNum: 542,
        endNum: 0,
        numSuffix: ' BUGS'
      },
      {
        id: 's4',
        title: 'SUMMARY',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'INFRATECHAI',
        mainText: 'DATA-DRIVEN DOMINANCE.',
        subText: 'Start your enterprise trial today.',
        highlight: 'DOMINANCE.',
        metric: '100% READY',
        startNum: 0,
        endNum: 100,
        numSuffix: '% READY'
      }
    ]
  },
  {
    id: 'circuit-board',
    slug: 'circuit-board',
    name: 'Circuit Board Silicon',
    category: 'Engineering & 3D',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 14,
    accentColor: '#10B981',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/circuit-board/poster.jpg',
    description: 'Glowing PCB semiconductor traces, microchip bus lanes, and zero-latency hardware execution.',
    palette: ['#10B981', '#064E3B', '#0A0F0D', '#ECFDF5'],
    fontPair: 'Space Grotesk + Fira Code',
    visualType: 'radar',
    scenes: [
      {
        id: 's1',
        title: 'SILICON',
        duration: 3.5,
        visualType: 'radar',
        tag: 'HARDWARE CHIP',
        mainText: 'ENGINEERED AT THE SILICON LEVEL.',
        subText: 'Zero overhead, zero memory leaks, lightning fast.',
        highlight: 'SILICON LEVEL.',
        metric: '60 FPS ENGINE',
        startNum: 24,
        endNum: 60,
        numSuffix: ' FPS'
      },
      {
        id: 's2',
        title: 'BUS SPEED',
        duration: 3.5,
        visualType: 'terminal',
        tag: 'MICROSECOND SPEED',
        mainText: '12ms DIRECT NLP DISPATCH.',
        subText: 'Antigravity routes founder commands directly to specialized agents.',
        highlight: '12ms DISPATCH.',
        metric: '12ms LATENCY',
        startNum: 150,
        endNum: 12,
        numSuffix: 'ms'
      },
      {
        id: 's3',
        title: 'CIRCUITRY',
        duration: 4.0,
        visualType: 'swarm',
        tag: '64 AGENT BUS',
        mainText: '64 CORES FIRING AS ONE.',
        subText: 'A unified workforce with zero communication friction.',
        highlight: '64 CORES.',
        metric: '64 AGENTS',
        startNum: 0,
        endNum: 64,
        numSuffix: ' CORES'
      },
      {
        id: 's4',
        title: 'DEPLOY',
        duration: 3.0,
        visualType: 'keynote',
        tag: 'POWER YOUR TEAM',
        mainText: 'UPGRADE YOUR TECH STACK.',
        subText: 'Try InfratechAI Master App.',
        highlight: 'UPGRADE.',
        metric: '100% ONLINE',
        startNum: 0,
        endNum: 100,
        numSuffix: '% STABLE'
      }
    ]
  },
  {
    id: 'swiss-motion',
    slug: 'swiss-motion',
    name: 'Swiss Motion Graphics',
    category: 'Print & Graphic',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 14,
    accentColor: '#EF4444',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/swiss-motion/poster.jpg',
    description: 'International Typographic Style: bold black-and-white grids, vivid Swiss crimson, and sharp kinetic rhythm.',
    palette: ['#EF4444', '#18181B', '#FAFAFA', '#71717A'],
    fontPair: 'Plus Jakarta Sans Bold + SF Pro Display',
    visualType: 'keynote',
    scenes: [
      {
        id: 's1',
        title: 'MANIFESTO',
        duration: 3.5,
        visualType: 'radar',
        tag: 'SWISS DISCIPLINE',
        mainText: 'DESIGN IS NOT DECORATION.',
        subText: 'It is structural clarity. It is speed without clutter.',
        highlight: 'STRUCTURAL CLARITY.',
        metric: '100% GRID',
        startNum: 0,
        endNum: 100,
        numSuffix: '% CLARITY'
      },
      {
        id: 's2',
        title: 'REDUCTION',
        duration: 3.5,
        visualType: 'terminal',
        tag: 'ZERO NOISE',
        mainText: 'KILL REDUNDANT INTERFACES.',
        subText: 'Every pixel serves an autonomous outcome.',
        highlight: 'KILL REDUNDANCY.',
        metric: '0 CLICKS',
        startNum: 100,
        endNum: 0,
        numSuffix: ' MANUAL CLICKS'
      },
      {
        id: 's3',
        title: 'VELOCITY',
        duration: 4.0,
        visualType: 'pipeline',
        tag: 'SWISS MOTION',
        mainText: 'PRECISION AT MAXIMUM VELOCITY.',
        subText: '14 departments executing seamlessly with Antigravity.',
        highlight: 'PRECISION.',
        metric: '96.8% VELOCITY',
        startNum: 50,
        endNum: 96.8,
        numSuffix: '% SPEED'
      },
      {
        id: 's4',
        title: 'CONCLUSION',
        duration: 3.0,
        visualType: 'keynote',
        tag: 'INFRATECHAI',
        mainText: 'CRAFT MATTERS.',
        subText: 'Experience InfratechAI Enterprise.',
        highlight: 'CRAFT MATTERS.',
        metric: 'MASTERPIECE',
        startNum: 0,
        endNum: 100,
        numSuffix: '% POLISHED'
      }
    ]
  },
  {
    id: 'blueprint',
    slug: 'blueprint',
    name: 'Blueprint Schematic',
    category: 'Print & Graphic',
    platform: 'YouTube / Widescreen',
    ratio: '16:9',
    duration: 16,
    accentColor: '#38BDF8',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/blueprint/poster.jpg',
    description: 'Cyan architectural blueprint drawing: technical gridlines, dimension annotations, and schematic accuracy.',
    palette: ['#38BDF8', '#0369A1', '#082F49', '#F0F9FF'],
    fontPair: 'Space Grotesk + JetBrains Mono',
    visualType: 'pipeline',
    scenes: [
      {
        id: 's1',
        title: 'SCHEMATIC',
        duration: 4.0,
        visualType: 'pipeline',
        tag: 'BLUEPRINT REV 4.2',
        mainText: 'ENTERPRISE QA BLUEPRINT.',
        subText: 'Engineered specification for autonomous regression testing.',
        highlight: 'BLUEPRINT.',
        metric: 'REV 4.2',
        startNum: 1,
        endNum: 4.2,
        numSuffix: ' REV'
      },
      {
        id: 's2',
        title: 'TOLERANCES',
        duration: 4.0,
        visualType: 'radar',
        tag: 'ZERO DEFECT SPEC',
        mainText: 'ZERO TOLERANCE FOR FLAKY TESTS.',
        subText: 'Self-healing test harnesses generated on every pull request.',
        highlight: 'ZERO TOLERANCE.',
        metric: '0.00% FLAKY',
        startNum: 42,
        endNum: 0,
        numSuffix: '% FLAKY'
      },
      {
        id: 's3',
        title: 'ASSEMBLY',
        duration: 4.5,
        visualType: 'swarm',
        tag: 'GSTACK ASSEMBLY',
        mainText: '64 AGENT WORKFORCE ALIGNED.',
        subText: 'Strategy to DevOps cloud integration verified in consensus.',
        highlight: '64 AGENTS ALIGNED.',
        metric: '64 AGENTS',
        startNum: 0,
        endNum: 64,
        numSuffix: ' ACTIVE'
      },
      {
        id: 's4',
        title: 'CERTIFY',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'CERTIFIED BLUEPRINT',
        mainText: 'ARCHITECTED FOR VICTORY.',
        subText: 'Ship flawless software with InfratechAI.',
        highlight: 'FOR VICTORY.',
        metric: '100% PASS',
        startNum: 0,
        endNum: 100,
        numSuffix: '% VERIFIED'
      }
    ]
  },
  {
    id: 'impasto',
    slug: 'impasto',
    name: 'Impasto Oil Painting',
    category: 'Artistic & Painterly',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 15,
    accentColor: '#D97706',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/impasto/poster.jpg',
    description: 'Rich sculptural oil paint with tactile palette-knife texture, warm ochre highlights, and artistic cinema.',
    palette: ['#D97706', '#78350F', '#1C1917', '#FEF3C7'],
    fontPair: 'Plus Jakarta Sans Bold + SF Pro Text',
    visualType: 'keynote',
    scenes: [
      {
        id: 's1',
        title: 'VISION',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'IMPASTO CINEMA',
        mainText: 'TURNING SOFTWARE INTO ART.',
        subText: 'Where engineering rigor meets visceral, tactile human craft.',
        highlight: 'INTO ART.',
        metric: 'HAND-CRAFTED',
        startNum: 0,
        endNum: 100,
        numSuffix: '% CRAFT'
      },
      {
        id: 's2',
        title: 'CREATION',
        duration: 4.0,
        visualType: 'swarm',
        tag: '64 MASTER SPECIALISTS',
        mainText: '64 MINDS, ONE COMPOSITION.',
        subText: 'Every detail tuned with the care of an oil painting master.',
        highlight: 'ONE COMPOSITION.',
        metric: '64 ARTISANS',
        startNum: 0,
        endNum: 64,
        numSuffix: ' SPECIALISTS'
      },
      {
        id: 's3',
        title: 'TEXTURE',
        duration: 4.0,
        visualType: 'radar',
        tag: 'RICH DEPTH',
        mainText: 'DEPTH YOU CAN FEEL.',
        subText: 'Specular Sonoma glass with fluid spring animations.',
        highlight: 'CAN FEEL.',
        metric: '60 FPS FLUID',
        startNum: 24,
        endNum: 60,
        numSuffix: ' FPS'
      },
      {
        id: 's4',
        title: 'FINALE',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'INFRATECHAI',
        mainText: 'YOUR MASTERPIECE AWAITS.',
        subText: 'Experience the art of autonomous software.',
        highlight: 'MASTERPIECE.',
        metric: 'ENTERPRISE',
        startNum: 0,
        endNum: 100,
        numSuffix: '% POLISHED'
      }
    ]
  },
  {
    id: 'ukiyoe',
    slug: 'ukiyoe',
    name: 'Ukiyo-e Woodblock',
    category: 'Artistic & Painterly',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 15,
    accentColor: '#2563EB',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/ukiyoe/poster.jpg',
    description: 'Traditional Japanese woodblock art: iconic Great Wave ink outlines, indigo waters, and epic resilience.',
    palette: ['#2563EB', '#1E3A8A', '#0F172A', '#EFF6FF'],
    fontPair: 'Space Grotesk + SF Pro Text',
    visualType: 'radar',
    scenes: [
      {
        id: 's1',
        title: 'THE STORM',
        duration: 3.5,
        visualType: 'radar',
        tag: 'PRODUCTION STORM',
        mainText: 'RIDING OUT THE RELEASE CRASH.',
        subText: 'When manual QA collapses under the weight of regressions.',
        highlight: 'RELEASE CRASH.',
        metric: 'HIGH SEAS',
        startNum: 100,
        endNum: 0,
        numSuffix: '% RISK'
      },
      {
        id: 's2',
        title: 'MASTERY',
        duration: 4.0,
        visualType: 'swarm',
        tag: 'ANCIENT DISCIPLINE',
        mainText: '64 AGENTS WEATHER THE TIDE.',
        subText: 'Autonomous consensus restoring calm to production pipelines.',
        highlight: 'WEATHER THE TIDE.',
        metric: '0 DEFECTS',
        startNum: 542,
        endNum: 0,
        numSuffix: ' BUGS'
      },
      {
        id: 's3',
        title: 'HARMONY',
        duration: 4.0,
        visualType: 'terminal',
        tag: 'PERFECT BALANCE',
        mainText: 'CODE IN TOTAL EQUILIBRIUM.',
        subText: 'Argus Prime and Rex ensure zero breaking changes.',
        highlight: 'EQUILIBRIUM.',
        metric: '100% PASS',
        startNum: 0,
        endNum: 100,
        numSuffix: '% PASS'
      },
      {
        id: 's4',
        title: 'HORIZON',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'CALM WATERS',
        mainText: 'SHIP WITHOUT FEAR.',
        subText: 'InfratechAI protects your infrastructure.',
        highlight: 'WITHOUT FEAR.',
        metric: 'PEACE OF MIND',
        startNum: 0,
        endNum: 100,
        numSuffix: '% RESTORED'
      }
    ]
  },
  {
    id: 'watercolor',
    slug: 'watercolor',
    name: 'Watercolor Brush Wash',
    category: 'Artistic & Painterly',
    platform: 'YouTube / Widescreen',
    ratio: '16:9',
    duration: 16,
    accentColor: '#0D9488',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/watercolor/poster.jpg',
    description: 'Soft translucent watercolor pigments blooming on wet textured paper with fluid organic gradients.',
    palette: ['#0D9488', '#134E4A', '#0F172A', '#F0FDFA'],
    fontPair: 'SF Pro Display + SF Pro Text',
    visualType: 'swarm',
    scenes: [
      {
        id: 's1',
        title: 'BLOOM',
        duration: 4.0,
        visualType: 'swarm',
        tag: 'ORGANIC FLOW',
        mainText: 'THE FLUIDITY OF MODERN ENGINEERING.',
        subText: 'Software development that breathes without friction.',
        highlight: 'FLUIDITY.',
        metric: '60 FPS FLUID',
        startNum: 24,
        endNum: 60,
        numSuffix: ' FPS'
      },
      {
        id: 's2',
        title: 'HARMONY',
        duration: 4.0,
        visualType: 'pipeline',
        tag: 'SEAMLESS PIPELINE',
        mainText: 'EVERY TEST FLOWS AUTOMATICALLY.',
        subText: 'Zero manual bottlenecks between your ideas and cloud deployment.',
        highlight: 'FLOWS AUTOMATICALLY.',
        metric: '0 CLICKS',
        startNum: 100,
        endNum: 0,
        numSuffix: ' DELAYS'
      },
      {
        id: 's3',
        title: 'COLLABORATION',
        duration: 4.5,
        visualType: 'terminal',
        tag: '64 AGENTS MERGED',
        mainText: '14 DEPARTMENTS BLENDING TOGETHER.',
        subText: 'Architecture, QA, Design, Sales and DevOps unified in one canvas.',
        highlight: 'BLENDING TOGETHER.',
        metric: '14 DEPTS',
        startNum: 1,
        endNum: 14,
        numSuffix: ' TEAMS'
      },
      {
        id: 's4',
        title: 'SUNRISE',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'INFRATECHAI',
        mainText: 'A CLEAR HORIZON FOR BUILDERS.',
        subText: 'Experience InfratechAI today.',
        highlight: 'CLEAR HORIZON.',
        metric: 'AVAILABLE NOW',
        startNum: 0,
        endNum: 100,
        numSuffix: '% READY'
      }
    ]
  },
  {
    id: 'ascii-crt',
    slug: 'ascii-crt',
    name: 'ASCII CRT Terminal',
    category: 'Cyber & Telemetry',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 14,
    accentColor: '#22C55E',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/ascii-crt/poster.jpg',
    description: 'Phosphor green CRT curvature, scanlines, flickering ASCII character matrices, and hacker terminal aesthetics.',
    palette: ['#22C55E', '#14532D', '#052E16', '#DCFCE7'],
    fontPair: 'Fira Code + JetBrains Mono',
    visualType: 'terminal',
    scenes: [
      {
        id: 's1',
        title: 'BOOT',
        duration: 3.5,
        visualType: 'terminal',
        tag: 'TTY_CORE ONLINE',
        mainText: 'ROOT ACCESS GRANTED.',
        subText: 'Scanning production kernel for unhandled regression loops.',
        highlight: 'ROOT ACCESS.',
        metric: 'TTY_0 ONLINE',
        startNum: 0,
        endNum: 100,
        numSuffix: '% BOOT'
      },
      {
        id: 's2',
        title: 'DECOMPILE',
        duration: 3.5,
        visualType: 'radar',
        tag: 'ASCII RADAR',
        mainText: '542 BUGS TRACED IN MEMORY.',
        subText: 'Exploits and race conditions mapped with cryptographic accuracy.',
        highlight: 'TRACED IN MEMORY.',
        metric: '542 FAULTS',
        startNum: 542,
        endNum: 0,
        numSuffix: ' FAULTS'
      },
      {
        id: 's3',
        title: 'PATCH',
        duration: 4.0,
        visualType: 'terminal',
        tag: 'SELF-HEALING KERNEL',
        mainText: 'BINARY HOT-PATCH DEPLOYED.',
        subText: 'Zero downtime auto-patch compiled and verified by 64 agents.',
        highlight: 'HOT-PATCH DEPLOYED.',
        metric: '0 DEFECTS',
        startNum: 18,
        endNum: 0,
        numSuffix: ' CRASHES'
      },
      {
        id: 's4',
        title: 'PROMPT',
        duration: 3.0,
        visualType: 'keynote',
        tag: 'SYSTEM STABLE',
        mainText: 'SYSTEM SECURE.',
        subText: 'Run with InfratechAI Enterprise.',
        highlight: 'SYSTEM SECURE.',
        metric: '0 ERRORS',
        startNum: 0,
        endNum: 100,
        numSuffix: '% STABLE'
      }
    ]
  },
  {
    id: 'whiteboard',
    slug: 'whiteboard',
    name: 'Whiteboard Explainer',
    category: 'Educational & Explainer',
    platform: 'YouTube / Widescreen',
    ratio: '16:9',
    duration: 16,
    accentColor: '#2563EB',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/whiteboard/poster.jpg',
    description: 'Dry-erase whiteboard diagrams: handwritten arrows, circle callouts, marker sketches, and crystal-clear logic.',
    palette: ['#2563EB', '#1E40AF', '#F8FAFC', '#1E293B'],
    fontPair: 'Plus Jakarta Sans Bold + SF Pro Text',
    visualType: 'pipeline',
    scenes: [
      {
        id: 's1',
        title: 'PROBLEM',
        duration: 4.0,
        visualType: 'pipeline',
        tag: 'WHITEBOARD DIAGRAM',
        mainText: 'WHY TRADITIONAL QA BREAKS.',
        subText: 'Here is what happens when code releases depend on human manual clicks.',
        highlight: 'QA BREAKS.',
        metric: '14 HRS LOST',
        startNum: 0,
        endNum: 14,
        numSuffix: ' HRS/WEEK'
      },
      {
        id: 's2',
        title: 'ARCHITECTURE',
        duration: 4.0,
        visualType: 'swarm',
        tag: 'HOW AGENTS WORK',
        mainText: 'THE 64-AGENT GSTACK MODEL.',
        subText: 'Notice how each department head passes clean verified state down the pipe.',
        highlight: 'GSTACK MODEL.',
        metric: '14 DEPTS',
        startNum: 1,
        endNum: 14,
        numSuffix: ' TEAMS'
      },
      {
        id: 's3',
        title: 'EXECUTION',
        duration: 4.5,
        visualType: 'terminal',
        tag: 'ZERO MANUAL WORK',
        mainText: 'FROM NATURAL LANGUAGE TO VERIFIED CODE.',
        subText: 'The founder writes one directive; the company executes autonomously.',
        highlight: 'VERIFIED CODE.',
        metric: '0 CLICKS',
        startNum: 100,
        endNum: 0,
        numSuffix: ' CLICKS'
      },
      {
        id: 's4',
        title: 'TAKEAWAY',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'KEY TAKEAWAY',
        mainText: 'FASTER RELEASES, ZERO BUGS.',
        subText: 'Upgrade your development workflow today.',
        highlight: 'ZERO BUGS.',
        metric: '100% PASS',
        startNum: 0,
        endNum: 100,
        numSuffix: '% PASS'
      }
    ]
  },
  {
    id: 'memphis-diorama',
    slug: 'memphis-diorama',
    name: 'Memphis Diorama 3D',
    category: 'Artistic & Painterly',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 14,
    accentColor: '#F43F5E',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/memphis-diorama/poster.jpg',
    description: 'Postmodern Memphis geometry: pastel 3D cylinders, squiggles, coral pillars, and playful tactile design.',
    palette: ['#F43F5E', '#9F1239', '#18181B', '#FFF1F2'],
    fontPair: 'Space Grotesk + Plus Jakarta Sans',
    visualType: 'swarm',
    scenes: [
      {
        id: 's1',
        title: 'PLAYFUL',
        duration: 3.5,
        visualType: 'swarm',
        tag: 'MEMPHIS 3D',
        mainText: 'ENTERPRISE TECH CAN BE FUN.',
        subText: 'Throw away boring enterprise grey. Experience joyful software craft.',
        highlight: 'CAN BE FUN.',
        metric: '100% JOY',
        startNum: 0,
        endNum: 100,
        numSuffix: '% VIBRANT'
      },
      {
        id: 's2',
        title: 'GEOMETRY',
        duration: 3.5,
        visualType: 'radar',
        tag: 'GEOMETRIC LOGIC',
        mainText: 'MODULAR AGENTS THAT FIT TOGETHER.',
        subText: 'Every specialist connects seamlessly like building blocks.',
        highlight: 'FIT TOGETHER.',
        metric: '64 BLOCKS',
        startNum: 0,
        endNum: 64,
        numSuffix: ' AGENTS'
      },
      {
        id: 's3',
        title: 'SPEED',
        duration: 4.0,
        visualType: 'pipeline',
        tag: 'RAPID COMPOSITION',
        mainText: 'SHIP AT LIGHTNING VELOCITY.',
        subText: 'Effortless automated releases with zero friction.',
        highlight: 'LIGHTNING VELOCITY.',
        metric: '96.8% VELOCITY',
        startNum: 30,
        endNum: 96.8,
        numSuffix: '% SPEED'
      },
      {
        id: 's4',
        title: 'CTA',
        duration: 3.0,
        visualType: 'keynote',
        tag: 'TRY INFRATECHAI',
        mainText: 'BUILD YOUR FUTURE.',
        subText: 'Experience InfratechAI Master App.',
        highlight: 'BUILD YOUR FUTURE.',
        metric: 'LIVE NOW',
        startNum: 0,
        endNum: 100,
        numSuffix: '% READY'
      }
    ]
  },
  {
    id: 'risograph',
    slug: 'risograph',
    name: 'Risograph Print Edition',
    category: 'Print & Graphic',
    platform: 'Reels / Shorts',
    ratio: '9:16',
    duration: 14,
    accentColor: '#E11D48',
    posterUrl: 'https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/risograph/poster.jpg',
    description: 'Fluorescent ink misregistration, tactile rice-paper grain, dual-tone layering, and indie print aesthetics.',
    palette: ['#E11D48', '#881337', '#18181B', '#FFE4E6'],
    fontPair: 'Inter Tight Bold + JetBrains Mono',
    visualType: 'keynote',
    scenes: [
      {
        id: 's1',
        title: 'PRINT',
        duration: 3.5,
        visualType: 'keynote',
        tag: 'RISOGRAPH ZINE',
        mainText: 'HOT OFF THE DIGITAL PRESS.',
        subText: 'Tactile, raw, and unapologetically bold.',
        highlight: 'DIGITAL PRESS.',
        metric: 'LIMITED EDITION',
        startNum: 1,
        endNum: 64,
        numSuffix: ' COPIES'
      },
      {
        id: 's2',
        title: 'INK LAYERS',
        duration: 3.5,
        visualType: 'terminal',
        tag: 'DUAL TONE INK',
        mainText: 'CODE PRINTED IN REAL-TIME.',
        subText: 'Auto-patch test runners logging transparent attestations.',
        highlight: 'REAL-TIME.',
        metric: '0 DEFECTS',
        startNum: 100,
        endNum: 0,
        numSuffix: ' INK SPILLS'
      },
      {
        id: 's3',
        title: 'COMMUNITY',
        duration: 4.0,
        visualType: 'swarm',
        tag: 'INDIE HACKER SWARM',
        mainText: '64 AGENTS BUILDING IN PUBLIC.',
        subText: 'Transparent, accountable, and high-velocity.',
        highlight: 'BUILDING IN PUBLIC.',
        metric: '64 AGENTS',
        startNum: 0,
        endNum: 64,
        numSuffix: ' MAKERS'
      },
      {
        id: 's4',
        title: 'COLLECT',
        duration: 3.0,
        visualType: 'keynote',
        tag: 'INFRATECHAI',
        mainText: 'JOIN THE MOVEMENT.',
        subText: 'Deploy with InfratechAI.',
        highlight: 'THE MOVEMENT.',
        metric: '100% INDIE',
        startNum: 0,
        endNum: 100,
        numSuffix: '% REAL'
      }
    ]
  }
];

export const AnimationStudioView = ({ onNavigateToApp, currentUser }) => {
  // GAMMA-STYLE STEP WORKFLOW: 1: Storyboard | 2: Styles | 3: Duration & Audio | 4: Cinema Stage
  const [gammaStep, setGammaStep] = useState(4);

  // Active template & scenes state
  const [activeTemplate, setActiveTemplate] = useState(PRESET_TEMPLATES[0]);
  const [aspectRatio, setAspectRatio] = useState(PRESET_TEMPLATES[0].ratio);
  const [scenes, setScenes] = useState(PRESET_TEMPLATES[0].scenes);
  const [selectedPacing, setSelectedPacing] = useState('15s');
  const [audioPreset, setAudioPreset] = useState('tech-riser');
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(false);

  // Style Gallery Filter & Search in Step 2
  const [styleCategoryFilter, setStyleCategoryFilter] = useState('ALL');
  const [styleSearchQuery, setStyleSearchQuery] = useState('');

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
      text: "Hey Founder Aman! I'm your dedicated AI Animator (Dept 04 • Design Engineering). I compose short films using all 16 official Lemo-Opuscar styles: Dark Keynotes, Teardowns, Hologram HUDs, Satellites, and Impasto Oils. Tap any style poster or instruct me below!"
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

  // Canvas, Image and Audio Refs
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioDestRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const beatTimerRef = useRef(null);
  const posterImageMapRef = useRef({});
  const [, setPosterLoadCount] = useState(0);
  const [posterOpacityMode, setPosterOpacityMode] = useState('vivid'); // 'vivid' | 'balanced' | 'minimal'

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

  // Preload poster images for silky smooth rendering
  useEffect(() => {
    PRESET_TEMPLATES.forEach((tmpl) => {
      if (!posterImageMapRef.current[tmpl.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setPosterLoadCount((c) => c + 1);
        };
        img.src = tmpl.posterUrl;
        posterImageMapRef.current[tmpl.id] = img;
      }
    });
  }, []);

  // Filtered styles list for Step 2
  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter((tmpl) => {
      const matchCat = styleCategoryFilter === 'ALL' || tmpl.category === styleCategoryFilter;
      const q = styleSearchQuery.toLowerCase().trim();
      const matchQ = !q || tmpl.name.toLowerCase().includes(q) || tmpl.description.toLowerCase().includes(q) || tmpl.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [styleCategoryFilter, styleSearchQuery]);

  // Total Duration
  const totalDuration = useMemo(() => {
    return scenes.reduce((sum, s) => sum + s.duration, 0);
  }, [scenes]);

  // Select a template
  const handleSelectTemplate = (template) => {
    setActiveTemplate(template);
    setAspectRatio(template.ratio);
    setScenes(JSON.parse(JSON.stringify(template.scenes)));
    setCurrentTime(0);
    setIsPlaying(false);
    setSelectedSceneIndex(0);
  };

  // Find current scene
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

  // Audio Context management
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

  // Sound effects
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

  // Procedural Rhythmic Synth
  useEffect(() => {
    if (!isPlaying || !audioEnabled || audioPreset === 'muted') {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      return;
    }

    const ctx = ensureAudioContext();
    if (!ctx || !masterGainRef.current) return;

    let stepCount = 0;
    const intervalMs = 250;

    beatTimerRef.current = setInterval(() => {
      try {
        const now = ctx.currentTime;
        stepCount++;

        if (audioPreset === 'tech-riser') {
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
          if (stepCount % 8 === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const notes = [220, 261.63, 329.63, 392];
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
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const arp = [130.81, 164.81, 196.00, 246.94];
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

  // Voiceover Narration
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

  // Track scene transitions
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

  // =========================================================================
  // 60 FPS HTML5 CANVAS ENGINE (WITH POSTER BACKDROP + VISUAL GRAPHICS)
  // =========================================================================
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
    ctx.fillStyle = '#080A0F';
    ctx.fillRect(0, 0, targetW, targetH);

    // 2. DRAW CINEMATIC STYLE POSTER AS ART BACKDROP
    const posterImg = posterImageMapRef.current[activeTemplate.id];
    const posterAlpha = posterOpacityMode === 'vivid' ? 0.58 : posterOpacityMode === 'balanced' ? 0.38 : 0.18;
    if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
      ctx.save();
      // Gentle cinematic breathing scale & subtle pan
      const zoom = 1.02 + Math.sin(currentTime * 0.22) * 0.035;
      const drawW = targetW * zoom;
      const drawH = targetH * zoom;
      const drawX = (targetW - drawW) / 2;
      const drawY = (targetH - drawH) / 2;

      ctx.globalAlpha = posterAlpha;
      ctx.drawImage(posterImg, drawX, drawY, drawW, drawH);

      // Cinematic gradient overlay for crisp text contrast without washing out the art
      const vigGrad = ctx.createRadialGradient(
        targetW / 2,
        targetH * 0.46,
        targetW * 0.22,
        targetW / 2,
        targetH / 2,
        targetW * 0.78
      );
      vigGrad.addColorStop(0, 'rgba(8, 10, 15, 0.10)');
      vigGrad.addColorStop(0.65, 'rgba(8, 10, 15, 0.48)');
      vigGrad.addColorStop(1, 'rgba(8, 10, 15, 0.86)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.restore();
    } else {
      // Elegant generative backdrop fallback while poster loads
      ctx.save();
      const fallGrad = ctx.createLinearGradient(0, 0, targetW, targetH);
      fallGrad.addColorStop(0, `${accent}15`);
      fallGrad.addColorStop(0.5, '#0C0F18');
      fallGrad.addColorStop(1, `${accent}10`);
      ctx.fillStyle = fallGrad;
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.restore();
    }

    // 3. DYNAMIC ATMOSPHERIC MESH AURA
    const auraX = targetW * (0.5 + Math.sin(currentTime * 0.8) * 0.15);
    const auraY = targetH * (0.4 + Math.cos(currentTime * 0.7) * 0.1);
    const auraRadius = Math.max(targetW, targetH) * 0.7;
    const auraGrad = ctx.createRadialGradient(auraX, auraY, 60, auraX, auraY, auraRadius);
    auraGrad.addColorStop(0, `${accent}45`);
    auraGrad.addColorStop(0.5, `${accent}15`);
    auraGrad.addColorStop(1, 'rgba(8, 10, 15, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, 0, targetW, targetH);

    // 4. PERSPECTIVE FLOOR GRID
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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

    // 5. FLOATING PARTICLES
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
      ctx.arc(pt.x * targetW, pt.y * targetH, pt.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 6. TOP BRANDING POD & LIVE FPS PILL
    const headerY = targetH * (aspectRatio === '16:9' ? 0.07 : 0.05);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('INFRATECHAI', targetW * 0.07, headerY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`• ${activeTemplate.name.toUpperCase()} CINEMA`, targetW * 0.07 + 175, headerY);

    // Live 60 FPS Pill
    const pillX = targetW * 0.93;
    ctx.fillStyle = 'rgba(20, 21, 24, 0.85)';
    ctx.beginPath();
    ctx.roundRect(pillX - 110, headerY - 22, 110, 32, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(pillX - 90, headerY - 6, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('60 FPS', pillX - 50, headerY - 2);
    ctx.restore();

    // 7. NARRATIVE HEADLINE & TAG SECTION (TOP)
    const enterEase = Math.min(1, Math.max(0, sceneLocalTime * 2.8));
    const smoothEase = 1 - Math.pow(1 - enterEase, 3);
    const textOffsetY = (1 - smoothEase) * 30;

    ctx.save();
    ctx.globalAlpha = smoothEase;

    // Tag Badge
    const tagY = targetH * (aspectRatio === '16:9' ? 0.14 : 0.09) + textOffsetY * 0.5;
    ctx.fillStyle = `${accent}25`;
    const tagText = scene?.tag || 'SYSTEM DIRECTIVE';
    ctx.font = '800 18px -apple-system, BlinkMacSystemFont, sans-serif';
    const tagMetrics = ctx.measureText(tagText);
    const tagPadding = 20;

    ctx.beginPath();
    ctx.roundRect(targetW * 0.07, tagY - 24, tagMetrics.width + tagPadding * 2, 38, 19);
    ctx.fill();
    ctx.strokeStyle = `${accent}70`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.textAlign = 'left';
    ctx.fillText(tagText, targetW * 0.07 + tagPadding, tagY);

    // Scene Counter
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '700 18px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`0${index + 1} / 0${scenes.length}`, targetW * 0.93, tagY);

    // Main Kinetic Headline
    const headlineY = tagY + 54 + textOffsetY;
    const headlineFontSize = aspectRatio === '9:16' ? 48 : 52;
    ctx.font = `900 ${headlineFontSize}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';

    const maxTextW = targetW * 0.86;
    const words = (scene?.mainText || '').split(' ');
    let line = '';
    let curY = headlineY;
    const lineHeight = headlineFontSize * 1.15;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextW && n > 0) {
        ctx.fillText(line, targetW * 0.07, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, targetW * 0.07, curY);
    ctx.restore();

    // =======================================================================
    // 8. CENTER VISUAL STAGE: PROCEDURAL LEMO-OPUSCAR GRAPHICS
    // =======================================================================
    const stageCenterY = targetH * (aspectRatio === '9:16' ? 0.44 : 0.52);
    const stageCenterX = targetW * (aspectRatio === '16:9' ? 0.62 : 0.5);
    const stageRadius = targetW * (aspectRatio === '9:16' ? 0.38 : 0.28);

    const visualType = scene?.visualType || activeTemplate.visualType || 'radar';

    // Helper functions for drawing rich visuals
    if (visualType === 'radar') {
      // Draw Animated Radar
      ctx.save();
      const radGrad = ctx.createRadialGradient(stageCenterX, stageCenterY, 10, stageCenterX, stageCenterY, stageRadius);
      radGrad.addColorStop(0, `${accent}30`);
      radGrad.addColorStop(0.6, `${accent}10`);
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(stageCenterX, stageCenterY, stageRadius, 0, Math.PI * 2);
      ctx.fill();

      for (let r = 1; r <= 4; r++) {
        const curR = (stageRadius / 4) * r;
        ctx.strokeStyle = r === 4 ? `${accent}80` : 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(stageCenterX, stageCenterY, curR, 0, Math.PI * 2);
        ctx.stroke();
      }

      const sweepAngle = (currentTime * 2.5) % (Math.PI * 2);
      ctx.save();
      ctx.translate(stageCenterX, stageCenterY);
      ctx.rotate(sweepAngle);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(stageRadius, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, stageRadius, -0.4, 0);
      ctx.closePath();
      ctx.fillStyle = `${accent}25`;
      ctx.fill();
      ctx.restore();

      const blips = [
        { a: 0.8, d: 0.35, label: 'FLAKY TEST #12' },
        { a: 2.2, d: 0.65, label: 'MEM_LEAK_SEV1' },
        { a: 3.7, d: 0.50, label: 'TIMEOUT: 504' },
        { a: 5.1, d: 0.80, label: 'PAYMENT_DROPPED' }
      ];

      blips.forEach((b, idx) => {
        const bx = stageCenterX + Math.cos(b.a) * (stageRadius * b.d);
        const by = stageCenterY + Math.sin(b.a) * (stageRadius * b.d);
        const pulse = Math.sin(currentTime * 4 + idx) * 0.5 + 0.5;

        ctx.strokeStyle = accent;
        ctx.beginPath();
        ctx.arc(bx, by, 6 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 10px monospace';
        ctx.fillText(b.label, bx + 10, by + 4);
      });
      ctx.restore();

    } else if (visualType === 'swarm') {
      // Draw 64-Agent Swarm
      ctx.save();
      const specialistNodes = [
        { name: 'ARGUS', role: 'Verify', color: '#10B981' },
        { name: 'REX', role: 'QA Lead', color: '#3B82F6' },
        { name: 'HARVEY', role: 'Sales SDR', color: '#F59E0B' },
        { name: 'HELIOS', role: 'Release', color: '#EC4899' },
        { name: 'AEGIS', role: 'Security', color: '#EF4444' },
        { name: 'EMIL', role: 'Design Eng', color: '#8B5CF6' }
      ];

      const corePulse = Math.sin(currentTime * 3) * 6;
      const coreR = 48 + corePulse;

      ctx.save();
      ctx.translate(stageCenterX, stageCenterY);
      ctx.rotate(currentTime * 0.8);
      ctx.strokeStyle = `${accent}80`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const ang = (s * Math.PI) / 3;
        const hx = Math.cos(ang) * (coreR + 18);
        const hy = Math.sin(ang) * (coreR + 18);
        if (s === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#141518';
      ctx.beginPath();
      ctx.arc(stageCenterX, stageCenterY, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 13px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GSTACK', stageCenterX, stageCenterY - 4);
      ctx.fillStyle = accent;
      ctx.font = '700 10px monospace';
      ctx.fillText('64 AGENTS', stageCenterX, stageCenterY + 12);

      const orbitR = stageRadius * 0.72;
      specialistNodes.forEach((node, i) => {
        const angle = (i * Math.PI * 2) / specialistNodes.length + currentTime * 0.4;
        const nx = stageCenterX + Math.cos(angle) * orbitR;
        const ny = stageCenterY + Math.sin(angle) * orbitR;

        ctx.strokeStyle = `${node.color}50`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(stageCenterX, stageCenterY);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        const packetProgress = (currentTime * 2 + i * 0.3) % 1;
        const px = stageCenterX + (nx - stageCenterX) * packetProgress;
        const py = stageCenterY + (ny - stageCenterY) * packetProgress;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1E2028';
        ctx.beginPath();
        ctx.arc(nx, ny, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, ny + 3);
      });
      ctx.restore();

    } else if (visualType === 'terminal') {
      // Draw Code Terminal
      ctx.save();
      const termW = targetW * (aspectRatio === '16:9' ? 0.45 : 0.86);
      const termH = targetH * (aspectRatio === '16:9' ? 0.42 : 0.25);
      const termX = stageCenterX - termW / 2;
      const termY = stageCenterY - termH / 2;

      ctx.fillStyle = '#10121A';
      ctx.beginPath();
      ctx.roundRect(termX, termY, termW, termH, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const headH = 38;
      ctx.fillStyle = '#181A24';
      ctx.beginPath();
      ctx.roundRect(termX, termY, termW, headH, [20, 20, 0, 0]);
      ctx.fill();

      ['#FF5F56', '#FFBD2E', '#27C93F'].forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(termX + 24 + idx * 18, termY + headH / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '600 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${activeTemplate.slug}.ts — InfratechAI Engine`, stageCenterX, termY + 23);

      const codeLines = [
        { text: '// [INFRATECHAI AGENT RUNTIME] AUTO-PATCH ACTIVE', color: 'rgba(255,255,255,0.4)', prefix: '01' },
        { text: 'const verification = await ArgusPrime.scan(PR_942);', color: '#93C5FD', prefix: '02' },
        { text: '- if (!token) throw new GatewayTimeoutError();', color: '#F87171', prefix: '03' },
        { text: '+ const session = await TokenGuard.heal(ctx);', color: '#4ADE80', prefix: '04' },
        { text: '+ await TestMasterRex.runFullSuite(120);', color: '#4ADE80', prefix: '05' },
        { text: '✔ 120 / 120 VERIFIED PASS (0 REGRESSIONS)', color: accent, prefix: '06', bold: true }
      ];

      const startY = termY + headH + 34;
      const lineGap = 28;
      ctx.textAlign = 'left';

      codeLines.forEach((cl, idx) => {
        const curY = startY + idx * lineGap;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = '500 11px monospace';
        ctx.fillText(cl.prefix, termX + 20, curY);

        ctx.fillStyle = cl.color;
        ctx.font = cl.bold ? '800 13px monospace' : '600 12px monospace';
        ctx.fillText(cl.text, termX + 48, curY);
      });
      ctx.restore();

    } else if (visualType === 'pipeline') {
      // Draw Animated CI/CD & Verification Pipeline
      ctx.save();
      const pipeW = targetW * (aspectRatio === '16:9' ? 0.52 : 0.88);
      const pipeH = targetH * (aspectRatio === '16:9' ? 0.36 : 0.22);
      const pipeX = stageCenterX - pipeW / 2;
      const pipeY = stageCenterY - pipeH / 2;

      // Pipeline Glass Container
      ctx.fillStyle = 'rgba(16, 20, 30, 0.82)';
      ctx.beginPath();
      ctx.roundRect(pipeX, pipeY, pipeW, pipeH, 20);
      ctx.fill();
      ctx.strokeStyle = `${accent}40`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top title bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '800 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('AUTONOMOUS PIPELINE // 0-DEFECT VERIFICATION RUNNER', pipeX + 20, pipeY + 24);

      ctx.fillStyle = accent;
      ctx.textAlign = 'right';
      ctx.fillText('4.2s CYCLE', pipeX + pipeW - 20, pipeY + 24);

      // Pipeline Stages
      const stages = [
        { name: 'PR COMMIT', sub: 'Argus Prime', status: 'PASS' },
        { name: 'TEST SYNTH', sub: 'Rex Suite', status: 'PASS' },
        { name: 'REGRESSION', sub: '0 Breaking', status: 'ACTIVE' },
        { name: 'ZERO DEPLOY', sub: 'Helios EMP', status: 'READY' }
      ];

      const stageGap = (pipeW - 48) / stages.length;
      const nodeCenterY = pipeY + pipeH * 0.58;

      // Connecting laser pipe
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pipeX + 24 + stageGap * 0.5, nodeCenterY);
      ctx.lineTo(pipeX + pipeW - 24 - stageGap * 0.5, nodeCenterY);
      ctx.stroke();

      // Animated energy packet traveling between stages
      const packetTravel = (currentTime * 1.5) % 1;
      const packetX = (pipeX + 24 + stageGap * 0.5) + (pipeW - 48 - stageGap) * packetTravel;
      ctx.fillStyle = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(packetX, nodeCenterY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Draw each stage node
      stages.forEach((st, idx) => {
        const nx = pipeX + 24 + stageGap * (idx + 0.5);
        const isActive = st.status === 'ACTIVE';
        const isPass = st.status === 'PASS';

        // Outer glow for active
        if (isActive) {
          const pR = 26 + Math.sin(currentTime * 6) * 4;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(nx, nodeCenterY, pR, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isActive ? `${accent}35` : isPass ? '#10B98125' : '#1F2433';
        ctx.beginPath();
        ctx.arc(nx, nodeCenterY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isActive ? accent : isPass ? '#10B981' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon inside circle
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isPass ? '✔' : isActive ? '⚡' : '•', nx, nodeCenterY + 4);

        // Labels
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 11px -apple-system, sans-serif';
        ctx.fillText(st.name, nx, nodeCenterY + 36);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '600 9px monospace';
        ctx.fillText(st.sub, nx, nodeCenterY + 48);
      });
      ctx.restore();

    } else if (visualType === 'revenue') {
      // Draw Animated Revenue / Growth Dataviz Chart
      ctx.save();
      const chartW = targetW * (aspectRatio === '16:9' ? 0.52 : 0.88);
      const chartH = targetH * (aspectRatio === '16:9' ? 0.38 : 0.24);
      const chartX = stageCenterX - chartW / 2;
      const chartY = stageCenterY - chartH / 2;

      // Chart Glass Container
      ctx.fillStyle = 'rgba(16, 20, 30, 0.82)';
      ctx.beginPath();
      ctx.roundRect(chartX, chartY, chartW, chartH, 20);
      ctx.fill();
      ctx.strokeStyle = `${accent}40`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top title bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '800 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('ARR VELOCITY & PIPELINE GROWTH', chartX + 20, chartY + 24);

      ctx.fillStyle = '#10B981';
      ctx.font = '800 12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('+340% YoY', chartX + chartW - 20, chartY + 24);

      // Sparkline Points
      const points = [
        { x: 0.05, y: 0.80, val: '₹50K' },
        { x: 0.25, y: 0.68, val: '₹85K' },
        { x: 0.50, y: 0.50, val: '₹120K' },
        { x: 0.75, y: 0.32, val: '₹165K' },
        { x: 0.95, y: 0.15, val: '₹200K' }
      ];

      const plotX = chartX + 30;
      const plotY = chartY + 50;
      const plotW = chartW - 60;
      const plotH = chartH - 80;

      // Background Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const gy = plotY + (plotH / 4) * g;
        ctx.beginPath();
        ctx.moveTo(plotX, gy);
        ctx.lineTo(plotX + plotW, gy);
        ctx.stroke();
      }

      // Draw Gradient Fill under line
      ctx.beginPath();
      ctx.moveTo(plotX + points[0].x * plotW, plotY + plotH);
      points.forEach(pt => {
        ctx.lineTo(plotX + pt.x * plotW, plotY + pt.y * plotH);
      });
      ctx.lineTo(plotX + points[points.length - 1].x * plotW, plotY + plotH);
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, plotY, 0, plotY + plotH);
      fillGrad.addColorStop(0, `${accent}40`);
      fillGrad.addColorStop(1, `${accent}00`);
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Draw Neon Spline Curve
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      points.forEach((pt, idx) => {
        const px = plotX + pt.x * plotW;
        const py = plotY + pt.y * plotH;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Draw Points & Callout Pins
      points.forEach((pt, idx) => {
        const px = plotX + pt.x * plotW;
        const py = plotY + pt.y * plotH;
        const isLatest = idx === points.length - 1;

        ctx.fillStyle = isLatest ? '#FFFFFF' : accent;
        ctx.beginPath();
        ctx.arc(px, py, isLatest ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        if (isLatest) {
          ctx.strokeStyle = accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 12 + Math.sin(currentTime * 5) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Pill text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pt.val, px, py - 12);
      });
      ctx.restore();

    } else {
      // Default: 3D Holographic Keynote Medallion
      ctx.save();
      ctx.save();
      ctx.translate(stageCenterX, stageCenterY);
      ctx.rotate(currentTime * 0.3);
      for (let i = 0; i < 24; i++) {
        const ang = (i * Math.PI * 2) / 24;
        ctx.strokeStyle = i % 2 === 0 ? `${accent}25` : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * (stageRadius * 1.3), Math.sin(ang) * (stageRadius * 1.3));
        ctx.stroke();
      }
      ctx.restore();

      const medGrad = ctx.createRadialGradient(stageCenterX, stageCenterY, 10, stageCenterX, stageCenterY, stageRadius * 0.7);
      medGrad.addColorStop(0, '#252936');
      medGrad.addColorStop(0.7, '#14161F');
      medGrad.addColorStop(1, '#0C0E14');
      ctx.fillStyle = medGrad;
      ctx.beginPath();
      ctx.arc(stageCenterX, stageCenterY, stageRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('100%', stageCenterX, stageCenterY - 8);

      ctx.fillStyle = accent;
      ctx.font = '800 13px monospace';
      ctx.fillText('PASS VERIFIED', stageCenterX, stageCenterY + 18);
      ctx.restore();
    }

    // =======================================================================
    // 9. LOWER NARRATIVE SUBTITLE POD & DYNAMIC METRIC
    // =======================================================================
    const lowerCardY = targetH * (aspectRatio === '9:16' ? 0.67 : 0.72);
    const lowerCardW = targetW * (aspectRatio === '16:9' ? 0.48 : 0.86);
    const lowerCardX = targetW * 0.07;
    const lowerCardH = targetH * (aspectRatio === '9:16' ? 0.16 : 0.18);

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    ctx.fillStyle = 'rgba(16, 20, 30, 0.78)';
    ctx.beginPath();
    ctx.roundRect(lowerCardX, lowerCardY, lowerCardW, lowerCardH, 22);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(229, 231, 238, 0.9)';
    ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';

    const subWords = (scene?.subText || '').split(' ');
    let sLine = '';
    let sCurY = lowerCardY + 40;
    const sLineH = 32;
    const maxSubW = lowerCardW - 48;

    for (let n = 0; n < subWords.length; n++) {
      const testLine = sLine + subWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxSubW && n > 0) {
        ctx.fillText(sLine, lowerCardX + 24, sCurY);
        sLine = subWords[n] + ' ';
        sCurY += sLineH;
      } else {
        sLine = testLine;
      }
    }
    ctx.fillText(sLine, lowerCardX + 24, sCurY);

    if (scene?.metric) {
      const metricBarY = lowerCardY + lowerCardH - 42;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(lowerCardX + 32, metricBarY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '700 13px monospace';
      ctx.fillText('LIVE TELEMETRY', lowerCardX + 48, metricBarY + 5);

      let displayMetric = scene.metric;
      if (typeof scene.startNum === 'number' && typeof scene.endNum === 'number') {
        const val = scene.startNum + (scene.endNum - scene.startNum) * Math.min(1, progress * 1.2);
        const formatted = Number.isInteger(scene.endNum) ? Math.round(val) : val.toFixed(1);
        displayMetric = `${formatted}${scene.numSuffix || ''}`;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 18px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(displayMetric, lowerCardX + lowerCardW - 24, metricBarY + 6);
    }
    ctx.restore();

    // 10. BOTTOM VISUALIZER & STORY SEGMENTS
    const footerY = targetH * (aspectRatio === '16:9' ? 0.94 : 0.89);
    const barCount = 36;
    const barWidth = 8;
    const barSpacing = 10;
    const visualizerStartX = (targetW - (barCount * (barWidth + barSpacing))) / 2;

    for (let b = 0; b < barCount; b++) {
      const waveFreq = isPlaying ? 10 : 2;
      const barHeight = 12 + Math.sin(currentTime * waveFreq + b * 0.35) * 20 * (isPlaying ? 1 : 0.25);
      ctx.fillStyle = b % 4 === 0 ? accent : 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.roundRect(visualizerStartX + b * (barWidth + barSpacing), footerY - barHeight / 2, barWidth, barHeight, 4);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('@infratechai • Code-Driven Enterprise Cinema', targetW / 2, footerY + 44);

    // Instagram Progress segments
    const progY = 24;
    const progH = 6;
    const progTotalW = targetW - 64;
    const segSpacing = 10;
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

  // RequestAnimationFrame
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

  // Keyboard shortcut Space / R
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

  // Add scene
  const handleAddScene = () => {
    const newScene = {
      id: `sc_${Date.now()}`,
      title: `SCENE 0${scenes.length + 1}`,
      duration: 3.5,
      visualType: 'swarm',
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

  // Move scene
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

  // Pacing
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

  // Export video with audio
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
        const filename = `${activeTemplate.slug || activeTemplate.id}-${aspectRatio.replace(':', 'x')}-${Date.now()}.webm`;
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

  // Poster download
  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.slug || activeTemplate.id}-poster-frame-${Math.round(currentTime)}s.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Caption
  const handleCopyCaption = () => {
    const caption = `🚀 ${scenes[0]?.mainText}

${scenes[1]?.subText}

With @infratechai, 64 autonomous AI agents execute your test suites, analyze regressions, and book outbound enterprise meetings 24/7.

👉 Try the Master App today: infratech.ai (Link in Bio)

#AI #TechStartup #Automation #QualityAssurance #SaaS #DevOps #Engineering #InfratechAI #LemoOpuscar`;

    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Storyboard Generation
  const handleGenerateStoryboardOutline = (promptTopic) => {
    const topic = (promptTopic || storyboardPrompt).trim();
    if (!topic) return;
    setIsSynthesizingOutline(true);

    setTimeout(() => {
      // Find matching template based on topic
      const t = topic.toLowerCase();
      let matched = PRESET_TEMPLATES[0];
      if (t.includes('teardown') || t.includes('hardware') || t.includes('circuit')) matched = PRESET_TEMPLATES[1];
      else if (t.includes('hologram') || t.includes('hud') || t.includes('cyber')) matched = PRESET_TEMPLATES[2];
      else if (t.includes('satellite') || t.includes('radar') || t.includes('sales')) matched = PRESET_TEMPLATES[3];
      else if (t.includes('isometric') || t.includes('infra') || t.includes('architecture')) matched = PRESET_TEMPLATES[4];
      else if (t.includes('oil') || t.includes('impasto') || t.includes('art')) matched = PRESET_TEMPLATES[9];
      else if (t.includes('wave') || t.includes('japan') || t.includes('ukiyoe')) matched = PRESET_TEMPLATES[10];

      setActiveTemplate(matched);
      setAspectRatio(matched.ratio);
      setScenes(JSON.parse(JSON.stringify(matched.scenes)));
      setIsSynthesizingOutline(false);
      playSoundEffect('whoosh');
      playSoundEffect('bass');
    }, 600);
  };

  // Direct AI Animator Directive Handler
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

      // Match template
      const foundTmpl = PRESET_TEMPLATES.find(p => lower.includes(p.slug) || lower.includes(p.name.toLowerCase()));
      if (foundTmpl) {
        handleSelectTemplate(foundTmpl);
        replyText = `Activated the "${foundTmpl.name}" visual style! Loaded its official poster backdrop and motion physics.`;
      } else if (lower.includes('export') || lower.includes('download')) {
        replyText = "Starting video render! Exporting 1080p 60 FPS WebM with embedded sound.";
        handleExportVideo();
      } else if (lower.includes('voice') || lower.includes('speech')) {
        const nextState = !voiceoverEnabled;
        setVoiceoverEnabled(nextState);
        replyText = nextState ? "AI Voiceover enabled!" : "AI Voiceover turned off.";
      } else if (lower.includes('faster') || lower.includes('10s')) {
        handleApplyPacing('10s');
        replyText = "Tuned pacing to 10s Snappy Teaser!";
      } else if (lower.includes('add scene')) {
        handleAddScene();
        replyText = "Added a new scene to your video timeline!";
      } else {
        replyText = `Directing request received! Tuned timeline and typography for "${text.slice(0, 36)}...".`;
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
                  Lemo-Opuscar 16 Cinema Styles
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
            { step: 2, label: '2. Visual Styles', icon: Palette, badge: `${PRESET_TEMPLATES.length} Posters` },
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
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-pink-100 text-pink-700 font-bold">
                    {item.badge}
                  </span>
                )}
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
                  Type any concept. Siddharth Menon will structure 4 scenes and map the visual graphics automatically.
                </p>
              </div>
            </div>

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
                <span>{isSynthesizingOutline ? 'Structuring...' : 'Generate Storyboard'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-bold text-[#50545E] uppercase tracking-wider">Inspiration:</span>
              {[
                'Dark Tech Keynote Reveal',
                'Exploded Teardown Architecture',
                'Hologram Cyber HUD Swarm',
                'Satellite Outbound Briefing',
                'Impasto Oil Painting Art',
                'Ukiyo-e Great Wave Resilience'
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#50545E]">
                Narrative Outline ({scenes.length} Scenes • {totalDuration.toFixed(1)}s Total)
              </h3>
              <button
                onClick={handleAddScene}
                className="btn-shine-effect inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#141518] border border-black/10 shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus size={13} className="text-emerald-600" />
                <span>Add Scene</span>
              </button>
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
                      <button onClick={() => handleMoveScene(idx, -1)} disabled={idx === 0} className="p-1 rounded-lg text-[#50545E] hover:text-[#141518] disabled:opacity-20 cursor-pointer">
                        <MoveUp size={12} />
                      </button>
                      <button onClick={() => handleMoveScene(idx, 1)} disabled={idx === scenes.length - 1} className="p-1 rounded-lg text-[#50545E] hover:text-[#141518] disabled:opacity-20 cursor-pointer">
                        <MoveDown size={12} />
                      </button>
                      <button onClick={() => handleDeleteScene(idx)} className="p-1 rounded-lg text-red-500 hover:text-red-700 cursor-pointer ml-1">
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
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setGammaStep(2);
                playSoundEffect('whoosh');
              }}
              className="btn-shine-effect px-8 py-3.5 rounded-2xl bg-[#141518] hover:bg-[#2B2D33] text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer active:scale-[0.97] apple-motion-quick"
            >
              <span>Continue to Visual Styles Gallery</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </main>
      )}

      {/* ======================================================== */}
      {/* 3. STEP 2: LEMO-OPUSCAR VISUAL STYLES POSTERS GALLERY    */}
      {/* ======================================================== */}
      {gammaStep === 2 && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold uppercase tracking-wider">
                  Official Lemo-Opuscar Catalog
                </span>
                <span className="text-xs text-[#50545E] font-semibold">
                  16 Real Film Posters Loaded
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#141518] tracking-tight">
                Step 2: Choose your Visual Film Style & Poster
              </h2>
              <p className="text-xs text-[#50545E]">
                Select any cinema aesthetic. Its high-res poster and procedural motion actor will be applied to your video.
              </p>
            </div>

            <button
              onClick={() => setGammaStep(1)}
              className="px-4 py-2 rounded-2xl bg-white/80 hover:bg-white text-xs font-semibold text-[#141518] border border-black/10 active:scale-95 cursor-pointer self-start md:self-auto"
            >
              ◂ Back to Storyboard
            </button>
          </div>

          {/* Category Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-apple-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              {[
                { id: 'ALL', label: 'All Styles (16)' },
                { id: 'Tech & Keynote', label: 'Tech & Keynote' },
                { id: 'Engineering & 3D', label: 'Engineering & 3D' },
                { id: 'Data & Intelligence', label: 'Data & Intel' },
                { id: 'Cyber & Telemetry', label: 'Cyber & HUD' },
                { id: 'Artistic & Painterly', label: 'Artistic & Oils' },
                { id: 'Print & Graphic', label: 'Print & Poster' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setStyleCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer apple-motion-quick active:scale-95 ${
                    styleCategoryFilter === cat.id
                      ? 'bg-[#141518] text-white shadow-2xs'
                      : 'text-[#50545E] hover:text-[#141518] hover:bg-white/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#50545E]" />
              <input
                type="text"
                value={styleSearchQuery}
                onChange={(e) => setStyleSearchQuery(e.target.value)}
                placeholder="Search styles (e.g. keynote, radar)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#9AA0AC]/30 text-xs text-[#141518] focus:outline-none focus:ring-1 focus:ring-[#141518]"
              />
            </div>
          </div>

          {/* Visual Theme Posters Grid (16 Styles with Real Images) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((tmpl) => {
              const isSel = activeTemplate.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`rounded-[28px] border transition-all cursor-pointer relative overflow-hidden group active:scale-[0.98] flex flex-col ${
                    isSel
                      ? 'bg-white border-[#141518] shadow-2xl ring-2 ring-[#141518]/25'
                      : 'bg-white/80 hover:bg-white border-white/80 shadow-apple-sm hover:shadow-apple-card'
                  }`}
                >
                  {/* REAL GITHUB POSTER IMAGE THUMBNAIL */}
                  <div className="relative w-full aspect-[16/10] bg-[#141518] overflow-hidden">
                    <img
                      src={tmpl.posterUrl}
                      alt={tmpl.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Category pill on image */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-xs">
                      {tmpl.category}
                    </div>

                    {/* Aspect ratio badge */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-mono font-bold">
                      {tmpl.ratio}
                    </div>

                    {/* Selection Checkmark */}
                    {isSel && (
                      <div className="absolute inset-0 bg-[#141518]/40 backdrop-blur-xs flex items-center justify-center">
                        <div className="px-4 py-1.5 rounded-2xl bg-white text-[#141518] font-bold text-xs flex items-center gap-1.5 shadow-lg animate-fadeIn">
                          <Check size={14} className="text-emerald-600" />
                          <span>Active Style</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Style Details Pod */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-extrabold text-[#141518] tracking-tight">
                          {tmpl.name}
                        </h3>
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: tmpl.accentColor }} title={`Accent: ${tmpl.accentColor}`} />
                      </div>
                      <p className="text-[11px] text-[#50545E] line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    {/* Color Swatches & Action */}
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {tmpl.palette.map((col, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>

                      <span className={`font-bold ${isSel ? 'text-emerald-700' : 'text-[#141518] group-hover:text-pink-600'}`}>
                        {isSel ? '✓ Applied' : 'Select Style →'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Action */}
          <div className="flex justify-between items-center pt-6 border-t border-[#9AA0AC]/20">
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

          {/* LEFT: HARDWARE VIEWPORT STAGE */}
          <section className="xl:col-span-7 flex flex-col items-center">
            <div className="w-full flex flex-col items-center justify-center p-6 sm:p-8 rounded-[36px] bg-[#141518] shadow-2xl border border-white/10 relative overflow-hidden group">
              
              <div 
                className="absolute inset-0 pointer-events-none opacity-40 blur-3xl transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${activeTemplate.accentColor || '#10B981'}35 0%, transparent 70%)`
                }}
              />

              <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 text-xs text-[#9AA0AC] relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F25B5B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F6A943]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3ECF8E]" />
                  <span className="font-mono text-[11px] text-white/60 ml-2">
                    LEMO-OPUSCAR • {aspectRatio} • {activeTemplate.name} • Visual: {currentSceneInfo.scene?.visualType?.toUpperCase() || 'RADAR'}
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

              {/* Canvas Device Frame */}
              <div className="py-6 flex items-center justify-center w-full min-h-[540px] relative z-10">
                <div 
                  className={`relative rounded-[32px] p-2 bg-[#1C1E24] border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] transition-all ${
                    aspectRatio === '9:16' ? 'max-w-[360px] sm:max-w-[390px]' : aspectRatio === '1:1' ? 'max-w-[480px]' : 'max-w-[680px]'
                  }`}
                  style={{
                    aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '1:1' ? '1/1' : '16/9'
                  }}
                >
                  {aspectRatio === '9:16' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black/90 border border-white/10 z-20 flex items-center justify-between px-3 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-black border border-white/20" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                    </div>
                  )}

                  <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-[24px] object-contain block bg-[#080A0F]"
                  />
                </div>
              </div>

              {/* Hardware Transport Bar */}
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

                  <div className="font-mono text-sm tracking-wider">
                    <span className="text-white font-bold">{currentTime.toFixed(1)}s</span>
                    <span className="text-[#9AA0AC] mx-1">/</span>
                    <span className="text-[#9AA0AC]">{totalDuration.toFixed(1)}s</span>
                  </div>
                </div>

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
                          Scene 0{i + 1} • {sc.visualType?.toUpperCase() || 'RADAR'}
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
                  className="px-2.5 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-[11px] font-bold text-pink-700 cursor-pointer flex items-center gap-1"
                >
                  <Palette size={12} />
                  <span>Choose Poster Style (16)</span>
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

          {/* RIGHT: DIRECTOR DECK & ANIMATOR CONTROLS */}
          <section className="xl:col-span-5 flex flex-col gap-6">

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
                
                {/* Active Style Poster Pill Card */}
                <div className="glass-specular bg-white/80 backdrop-blur-2xl rounded-3xl p-4 border border-white/80 shadow-apple-card flex items-center gap-4">
                  <img
                    src={activeTemplate.posterUrl}
                    alt={activeTemplate.name}
                    className="w-16 h-12 object-cover rounded-xl shadow-xs border border-black/10"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full uppercase">
                      Active Lemo-Opuscar Style
                    </span>
                    <h4 className="text-sm font-bold text-[#141518] truncate mt-0.5">
                      {activeTemplate.name}
                    </h4>
                    <p className="text-[11px] text-[#50545E] truncate">
                      {activeTemplate.category} • {activeTemplate.ratio}
                    </p>
                  </div>
                  <button
                    onClick={() => setGammaStep(2)}
                    className="px-3 py-1.5 rounded-xl bg-[#141518] text-white text-[11px] font-bold cursor-pointer active:scale-95"
                  >
                    Change
                  </button>
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

                  {/* Quick Directive Pills for Styles */}
                  <div className="pt-3 border-t border-black/[0.06] mt-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
                      {[
                        '🍏 Dark Keynote',
                        '🤖 Exploded Teardown',
                        '🛰️ Satellite Briefing',
                        '🎨 Impasto Oil Painting',
                        '🌊 Ukiyo-e Woodblock',
                        '⚡ Hologram HUD',
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
                        placeholder="Instruct Siddharth (e.g. 'Switch to Ukiyo-e wave style')..."
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
                      <p className="text-xs text-[#50545E]">Change visual graphics, text, metrics, and duration.</p>
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
                      <div>
                        <label className="block text-[11px] font-bold text-[#50545E] uppercase tracking-wider mb-1.5">
                          Visual Graphic Actor
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'radar', label: '🛰️ Cyber Radar' },
                            { id: 'swarm', label: '🤖 Agent Swarm' },
                            { id: 'terminal', label: '💻 Code Terminal' },
                            { id: 'pipeline', label: '⚡ CI/CD Pipeline' },
                            { id: 'keynote', label: '🏆 Hologram Seal' },
                            { id: 'revenue', label: '💰 Harvey Funnel' }
                          ].map((vt) => (
                            <button
                              key={vt.id}
                              type="button"
                              onClick={() => updateSceneField(selectedSceneIndex, 'visualType', vt.id)}
                              className={`p-2 rounded-xl text-xs font-bold border cursor-pointer apple-motion-quick text-left ${
                                scenes[selectedSceneIndex].visualType === vt.id
                                  ? 'bg-[#141518] text-white border-[#141518] shadow-sm'
                                  : 'bg-white hover:bg-white/80 text-[#141518] border-black/10'
                              }`}
                            >
                              {vt.label}
                            </button>
                          ))}
                        </div>
                      </div>

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
                        <button onClick={() => handleDeleteScene(selectedSceneIndex)} className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer">
                          <Trash2 size={13} />
                          <span>Delete Scene</span>
                        </button>
                        <button onClick={handleAddScene} className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer">
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
                  <p className="text-xs text-[#50545E]">Export 1080p 60 FPS video with synchronized procedural audio and viral social copy.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#50545E] uppercase tracking-wider block">
                      Poster Artwork Intensity
                    </label>
                    <span className="text-[10px] font-mono text-pink-600 font-bold uppercase">{posterOpacityMode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'vivid', label: 'Vivid (60%)' },
                      { id: 'balanced', label: 'Balanced (40%)' },
                      { id: 'minimal', label: 'Minimal (18%)' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setPosterOpacityMode(mode.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold apple-motion-quick transition-all cursor-pointer ${
                          posterOpacityMode === mode.id
                            ? 'bg-[#141518] text-white shadow-xs'
                            : 'bg-black/[0.04] text-[#50545E] hover:bg-black/[0.08]'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-[#141518] text-white space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#9AA0AC]">
                    <span>Film Style:</span>
                    <span className="text-pink-400 font-bold">{activeTemplate.name}</span>
                  </div>
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
