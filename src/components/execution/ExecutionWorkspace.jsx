import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Circle, 
  Search, ArrowLeft, ArrowRight, Save, Calendar, 
  Bug as BugIcon, Command, Keyboard, Check, ListOrdered, CheckCircle2 
} from 'lucide-react';

import { formatDate, getStatusConfig } from '../../utils/formatters';
import { BugModal } from '../modals/BugModal';

export const ExecutionWorkspace = ({ 
  tests, 
  updateTest, 
  project, 
  files, 
  onAddBug, 
  bugs 
}) => {
  const [selectedFileId, setSelectedFileId] = useState(files[0]?.id || '');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugForm, setBugForm] = useState(null);

  // Sync selected file if files change
  useEffect(() => {
    if (!selectedFileId && files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  // Filter test cases
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchFile = selectedFileId ? t.fileId === selectedFileId : true;
      const matchFilter = filter === 'All' || t.status === filter;
      const matchSearch =
        t.externalId.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase());
      return matchFile && matchFilter && matchSearch;
    });
  }, [tests, filter, search, selectedFileId]);

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
      const timer = setTimeout(() => setSaveStatus('Saved'), 400);
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

  // Submit bug from modal
  const handleSaveBug = (formData) => {
    onAddBug(formData);
    setIsBugModalOpen(false);
    setBugForm(null);
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
    <div className="flex h-full bg-white overflow-hidden w-full">
      
      {/* Left Sidebar - Test List */}
      <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 z-10">
        
        {/* Controls Header */}
        <div className="p-4 space-y-3 border-b border-slate-200 bg-white">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Test Suite
          </label>
          <select
            value={selectedFileId}
            onChange={(e) => {
              setSelectedFileId(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full p-2.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-800 border-none outline-none hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            {files.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              id="execSearchInput"
              type="text"
              placeholder="Filter tests (Press '/')"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white shadow-xs"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="All">All Statuses ({filteredTests.length})</option>
            <option value="Not Run">Not Run</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Test Cases List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
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
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-white border-indigo-300 shadow-sm ring-2 ring-indigo-500/10'
                      : 'bg-transparent border-transparent hover:bg-slate-200/50 hover:border-slate-300/40'
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

        {/* Keyboard Shortcuts Helper Footer */}
        <div className="p-3 bg-slate-100/70 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Keyboard size={12} />
            <span>Shortcuts:</span>
          </div>
          <div className="flex gap-1.5 font-mono">
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">P: Pass</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">F: Fail</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">B: Block</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">N: Next</span>
          </div>
        </div>
      </div>

      {/* Main Execution Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {!currentTest ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Command size={44} className="opacity-20" />
            <p className="text-base font-medium">Select a test case to begin execution.</p>
          </div>
        ) : (
          <>
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-8 py-3.5 border-b border-slate-100 bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
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
                <span className="text-xs font-semibold text-slate-500">
                  Test <strong className="text-slate-900 mx-0.5">{currentIndex + 1}</strong> of {filteredTests.length}
                </span>
              </div>

              {/* Auto-save Pill */}
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

            {/* Test Details Document Area */}
            <div className="flex-1 overflow-y-auto w-full relative">
              <div className="p-8 lg:p-12 max-w-3xl mx-auto space-y-8 pb-32">
                
                {/* Title and Metadata Block */}
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
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

                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                    {currentTest.title}
                  </h1>
                </div>

                {/* Steps to Execute (If Available) */}
                {currentTest.steps && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <ListOrdered size={15} className="text-indigo-600" />
                      <span>Test Execution Steps</span>
                    </h3>
                    <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-xs">
                      {currentTest.steps}
                    </div>
                  </div>
                )}

                {/* Expected Result */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Expected Result</span>
                  </h3>
                  <div className="bg-emerald-50/40 border border-emerald-200/70 p-5 rounded-2xl text-emerald-950 font-medium text-sm whitespace-pre-wrap leading-relaxed shadow-xs">
                    {currentTest.expectedResult || (
                      <span className="text-slate-400 italic">No expected result documented.</span>
                    )}
                  </div>
                </div>


                {/* Actual Result & Tester Notes Textareas */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Actual Result
                    </h3>
                    <textarea
                      value={currentTest.actualResult || ''}
                      onChange={(e) => handleUpdate(currentTest.id, { actualResult: e.target.value })}
                      placeholder="Describe the observed outcome during execution..."
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none resize-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 shadow-xs"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Tester Notes & Environment Details
                    </h3>
                    <textarea
                      value={currentTest.testerNotes || ''}
                      onChange={(e) => handleUpdate(currentTest.id, { testerNotes: e.target.value })}
                      placeholder="Add staging environment, browser version, or execution remarks..."
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none resize-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-slate-700 shadow-xs"
                      rows={3}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Floating Action Dock */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-2 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] flex gap-2 pointer-events-auto items-center">
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

    </div>
  );
};
