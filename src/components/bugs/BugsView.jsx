import React, { useState, useMemo } from 'react';
import { 
  Bug as BugIcon, Plus, Search, Filter, Trash2, 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock 
} from 'lucide-react';
import { 
  formatDate, 
  getBugStatusConfig, 
  getSeverityConfig, 
  getPriorityConfig 
} from '../../utils/formatters';
import { BugModal } from '../modals/BugModal';

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

  // Status counts
  const counts = {
    total: bugs.length,
    open: bugs.filter((b) => b.status === 'Open').length,
    inProgress: bugs.filter((b) => b.status === 'In Progress').length,
    resolved: bugs.filter((b) => b.status === 'Resolved').length,
    closed: bugs.filter((b) => b.status === 'Closed').length,
  };

  // Filtered defects
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
    onUpdateBug(bugId, { status: newStatus });
  };

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block mb-1">All Bugs</span>
          <span className="text-2xl font-extrabold">{counts.total}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Open')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'Open'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white text-rose-700 border-rose-200 hover:border-rose-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block mb-1">Open</span>
          <span className="text-2xl font-extrabold">{counts.open}</span>
        </button>

        <button
          onClick={() => setStatusFilter('In Progress')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'In Progress'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-amber-700 border-amber-200 hover:border-amber-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block mb-1">In Progress</span>
          <span className="text-2xl font-extrabold">{counts.inProgress}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Resolved')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'Resolved'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-blue-700 border-blue-200 hover:border-blue-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block mb-1">Resolved</span>
          <span className="text-2xl font-extrabold">{counts.resolved}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Closed')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'Closed'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block mb-1">Closed</span>
          <span className="text-2xl font-extrabold">{counts.closed}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search defects by ID, title, or behavior..."
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

      {/* Bugs Table / Card List */}
      <div className="space-y-3">
        {filteredBugs.length === 0 ? (
          <div className="text-center p-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
            <BugIcon size={44} className="mx-auto mb-3 opacity-20" />
            <h3 className="text-base font-bold text-slate-700">No defects found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {bugs.length === 0 ? 'No bugs logged yet. You can log one manually or fail a test case.' : 'No bugs match your active filter.'}
            </p>
          </div>
        ) : (
          filteredBugs.map((bug) => {
            const isExpanded = expandedBugId === bug.id;
            const statusConfig = getBugStatusConfig(bug.status);
            const linkedTest = tests.find((t) => t.id === bug.testCaseId);

            return (
              <div
                key={bug.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Main Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
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
                          Linked to: {linkedTest.externalId}
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

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <select
                        value={bug.status}
                        onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-colors ${statusConfig.color}`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setExpandedBugId(isExpanded ? null : bug.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title={isExpanded ? 'Collapse Details' : 'Expand Details'}
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
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Actual Behavior
                        </span>
                        <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                          {bug.actualBehavior}
                        </p>
                      </div>
                    )}

                    {bug.expectedBehavior && (
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Expected Behavior
                        </span>
                        <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                          {bug.expectedBehavior}
                        </p>
                      </div>
                    )}

                    {bug.reproductionSteps && (
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Reproduction Steps
                        </span>
                        <pre className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                          {bug.reproductionSteps}
                        </pre>
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
          onAddBug({
            ...data,
            projectId: project?.id,
          });
        }}
        initialData={{
          projectId: project?.id,
        }}
      />

    </div>
  );
};
