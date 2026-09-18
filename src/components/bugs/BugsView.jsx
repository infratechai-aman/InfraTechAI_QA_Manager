import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Bug as BugIcon, Plus, Search, Filter, Trash2, 
  ChevronDown, ChevronUp, RefreshCw, RotateCcw,
  History, Calendar, AlertTriangle, X, User, Shield,
  UserCheck, Paperclip, Image as ImageIcon, Eye, UploadCloud, Loader2
} from 'lucide-react';
import { 
  formatDate, formatTime,
  getBugStatusConfig, 
  getSeverityConfig, 
  getPriorityConfig,
  getTimestamp,
  getUserColor,
  getUserInitial,
} from '../../utils/formatters';
import { BugModal } from '../modals/BugModal';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { processImageFile, formatFileSize } from '../../utils/imageUtils';

const ALL_STATUSES = ['Open', 'Reopened', 'In Progress', 'Resolved', 'Closed'];

export const BugsView = ({ 
  bugs, 
  onAddBug, 
  onUpdateBug, 
  onDeleteBug, 
  project, 
  tests,
  currentUser,
  triggerNewBugModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [reporterFilter, setReporterFilter] = useState('All'); // 'All' | 'Mine' | 'Team' | email
  const [assigneeFilter, setAssigneeFilter] = useState('All'); // 'All' | 'Mine' | 'Unassigned' | email
  const [expandedBugId, setExpandedBugId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingBugId, setUploadingBugId] = useState(null);
  const [lightboxState, setLightboxState] = useState({ isOpen: false, images: [], index: 0 });

  const existingFileInputRef = useRef(null);
  const currentUploadBugIdRef = useRef(null);

  useEffect(() => {
    if (triggerNewBugModal) {
      setIsModalOpen(true);
    }
  }, [triggerNewBugModal]);

  // Reopen modal state
  const [reopenBugId, setReopenBugId] = useState(null);
  useBodyScrollLock(!!reopenBugId);
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

  // Extract crewmates from project
  const crewmates = useMemo(() => {
    const list = [];
    if (project?.ownerEmail) {
      list.push({
        email: project.ownerEmail.toLowerCase(),
        name: project.ownerEmail.split('@')[0],
        role: 'Owner'
      });
    }
    if (project?.members) {
      project.members.forEach(m => {
        if (m.email && !list.some(x => x.email === m.email.toLowerCase())) {
          list.push({
            email: m.email.toLowerCase(),
            name: m.name || m.email.split('@')[0],
            role: m.role || 'QA Tester'
          });
        }
      });
    }
    if (currentUser?.email && !list.some(x => x.email === currentUser.email.toLowerCase())) {
      list.push({
        email: currentUser.email.toLowerCase(),
        name: currentUser.displayName || currentUser.email.split('@')[0],
        role: 'Member'
      });
    }
    return list;
  }, [project, currentUser]);

  // Build list of unique reporters from bugs + project members
  const allReporters = useMemo(() => {
    const emailSet = new Set();
    if (project?.members) {
      project.members.forEach(m => m.email && emailSet.add(m.email.toLowerCase()));
    }
    if (project?.ownerEmail) emailSet.add(project.ownerEmail.toLowerCase());
    bugs.forEach(b => {
      if (b.reportedBy) emailSet.add(b.reportedBy.toLowerCase());
    });
    return Array.from(emailSet).sort();
  }, [bugs, project]);

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const matchesStatus = statusFilter === 'All' || bug.status === statusFilter;
      const matchesSeverity = severityFilter === 'All' || bug.severity === severityFilter;
      
      let matchesReporter = true;
      if (reporterFilter === 'Mine') {
        matchesReporter = (bug.reportedBy || project?.ownerEmail) === currentUser?.email;
      } else if (reporterFilter === 'Team') {
        matchesReporter = (bug.reportedBy || project?.ownerEmail) && (bug.reportedBy || project?.ownerEmail) !== currentUser?.email;
      } else if (reporterFilter !== 'All') {
        const bugReporter = (bug.reportedBy || project?.ownerEmail || '').toLowerCase();
        matchesReporter = bugReporter === reporterFilter.toLowerCase();
      }

      let matchesAssignee = true;
      const bugAssignee = (bug.assignedTo || '').toLowerCase();
      const myEmail = (currentUser?.email || '').toLowerCase();
      if (assigneeFilter === 'Mine') {
        matchesAssignee = bugAssignee === myEmail;
      } else if (assigneeFilter === 'Unassigned') {
        matchesAssignee = !bugAssignee;
      } else if (assigneeFilter !== 'All') {
        matchesAssignee = bugAssignee === assigneeFilter.toLowerCase();
      }

      const q = search.toLowerCase();
      const matchesSearch =
        bug.title.toLowerCase().includes(q) ||
        bug.bugId?.toLowerCase().includes(q) ||
        bug.actualBehavior?.toLowerCase().includes(q) ||
        (bug.reportedBy && bug.reportedBy.toLowerCase().includes(q)) ||
        (bug.assignedTo && bug.assignedTo.toLowerCase().includes(q)) ||
        (bug.assignedToName && bug.assignedToName.toLowerCase().includes(q));

      return matchesStatus && matchesSeverity && matchesReporter && matchesAssignee && matchesSearch;
    });
  }, [bugs, statusFilter, severityFilter, reporterFilter, assigneeFilter, search, currentUser?.email, project?.ownerEmail]);


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

  const handleExistingImageSelect = async (e) => {
    const file = e.target.files?.[0];
    const bugId = currentUploadBugIdRef.current;
    if (!file || !bugId) return;

    setUploadingBugId(bugId);
    try {
      const processed = await processImageFile(file);
      const bug = bugs.find(b => b.id === bugId);
      if (bug) {
        const existingImages = bug.images && bug.images.length > 0 
          ? bug.images 
          : (bug.imageUrl ? [{ id: 'img_legacy', url: bug.imageUrl, name: 'Screenshot', size: 0 }] : []);
        const updatedImages = [...existingImages, processed];
        onUpdateBug(bugId, {
          images: updatedImages,
          imageUrl: updatedImages[0]?.url || null,
        });
      }
    } catch (err) {
      alert('Failed to attach image: ' + err.message);
    } finally {
      setUploadingBugId(null);
      currentUploadBugIdRef.current = null;
      if (existingFileInputRef.current) existingFileInputRef.current.value = '';
    }
  };

  const handleAssignBug = (bugId, newAssigneeEmail) => {
    const matched = crewmates.find(c => c.email === newAssigneeEmail?.toLowerCase());
    onUpdateBug(bugId, {
      assignedTo: newAssigneeEmail || null,
      assignedToName: matched ? matched.name : (newAssigneeEmail ? newAssigneeEmail.split('@')[0] : null)
    });
  };

  const reopenBug = bugs.find(b => b.id === reopenBugId);

  return (
    <div className="p-4 sm:p-8 pb-28 sm:pb-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
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
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
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

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <User size={14} />
            <span>Reporter:</span>
          </div>
          <select
            value={reporterFilter}
            onChange={(e) => setReporterFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-white text-slate-700 outline-none cursor-pointer max-w-[180px]"
          >
            <option value="All">All Reporters</option>
            <option value="Mine">Reported by Me</option>
            <option value="Team">Reported by Team</option>
            {allReporters.length > 0 && (
              <option disabled>──────────</option>
            )}
            {allReporters.map(email => {
              const isMe = email === currentUser?.email?.toLowerCase();
              const isOwner = email === project?.ownerEmail?.toLowerCase();
              const label = `${email.split('@')[0]} ${isOwner ? '(Owner)' : '(QA)'}${isMe ? ' — You' : ''}`;
              return (
                <option key={email} value={email}>{label}</option>
              );
            })}
          </select>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <UserCheck size={14} className="text-indigo-600" />
            <span>Assignee:</span>
          </div>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-white text-slate-700 outline-none cursor-pointer max-w-[180px]"
          >
            <option value="All">All Assignees</option>
            <option value="Mine">Assigned to Me</option>
            <option value="Unassigned">Unassigned Only</option>
            {crewmates.length > 0 && (
              <option disabled>──────────</option>
            )}
            {crewmates.map(c => {
              const isMe = c.email === currentUser?.email?.toLowerCase();
              return (
                <option key={c.email} value={c.email}>
                  {c.name} {isMe ? '(You)' : `(${c.role})`}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Hidden File Input for adding screenshots to existing bugs */}
      <input
        type="file"
        ref={existingFileInputRef}
        onChange={handleExistingImageSelect}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

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
            const reporterEmail = bug.reportedBy || project?.ownerEmail || 'Unknown';
            const isReportedByMe = reporterEmail === currentUser?.email;
            const reporterPalette = getUserColor(reporterEmail);

            const bugImages = bug.images && bug.images.length > 0 
              ? bug.images 
              : (bug.imageUrl ? [{ id: 'legacy', url: bug.imageUrl, name: 'Screenshot', size: 0 }] : []);

            const isAssignedToMe = bug.assignedTo && bug.assignedTo.toLowerCase() === currentUser?.email?.toLowerCase();
            const assigneePalette = bug.assignedTo ? getUserColor(bug.assignedTo) : null;

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

                      {/* Task Assignee Badge */}
                      {bug.assignedTo ? (
                        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          isAssignedToMe ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <span className={`w-3.5 h-3.5 rounded-full ${assigneePalette?.badge} flex items-center justify-center text-[8px] font-bold`}>
                            {getUserInitial(bug.assignedTo)}
                          </span>
                          <span>
                            Assigned: <strong>{isAssignedToMe ? 'You' : (bug.assignedToName || bug.assignedTo.split('@')[0])}</strong>
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-md italic">
                          Unassigned
                        </span>
                      )}

                      {/* Image attachments thumbnail preview pill */}
                      {bugImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setLightboxState({ isOpen: true, images: bugImages, index: 0 })}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer group"
                          title="Click to view attached screenshots"
                        >
                          <ImageIcon size={12} className="text-rose-500" />
                          <span>{bugImages.length} Image{bugImages.length > 1 ? 's' : ''}</span>
                        </button>
                      )}

                      {/* Reporter Attribution Badge */}
                      {(() => {
                        const isReporterOwner = (project?.ownerEmail?.toLowerCase() === reporterEmail?.toLowerCase()) || (bug.reportedByRole === 'Owner');
                        return (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <span className={`w-3.5 h-3.5 rounded-full ${reporterPalette?.badge} flex items-center justify-center text-[8px] font-bold`}>
                              {getUserInitial(reporterEmail)}
                            </span>
                            <span className={isReportedByMe ? 'text-indigo-600 font-bold' : 'text-slate-600'}>
                              {isReportedByMe ? 'Reported by You' : `Reported by ${reporterEmail.split('@')[0]}`}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                              isReporterOwner ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              <Shield size={9} />
                              {isReporterOwner ? 'OWNER' : 'QA TESTER'}
                            </span>
                          </span>
                        );
                      })()}

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
                    
                    {/* Task Assignment Box inside expanded defect */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <UserCheck size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">Task Assignee</span>
                          <span className="text-[10px] text-slate-400">Assign this defect to a team member to fix or verify</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={bug.assignedTo || ''}
                          onChange={(e) => handleAssignBug(bug.id, e.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                          <option value="">Unassigned (Anyone can resolve)</option>
                          {crewmates.map(c => (
                            <option key={c.email} value={c.email}>
                              {c.name} ({c.email}) • {c.role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Screenshots & Evidence Gallery */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                          <Paperclip size={13} className="text-rose-500" />
                          Screenshots &amp; Evidence ({bugImages.length})
                        </span>
                        <button
                          type="button"
                          disabled={uploadingBugId === bug.id}
                          onClick={() => {
                            currentUploadBugIdRef.current = bug.id;
                            existingFileInputRef.current?.click();
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {uploadingBugId === bug.id ? (
                            <>
                              <Loader2 size={12} className="animate-spin" /> Uploading...
                            </>
                          ) : (
                            <>
                              <UploadCloud size={12} /> Add Screenshot
                            </>
                          )}
                        </button>
                      </div>

                      {bugImages.length === 0 ? (
                        <p className="text-slate-400 text-xs italic py-1">No screenshots attached yet. Click "Add Screenshot" to upload evidence.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                          {bugImages.map((img, idx) => (
                            <div 
                              key={img.id || idx}
                              onClick={() => setLightboxState({ isOpen: true, images: bugImages, index: idx })}
                              className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 cursor-pointer shadow-xs hover:border-indigo-400 transition-all"
                            >
                              <div className="h-24 w-full overflow-hidden relative">
                                <img 
                                  src={img.url} 
                                  alt={img.name || `Screenshot ${idx + 1}`} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                                  <div className="p-1.5 bg-white/90 text-slate-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye size={14} />
                                  </div>
                                </div>
                              </div>
                              <div className="p-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                <span className="truncate max-w-[80px]" title={img.name}>{img.name || `Image ${idx + 1}`}</span>
                                <span className="font-mono text-slate-400 shrink-0">{img.size ? formatFileSize(img.size) : ''}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

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
          onAddBug({
            ...data,
            projectId: project?.id,
            reportedBy: currentUser?.email || 'Unknown',
            reportedByName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
          });
        }}
        initialData={{ projectId: project?.id }}
        currentUser={currentUser}
        project={project}
      />

      {/* Full-screen Lightbox viewer for screenshots */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.index}
        onClose={() => setLightboxState({ isOpen: false, images: [], index: 0 })}
      />

      {/* Reopen Confirmation Modal */}
      {reopenBugId && reopenBug && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overscroll-none touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setReopenBugId(null);
              setReopenReason('');
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn overscroll-contain select-text"
            onClick={(e) => e.stopPropagation()}
          >
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
