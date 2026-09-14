import React from 'react';
import { Sparkles, Check, X, Users, ArrowRight } from 'lucide-react';

export const InvitationBanner = ({ 
  invitations = [], 
  onAccept, 
  onDecline 
}) => {
  if (!invitations || invitations.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-6 py-3 border-b border-indigo-700/50 shadow-md relative z-30 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {invitations.map((inv) => (
          <div key={inv.id} className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                  <span>🎉 You have been invited by</span>
                  <span className="text-indigo-200 underline underline-offset-2">{inv.inviterEmail || 'Team Admin'}</span>
                  <span>to collaborate on</span>
                  <span className="font-extrabold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {inv.projectName}
                  </span>
                </p>
                <p className="text-[11px] text-indigo-200 mt-0.5">
                  Assigned role: <strong className="text-white">{inv.role || 'QA Tester'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onDecline(inv.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept(inv)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/30 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Accept & Join Workspace</span>
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};
