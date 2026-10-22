import React, { useState, useRef } from 'react';
import { 
  Building, Search, Plus, ExternalLink, Trash2,
  CheckCircle2, ShieldCheck, Sparkles, Download, Upload,
  MapPin, Code, X, FileText, Check
} from 'lucide-react';
import { salesService } from '../../services/salesService';

export const LeadsPipelineView = ({ 
  leads = [], 
  onAddLead, 
  onAddLeads,
  onDeleteLead,
  onDraftEmailForLead
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  
  // Modals state
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [discoveryIndustry, setDiscoveryIndustry] = useState('House Cleaning & Maid Services');
  const [discoveryLocation, setDiscoveryLocation] = useState('Dallas, TX');
  const [isDiscovering, setIsDiscovering] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    companyName: '',
    domain: '',
    industry: 'House Cleaning & Maid Services',
    location: 'Dallas, TX',
    contactName: '',
    contactTitle: 'Owner & Operator',
    contactEmail: '',
    emailStatus: 'verified',
    signalText: 'Sloppy legacy website lacking instant mobile booking calculator',
    techStackText: 'WordPress (Legacy), PHP'
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importNotice, setImportNotice] = useState(null);
  const fileInputRef = useRef(null);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.contactName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.domain || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || (lead.industry || '').toLowerCase().includes(selectedIndustry.toLowerCase());
    return matchesSearch && matchesIndustry;
  });

  // AI Discovery (Real generative discovery)
  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const candidates = await salesService.discoverLeadsWithAI({
        industry: discoveryIndustry,
        location: discoveryLocation,
        count: 2
      });

      if (Array.isArray(candidates) && candidates.length > 0) {
        if (onAddLeads) {
          onAddLeads(candidates);
        } else if (onAddLead) {
          candidates.forEach(c => onAddLead(c));
        }
      }
      setIsDiscoveryModalOpen(false);
    } catch (err) {
      console.warn('Discovery error:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Add Real Lead Manually
  const handleSaveManualLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.companyName.trim() || !newLeadForm.contactEmail.trim()) return;

    const signals = newLeadForm.signalText.trim()
      ? [{ code: 'MANUAL_SIGNAL', title: newLeadForm.signalText.trim(), confidence: 0.95 }]
      : [{ code: 'TARGET_ACCOUNT', title: 'Target business identified for QA testing suite', confidence: 0.90 }];

    const techStack = newLeadForm.techStackText.trim()
      ? newLeadForm.techStackText.split(',').map(t => t.trim()).filter(Boolean)
      : ['Web / API'];

    const domain = newLeadForm.domain.trim() 
      ? newLeadForm.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      : `${newLeadForm.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    const leadToSave = {
      companyName: newLeadForm.companyName.trim(),
      domain,
      industry: newLeadForm.industry.trim() || 'Software / SaaS',
      location: newLeadForm.location.trim() || 'Remote / Global',
      contactName: newLeadForm.contactName.trim() || 'Engineering Lead',
      contactTitle: newLeadForm.contactTitle.trim() || 'VP of Engineering',
      contactEmail: newLeadForm.contactEmail.trim(),
      emailStatus: newLeadForm.emailStatus,
      detectedSignals: signals,
      techStack,
      status: 'discovered'
    };

    if (onAddLead) onAddLead(leadToSave);
    setIsAddModalOpen(false);
    setNewLeadForm({
      companyName: '',
      domain: '',
      industry: 'FinTech SaaS',
      location: '',
      contactName: '',
      contactTitle: 'VP of Engineering',
      contactEmail: '',
      emailStatus: 'verified',
      signalText: '',
      techStackText: ''
    });
  };

  // CSV File upload / parsing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (text && typeof text === 'string') {
        setCsvContent(text);
        const parsed = salesService.parseLeadsCSV(text);
        setImportNotice(`Detected ${parsed.length} valid prospect(s) ready to import.`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    const parsed = salesService.parseLeadsCSV(csvContent);
    if (parsed.length === 0) {
      setImportNotice('No valid prospects found in CSV. Please verify column headers.');
      return;
    }

    if (onAddLeads) {
      onAddLeads(parsed);
    } else if (onAddLead) {
      parsed.forEach(p => onAddLead(p));
    }

    setIsImportModalOpen(false);
    setCsvContent('');
    setImportNotice(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Company', 'Domain', 'Industry', 'Location', 'Contact Name', 'Title', 'Email', 'Status'];
    const rows = filteredLeads.map(l => [
      `"${l.companyName || ''}"`,
      `"${l.domain || ''}"`,
      `"${l.industry || ''}"`,
      `"${l.location || ''}"`,
      `"${l.contactName || ''}"`,
      `"${l.contactTitle || ''}"`,
      `"${l.contactEmail || ''}"`,
      `"${l.emailStatus || ''}"`
    ]);
    const csvData = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvData);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `infratechai_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-600" />
            US Cleaning Businesses & Sloppy Site Pipeline
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Target USA cleaning & maid service owners with outdated sites to pitch our modern demo (housecleaning-998d3.web.app).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {leads.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Prospect
          </button>

          <button
            onClick={() => setIsDiscoveryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Lead Discovery
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Visible if there are leads or searching) */}
      {(leads.length > 0 || searchQuery) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, contact, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'SaaS', 'FinTech', 'HealthTech', 'Agency'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedIndustry(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 cursor-pointer ${
                  selectedIndustry === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leads Grid or Clean Production Empty State */}
      {leads.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 md:p-16 border border-slate-200 text-center max-w-2xl mx-auto shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
            <Building className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Zero Mock Data: Pipeline Ready
            </h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your sales pipeline is completely clean. Add your actual target companies, import an outbound lead CSV list, or use AI Lead Discovery to scout target prospects.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Prospect Manually
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              Import Leads CSV
            </button>

            <button
              onClick={() => setIsDiscoveryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Run AI Discovery
            </button>
          </div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No prospects found</h3>
          <p className="text-xs text-slate-500">No prospects match your query "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedIndustry('all'); }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => (
            <div 
              key={lead.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{lead.companyName}</h3>
                    {lead.domain && (
                      <a 
                        href={`https://${lead.domain}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title={lead.domain}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700">{lead.industry}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {lead.location || 'Remote'}
                    </span>
                  </div>
                </div>

                {/* Email Deliverability Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    lead.emailStatus === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : lead.emailStatus === 'risky'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-blue-50 text-blue-700 border-blue-300'
                  }`}>
                    {lead.emailStatus === 'verified' ? <CheckCircle2 className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    <span className="capitalize">{lead.emailStatus}</span>
                  </span>

                  {onDeleteLead && (
                    <button
                      onClick={() => onDeleteLead(lead.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Prospect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Decision Maker Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{lead.contactName}</div>
                  <div className="text-[11px] text-slate-500">{lead.contactTitle}</div>
                </div>
                <div className="font-mono text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {lead.contactEmail}
                </div>
              </div>

              {/* Buying Signals Extracted */}
              {Array.isArray(lead.detectedSignals) && lead.detectedSignals.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Detected Buying Signals
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.detectedSignals.map((signal, sIdx) => (
                      <span 
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {signal.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack Tags */}
              {Array.isArray(lead.techStack) && lead.techStack.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <Code className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {lead.techStack.map((tech, tIdx) => (
                      <span key={tIdx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => onDraftEmailForLead && onDraftEmailForLead(lead)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Draft Outreach in Outbox
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Add Prospect Manually */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scaleUp my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Real Prospect</h3>
                <p className="text-xs text-slate-500">Target business and technical decision maker details</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Cloud Systems"
                    value={newLeadForm.companyName}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Domain / Website</label>
                  <input
                    type="text"
                    placeholder="e.g. acmecloud.io"
                    value={newLeadForm.domain}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, domain: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry / Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. FinTech SaaS, HealthTech"
                    value={newLeadForm.industry}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Austin, TX or Remote"
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-900 block mb-2">Decision Maker Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={newLeadForm.contactName}
                      onChange={(e) => setNewLeadForm(prev => ({ ...prev, contactName: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. VP of Engineering"
                      value={newLeadForm.contactTitle}
                      onChange={(e) => setNewLeadForm(prev => ({ ...prev, contactTitle: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@acmecloud.io"
                      value={newLeadForm.contactEmail}
                      onChange={(e) => setNewLeadForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Buying Signal / Observation Hook</label>
                <input
                  type="text"
                  placeholder="e.g. Scaling engineering sprint velocity, manual testing bottleneck"
                  value={newLeadForm.signalText}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, signalText: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js, AWS"
                  value={newLeadForm.techStackText}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, techStackText: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Import Leads CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Import Leads from CSV</h3>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Upload or paste a CSV file containing columns like: <code>Company, Domain, Industry, Location, Contact Name, Title, Email</code>.
            </p>

            <div className="space-y-3 text-xs">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 rounded-xl flex items-center justify-center gap-2 text-indigo-700 font-bold cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Choose .CSV File to Upload</span>
              </button>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Or Paste CSV Content Here:</label>
                <textarea
                  rows={5}
                  value={csvContent}
                  onChange={(e) => {
                    setCsvContent(e.target.value);
                    if (e.target.value.trim()) {
                      const count = salesService.parseLeadsCSV(e.target.value).length;
                      setImportNotice(`Detected ${count} valid prospect(s).`);
                    } else {
                      setImportNotice(null);
                    }
                  }}
                  placeholder="Company, Domain, Industry, Contact Name, Title, Email&#10;Acme Inc, acme.io, FinTech, Jane Doe, VP Engineering, jane@acme.io"
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {importNotice && (
                <div className="p-3 bg-indigo-50 text-indigo-900 rounded-xl border border-indigo-200 flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{importNotice}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={!csvContent.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                Import Prospects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Real AI Discovery Modal */}
      {isDiscoveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Run AI Lead Discovery</h3>
              <p className="text-xs text-slate-500">
                Harvey uses neural search and industry profiling to scout target companies matching your criteria.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Target Cleaning Niche</label>
                  <span className="text-[10px] text-slate-400">USA Cleaners</span>
                </div>
                <input
                  type="text"
                  value={discoveryIndustry}
                  onChange={(e) => setDiscoveryIndustry(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. House Cleaning & Maid Services"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['House Cleaning & Maid Services', 'Airbnb Turnover Pros', 'Commercial Cleaning'].map(niche => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => setDiscoveryIndustry(niche)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium border cursor-pointer transition-all ${
                        discoveryIndustry === niche ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Target US City / Region</label>
                  <span className="text-[10px] text-slate-400">High Demand Metro</span>
                </div>
                <input
                  type="text"
                  value={discoveryLocation}
                  onChange={(e) => setDiscoveryLocation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Dallas, TX or Miami, FL"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Dallas, TX', 'Miami, FL', 'Atlanta, GA', 'Phoenix, AZ', 'Los Angeles, CA', 'Houston, TX'].map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setDiscoveryLocation(city)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium border cursor-pointer transition-all ${
                        discoveryLocation === city ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-900 border border-indigo-200/60">
              <span className="font-bold">Neural Engine: </span> Finds cleaning companies with outdated sites, lacking online booking, to pitch custom 24-hr previews.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDiscoveryModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRunDiscovery}
                disabled={isDiscovering}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
                {isDiscovering ? 'Scouting Prospects...' : 'Start Discovery'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
