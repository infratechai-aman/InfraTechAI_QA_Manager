import React, { useState } from 'react';
import { 
  X, Check, Sparkles, Bot, ShieldCheck, Mail, 
  Key, Globe, ExternalLink, Zap, Sliders, CheckCircle2 
} from 'lucide-react';

export const HarveySettingsModal = ({ isOpen, onClose, settings = {}, onSave }) => {
  const [formData, setFormData] = useState({ ...settings });
  const [toast, setToast] = useState(null);

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Harvey Engine & Brain Configuration</h2>
              <p className="text-xs text-slate-400">Customize AI model brain, persona, and autonomous rules</p>
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
          
          {/* SECTION 1: AI BRAIN PROVIDER (Gemini vs Claude vs Codex) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Select AI Brain Provider
              </label>
              <span className="text-[10px] text-slate-500">Pick based on your preference</span>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Infratech Neural Engine Card */}
              <div 
                onClick={() => handleChange('provider', 'gemini')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 relative ${
                  formData.provider === 'gemini'
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Infratech Neural Engine</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    High Speed
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Proprietary high-velocity outbound engine. Anti-AI tone filter with zero robotic clichés.
                </p>
              </div>

              {/* Anthropic Claude Card (Claude Code CLI / Sub) */}
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
                  Engineering peer-to-peer style with natural human phrasing.
                </p>
              </div>

              {/* OpenAI Codex / GPT Card */}
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
                  Neural Engine Cloud API Key (Optional for instant live generations)
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
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

          {/* SECTION 2: Persona Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Sender Persona (Harvey Signs As)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-600 block mb-1">Your Full Name</span>
                <input
                  type="text"
                  value={formData.persona?.name || ''}
                  onChange={(e) => handlePersonaChange('name', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <span className="text-slate-600 block mb-1">Your Title / Role</span>
                <input
                  type="text"
                  value={formData.persona?.role || ''}
                  onChange={(e) => handlePersonaChange('role', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <span className="text-slate-600 block mb-1">Company Name</span>
                <input
                  type="text"
                  value={formData.persona?.company || ''}
                  onChange={(e) => handlePersonaChange('company', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <span className="text-slate-600 block mb-1">Sender Email</span>
                <input
                  type="email"
                  value={formData.persona?.email || ''}
                  onChange={(e) => handlePersonaChange('email', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Company Niche, Pricing & Portfolio Links */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Company Niche, Pricing & Portfolio Link
              </label>
              <span className="text-[10px] text-slate-500">Injected into Harvey's cold email engine</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-600 block mb-1 font-semibold">Your Niche & What We Solve</span>
                <input
                  type="text"
                  placeholder="e.g. Full-cycle automated QA, test execution & regression suites for SaaS"
                  value={formData.companyNiche || ''}
                  onChange={(e) => handleChange('companyNiche', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-600 block mb-1 font-semibold">Price Mark / Pricing Anchor</span>
                  <input
                    type="text"
                    placeholder="e.g. $499/project or $1,200/mo flat QA coverage"
                    value={formData.pricingMark || ''}
                    onChange={(e) => handleChange('pricingMark', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Used by Harvey when prospects ask about pricing</span>
                </div>

                <div>
                  <span className="text-slate-600 block mb-1 font-semibold">Portfolio / Case Studies URL</span>
                  <input
                    type="url"
                    placeholder="e.g. https://infratechai.com/portfolio"
                    value={formData.portfolioUrl || ''}
                    onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Included in email body as proof</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 block mb-1 font-semibold">Core Value Proposition</span>
                <input
                  type="text"
                  placeholder="e.g. We cut release defects by 80% without hiring $90k/yr QA engineers"
                  value={formData.valueProposition || ''}
                  onChange={(e) => handleChange('valueProposition', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Autonomous Approval Gate */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Safety & Autonomous Gates
            </label>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-800 text-xs">Human Approval Gate (Recommended)</div>
                <div className="text-slate-500 text-[11px]">
                  When ON, Harvey queues emails in the Decisions Desk for your 'A' approval before sending.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) => handleChange('requireApproval', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-emerald-600 font-bold text-xs">{toast}</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
