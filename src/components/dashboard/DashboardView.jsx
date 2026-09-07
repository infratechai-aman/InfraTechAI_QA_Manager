import React, { useState, useMemo } from 'react';
import { 
  Calendar, Bug as BugIcon, CheckCircle, XCircle, 
  AlertTriangle, Circle, TrendingUp, ShieldAlert, FileText 
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const DashboardView = ({ tests, bugs, project, files, onNavigateToTab }) => {
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
