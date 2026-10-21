import React, { useState } from 'react';
import { 
  MessageSquare, Bot, Send, Clock, Trash2, Plus, X, UserCheck
} from 'lucide-react';
import { getTimestamp } from '../../utils/formatters';

export const ConversationsView = ({ 
  conversations = [], 
  onSendReply, 
  onAddConversation,
  onDeleteConversation,
  leads = [] 
}) => {
  const [selectedConvId, setSelectedConvId] = useState(conversations[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLogReplyModalOpen, setIsLogReplyModalOpen] = useState(false);
  const [newLogForm, setNewLogForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    inboundText: ''
  });

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApproveDraft = (draftContent) => {
    if (!activeConv) return;
    const sentMsg = {
      sender: 'harvey',
      sentAt: 'Just now',
      content: draftContent
    };
    if (onSendReply) {
      onSendReply(activeConv.id, sentMsg);
    }
    showToast(`✅ Response sent to ${activeConv.contactName}`);
  };

  const handleSendCustomReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    const sentMsg = {
      sender: 'harvey',
      sentAt: 'Just now',
      content: replyText.trim()
    };
    if (onSendReply) {
      onSendReply(activeConv.id, sentMsg);
    }
    setReplyText('');
    showToast(`✅ Reply sent to ${activeConv.contactName}`);
  };

  const handleCreateInboundLog = (e) => {
    e.preventDefault();
    if (!newLogForm.companyName.trim() || !newLogForm.inboundText.trim()) return;

    // Craft high-converting LAARC objection draft
    const laarcDraft = `Hi ${newLogForm.contactName.split(' ')[0] || 'there'} — fair point. Many engineering teams face that exact transition.\n\nInfratechAI is purpose-built to eliminate testing lag: Linear-speed keyboard hotkeys (P/F/B), zero page load delays, and instant bug synchronization with your devs.\n\nWould you be open to a 5-minute live run-through this Thursday to see the speed difference?`;

    const newConv = {
      companyName: newLogForm.companyName.trim(),
      contactName: newLogForm.contactName.trim() || 'Decision Maker',
      contactEmail: newLogForm.contactEmail.trim() || `contact@${newLogForm.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      stage: 'qualifying',
      lastReplyTime: 'Just now',
      messages: [
        {
          sender: 'prospect',
          sentAt: 'Just now',
          content: newLogForm.inboundText.trim()
        },
        {
          sender: 'harvey_draft',
          sentAt: 'Waiting for your review',
          framework: 'LAARC (Listen-Acknowledge-Assess-Respond-Confirm)',
          content: laarcDraft
        }
      ]
    };

    if (onAddConversation) {
      const created = onAddConversation(newConv);
      if (created?.id) setSelectedConvId(created.id);
    }

    setIsLogReplyModalOpen(false);
    setNewLogForm({ companyName: '', contactName: '', contactEmail: '', inboundText: '' });
    showToast(`🎯 Logged inbound message and generated LAARC draft!`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Toast */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 animate-slideUp">
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Inbound Replies & LAARC Objection Handling
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            When prospects reply, Harvey classifies intent and drafts structured responses using the LAARC loop.
          </p>
        </div>

        <button
          onClick={() => setIsLogReplyModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Prospect Reply</span>
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 md:p-16 border border-slate-200 text-center max-w-xl mx-auto shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Zero Inbound Messages Yet</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When real prospects reply to your cold emails, log their objection or inquiry here to automatically trigger Harvey's LAARC framework response.
            </p>
          </div>
          <button
            onClick={() => setIsLogReplyModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log First Prospect Reply</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Conversations Rail (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Active Dialogues ({conversations.length})
            </span>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {conversations.map((c) => {
                const isSelected = c.id === activeConv?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]">{c.companyName}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 capitalize">
                        {c.stage}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">{c.contactName}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {c.lastReplyTime}
                      </span>
                      {onDeleteConversation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(c.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete thread"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Active Thread (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            {activeConv ? (
              <>
                {/* Thread Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {activeConv.contactName} — {activeConv.companyName}
                    </h2>
                    <span className="text-xs font-mono text-slate-500">{activeConv.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Pipeline Stage:</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 capitalize">
                      {activeConv.stage}
                    </span>
                  </div>
                </div>

                {/* Message History */}
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {Array.isArray(activeConv.messages) && activeConv.messages.map((msg, idx) => {
                    const isHarvey = msg.sender === 'harvey';
                    const isDraft = msg.sender === 'harvey_draft';

                    if (isDraft) {
                      return (
                        <div key={idx} className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <Bot className="w-4 h-4 text-amber-700" />
                              Harvey Objection Response Draft ({msg.framework || 'LAARC'})
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                              Waiting for your review
                            </span>
                          </div>
                          <div className="text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-amber-200/80">
                            {msg.content}
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleApproveDraft(msg.content)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Approve & Send Objection Reply
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={idx}
                        className={`flex flex-col ${isHarvey ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 px-1">
                          {isHarvey ? 'You / Harvey Outbound' : activeConv.contactName} • {msg.sentAt}
                        </span>
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-xl whitespace-pre-wrap ${
                          isHarvey
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Direct Reply Bar */}
                <form onSubmit={handleSendCustomReply} className="flex gap-2 pt-3 border-t border-slate-100">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply directly to ${activeConv.contactName}...`}
                    className="flex-1 text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a conversation to view thread.
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: Log Inbound Reply */}
      {isLogReplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Log Inbound Prospect Message</h3>
              <button 
                onClick={() => setIsLogReplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInboundLog} className="space-y-3 text-xs">
              {leads.length > 0 && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pick from Pipeline (Optional)</label>
                  <select
                    onChange={(e) => {
                      const selected = leads.find(l => l.id === e.target.value);
                      if (selected) {
                        setNewLogForm(prev => ({
                          ...prev,
                          companyName: selected.companyName,
                          contactName: selected.contactName,
                          contactEmail: selected.contactEmail
                        }));
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">-- Choose target lead --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.companyName} ({l.contactName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Flow Tech"
                  value={newLogForm.companyName}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={newLogForm.contactName}
                    onChange={(e) => setNewLogForm(prev => ({ ...prev, contactName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="marcus@apexflow.io"
                    value={newLogForm.contactEmail}
                    onChange={(e) => setNewLogForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prospect Inbound Message / Question *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Thanks for reaching out. We currently use Jira spreadsheets. How does InfratechAI compare?"
                  value={newLogForm.inboundText}
                  onChange={(e) => setNewLogForm(prev => ({ ...prev, inboundText: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogReplyModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  Log & Generate LAARC Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
