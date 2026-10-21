import React, { useState, useMemo } from 'react';
import { 
  Building2, Calendar, DollarSign, Clock, AlertTriangle, 
  CheckCircle2, Plus, Search, Filter, ArrowUpRight, 
  FileText, Shield, Sparkles, Trash2, Edit3, RefreshCw, 
  CheckSquare, X, Download, Activity
} from 'lucide-react';
import { businessService } from '../../services/businessService';

export const BusinessCommandCenterView = ({
  currentUser,
  qaProjects = [],
  qaBugs = [],
  qaTests: _qaTests = [],
  onNavigateToQA
}) => {
  const userId = currentUser?.uid || 'default';
  
  // State
  const [contracts, setContracts] = useState(() => businessService.getContracts(userId));
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'renewals' | 'scope' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'expiring_soon' | 'active'
  const [selectedContract, setSelectedContract] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

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
      setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
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
      setContracts(prev => [created, ...prev]);
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
      if (selectedContract?.id === id) {
        setSelectedContract(null);
      }
    }
  };

  const handleRenew = (id, months = 12) => {
    const updated = businessService.renewContract(id, months, userId);
    setContracts(prev => prev.map(c => c.id === id ? updated : c));
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
    setContracts(prev => prev.map(c => c.id === contractId ? updated : c));
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
    <div className="w-full min-h-full bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      
      {/* Top Header Card Container */}
      <div className="max-w-7xl mx-auto px-6 pt-6 md:pt-8 space-y-6">
        
        {/* Executive Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Enterprise Operations Desk
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Portfolio Sync
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Business Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
              Active enterprise client accounts, contract expiration tracking, SLA guarantees, and multi-team technical scopes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Export Portfolio Backup"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Portfolio</span>
            </button>

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
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Client Contract</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Active Contracts */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Active Contracts</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900">
              {metrics.totalContracts} <span className="text-xs font-semibold text-slate-400">Accounts</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.activeCount} In Good Standing</span>
            </div>
          </div>

          {/* Card 2: Monthly Recurring Revenue (MRR) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Monthly Run Rate (MRR)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900">
              ${(metrics.totalMRR).toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ mo</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Annual Portfolio: ${(metrics.totalValue).toLocaleString()}
            </div>
          </div>

          {/* Card 3: Expiring Soon (<30 Days) */}
          <div className={`p-5 rounded-2xl border transition-all shadow-2xs ${
            metrics.expiringSoonCount > 0 
              ? 'bg-amber-50/70 border-amber-200 hover:shadow-md' 
              : 'bg-white border-slate-200/90 hover:shadow-md'
          }`}>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Expiring Within 30d</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                metrics.expiringSoonCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              }`}>
                <Clock className={`w-4 h-4 ${metrics.expiringSoonCount > 0 ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <div className={`text-2xl md:text-3xl font-black ${metrics.expiringSoonCount > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
              {metrics.expiringSoonCount} <span className="text-xs font-semibold text-slate-400">Contracts</span>
            </div>
            <div className="text-[11px] mt-1 flex items-center gap-1 font-semibold">
              {metrics.expiringSoonCount > 0 ? (
                <span className="text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Immediate Renewal Action
                </span>
              ) : (
                <span className="text-slate-500">All contracts healthy (&gt;30d)</span>
              )}
            </div>
          </div>

          {/* Card 4: SLA Compliance & QA Health */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>SLA Health & QA Link</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900">
              99.8% <span className="text-xs font-semibold text-emerald-600">Compliance</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{qaProjects.length} QA Workspaces Linked</span>
            </div>
          </div>

        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'portfolio'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Active Contracts & Accounts ({contracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('renewals')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'renewals'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Renewal Timeline & Deadlines</span>
            {metrics.expiringSoonCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                {metrics.expiringSoonCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('scope')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'scope'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Project Scopes & Descriptions</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>SLA Matrix & Financials</span>
          </button>
        </div>

      </div>

      {/* Main Content Viewport */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients, tech stack, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'all' 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({contracts.length})
              </button>
              <button
                onClick={() => setStatusFilter('expiring_soon')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'expiring_soon' 
                    ? 'bg-amber-500 text-slate-950 shadow-2xs' 
                    : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Expiring Soon ({metrics.expiringSoonCount})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'active' 
                    ? 'bg-emerald-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Healthy ({metrics.activeCount})
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PORTFOLIO & CONTRACTS GRID                        */}
        {/* ======================================================== */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredContracts.map(contract => {
              const daysLeft = businessService.getDaysRemaining(contract.endDate);
              const isUrgent = daysLeft <= 30;
              const isExpired = daysLeft < 0;
              
              // Linked QA Match
              const linkedQA = qaProjects.find(p => p.id === contract.qaProjectId || p.name?.toLowerCase().includes(contract.clientName.toLowerCase().split(' ')[0]));
              const linkedBugs = qaBugs.filter(b => linkedQA && b.projectId === linkedQA.id);
              const openBugs = linkedBugs.filter(b => b.status !== 'Closed' && b.status !== 'Resolved').length;

              const completedDeliverables = contract.deliverables?.filter(d => d.completed).length || 0;
              const totalDeliverables = contract.deliverables?.length || 0;
              const progressPct = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

              return (
                <div 
                  key={contract.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md ${
                    isUrgent 
                      ? 'border-amber-300 ring-1 ring-amber-100' 
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {contract.clientName}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {contract.accountName}
                        </p>
                      </div>

                      {/* Expiration Countdown Badge */}
                      <div className="shrink-0">
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Expired ({Math.abs(daysLeft)}d ago)
                          </span>
                        ) : isUrgent ? (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Expires in {daysLeft} days!
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {daysLeft} days remaining
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial & Term Box */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Value & Retainer</span>
                        <span className="text-sm font-black text-slate-900">
                          ${(contract.contractValue || 0).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {contract.billingCycle}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Contract End Date</span>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          {contract.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {contract.description}
                    </p>

                    {/* Deliverables Progress */}
                    {totalDeliverables > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-500">
                          <span>Deliverables Completion</span>
                          <span className="text-emerald-700 font-bold">{completedDeliverables} / {totalDeliverables} ({progressPct}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" 
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
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Linked QA Status Badge */}
                    {linkedQA && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-indigo-700">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-semibold">Linked QA: {linkedQA.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            openBugs > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {openBugs} Open Defects
                          </span>
                          {onNavigateToQA && (
                            <button
                              onClick={() => onNavigateToQA(linkedQA.id)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer font-bold"
                            >
                              Open QA <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Card Bottom Actions Bar */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedContract(contract)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Full Scope</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isUrgent && (
                        <button
                          onClick={() => handleRenew(contract.id, 12)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
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
        {/* TAB 2: RENEWAL TIMELINE & DEADLINES (KABTAK HAIN)        */}
        {/* ======================================================== */}
        {activeTab === 'renewals' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Chronological Renewal Matrix: Contracts are sorted by closest deadline first so you never miss an enterprise renewal.
                </span>
              </div>
              <span className="font-bold text-slate-900 shrink-0">
                {metrics.expiringSoonCount} Expiring within 30d
              </span>
            </div>

            <div className="space-y-3">
              {filteredContracts.map((contract, idx) => {
                const daysLeft = businessService.getDaysRemaining(contract.endDate);
                const isUrgent = daysLeft <= 30;
                const isExpired = daysLeft < 0;

                return (
                  <div 
                    key={contract.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
                      isExpired 
                        ? 'bg-rose-50/60 border-rose-200' 
                        : isUrgent 
                          ? 'bg-amber-50/60 border-amber-300' 
                          : 'bg-white border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isExpired 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : isUrgent 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
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
                          <span className="text-emerald-700 font-bold">
                            ${(contract.contractValue || 0).toLocaleString()} / {contract.billingCycle}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">{contract.slaTier}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                          Countdown
                        </span>
                        <span className={`text-sm font-black ${
                          isExpired ? 'text-rose-600' : isUrgent ? 'text-amber-700 animate-pulse' : 'text-emerald-700'
                        }`}>
                          {isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : `${daysLeft} Days Left`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRenew(contract.id, 12)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{contract.clientName}</h3>
                    <p className="text-xs text-emerald-700 font-semibold">{contract.accountName}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Contact: <strong className="text-slate-800">{contract.contactPerson}</strong></span>
                    <span>•</span>
                    <span className="text-indigo-600">{contract.contactEmail}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Architectural & Project Description
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {contract.description}
                  </p>
                </div>

                {contract.scopeOfWork && contract.scopeOfWork.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Contract Scope of Work & Deliverables
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
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Key Milestones Checklist (Click to Toggle)
                    </h4>
                    <div className="space-y-1.5">
                      {contract.deliverables.map(del => (
                        <div 
                          key={del.id}
                          onClick={() => handleToggleDeliverable(contract.id, del.id)}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer transition-colors text-xs"
                        >
                          <input 
                            type="checkbox"
                            checked={del.completed}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                          />
                          <span className={del.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-semibold'}>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Average Contract Value</span>
                <span className="text-2xl font-black text-slate-900">${metrics.avgContractValue.toLocaleString()}</span>
                <p className="text-[11px] text-slate-400 mt-1">Calculated across annualized active portfolio</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">SLA Standard Guarantee</span>
                <span className="text-2xl font-black text-emerald-700">99.9% Uptime</span>
                <p className="text-[11px] text-slate-400 mt-1">All mission-critical tiers active</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Active Client MRR</span>
                <span className="text-2xl font-black text-slate-900">${metrics.totalMRR.toLocaleString()}/mo</span>
                <p className="text-[11px] text-slate-400 mt-1">100% recurring retainers</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-5">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">Enterprise SLA & Account Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-bold">Client & Account</th>
                      <th className="pb-3 font-bold">MRR / Retainer</th>
                      <th className="pb-3 font-bold">Contract End</th>
                      <th className="pb-3 font-bold">SLA Guarantee</th>
                      <th className="pb-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {contracts.map(c => {
                      const days = businessService.getDaysRemaining(c.endDate);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3">
                            <span className="font-bold text-slate-900 block">{c.clientName}</span>
                            <span className="text-[10px] text-slate-500">{c.contactPerson}</span>
                          </td>
                          <td className="py-3 font-mono font-bold text-emerald-700">
                            ${(c.contractValue || 0).toLocaleString()} / {c.billingCycle}
                          </td>
                          <td className="py-3">
                            <span className="font-semibold text-slate-900">{c.endDate}</span>
                            <span className={`block text-[10px] font-bold ${days <= 30 ? 'text-amber-700' : 'text-slate-500'}`}>
                              ({days} days left)
                            </span>
                          </td>
                          <td className="py-3 text-slate-600">{c.slaTier}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT CLIENT CONTRACT                       */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
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
            <form onSubmit={handleSaveContract} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Client / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Logistics Inc."
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Fleet Cloud Modernization & QA"
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
                    placeholder="e.g. david@apexlogistics.io"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {selectedContract.clientName} — Full Scope Brief
                </h3>
              </div>
              <button 
                onClick={() => setSelectedContract(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
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
