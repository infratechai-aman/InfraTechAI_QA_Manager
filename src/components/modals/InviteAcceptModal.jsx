import React, { useState } from 'react';
import { 
  Sparkles, Check, X, Shield, Users, 
  Briefcase, ArrowRight, Play, Bug as BugIcon, BarChart2, Loader2 
} from 'lucide-react';
import { getUserColor, getUserInitial } from '../../utils/formatters';

export const InviteAcceptModal = ({
  isOpen,
  invite,
  onAccept,
  onDecline,
  onClose
}) => {
  const [isAccepting, setIsAccepting] = useState(false);

  if (!isOpen || !invite) return null;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(invite);
    } finally {
      setIsAccepting(false);
    }
  };

  const inviterColor = getUserColor(invite.inviterEmail || 'owner');
  const inviterInitial = getUserInitial(invite.inviterEmail || 'Owner');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with vibrant collaborative gradient */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Sparkles size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 block">
                  Workspace Invitation
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">
                  You're Invited to Collaborate!
                </h2>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Inviter Info Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl ${inviterColor.bg} ${inviterColor.text} ${inviterColor.border} border font-black text-base flex items-center justify-center shrink-0 shadow-xs`}>
              {inviterInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 font-medium">Invited by</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {invite.inviterEmail || 'Workspace Owner'}
              </p>
            </div>
          </div>

          {/* Project Details Showcase */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Target Workspace
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                <Shield size={12} className="text-indigo-600" />
                {invite.role || 'QA Tester'}
              </span>
            </div>

            <h3 className="text-2xl font-black text-indigo-950 tracking-tight">
              {invite.projectName || 'QA Workspace'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Join this project to execute active test suites, submit defect reports, and participate in collaborative QA with separated work attribution.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Play size={14} />
              </div>
              <p className="text-[11px] font-bold text-slate-800">Test Execution</p>
              <p className="text-[10px] text-slate-500">Tagged with your email</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <BugIcon size={14} />
              </div>
              <p className="text-[11px] font-bold text-slate-800">Bug Tracking</p>
              <p className="text-[10px] text-slate-500">Report & track defects</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <BarChart2 size={14} />
              </div>
              <p className="text-[11px] font-bold text-slate-800">Work Split</p>
              <p className="text-[10px] text-slate-500">Separate owner/tester stats</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {onDecline && (
              <button
                type="button"
                onClick={() => onDecline(invite.id)}
                disabled={isAccepting}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Decline
              </button>
            )}
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              {isAccepting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Joining Workspace...</span>
                </>
              ) : (
                <>
                  <Check size={17} strokeWidth={2.5} />
                  <span>Accept & Join Workspace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
