/**
 * InfratechAI AI Dev Service
 * Technical Lead & Autonomous Copilot with complete real-time awareness
 * of QA Manager, Sales Manager (Harvey), and Business Command Center.
 * Powered by Google Gemini with multi-lingual real-time speech intelligence
 * addressing user as "Boss".
 */

export const aiDevService = {
  // Speech Synthesis Controller
  currentUtterance: null,

  isSpeechSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  getAvailableVoices() {
    if (!this.isSpeechSupported()) return [];
    return window.speechSynthesis.getVoices();
  },

  /**
   * Retrieves Gemini API Key from environment or local storage
   */
  getApiKey() {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
      }
    } catch {}

    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('infratechai_sales_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.geminiApiKey) {
            return parsed.geminiApiKey;
          }
        }
      }
    } catch {}

    return '';
  },

  cachedJarvisVoice: null,
  cachedFridayVoice: null,

  /**
   * Retrieves all available system voices
   */
  getAvailableVoices() {
    if (!this.isSpeechSupported()) return [];
    return window.speechSynthesis.getVoices();
  },

  /**
   * Transliterates Devanagari characters to phonetic Roman Hinglish
   * so the British / US JARVIS voice pronounces it cleanly without switching synthesizers.
   */
  devanagariToRoman(text = '') {
    if (!text || !/[\u0900-\u097F]/.test(text)) return text;

    const wordMap = {
      'हाँ': 'Haan', 'हा': 'Haan', 'नहीं': 'Nahi', 'ना': 'Na',
      'बॉस': 'Boss', 'बास': 'Boss',
      'बग': 'bug', 'बग्स': 'bugs', 'बॉक्स': 'bugs', 'बक्से': 'bugs',
      'डिफेक्ट': 'defect', 'डिफेक्ट्स': 'defects',
      'एरर': 'error', 'एरर्स': 'errors',
      'स्टेटस': 'status', 'पास': 'pass', 'फेल': 'fail',
      'टेस्ट': 'test', 'टेस्ट्स': 'tests',
      'प्रोजेक्ट': 'project', 'प्रोजेक्ट्स': 'projects',
      'कॉन्ट्रैक्ट': 'contract', 'कॉन्ट्रैक्ट्स': 'contracts',
      'क्लाइंट': 'client', 'क्लाइंट्स': 'clients',
      'कुल': 'kul', 'कितने': 'kitne', 'कितना': 'kitna',
      'है': 'hai', 'हैं': 'hain', 'था': 'tha', 'थी': 'thi',
      'होगा': 'hoga', 'होगी': 'hogi', 'कर': 'kar', 'करो': 'karo',
      'दीजिए': 'dijiye', 'दीजिये': 'dijiye',
      'नमस्ते': 'Namaste', 'शुक्रिया': 'Shukriya', 'धन्यवाद': 'Dhanyavaad',
      'ठीक': 'Theek', 'अच्छा': 'Achha', 'सुनाओ': 'sunao', 'बताओ': 'batao'
    };

    let result = text;
    for (const [hindi, roman] of Object.entries(wordMap)) {
      result = result.replace(new RegExp(hindi, 'g'), roman);
    }

    const charMap = {
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
      'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah',
      'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
      'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
      'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
      'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
      'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
      'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
      'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
      'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
      '्': '', '़': '', '।': '.'
    };

    let romanized = '';
    for (const char of result) {
      if (charMap[char] !== undefined) {
        romanized += charMap[char];
      } else if (/[\u0900-\u097F]/.test(char)) {
        // Skip orphan diacritics
      } else {
        romanized += char;
      }
    }

    return romanized.replace(/\s+/g, ' ').trim();
  },

  /**
   * Selects and locks in the exact authentic Tony Stark British / High-Tech JARVIS voice.
   * This is the exact voice played when clicking "LIVE TALK".
   * Once selected, it is cached and used consistently across all utterances.
   */
  getJarvisMaleVoice() {
    if (!this.isSpeechSupported()) return null;
    if (this.cachedJarvisVoice) return this.cachedJarvisVoice;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Strict list of female voice keywords to eliminate
    const FEMALE_BLACKLIST = [
      'female', 'woman', 'girl', 'zira', 'jenny', 'heera', 'neerja', 'swara', 'kalpana',
      'hazel', 'susan', 'catherine', 'aria', 'sara', 'ava', 'emma', 'ana', 'ayanda',
      'sonia', 'mia', 'libby', 'natasha', 'clara', 'victoria', 'kavya', 'ananya',
      'priya', 'pooja', 'shruti', 'shreya', 'sunita', 'madhuri', 'anita', 'aditi',
      'stephanie', 'karen', 'tessa', 'fiona', 'veena', 'alice', 'samantha', 'kendra',
      'cosette', 'ellen', 'yvonne', 'amelie', 'joana', 'helena', 'luciana', 'laura'
    ];

    const isNotFemale = (v) => {
      const name = (v.name || '').toLowerCase();
      return !FEMALE_BLACKLIST.some(term => name.includes(term));
    };

    // Filter down to non-female voices
    const nonFemaleVoices = voices.filter(isNotFemale);
    const pool = nonFemaleVoices.length > 0 ? nonFemaleVoices : voices;

    // TIER 1: British English Male (Authentic Tony Stark's JARVIS accent - George, Ryan, Oliver, UK Male)
    const jarvisBritish = pool.find(v => 
      (v.lang.startsWith('en-GB') || v.name.includes('United Kingdom') || v.name.includes('UK')) &&
      (v.name.includes('George') || v.name.includes('Ryan') || v.name.includes('Oliver') || v.name.toLowerCase().includes('male'))
    );
    if (jarvisBritish) {
      this.cachedJarvisVoice = jarvisBritish;
      return jarvisBritish;
    }

    // TIER 2: High-Tech Energetic US English Male (Microsoft Guy Natural, David, Mark, Ryan)
    const jarvisTechMale = pool.find(v => 
      v.name.includes('Guy') || 
      v.name.includes('George') || 
      v.name.includes('David') || 
      v.name.includes('Mark') || 
      v.name.includes('Ryan') ||
      (v.name.toLowerCase().includes('male') && v.lang.startsWith('en'))
    );
    if (jarvisTechMale) {
      this.cachedJarvisVoice = jarvisTechMale;
      return jarvisTechMale;
    }

    // TIER 3: Crisp Indian English Male (Prabhat, Ravi)
    const indianMale = pool.find(v => 
      (v.lang.includes('en-IN') || v.name.includes('India')) && 
      (v.name.includes('Prabhat') || v.name.includes('Ravi') || v.name.toLowerCase().includes('male'))
    );
    if (indianMale) {
      this.cachedJarvisVoice = indianMale;
      return indianMale;
    }

    // TIER 4: Any English voice with explicit 'Male' token
    const anyExplicitMale = pool.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('en'));
    if (anyExplicitMale) {
      this.cachedJarvisVoice = anyExplicitMale;
      return anyExplicitMale;
    }

    // TIER 5: Any safe English voice
    const safeEnglish = pool.find(v => v.lang.startsWith('en'));
    if (safeEnglish) {
      this.cachedJarvisVoice = safeEnglish;
      return safeEnglish;
    }

    this.cachedJarvisVoice = pool[0] || null;
    return this.cachedJarvisVoice;
  },

  /**
   * Alias for backward compatibility
   */
  getAuthoritativeVoice() {
    return this.getJarvisMaleVoice();
  },

  /**
   * Selects and locks in an elegant, razor-sharp FRIDAY female voice.
   */
  getFridayFemaleVoice() {
    if (!this.isSpeechSupported()) return null;
    if (this.cachedFridayVoice) return this.cachedFridayVoice;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const MALE_BLACKLIST = [
      'male', 'david', 'george', 'mark', 'guy', 'ryan', 'prabhat', 'ravi',
      'hemant', 'madhur', 'oliver', 'arthur', 'alfie', 'james', 'daniel', 'brian', 'william'
    ];

    const isNotMale = (v) => {
      const name = (v.name || '').toLowerCase();
      return !MALE_BLACKLIST.some(term => name.includes(term));
    };

    const candidateVoices = voices.filter(isNotMale);
    const pool = candidateVoices.length > 0 ? candidateVoices : voices;

    // TIER 1: Irish / British English Female (Hazel, Libby, Sonia)
    const britishIrishFemale = pool.find(v => 
      (v.lang.startsWith('en-GB') || v.lang.startsWith('en-IE') || v.name.includes('United Kingdom') || v.name.includes('Ireland')) &&
      (v.name.includes('Hazel') || v.name.includes('Libby') || v.name.includes('Sonia') || v.name.toLowerCase().includes('female'))
    );
    if (britishIrishFemale) {
      this.cachedFridayVoice = britishIrishFemale;
      return britishIrishFemale;
    }

    // TIER 2: High-Tech US Female (Jenny Natural, Aria, Zira)
    const techUsFemale = pool.find(v => 
      (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Zira') || v.name.toLowerCase().includes('female')) &&
      v.lang.startsWith('en')
    );
    if (techUsFemale) {
      this.cachedFridayVoice = techUsFemale;
      return techUsFemale;
    }

    // TIER 3: Indian English Female (Neerja, Heera)
    const indianFemale = pool.find(v => 
      (v.lang.includes('en-IN') || v.name.includes('India')) && isNotMale(v)
    );
    if (indianFemale) {
      this.cachedFridayVoice = indianFemale;
      return indianFemale;
    }

    // TIER 4: Any English female voice
    const anyFemale = pool.find(v => v.lang.startsWith('en') && isNotMale(v));
    if (anyFemale) {
      this.cachedFridayVoice = anyFemale;
      return anyFemale;
    }

    this.cachedFridayVoice = pool[0] || null;
    return this.cachedFridayVoice;
  },

  /**
   * Retrieves voice for specified agent persona ('jarvis' or 'friday')
   */
  getAgentVoice(agent = 'jarvis') {
    return agent === 'friday' ? this.getFridayFemaleVoice() : this.getJarvisMaleVoice();
  },

  activeSpeechId: 0,

  /**
   * Speaks given text aloud with the selected Voice Agent (JARVIS or FRIDAY).
   * Supports immediate, clean interruption without locking microphone.
   * Locked to the authentic Live Talk voice across all responses.
   */
  speak(text, { agent = 'jarvis', onStart, onEnd, onError, rate, pitch } = {}) {
    if (!this.isSpeechSupported()) {
      if (onError) onError(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    // Cleanly cancel previous speech and increment token
    this.stopSpeaking();
    const currentId = ++this.activeSpeechId;

    // Transliterate any Devanagari Hindi text to clean Roman Hinglish
    const transliterated = this.devanagariToRoman(text || '');

    // Pronounce names naturally as words ("Jarvis", "Friday", "Mark 7") instead of spelling letters with dots
    const naturalSpokenNames = transliterated
      .replace(/J\.A\.R\.V\.I\.S\.?/gi, 'Jarvis')
      .replace(/F\.R\.I\.D\.A\.Y\.?/gi, 'Friday')
      .replace(/\bJARVIS\b/g, 'Jarvis')
      .replace(/\bFRIDAY\b/g, 'Friday')
      .replace(/\bMK[\s_]?VII\b/gi, 'Mark 7')
      .replace(/\bMK[\s_]?([0-9IVXLCDM]+)\b/gi, 'Mark $1');

    // Clean text of markdown characters, emojis, and symbols
    const cleanSpeechText = naturalSpokenNames
      .replace(/[*_#`~>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\|/g, ', ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/(\r\n|\n|\r)/gm, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeechText) {
      if (onEnd) onEnd();
      return;
    }

    const isFriday = agent === 'friday';
    const effectiveRate = rate !== undefined ? rate : (isFriday ? 1.12 : 1.14);
    const effectivePitch = pitch !== undefined ? pitch : (isFriday ? 1.08 : 1.04);

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = effectiveRate;
    utterance.pitch = effectivePitch;
    utterance.volume = 1.0;

    // Use the locked-in voice (the exact voice from Live Talk)
    const voice = isFriday 
      ? this.getFridayFemaleVoice()
      : this.getJarvisMaleVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || (isFriday ? 'en-IE' : 'en-GB');
    }

    utterance.onstart = () => {
      if (this.activeSpeechId !== currentId) return;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (this.activeSpeechId !== currentId) return;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (this.activeSpeechId !== currentId) return;
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Immediately interrupts and cancels speech, detaching callbacks
   * so late events never deadlock the recognition loop.
   */
  stopSpeaking() {
    this.activeSpeechId++;
    if (this.isSpeechSupported()) {
      if (this.currentUtterance) {
        this.currentUtterance.onstart = null;
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
        this.currentUtterance = null;
      }
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  },

  isSpeaking() {
    if (!this.isSpeechSupported()) return false;
    return window.speechSynthesis.speaking;
  },

  /**
   * Aggregates live system telemetry across all modules.
   */
  gatherLiveContext({
    projects = [],
    files = [],
    tests = [],
    bugs = [],
    contracts = [],
    leads = [],
    outbox = [],
    currentUser,
    syncStatus = 'synced'
  }) {
    // 1. QA Metrics
    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.status === 'Passed' || t.status === 'pass').length;
    const failedTests = tests.filter(t => t.status === 'Failed' || t.status === 'fail').length;
    const blockedTests = tests.filter(t => t.status === 'Blocked' || t.status === 'block').length;
    const untestedTests = totalTests - (passedTests + failedTests + blockedTests);
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    const openBugs = bugs.filter(b => b.status !== 'Closed' && b.status !== 'Resolved');
    const criticalBugs = openBugs.filter(b => b.severity === 'Critical' || b.severity === 'High');

    // 2. Business Contracts Metrics
    const now = new Date();
    const contractDetails = contracts.map(c => {
      const end = new Date(c.endDate);
      const daysRemaining = isNaN(end.getTime()) ? 0 : Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: c.id,
        client: c.clientName,
        account: c.accountName,
        value: c.contractValue,
        cycle: c.billingCycle,
        endDate: c.endDate,
        daysRemaining,
        isExpiringSoon: daysRemaining <= 30 && daysRemaining >= 0,
        isExpired: daysRemaining < 0,
        sla: c.slaTier,
        description: c.description
      };
    });

    const expiringSoonContracts = contractDetails.filter(c => c.isExpiringSoon);
    const totalMRR = contracts.reduce((acc, c) => acc + (Number(c.contractValue) || 0), 0);

    // 3. Sales SDR Metrics
    const pendingOutbox = outbox.filter(o => o.status === 'pending_approval');
    const approvedOutbox = outbox.filter(o => o.status === 'approved' || o.status === 'sent');

    return {
      user: currentUser?.displayName || currentUser?.email || 'Boss',
      syncStatus,
      qa: {
        projectsCount: projects.length,
        projectsList: projects.map(p => p.name),
        totalFiles: files.length,
        totalTests,
        passedTests,
        failedTests,
        blockedTests,
        untestedTests,
        passRate,
        openBugsCount: openBugs.length,
        criticalBugsCount: criticalBugs.length,
        openBugsList: openBugs.map(b => ({
          title: b.title,
          severity: b.severity,
          status: b.status || 'Open',
          project: projects.find(p => p.id === b.projectId)?.name || 'QA Workspace'
        })),
        criticalBugsList: criticalBugs.map(b => ({
          title: b.title,
          severity: b.severity,
          status: b.status || 'Open',
          project: projects.find(p => p.id === b.projectId)?.name || 'QA Workspace'
        }))
      },
      business: {
        totalContracts: contracts.length,
        contracts: contractDetails,
        expiringSoonCount: expiringSoonContracts.length,
        expiringSoonList: expiringSoonContracts,
        totalMRR
      },
      sales: {
        totalLeads: leads.length,
        pendingApprovalsCount: pendingOutbox.length,
        approvedCount: approvedOutbox.length,
        recentLeads: leads.slice(0, 5).map(l => ({ name: l.companyName, domain: l.domain }))
      }
    };
  },

  /**
   * Calls Google Gemini with full system telemetry and Boss persona.
   */
  async callGemini(query, liveContext, { preferredModel = 'gemini-3.5-flash', agent = 'jarvis' } = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("No Gemini API key configured.");
    }

    const candidateModels = [
      preferredModel,
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    const isFriday = agent === 'friday';
    const personaTitle = isFriday ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.';
    const personaVibe = isFriday
      ? 'calm, razor-sharp, elegant, articulate, and highly professional like Tony Stark\'s FRIDAY'
      : 'calm, authoritative, crisp, highly intelligent, and executive like Tony Stark\'s JARVIS';

    const systemPrompt = `You are ${personaTitle} / AI DEV, the executive Technical Lead & Platform Copilot of InfratechAI.
You address the user with supreme respect, crisp precision, and calm loyalty as "Boss".
Your tone is ${personaVibe}.
Speak naturally with high clarity and authority.

STRICT TONE & FORMAT RULES:
- ZERO EMOJIS: Never output emojis in either "markdown" or "spokenText". No icons, no smiley faces, no emoji bullet points.
- NO ROBOTIC TROPES: Avoid cliché sci-fi phrases such as "telemetry matrix online", "radar sweep complete", "diagnostics green", "firing on all cylinders", "neutralize defects". Speak like a top-tier executive Chief of Staff / Technical Director.
- DUAL LANGUAGE FLUENCY: Support both Hindi and English fluidly. If Boss addresses you in Hindi or Hinglish, respond back in natural, professional Hinglish. If Boss asks in English, respond in crisp executive English.
- CRITICAL TTS PRONUNCIATION RULE: The "spokenText" field MUST always be written ONLY using standard Latin/English alphabet characters (A-Z) in English or conversational Hinglish (e.g. "Boss, QA mein kul 12 bugs hain jisme se 3 critical hain..."). In "spokenText", always refer to yourself by the natural word "Jarvis" or "Friday" (NEVER with dots like J.A.R.V.I.S. or F.R.I.D.A.Y.). NEVER use Devanagari Hindi characters (no हिंदी लिपि) in "spokenText" because the voice engine reads Roman characters.
- SPEECH-TO-TEXT CORRECTION: When Boss speaks in Hindi, speech recognition frequently transcribes "bugs" as "बॉक्स" (boxes) or "बग्स" or "बग" or "एरर" or "डिफेक्ट". You MUST recognize that Boss is referring to software bugs/defects in QA Manager!
- Answer the EXACT specific question Boss asked! Do NOT give a generic platform summary if Boss asked specifically about bugs, contracts, pass rates, or status.
- If Boss asks how many critical bugs exist and their status (e.g. "कितने क्रिटिकल बॉक्स है उसका स्टेटस बता दे"), state the exact count of critical bugs AND list the critical bugs with their titles and projects!
- Return your response strictly as a JSON object with:
  {
    "spokenText": "concise spoken summary in Roman Hinglish or English (Latin alphabet ONLY, NO Devanagari, NO emojis, max 2 clear sentences for Text-to-Speech)",
    "markdown": "comprehensive response with clean markdown formatting, tables, and sections (NO emojis)",
    "actionSuggestion": { "label": "Button text", "targetApp": "qa" | "business" | "sales" } (optional)
  }`;

    const userPrompt = `Live Platform Telemetry:
${JSON.stringify(liveContext, null, 2)}

Boss's Command: "${query}"`;

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn(`Gemini model ${model} failed (${response.status}):`, errData);
          lastError = new Error(errData?.error?.message || `HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        }

        if (parsed && (parsed.spokenText || parsed.markdown)) {
          return {
            spokenText: parsed.spokenText || parsed.markdown.replace(/[*_#`~]/g, '').slice(0, 150),
            markdown: parsed.markdown || parsed.spokenText,
            actionSuggestion: parsed.actionSuggestion || null,
            type: 'gemini'
          };
        }
      } catch (err) {
        console.warn(`Gemini attempt with ${model} error:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini model endpoints failed.");
  },

  /**
   * High-accuracy multi-lingual fallback engine.
   * Understands Hindi, Hinglish, and English without repetitiveness.
   */
  processFallbackQuery(rawQuery, liveContext, { agent = 'jarvis' } = {}) {
    const q = (rawQuery || '').toLowerCase().trim();
    const ctx = liveContext || {};
    const qa = ctx.qa || { totalTests: 0, passedTests: 0, failedTests: 0, blockedTests: 0, passRate: 0, openBugsCount: 0, criticalBugsCount: 0, openBugsList: [], criticalBugsList: [], projectsCount: 0 };
    const business = ctx.business || { totalContracts: 0, contracts: [], expiringSoonCount: 0, expiringSoonList: [], totalMRR: 0 };
    const sales = ctx.sales || { totalLeads: 0, pendingApprovalsCount: 0, approvedCount: 0, recentLeads: [] };

    const isFriday = agent === 'friday';
    const persona = isFriday ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.';

    // 1. GREETINGS
    const isGreeting = 
      q === 'helo' || q === 'hello' || q === 'hi' || q === 'hey' || 
      q === 'namaste' || q === 'नमस्ते' || q === 'हेलो' || q === 'हाय' || 
      q === 'boss' || q === 'बॉस' || q === 'sun' || q === 'suno' || q === 'सुनो' ||
      q.includes('kya hal') || q.includes('kaise ho') || q.includes('हाल चाल');

    if (isGreeting) {
      const spokenText = isFriday
        ? `Hello Boss. Friday is online. All modules are fully synchronized across QA, client contracts, and the sales pipeline. How may I assist you today?`
        : `Hello Boss. Jarvis is active and connected to QA test suites, enterprise contracts, and the sales pipeline. How can I help you?`;
      
      const markdown = `### ${persona} AI Dev • Executive Copilot Online

All systems are synchronized across modules for **Boss**:

- **Business Command Center:** **${business.totalContracts} Active Contracts** ($${business.totalMRR.toLocaleString()}/mo MRR)
- **Quality Engineering (QA):** **${qa.totalTests} Total Tests** (${qa.passRate}% pass rate, **${qa.openBugsCount} open defects**)
- **Sales SDR (Harvey):** **${sales.totalLeads} Prospects** (**${sales.pendingApprovalsCount} pending outbox drafts**)

> Dual-voice agent active (${isFriday ? 'FRIDAY Female Voice' : 'JARVIS Male Voice'}). Ask any question in Hindi or English, such as *"Kiska contract kab expire hoga?"*, *"Critical defects ki list do"*, or *"Platform status"*.`;

      return { spokenText, markdown, type: 'greeting' };
    }

    // 2. DEFECTS / BUGS (including Hindi "बॉक्स", "बक्से", "बग", "बग्स", "कमियां", "एरर", "डिफेक्ट")
    const isBugQuery = 
      q.includes('bug') || q.includes('defect') || q.includes('issue') ||
      q.includes('बॉक्स') || q.includes('बक्से') || q.includes('बग') || q.includes('बग्स') ||
      q.includes('एरर') || q.includes('डिफेक्ट') || q.includes('कमियां') || q.includes('कमी') ||
      q.includes('क्रिटिकल') || q.includes('critical') || q.includes('severity');

    if (isBugQuery) {
      const isCriticalSpecific = 
        q.includes('critical') || q.includes('क्रिटिकल') || q.includes('हाई') || 
        q.includes('high') || q.includes('status') || q.includes('स्टेटस') || 
        q.includes('kitne') || q.includes('कितने') || q.includes('list') || q.includes('लिस्ट');

      const criticalList = qa.criticalBugsList || qa.openBugsList.filter(b => b.severity === 'Critical' || b.severity === 'High');
      const topBug = criticalList[0]?.title || 'Key defects';

      let spokenText = '';
      if (isCriticalSpecific && criticalList.length > 0) {
        spokenText = `Boss, there are ${qa.openBugsCount} open defects in total, with ${qa.criticalBugsCount} high or critical priority items. The most critical issue is ${topBug}.`;
      } else {
        spokenText = `Boss, QA reports ${qa.openBugsCount} open defects across workspaces, with ${qa.criticalBugsCount} critical items. Current pass rate is ${qa.passRate} percent.`;
      }

      let markdown = `### Defect & Critical Bug Status for Boss\n\n`;
      markdown += `*Workspace Inspection across **${qa.projectsCount} Projects** | Overall Pass Rate: **${qa.passRate}%***\n\n`;
      markdown += `- **Total Open Defects:** **${qa.openBugsCount}**\n`;
      markdown += `- **Critical & High Severity Defects:** <span style="color:#ef4444;font-weight:bold">**${qa.criticalBugsCount}**</span>\n\n`;

      if (criticalList.length > 0) {
        markdown += `#### Critical & High Severity Defects:\n\n`;
        markdown += `| Severity | Project Workspace | Defect Title | Status |\n`;
        markdown += `| :--- | :--- | :--- | :--- |\n`;
        criticalList.forEach(b => {
          markdown += `| <span style="color:#ef4444;font-weight:bold">${b.severity}</span> | **${b.project}** | ${b.title} | \`${b.status || 'Open'}\` |\n`;
        });
      } else {
        markdown += `> *No critical defects currently detected across workspaces, Boss. Quality health is optimal.*\n`;
      }

      return {
        spokenText,
        markdown,
        type: 'qa',
        actionSuggestion: { label: 'Open QA Bugs Workspace', targetApp: 'qa' }
      };
    }

    // 3. QA TEST EXECUTION & PASS RATE
    const isTestQuery = 
      q.includes('test') || q.includes('pass') || q.includes('fail') || 
      q.includes('block') || q.includes('qa') || q.includes('quality') ||
      q.includes('टेस्ट') || q.includes('पास') || q.includes('फेल') || q.includes('ब्लॉक');

    if (isTestQuery) {
      const spokenText = `Boss, there are ${qa.totalTests} test cases active with a ${qa.passRate} percent pass rate. ${qa.failedTests} tests are currently failing and ${qa.blockedTests} are blocked.`;

      let markdown = `### QA Test Execution Summary for Boss\n\n`;
      markdown += `| Metric | Count | Status |\n`;
      markdown += `| :--- | :--- | :--- |\n`;
      markdown += `| **Total Test Cases** | **${qa.totalTests}** | Active in workspaces |\n`;
      markdown += `| **Passed Tests** | <span style="color:#10b981;font-weight:bold">**${qa.passedTests}**</span> | ${qa.passRate}% Pass Rate |\n`;
      markdown += `| **Failed Tests** | <span style="color:#ef4444;font-weight:bold">**${qa.failedTests}**</span> | Attention required |\n`;
      markdown += `| **Blocked Tests** | <span style="color:#f59e0b;font-weight:bold">**${qa.blockedTests}**</span> | Blocked on dependencies |\n`;
      markdown += `| **Open Defects** | **${qa.openBugsCount}** | ${qa.criticalBugsCount} Critical/High |\n`;

      return {
        spokenText,
        markdown,
        type: 'qa',
        actionSuggestion: { label: 'Launch QA Test Workspace', targetApp: 'qa' }
      };
    }

    // 4. BUSINESS CONTRACTS & MRR (including Hindi "कांट्रैक्ट", "कॉन्ट्रैक्ट", "रिन्यूअल", "क्लाइंट", "एक्सपायर", "कब तक", "एमआरआर")
    const isContractQuery = 
      q.includes('contract') || q.includes('kabtak') || q.includes('expire') || 
      q.includes('renewal') || q.includes('mrr') || q.includes('client') || 
      q.includes('business') || q.includes('retainer') ||
      q.includes('कांट्रैक्ट') || q.includes('कॉन्ट्रैक्ट') || q.includes('रिन्यूअल') || 
      q.includes('क्लाइंट') || q.includes('एक्सपायर') || q.includes('कब तक') || 
      q.includes('एमआरआर') || q.includes('कमाई') || q.includes('पैसा');

    if (isContractQuery) {
      const expiringSoon = business.expiringSoonList;
      const allContracts = business.contracts;

      let spokenText = '';
      if (expiringSoon.length > 0) {
        const topExp = expiringSoon[0];
        spokenText = `Boss, we have ${allContracts.length} active client accounts generating ${business.totalMRR.toLocaleString()} dollars monthly recurring revenue. Notice: ${topExp.client} expires in ${topExp.daysRemaining} days on ${topExp.endDate}.`;
      } else {
        spokenText = `Boss, all ${allContracts.length} enterprise accounts are active with ${business.totalMRR.toLocaleString()} dollars monthly recurring revenue. There are no contract expirations in the next 30 days.`;
      }

      let markdown = `### Business Contracts & Revenue Report for Boss\n\n`;
      markdown += `*Live telemetry across **${allContracts.length} Client Accounts** | Portfolio MRR: **$${business.totalMRR.toLocaleString()}/mo***\n\n`;

      if (expiringSoon.length > 0) {
        markdown += `> **Contracts Expiring Within 30 Days (${expiringSoon.length} Accounts):**\n\n`;
        expiringSoon.forEach(c => {
          markdown += `- **${c.client}** (${c.account}): Expires on **${c.endDate}** (**${c.daysRemaining} days remaining**) — Retainer: **$${(c.value || 0).toLocaleString()}/${c.cycle}**\n`;
        });
        markdown += `\n---\n`;
      }

      markdown += `#### Client Accounts & Renewal Schedule:\n\n`;
      markdown += `| Client | Contract End Date | Remaining Time | Retainer Value | SLA Tier |\n`;
      markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;
      allContracts.forEach(c => {
        const badge = c.isExpired 
          ? `Expired (${Math.abs(c.daysRemaining)}d)` 
          : c.isExpiringSoon 
            ? `**${c.daysRemaining} days left**` 
            : `${c.daysRemaining} days`;
        markdown += `| **${c.client}** | ${c.endDate} | ${badge} | $${(c.value || 0).toLocaleString()}/${c.cycle} | ${c.sla} |\n`;
      });

      return {
        spokenText,
        markdown,
        type: 'business',
        actionSuggestion: { label: 'Launch Business Command Center', targetApp: 'business' }
      };
    }

    // 5. SALES SDR (HARVEY)
    const isSalesQuery = 
      q.includes('sales') || q.includes('lead') || q.includes('prospect') || 
      q.includes('outbox') || q.includes('harvey') || q.includes('sdr') || 
      q.includes('email') || q.includes('draft') ||
      q.includes('लीड') || q.includes('लीड्स') || q.includes('हार्वे') || 
      q.includes('ईमेल') || q.includes('ड्राफ्ट');

    if (isSalesQuery) {
      const spokenText = `Boss, SDR Harvey has identified ${sales.totalLeads} prospects, and ${sales.pendingApprovalsCount} personalized email drafts are ready on the decisions desk for your approval.`;

      let markdown = `### Autonomous Sales SDR Briefing for Boss\n\n`;
      markdown += `- **Total Prospects Discovered:** **${sales.totalLeads}**\n`;
      markdown += `- **Drafts Pending Approval:** **${sales.pendingApprovalsCount} emails**\n`;
      markdown += `- **Approved & Sent Emails:** **${sales.approvedCount}**\n\n`;

      if (sales.recentLeads.length > 0) {
        markdown += `#### Recent Prospect Accounts:\n`;
        sales.recentLeads.forEach(l => {
          markdown += `- **${l.name}** \`${l.domain}\`\n`;
        });
      }

      return {
        spokenText,
        markdown,
        type: 'sales',
        actionSuggestion: { label: 'Open Decisions Desk', targetApp: 'sales' }
      };
    }

    // 6. DEFAULT / GENERAL BRIEFING
    const spokenText = `Boss, here is the platform summary. Business Command manages ${business.totalMRR.toLocaleString()} dollars MRR across ${business.totalContracts} accounts. QA reports ${qa.totalTests} tests with a ${qa.passRate} percent pass rate, and SDR Harvey has ${sales.totalLeads} prospects.`;

    let markdown = `### InfratechAI Platform Executive Briefing for Boss\n\n`;
    markdown += `*Live telemetry synchronized across all applications for **Boss***\n\n`;
    markdown += `#### 1. Business Command Center\n`;
    markdown += `- **Active Client Accounts:** ${business.totalContracts}\n`;
    markdown += `- **Portfolio MRR:** **$${business.totalMRR.toLocaleString()}/month**\n`;
    markdown += `- **Renewals in < 30 Days:** **${business.expiringSoonCount} contracts**\n\n`;
    markdown += `#### 2. Quality Engineering (QA Manager)\n`;
    markdown += `- **Active Workspaces:** ${qa.projectsCount}\n`;
    markdown += `- **Test Execution Pass Rate:** **${qa.passRate}%** (${qa.passedTests} passed / ${qa.totalTests} total)\n`;
    markdown += `- **Defect Tally:** **${qa.openBugsCount} open** (${qa.criticalBugsCount} Critical/High)\n\n`;
    markdown += `#### 3. Autonomous Sales SDR (Harvey)\n`;
    markdown += `- **Discovered Prospects:** ${sales.totalLeads}\n`;
    markdown += `- **Decisions Desk Pending:** **${sales.pendingApprovalsCount} email drafts**\n\n`;
    markdown += `> *Direct executive command line active, Boss. Ask any question in Hindi or English for immediate details.*`;

    return {
      spokenText,
      markdown,
      type: 'overview'
    };
  },

  /**
   * Evaluates query and generates strict, authoritative response addressing user as "Boss".
   * First tries Google Gemini live model; gracefully falls back to intelligent multi-lingual engine.
   */
  async processQuery(rawQuery, liveContext, options = {}) {
    const agent = options.agent || 'jarvis';
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const preferredModel = options.model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash';
        const aiResponse = await this.callGemini(rawQuery, liveContext, { preferredModel, agent });
        if (aiResponse && (aiResponse.spokenText || aiResponse.markdown)) {
          return aiResponse;
        }
      } catch (err) {
        console.warn("AI Dev Gemini call failed, falling back to local engine:", err);
      }
    }

    return this.processFallbackQuery(rawQuery, liveContext, { agent });
  }
};

// Pre-resolve and lock voices as soon as speech synthesis engine reports voices changed
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    aiDevService.cachedJarvisVoice = null;
    aiDevService.cachedFridayVoice = null;
    aiDevService.getJarvisMaleVoice();
    aiDevService.getFridayFemaleVoice();
  };
}

export default aiDevService;
