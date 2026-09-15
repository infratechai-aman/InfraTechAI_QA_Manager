import React, { useState, useMemo } from 'react';
import { 
  Calendar, Bug as BugIcon, CheckCircle, XCircle, 
  AlertTriangle, Circle, TrendingUp, ShieldAlert, FileText,
  Users, UserPlus
} from 'lucide-react';
import { formatDate, getUserColor, getUserInitial } from '../../utils/formatters';

export const DashboardView = ({ 
  tests, 
  bugs, 
  project, 
  files, 
  reports = [],
  onNavigateToTab, 
  currentUser,
  onOpenInviteModal 
}) => {
  const [selectedFileId, setSelectedFileId] = useState('all');

  // Filter tests based on selected File/Date
  const dashboardTests = useMemo(() => {
    if (selectedFileId === 'all') return tests;
    return tests.filter((t) => t.fileId === selectedFileId);
  }, [tests, selectedFileId]);

  const stats = {
    total: dashboardTests.length,
    passed: dashboardTests.filter((t) => t.status === 'Pass').length,
    failed: dashboardTests.filter((t) => t.status === 'Fail').length,
    blocked: dashboardTests.filter((t) => t.status === 'Blocked').length,
    notRun: dashboardTests.filter((t) => t.status === 'Not Run').length,
  };

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
  const executedCount = stats.passed + stats.failed + stats.blocked;
  const executionRate = stats.total > 0 ? Math.round((executedCount / stats.total) * 100) : 0;

  const openBugs = bugs.filter((b) => ['Open', 'In Progress', 'Reopened'].includes(b.status));
  const criticalBugs = openBugs.filter((b) => b.severity === 'Critical' || b.priority === 'P0');

  // Individual Work Attribution & Contribution Metrics
  const memberContributions = useMemo(() => {
    const memberSet = new Set();
    if (project?.members) {
      project.members.forEach(m => m.email && memberSet.add(m.email.toLowerCase()));
    }
    if (project?.ownerEmail) memberSet.add(project.ownerEmail.toLowerCase());
    if (currentUser?.email) memberSet.add(currentUser.email.toLowerCase());

    const ownerEmail = project?.ownerEmail?.toLowerCase() || '';

    tests.forEach(t => {
      if (t.executedBy) memberSet.add(t.executedBy.toLowerCase());
      if (t.createdBy) memberSet.add(t.createdBy.toLowerCase());
    });
    bugs.forEach(b => {
      if (b.reportedBy) memberSet.add(b.reportedBy.toLowerCase());
    });
    reports.forEach(r => {
      if (r.createdBy) memberSet.add(r.createdBy.toLowerCase());
    });

    const members = Array.from(memberSet);
    return members.map(email => {
      const isCurrent = email === currentUser?.email?.toLowerCase();

      // For tests that have a status (executed) but NO executedBy field, attribute to project owner
      const memberTests = tests.filter(t => {
        if (t.executedBy) return t.executedBy.toLowerCase() === email;
        // Legacy data: test was executed (has a status other than 'Not Run') but no executedBy
        if (!t.executedBy && t.status && t.status !== 'Not Run') return email === ownerEmail;
        return false;
      });

      // For test creation: if no createdBy field, attribute to owner
      const createdTests = tests.filter(t => {
        if (t.createdBy) return t.createdBy.toLowerCase() === email;
        if (!t.createdBy) return email === ownerEmail;
        return false;
      }).length;

      // For reports: if no createdBy field, attribute to owner
      const createdReports = reports.filter(r => {
        if (r.createdBy) return r.createdBy.toLowerCase() === email;
        if (!r.createdBy) return email === ownerEmail;
        return false;
      }).length;

      const passed = memberTests.filter(t => t.status === 'Pass').length;
      const failed = memberTests.filter(t => t.status === 'Fail').length;
      const blocked = memberTests.filter(t => t.status === 'Blocked').length;
      const totalExec = memberTests.length;
      const mPassRate = totalExec > 0 ? Math.round((passed / totalExec) * 100) : 0;

      // For bugs: if no reportedBy field, attribute to owner
      const reportedBugs = bugs.filter(b => {
        if (b.reportedBy) return b.reportedBy.toLowerCase() === email;
        if (!b.reportedBy) return email === ownerEmail;
        return false;
      }).length;

      const projectShare = tests.length > 0 ? Math.round((totalExec / tests.length) * 100) : 0;

      const projectMember = project?.members?.find(m => m.email?.toLowerCase() === email);
      const role = projectMember?.role || (email === ownerEmail ? 'Owner' : 'QA Tester');

      return {
        email,
        isCurrent,
        role,
        totalExec,
        passed,
        failed,
        blocked,
        passRate: mPassRate,
        reportedBugs,
        projectShare,
        createdTests,
        createdReports,
      };
    }).sort((a, b) => b.totalExec - a.totalExec || (b.createdTests + b.createdReports) - (a.createdTests + a.createdReports));
  }, [tests, bugs, reports, project, currentUser]);

  const StatCard = ({ title, value, color, subtitle, icon: Icon, bg = 'bg-white' }) => (
    <div className={`p-5 rounded-2xl ${bg} border border-slate-200/80 shadow-xs flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{title}</span>
        {Icon && <Icon size={16} className={color} />}
      </div>
      <div>
        <span className={`text-3xl lg:text-4xl font-extrabold ${color} tracking-tight`}>{value}</span>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">QA Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Execution analytics for <span className="font-semibold text-slate-800">{project?.name || 'Workspace'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Invite Team Member Button */}
          {onOpenInviteModal && (
            <button
              onClick={onOpenInviteModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Invite friend or collaborator to this workspace"
            >
              <UserPlus size={15} />
              <span>Invite Team</span>
              {project?.members && project.members.length > 1 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {project.members.length}
                </span>
              )}
            </button>
          )}

          {/* Filter by File / Date */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl shadow-xs">
            <Calendar size={15} className="text-slate-400 ml-1" />
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 outline-none pr-3 cursor-pointer"
            >
              <option value="all">All Test Suites ({tests.length} tests)</option>
              {files.map((f) => {
                const count = tests.filter((t) => t.fileId === f.id).length;
                return (
                  <option key={f.id} value={f.id}>
                    {f.name} ({count} tests)
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Tests" value={stats.total} color="text-slate-800" icon={FileText} />
        <StatCard title="Pass Rate" value={`${passRate}%`} color="text-indigo-600" subtitle={`${executionRate}% executed`} icon={TrendingUp} />
        <StatCard title="Passed" value={stats.passed} color="text-emerald-600" icon={CheckCircle} />
        <StatCard title="Failed" value={stats.failed} color="text-rose-600" icon={XCircle} />
        <StatCard title="Blocked" value={stats.blocked} color="text-amber-600" icon={AlertTriangle} />
        <StatCard title="Not Run" value={stats.notRun} color="text-slate-400" icon={Circle} />
      </div>

      {/* Execution Progress Bar */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
          <span className="font-bold text-slate-800 uppercase tracking-wider">Execution Coverage</span>
          <span>{executedCount} of {stats.total} tests executed ({executionRate}%)</span>
        </div>
        
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {stats.total > 0 ? (
            <>
              <div 
                style={{ width: `${(stats.passed / stats.total) * 100}%` }} 
                className="bg-emerald-500 h-full transition-all duration-500" 
                title={`Pass: ${stats.passed}`} 
              />
              <div 
                style={{ width: `${(stats.failed / stats.total) * 100}%` }} 
                className="bg-rose-500 h-full transition-all duration-500" 
                title={`Fail: ${stats.failed}`} 
              />
              <div 
                style={{ width: `${(stats.blocked / stats.total) * 100}%` }} 
                className="bg-amber-500 h-full transition-all duration-500" 
                title={`Blocked: ${stats.blocked}`} 
              />
              <div 
                style={{ width: `${(stats.notRun / stats.total) * 100}%` }} 
                className="bg-slate-200 h-full transition-all duration-500" 
                title={`Not Run: ${stats.notRun}`} 
              />
            </>
          ) : (
            <div className="w-full bg-slate-100 h-full" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Passed ({stats.passed})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Failed ({stats.failed})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Blocked ({stats.blocked})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span>Not Run ({stats.notRun})</span>
          </div>
        </div>
      </div>

      {/* Team Contributions & Work Attribution Breakdown */}
      <div className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Team Contributions & Work Split
              </h2>
              <p className="text-xs text-slate-400">
                Individual test executions and defect attribution for {project?.name || 'Workspace'}
              </p>
            </div>
          </div>
          {onOpenInviteModal && (
            <button
              onClick={onOpenInviteModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <UserPlus size={14} />
              <span>Invite Collaborator</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberContributions.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No team activity recorded yet. Run a test case or invite a member to begin.
            </div>
          ) : (
            memberContributions.map((member) => {
              const palette = getUserColor(member.email);
              return (
                <div
                  key={member.email}
                  className={`p-4 rounded-2xl border transition-all ${
                    member.isCurrent 
                      ? 'bg-indigo-50/40 border-indigo-200 shadow-xs ring-1 ring-indigo-500/10' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${palette.badge} font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                        {getUserInitial(member.email)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate" title={member.email}>
                            {member.email}
                          </p>
                          {member.isCurrent && (
                            <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded-md shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                      {member.projectShare}% share
                    </span>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-4 gap-2 py-2 border-t border-slate-100/80 text-center">
                    <div className="bg-indigo-50/60 p-2 rounded-xl">
                      <p className="text-[9px] text-indigo-700 font-bold uppercase">Authored</p>
                      <p className="text-sm font-extrabold text-indigo-800" title={`${member.createdTests} Tests, ${member.createdReports} Reports`}>
                        {member.createdTests + member.createdReports}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Executed</p>
                      <p className="text-sm font-extrabold text-slate-800">{member.totalExec}</p>
                    </div>
                    <div className="bg-emerald-50/60 p-2 rounded-xl">
                      <p className="text-[9px] text-emerald-700 font-bold uppercase">Pass Rate</p>
                      <p className="text-sm font-extrabold text-emerald-700">{member.passRate}%</p>
                    </div>
                    <div className="bg-rose-50/60 p-2 rounded-xl">
                      <p className="text-[9px] text-rose-700 font-bold uppercase">Defects</p>
                      <p className="text-sm font-extrabold text-rose-700">{member.reportedBugs}</p>
                    </div>
                  </div>

                  {/* Status distribution bar */}
                  {member.totalExec > 0 ? (
                    <div className="mt-3 pt-2 border-t border-slate-100/60 space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(member.passed / member.totalExec) * 100}%` }} className="bg-emerald-500 h-full" title={`Passed: ${member.passed}`} />
                        <div style={{ width: `${(member.failed / member.totalExec) * 100}%` }} className="bg-rose-500 h-full" title={`Failed: ${member.failed}`} />
                        <div style={{ width: `${(member.blocked / member.totalExec) * 100}%` }} className="bg-amber-500 h-full" title={`Blocked: ${member.blocked}`} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{member.passed} Passed</span>
                        <span>{member.failed} Failed</span>
                        <span>{member.blocked} Blocked</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-[10px] text-slate-400 italic text-center">No test executions yet</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Defect Summary & Suites Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bug Metrics Box */}
        <div className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <BugIcon size={18} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Defect Summary</h2>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('bugs')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View All Bugs →
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Total Defects Reported</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{bugs.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-xs font-semibold text-rose-800">Active Open Defects</span>
                <span className="font-mono font-bold text-rose-600 text-sm">{openBugs.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Critical / P0 Severity</span>
                <span className="font-mono font-bold text-amber-700 text-sm">{criticalBugs.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Linked to active project test cases</span>
            <span>Real-time sync enabled</span>
          </div>
        </div>

        {/* Suites Summary Box */}
        <div className="p-6 border border-slate-200/80 rounded-2xl bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText size={18} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Test Suites Breakdown</h2>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('files')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Manage Suites →
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto">
              {files.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No test suites created yet.</p>
              ) : (
                files.map((file) => {
                  const sTests = tests.filter((t) => t.fileId === file.id);
                  const sPass = sTests.filter((t) => t.status === 'Pass').length;
                  const sRate = sTests.length > 0 ? Math.round((sPass / sTests.length) * 100) : 0;

                  return (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{file.name}</p>
                        <p className="text-[11px] text-slate-400">{sTests.length} tests • {formatDate(file.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold ${sRate > 75 ? 'text-emerald-600' : sRate > 40 ? 'text-amber-600' : 'text-slate-500'}`}>
                          {sRate}% Pass
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>{files.length} Total Suites</span>
            <span>{tests.length} Total Test Cases</span>
          </div>
        </div>

      </div>

    </div>
  );
};
