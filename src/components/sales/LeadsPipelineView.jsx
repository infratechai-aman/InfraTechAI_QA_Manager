import React, { useState } from 'react';
import { 
  Building, Search, Filter, Plus, ExternalLink, Mail, 
  CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Download,
  MapPin, Globe, Code, ArrowUpRight
} from 'lucide-react';
import { salesService } from '../../services/salesService';

export const LeadsPipelineView = ({ 
  leads = [], 
  onAddLead, 
  onDraftEmailForLead,
  onNavigateTab 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [discoveryIndustry, setDiscoveryIndustry] = useState('FinTech SaaS');
  const [discoveryLocation, setDiscoveryLocation] = useState('Austin, TX');
  const [isDiscovering, setIsDiscovering] = useState(false);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || lead.industry.toLowerCase().includes(selectedIndustry.toLowerCase());
    return matchesSearch && matchesIndustry;
  });

  const handleRunDiscovery = () => {
    setIsDiscovering(true);
    setTimeout(() => {
      const newLead = {
        companyName: `${discoveryLocation.split(',')[0]} Scale Systems`,
        domain: `${discoveryLocation.split(',')[0].toLowerCase()}scale.io`,
        industry: discoveryIndustry,
        location: discoveryLocation,
        contactName: 'Alex Mercer',
        contactTitle: 'VP of Product Delivery',
        contactEmail: `alex@${discoveryLocation.split(',')[0].toLowerCase()}scale.io`,
        emailStatus: 'verified',
        detectedSignals: [
          { code: 'NO_AUTOMATED_QA', title: 'Hiring 3 QA Engineers to fix release regression backlog', confidence: 0.94 },
          { code: 'ACTIVE_DEVELOPMENT', title: 'Continuous deployment with 4 updates weekly', confidence: 0.88 }
        ],
        techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        status: 'draft_ready'
      };
      if (onAddLead) onAddLead(newLead);
      setIsDiscovering(false);
      setIsDiscoveryModalOpen(false);
    }, 1200);
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Domain', 'Industry', 'Location', 'Contact Name', 'Title', 'Email', 'Status'];
    const rows = filteredLeads.map(l => [
      `"${l.companyName}"`,
      `"${l.domain}"`,
      `"${l.industry}"`,
      `"${l.location}"`,
      `"${l.contactName}"`,
      `"${l.contactTitle}"`,
      `"${l.contactEmail}"`,
      `"${l.emailStatus}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `infratechai_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-600" />
            Profiled Prospects & Buying Signals
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Companies discovered and profiled by Harvey. Every prospect is enriched with technical buying signals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => setIsDiscoveryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Find New Prospects
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Leads Grid */}
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
                  <a 
                    href={`https://${lead.domain}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-medium text-slate-700">{lead.industry}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {lead.location}
                  </span>
                </div>
              </div>

              {/* Email Deliverability Status Badge */}
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

            {/* Tech Stack Tags */}
            {lead.techStack && lead.techStack.length > 0 && (
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

      {/* Discovery Modal */}
      {isDiscoveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Run Harvey Lead Discovery</h3>
              <p className="text-xs text-slate-500">
                Harvey will query OpenStreetMap & business registries, parse websites for tech stacks, and find decision-maker emails.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Industry / Niche</label>
                <input
                  type="text"
                  value={discoveryIndustry}
                  onChange={(e) => setDiscoveryIndustry(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. FinTech SaaS, HealthTech, Digital Agencies"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City / Region</label>
                <input
                  type="text"
                  value={discoveryLocation}
                  onChange={(e) => setDiscoveryLocation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Austin, TX or London, UK"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-900 border border-indigo-200/60">
              <span className="font-bold">Cost Estimate: </span> $0.00 (Using OpenStreetMap & Public Web Profiler)
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
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {isDiscovering ? 'Scouting Web...' : 'Start Discovery'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
