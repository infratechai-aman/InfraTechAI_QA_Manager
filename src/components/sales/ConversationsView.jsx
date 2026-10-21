import React, { useState } from 'react';
import { 
  MessageSquare, User, Bot, Send, CheckCircle2, 
  ArrowRight, ShieldCheck, Sparkles, Clock, Flame 
} from 'lucide-react';

export const ConversationsView = ({ conversations = [], onSendReply }) => {
  const [selectedConvId, setSelectedConvId] = useState(conversations[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [feedback, setFeedback] = useState(null);

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const handleApproveDraft = (draftContent) => {
    setFeedback(`✅ Response sent to ${activeConv.contactName}`);
    setTimeout(() => setFeedback(null), 3000);
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
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Inbound Replies & LAARC Objection Handling
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          When prospects reply, Harvey classifies intent and drafts structured responses using the LAARC loop (Listen → Acknowledge → Assess → Respond → Confirm).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Conversations Rail (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Active Dialogues ({conversations.length})
          </span>

          {conversations.map((c) => {
            const isSelected = c.id === activeConv?.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedConvId(c.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-400 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">{c.companyName}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 capitalize">
                    {c.stage}
                  </span>
                </div>
                <div className="text-xs text-slate-600">{c.contactName}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {c.lastReplyTime}
                </div>
              </div>
            );
          })}
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
              <div className="space-y-4">
                {activeConv.messages.map((msg, idx) => {
                  const isHarvey = msg.sender === 'harvey';
                  const isDraft = msg.sender === 'harvey_draft';

                  if (isDraft) {
                    return (
                      <div key={idx} className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-amber-700" />
                            Harvey Objection Response Draft ({msg.framework})
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
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a conversation to view thread.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
