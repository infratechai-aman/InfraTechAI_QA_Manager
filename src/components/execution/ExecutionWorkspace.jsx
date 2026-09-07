import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Circle, 
  Search, ArrowLeft, ArrowRight, Save, Calendar, 
  Bug as BugIcon, Command, Keyboard, Check, 
  ListOrdered, CheckCircle2, Sparkles, Monitor, 
  RefreshCw, Flag, Trophy
} from 'lucide-react';
import { formatDate, getStatusConfig } from '../../utils/formatters';
import { BugModal } from '../modals/BugModal';

export const ExecutionWorkspace = ({ 
  tests, 
  updateTest, 
  project, 
  files, 
  onAddBug, 
  bugs,
  onNavigateToBugs,
}) => {
  const [selectedFileId, setSelectedFileId] = useState(files[0]?.id || '');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugForm, setBugForm] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Sync selected file when files prop changes (e.g. after project switch)
  useEffect(() => {
    if (files.length > 0) {
      setSelectedFileId(files[0].id);
      setCurrentIndex(0);
    } else {
      setSelectedFileId('');
    }
  }, [files.map(f => f.id).join(',')]);

  // All tests in the currently selected suite (regardless of filter)
  const suiteTests = useMemo(() => {
    return tests.filter(t => selectedFileId ? t.fileId === selectedFileId : true);
  }, [tests, selectedFileId]);

  // Filtered tests for navigation
  const filteredTests = useMemo(() => {
    return suiteTests.filter((t) => {
      const matchFilter = filter === 'All' || t.status === filter;
      const matchSearch =
        t.externalId.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [suiteTests, filter, search]);

  // Progress computation
  const progressStats = useMemo(() => {
    const total = suiteTests.length;
    const passed = suiteTests.filter(t => t.status === 'Pass').length;
    const failed = suiteTests.filter(t => t.status === 'Fail').length;
    const blocked = suiteTests.filter(t => t.status === 'Blocked').length;
    const notRun = suiteTests.filter(t => t.status === 'Not Run').length;
    const executed = passed + failed + blocked;
    const pct = total > 0 ? Math.round((executed / total) * 100) : 0;
    return { total, passed, failed, blocked, notRun, executed, pct };
  }, [suiteTests]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredTests.length && filteredTests.length > 0) {
      setCurrentIndex(filteredTests.length - 1);
    }
  }, [filteredTests.length, currentIndex]);

  const currentTest = filteredTests[currentIndex];

  // Auto-save handler
  const handleUpdate = useCallback(
    (id, updates) => {
      setSaveStatus('Saving...');
      updateTest(id, updates);
      const timer = setTimeout(() => setSaveStatus('Saved'), 300);
      return () => clearTimeout(timer);
    },
    [updateTest]
  );

  // Status updates (Pass / Fail / Blocked)
  const handleStatusUpdate = useCallback(
    (status) => {
      if (!currentTest) return;
      handleUpdate(currentTest.id, { status });

      if (status === 'Pass' && currentIndex < filteredTests.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (status === 'Fail') {
        setBugForm({
          title: `[Failed] ${currentTest.title}`,
          severity: 'High',
          priority: 'P1',
          actualBehavior: currentTest.actualResult || '',
          expectedBehavior: currentTest.expectedResult || '',
          reproductionSteps: currentTest.steps || currentTest.testerNotes || `Test case ${currentTest.externalId} failed during execution.`,
          testCaseId: currentTest.id,
          projectId: project?.id,
        });
        setIsBugModalOpen(true);
      }
    },
    [currentTest, currentIndex, filteredTests.length, handleUpdate, project]
  );

  // Submit bug from modal — always records in Bugs & Issues
  const handleSaveBug = (formData) => {
    onAddBug({ ...formData, projectId: project?.id });
    setIsBugModalOpen(false);
    setBugForm(null);
    // Advance to next test after logging bug
    if (currentIndex < filteredTests.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Quick template for Actual Result
  const handleCopyExpectedToActual = () => {
    if (!currentTest) return;
    const text = currentTest.expectedResult 
      ? `Observed behavior matches expectation: ${currentTest.expectedResult}`
      : 'Functionality executed as expected without any discrepancies.';
    handleUpdate(currentTest.id, { actualResult: text });
  };

  // Append environment tag to tester notes
  const handleAppendEnvTag = (tag) => {
    if (!currentTest) return;
    const current = currentTest.testerNotes ? `${currentTest.testerNotes} | ${tag}` : tag;
    handleUpdate(currentTest.id, { testerNotes: current });
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'p':
          e.preventDefault();
          handleStatusUpdate('Pass');
          break;
        case 'f':
          e.preventDefault();
          handleStatusUpdate('Fail');
          break;
        case 'b':
          e.preventDefault();
          handleStatusUpdate('Blocked');
          break;
        case 'n':
          e.preventDefault();
          if (e.shiftKey) {
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
          } else {
            setCurrentIndex((prev) => Math.min(prev + 1, filteredTests.length - 1));
          }
          break;
        case '/':
          e.preventDefault();
          document.getElementById('execSearchInput')?.focus();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStatusUpdate, filteredTests.length]);

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden w-full">
      
      {/* Left Sidebar - Test Case List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-xs">
        
        {/* Controls Header */}
        <div className="p-4 space-y-2.5 border-b border-slate-100 bg-white">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Test Suite
            </label>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {filteredTests.length} Tests
            </span>
          </div>

          <select
            value={selectedFileId}
            onChange={(e) => {
              setSelectedFileId(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            {files.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Progress Bar */}
          {progressStats.total > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-500">Progress</span>
                <span className={`${progressStats.pct === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  {progressStats.pct}% Executed
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressStats.pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${progressStats.pct}%` }}
                />
              </div>
              <div className="flex gap-2 text-[10px] font-semibold">
                <span className="text-emerald-600">{progressStats.passed}P</span>
                <span className="text-rose-600">{progressStats.failed}F</span>
                <span className="text-amber-600">{progressStats.blocked}B</span>
                <span className="text-slate-400">{progressStats.notRun} Left</span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              id="execSearchInput"
              type="text"
              placeholder="Search tests (Press '/')"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="All">All Statuses ({suiteTests.length})</option>
            <option value="Not Run">Not Run</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Test Cases List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-slate-50/50">
          {filteredTests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center">
              No test cases match criteria.
            </div>
          ) : (
            filteredTests.map((tc, idx) => {
              const statusConf = getStatusConfig(tc.status);
              const StatusIcon = statusConf.icon;
              const isActive = idx === currentIndex;

              return (
                <div
                  key={tc.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                    isActive
                      ? 'bg-white border-indigo-400 shadow-sm ring-2 ring-indigo-500/15'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-mono text-[11px] font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {tc.externalId}
                    </span>
                    <div className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold ${statusConf.color}`}>
                      <span>{tc.status}</span>
                      <StatusIcon size={12} />
                    </div>
                  </div>
                  <div className={`text-xs font-semibold line-clamp-2 leading-relaxed ${isActive ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                    {tc.title}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Complete Execution Button */}
        {progressStats.total > 0 && (
          <div className="p-3 border-t border-slate-200 bg-white space-y-2">
            <button
              onClick={() => setShowCompleteModal(true)}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                progressStats.notRun === 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              <Flag size={14} />
              {progressStats.notRun === 0 ? 'Complete Execution ✓' : `Complete (${progressStats.notRun} remaining)`}
            </button>
          </div>
        )}

        {/* Shortcuts Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-400">
            <Keyboard size={12} />
            <span className="font-semibold">Hotkeys:</span>
          </div>
          <div className="flex gap-1 font-mono text-[10px]">
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">P</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">F</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">B</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">N</span>
          </div>
        </div>
      </div>

      {/* Main Execution Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/70 relative overflow-hidden">
        {!currentTest ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Command size={44} className="opacity-20" />
            <p className="text-base font-medium">Select a test case to begin execution.</p>
          </div>
        ) : (
          <>
            {/* Top Navigation & Status Bar */}
            <div className="flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-slate-200/80 bg-white z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs disabled:opacity-30 transition-all cursor-pointer"
                    title="Previous Test (Shift+N)"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, filteredTests.length - 1))}
                    disabled={currentIndex === filteredTests.length - 1}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs disabled:opacity-30 transition-all cursor-pointer"
                    title="Next Test (N)"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Test <strong className="text-slate-900 mx-0.5">{currentIndex + 1}</strong> of {filteredTests.length}
                </div>
              </div>

              {/* Status Badge & Auto-save Pill */}
              <div className="flex items-center gap-3">
                {/* Overall progress pill */}
                <div className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
                  <span>{progressStats.pct}% done</span>
                  <span className="text-indigo-400">·</span>
                  <span className="text-emerald-600">{progressStats.passed}P</span>
                  <span className="text-rose-600">{progressStats.failed}F</span>
                </div>
                <div className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                  {saveStatus === 'Saving...' ? (
                    <Save size={13} className="animate-pulse text-indigo-500" />
                  ) : (
                    <Check size={13} className="text-emerald-500" />
                  )}
                  <span className={saveStatus === 'Saved' ? 'text-slate-600' : 'text-indigo-600'}>
                    {saveStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Balanced Two-Column Execution Workspace */}
            <div className="flex-1 overflow-y-auto w-full p-6 lg:p-8 pb-32">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Test Specification (Steps + Expected) - 7 Columns */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card: Test Header */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-tight">
                        {currentTest.externalId}
                      </span>
                      <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(currentTest.createdAt)}
                      </span>

                      {/* Linked Bugs */}
                      {bugs
                        .filter((b) => b.testCaseId === currentTest.id)
                        .map((b) => (
                          <span
                            key={b.id}
                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 shadow-xs"
                            title={b.title}
                          >
                            <BugIcon size={12} /> {b.bugId} ({b.status})
                          </span>
                        ))}
                    </div>

                    <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 leading-tight">
                      {currentTest.title}
                    </h1>
                  </div>

                  {/* Card: Execution Steps */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <ListOrdered size={15} className="text-indigo-600" />
                        <span>Execution Steps</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Procedure</span>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/80 p-5 rounded-xl text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                      {currentTest.steps || (
                        <span className="text-slate-400 italic font-sans">
                          No specific steps documented. Follow test title requirements.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card: Expected Result */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>Expected Result</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Target Outcome
                      </span>
                    </div>

                    <div className="bg-emerald-50/40 border border-emerald-200/70 p-5 rounded-xl text-emerald-950 font-medium text-sm whitespace-pre-wrap leading-relaxed">
                      {currentTest.expectedResult || (
                        <span className="text-slate-400 italic font-normal">
                          No expected result documented.
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Execution Workbench - 5 Columns */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Card: Quick Decision Bar */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Mark Result
                      </span>
                      <span className="text-[10px] text-slate-400">Current: <strong>{currentTest.status}</strong></span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStatusUpdate('Pass')}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentTest.status === 'Pass'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-500/20'
                            : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200'
                        }`}
                        title="Pass (P)"
                      >
                        <CheckCircle size={15} /> Pass
                      </button>

                      <button
                        onClick={() => handleStatusUpdate('Fail')}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentTest.status === 'Fail'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-200 ring-2 ring-rose-500/20'
                            : 'bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200'
                        }`}
                        title="Fail & Log Bug (F)"
                      >
                        <XCircle size={15} /> Fail
                      </button>

                      <button
                        onClick={() => handleStatusUpdate('Blocked')}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentTest.status === 'Blocked'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-200 ring-2 ring-amber-400/20'
                            : 'bg-amber-50 hover:bg-amber-100/80 text-amber-700 border border-amber-200'
                        }`}
                        title="Blocked (B)"
                      >
                        <AlertTriangle size={15} /> Blocked
                      </button>
                    </div>
                  </div>

                  {/* Card: Actual Result Textarea */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actual Observed Result
                      </h3>
                      <button
                        type="button"
                        onClick={handleCopyExpectedToActual}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-indigo-50/70 hover:bg-indigo-100/70 px-2 py-1 rounded-lg border border-indigo-100 transition-colors"
                        title="Copy expectation into actual result"
                      >
                        <Sparkles size={12} /> Same as expected
                      </button>
                    </div>

                    <textarea
                      value={currentTest.actualResult || ''}
                      onChange={(e) => handleUpdate(currentTest.id, { actualResult: e.target.value })}
                      placeholder="Type what actually happened during testing..."
                      className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-xl text-xs outline-none resize-none placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 leading-relaxed"
                      rows={4}
                    />
                  </div>

                  {/* Card: Tester Notes & Environment */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Monitor size={14} className="text-slate-400" />
                        <span>Tester Remarks & Environment</span>
                      </h3>
                    </div>

                    {/* Quick Preset Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {['Chrome 124', 'Safari Mobile', 'Staging v2.1', 'Localhost'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAppendEnvTag(tag)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={currentTest.testerNotes || ''}
                      onChange={(e) => handleUpdate(currentTest.id, { testerNotes: e.target.value })}
                      placeholder="Add browser versions, test credentials, or environment remarks..."
                      className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-xl text-xs outline-none resize-none placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-slate-700 leading-relaxed"
                      rows={3}
                    />
                  </div>

                </div>

              </div>
            </div>

            {/* Floating Action Dock (Bottom Center) */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-2 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] flex gap-2 pointer-events-auto items-center">
                <button
                  onClick={() => handleStatusUpdate('Pass')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm group cursor-pointer"
                  title="Mark Pass (P)"
                >
                  <CheckCircle size={16} className="group-hover:scale-110 transition-transform" /> Pass
                </button>
                <button
                  onClick={() => handleStatusUpdate('Fail')}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm group cursor-pointer"
                  title="Mark Fail & Log Bug (F)"
                >
                  <XCircle size={16} className="group-hover:scale-110 transition-transform" /> Fail
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button
                  onClick={() => handleStatusUpdate('Blocked')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs group cursor-pointer"
                  title="Mark Blocked (B)"
                >
                  <AlertTriangle size={16} className="text-amber-500 group-hover:scale-110 transition-transform" /> Blocked
                </button>
              </div>
            </div>

            {/* Bug Logging Modal */}
            <BugModal
              isOpen={isBugModalOpen}
              onClose={() => setIsBugModalOpen(false)}
              onSubmit={handleSaveBug}
              initialData={bugForm}
            />
          </>
        )}
      </div>

      {/* Complete Execution Summary Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                progressStats.failed > 0 ? 'bg-rose-50' : 'bg-emerald-50'
              }`}>
                <Trophy size={32} className={progressStats.failed > 0 ? 'text-amber-500' : 'text-emerald-500'} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                Execution {progressStats.notRun > 0 ? 'Summary' : 'Complete!'}
              </h2>
              <p className="text-slate-500 text-sm">
                {progressStats.notRun > 0
                  ? `${progressStats.notRun} test(s) still pending. Results so far:`
                  : 'All tests have been executed. Here are the results:'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <div className="text-3xl font-extrabold text-emerald-600">{progressStats.passed}</div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-1">Passed</div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                <div className="text-3xl font-extrabold text-rose-600">{progressStats.failed}</div>
                <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mt-1">Failed</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <div className="text-3xl font-extrabold text-amber-600">{progressStats.blocked}</div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-1">Blocked</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <div className="text-3xl font-extrabold text-slate-500">{progressStats.notRun}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Not Run</div>
              </div>
            </div>

            {/* Pass rate bar */}
            <div className="mb-6 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Pass Rate</span>
                <span className="text-indigo-600">
                  {progressStats.executed > 0 
                    ? Math.round((progressStats.passed / progressStats.executed) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ 
                    width: progressStats.executed > 0 
                      ? `${Math.round((progressStats.passed / progressStats.executed) * 100)}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>

            {progressStats.failed > 0 && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 font-medium text-center">
                🐛 {progressStats.failed} bug(s) have been logged in Bugs &amp; Issues automatically.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Keep Testing
                </button>
                {progressStats.failed > 0 && (
                  <button
                    onClick={() => {
                      setShowCompleteModal(false);
                      if (onNavigateToBugs) onNavigateToBugs();
                    }}
                    className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    🐛 View Bugs
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  if (onNavigateToFiles) onNavigateToFiles();
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Submit & View All Test Cases
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
