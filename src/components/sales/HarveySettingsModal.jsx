import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Bot, Key, ExternalLink, Briefcase, Trash2, Moon, ShieldCheck,
  Mail, CheckCircle2, AlertCircle, RefreshCw, Lock, Terminal
} from 'lucide-react';
import { salesService } from '../../services/salesService';

export const HarveySettingsModal = ({ isOpen, onClose, settings = {}, onSave, onClearData }) => {
  const [formData, setFormData] = useState({ ...settings });
  const [toast, setToast] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isVerifyingGmail, setIsVerifyingGmail] = useState(false);
  const [gmailVerifyResult, setGmailVerifyResult] = useState(null);
  const [daemonStatus, setDaemonStatus] = useState({ checked: false, isOnline: false });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
      // Probe local mailer daemon status
      salesService.checkDaemonStatus().then(status => {
        setDaemonStatus({ checked: true, isOnline: status.isOnline });
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handlePersonaChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      persona: { ...prev.persona, [field]: val }
    }));
  };

  const handleTestGmailConnection = async () => {
    if (!formData.gmailAddress || !formData.gmailAppPassword) {
      setGmailVerifyResult({ success: false, message: 'Please enter both your Gmail Address and 16-character App Password.' });
      return;
    }

    setIsVerifyingGmail(true);
    setGmailVerifyResult(null);
    try {
      const res = await salesService.verifyGmailCredentials(formData.gmailAddress, formData.gmailAppPassword);
      setGmailVerifyResult(res);
      if (res.success) {
        setDaemonStatus(prev => ({ ...prev, isOnline: true }));
      }
    } catch (err) {
      setGmailVerifyResult({ success: false, message: err.message || 'Cannot reach Harvey Mailer Daemon at localhost:5555' });
    } finally {
      setIsVerifyingGmail(false);
    }
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    setToast('Settings saved successfully!');
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp my-8">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Harvey Engine & Gmail Configuration</h2>
              <p className="text-xs text-slate-400">Direct Gmail Dispatch, $499-$899 pricing, 24h demo rules & Sleep Autopilot</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* SECTION 1: DIRECT GMAIL SETUP (100% FREE & SAFE) */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/50 rounded-2xl border border-indigo-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-600" />
                Direct Gmail Setup (Google App Password)
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  daemonStatus.isOnline
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {daemonStatus.isOnline ? '● Mailer Daemon Ready' : '○ Daemon Offline (npm run daemon)'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  100% Free & Safe
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Harvey will send cold emails and reply to clients directly from your genuine personal Gmail (Google gives 500 emails/day free). You never share your real password; only a 16-letter isolated Google App Password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-700 block mb-1 font-semibold">Your Gmail Address *</span>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={formData.gmailAddress || ''}
                  onChange={(e) => handleChange('gmailAddress', e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-700 font-semibold">16-Letter App Password *</span>
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-0.5 text-[10px] font-semibold"
                  >
                    Generate in Google <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="e.g. abcd efgh ijkl mnop"
                  value={formData.gmailAppPassword || ''}
                  onChange={(e) => handleChange('gmailAppPassword', e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="bg-white/80 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                How to generate your 16-letter Google App Password:
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600 leading-tight">
                <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">myaccount.google.com/security</a> and make sure 2-Step Verification is ON.</li>
                <li>Search <strong>"App passwords"</strong> in the search bar.</li>
                <li>Enter app name <strong>SalesManager</strong> and copy the 16-letter password into the box above.</li>
              </ol>
            </div>

            {/* Test Connection Button & Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestGmailConnection}
                disabled={isVerifyingGmail}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-all disabled:opacity-50 self-start"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingGmail ? 'animate-spin' : ''}`} />
                <span>{isVerifyingGmail ? 'Verifying with Google...' : 'Test Gmail Connection'}</span>
              </button>

              <div className="text-[11px]">
                {!daemonStatus.isOnline && (
                  <span className="text-amber-700 font-medium">
                    Run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">npm run daemon</code> in terminal to start mailer
                  </span>
                )}
              </div>
            </div>

            {gmailVerifyResult && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                gmailVerifyResult.success 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {gmailVerifyResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{gmailVerifyResult.message || (gmailVerifyResult.success ? 'Gmail Connected Successfully!' : gmailVerifyResult.error)}</span>
              </div>
            )}
          </div>

          {/* SECTION 2: AI BRAIN PROVIDER */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Select AI Brain Provider
              </label>
              <span className="text-[10px] text-slate-500">Pick based on your preference</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                onClick={() => handleChange('provider', 'gemini')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 relative ${
                  formData.provider === 'gemini'
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Infratech Neural SDR</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    High Speed
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Proprietary high-velocity outbound engine. Anti-AI tone filter with zero robotic clichés.
                </p>
              </div>

              <div 
                onClick={() => handleChange('provider', 'claude')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 relative ${
                  formData.provider === 'claude'
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Claude 3.7 / 3.5</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Sonnet
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Natural human consultative tone for cold outreach.
                </p>
              </div>

              <div 
                onClick={() => handleChange('provider', 'codex')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 relative ${
                  formData.provider === 'codex'
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">OpenAI GPT-4o</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Advanced reasoning model for enterprise pitch angles.
                </p>
              </div>
            </div>

            {/* Neural Engine Cloud API Key input */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  Google Gemini API Key (Enables real-time dynamic AI generations)
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                >
                  Get Free API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="Paste API key here (Built-in engine operates automatically if blank)..."
                value={formData.geminiApiKey || ''}
                onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                className="w-full font-mono text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 3: Persona Details (Strict Human Employee Mode) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Sender Persona (Harvey Signs As)
              </label>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Employee Mode (Never Disclose AI)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-600 block mb-1">Employee Name</span>
                <input
                  type="text"
                  value={formData.persona?.name || 'Harvey Ross'}
                  onChange={(e) => handlePersonaChange('name', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <span className="text-slate-600 block mb-1">Employee Title / Role</span>
                <input
                  type="text"
                  value={formData.persona?.role || 'Senior Web Consultant & Client Solutions'}
                  onChange={(e) => handlePersonaChange('role', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <span className="text-slate-600 block mb-1">Company Name</span>
                <input
                  type="text"
                  value={formData.persona?.company || 'InfratechAI'}
                  onChange={(e) => handlePersonaChange('company', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <span className="text-slate-600 block mb-1">Sender Email</span>
                <input
                  type="email"
                  value={formData.persona?.email || 'harvey@infratechai.com'}
                  onChange={(e) => handlePersonaChange('email', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Company Niche, Pricing & Portfolio Links */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Target Niche, Pricing ($499-$899) & Demo Link
              </label>
              <span className="text-[10px] text-slate-500">Injected into Harvey's sales engine</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-600 block mb-1 font-semibold">Your Niche & Offering</span>
                <input
                  type="text"
                  placeholder="e.g. House Keeping & Cleaning Services Web Modernization"
                  value={formData.companyNiche || 'House Keeping & Cleaning Services Web Modernization'}
                  onChange={(e) => handleChange('companyNiche', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-600 block mb-1 font-semibold">Price Mark / Pricing Anchor</span>
                  <input
                    type="text"
                    placeholder="e.g. $499 - $899 USD (Custom 24-hr interactive demo built before payment)"
                    value={formData.pricingMark || '$499 - $899 USD (Custom 24-hr interactive demo built before payment)'}
                    onChange={(e) => handleChange('pricingMark', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">AI negotiates dynamically between $499 and $899</span>
                </div>

                <div>
                  <span className="text-slate-600 block mb-1 font-semibold">Working Live Demo URL</span>
                  <input
                    type="url"
                    placeholder="https://housecleaning-998d3.web.app/"
                    value={formData.portfolioUrl || 'https://housecleaning-998d3.web.app/'}
                    onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Referenced in cold email and objection handling</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-600 block mb-1 font-semibold">Monthly Maintenance & Hosting</span>
                  <input
                    type="text"
                    placeholder="$20/mo or $200/yr (saves $40)"
                    value={formData.maintenanceNote || '$20/mo or $200/year (saves $40) for hosting & updates'}
                    onChange={(e) => handleChange('maintenanceNote', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Shared when client asks about ongoing hosting</span>
                </div>

                <div>
                  <span className="text-slate-600 block mb-1 font-semibold">Call / Meeting SLA</span>
                  <input
                    type="text"
                    placeholder="Lock in schedule within 24 hours"
                    value={formData.meetingSla || 'Schedule confirmed within 24 hours'}
                    onChange={(e) => handleChange('meetingSla', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">When client asks to jump on a call/Zoom</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 block mb-1 font-semibold">Core Value Proposition</span>
                <input
                  type="text"
                  placeholder="We turn outdated, sloppy cleaning company websites into high-converting booking machines"
                  value={formData.valueProposition || 'We turn outdated, sloppy cleaning company websites into high-converting booking machines with real-time quote calculators and mobile scheduling in under 24 hours'}
                  onChange={(e) => handleChange('valueProposition', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Sleep Autopilot Mode & Approval Gate */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Autonomous Operation & Sleep Autopilot
            </label>
            
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-emerald-600" />
                  Sleep Autopilot Mode ("Work as I sleep")
                </div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  When active, Harvey auto-negotiates incoming client replies, promises 24-hr custom previews, and queues deals autonomously 24/7.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autopilotMode !== false}
                onChange={(e) => handleChange('autopilotMode', e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer accent-emerald-600 shrink-0"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-800 text-xs">Decisions Desk Gate (Cold Outreach)</div>
                <div className="text-slate-500 text-[11px]">
                  When ON, new outbound cold emails wait in the Decisions Desk for manual review before sending.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) => handleChange('requireApproval', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600 shrink-0"
              />
            </div>
          </div>

          {/* SECTION 6: Pipeline Data Reset */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block flex items-center justify-between">
              <span>Pipeline Data & Storage</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active House Cleaning Mode
              </span>
            </label>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Reset your pipeline to wipe cached records and reload clean defaults.
              </p>
              {showClearConfirm ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <p className="text-rose-800 text-[11px] font-bold">
                    Are you sure? This will delete all local pipeline leads, outbox drafts, and dialogues.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (onClearData) onClearData();
                        setShowClearConfirm(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Yes, Clear Everything
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Sales Data to Clean State</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-emerald-600 font-semibold">
            {toast || 'Target: US House Cleaning • $499-$899 • 24h Demo'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
