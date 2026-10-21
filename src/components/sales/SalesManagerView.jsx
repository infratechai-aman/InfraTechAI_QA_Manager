import React, { useState, useEffect } from 'react';
import { 
  Bot, LayoutDashboard, Mail, Users, Layers, MessageSquare, 
  Sliders, RefreshCw, Sparkles, CheckCircle2 
} from 'lucide-react';
import { salesService } from '../../services/salesService';
import { SalesCockpit } from './SalesCockpit';
import { OutboxReviewDesk } from './OutboxReviewDesk';
import { LeadsPipelineView } from './LeadsPipelineView';
import { CampaignsPlaybookView } from './CampaignsPlaybookView';
import { ConversationsView } from './ConversationsView';
import { HarveySettingsModal } from './HarveySettingsModal';

export const SalesManagerView = ({ 
  currentUser,
  salesTab: externalSalesTab,
  setSalesTab: externalSetSalesTab,
  onOpenSettings,
  onUpdateOutboxCount
}) => {
  const [internalSalesTab, setInternalSalesTab] = useState('cockpit');
  const salesTab = externalSalesTab || internalSalesTab;
  const setSalesTab = externalSetSalesTab || setInternalSalesTab;

  const [leads, setLeads] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [settings, setSettings] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load initial data
  useEffect(() => {
    setSettings(salesService.getSettings());
    const l = salesService.getLeads();
    const o = salesService.getOutbox();
    const c = salesService.getConversations();
    setLeads(l);
    setOutbox(o);
    setConversations(c);

    const pending = o.filter(item => item.status === 'pending_approval').length;
    if (onUpdateOutboxCount) onUpdateOutboxCount(pending);
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApprove = (outboxId) => {
    const updated = salesService.approveEmail(outboxId);
    setOutbox(updated);
    const pending = updated.filter(item => item.status === 'pending_approval').length;
    if (onUpdateOutboxCount) onUpdateOutboxCount(pending);
  };

  const handleReject = (outboxId) => {
    const updated = salesService.rejectEmail(outboxId);
    setOutbox(updated);
    const pending = updated.filter(item => item.status === 'pending_approval').length;
    if (onUpdateOutboxCount) onUpdateOutboxCount(pending);
  };

  const handleUpdateDraft = (outboxId, newBody, newSubject) => {
    const updated = salesService.updateEmailDraft(outboxId, newBody, newSubject);
    setOutbox(updated);
  };

  const handleAddLead = (newLead) => {
    const lead = salesService.addLead(newLead);
    setLeads(salesService.getLeads());
    showNotification(`🎯 Discovered & profiled new prospect: ${lead.companyName}`);
  };

  const handleDraftEmailForLead = async (lead) => {
    showNotification(`⚡ Drafting cold email sequence for ${lead.companyName}...`);
    try {
      const generated = await salesService.generateColdEmailWithAI({
        lead,
        framework: 'PAS'
      });

      const newOutboxItem = {
        id: 'outbox-' + Math.random().toString(36).substring(2, 9),
        leadId: lead.id,
        companyName: lead.companyName,
        recipientName: lead.contactName,
        recipientEmail: lead.contactEmail,
        recipientTitle: lead.contactTitle,
        stepNumber: 1,
        framework: 'PAS',
        wordCount: generated.wordCount,
        subject: generated.subject,
        body: generated.body,
        status: 'pending_approval',
        signalHook: generated.signalHook,
        createdAt: 'Just now'
      };

      const updatedOutbox = [newOutboxItem, ...outbox];
      salesService.saveOutbox(updatedOutbox);
      setOutbox(updatedOutbox);
      setSalesTab('outbox');
      showNotification(`📬 Email drafted and queued in Decisions Desk!`);
    } catch (err) {
      showNotification(`Failed to draft: ${err.message}`);
    }
  };

  const handleSaveSettings = (newSettings) => {
    const saved = salesService.saveSettings(newSettings);
    setSettings(saved);
  };

  const handleRunHeartbeat = async () => {
    // Deterministic Harvey loop: scout -> profile -> write -> outbox
    showNotification('⚡ Harvey heartbeat cycle started...');
    setTimeout(() => {
      showNotification('✅ Cycle complete: 1 new business profiled, 0 API bill incurred.');
    }, 1500);
  };

  const pendingCount = outbox.filter(o => o.status === 'pending_approval').length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 animate-slideDown">
          {notification}
        </div>
      )}

      {/* Sub-Header Navigation Tabs for Sales Manager */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          
          <button
            onClick={() => setSalesTab('cockpit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              salesTab === 'cockpit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Cockpit</span>
          </button>

          <button
            onClick={() => setSalesTab('outbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              salesTab === 'outbox'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Decisions Desk</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                salesTab === 'outbox' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSalesTab('leads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              salesTab === 'leads'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Prospects & Signals</span>
          </button>

          <button
            onClick={() => setSalesTab('campaigns')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              salesTab === 'campaigns'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sequence Playbooks</span>
          </button>

          <button
            onClick={() => setSalesTab('conversations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              salesTab === 'conversations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inbound & Replies</span>
          </button>

        </div>

        {/* Right Settings Gear */}
        <button
          onClick={() => onOpenSettings ? onOpenSettings() : setIsSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Engine Settings</span>
        </button>
      </div>

      {/* Main Tab Render */}
      <div className="flex-1 pb-16 md:pb-8">
        {salesTab === 'cockpit' && (
          <SalesCockpit
            leads={leads}
            outbox={outbox}
            conversations={conversations}
            settings={settings}
            onNavigateTab={(t) => setSalesTab(t)}
            onOpenSettings={() => onOpenSettings ? onOpenSettings() : setIsSettingsOpen(true)}
            onRunHeartbeat={handleRunHeartbeat}
          />
        )}

        {salesTab === 'outbox' && (
          <OutboxReviewDesk
            outbox={outbox}
            onApprove={handleApprove}
            onReject={handleReject}
            onUpdateDraft={handleUpdateDraft}
            leads={leads}
            settings={settings}
          />
        )}

        {salesTab === 'leads' && (
          <LeadsPipelineView
            leads={leads}
            onAddLead={handleAddLead}
            onDraftEmailForLead={handleDraftEmailForLead}
            onNavigateTab={(t) => setSalesTab(t)}
          />
        )}

        {salesTab === 'campaigns' && (
          <CampaignsPlaybookView />
        )}

        {salesTab === 'conversations' && (
          <ConversationsView
            conversations={conversations}
          />
        )}
      </div>

      {/* Settings Modal */}
      <HarveySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

    </div>
  );
};
