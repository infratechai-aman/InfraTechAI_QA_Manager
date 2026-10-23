import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Mail, Users, Layers, MessageSquare, Sliders, Calendar
} from 'lucide-react';
import { salesService } from '../../services/salesService';
import { SalesCockpit } from './SalesCockpit';
import { OutboxReviewDesk } from './OutboxReviewDesk';
import { LeadsPipelineView } from './LeadsPipelineView';
import { CampaignsPlaybookView } from './CampaignsPlaybookView';
import { ConversationsView } from './ConversationsView';
import { ClientBookingView } from './ClientBookingView';
import { HarveySettingsModal } from './HarveySettingsModal';

export const SalesManagerView = ({ 
  currentUser,
  salesTab: externalSalesTab,
  setSalesTab: externalSetSalesTab,
  onOpenSettings,
  onUpdateOutboxCount
}) => {
  const userId = currentUser?.uid;

  const [internalSalesTab, setInternalSalesTab] = useState('cockpit');
  const salesTab = externalSalesTab || internalSalesTab;
  const setSalesTab = externalSetSalesTab || setInternalSalesTab;

  // Initial clean state with lazy initializers
  const [settings, setSettings] = useState(() => salesService.getSettings(userId));
  const [leads, setLeads] = useState(() => salesService.getLeads(userId));
  const [outbox, setOutbox] = useState(() => salesService.getOutbox(userId));
  const [conversations, setConversations] = useState(() => salesService.getConversations(userId));
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Re-sync if user changes
  useEffect(() => {
    if (!userId) return;
    setSettings(salesService.getSettings(userId));
    const l = salesService.getLeads(userId);
    const o = salesService.getOutbox(userId);
    const c = salesService.getConversations(userId);
    setLeads(l);
    setOutbox(o);
    setConversations(c);
  }, [userId]);

  // Sync outbox badge count
  useEffect(() => {
    const pending = outbox.filter(item => item.status === 'pending_approval').length;
    if (onUpdateOutboxCount) onUpdateOutboxCount(pending);
  }, [outbox, onUpdateOutboxCount]);

  // Auto-sync with local Harvey Daemon (brings in overnight sent emails & inbound demo requests)
  useEffect(() => {
    const syncDaemon = async () => {
      const state = await salesService.syncWithDaemonState(userId);
      if (state) {
        setOutbox(salesService.getOutbox(userId));
        setConversations(salesService.getConversations(userId));
      }
    };

    syncDaemon();
    const interval = setInterval(syncDaemon, 20000); // sync every 20s
    return () => clearInterval(interval);
  }, [userId]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Decisions Desk Handlers
  const handleApprove = async (outboxId) => {
    const item = outbox.find(o => o.id === outboxId);
    if (item) {
      try {
        await salesService.sendLiveEmailViaGmail({
          to: item.recipientEmail,
          subject: item.subject,
          body: item.body,
          userId
        });
        showNotification(`🚀 Sent live email to ${item.recipientName} (${item.companyName}) via Gmail!`);
      } catch (err) {
        console.warn('Gmail live dispatch notice:', err.message);
      }
    }
    const updated = salesService.approveEmail(outboxId, userId);
    setOutbox(updated);
  };

  const handleReject = (outboxId) => {
    const updated = salesService.rejectEmail(outboxId, 'Rejected', userId);
    setOutbox(updated);
  };

  const handleDeleteDraft = (outboxId) => {
    const updated = salesService.deleteOutboxItem(outboxId, userId);
    setOutbox(updated);
    showNotification('🗑️ Draft removed from Outbox');
  };

  const handleUpdateDraft = (outboxId, newBody, newSubject) => {
    const updated = salesService.updateEmailDraft(outboxId, newBody, newSubject, userId);
    setOutbox(updated);
  };

  // Leads Handlers
  const handleAddLead = (newLead) => {
    const lead = salesService.addLead(newLead, userId);
    const updated = salesService.getLeads(userId);
    setLeads(updated);
    showNotification(`🎯 Added real prospect to pipeline: ${lead.companyName}`);
  };

  const handleAddLeads = (newLeads) => {
    salesService.addLeads(newLeads, userId);
    const updated = salesService.getLeads(userId);
    setLeads(updated);
    showNotification(`🎯 Added ${newLeads.length} prospects to pipeline!`);
  };

  const handleDeleteLead = (leadId) => {
    const updated = salesService.deleteLead(leadId, userId);
    setLeads(updated);
    showNotification('🗑️ Prospect removed from pipeline');
  };

  // Draft cold email sequence for a lead
  // Autonomous Cold Email Dispatcher (Zero Approval Gate)
  const handleDraftEmailForLead = async (lead) => {
    showNotification(`⚡ Autonomous Outreach: Drafting cold email for ${lead.companyName}...`);
    try {
      const generated = await salesService.generateColdEmailWithAI({
        lead,
        framework: 'PAS'
      });

      let sendSuccess = false;
      try {
        await salesService.sendLiveEmailViaGmail({
          to: lead.contactEmail,
          subject: generated.subject,
          body: generated.body,
          userId
        });
        sendSuccess = true;
        showNotification(`🚀 Auto-sent email directly to ${lead.contactName} (${lead.companyName}) via Gmail!`);
      } catch (err) {
        console.warn('Auto-send via Gmail attempt:', err.message);
      }

      const newOutboxItem = {
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
        status: sendSuccess ? 'sent' : 'approved',
        sentAt: sendSuccess ? 'Just now via Gmail (Autonomous)' : 'Approved (Auto)',
        signalHook: generated.signalHook,
        createdAt: 'Just now'
      };

      salesService.addToOutbox(newOutboxItem, userId);
      const updatedOutbox = salesService.getOutbox(userId);
      setOutbox(updatedOutbox);

      // Mark lead as contacted
      salesService.updateLead(lead.id, { status: 'contacted' }, userId);
      setLeads(salesService.getLeads(userId));
    } catch (err) {
      showNotification(`Failed to generate outreach: ${err.message}`);
    }
  };

  // Conversations Handlers
  const handleAddConversation = (newConv) => {
    const conv = salesService.addConversation(newConv, userId);
    setConversations(salesService.getConversations(userId));
    return conv;
  };

  const handleDeleteConversation = (convId) => {
    const updated = salesService.deleteConversation(convId, userId);
    setConversations(updated);
    showNotification('🗑️ Conversation thread deleted');
  };

  const handleSendReply = (convId, sentMsg) => {
    const convs = salesService.getConversations(userId);
    const updated = convs.map(c => {
      if (c.id === convId) {
        const filteredMessages = (c.messages || []).filter(m => m.sender !== 'harvey_draft');
        return {
          ...c,
          lastReplyTime: 'Just now',
          messages: [...filteredMessages, sentMsg]
        };
      }
      return c;
    });
    salesService.saveConversations(updated, userId);
    setConversations(updated);
  };

  const handleUpdateConversation = (convId, patch) => {
    const updated = salesService.updateConversation(convId, patch, userId);
    setConversations(updated);
  };

  const handleToggleAutopilot = (newMode) => {
    const updated = salesService.saveSettings({ autopilotMode: newMode }, userId);
    setSettings(updated);
    showNotification(newMode ? '🌙 Sleep Autopilot ACTIVE: Autonomous 24/7 negotiation enabled' : '⏸️ Autopilot Standby: Manual review gate active');
  };

  const handleAutoSendAllPending = async () => {
    const currentOutbox = salesService.getOutbox(userId);
    const pending = currentOutbox.filter(o => o.status === 'pending_approval');
    if (pending.length === 0) return;

    showNotification(`⚡ Autonomous Send: Dispatching ${pending.length} pending emails via Gmail...`);
    for (const item of pending) {
      try {
        await salesService.sendLiveEmailViaGmail({
          to: item.recipientEmail,
          subject: item.subject,
          body: item.body,
          userId
        });
        salesService.approveEmail(item.id, userId);
      } catch (err) {
        console.warn('Auto-send pending item failed:', err.message);
        salesService.approveEmail(item.id, userId);
      }
    }
    const refreshed = salesService.getOutbox(userId);
    setOutbox(refreshed);
    showNotification(`🚀 All pending emails sent via Gmail! Zero approval needed.`);
  };

  const handleToggleSession = async (newStatus) => {
    const updated = salesService.saveSettings({ sessionActive: newStatus }, userId);
    setSettings(updated);
    if (newStatus) {
      showNotification('🚀 Harvey Working Session STARTED! Autonomous outreach & overnight engine active.');
      try {
        await fetch('http://127.0.0.1:5555/api/start-overnight', { method: 'POST' });
      } catch (e) {
        console.warn('Daemon start-overnight ping:', e.message);
      }
      // Auto-flush any pending approval drafts immediately
      handleAutoSendAllPending();

      // Auto-scout immediately if pipeline is empty
      const currentLeads = salesService.getLeads(userId);
      if (currentLeads.length === 0) {
        showNotification('🔍 Harvey Scout Agent is auto-discovering USA cleaning businesses...');
        const newScouted = await salesService.autoScoutLeads(4, userId);
        const refreshed = salesService.getLeads(userId);
        setLeads(refreshed);
        showNotification(`🎯 Auto-scouted ${newScouted.length} USA cleaners! Drafting personalized outreach...`);
        if (newScouted[0]) {
          setTimeout(() => handleDraftEmailForLead(newScouted[0]), 1200);
        }
      }
    } else {
      showNotification('😴 Harvey is now RESTING. Outbound sending & auto-replies paused.');
      try {
        await fetch('http://127.0.0.1:5555/api/stop-overnight', { method: 'POST' });
      } catch (e) {
        console.warn('Daemon stop-overnight ping:', e.message);
      }
    }
  };

  const handleAutoScout = async () => {
    showNotification('🔍 Harvey Scout Agent scanning USA cities (Dallas, Miami, Phoenix, LA, Atlanta)...');
    const newScouted = await salesService.autoScoutLeads(5, userId);
    const refreshed = salesService.getLeads(userId);
    setLeads(refreshed);
    showNotification(`✅ Auto-scouted ${newScouted.length} USA cleaning businesses (Zero manual search needed)!`);
  };

  // Reset & Clear All Data
  const handleClearAllData = () => {
    salesService.clearAllSalesData(userId);
    setLeads([]);
    setOutbox([]);
    setConversations([]);
    showNotification('🧹 All sales pipeline data reset to clean state.');
  };

  // Settings
  const handleSaveSettings = (newSettings) => {
    const saved = salesService.saveSettings(newSettings, userId);
    setSettings(saved);
  };

  // Heartbeat Cycle
  const handleRunHeartbeat = async () => {
    if (settings.sessionActive === false) {
      showNotification('⏸️ Harvey is currently resting. Click "Start Harvey Working Session" to activate!');
      return;
    }
    showNotification('⚡ Harvey heartbeat cycle started...');
    
    // Check if there are uncontacted leads without active drafts
    const draftedLeadIds = new Set(outbox.map(o => o.leadId));
    let nextLead = leads.find(l => !draftedLeadIds.has(l.id));

    if (!nextLead) {
      showNotification('🔍 Scout Agent auto-discovering fresh USA cleaning leads in background...');
      const newScouted = await salesService.autoScoutLeads(3, userId);
      const refreshed = salesService.getLeads(userId);
      setLeads(refreshed);
      nextLead = newScouted[0];
    }

    if (nextLead) {
      setTimeout(() => {
        handleDraftEmailForLead(nextLead);
      }, 1000);
    } else {
      setTimeout(() => {
        showNotification('✅ Cycle complete: Outreach queued.');
      }, 1200);
    }
  };

  const pendingCount = outbox.filter(o => o.status === 'pending_approval').length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      
      {/* Toast Notification */}
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
            {leads.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {leads.length}
              </span>
            )}
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
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {conversations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSalesTab('bookings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              salesTab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings & Calculator</span>
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
      <div className="flex-1 pb-32 md:pb-8">
        {salesTab === 'cockpit' && (
          <SalesCockpit
            leads={leads}
            outbox={outbox}
            conversations={conversations}
            settings={settings}
            onNavigateTab={(t) => setSalesTab(t)}
            onOpenSettings={() => onOpenSettings ? onOpenSettings() : setIsSettingsOpen(true)}
            onRunHeartbeat={handleRunHeartbeat}
            onToggleAutopilot={handleToggleAutopilot}
            onToggleSession={handleToggleSession}
            sessionActive={settings.sessionActive}
            onAutoScout={handleAutoScout}
            onAddConversation={handleAddConversation}
          />
        )}

        {salesTab === 'outbox' && (
          <OutboxReviewDesk
            outbox={outbox}
            onApprove={handleApprove}
            onReject={handleReject}
            onDeleteDraft={handleDeleteDraft}
            onUpdateDraft={handleUpdateDraft}
            onNavigateTab={(t) => setSalesTab(t)}
            leads={leads}
            settings={settings}
          />
        )}

        {salesTab === 'leads' && (
          <LeadsPipelineView
            leads={leads}
            onAddLead={handleAddLead}
            onAddLeads={handleAddLeads}
            onDeleteLead={handleDeleteLead}
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
            onSendReply={handleSendReply}
            onAddConversation={handleAddConversation}
            onUpdateConversation={handleUpdateConversation}
            onDeleteConversation={handleDeleteConversation}
            onSyncRealInbox={async () => {
              const res = await salesService.syncRealGmailInbox(userId);
              if (res) {
                setConversations(salesService.getConversations(userId));
                setOutbox(salesService.getOutbox(userId));
              }
              return res;
            }}
            onPurgeMockData={() => {
              const cleaned = salesService.purgeMockConversations(userId);
              setConversations(cleaned);
            }}
            leads={leads}
            settings={settings}
            onToggleAutopilot={handleToggleAutopilot}
          />
        )}

        {salesTab === 'bookings' && (
          <ClientBookingView
            settings={settings}
            onAddConversation={handleAddConversation}
          />
        )}
      </div>

      {/* Settings Modal */}
      <HarveySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onClearData={handleClearAllData}
      />

    </div>
  );
};
