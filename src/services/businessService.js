/**
 * InfratechAI Business Command Center Service
 * Manages enterprise client contracts, expiration dates, renewal pipelines,
 * retainers/MRR, SLA agreements, and project descriptions.
 */

const STORAGE_PREFIX = 'infratechai_business_contracts_';

const SEED_CONTRACTS = [];

export const businessService = {
  getContracts(userId = 'default') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Cleanse mock seed items so only genuine client contracts created by the user remain
      const MOCK_IDS = ['ctr_apex_cloud', 'ctr_finpulse_bank', 'ctr_medvault_hipaa', 'ctr_omnicart_ai'];
      const MOCK_NAMES = ['Apex Logistics Inc.', 'FinPulse Technologies', 'MedVault Healthcare Systems', 'OmniCart Commerce'];

      const realContracts = parsed.filter(c => 
        !MOCK_IDS.includes(c?.id) &&
        !MOCK_NAMES.includes(c?.clientName)
      );

      if (realContracts.length !== parsed.length) {
        this.saveContracts(realContracts, userId);
      }
      return realContracts;
    } catch {
      return [];
    }
  },

  saveContracts(contracts, userId = 'default') {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(contracts));
    } catch (e) {
      console.error('Failed to save business contracts:', e);
    }
  },

  addContract(contractData, userId = 'default') {
    const contracts = this.getContracts(userId);
    const newContract = {
      id: `ctr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clientName: contractData.clientName || 'Untitled Client',
      accountName: contractData.accountName || `${contractData.clientName} Account`,
      contactPerson: contractData.contactPerson || '',
      contactEmail: contractData.contactEmail || '',
      contractValue: Number(contractData.contractValue) || 10000,
      currency: contractData.currency || 'USD',
      billingCycle: contractData.billingCycle || 'monthly',
      startDate: contractData.startDate || new Date().toISOString().split('T')[0],
      endDate: contractData.endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: contractData.status || 'active',
      slaTier: contractData.slaTier || '24h Standard Enterprise SLA',
      qaProjectId: contractData.qaProjectId || null,
      techStack: Array.isArray(contractData.techStack) ? contractData.techStack : (contractData.techStack ? contractData.techStack.split(',').map(s => s.trim()) : []),
      description: contractData.description || 'Enterprise technology service contract and deliverables agreement.',
      scopeOfWork: Array.isArray(contractData.scopeOfWork) ? contractData.scopeOfWork : [],
      deliverables: Array.isArray(contractData.deliverables) ? contractData.deliverables : [],
      renewalNotes: contractData.renewalNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newContract, ...contracts];
    this.saveContracts(updated, userId);
    return newContract;
  },

  updateContract(id, updates, userId = 'default') {
    const contracts = this.getContracts(userId);
    const updated = contracts.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    this.saveContracts(updated, userId);
    return updated.find(c => c.id === id);
  },

  deleteContract(id, userId = 'default') {
    const contracts = this.getContracts(userId);
    const updated = contracts.filter(c => c.id !== id);
    this.saveContracts(updated, userId);
    return updated;
  },

  renewContract(id, months = 12, userId = 'default') {
    const contracts = this.getContracts(userId);
    const updated = contracts.map(c => {
      if (c.id === id) {
        const currentEnd = new Date(c.endDate);
        const validEnd = isNaN(currentEnd.getTime()) ? new Date() : currentEnd;
        validEnd.setMonth(validEnd.getMonth() + Number(months));
        return {
          ...c,
          endDate: validEnd.toISOString().split('T')[0],
          status: 'active',
          updatedAt: new Date().toISOString(),
          renewalNotes: `${c.renewalNotes ? c.renewalNotes + ' | ' : ''}Renewed for +${months} months on ${new Date().toLocaleDateString()}`
        };
      }
      return c;
    });
    this.saveContracts(updated, userId);
    return updated.find(c => c.id === id);
  },

  /**
   * Calculates days remaining until expiration.
   * Returns positive number for future dates, negative for overdue.
   */
  getDaysRemaining(endDateStr) {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    if (isNaN(end.getTime())) return 0;
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Computes portfolio-wide metrics.
   */
  getPortfolioMetrics(contracts = []) {
    let totalMRR = 0;
    let totalValue = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let activeCount = 0;

    contracts.forEach(c => {
      const days = this.getDaysRemaining(c.endDate);
      const val = Number(c.contractValue) || 0;

      if (c.billingCycle === 'monthly') {
        totalMRR += val;
        totalValue += val * 12;
      } else if (c.billingCycle === 'quarterly') {
        totalMRR += Math.round(val / 3);
        totalValue += val * 4;
      } else if (c.billingCycle === 'annual') {
        totalMRR += Math.round(val / 12);
        totalValue += val;
      } else {
        totalValue += val;
        totalMRR += Math.round(val / 6);
      }

      if (days < 0) {
        expiredCount++;
      } else if (days <= 30) {
        expiringSoonCount++;
      } else {
        activeCount++;
      }
    });

    return {
      totalContracts: contracts.length,
      activeCount,
      expiringSoonCount,
      expiredCount,
      totalMRR,
      totalValue,
      avgContractValue: contracts.length ? Math.round(totalValue / contracts.length) : 0
    };
  }
};
