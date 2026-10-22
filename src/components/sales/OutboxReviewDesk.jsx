import React, { useState, useEffect } from 'react';
import { 
  Check, X, Edit3, Sparkles, User, Mail, Zap, 
  Copy, ExternalLink, Trash2 
} from 'lucide-react';
import { salesService } from '../../services/salesService';

export const OutboxReviewDesk = ({ 
  outbox = [], 
  onApprove, 
  onReject, 
  onDeleteDraft,
  onUpdateDraft,
  onNavigateTab,
  leads = [],
  settings = {}
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSendingLive, setIsSendingLive] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const pendingList = outbox.filter(item => item.status === 'pending_approval');
  const activeItem = pendingList[selectedIndex] || pendingList[0];

  useEffect(() => {
    if (activeItem) {
      setEditedSubject(activeItem.subject);
      setEditedBody(activeItem.body);
      setIsEditing(false);
    }
  }, [activeItem?.id]);

  // Keyboard navigation shortcuts: 'A' to Approve, 'R' to Reject
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing inside textarea or input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (!activeItem) return;

      if (e.key === 'a' || e.key === 'A') {
        handleApprove();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReject();
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        if (selectedIndex < pendingList.length - 1) setSelectedIndex(prev => prev + 1);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        if (selectedIndex > 0) setSelectedIndex(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, activeItem, pendingList.length]);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleApprove = async () => {
    if (!activeItem || isSendingLive) return;
    setIsSendingLive(true);
    try {
      showToast(`⚡ Dispatching live email to ${activeItem.recipientName} via your Gmail...`);
      await salesService.sendLiveEmailViaGmail({
        to: activeItem.recipientEmail,
        subject: editedSubject || activeItem.subject,
        body: editedBody || activeItem.body,
        userId: settings?.userId
      });
      showToast(`🚀 Dispatched live email to ${activeItem.recipientName} (${activeItem.companyName})! Check your Gmail Sent folder.`);
      if (onApprove) onApprove(activeItem.id);
      if (selectedIndex >= pendingList.length - 1 && selectedIndex > 0) {
        setSelectedIndex(prev => prev - 1);
      }
    } catch (err) {
      showToast(`❌ Live dispatch failed: ${err.message}`);
    } finally {
      setIsSendingLive(false);
    }
  };

  const handleApproveAndLaunchGmail = () => {
    if (!activeItem) return;
    const to = encodeURIComponent(activeItem.recipientEmail || '');
    const su = encodeURIComponent(editedSubject || activeItem.subject || '');
    const body = encodeURIComponent(editedBody || activeItem.body || '');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (onApprove) onApprove(activeItem.id);
    if (selectedIndex >= pendingList.length - 1 && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    }
  };

  const handleSendLiveViaGmail = async () => {
    await handleApprove();
  };

  const handleAutoSendAll = async () => {
    if (pendingList.length === 0) return;
    setIsSendingLive(true);
    let sentCount = 0;
    try {
      for (const item of pendingList) {
        try {
          await salesService.sendLiveEmailViaGmail({
            to: item.recipientEmail,
            subject: item.subject,
            body: item.body
          });
          if (onApprove) onApprove(item.id);
          sentCount++;
        } catch (err) {
          console.warn('Auto send live failed for:', item.companyName, err.message);
          if (onApprove) onApprove(item.id);
        }
      }
      showToast(`🚀 Dispatched ${sentCount} email(s) automatically via Gmail! Outbox cleared.`);
    } finally {
      setIsSendingLive(false);
    }
  };

  const handleCopyEmail = () => {
    if (!activeItem) return;
    const text = `To: ${activeItem.recipientEmail}\nSubject: ${editedSubject || activeItem.subject}\n\n${editedBody || activeItem.body}`;
    navigator.clipboard.writeText(text);
    showToast('📋 Copied email (To, Subject, Body) to clipboard!');
  };

  const handleReject = () => {
    if (!activeItem) return;
    if (onReject) onReject(activeItem.id);
    showToast(`❌ Rejected draft for ${activeItem.companyName}`);
    if (selectedIndex >= pendingList.length - 1 && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    }
  };

  const handleDelete = () => {
    if (!activeItem) return;
    if (onDeleteDraft) onDeleteDraft(activeItem.id);
    showToast(`🗑️ Deleted draft for ${activeItem.companyName}`);
    if (selectedIndex >= pendingList.length - 1 && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    }
  };

  const handleSaveEdit = () => {
    if (!activeItem) return;
    if (onUpdateDraft) onUpdateDraft(activeItem.id, editedBody, editedSubject);
    setIsEditing(false);
    showToast(`💾 Saved updated draft`);
  };

  const handleRegenerateWithAI = async () => {
    if (!activeItem) return;
    const lead = leads.find(l => l.id === activeItem.leadId) || {
      companyName: activeItem.companyName,
      domain: 'cleaningservice.com',
      industry: 'House Cleaning & Maid Services',
      location: 'United States',
      contactName: activeItem.recipientName,
      contactTitle: activeItem.recipientTitle || 'Owner',
      detectedSignals: [{ title: activeItem.signalHook || 'Sloppy legacy site lacking mobile booking' }],
      techStack: ['WordPress 2014', 'PHP']
    };

    setIsRegenerating(true);
    try {
      const generated = await salesService.generateColdEmailWithAI({
        lead,
        framework: activeItem.framework || 'PAS',
        customNotes: 'Keep it strictly under 55 words, highlight the 24-hr custom preview promise and link to https://housecleaning-998d3.web.app/'
      });
      setEditedSubject(generated.subject);
      setEditedBody(generated.body);
      if (onUpdateDraft) onUpdateDraft(activeItem.id, generated.body, generated.subject);
      showToast(`⚡ Regenerated draft with ${generated.modelUsed}`);
    } catch (err) {
      showToast(`Failed to regenerate: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const wordCount = (isEditing ? editedBody : activeItem?.body || '').trim().split(/\s+/).filter(Boolean).length;
  const isOverWordCap = wordCount > 75;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 animate-slideUp">
          {feedbackToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Harvey Decisions Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {pendingList.length} Awaiting Approval
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Deterministic pre-send gate. Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-800">A</kbd> to Approve, <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-800">R</kbd> to Reject, <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-800">J</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-800">K</kbd> to Navigate.
          </p>
        </div>

        {/* Actions & Hotkeys reminder */}
        <div className="flex items-center gap-3">
          {pendingList.length > 0 && (
            <button
              onClick={handleAutoSendAll}
              disabled={isSendingLive}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
              title="Dispatches all pending drafts immediately via Gmail without manual approval"
            >
              <Zap className={`w-3.5 h-3.5 ${isSendingLive ? 'animate-spin' : ''}`} />
              <span>{isSendingLive ? 'Sending All...' : `⚡ Auto-Send All (${pendingList.length}) via Gmail`}</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700">Shortcuts:</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold text-indigo-600">A</span> Approve
            <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold text-rose-600">R</span> Reject
          </div>
        </div>
      </div>

      {/* Autonomous Zero-Approval Notice Banner */}
      {pendingList.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Autonomous Mode: Zero Manual Approval Needed</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Auto-Dispatch Active
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Harvey sends cold emails automatically without waiting for your manual review. Click "Auto-Send All" to dispatch this draft immediately.
              </p>
            </div>
          </div>
          <button
            onClick={handleAutoSendAll}
            disabled={isSendingLive}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            {isSendingLive ? 'Dispatching...' : 'Auto-Send Pending Draft Now'}
          </button>
        </div>
      )}

      {pendingList.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center max-w-xl mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Outbox is 100% Cleared!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            All generated sales emails have been reviewed. When you scout or add real prospects in the pipeline, you can draft hyper-personalized sequences to review here.
          </p>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('leads')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Go to Prospects & Signals →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Inspection Desk (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Top Bar: Recipient Details */}
            <div className="p-5 bg-slate-50/80 border-b border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    {activeItem.companyName.charAt(0)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{activeItem.companyName}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        Step {activeItem.stepNumber} of 3
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{activeItem.recipientName} ({activeItem.recipientTitle})</span>
                      <span>•</span>
                      <Mail className="w-3.5 h-3.5" />
                      <span className="font-mono text-slate-700">{activeItem.recipientEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Word Count Indicator */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isOverWordCap 
                      ? 'bg-rose-50 text-rose-700 border-rose-300' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    {wordCount} / 75 Words Max
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                    {activeItem.framework}
                  </span>
                </div>
              </div>

              {/* Detected Signal Hook */}
              <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-950">Detected Buying Signal Hook: </span>
                  <span className="text-indigo-800">{activeItem.signalHook}</span>
                </div>
              </div>
            </div>

            {/* Email Body & Subject Preview / Editor */}
            <div className="p-6 space-y-4">
              
              {/* Subject Line */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Subject Line
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-900 border border-indigo-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-sm font-bold text-slate-900 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                    {editedSubject}
                  </div>
                )}
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cold Email Draft Body
                  </label>
                  <button
                    onClick={handleRegenerateWithAI}
                    disabled={isRegenerating}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Rewrite with AI'}
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    rows={8}
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    className="w-full text-sm text-slate-800 font-sans border border-indigo-300 rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  />
                ) : (
                  <div className="text-sm text-slate-800 font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                    {editedBody}
                  </div>
                )}
              </div>

              {/* Action Buttons Desk */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Draft
                    </button>
                  )}

                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
                    title="Copy full email to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>

                  <button
                    onClick={handleApproveAndLaunchGmail}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95"
                    title="Open draft immediately in Gmail Web"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Open in Gmail Web</span>
                  </button>

                  <button
                    onClick={handleSendLiveViaGmail}
                    disabled={isSendingLive}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    title="Dispatch directly from your genuine Gmail via Harvey Mailer Daemon"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isSendingLive ? 'animate-spin' : ''}`} />
                    <span>{isSendingLive ? 'Sending via Gmail...' : '⚡ Send Live via Gmail'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95"
                    title="Delete Draft completely"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>

                  <button
                    onClick={handleReject}
                    className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                    <kbd className="hidden sm:inline-block px-1 py-0.5 bg-rose-200/60 rounded text-[10px] font-mono font-bold">R</kbd>
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={isSendingLive}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
                    title="Sends this cold outreach immediately via your personal Gmail account"
                  >
                    <Check className={`w-4 h-4 ${isSendingLive ? 'animate-spin' : ''}`} />
                    <span>{isSendingLive ? 'Dispatching...' : 'Approve & Send via Gmail'}</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-emerald-800/60 rounded text-[10px] font-mono font-bold">A</kbd>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Queue Rail (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Outbox Queue ({pendingList.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {pendingList.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {item.companyName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.wordCount}w
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {item.recipientName} ({item.recipientTitle})
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold truncate mt-1">
                      {item.signalHook}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
