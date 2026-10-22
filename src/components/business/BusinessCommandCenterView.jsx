import React, { useState, useMemo } from 'react';
import { 
  Building2, Calendar, DollarSign, Clock, AlertTriangle, 
  CheckCircle2, Plus, Search, Filter, ArrowUpRight, 
  FileText, Shield, Sparkles, Trash2, Edit3, RefreshCw, 
  CheckSquare, X, Download, Activity, Briefcase
} from 'lucide-react';
import { businessService } from '../../services/businessService';

export const BusinessCommandCenterView = ({
  currentUser,
  qaProjects = [],
  qaBugs = [],
  qaTests: _qaTests = [],
  onNavigateToQA,
  onContractsChange,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  triggerAddModal = false
}) => {
  const userId = currentUser?.uid || 'default';
  
  // State
  const [contracts, setContracts] = useState(() => businessService.getContracts(userId));
  const [internalActiveTab, setInternalActiveTab] = useState('portfolio');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'expiring_soon' | 'active'
  const [selectedContract, setSelectedContract] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  // Sync external add trigger
  React.useEffect(() => {
    if (triggerAddModal) {
      setEditingContract(null);
      setFormData({
        clientName: '',
        accountName: '',
        contactPerson: '',
        contactEmail: '',
        contractValue: '25000',
        currency: 'USD',
        billingCycle: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        status: 'active',
        slaTier: '24h Standard Enterprise SLA',
        qaProjectId: '',
        techStack: 'React, Node.js, AWS',
        description: '',
        scopeOfWork: '',
        renewalNotes: ''
      });
      setIsAddModalOpen(true);
    }
  }, [triggerAddModal]);

  // New Contract Form State
  const [formData, setFormData] = useState({
    clientName: '',
    accountName: '',
    contactPerson: '',
    contactEmail: '',
    contractValue: '25000',
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    status: 'active',
    slaTier: '24h Standard Enterprise SLA',
    qaProjectId: '',
    techStack: 'React, Node.js, AWS',
    description: '',
    scopeOfWork: '',
    renewalNotes: ''
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    return businessService.getPortfolioMetrics(contracts);
  }, [contracts]);

  // Filtered & Sorted Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = 
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.techStack && c.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (statusFilter === 'expiring_soon') {
        const days = businessService.getDaysRemaining(c.endDate);
        return days <= 30;
      }
      if (statusFilter === 'active') {
        const days = businessService.getDaysRemaining(c.endDate);
        return days > 30;
      }
      return true;
    }).sort((a, b) => {
      // Closest deadline first
      const daysA = businessService.getDaysRemaining(a.endDate);
      const daysB = businessService.getDaysRemaining(b.endDate);
      return daysA - daysB;
    });
  }, [contracts, searchQuery, statusFilter]);

  // Handlers
  const handleSaveContract = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      alert('Please enter a client name');
      return;
    }

    const techArray = typeof formData.techStack === 'string' 
      ? formData.techStack.split(',').map(s => s.trim()).filter(Boolean)
      : formData.techStack;

    const scopeArray = typeof formData.scopeOfWork === 'string'
      ? formData.scopeOfWork.split('\n').map(s => s.trim()).filter(Boolean)
      : formData.scopeOfWork;

    if (editingContract) {
      const updated = businessService.updateContract(editingContract.id, {
        ...formData,
        techStack: techArray,
        scopeOfWork: scopeArray
      }, userId);
      const next = contracts.map(c => c.id === updated.id ? updated : c);
      setContracts(next);
      onContractsChange?.(next);
    } else {
      const created = businessService.addContract({
        ...formData,
        techStack: techArray,
        scopeOfWork: scopeArray,
        deliverables: [
          { id: 'd1', title: 'Phase 1: Initial Architecture & Setup', completed: true },
          { id: 'd2', title: 'Phase 2: Core Development & Implementation', completed: false },
          { id: 'd3', title: 'Phase 3: QA & Verification Testing', completed: false }
        ]
      }, userId);
      const next = [created, ...contracts];
      setContracts(next);
      onContractsChange?.(next);
    }

    setIsAddModalOpen(false);
    setEditingContract(null);
  };

  const handleOpenEdit = (contract) => {
    setEditingContract(contract);
    setFormData({
      clientName: contract.clientName,
      accountName: contract.accountName,
      contactPerson: contract.contactPerson || '',
      contactEmail: contract.contactEmail || '',
      contractValue: contract.contractValue?.toString() || '25000',
      currency: contract.currency || 'USD',
      billingCycle: contract.billingCycle || 'monthly',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      status: contract.status || 'active',
      slaTier: contract.slaTier || '24h Standard Enterprise SLA',
      qaProjectId: contract.qaProjectId || '',
      techStack: Array.isArray(contract.techStack) ? contract.techStack.join(', ') : '',
      description: contract.description || '',
      scopeOfWork: Array.isArray(contract.scopeOfWork) ? contract.scopeOfWork.join('\n') : '',
      renewalNotes: contract.renewalNotes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id, clientName) => {
    if (window.confirm(`Delete contract for ${clientName}? This action cannot be undone.`)) {
      const updated = businessService.deleteContract(id, userId);
      setContracts(updated);
      onContractsChange?.(updated);
      if (selectedContract?.id === id) {
        setSelectedContract(null);
      }
    }
  };

  const handleRenew = (id, months = 12) => {
    const updated = businessService.renewContract(id, months, userId);
    const next = contracts.map(c => c.id === id ? updated : c);
    setContracts(next);
    onContractsChange?.(next);
    if (selectedContract?.id === id) {
      setSelectedContract(updated);
    }
  };

  const handleToggleDeliverable = (contractId, deliverableId) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract || !contract.deliverables) return;

    const updatedDeliverables = contract.deliverables.map(d => 
      d.id === deliverableId ? { ...d, completed: !d.completed } : d
    );

    const updated = businessService.updateContract(contractId, { deliverables: updatedDeliverables }, userId);
    const next = contracts.map(c => c.id === contractId ? updated : c);
    setContracts(next);
    onContractsChange?.(next);
    if (selectedContract?.id === contractId) {
      setSelectedContract(updated);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contracts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `infratech_contracts_portfolio_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full min-h-full bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-32 md:pb-16">
      
      {/* Top Header Card Container */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 md:pt-8 space-y-4 sm:space-y-6">
        
        {/* Executive Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Enterprise Operations Desk
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Business Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Client contract lifecycles, retainer run rates, renewal alerts, and QA SLA sync.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
            {contracts.length > 0 && (
              <button
                onClick={handleExportJSON}
                className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Export Portfolio Backup"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingContract(null);
                setFormData({
                  clientName: '',
                  accountName: '',
                  contactPerson: '',
                  contactEmail: '',
                  contractValue: '25000',
                  currency: 'USD',
                  billingCycle: 'monthly',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
                  status: 'active',
                  slaTier: '24h Standard Enterprise SLA',
                  qaProjectId: '',
                  techStack: 'React, Node.js, AWS',
                  description: '',
                  scopeOfWork: '',
                  renewalNotes: ''
                });
                setIsAddModalOpen(true);
              }}
              className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Contract</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          {/* Card 1: Total Active Contracts */}
          <div className="p-3.5 sm:p-4.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1.5 sm:mb-2">
              <span className="truncate">Active Contracts</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Building2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {metrics.totalContracts} <span className="text-xs font-normal text-slate-400">acc.</span>
            </div>
            <div className="text-[10px] sm:text-[11px] mt-1 flex items-center gap-1 truncate">
              {metrics.totalContracts > 0 ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  {metrics.activeCount} in good standing
                </span>
              ) : (
                <span className="text-slate-400">No active accounts</span>
              )}
            </div>
          </div>

          {/* Card 2: Monthly Recurring Revenue (MRR) */}
          <div className="p-3.5 sm:p-4.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1.5 sm:mb-2">
              <span className="truncate">Monthly Run Rate</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              ${(metrics.totalMRR).toLocaleString()} <span className="text-[11px] font-normal text-slate-400">/mo</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
              {metrics.totalValue > 0 ? `Annual: $${metrics.totalValue.toLocaleString()}` : 'No active revenue'}
            </div>
          </div>

          {/* Card 3: Expiring Soon (<30 Days) */}
          <div className={`p-3.5 sm:p-4.5 rounded-xl border transition-colors shadow-xs ${
            metrics.expiringSoonCount > 0 
              ? 'bg-amber-50/60 border-amber-200' 
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1.5 sm:mb-2">
              <span className="truncate">Expiring &lt;30d</span>
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
                metrics.expiringSoonCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-bold tracking-tight ${metrics.expiringSoonCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
              {metrics.expiringSoonCount} <span className="text-xs font-normal text-slate-400">contracts</span>
            </div>
            <div className="text-[10px] sm:text-[11px] mt-1 font-medium truncate">
              {metrics.expiringSoonCount > 0 ? (
                <span className="text-amber-800 flex items-center gap-1 truncate">
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  Renewal action needed
                </span>
              ) : (
                <span className="text-slate-400 font-normal">No expiring terms</span>
              )}
            </div>
          </div>

          {/* Card 4: SLA Compliance & QA Health */}
          <div className="p-3.5 sm:p-4.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider mb-1.5 sm:mb-2">
              <span className="truncate">SLA & QA Health</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Shield className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {contracts.length > 0 ? '99.8%' : '100%'} <span className="text-xs font-medium text-emerald-700">Health</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{qaProjects.length} QA Workspace{qaProjects.length === 1 ? '' : 's'}</span>
            </div>
          </div>

        </div>

        {/* View Mode Navigation Tabs (Visible when contracts exist) */}
        {contracts.length > 0 && (
          <div className="flex items-center gap-1 border-b border-slate-200/80 overflow-x-auto pt-2 scrollbar-none pb-1">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`pb-2.5 px-3 sm:px-3.5 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                activeTab === 'portfolio'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Accounts ({contracts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('renewals')}
              className={`pb-2.5 px-3 sm:px-3.5 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                activeTab === 'renewals'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Renewals</span>
              {metrics.expiringSoonCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                  {metrics.expiringSoonCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('scope')}
              className={`pb-2.5 px-3 sm:px-3.5 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                activeTab === 'scope'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Project Scopes</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-2.5 px-3 sm:px-3.5 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                activeTab === 'analytics'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>SLA & Financials</span>
            </button>
          </div>
        )}

      </div>

      {/* Main Content Viewport */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
        
        {contracts.length === 0 ? (
          /* ======================================================== */
          /* EXECUTIVE MINIMAL EMPTY STATE (Zero Mock Data)          */
          /* ======================================================== */
          <div className="py-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                No Active Client Contracts
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                Your business operations desk is ready. Add client contracts to track recurring retainers, milestone deliverables, renewal timelines, and SLA commitments in one place.
              </p>
              
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setEditingContract(null);
                    setFormData({
                      clientName: '',
                      accountName: '',
                      contactPerson: '',
                      contactEmail: '',
                      contractValue: '25000',
                      currency: 'USD',
                      billingCycle: 'monthly',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
                      status: 'active',
                      slaTier: '24h Standard Enterprise SLA',
                      qaProjectId: '',
                      techStack: 'React, Node.js, AWS',
                      description: '',
                      scopeOfWork: '',
                      renewalNotes: ''
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Client Contract</span>
                </button>
              </div>

              {/* 3 Executive Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-100 text-left">
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-emerald-700 flex items-center justify-center mb-2.5 shadow-2xs">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Retainer & MRR Run Rate</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Track monthly recurring retainers, annualized contracts, and billing cycles in real time.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-amber-700 flex items-center justify-center mb-2.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Renewal Alerts & Pipelines</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Automated 30-day expiration warnings with 1-click extension and renewal tracking.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-teal-700 flex items-center justify-center mb-2.5 shadow-2xs">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">SLA Guarantees & QA Sync</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Direct bridge to linked QA test workspaces, open defect tallies, and deliverable scopes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients, tech stack, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      statusFilter === 'all' 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({contracts.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('expiring_soon')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === 'expiring_soon' 
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs' 
                        : 'text-amber-800 hover:text-amber-900'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Expiring ({metrics.expiringSoonCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      statusFilter === 'active' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Healthy ({metrics.activeCount})
                  </button>
                </div>
              </div>
            </div>

            {/* If search query produced no results */}
            {filteredContracts.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center max-w-md mx-auto shadow-xs">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">No matching contracts found</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filter selection.</p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* ======================================================== */}
                {/* TAB 1: PORTFOLIO & CONTRACTS GRID                        */}
                {/* ======================================================== */}
                {activeTab === 'portfolio' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredContracts.map(contract => {
                      const daysLeft = businessService.getDaysRemaining(contract.endDate);
                      const isUrgent = daysLeft <= 30;
                      const isExpired = daysLeft < 0;
                      
                      const linkedQA = qaProjects.find(p => p.id === contract.qaProjectId || p.name?.toLowerCase().includes(contract.clientName.toLowerCase().split(' ')[0]));
                      const linkedBugs = qaBugs.filter(b => linkedQA && b.projectId === linkedQA.id);
                      const openBugs = linkedBugs.filter(b => b.status !== 'Closed' && b.status !== 'Resolved').length;

                      const completedDeliverables = contract.deliverables?.filter(d => d.completed).length || 0;
                      const totalDeliverables = contract.deliverables?.length || 0;
                      const progressPct = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

                      return (
                        <div 
                          key={contract.id}
                          className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-sm"
                        >
                          {/* Card Content */}
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h3 className="text-base font-bold text-slate-900">
                                  {contract.clientName}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                  {contract.accountName}
                                </p>
                              </div>

                              {/* Expiration Countdown Badge */}
                              <div className="shrink-0">
                                {isExpired ? (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    Expired ({Math.abs(daysLeft)}d ago)
                                  </span>
                                ) : isUrgent ? (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    Expires in {daysLeft} days
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    {daysLeft} days remaining
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Financial & Term Box */}
                            <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Value & Retainer</span>
                                <span className="text-sm font-bold text-slate-900">
                                  ${(contract.contractValue || 0).toLocaleString()} <span className="text-[11px] text-slate-500 font-normal">/ {contract.billingCycle}</span>
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Contract End Date</span>
                                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {contract.endDate}
                                </span>
                              </div>
                            </div>

                            {/* Description Paragraph */}
                            {contract.description && (
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                                {contract.description}
                              </p>
                            )}

                            {/* Deliverables Progress */}
                            {totalDeliverables > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-[11px] mb-1 font-medium text-slate-500">
                                  <span>Deliverables Completion</span>
                                  <span className="text-emerald-700 font-semibold">{completedDeliverables} / {totalDeliverables} ({progressPct}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600 transition-all duration-300 rounded-full" 
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Tech Stack Tags */}
                            {contract.techStack && contract.techStack.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {contract.techStack.map((tech, i) => (
                                  <span 
                                    key={i} 
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Linked QA Status Badge */}
                            {linkedQA && (
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-medium">Linked QA: {linkedQA.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    openBugs > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {openBugs} Open Defects
                                  </span>
                                  {onNavigateToQA && (
                                    <button
                                      onClick={() => onNavigateToQA(linkedQA.id)}
                                      className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                                    >
                                      Open QA <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Card Bottom Actions Bar */}
                          <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setSelectedContract(contract)}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View Full Scope</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              {isUrgent && (
                                <button
                                  onClick={() => handleRenew(contract.id, 12)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                  title="Renew Contract +1 Year"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Renew +1 Yr</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEdit(contract)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                title="Edit Contract Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDelete(contract.id, contract.clientName)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Contract"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: RENEWAL TIMELINE & DEADLINES                      */}
                {/* ======================================================== */}
                {activeTab === 'renewals' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Chronological Renewal Matrix: Contracts sorted by nearest expiration deadline.
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {metrics.expiringSoonCount} Expiring within 30d
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {filteredContracts.map((contract, idx) => {
                        const daysLeft = businessService.getDaysRemaining(contract.endDate);
                        const isUrgent = daysLeft <= 30;
                        const isExpired = daysLeft < 0;

                        return (
                          <div 
                            key={contract.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
                              isExpired 
                                ? 'bg-rose-50/40 border-rose-200' 
                                : isUrgent 
                                  ? 'bg-amber-50/40 border-amber-200' 
                                  : 'bg-white border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isExpired 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                  : isUrgent 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                #{idx + 1}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900">{contract.clientName}</h4>
                                  <span className="text-xs text-slate-500">({contract.accountName})</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    Term: {contract.startDate} → <strong className="text-slate-800">{contract.endDate}</strong>
                                  </span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-semibold">
                                    ${(contract.contractValue || 0).toLocaleString()} / {contract.billingCycle}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-500">{contract.slaTier}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                                  Countdown
                                </span>
                                <span className={`text-sm font-bold ${
                                  isExpired ? 'text-rose-600' : isUrgent ? 'text-amber-700' : 'text-emerald-700'
                                }`}>
                                  {isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : `${daysLeft} Days Left`}
                                </span>
                              </div>

                              <button
                                onClick={() => handleRenew(contract.id, 12)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Renew +1 Yr</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: PROJECT SCOPES & DESCRIPTIONS                     */}
                {/* ======================================================== */}
                {activeTab === 'scope' && (
                  <div className="space-y-4">
                    {filteredContracts.map(contract => (
                      <div 
                        key={contract.id}
                        className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{contract.clientName}</h3>
                            <p className="text-xs text-emerald-700 font-medium">{contract.accountName}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            {contract.contactPerson && (
                              <span>Contact: <strong className="text-slate-800">{contract.contactPerson}</strong></span>
                            )}
                            {contract.contactEmail && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700">{contract.contactEmail}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {contract.description && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                              Project Brief & Technical Scope
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/60">
                              {contract.description}
                            </p>
                          </div>
                        )}

                        {contract.scopeOfWork && contract.scopeOfWork.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              Scope of Work Deliverables
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {contract.scopeOfWork.map((scope, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{scope}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {contract.deliverables && contract.deliverables.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              Milestones Checklist (Interactive)
                            </h4>
                            <div className="space-y-1.5">
                              {contract.deliverables.map(del => (
                                <div 
                                  key={del.id}
                                  onClick={() => handleToggleDeliverable(contract.id, del.id)}
                                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors text-xs"
                                >
                                  <input 
                                    type="checkbox"
                                    checked={del.completed}
                                    onChange={() => {}}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                                  />
                                  <span className={del.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
                                    {del.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 4: FINANCIAL & SLA MATRIX                            */}
                {/* ======================================================== */}
                {activeTab === 'analytics' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="p-4.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Average Contract Value</span>
                        <span className="text-2xl font-bold text-slate-900">${metrics.avgContractValue.toLocaleString()}</span>
                        <p className="text-[11px] text-slate-400 mt-1">Calculated across annualized active portfolio</p>
                      </div>
                      <div className="p-4.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">SLA Standard Guarantee</span>
                        <span className="text-2xl font-bold text-emerald-700">99.9% Uptime</span>
                        <p className="text-[11px] text-slate-400 mt-1">All mission-critical tiers active</p>
                      </div>
                      <div className="p-4.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Total Active Client MRR</span>
                        <span className="text-2xl font-bold text-slate-900">${metrics.totalMRR.toLocaleString()}/mo</span>
                        <p className="text-[11px] text-slate-400 mt-1">100% recurring retainers</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden p-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-4">Enterprise SLA & Account Matrix</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="pb-3 font-semibold">Client & Account</th>
                              <th className="pb-3 font-semibold">MRR / Retainer</th>
                              <th className="pb-3 font-semibold">Contract End</th>
                              <th className="pb-3 font-semibold">SLA Guarantee</th>
                              <th className="pb-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {contracts.map(c => {
                              const days = businessService.getDaysRemaining(c.endDate);
                              return (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3">
                                    <span className="font-bold text-slate-900 block">{c.clientName}</span>
                                    <span className="text-[11px] text-slate-500">{c.contactPerson || 'N/A'}</span>
                                  </td>
                                  <td className="py-3 font-mono font-semibold text-emerald-700">
                                    ${(c.contractValue || 0).toLocaleString()} / {c.billingCycle}
                                  </td>
                                  <td className="py-3">
                                    <span className="font-semibold text-slate-900">{c.endDate}</span>
                                    <span className={`block text-[10px] font-semibold ${days <= 30 ? 'text-amber-700' : 'text-slate-500'}`}>
                                      ({days} days left)
                                    </span>
                                  </td>
                                  <td className="py-3 text-slate-600">{c.slaTier}</td>
                                  <td className="py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      days <= 30 
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                        : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                      {days <= 30 ? 'Renewal Pending' : 'Healthy Active'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT CLIENT CONTRACT                       */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {editingContract ? 'Edit Client Contract' : 'Add New Client Contract'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveContract} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Client / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corporation"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Cloud Modernization & Enterprise QA"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contract Retainer / Value ($)</label>
                  <input
                    type="number"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Billing Term</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="monthly">Monthly Retainer</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="fixed">Fixed Project Fee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contract Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Contract Expiration / Renewal Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Key Stakeholder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. David Vance (VP Engineering)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stakeholder Email</label>
                  <input
                    type="email"
                    placeholder="e.g. david@clientcorp.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">SLA Tier</label>
                  <select
                    value={formData.slaTier}
                    onChange={(e) => setFormData({ ...formData, slaTier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="24h Mission-Critical (99.9%)">24h Mission-Critical (99.9%)</option>
                    <option value="4h Financial SLA (99.99%)">4h Financial SLA (99.99%)</option>
                    <option value="12h Healthcare Compliance SLA">12h Healthcare Compliance SLA</option>
                    <option value="24h Standard Enterprise SLA">24h Standard Enterprise SLA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Docker, AWS"
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Description & Technical Brief</label>
                <textarea
                  rows={3}
                  placeholder="Detail the technical scope, objectives, architecture, and client requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Scope of Work Deliverables (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. API Gateway Migration&#10;Fleet Telemetry Engine&#10;Automated QA Regression Suite"
                  value={formData.scopeOfWork}
                  onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {editingContract ? 'Update Contract' : 'Create Contract'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER / MODAL: VIEW FULL CONTRACT SCOPE                 */}
      {/* ======================================================== */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[240px] sm:max-w-none">
                  {selectedContract.clientName} — Full Scope
                </h3>
              </div>
              <button 
                onClick={() => setSelectedContract(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs">
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Value</span>
                  <span className="text-sm font-black text-slate-900">${selectedContract.contractValue?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Expiration</span>
                  <span className="text-xs font-bold text-amber-700">{selectedContract.endDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Contact</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedContract.contactPerson || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">SLA Tier</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedContract.slaTier}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Project Description</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  {selectedContract.description}
                </p>
              </div>

              {selectedContract.scopeOfWork && selectedContract.scopeOfWork.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Detailed Scope of Work</h4>
                  <ul className="space-y-1.5">
                    {selectedContract.scopeOfWork.map((scope, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{scope}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedContract.renewalNotes && (
                <div>
                  <h4 className="font-bold text-amber-800 uppercase tracking-wider mb-2">Renewal Notes & History</h4>
                  <p className="text-slate-700 italic bg-amber-50/60 border border-amber-200 p-3 rounded-xl">
                    {selectedContract.renewalNotes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleRenew(selectedContract.id, 12)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew Contract (+12 Months)</span>
                </button>

                <button
                  onClick={() => setSelectedContract(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
