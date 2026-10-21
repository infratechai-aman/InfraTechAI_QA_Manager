/**
 * InfratechAI Business Command Center Service
 * Manages enterprise client contracts, expiration dates, renewal pipelines,
 * retainers/MRR, SLA agreements, and project descriptions.
 */

const STORAGE_PREFIX = 'infratechai_business_contracts_';

const SEED_CONTRACTS = [
  {
    id: 'ctr_apex_cloud',
    clientName: 'Apex Logistics Inc.',
    accountName: 'Apex Cloud Modernization & Fleet QA',
    contactPerson: 'David Vance (VP of Engineering)',
    contactEmail: 'david.vance@apexlogistics.io',
    contractValue: 24500,
    currency: 'USD',
    billingCycle: 'monthly', // 'monthly' | 'quarterly' | 'annual' | 'fixed'
    startDate: '2026-02-01',
    endDate: '2026-11-15', // Expiring in ~24 days
    status: 'expiring_soon', // 'active' | 'expiring_soon' | 'renewed' | 'negotiating'
    slaTier: '24h Mission-Critical (99.9%)',
    qaProjectId: 'p_apex_dispatch',
    techStack: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'],
    description: 'Enterprise fleet dispatch automation, legacy backend modernization to microservices, and end-to-end regression QA testing across real-time GPS telemetry pipelines.',
    scopeOfWork: [
      'Core Fleet Dispatch REST API overhaul',
      'Automated QA test suite maintenance (>150 test scenarios)',
      'Sub-50ms GPS latency SLA verification',
      '24/7 Severity-1 hotfix escalation guarantee'
    ],
    deliverables: [
      { id: 'd1', title: 'Phase 1: API Gateway Migration', completed: true },
      { id: 'd2', title: 'Phase 2: Fleet Telemetry Engine', completed: true },
      { id: 'd3', title: 'Phase 3: Automated QA Regression Suite', completed: false },
      { id: 'd4', title: 'Phase 4: Multi-region Failover Deployment', completed: false }
    ],
    renewalNotes: 'David requested an extension proposal for another 12 months with expanded AI routing scope.'
  },
  {
    id: 'ctr_finpulse_bank',
    clientName: 'FinPulse Technologies',
    accountName: 'FinPulse Core Banking Engine & Security QA',
    contactPerson: 'Sarah Jenkins (Chief Technology Officer)',
    contactEmail: 's.jenkins@finpulse.bank',
    contractValue: 48000,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2026-01-10',
    endDate: '2026-12-31', // Expiring in ~70 days
    status: 'active',
    slaTier: '4h Financial SLA (99.99%)',
    qaProjectId: 'p_finpulse_core',
    techStack: ['Go', 'TypeScript', 'Kubernetes', 'CockroachDB', 'PCI-DSS'],
    description: 'Next-generation core payment ledger processing 25,000 TPS, automated reconciliation engine, biometric multi-factor authentication, and SOC-2 / PCI-DSS compliance verification.',
    scopeOfWork: [
      'Distributed ledger high-concurrency stress testing',
      'Payment gateway idempotency and race condition QA',
      'Quarterly penetration audit mitigation',
      'Biometric auth workflow integration'
    ],
    deliverables: [
      { id: 'd1', title: 'Ledger Concurrency & Load Benchmarks', completed: true },
      { id: 'd2', title: 'PCI-DSS Attestation Artifacts', completed: true },
      { id: 'd3', title: 'Zero-Downtime Database Migration', completed: true },
      { id: 'd4', title: 'Instant Settlement Rail Launch', completed: false }
    ],
    renewalNotes: 'Annual contract renewal scheduled for December. Client exploring 2-year enterprise lock-in.'
  },
  {
    id: 'ctr_medvault_hipaa',
    clientName: 'MedVault Healthcare Systems',
    accountName: 'MedVault HIPAA Patient Portal & EHR QA',
    contactPerson: 'Dr. Michael Chen (Head of Digital Health)',
    contactEmail: 'mchen@medvaulthealth.org',
    contractValue: 18500,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2026-04-01',
    endDate: '2026-10-31', // Expiring in ~9 days!
    status: 'expiring_soon',
    slaTier: '12h Healthcare Compliance SLA',
    qaProjectId: 'p_medvault_ehr',
    techStack: ['Python', 'FastAPI', 'React Native', 'FHIR/HL7', 'AWS HealthLake'],
    description: 'Patient records interoperability portal connecting regional clinics with FHIR standards, telemedicine WebRTC video consults, and strict HIPAA encryption audit workflows.',
    scopeOfWork: [
      'FHIR v4 medical record interoperability testing',
      'HIPAA audit trail logging verification',
      'Encrypted messaging & video consult QA',
      'Doctor-patient notification system'
    ],
    deliverables: [
      { id: 'd1', title: 'FHIR v4 Client Validation', completed: true },
      { id: 'd2', title: 'Telemedicine WebRTC Audio/Video Testing', completed: true },
      { id: 'd3', title: 'EHR Export CSV/PDF Engine', completed: false }
    ],
    renewalNotes: 'URGENT: Contract terminates end of month. Contract renewal addendum sent on Oct 18.'
  },
  {
    id: 'ctr_omnicart_ai',
    clientName: 'OmniCart Commerce',
    accountName: 'OmniCart AI Recommendations & Black Friday QA',
    contactPerson: 'Elena Rostova (VP Product)',
    contactEmail: 'elena@omnicart.shop',
    contractValue: 32000,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2026-05-15',
    endDate: '2027-05-14', // Expiring in ~200+ days
    status: 'active',
    slaTier: '24h Standard Enterprise SLA',
    qaProjectId: 'p_omnicart_web',
    techStack: ['Next.js', 'Python', 'Redis', 'ElasticSearch', 'Stripe'],
    description: 'Personalized e-commerce recommendation engine, cart abandonment recovery pipelines, and Black Friday high-concurrency surge test architecture handling 500,000 simultaneous checkouts.',
    scopeOfWork: [
      'Vector search product recommendation embedding pipeline',
      'Black Friday checkout stress testing (500k RPS)',
      'Dynamic promo code engine & anti-abuse QA',
      'Global multi-currency checkout flows'
    ],
    deliverables: [
      { id: 'd1', title: 'Recommendation Neural Model v1', completed: true },
      { id: 'd2', title: 'High-Volume Black Friday Simulation', completed: true },
      { id: 'd3', title: 'Multi-Currency Cart Localization', completed: true },
      { id: 'd4', title: 'Inventory Reservation Webhook Suite', completed: false }
    ],
    renewalNotes: 'Multi-year agreement with automatic annual price adjustment of 5%.'
  }
];

export const businessService = {
  getContracts(userId = 'default') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      if (!raw) {
        // Initialize with default high-impact portfolio
        this.saveContracts(SEED_CONTRACTS, userId);
        return SEED_CONTRACTS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveContracts(SEED_CONTRACTS, userId);
        return SEED_CONTRACTS;
      }
      return parsed;
    } catch {
      return SEED_CONTRACTS;
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
