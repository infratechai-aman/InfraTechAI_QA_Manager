import React, { useState, useMemo } from 'react';
import { 
  Bug as BugIcon, Plus, Search, Filter, Trash2, 
  ChevronDown, ChevronUp, RefreshCw, RotateCcw,
  History, Calendar, AlertTriangle, X
} from 'lucide-react';
import { 
  formatDate, formatTime,
  getBugStatusConfig, 
  getSeverityConfig, 
  getPriorityConfig,
  getTimestamp,
} from '../../utils/formatters';
import { BugModal } from '../modals/BugModal';

const ALL_STATUSES = ['Open', 'Reopened', 'In Progress', 'Resolved', 'Closed'];

export const BugsView = ({ 
  bugs, 
  onAddBug, 
  onUpdateBug, 
  onDeleteBug, 
  project, 
  tests 
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [expandedBugId, setExpandedBugId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reopen modal state
  const [reopenBugId, setReopenBugId] = useState(null);
  const [reopenReason, setReopenReason] = useState('');

  // Status counts — Reopened is counted in "Open" bucket for sidebar badge
  const counts = useMemo(() => ({
    total: bugs.length,
    open: bugs.filter((b) => b.status === 'Open').length,
    reopened: bugs.filter((b) => b.status === 'Reopened').length,
    inProgress: bugs.filter((b) => b.status === 'In Progress').length,
    resolved: bugs.filter((b) => b.status === 'Resolved').length,
    closed: bugs.filter((b) => b.status === 'Closed').length,
  }), [bugs]);

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const matchesStatus = statusFilter === 'All' || bug.status === statusFilter;
      const matchesSeverity = severityFilter === 'All' || bug.severity === severityFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        bug.title.toLowerCase().includes(q) ||
        bug.bugId?.toLowerCase().includes(q) ||
        bug.actualBehavior?.toLowerCase().includes(q);
      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [bugs, statusFilter, severityFilter, search]);

  const handleStatusChange = (bugId, newStatus) => {
    const bug = bugs.find(b => b.id === bugId);
    if (!bug) return;

    // If changing FROM Closed/Resolved TO a non-Reopened status directly, just update
    onUpdateBug(bugId, { status: newStatus });
  };

  // Reopen workflow: add a history entry, reset status to Reopened
  const handleReopen = () => {
    if (!reopenBugId) return;
    const bug = bugs.find(b => b.id === reopenBugId);
    if (!bug) return;

    const historyEntry = {
      timestamp: getTimestamp(),
      fromStatus: bug.status,
      toStatus: 'Reopened',
      reason: reopenReason.trim() || 'Regression — bug reappeared.',
    };

    const updatedHistory = [...(bug.regressionHistory || []), historyEntry];

    onUpdateBug(reopenBugId, {
      status: 'Reopened',
      regressionHistory: updatedHistory,
      regressionCount: (bug.regressionCount || 0) + 1,
    });

    setReopenBugId(null);
    setReopenReason('');
  };

  const reopenBug = bugs.find(b => b.id === reopenBugId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Defects & Issues</h1>
          <p className="text-slate-500 mt-1">
            Track and resolve bugs identified for <span className="font-semibold text-slate-800">{project?.name}</span>
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm shadow-rose-200 self-start sm:self-auto"
        >
          <Plus size={16} /> Log Defect
        </button>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'All Bugs', value: counts.total, key: 'All', activeClass: 'bg-slate-900 text-white border-slate-900', inactiveClass: 'bg-white text-slate-700 border-slate-200' },
          { label: 'Open', value: counts.open, key: 'Open', activeClass: 'bg-rose-600 text-white border-rose-600', inactiveClass: 'bg-white text-rose-700 border-rose-200' },
          { label: 'Reopened', value: counts.reopened, key: 'Reopened', activeClass: 'bg-violet-600 text-white border-violet-600', inactiveClass: 'bg-white text-violet-700 border-violet-200' },
          { label: 'In Progress', value: counts.inProgress, key: 'In Progress', activeClass: 'bg-amber-500 text-white border-amber-500', inactiveClass: 'bg-white text-amber-700 border-amber-200' },
          { label: 'Resolved', value: counts.resolved, key: 'Resolved', activeClass: 'bg-blue-600 text-white border-blue-600', inactiveClass: 'bg-white text-blue-700 border-blue-200' },
          { label: 'Closed', value: counts.closed, key: 'Closed', activeClass: 'bg-emerald-600 text-white border-emerald-600', inactiveClass: 'bg-white text-emerald-700 border-emerald-200' },
        ].map(({ label, value, key, activeClass, inactiveClass }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`p-3 rounded-2xl border text-left transition-all ${statusFilter === key ? activeClass + ' shadow-sm' : inactiveClass + ' hover:border-slate-300'}`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block mb-1">{label}</span>
            <span className="text-2xl font-extrabold">{value}</span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, title, or behavior..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter size={14} />
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-white text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Bugs List */}
      <div className="space-y-3">
        {filteredBugs.length === 0 ? (
          <div className="text-center p-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
            <BugIcon size={44} className="mx-auto mb-3 opacity-20" />
            <h3 className="text-base font-bold text-slate-700">No defects found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {bugs.length === 0 ? 'No bugs logged yet. Fail a test case or log one manually.' : 'No bugs match your active filter.'}
            </p>
          </div>
        ) : (
          filteredBugs.map((bug) => {
            const isExpanded = expandedBugId === bug.id;
            const statusConfig = getBugStatusConfig(bug.status);
            const linkedTest = tests.find((t) => t.id === bug.testCaseId);
            const isClosed = bug.status === 'Closed' || bug.status === 'Resolved';
            const regressionCount = bug.regressionCount || 0;

            return (
              <div
                key={bug.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Main Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        {bug.bugId || 'BUG'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getSeverityConfig(bug.severity)}`}>
                        {bug.severity}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${getPriorityConfig(bug.priority)}`}>
                        {bug.priority}
                      </span>
                      {linkedTest && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Linked: {linkedTest.externalId}
                        </span>
                      )}
                      {/* Regression badge */}
                      {regressionCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md" title={`This bug has regressed ${regressionCount} time(s)`}>
                          <RotateCcw size={10} /> Regressed ×{regressionCount}
                        </span>
                      )}
                      <span className="text-slate-400 text-xs font-medium">
                        {formatDate(bug.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {bug.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Reopen button — only for Closed / Resolved */}
                    {isClosed && (
                      <button
                        onClick={() => { setReopenBugId(bug.id); setReopenReason(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Reopen this bug (regression)"
                      >
                        <RefreshCw size={13} /> Reopen
                      </button>
                    )}

                    {/* Status Dropdown */}
                    <select
                      value={bug.status}
                      onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-colors ${statusConfig.color}`}
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setExpandedBugId(isExpanded ? null : bug.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete defect ${bug.bugId || bug.title}?`)) {
                          onDeleteBug(bug.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Defect"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs animate-fadeIn">
                    {bug.actualBehavior && (
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Actual Behavior</span>
                        <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200">{bug.actualBehavior}</p>
                      </div>
                    )}
                    {bug.expectedBehavior && (
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Expected Behavior</span>
                        <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">{bug.expectedBehavior}</p>
                      </div>
                    )}
                    {bug.reproductionSteps && (
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Reproduction Steps</span>
                        <pre className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                          {bug.reproductionSteps}
                        </pre>
                      </div>
                    )}

                    {/* Regression History Timeline */}
                    {bug.regressionHistory && bug.regressionHistory.length > 0 && (
                      <div>
                        <span className="font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                          <History size={13} /> Regression History ({bug.regressionHistory.length} occurrence{bug.regressionHistory.length > 1 ? 's' : ''})
                        </span>
                        <div className="space-y-2">
                          {bug.regressionHistory.map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl p-3">
                              <div className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-violet-800 text-[11px]">
                                    Reopened from <span className="italic">{entry.fromStatus}</span>
                                  </span>
                                  <span className="text-[10px] text-violet-500 flex items-center gap-1">
                                    <Calendar size={10} /> {formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}
                                  </span>
                                </div>
                                {entry.reason && (
                                  <p className="text-violet-700 mt-1 leading-relaxed">{entry.reason}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Manual Defect Modal */}
      <BugModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          onAddBug({ ...data, projectId: project?.id });
        }}
        initialData={{ projectId: project?.id }}
      />

      {/* Reopen Confirmation Modal */}
      {reopenBugId && reopenBug && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw size={18} className="text-violet-600" />
                  <h2 className="text-xl font-extrabold text-slate-900">Reopen Bug</h2>
                </div>
                <p className="text-sm text-slate-500">
                  This will mark <span className="font-bold text-violet-700">{reopenBug.bugId}</span> as <span className="font-bold text-violet-700">Reopened</span> and log it as a regression.
                </p>
              </div>
              <button
                onClick={() => { setReopenBugId(null); setReopenReason(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Bug title preview */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-5">
              <span className="font-mono text-xs font-bold text-violet-700 block mb-1">{reopenBug.bugId}</span>
              <p className="text-sm font-bold text-slate-800">{reopenBug.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold text-slate-500">Previously: <strong>{reopenBug.status}</strong></span>
                {reopenBug.regressionCount > 0 && (
                  <span className="text-[10px] font-bold text-violet-600">• Previously reopened {reopenBug.regressionCount}×</span>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Reason for Reopening <span className="font-normal text-slate-400 normal-case">(optional)</span>
              </label>
              <textarea
                autoFocus
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. Bug reappeared in v2.4 release after hot-fix rollback..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setReopenBugId(null); setReopenReason(''); }}
                className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw size={15} /> Reopen Bug
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
