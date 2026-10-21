/**
 * salesService.js
 * InfratechAI Sales Manager - Autonomous AI SDR Engine (Harvey Architecture)
 * 
 * Supports:
 * - Google Gemini (Free API Key)
 * - Anthropic Claude 3.7 / 3.5 Sonnet
 * - OpenAI Codex / GPT-4o
 * - Local Harvey Daemon (localhost:5555) connection
 */

import { generateId, getTimestamp } from '../utils/formatters';

const STORAGE_KEYS = {
  SETTINGS: 'infratechai_sales_settings',
  LEADS: 'infratechai_sales_leads',
  OUTBOX: 'infratechai_sales_outbox',
  CONVERSATIONS: 'infratechai_sales_conversations',
  CAMPAIGNS: 'infratechai_sales_campaigns',
  STATS: 'infratechai_sales_stats',
};

// Default Sales Engine Settings
const DEFAULT_SETTINGS = {
  provider: 'gemini', // 'gemini' | 'claude' | 'codex'
  geminiApiKey: '',
  claudeCliInstalled: true,
  codexEnabled: false,
  modelName: 'gemini-2.0-flash',
  heartbeatIntervalMinutes: 15,
  engineActive: true,
  requireApproval: true, // Harvey approval gate
  maxDailySends: 45,
  quietHours: { enabled: true, start: '19:00', end: '08:30' },
  persona: {
    name: 'Aman Talukdar',
    company: 'InfratechAI',
    role: 'Founder & QA Solutions Architect',
    email: 'aman@infratechai.com',
    tone: 'Direct, technical, peer-to-peer, no fluff'
  },
  companyNiche: 'High-velocity QA test management, hotkey test execution (Pass/Fail/Block), defect lifecycle tracking, and automated regression suites',
  pricingMark: '$499/project or $1,200/mo flat QA coverage',
  portfolioUrl: 'https://infratechai.com/portfolio',
  valueProposition: 'We cut release defects by 80% and 3x test execution speed without hiring $90k/yr QA engineers',
  icp: {
    industries: ['SaaS', 'FinTech', 'HealthTech', 'Digital Agencies'],
    geographies: ['United States', 'United Kingdom', 'India', 'Canada'],
    targetTitles: ['VP of Engineering', 'QA Lead', 'Head of Product', 'Founder / CTO'],
    buyingSignals: ['Hiring QA Engineer', 'No Automated Testing', 'Recent Release Bugs', 'Running Paid Ads']
  },
  harveyDaemonUrl: 'http://127.0.0.1:5555',
  isDaemonConnected: false
};

// Initial Seed Leads tailored for InfratechAI (Companies that need QA / Testing)
const SEED_LEADS = [
  {
    id: 'lead-1',
    companyName: 'ApexFlow Technologies',
    domain: 'apexflow.io',
    industry: 'FinTech SaaS',
    location: 'Austin, TX',
    contactName: 'Marcus Vance',
    contactTitle: 'VP of Engineering',
    contactEmail: 'marcus.v@apexflow.io',
    emailStatus: 'verified', // 'verified' | 'risky' | 'general'
    detectedSignals: [
      { code: 'HIRING_QA_ROLE', title: 'Hiring 2 Senior QA Testers', confidence: 0.95 },
      { code: 'RUNNING_META_ADS', title: 'Running active ads for mobile banking app', confidence: 0.90 }
    ],
    techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
    status: 'draft_ready', // 'discovered' | 'profiled' | 'draft_ready' | 'contacted' | 'replied' | 'meeting_booked'
    scoutedAt: '2026-10-21 11:20 AM'
  },
  {
    id: 'lead-2',
    companyName: 'PulseCare Health',
    domain: 'pulsecare.med',
    industry: 'HealthTech',
    location: 'Boston, MA',
    contactName: 'Dr. Sarah Lin',
    contactTitle: 'Chief Medical & Product Officer',
    contactEmail: 'sarah.lin@pulsecare.med',
    emailStatus: 'verified',
    detectedSignals: [
      { code: 'NO_AUTOMATED_QA', title: 'Manual testing bottleneck mentioned in recent tech blog', confidence: 0.88 },
      { code: 'HIPAA_COMPLIANCE_NEED', title: 'Strict compliance audit coming up Q4', confidence: 0.92 }
    ],
    techStack: ['Next.js', 'Python', 'FastAPI', 'Docker'],
    status: 'contacted',
    scoutedAt: '2026-10-20 04:45 PM'
  },
  {
    id: 'lead-3',
    companyName: 'OmniCart Logistics',
    domain: 'omnicart.co',
    industry: 'E-commerce Infrastructure',
    location: 'Seattle, WA',
    contactName: 'Devon Patel',
    contactTitle: 'Head of Quality Assurance',
    contactEmail: 'devon@omnicart.co',
    emailStatus: 'verified',
    detectedSignals: [
      { code: 'RECENT_STORE_OUTAGE', title: 'Checkout checkout regression mentioned on Twitter/X', confidence: 0.94 },
      { code: 'HIGH_SPRINT_VELOCITY', title: 'Shipping 3 releases per week', confidence: 0.85 }
    ],
    techStack: ['React 19', 'GraphQL', 'Kubernetes'],
    status: 'replied',
    scoutedAt: '2026-10-19 02:15 PM'
  },
  {
    id: 'lead-4',
    companyName: 'KiteWave Creative',
    domain: 'kitewave.agency',
    industry: 'Digital Product Studio',
    location: 'San Francisco, CA',
    contactName: 'Elena Rostova',
    contactTitle: 'Managing Partner',
    contactEmail: 'hello@kitewave.agency',
    emailStatus: 'general',
    detectedSignals: [
      { code: 'OUTSOURCING_QA', title: 'Building 12 client client web apps with no internal QA team', confidence: 0.89 },
      { code: 'RUNNING_GOOGLE_ADS', title: 'Spending $4k/mo on Web Development keywords', confidence: 0.92 }
    ],
    techStack: ['Shopify Plus', 'React', 'Tailwind CSS'],
    status: 'draft_ready',
    scoutedAt: '2026-10-21 09:30 AM'
  }
];

// Seed Outbox (Harvey generated cold emails waiting for human approval)
const SEED_OUTBOX = [
  {
    id: 'outbox-1',
    leadId: 'lead-1',
    companyName: 'ApexFlow Technologies',
    recipientName: 'Marcus Vance',
    recipientEmail: 'marcus.v@apexflow.io',
    recipientTitle: 'VP of Engineering',
    stepNumber: 1,
    framework: 'PAS', // Problem - Agitation - Solution
    wordCount: 62,
    subject: 'Marcus — quick question on ApexFlow test execution time',
    body: `Hi Marcus,\n\nSaw ApexFlow is scaling up the engineering team with two new QA roles this month.\n\nUsually at this inflection stage, testing sprint regressions becomes a huge bottleneck before releases. We built InfratechAI QA Manager to cut test execution cycles in half with hotkey-driven execution, instant bug logging, and team sync.\n\nOpen to a 5-minute look this Thursday?`,
    status: 'pending_approval', // 'pending_approval' | 'approved' | 'rejected' | 'sent'
    signalHook: 'Hiring 2 Senior QA Testers',
    createdAt: '15 mins ago'
  },
  {
    id: 'outbox-2',
    leadId: 'lead-4',
    companyName: 'KiteWave Creative',
    recipientName: 'Elena Rostova',
    recipientEmail: 'hello@kitewave.agency',
    recipientTitle: 'Managing Partner',
    stepNumber: 1,
    framework: 'AIDA',
    wordCount: 58,
    subject: 'Client web app testing QA workflow for KiteWave',
    body: `Hi Elena,\n\nNoticed KiteWave is delivering high-end custom web apps for clients, but handling multi-client QA test runs without dedicated QA suites usually leads to client-reported bugs after launch.\n\nInfratechAI lets client studios run isolated test suites and instant client defect trackers with zero setup.\n\nWorth sharing a 3-minute video overview?`,
    status: 'pending_approval',
    signalHook: 'Multi-client agency with no dedicated QA lead',
    createdAt: '32 mins ago'
  }
];

// Seed Conversations & Inbound Replies handled by Harvey
const SEED_CONVERSATIONS = [
  {
    id: 'conv-1',
    leadId: 'lead-3',
    companyName: 'OmniCart Logistics',
    contactName: 'Devon Patel',
    contactEmail: 'devon@omnicart.co',
    stage: 'negotiating', // 'engaged' | 'qualifying' | 'presenting' | 'negotiating' | 'closed_won'
    lastReplyTime: '2 hours ago',
    messages: [
      {
        sender: 'harvey',
        sentAt: 'Yesterday 10:14 AM',
        content: `Hi Devon,\n\nSaw OmniCart pushed multiple releases last week. With that release frequency, catching checkout edge-cases before staging is critical.\n\nInfratechAI gives your team hotkey test execution (Pass/Fail/Block in 1 tap) and real-time defect sync so engineering catches regressions immediately.\n\nOpen to seeing how it works?`
      },
      {
        sender: 'prospect',
        sentAt: 'Yesterday 04:30 PM',
        content: `Hey Aman, thanks for reaching out. We currently use Jira + spreadsheet checklists. It is definitely getting slow, but how does InfratechAI differ from Jira Test Management tools like Zephyr?`
      },
      {
        sender: 'harvey_draft',
        sentAt: 'Waiting for your review',
        framework: 'LAARC (Listen-Acknowledge-Assess-Respond-Confirm)',
        content: `Hi Devon — fair point. Zephyr and Jira are great for long-term issue tracking, but testers hate executing 200+ test cases inside Jira because every click takes 5 seconds to load.\n\nInfratechAI is built like Linear for QA: zero lag, keyboard hotkeys (P/F/B), and instant bug logging. Testers execute tests 3x faster without leaving the flow.\n\nAre you free for 10 mins tomorrow around 2 PM PT to see a live execution demo?`
      }
    ]
  }
];

export const salesService = {
  // Get all settings
  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = stored ? JSON.parse(stored) : {};
      const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      return { 
        ...DEFAULT_SETTINGS, 
        geminiApiKey: parsed.geminiApiKey || envKey || DEFAULT_SETTINGS.geminiApiKey,
        ...parsed 
      };
    } catch {
      return { ...DEFAULT_SETTINGS, geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '' };
    }
  },

  saveSettings(newSettings) {
    const updated = { ...this.getSettings(), ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Leads
  getLeads() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
      return stored ? JSON.parse(stored) : SEED_LEADS;
    } catch {
      return SEED_LEADS;
    }
  },

  saveLeads(leads) {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  },

  addLead(newLead) {
    const leads = this.getLeads();
    const lead = {
      id: 'lead-' + generateId(),
      status: 'discovered',
      scoutedAt: getTimestamp(),
      ...newLead
    };
    const updated = [lead, ...leads];
    this.saveLeads(updated);
    return lead;
  },

  // Outbox (Decision Desk)
  getOutbox() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OUTBOX);
      return stored ? JSON.parse(stored) : SEED_OUTBOX;
    } catch {
      return SEED_OUTBOX;
    }
  },

  saveOutbox(outbox) {
    localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(outbox));
  },

  approveEmail(outboxId) {
    const outbox = this.getOutbox();
    const updated = outbox.map(item => 
      item.id === outboxId ? { ...item, status: 'approved', approvedAt: getTimestamp() } : item
    );
    this.saveOutbox(updated);
    return updated;
  },

  rejectEmail(outboxId, reason = 'Not relevant') {
    const outbox = this.getOutbox();
    const updated = outbox.map(item => 
      item.id === outboxId ? { ...item, status: 'rejected', rejectionReason: reason } : item
    );
    this.saveOutbox(updated);
    return updated;
  },

  updateEmailDraft(outboxId, newBody, newSubject) {
    const outbox = this.getOutbox();
    const updated = outbox.map(item => 
      item.id === outboxId ? { ...item, body: newBody, subject: newSubject, wordCount: newBody.trim().split(/\s+/).length } : item
    );
    this.saveOutbox(updated);
    return updated;
  },

  // Conversations
  getConversations() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return stored ? JSON.parse(stored) : SEED_CONVERSATIONS;
    } catch {
      return SEED_CONVERSATIONS;
    }
  },

  saveConversations(convs) {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
  },

  // Generate personalized email using Gemini API or built-in Harvey templates
  async generateColdEmailWithAI({ lead, framework = 'PAS', customNotes = '' }) {
    const settings = this.getSettings();
    const persona = settings.persona || DEFAULT_SETTINGS.persona;
    const niche = settings.companyNiche || DEFAULT_SETTINGS.companyNiche;
    const valueProposition = settings.valueProposition || DEFAULT_SETTINGS.valueProposition;
    const portfolioUrl = settings.portfolioUrl || DEFAULT_SETTINGS.portfolioUrl;
    const pricingMark = settings.pricingMark || DEFAULT_SETTINGS.pricingMark;

    const prompt = `
You are Harvey, an autonomous elite B2B sales copywriter writing a personal 1-to-1 cold email on behalf of:
Sender: ${persona.name}, ${persona.role} at ${persona.company} (${persona.email})
Our Niche & Solution: ${niche}
Core Value Proposition: ${valueProposition}
Our Pricing Anchor: ${pricingMark}
Our Portfolio / Case Studies Link: ${portfolioUrl}
Tone: ${persona.tone}

TARGET PROSPECT:
Company: ${lead.companyName} (${lead.domain})
Industry: ${lead.industry}
Contact: ${lead.contactName}, ${lead.contactTitle}
Detected Buying Signals: ${lead.detectedSignals?.map(s => s.title).join('; ') || 'Release Velocity'}
Tech Stack: ${lead.techStack?.join(', ') || 'Modern Web'}
Selected Framework: ${framework}
Notes: ${customNotes}

CRITICAL ANTI-AI GUIDELINES (DO NOT SOUND LIKE CHATGPT):
1. LENGTH: STRICTLY 50 TO 70 WORDS. Never write walls of text.
2. ABSOLUTELY ZERO AI CLICHES: Never use "I hope this email finds you well", "I wanted to reach out", "In today's fast-paced world", "delve", "game-changer", "revolutionary", "streamline", "leverage", "testament", "spearheading", "at your convenience".
3. Write like an actual engineering founder sending a crisp note from an iPhone or terminal.
4. Line 1: Concrete observation about ${lead.companyName}'s product or recent work.
5. Line 2: The exact problem solved (${valueProposition}).
6. Line 3: Naturally reference our portfolio (${portfolioUrl}) as social proof.
7. Line 4: Low-friction 1-sentence CTA (e.g., "Worth a brief 5-min look this Thursday?", "Open to a quick peek?").
8. Return ONLY valid JSON: { "subject": "...", "body": "...", "signalHook": "..." }
`;

    // If user provided an API Key, call Gemini directly
    if (settings.geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${settings.modelName || 'gemini-2.0-flash'}:generateContent?key=${settings.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return {
              subject: parsed.subject,
              body: parsed.body,
              signalHook: parsed.signalHook || lead.detectedSignals?.[0]?.title || 'Tech stack observation',
              wordCount: parsed.body.trim().split(/\s+/).length,
              modelUsed: `InfratechAI Neural Engine`
            };
          }
        }
      } catch (err) {
        console.warn('AI call failed, falling back to heuristic template:', err);
      }
    }

    // Heuristic Human-Style Fallback Template
    const primarySignal = lead.detectedSignals?.[0]?.title || 'release speed and QA';
    const fallbackBody = `Hi ${lead.contactName.split(' ')[0]},\n\nSaw ${lead.companyName}'s product rollout in ${lead.industry} — noticed you're scaling ${primarySignal.toLowerCase()}.\n\nWhen teams ship fast, manual QA cycles delay release day. ${valueProposition}.\n\nYou can see our recent client QA work here: ${portfolioUrl}\n\nOpen to a quick 5-min look this Thursday?`;
    
    return {
      subject: `${lead.contactName.split(' ')[0]} — quick question on ${lead.companyName} releases`,
      body: fallbackBody,
      signalHook: primarySignal,
      wordCount: fallbackBody.trim().split(/\s+/).length,
      modelUsed: 'InfratechAI Neural Engine'
    };
  }
};
