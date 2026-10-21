/**
 * InfratechAI AI Dev Service
 * Technical Lead & Autonomous Copilot with complete real-time awareness
 * of QA Manager, Sales Manager (Harvey), and Business Command Center.
 * Includes Web Speech synthesis audio engine to speak answers aloud in real-time.
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
   * Speaks given text aloud using the best available voice (Hindi/English).
   */
  speak(text, { onStart, onEnd, onError, rate = 1.05, pitch = 1.0, lang = 'hi-IN' } = {}) {
    if (!this.isSpeechSupported()) {
      if (onError) onError(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean text of markdown characters for smooth speaking
    const cleanSpeechText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\|/g, ', ')
      .replace(/(\r\n|\n|\r)/gm, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
    const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
    const englishVoice = voices.find(v => v.lang.startsWith('en'));

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    } else if (indianVoice) {
      utterance.voice = indianVoice;
    } else if (englishVoice) {
      utterance.voice = englishVoice;
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
      user: currentUser?.displayName || currentUser?.email || 'Engineer',
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
          project: projects.find(p => p.id === b.projectId)?.name || 'QA'
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
   * Evaluates query and generates comprehensive live response with spoken summary.
   */
  processQuery(rawQuery, liveContext) {
    const q = (rawQuery || '').toLowerCase();
    const ctx = liveContext;

    // A. Query about Contracts, Expiration Dates, Renewals, Kiska contract kabtak hai
    if (
      q.includes('contract') || 
      q.includes('kabtak') || 
      q.includes('expire') || 
      q.includes('renewal') || 
      q.includes('mrr') || 
      q.includes('client') || 
      q.includes('business') ||
      q.includes('description') ||
      q.includes('retainer')
    ) {
      const expiringSoon = ctx.business.expiringSoonList;
      const allContracts = ctx.business.contracts;

      let spokenText = '';
      if (expiringSoon.length > 0) {
        const topExp = expiringSoon[0];
        spokenText = `Aapke total ${allContracts.length} active client contracts hain. Sabse urgent contract ${topExp.client} ka hai, jo agle ${topExp.daysRemaining} dino me, yaani ${topExp.endDate} ko expire ho raha hai. Total monthly run rate ${ctx.business.totalMRR.toLocaleString()} dollars hai.`;
      } else {
        spokenText = `Aapke total ${allContracts.length} active client contracts hain aur filhaal koi bhi contract agle 30 dino me expire nahi ho raha hai. Total portfolio MRR ${ctx.business.totalMRR.toLocaleString()} dollars hai.`;
      }

      let markdown = `### 🏢 Real-Time Business Contracts & Renewal Deadlines\n\n`;
      markdown += `*Live telemetry fetched across **${allContracts.length} Client Accounts** | Portfolio MRR: **$${ctx.business.totalMRR.toLocaleString()}/mo***\n\n`;

      if (expiringSoon.length > 0) {
        markdown += `> ⚠️ **Immediate Renewal Attention Required (${expiringSoon.length} Contracts < 30 Days):**\n\n`;
        expiringSoon.forEach(c => {
          markdown += `- **${c.client}** (${c.account}): Expires on **${c.endDate}** (**${c.daysRemaining} days left!**) — Value: **$${(c.value || 0).toLocaleString()}/${c.cycle}**\n`;
        });
        markdown += `\n---\n`;
      }

      markdown += `#### 📋 All Active Enterprise Contracts:\n\n`;
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

      markdown += `\n**Project Descriptions & Scope:**\n`;
      allContracts.forEach(c => {
        markdown += `- **${c.client}**: ${c.description}\n`;
      });

      return {
        spokenText,
        markdown,
        type: 'business',
        actionSuggestion: {
          label: 'Open Business Command Center',
          targetApp: 'business'
        }
      };
    }

    // B. Query about QA, Bugs, Defects, Pass Rate, Test Execution
    if (
      q.includes('bug') || 
      q.includes('defect') || 
      q.includes('test') || 
      q.includes('pass') || 
      q.includes('fail') || 
      q.includes('block') || 
      q.includes('qa') || 
      q.includes('quality') ||
      q.includes('issue')
    ) {
      const qa = ctx.qa;
      const spokenText = `QA Manager me filhaal ${qa.totalTests} total tests hain, jinme se pass rate ${qa.passRate} percent hai. Total ${qa.openBugsCount} open bugs hain, jinme se ${qa.criticalBugsCount} bugs critical severity ke hain.`;

      let markdown = `### 🧪 Live QA Manager Telemetry\n\n`;
      markdown += `*Real-time inspection of **${qa.projectsCount} Workspaces** & **${qa.totalFiles} Test Suites***\n\n`;
      
      markdown += `| Metric | Count | Health Status |\n`;
      markdown += `| :--- | :--- | :--- |\n`;
      markdown += `| **Total Test Cases** | **${qa.totalTests}** | Active execution workspace |\n`;
      markdown += `| **Passed Tests** | <span style="color:#10b981">**${qa.passedTests}**</span> | ${qa.passRate}% Pass Rate |\n`;
      markdown += `| **Failed Tests** | <span style="color:#ef4444">**${qa.failedTests}**</span> | Action needed |\n`;
      markdown += `| **Blocked Tests** | <span style="color:#f59e0b">**${qa.blockedTests}**</span> | Pending dependencies |\n`;
      markdown += `| **Open Defects** | **${qa.openBugsCount}** | ${qa.criticalBugsCount} Critical/High |\n\n`;

      if (qa.openBugsList.length > 0) {
        markdown += `#### 🚨 Active Open Bugs:\n`;
        qa.openBugsList.forEach(b => {
          markdown += `- **[${b.severity}]** ${b.title} *(Project: ${b.project})*\n`;
        });
      } else {
        markdown += `> ✨ *No active open bugs detected across workspaces! Quality index is optimal.*\n`;
      }

      return {
        spokenText,
        markdown,
        type: 'qa',
        actionSuggestion: {
          label: 'Launch QA Manager',
          targetApp: 'qa'
        }
      };
    }

    // C. Query about Sales Manager (Harvey AI SDR), Outbox, Leads
    if (
      q.includes('sales') || 
      q.includes('lead') || 
      q.includes('prospect') || 
      q.includes('outbox') || 
      q.includes('harvey') || 
      q.includes('sdr') || 
      q.includes('email') || 
      q.includes('draft')
    ) {
      const sales = ctx.sales;
      const spokenText = `Sales Manager me ${sales.totalLeads} prospects discovered hain. Harvey Decisions Desk me abhi ${sales.pendingApprovalsCount} personalized email drafts aapke human approval ke liye pending hain.`;

      let markdown = `### 🤖 Autonomous Sales SDR (Harvey) Live Status\n\n`;
      markdown += `*Anti-AI Fluff Policy Active | Zero API Cost Engine*\n\n`;
      markdown += `- **Total Prospects Discovered:** **${sales.totalLeads}**\n`;
      markdown += `- **Decisions Desk Approvals Pending:** **${sales.pendingApprovalsCount} Drafts** ${sales.pendingApprovalsCount > 0 ? '⚠️ *(Review with A/R hotkeys)*' : '✅ *(Clean outbox)*'}\n`;
      markdown += `- **Approved & Sent Emails:** **${sales.approvedCount}**\n\n`;

      if (sales.recentLeads.length > 0) {
        markdown += `#### 🎯 Recent Target Accounts:\n`;
        sales.recentLeads.forEach(l => {
          markdown += `- **${l.name}** \`${l.domain}\`\n`;
        });
      }

      return {
        spokenText,
        markdown,
        type: 'sales',
        actionSuggestion: {
          label: 'Open Decisions Desk',
          targetApp: 'sales'
        }
      };
    }

    // D. General Platform Summary / Executive Briefing / Kya chal raha hai
    const spokenText = `InfratechAI platform ka live update: QA me ${ctx.qa.totalTests} tests hain aur ${ctx.qa.openBugsCount} open defects hain. Business Command Center me ${ctx.business.totalContracts} active contracts hain jinka monthly run rate ${ctx.business.totalMRR.toLocaleString()} dollars hai, aur ${ctx.business.expiringSoonCount} contracts renewal ke close hain. Sales outbox me ${ctx.sales.pendingApprovalsCount} drafts review ke liye ready hain.`;

    let markdown = `### ⚡ InfratechAI Platform: Unified Real-Time Briefing\n\n`;
    markdown += `*Live telemetry synchronized across all enterprise applications for **${ctx.user}***\n\n`;

    markdown += `#### 1. 🏢 Business Command Center\n`;
    markdown += `- **Active Client Accounts:** ${ctx.business.totalContracts}\n`;
    markdown += `- **Portfolio MRR:** **$${ctx.business.totalMRR.toLocaleString()}/month**\n`;
    markdown += `- **Renewals in < 30 Days:** **${ctx.business.expiringSoonCount} contracts**\n\n`;

    markdown += `#### 2. 🧪 Quality Engineering (QA Manager)\n`;
    markdown += `- **Active Workspaces:** ${ctx.qa.projectsCount}\n`;
    markdown += `- **Test Execution Pass Rate:** **${ctx.qa.passRate}%** (${ctx.qa.passedTests} passed / ${ctx.qa.totalTests} total)\n`;
    markdown += `- **Defect Tally:** **${ctx.qa.openBugsCount} open** (${ctx.qa.criticalBugsCount} Critical/High)\n\n`;

    markdown += `#### 3. 🤖 Autonomous Sales SDR (Harvey)\n`;
    markdown += `- **Discovered Prospects:** ${ctx.sales.totalLeads}\n`;
    markdown += `- **Decisions Desk Pending:** **${ctx.sales.pendingApprovalsCount} email drafts**\n\n`;

    markdown += `> 💡 *Ask me specific questions like: "Kiska contract kab expire ho raha hai?", "Critical bugs dikhao", ya "Sales pipeline status". Main real-time fetch karke bolkar bataunga!*`;

    return {
      spokenText,
      markdown,
      type: 'overview'
    };
  }
};
