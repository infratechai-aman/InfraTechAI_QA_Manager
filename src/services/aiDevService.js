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

  /**
   * Retrieves all available system voices with caching
   */
  getAvailableVoices() {
    if (!this.isSpeechSupported()) return [];
    return window.speechSynthesis.getVoices();
  },

  /**
   * Selects a strictly male, high-energy JARVIS voice.
   * Eliminates all female voices and prioritizes:
   * 1. British English Male (Microsoft George, Ryan, Oliver, Google UK English Male - true Jarvis)
   * 2. Crisp, Energetic US English Male (Microsoft Guy, David, Mark)
   * 3. Authoritative Indian English Male (Microsoft Prabhat, Ravi)
   * 4. Hindi Male (Microsoft Madhur, Hemant)
   */
  getJarvisMaleVoice(text = '') {
    if (!this.isSpeechSupported()) return null;
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
    const candidateVoices = nonFemaleVoices.length > 0 ? nonFemaleVoices : voices;

    const hasHindiScript = /[\u0900-\u097F]/.test(text || '');

    // If text has Devanagari Hindi characters, prioritize male Indian/Hindi voice
    if (hasHindiScript) {
      const hindiMale = candidateVoices.find(v => 
        (v.lang.includes('hi') || v.name.includes('Hindi')) && 
        (v.name.includes('Madhur') || v.name.includes('Hemant') || v.name.toLowerCase().includes('male'))
      ) || candidateVoices.find(v => 
        (v.lang.includes('en-IN') || v.name.includes('India')) && 
        (v.name.includes('Prabhat') || v.name.includes('Ravi') || v.name.toLowerCase().includes('male'))
      ) || candidateVoices.find(v => (v.lang.includes('hi') || v.name.includes('Hindi')) && isNotFemale(v));

      if (hindiMale) return hindiMale;
    }

    // JARVIS SEARCH PRIORITY (Energetic, Crisp Men's Voices):
    // Tier 1: British English Male (Authentic Tony Stark's JARVIS accent - George, Ryan, Oliver, UK Male)
    const jarvisBritish = candidateVoices.find(v => 
      (v.lang.startsWith('en-GB') || v.name.includes('United Kingdom') || v.name.includes('UK')) &&
      (v.name.includes('George') || v.name.includes('Ryan') || v.name.includes('Oliver') || v.name.toLowerCase().includes('male'))
    );
    if (jarvisBritish) return jarvisBritish;

    // Tier 2: High-Tech Energetic US English Male (Microsoft Guy Natural, David, Mark)
    const jarvisTechMale = candidateVoices.find(v => 
      v.name.includes('Guy') || 
      v.name.includes('George') || 
      v.name.includes('David') || 
      v.name.includes('Mark') || 
      v.name.includes('Ryan') ||
      (v.name.toLowerCase().includes('male') && v.lang.startsWith('en'))
    );
    if (jarvisTechMale) return jarvisTechMale;

    // Tier 3: Crisp Indian English Male (Prabhat, Ravi)
    const indianMale = candidateVoices.find(v => 
      (v.lang.includes('en-IN') || v.name.includes('India')) && 
      (v.name.includes('Prabhat') || v.name.includes('Ravi') || v.name.toLowerCase().includes('male'))
    );
    if (indianMale) return indianMale;

    // Tier 4: Any voice with explicit 'Male' token in name that is not blacklisted
    const anyExplicitMale = candidateVoices.find(v => v.name.toLowerCase().includes('male'));
    if (anyExplicitMale) return anyExplicitMale;

    // Tier 5: Any English voice that is safe from female blacklist
    const safeEnglish = candidateVoices.find(v => v.lang.startsWith('en'));
    if (safeEnglish) return safeEnglish;

    return candidateVoices[0] || null;
  },

  /**
   * Alias for backward compatibility
   */
  getAuthoritativeVoice(text = '') {
    return this.getJarvisMaleVoice(text);
  },

  /**
   * Speaks given text aloud with high energetic JARVIS tone.
   * Uses brisk cadence (rate 1.14), crisp bright pitch (pitch 1.04), and full volume.
   */
  speak(text, { onStart, onEnd, onError, rate = 1.14, pitch = 1.04 } = {}) {
    if (!this.isSpeechSupported()) {
      if (onError) onError(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech immediately
    window.speechSynthesis.cancel();

    // Clean text of markdown characters, emojis, and symbols for crisp delivery
    const cleanSpeechText = (text || '')
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

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = rate;      // 1.14 - High energetic, rapid-fire, crisp JARVIS cadence
    utterance.pitch = pitch;    // 1.04 - Confident, vibrant resonant AI frequency
    utterance.volume = 1.0;

    const jarvisVoice = this.getJarvisMaleVoice(cleanSpeechText);
    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
      utterance.lang = jarvisVoice.lang || 'en-GB';
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if (this.isSpeechSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
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
  async callGemini(query, liveContext, { preferredModel = 'gemini-3.5-flash' } = {}) {
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

    const systemPrompt = `You are JARVIS / AI DEV, the high-energy executive Technical Lead & Platform Copilot of InfratechAI.
You address the user with supreme loyalty, crisp efficiency, and electric high energy as "Boss" ("At your service Boss!", "All systems green Boss!", "On it Boss!").
Your tone is razor-sharp, energetic, confident, crisp, and high-tempo like Tony Stark's JARVIS.
Zero sluggishness, maximum bandwidth and precision.

You have access to 100% REAL-TIME LIVE TELEMETRY from all InfratechAI modules:
1. QA Manager (Total tests, pass rate %, failed/blocked tests, total defects, critical defects count, and full list of open bugs with titles, severity, and project).
2. Business Command Center (Enterprise client contracts, expiration dates, days remaining, SLAs, and monthly recurring revenue MRR).
3. Autonomous Sales SDR Harvey (Prospects, leads, and pending email drafts awaiting approval).

CRITICAL DOMAIN RULES:
- The user/Boss may speak or type in Hindi (Devanagari script), Hinglish (Roman Hindi script), or English.
- SPEECH-TO-TEXT CORRECTION: When Boss speaks in Hindi, speech recognition frequently transcribes "bugs" as "बॉक्स" (boxes) or "बग्स" or "बग" or "एरर" or "डिफेक्ट". You MUST recognize that Boss is referring to software bugs/defects in QA Manager!
- Answer the EXACT specific question Boss asked! Do NOT give a generic platform summary if Boss asked specifically about bugs, contracts, pass rates, or status.
- If Boss asks how many critical bugs exist and their status (e.g. "कितने क्रिटिकल बॉक्स है उसका स्टेटस बता दे"), state the exact count of critical bugs AND list the critical bugs with their titles and projects!
- Return your response strictly as a JSON object with:
  {
    "spokenText": "high-energy, punchy spoken summary in Hindi/Hinglish (matching Boss's language) designed for voice Text-to-Speech (max 2 energetic sentences, NO markdown symbols, NO asterisks, NO bullet points, NO emojis)",
    "markdown": "comprehensive response with clean markdown formatting, tables, and badges",
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
  processFallbackQuery(rawQuery, liveContext) {
    const q = (rawQuery || '').toLowerCase().trim();
    const ctx = liveContext || {};
    const qa = ctx.qa || { totalTests: 0, passedTests: 0, failedTests: 0, blockedTests: 0, passRate: 0, openBugsCount: 0, criticalBugsCount: 0, openBugsList: [], criticalBugsList: [], projectsCount: 0 };
    const business = ctx.business || { totalContracts: 0, contracts: [], expiringSoonCount: 0, expiringSoonList: [], totalMRR: 0 };
    const sales = ctx.sales || { totalLeads: 0, pendingApprovalsCount: 0, approvedCount: 0, recentLeads: [] };

    // 1. GREETINGS
    const isGreeting = 
      q === 'helo' || q === 'hello' || q === 'hi' || q === 'hey' || 
      q === 'namaste' || q === 'नमस्ते' || q === 'हेलो' || q === 'हाय' || 
      q === 'boss' || q === 'बॉस' || q === 'sun' || q === 'suno' || q === 'सुनो' ||
      q.includes('kya hal') || q.includes('kaise ho') || q.includes('हाल चाल');

    if (isGreeting) {
      const spokenText = `Systems online, Boss! JARVIS AI command channel active at full telemetry sync! Say the word Boss: QA test suites, enterprise contracts, or sales pipeline?`;
      
      const markdown = `### ⚡ JARVIS AI DEV • Systems Online & Synchronized

Direct executive command line active. Live telemetry is synchronized across all modules for **Boss**:

- 🏢 **Business Command Center:** **${business.totalContracts} Active Contracts** ($${business.totalMRR.toLocaleString()}/mo MRR)
- 🧪 **QA Manager:** **${qa.totalTests} Total Tests** (${qa.passRate}% pass rate, **${qa.openBugsCount} defects**)
- 🤖 **Sales SDR (Harvey):** **${sales.totalLeads} Prospects** (**${sales.pendingApprovalsCount} pending outbox drafts**)

> 🎙️ **High-Energetic Voice Channel Active, Boss!** Ask me in Hindi or English: *"Kiska contract kabtak hai?"*, *"Critical bugs dikhao"*, or *"Platform briefing do"*. Ready for your command!`;

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
        spokenText = `Alert Boss! Radar sweep complete: Total ${qa.openBugsCount} open defects detected, with ${qa.criticalBugsCount} critical severity flags requiring priority neutralization! Top priority is ${topBug}. Standing by for orders Boss!`;
      } else {
        spokenText = `Attention Boss! QA telemetry live: Total ${qa.openBugsCount} defects detected, with ${qa.criticalBugsCount} critical severity flags. Pass rate is holding steady at ${qa.passRate} percent Boss!`;
      }

      let markdown = `### 🚨 QA Defect & Critical Bug Radar for Boss\n\n`;
      markdown += `*Live Inspection of **${qa.projectsCount} Workspaces** | Pass Rate: **${qa.passRate}%***\n\n`;
      markdown += `- **Total Open Defects:** **${qa.openBugsCount}**\n`;
      markdown += `- **Critical & High Severity Defects:** <span style="color:#ef4444">**${qa.criticalBugsCount}**</span>\n\n`;

      if (criticalList.length > 0) {
        markdown += `#### 📋 Critical & High Severity Bugs List:\n\n`;
        markdown += `| Severity | Project Workspace | Defect Title | Status |\n`;
        markdown += `| :--- | :--- | :--- | :--- |\n`;
        criticalList.forEach(b => {
          markdown += `| <span style="color:#ef4444;font-weight:bold">${b.severity}</span> | **${b.project}** | ${b.title} | \`${b.status || 'Open'}\` |\n`;
        });
      } else {
        markdown += `> ✨ *No critical defects detected across workspaces, Boss! Quality index is optimal.*\n`;
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
      const spokenText = `All diagnostics green, Boss! Total ${qa.totalTests} tests active with a ${qa.passRate} percent pass rate! ${qa.failedTests} tests failed and ${qa.blockedTests} blocked—standing by to execute workspace test suites Boss!`;

      let markdown = `### 🧪 QA Test Execution Briefing for Boss\n\n`;
      markdown += `| Metric | Count | Health Status |\n`;
      markdown += `| :--- | :--- | :--- |\n`;
      markdown += `| **Total Test Cases** | **${qa.totalTests}** | Active execution workspace |\n`;
      markdown += `| **Passed Tests** | <span style="color:#10b981">**${qa.passedTests}**</span> | ${qa.passRate}% Pass Rate |\n`;
      markdown += `| **Failed Tests** | <span style="color:#ef4444">**${qa.failedTests}**</span> | Action needed |\n`;
      markdown += `| **Blocked Tests** | <span style="color:#f59e0b">**${qa.blockedTests}**</span> | Dependencies pending |\n`;
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
        spokenText = `Contract telemetry engaged, Boss! We have ${allContracts.length} active enterprise accounts generating ${business.totalMRR.toLocaleString()} dollars MRR! Urgent alert: ${topExp.client} expires in ${topExp.daysRemaining} days on ${topExp.endDate}. Standing by for renewal instructions Boss!`;
      } else {
        spokenText = `All systems nominal, Boss! Total ${allContracts.length} enterprise accounts active. Zero expirations in the next 30 days, and ${business.totalMRR.toLocaleString()} dollars MRR is securely locked Boss!`;
      }

      let markdown = `### 🏢 Real-Time Business Contracts Report for Boss\n\n`;
      markdown += `*Live telemetry across **${allContracts.length} Client Accounts** | Portfolio MRR: **$${business.totalMRR.toLocaleString()}/mo***\n\n`;

      if (expiringSoon.length > 0) {
        markdown += `> 🚨 **Critical Renewal Attention (${expiringSoon.length} Contracts < 30 Days):**\n\n`;
        expiringSoon.forEach(c => {
          markdown += `- **${c.client}** (${c.account}): Expires on **${c.endDate}** (**${c.daysRemaining} days left!**) — Value: **$${(c.value || 0).toLocaleString()}/${c.cycle}**\n`;
        });
        markdown += `\n---\n`;
      }

      markdown += `#### 📋 Active Client Contracts:\n\n`;
      markdown += `| Client | Contract End Date | Days Remaining | Retainer | SLA Guarantee |\n`;
      markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;
      allContracts.forEach(c => {
        const badge = c.isExpired 
          ? `❌ Expired (${Math.abs(c.daysRemaining)}d)` 
          : c.isExpiringSoon 
            ? `⚠️ **${c.daysRemaining} days**` 
            : `✅ ${c.daysRemaining} days`;
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
      const spokenText = `High-energy dispatch, Boss! Autonomous SDR Harvey has locked onto ${sales.totalLeads} enterprise prospects, with ${sales.pendingApprovalsCount} personalized drafts queued for your clearance on the decisions desk Boss!`;

      let markdown = `### 🤖 Autonomous Sales SDR Briefing for Boss\n\n`;
      markdown += `- **Total Prospects Discovered:** **${sales.totalLeads}**\n`;
      markdown += `- **Decisions Desk Approvals Pending:** **${sales.pendingApprovalsCount} Drafts**\n`;
      markdown += `- **Approved & Sent Emails:** **${sales.approvedCount}**\n\n`;

      if (sales.recentLeads.length > 0) {
        markdown += `#### 🎯 Recent Target Enterprise Accounts:\n`;
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
    const spokenText = `Full platform diagnostics live, Boss! Business Command holding ${business.totalMRR.toLocaleString()} dollars MRR across ${business.totalContracts} accounts. QA managing ${qa.totalTests} tests at ${qa.passRate} percent pass rate. Sales SDR armed with ${sales.totalLeads} prospects. All engines firing at full power Boss!`;

    let markdown = `### ⚡ InfratechAI Platform: Executive Briefing for Boss\n\n`;
    markdown += `*Live unified telemetry synchronized across all apps for **Boss***\n\n`;
    markdown += `#### 1. 🏢 Business Command Center\n`;
    markdown += `- **Active Client Accounts:** ${business.totalContracts}\n`;
    markdown += `- **Portfolio MRR:** **$${business.totalMRR.toLocaleString()}/month**\n`;
    markdown += `- **Renewals in < 30 Days:** **${business.expiringSoonCount} contracts**\n\n`;
    markdown += `#### 2. 🧪 Quality Engineering (QA Manager)\n`;
    markdown += `- **Active Workspaces:** ${qa.projectsCount}\n`;
    markdown += `- **Test Execution Pass Rate:** **${qa.passRate}%** (${qa.passedTests} passed / ${qa.totalTests} total)\n`;
    markdown += `- **Defect Tally:** **${qa.openBugsCount} open** (${qa.criticalBugsCount} Critical/High)\n\n`;
    markdown += `#### 3. 🤖 Autonomous Sales SDR (Harvey)\n`;
    markdown += `- **Discovered Prospects:** ${sales.totalLeads}\n`;
    markdown += `- **Decisions Desk Pending:** **${sales.pendingApprovalsCount} email drafts**\n\n`;
    markdown += `> 🫡 *Direct command line active, Boss! Kisi bhi metric ya contract ki detail ke liye bas command kijiye.*`;

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
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const preferredModel = options.model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash';
        const aiResponse = await this.callGemini(rawQuery, liveContext, { preferredModel });
        if (aiResponse && (aiResponse.spokenText || aiResponse.markdown)) {
          return aiResponse;
        }
      } catch (err) {
        console.warn("AI Dev Gemini call failed, falling back to local engine:", err);
      }
    }

    return this.processFallbackQuery(rawQuery, liveContext);
  }
};
