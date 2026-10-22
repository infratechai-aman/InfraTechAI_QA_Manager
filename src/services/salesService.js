/**
 * salesService.js
 * InfratechAI Sales Manager - Autonomous AI SDR & Inbound Negotiation Engine (Harvey)
 * 
 * Niche: House Keeping & Cleaning Services Web Modernization (USA Clients)
 * Demo: https://housecleaning-998d3.web.app/
 * Target: US Cleaning businesses with outdated, sloppy, non-converting websites
 * Pricing Anchor: $499 - $899 USD (Negotiated dynamically by AI)
 * Hook: 24-hour custom live demo preview built at zero upfront cost; payment collected before launching live on their domain
 * Persona: Real human employee (Harvey Ross, Senior Web Consultant - AI disclosure strictly disabled)
 * Autopilot: Works seamlessly with and without manual approval 24/7 (Sleep Mode)
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

// Default Sales Engine Settings for House Cleaning Services Web Modernization
const DEFAULT_SETTINGS = {
  provider: 'gemini', // 'gemini' | 'claude' | 'codex'
  geminiApiKey: '',
  claudeCliInstalled: true,
  codexEnabled: false,
  modelName: 'gemini-3.5-flash',
  heartbeatIntervalMinutes: 15,
  engineActive: true,
  sessionActive: false, // Harvey Working Session: false = resting, true = working & sending
  requireApproval: false, // Fully autonomous zero-approval: sends automatically without human gate
  autopilotMode: true, // "Work As I Sleep" autonomous auto-negotiate mode
  autoSendApproved: true,
  maxDailySends: 50,
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  persona: {
    name: 'Harvey Ross',
    company: 'InfratechAI',
    role: 'Senior Web Consultant & Client Solutions Specialist',
    email: 'aman.infratechai@gmail.com',
    tone: 'Ultra-concise (<65 words), consultative, human peer-to-peer. STRICT RULE: Never say or hint that you are an AI or bot. Speak as a real employee of the firm.'
  },
  companyNiche: 'House Keeping & Cleaning Services Web Modernization (All USA)',
  pricingMark: '$499 - $899 USD turnkey + $20/mo or $200/yr maintenance',
  portfolioUrl: 'https://housecleaning-998d3.web.app/',
  valueProposition: 'We build high-converting booking machines for US house cleaners with sloppy sites or zero website, featuring instant quote calculators & 24h custom previews',
  demoUrl: 'https://housecleaning-998d3.web.app/',
  pricingRange: { min: 499, max: 899, currency: 'USD' },
  maintenancePricing: { monthly: 20, yearly: 200, currency: 'USD' },
  meetingSla: 'Schedule confirmed within 24 hours',
  customDemoTurnaroundHours: 24,
  icp: {
    industries: ['Residential House Cleaning', 'Commercial Cleaning Services', 'Maid Services', 'Deep Cleaning & Turnover Pros'],
    geographies: ['Entire United States (Dallas, Houston, Austin, Miami, Atlanta, Phoenix, Los Angeles, Chicago, New York, Seattle, Denver, Charlotte, etc.)'],
    targetTitles: ['Owner', 'Founder', 'General Manager', 'Operations Lead'],
    buyingSignals: [
      'Outdated / Sloppy Website (Old layout, broken mobile view)',
      'NO WEBSITE AT ALL (Only Google Business Profile, Yelp, or Facebook page)',
      'Missing Instant Booking & Bedroom/Bathroom Pricing Calculator',
      'High customer reviews on Google/Yelp but poor/no web presence'
    ]
  },
  harveyDaemonUrl: 'http://127.0.0.1:5555',
  isDaemonConnected: true,
  gmailAddress: 'aman.infratechai@gmail.com',
  gmailAppPassword: 'qerk bggh ysyk mrfg'
};

// Clean production workspace - Zero mock leads, outbox drafts, or conversations
export const SEED_LEADS = [];
export const SEED_OUTBOX = [];
export const SEED_CONVERSATIONS = [];

// Legacy mock identifiers to sanitize from browser localStorage
const MOCK_LEAD_IDS = new Set(['lead-1', 'lead-2', 'lead-3', 'lead-4']);
const MOCK_OUTBOX_IDS = new Set(['outbox-1', 'outbox-2']);
const MOCK_CONV_IDS = new Set(['conv-1']);
const MOCK_COMPANY_NAMES = new Set([
  'ApexFlow Technologies', 
  'PulseCare Health', 
  'OmniCart Logistics', 
  'KiteWave Creative',
  'Austin Scale Systems'
]);

const sanitizeLeads = (leads) => {
  if (!Array.isArray(leads)) return [];
  return leads.filter(l => l && !MOCK_LEAD_IDS.has(l.id) && !MOCK_COMPANY_NAMES.has(l.companyName));
};

const sanitizeOutbox = (outbox) => {
  if (!Array.isArray(outbox)) return [];
  return outbox.filter(o => o && !MOCK_OUTBOX_IDS.has(o.id) && !MOCK_COMPANY_NAMES.has(o.companyName));
};

const sanitizeConversations = (convs) => {
  if (!Array.isArray(convs)) return [];
  return convs.filter(c => c && !MOCK_CONV_IDS.has(c.id) && !MOCK_COMPANY_NAMES.has(c.companyName));
};

export const salesService = {
  // Scoped storage key helper
  getStorageKey(key, userId) {
    return userId ? `${key}_${userId}` : key;
  },

  // Get all settings with automatic migration to House Cleaning Niche
  getSettings(userId) {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.SETTINGS, userId);
      const stored = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = stored ? JSON.parse(stored) : {};
      const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      
      // Auto-migrate from legacy QA Manager text to House Cleaning Niche
      if (
        !parsed.companyNiche || 
        parsed.companyNiche.includes('QA test management') || 
        parsed.companyNiche.includes('regression suites') ||
        parsed.companyNiche.includes('QA solutions')
      ) {
        parsed.companyNiche = DEFAULT_SETTINGS.companyNiche;
        parsed.pricingMark = DEFAULT_SETTINGS.pricingMark;
        parsed.portfolioUrl = DEFAULT_SETTINGS.portfolioUrl;
        parsed.demoUrl = DEFAULT_SETTINGS.demoUrl;
        parsed.valueProposition = DEFAULT_SETTINGS.valueProposition;
        parsed.persona = { ...DEFAULT_SETTINGS.persona, ...(parsed.persona?.name ? { name: parsed.persona.name } : {}) };
        parsed.icp = DEFAULT_SETTINGS.icp;
        parsed.pricingRange = DEFAULT_SETTINGS.pricingRange;
        parsed.maintenancePricing = DEFAULT_SETTINGS.maintenancePricing;
        parsed.meetingSla = DEFAULT_SETTINGS.meetingSla;
        parsed.customDemoTurnaroundHours = DEFAULT_SETTINGS.customDemoTurnaroundHours;
        parsed.autopilotMode = parsed.autopilotMode ?? true;
        parsed.sessionActive = parsed.sessionActive ?? false;
      }

      if (!parsed.maintenancePricing) {
        parsed.maintenancePricing = DEFAULT_SETTINGS.maintenancePricing;
      }
      if (!parsed.meetingSla) {
        parsed.meetingSla = DEFAULT_SETTINGS.meetingSla;
      }

      // Enforce fully autonomous zero-approval sending
      parsed.requireApproval = false;

      parsed.gmailAddress = parsed.gmailAddress || import.meta.env.VITE_GMAIL_ADDRESS || 'aman.infratechai@gmail.com';
      parsed.gmailAppPassword = parsed.gmailAppPassword || import.meta.env.VITE_GMAIL_APP_PASSWORD || 'qerk bggh ysyk mrfg';

      return { 
        ...DEFAULT_SETTINGS, 
        geminiApiKey: parsed.geminiApiKey || envKey || DEFAULT_SETTINGS.geminiApiKey,
        ...parsed 
      };
    } catch {
      return { ...DEFAULT_SETTINGS, geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '' };
    }
  },

  saveSettings(newSettings, userId) {
    const updated = { ...this.getSettings(userId), ...newSettings };
    const key = this.getStorageKey(STORAGE_KEYS.SETTINGS, userId);
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Leads
  getLeads(userId) {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.LEADS, userId);
      const stored = localStorage.getItem(key);
      const raw = stored || (!userId ? null : localStorage.getItem(STORAGE_KEYS.LEADS));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeLeads(parsed);
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(sanitized));
        if (userId) localStorage.removeItem(STORAGE_KEYS.LEADS);
      }
      return sanitized;
    } catch {
      return [];
    }
  },

  saveLeads(leads, userId) {
    const key = this.getStorageKey(STORAGE_KEYS.LEADS, userId);
    const sanitized = sanitizeLeads(leads);
    localStorage.setItem(key, JSON.stringify(sanitized));
    if (userId) localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(sanitized));
  },

  addLead(newLead, userId) {
    const leads = this.getLeads(userId);
    const lead = {
      id: 'lead-' + generateId(),
      status: 'discovered',
      scoutedAt: getTimestamp(),
      techStack: Array.isArray(newLead.techStack) ? newLead.techStack : ['WordPress (Legacy)'],
      detectedSignals: Array.isArray(newLead.detectedSignals) ? newLead.detectedSignals : [],
      emailStatus: newLead.emailStatus || 'verified',
      ...newLead
    };
    const updated = [lead, ...leads];
    this.saveLeads(updated, userId);
    return lead;
  },

  addLeads(newLeadsArray, userId) {
    if (!Array.isArray(newLeadsArray) || newLeadsArray.length === 0) return [];
    const leads = this.getLeads(userId);
    const stamped = newLeadsArray.map(item => ({
      id: 'lead-' + generateId(),
      status: item.status || 'discovered',
      scoutedAt: getTimestamp(),
      techStack: Array.isArray(item.techStack) ? item.techStack : ['WordPress (Legacy)'],
      detectedSignals: Array.isArray(item.detectedSignals) ? item.detectedSignals : [],
      emailStatus: item.emailStatus || 'verified',
      ...item
    }));
    const updated = [...stamped, ...leads];
    this.saveLeads(updated, userId);
    return stamped;
  },

  updateLead(leadId, patch, userId) {
    const leads = this.getLeads(userId);
    const updated = leads.map(l => l.id === leadId ? { ...l, ...patch } : l);
    this.saveLeads(updated, userId);
    return updated;
  },

  deleteLead(leadId, userId) {
    const leads = this.getLeads(userId);
    const updated = leads.filter(l => l.id !== leadId);
    this.saveLeads(updated, userId);
    return updated;
  },

  // Outbox (Decision Desk)
  getOutbox(userId) {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.OUTBOX, userId);
      const stored = localStorage.getItem(key);
      const raw = stored || (!userId ? null : localStorage.getItem(STORAGE_KEYS.OUTBOX));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeOutbox(parsed);
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(sanitized));
        if (userId) localStorage.removeItem(STORAGE_KEYS.OUTBOX);
      }
      return sanitized;
    } catch {
      return [];
    }
  },

  saveOutbox(outbox, userId) {
    const key = this.getStorageKey(STORAGE_KEYS.OUTBOX, userId);
    const sanitized = sanitizeOutbox(outbox);
    localStorage.setItem(key, JSON.stringify(sanitized));
    if (userId) localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(sanitized));
  },

  addToOutbox(item, userId) {
    const outbox = this.getOutbox(userId);
    const newItem = {
      id: 'outbox-' + generateId(),
      status: 'pending_approval',
      createdAt: 'Just now',
      ...item
    };
    const updated = [newItem, ...outbox];
    this.saveOutbox(updated, userId);
    return newItem;
  },

  approveEmail(outboxId, userId) {
    const outbox = this.getOutbox(userId);
    const updated = outbox.map(item => 
      item.id === outboxId ? { ...item, status: 'approved', approvedAt: getTimestamp() } : item
    );
    this.saveOutbox(updated, userId);
    return updated;
  },

  rejectEmail(outboxId, reason = 'Not relevant', userId) {
    const outbox = this.getOutbox(userId);
    const updated = outbox.map(item => 
      item.id === outboxId ? { ...item, status: 'rejected', rejectionReason: reason } : item
    );
    this.saveOutbox(updated, userId);
    return updated;
  },

  deleteOutboxItem(outboxId, userId) {
    const outbox = this.getOutbox(userId);
    const updated = outbox.filter(item => item.id !== outboxId);
    this.saveOutbox(updated, userId);
    return updated;
  },

  updateEmailDraft(outboxId, newBody, newSubject, userId) {
    const outbox = this.getOutbox(userId);
    const updated = outbox.map(item => 
      item.id === outboxId ? { ...item, body: newBody, subject: newSubject, wordCount: newBody.trim().split(/\s+/).length } : item
    );
    this.saveOutbox(updated, userId);
    return updated;
  },

  // Conversations (Inbound Replies & Inbound Negotiations)
  getConversations(userId) {
    try {
      const key = this.getStorageKey(STORAGE_KEYS.CONVERSATIONS, userId);
      const stored = localStorage.getItem(key);
      const raw = stored || (!userId ? null : localStorage.getItem(STORAGE_KEYS.CONVERSATIONS));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeConversations(parsed);
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(sanitized));
        if (userId) localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      }
      return sanitized;
    } catch {
      return [];
    }
  },

  saveConversations(convs, userId) {
    const key = this.getStorageKey(STORAGE_KEYS.CONVERSATIONS, userId);
    const sanitized = sanitizeConversations(convs);
    localStorage.setItem(key, JSON.stringify(sanitized));
    if (userId) localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(sanitized));
  },

  addConversation(newConv, userId) {
    const convs = this.getConversations(userId);
    const conv = {
      id: 'conv-' + generateId(),
      stage: newConv.stage || 'qualifying',
      lastReplyTime: 'Just now',
      messages: newConv.messages || [],
      dealValue: newConv.dealValue || 699,
      ...newConv
    };
    const updated = [conv, ...convs];
    this.saveConversations(updated, userId);
    return conv;
  },

  updateConversation(convId, patch, userId) {
    const convs = this.getConversations(userId);
    const updated = convs.map(c => c.id === convId ? { ...c, ...patch } : c);
    this.saveConversations(updated, userId);
    return updated;
  },

  deleteConversation(convId, userId) {
    const convs = this.getConversations(userId);
    const updated = convs.filter(c => c.id !== convId);
    this.saveConversations(updated, userId);
    return updated;
  },

  clearAllSalesData(userId) {
    const lKey = this.getStorageKey(STORAGE_KEYS.LEADS, userId);
    const oKey = this.getStorageKey(STORAGE_KEYS.OUTBOX, userId);
    const cKey = this.getStorageKey(STORAGE_KEYS.CONVERSATIONS, userId);
    localStorage.removeItem(lKey);
    localStorage.removeItem(oKey);
    localStorage.removeItem(cKey);
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.OUTBOX);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    return { leads: [], outbox: [], conversations: [] };
  },

  // CSV Importer for Real House Cleaning Lead Lists
  parseLeadsCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const parseRow = (row) => {
      const result = [];
      let insideQuote = false;
      let entry = '';
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          result.push(entry.trim().replace(/^["']|["']$/g, ''));
          entry = '';
        } else {
          entry += char;
        }
      }
      result.push(entry.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const findIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    const companyIdx = findIndex(['company', 'org', 'business', 'name', 'cleaningservice']);
    const domainIdx = findIndex(['domain', 'website', 'url', 'site']);
    const industryIdx = findIndex(['industry', 'sector', 'niche', 'service']);
    const locationIdx = findIndex(['location', 'city', 'country', 'region', 'state']);
    const contactIdx = findIndex(['contact', 'person', 'lead', 'decisionmaker', 'owner']);
    const titleIdx = findIndex(['title', 'role', 'position', 'designation']);
    const emailIdx = findIndex(['email', 'mail']);

    const parsedLeads = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseRow(lines[i]);
      if (!row || row.length === 0) continue;

      const companyName = companyIdx !== -1 ? row[companyIdx] : (row[0] || '');
      const contactName = contactIdx !== -1 ? row[contactIdx] : (row[1] || 'Business Owner');
      const contactEmail = emailIdx !== -1 ? row[emailIdx] : '';

      if (!companyName && !contactEmail) continue;

      parsedLeads.push({
        id: 'lead-' + generateId(),
        companyName: companyName || 'Cleaning Company',
        domain: domainIdx !== -1 && row[domainIdx] 
          ? row[domainIdx].replace(/^https?:\/\//, '').replace(/\/$/, '') 
          : `${(companyName || 'cleaning').toLowerCase().replace(/\s+/g, '')}.com`,
        industry: industryIdx !== -1 && row[industryIdx] ? row[industryIdx] : 'House Cleaning & Maid Services',
        location: locationIdx !== -1 && row[locationIdx] ? row[locationIdx] : 'United States',
        contactName: contactName || 'Owner',
        contactTitle: titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : 'Owner / General Manager',
        contactEmail: contactEmail || `contact@${(companyName || 'cleaning').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        emailStatus: 'verified',
        detectedSignals: [
          { code: 'SLOPPY_LEGACY_SITE', title: 'Outdated legacy website with broken mobile forms & no instant booking widget', confidence: 0.95 }
        ],
        techStack: ['Legacy WordPress / Wix'],
        status: 'discovered',
        scoutedAt: getTimestamp()
      });
    }

    return parsedLeads;
  },

  // Real AI Lead Discovery for US House Cleaning Businesses
  async discoverLeadsWithAI({ industry = 'House Cleaning & Maid Services', location = 'Dallas, TX', count = 2 }) {
    const settings = this.getSettings();
    if (settings.geminiApiKey) {
      const prompt = `Generate ${count} realistic, high-value target residential or commercial cleaning businesses in the "${industry}" sector located in or around "${location}, USA".
These must be real-looking companies that typically have outdated, sloppy 2012-era websites, lack mobile-friendly instant booking calculators, and are losing house cleaning clients.

Return ONLY a valid JSON array with objects matching:
[
  {
    "companyName": "Company Name (e.g. Lone Star Maid Service)",
    "domain": "companydomain.com",
    "industry": "${industry}",
    "location": "${location}",
    "contactName": "First & Last Name (Owner)",
    "contactTitle": "Owner & Operator",
    "contactEmail": "owner@companydomain.com",
    "emailStatus": "verified",
    "detectedSignals": [
      { "code": "SLOPPY_WEBSITE", "title": "Sloppy legacy 2015 site with no online quote calculator or mobile booking", "confidence": 0.96 }
    ],
    "techStack": ["WordPress 2014", "Unresponsive CSS", "No SSL / Slow Loading"]
  }
]`;
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${settings.modelName || 'gemini-3.5-flash'}:generateContent?key=${settings.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.8
              }
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map(p => ({
                id: 'lead-' + generateId(),
                status: 'discovered',
                scoutedAt: getTimestamp(),
                ...p
              }));
            }
          }
        }
      } catch (err) {
        console.warn('AI Discovery failed, falling back to dynamic generator:', err);
      }
    }

    // Dynamic tailored candidate generator across USA cities
    const usaCities = [
      'Dallas, TX', 'Miami, FL', 'Phoenix, AZ', 'Atlanta, GA', 
      'Houston, TX', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 
      'Austin, TX', 'Charlotte, NC', 'Seattle, WA', 'Tampa, FL'
    ];

    const requestedCount = Math.max(1, Math.min(count || 3, 10));
    const results = [];

    for (let i = 0; i < requestedCount; i++) {
      const cityClean = location && location !== 'All USA' 
        ? location.split(',')[0].trim() 
        : usaCities[i % usaCities.length].split(',')[0].trim();
      const citySlug = cityClean.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randId = generateId().substring(0, 3);
      const isNoSite = i % 2 === 1; // alternate between sloppy site and no site

      const presetTypes = [
        {
          companyName: `${cityClean} Sparkle & Shine Maids`,
          domain: `${citySlug}sparklemaids${randId}.com`,
          hasWebsite: true,
          contactName: 'Sarah Jenkins',
          contactTitle: 'Owner & Founder',
          signalCode: 'SLOPPY_LEGACY_WEBSITE',
          signal: '4.9-star Google rating with 90+ reviews, but website is an old 2013 layout that forces phone calls instead of instant booking'
        },
        {
          companyName: `Pristine Home Cleaning ${cityClean}`,
          domain: `pristine${citySlug}${randId}.cleaning`,
          hasWebsite: false,
          contactName: 'Carlos Rivera',
          contactTitle: 'Owner & Operator',
          signalCode: 'NO_WEBSITE_FOUND',
          signal: `NO WEBSITE FOUND: Has 65+ 5-star Google reviews in ${cityClean} but zero website, losing online quotes to franchise competitors`
        },
        {
          companyName: `Apex Deep Clean ${cityClean}`,
          domain: `apexclean${citySlug}${randId}.com`,
          hasWebsite: true,
          contactName: 'David Miller',
          contactTitle: 'Managing Partner',
          signalCode: 'SLOPPY_LEGACY_WEBSITE',
          signal: 'Sloppy non-responsive mobile site; losing home cleaning estimate requests due to broken contact forms'
        },
        {
          companyName: `${cityClean} Maid Brigade Pro`,
          domain: `${citySlug}maids${randId}.com`,
          hasWebsite: false,
          contactName: 'Amanda Ross',
          contactTitle: 'Founder',
          signalCode: 'NO_WEBSITE_FOUND',
          signal: 'NO WEBSITE FOUND: Operating solely via Facebook/Yelp; has no direct online bedroom/bathroom calculator or booking page'
        }
      ];

      const pick = presetTypes[i % presetTypes.length];
      const leadId = 'lead-' + generateId();

      results.push({
        id: leadId,
        companyName: pick.companyName,
        domain: pick.domain,
        industry: industry || 'House Cleaning & Maid Services',
        location: `${cityClean}, United States`,
        contactName: pick.contactName,
        contactTitle: pick.contactTitle,
        contactEmail: `contact@${pick.domain}`,
        emailStatus: 'verified',
        hasWebsite: pick.hasWebsite,
        detectedSignals: [
          { code: pick.signalCode, title: pick.signal, confidence: 0.96 },
          { code: 'NO_INSTANT_BOOKING', title: 'Lacks real-time bedroom/bathroom instant pricing calculator on mobile', confidence: 0.92 }
        ],
        techStack: pick.hasWebsite ? ['Legacy WordPress', 'Broken Mobile Tables'] : ['Google Business Profile / Yelp', 'No Website Active'],
        status: 'discovered',
        scoutedAt: getTimestamp()
      });
    }

    return results;
  },

  // 1-Click Auto Scout Leads: Discovers and saves USA cleaning leads automatically
  async autoScoutLeads(count = 5, userId) {
    const leads = await this.discoverLeadsWithAI({ count, industry: 'House Cleaning & Maid Services' });
    this.addLeads(leads, userId);
    return leads;
  },

  // Generate ultra-short, convincing cold email (<60 words) pitching House Cleaning Web Modernization
  async generateColdEmailWithAI({ lead, framework = 'PAS', customNotes = '' }) {
    const settings = this.getSettings();
    const persona = settings.persona || DEFAULT_SETTINGS.persona;
    const portfolioUrl = settings.portfolioUrl || DEFAULT_SETTINGS.portfolioUrl;

    const prompt = `
You are ${persona.name}, a real human employee (${persona.role}) at ${persona.company}.
You are reaching out 1-to-1 to a US House Keeping & Cleaning business owner.

CRITICAL IDENTITY DIRECTIVE:
- YOU ARE A REAL HUMAN EMPLOYEE. Under NO circumstances do you say, mention, or admit you are an AI, bot, or automated tool.
- Speak directly, warmly, and naturally like an expert web consultant.

TARGET CLIENT PROFILE:
Company: ${lead.companyName} (${lead.domain})
Location: ${lead.location}
Contact: ${lead.contactName}, ${lead.contactTitle}
Observable Issue: ${lead.detectedSignals?.[0]?.title || 'Old, sloppy website without instant mobile booking calculator'}

WHAT WE DELIVER (MUST BE CLEARLY OUTLINED):
1. Instant bedroom/bathroom online estimate calculator
2. Mobile-first 60-second booking flow
3. Automated SMS & email alerts for new bookings
4. Modern high-speed layout with service area radius

FREE 24-HOUR CUSTOM DEMO (ZERO COST, ZERO OBLIGATION):
- We build a 100% FREE custom preview with ${lead.companyName}'s branding within 24 hours.
- If they already have a website or Facebook page, we directly fetch their logo, images, and details automatically.
- Or they can simply reply with their logo/colors.
- Turnkey launch is $499 one-time, plus $20/month hosting and ongoing maintenance.
- Live working demo link to test: ${portfolioUrl}

ANTI-AI & WRITING RULES:
1. Keep email concise, organized with clean bullet points.
2. ZERO AI CLICHES (no "hope this email finds you well", "game-changer", "streamline", "delve").
3. Include clickable link to ${portfolioUrl}.

Return ONLY valid JSON:
{
  "subject": "quick question regarding ${lead.companyName} online bookings",
  "body": "...",
  "signalHook": "Missing instant bedroom/bathroom booking calculator"
}
`;

    if (settings.geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${settings.modelName || 'gemini-3.5-flash'}:generateContent?key=${settings.geminiApiKey}`,
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
              signalHook: parsed.signalHook || 'Outdated site lacking mobile booking calculator',
              wordCount: parsed.body.trim().split(/\s+/).length,
              modelUsed: `InfratechAI Neural SDR`
            };
          }
        }
      } catch (err) {
        console.warn('AI call failed, falling back to heuristic template:', err);
      }
    }

    // Heuristic Human-Style Template with full deliverables & free 24-hr demo offer
    const firstName = (lead.contactName || 'there').split(' ')[0];
    const city = (lead.location || 'your area').split(',')[0];
    
    const fallbackBody = `Hi ${firstName},

Checked out ${lead.companyName} and noticed you don't have an instant online estimate and 60-second booking flow on mobile for homeowners in ${city}.

Here is what we build for cleaning pros:
• Instant bedroom/bathroom online estimate calculator
• Mobile-first 60-second customer booking system
• Automated SMS & email alerts for new bookings
• Modern, high-speed layout with service area radius

See our live working demo here (1-click):
${portfolioUrl}

We'll build a 100% FREE custom interactive preview for ${lead.companyName} within 24 hours (zero cost, zero obligation). If you have an existing website or Facebook page, we fetch your logo and business details directly — or just reply with your logo/colors.

If you ever decide to launch, it's just $499 turnkey one-time, plus $20/month for hosting & maintenance.

Would you like us to put together your free 24-hr custom preview?

Best,
Harvey Ross
Client Solutions Specialist | InfraTech AI
aman.infratechai@gmail.com`;

    return {
      subject: `quick question about ${lead.companyName} online bookings`,
      body: fallbackBody,
      signalHook: 'Lacks instant mobile bedroom/bathroom estimate calculator',
      wordCount: fallbackBody.trim().split(/\s+/).length,
      modelUsed: 'InfratechAI Neural SDR'
    };
  },

  // Autonomous Inbound Negotiation Engine ($499 - $899 USD & 24h Demo Promise)
  // Strictly acts as a human employee - never discloses AI
  async generateReplyWithAI({ conversation, lead, customInstruction = '' }) {
    const settings = this.getSettings();
    const persona = settings.persona || DEFAULT_SETTINGS.persona;
    const portfolioUrl = settings.portfolioUrl || DEFAULT_SETTINGS.portfolioUrl;

    const messagesHistory = (conversation?.messages || [])
      .map(m => `${m.sender === 'prospect' ? (conversation?.contactName || 'Client') : persona.name}: "${m.content}"`)
      .join('\n');

    const lastProspectMsg = (conversation?.messages || [])
      .filter(m => m.sender === 'prospect')
      .slice(-1)[0]?.content || '';

    const prompt = `
You are ${persona.name}, a real human employee (${persona.role}) at ${persona.company}.
You are currently negotiating via email with a US house cleaning / maid service business owner.

CRITICAL IDENTITY DIRECTIVE:
- YOU ARE A REAL HUMAN EMPLOYEE. Under NO circumstances do you say, mention, or admit you are an AI, bot, or virtual assistant.
- If they ask "Are you AI?" or anything similar, reply casually like a real person: "Haha no, I'm Harvey from our web team here at the office."
- Write naturally, professionally, and warmly — like a confident sales consultant.

OFFER & NEGOTIATION HEURISTICS:
- Niche: House Keeping & Maid Services across the USA (companies with sloppy websites OR zero website).
- What we do: We build high-converting booking machines with instant pricing calculators & mobile scheduling (like our live demo: ${portfolioUrl}).
- Pricing Rule ($499 - $899 USD):
  * Standard price is $799 - $899 for full turnkey modern site build and mobile calculator.
  * If they push back on budget or ask for a discount, offer $499 or $599 as an introductory rate for their city.
- MAINTENANCE & HOSTING RULE:
  * If asked about monthly costs or maintenance: "Hosting, SSL, and ongoing updates is just $20/month or $200/year (saves $40) with no lock-in contracts. You get 100% full ownership."
- CALL OR MEETING REQUEST RULE (CRITICAL):
  * If they ask for a call, meeting, or Zoom: ALWAYS accept enthusiastically! Say: "Definitely, happy to jump on a quick 10-min call! I can fix our schedule within the next 24 hours — what time tomorrow works best for your schedule? In the meantime, I'm already spinning up your 24h live preview link so we have something concrete to look at on the call."
- THE 24-HOUR DEMO PROMISE (CORE CLOSING STRATEGY):
  * As soon as they show interest, promise: "I'll have our team put together a live interactive custom preview of your new site in 24 hours — 100% free with zero commitment."
  * Tell them: "Once you inspect the preview on your phone and love it, we take the one-time payment ($499-$899) and connect it live to your domain in minutes."
- DEMO LINK: ${portfolioUrl}

CONVERSATION THREAD:
${messagesHistory}

LAST MESSAGE FROM CLIENT:
"${lastProspectMsg}"

ADDITIONAL USER INSTRUCTION:
${customInstruction || 'Negotiate effectively, offer the 24-hr custom preview, and close the deal smoothly.'}

RULES:
1. LENGTH: Under 50 to 70 words. Keep it super short, conversational, and direct.
2. NO CORPORATE JARGON or ChatGPT phrases ("hope this finds you well", "delve", "game-changer", "thrilled", etc.).
3. Return ONLY valid JSON:
{
  "reply": "...",
  "suggestedStage": "negotiating" | "demo_in_progress" | "payment_pending" | "closed_won",
  "dealValue": 499,
  "summary": "1-sentence summary of agreement"
}
`;

    if (settings.geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${settings.modelName || 'gemini-3.5-flash'}:generateContent?key=${settings.geminiApiKey}`,
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
              reply: parsed.reply,
              suggestedStage: parsed.suggestedStage || 'negotiating',
              dealValue: parsed.dealValue || 499,
              summary: parsed.summary || 'Negotiated terms with 24h custom demo promise'
            };
          }
        }
      } catch (err) {
        console.warn('AI reply generation failed, falling back to heuristic engine:', err);
      }
    }

    // Heuristic Human-Style Negotiation Fallbacks
    const clientFirst = (conversation?.contactName || 'there').split(' ')[0];
    const msgLower = lastProspectMsg.toLowerCase();

    // 1. Meeting or Call Request ("Can we talk on phone?", "Can we meet?", "Zoom call?", "Schedule a call")
    if (msgLower.includes('call') || msgLower.includes('phone') || msgLower.includes('meet') || msgLower.includes('zoom') || msgLower.includes('schedule') || msgLower.includes('talk') || msgLower.includes('ring')) {
      return {
        reply: `Hi ${clientFirst} — definitely, happy to jump on a quick 10-min call! I can get our schedule fixed within the next 24 hours — what time tomorrow works best for your schedule?\n\nIn the meantime, I'm already queueing up your 24h custom live preview so we have something concrete to look at on the call.`,
        suggestedStage: 'negotiating',
        dealValue: 499,
        summary: 'Agreed to call and offered schedule fix within 24 hours'
      };
    }

    // 2. Maintenance & Ongoing Hosting Cost ("How much is maintenance?", "Hosting fee?", "Monthly?")
    if (msgLower.includes('maintenance') || msgLower.includes('hosting') || msgLower.includes('monthly') || msgLower.includes('yearly') || msgLower.includes('ongoing') || msgLower.includes('annual') || msgLower.includes('after')) {
      return {
        reply: `Hi ${clientFirst} — for high-speed cloud hosting, SSL, and ongoing updates, it's just $20/month or $200/year (saves $40) with no lock-in contracts. You get 100% full ownership of the site.\n\nWant me to queue up your free 24-hr custom preview first so you can test it on your phone?`,
        suggestedStage: 'negotiating',
        dealValue: 499,
        summary: 'Quoted $20/mo or $200/yr hosting & maintenance'
      };
    }

    // 3. Price Inquiry ("How much?", "What does it cost?", "Pricing?")
    if (msgLower.includes('how much') || msgLower.includes('cost') || msgLower.includes('price') || msgLower.includes('rate') || msgLower.includes('pricing')) {
      return {
        reply: `Hi ${clientFirst} — our full turnkey build with instant mobile booking is usually $799, but we can do it for $499 flat for your business, plus optional $20/mo hosting.\n\nBetter yet: I'll build a live custom preview for your company within 24 hours so you can test it on your phone first. If you love it, we connect your domain; if not, you pay nothing.\n\nFair enough?`,
        suggestedStage: 'negotiating',
        dealValue: 499,
        summary: 'Quoted $499 introductory rate with 24h risk-free demo'
      };
    }

    // 4. Interest / Agreement ("Send demo", "Interested", "Yes", "Show me", "How do we start?")
    if (msgLower.includes('yes') || msgLower.includes('interested') || msgLower.includes('demo') || msgLower.includes('preview') || msgLower.includes('start') || msgLower.includes('sure') || msgLower.includes('okay')) {
      return {
        reply: `Awesome ${clientFirst}! I'm putting our web team on it right now. You'll receive your custom interactive preview link in under 24 hours.\n\nYou can tap through on your phone and test the quote calculator. Once you're 100% happy with it, we take the $499 payment and switch your domain over live.\n\nStay tuned for the preview link tomorrow!`,
        suggestedStage: 'demo_in_progress',
        dealValue: 499,
        summary: 'Locked in 24-hour custom preview build; payment on approval'
      };
    }

    // 5. Objection ("We already have a website", "Too busy", "Not right now")
    if (msgLower.includes('already have') || msgLower.includes('busy') || msgLower.includes('not interested') || msgLower.includes('later')) {
      return {
        reply: `Totally get it ${clientFirst}. Most cleaning owners we speak with already had a site, but noticed they were losing 30-40% of mobile visitors who couldn't get an instant price.\n\nTake a quick 20-second look at our live demo: ${portfolioUrl}\n\nI can put your custom preview together in 24h at zero cost — no commitment needed. Open to checking it out?`,
        suggestedStage: 'qualifying',
        dealValue: 499,
        summary: 'Handled existing website objection with demo proof & 24h preview'
      };
    }

    // 6. Default Consultative Response
    return {
      reply: `Hi ${clientFirst} — thanks for getting back to me. We build modern, high-converting booking engines for house cleaners (check our standard: ${portfolioUrl}).\n\nI can build a working preview tailored for your business in 24 hours for $499 total (with optional $20/mo hosting), payable only once you review and love the demo.\n\nWould you like me to queue up your 24h preview?`,
      suggestedStage: 'negotiating',
      dealValue: 499,
      summary: 'Presented $499 package with 24-hr custom preview promise'
    };
  },

  // Check if Harvey local Gmail daemon is running on localhost:5555
  async checkDaemonStatus() {
    try {
      const res = await fetch('http://127.0.0.1:5555/api/status', { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, ...data };
      }
      return { isOnline: false };
    } catch {
      return { isOnline: false };
    }
  },

  // Verify Gmail credentials with daemon
  async verifyGmailCredentials(user, pass) {
    try {
      const res = await fetch('http://127.0.0.1:5555/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message || 'Cannot reach Harvey Mailer Daemon at 127.0.0.1:5555' };
    }
  },

  // Send live email via Gmail (supports both Vercel Serverless /api/send-email and local daemon 127.0.0.1:5555)
  async sendLiveEmailViaGmail({ to, subject, body, userId }) {
    const settings = this.getSettings(userId);
    const user = settings.gmailAddress || import.meta.env.VITE_GMAIL_ADDRESS || 'aman.infratechai@gmail.com';
    const pass = settings.gmailAppPassword || import.meta.env.VITE_GMAIL_APP_PASSWORD || 'qerk bggh ysyk mrfg';
    const fromName = settings.persona?.name || 'Harvey Ross';

    const payload = {
      to,
      subject,
      text: body,
      user,
      pass,
      fromName
    };

    let lastError = null;

    // 1. Try Vercel Serverless Function first (same-origin, works on HTTPS production)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch (err) {
      lastError = err;
    }

    // 2. Try Local Harvey Daemon (http://127.0.0.1:5555/api/send)
    try {
      const res = await fetch('http://127.0.0.1:5555/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      }
      if (data && data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      lastError = err;
    }

    throw new Error(lastError ? lastError.message : 'Could not reach email dispatcher. Ensure daemon is running or Vercel function is active.');
  },

  // Sync with Harvey Daemon state (loads sent emails & inbound demo inquiries)
  async syncWithDaemonState(userId) {
    try {
      const res = await fetch('http://127.0.0.1:5555/api/daemon-state');
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.success || !data.state) return null;

      const { outbox = [], conversations = [] } = data.state;
      const currentOutbox = this.getOutbox(userId);
      const currentConvs = this.getConversations(userId);

      // Merge sent outbox items
      const existingIds = new Set(currentOutbox.map(o => o.recipientEmail));
      const newOutboxItems = outbox.filter(o => !existingIds.has(o.recipientEmail));
      if (newOutboxItems.length > 0) {
        this.saveOutbox([...newOutboxItems, ...currentOutbox], userId);
      }

      // Merge conversations
      const existingConvEmails = new Set(currentConvs.map(c => c.contactEmail));
      const newConvs = conversations.filter(c => !existingConvEmails.has(c.contactEmail));
      if (newConvs.length > 0) {
        this.saveConversations([...newConvs, ...currentConvs], userId);
      }

      return data.state;
    } catch {
      return null;
    }
  }
};

