import React, { useState } from 'react';
import { Bug as BugIcon, XCircle, AlertCircle } from 'lucide-react';

export const BugModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    severity: initialData?.severity || 'High',
    priority: initialData?.priority || 'P1',
    actualBehavior: initialData?.actualBehavior || '',
    expectedBehavior: initialData?.expectedBehavior || '',
    reproductionSteps: initialData?.reproductionSteps || '',
    testCaseId: initialData?.testCaseId || null,
    projectId: initialData?.projectId || null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <BugIcon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Log Defect / Bug</h2>
              <p className="text-xs text-slate-500">Record an issue detected during test execution.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Defect Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-900"
                placeholder="e.g. Rate limit header missing after 5 failed attempts"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="Critical">Critical (System Down / Blocker)</option>
                  <option value="High">High (Major Feature Broken)</option>
                  <option value="Medium">Medium (Minor Glitch)</option>
                  <option value="Low">Low (Cosmetic / Trivial)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="P0">P0 (Immediate Hotfix)</option>
                  <option value="P1">P1 (High Priority)</option>
                  <option value="P2">P2 (Normal Sprint)</option>
                  <option value="P3">P3 (Backlog / Low)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Actual Behavior</label>
              <textarea
                value={formData.actualBehavior}
                onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none font-medium text-slate-800"
                rows={3}
                placeholder="Describe what occurred unexpectedly..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expected Behavior</label>
              <textarea
                value={formData.expectedBehavior}
                onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none bg-slate-50 text-slate-700 font-medium"
                rows={2}
                placeholder="What was supposed to happen according to requirements?"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Steps to Reproduce</label>
              <textarea
                value={formData.reproductionSteps}
                onChange={(e) => setFormData({ ...formData, reproductionSteps: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none font-mono text-xs text-slate-700"
                rows={3}
                placeholder="1. Go to page...&#10;2. Click on...&#10;3. Observe..."
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-sm shadow-rose-200 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <BugIcon size={16} /> Save Defect
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
