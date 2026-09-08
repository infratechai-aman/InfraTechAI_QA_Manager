import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, ArrowLeft, ChevronRight, 
  Trash2, Calendar, CheckCircle, XCircle, AlertTriangle, 
  Circle, X, Edit3, Save, ListOrdered, CheckCircle2, Eye,
  Upload, Sparkles, Play, DoorOpen
} from 'lucide-react';
import { formatDate, getStatusConfig } from '../../utils/formatters';
import { parseBulkText } from '../../services/parser';

const SAMPLE_BULK_TEXT = `TC001
User Authentication via Email OTP
Steps:
1. Enter email address
2. Click Send OTP
3. Enter 6-digit code
Expected:
One-time password should be delivered to registered email and expire in 10 minutes.

TC002
Checkout discount coupon code validation
Steps:
1. Add item to cart
2. Enter discount code SUMMER20
3. Verify 20% discount applied to cart total
Expected:
Subtotal should reflect 20% discount and discount row displayed in checkout summary.

TC003
User profile avatar image upload
Expected:
PNG and JPG formats up to 5MB should upload and crop successfully.`;

export const TestFilesView = ({ 
  files, 
  tests, 
  project, 
  onAddFile, 
  onDeleteFile,
  onAddTest,
  onDeleteTest,
  onUpdateTest,
  onImportTests,
  activeFileId: propActiveFileId,
  onSelectFile,
  onExitTestFile,
  onNavigateToExecute,
}) => {
  const [internalFileId, setInternalFileId] = useState(null);
  const activeFileId = propActiveFileId !== undefined ? propActiveFileId : internalFileId;

  const setActiveFileId = (id) => {
    setInternalFileId(id);
    if (id && onSelectFile) onSelectFile(id);
    if (!id && onExitTestFile) onExitTestFile();
  };

  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [creationTab, setCreationTab] = useState('manual'); // 'manual' | 'bulk'
  const [newFile, setNewFile] = useState({ name: '', copyFromId: '' });

  // Bulk Import state for new suite
  const [bulkSuiteName, setBulkSuiteName] = useState('');
  const [bulkRawText, setBulkRawText] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);

  // Bulk Import state for active suite
  const [isBulkImportingInSuite, setIsBulkImportingInSuite] = useState(false);
  const [suiteBulkRawText, setSuiteBulkRawText] = useState('');
  const [suiteBulkPreview, setSuiteBulkPreview] = useState([]);

  const [isAddingTest, setIsAddingTest] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', expectedResult: '', steps: '' });
  const [search, setSearch] = useState('');

  // Selected test for detail panel
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  const activeFile = files.find((f) => f.id === activeFileId);
  const fileTests = tests.filter((t) => t.fileId === activeFileId);
  const selectedTest = fileTests.find(t => t.id === selectedTestId);

  const filteredTests = fileTests.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.externalId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (!newFile.name.trim()) return;
    const created = onAddFile(newFile.name, newFile.copyFromId);
    setIsCreatingFile(false);
    setNewFile({ name: '', copyFromId: '' });
    if (created?.id) {
      setActiveFileId(created.id);
    }
  };

  // Bulk Import: Load sample text
  const handleLoadSample = () => {
    setBulkRawText(SAMPLE_BULK_TEXT);
    setBulkPreview(parseBulkText(SAMPLE_BULK_TEXT, project?.id, 'preview'));
  };

  // Bulk Import: Parse text
  const handleParseBulk = () => {
    if (!bulkRawText.trim()) return;
    setBulkPreview(parseBulkText(bulkRawText, project?.id, 'preview'));
  };

  // Bulk Import: Create Suite and save test cases
  const handleCreateSuiteWithBulkImport = (e) => {
    e?.preventDefault();
    if (!bulkSuiteName.trim() || bulkPreview.length === 0) return;

    const createdFile = onAddFile(bulkSuiteName.trim());
    const fileId = createdFile?.id;

    const testCasesToSave = bulkPreview.map((t) => ({
      ...t,
      fileId,
      projectId: project?.id,
    }));

    if (onImportTests) {
      onImportTests(testCasesToSave, false);
    }

    setBulkSuiteName('');
    setBulkRawText('');
    setBulkPreview([]);
    setIsCreatingFile(false);
    if (fileId) {
      setActiveFileId(fileId);
    }
  };

  // Bulk Import: Inside active suite
  const handleLoadSampleForSuite = () => {
    setSuiteBulkRawText(SAMPLE_BULK_TEXT);
    setSuiteBulkPreview(parseBulkText(SAMPLE_BULK_TEXT, project?.id, activeFileId));
  };

  const handleParseBulkForSuite = () => {
    if (!suiteBulkRawText.trim()) return;
    setSuiteBulkPreview(parseBulkText(suiteBulkRawText, project?.id, activeFileId));
  };

  const handleImportIntoActiveSuite = (e) => {
    e?.preventDefault();
    if (!activeFileId || suiteBulkPreview.length === 0) return;

    const testCasesToSave = suiteBulkPreview.map((t) => ({
      ...t,
      fileId: activeFileId,
      projectId: project?.id,
    }));

    if (onImportTests) {
      onImportTests(testCasesToSave, false);
    }

    setSuiteBulkRawText('');
    setSuiteBulkPreview([]);
    setIsBulkImportingInSuite(false);
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!newTest.title.trim()) return;
    onAddTest({
      title: newTest.title,
      expectedResult: newTest.expectedResult,
      steps: newTest.steps,
      projectId: project.id,
      fileId: activeFileId,
    });
    setNewTest({ title: '', expectedResult: '', steps: '' });
    setIsAddingTest(false);
  };

  const handleOpenTest = (tc) => {
    setSelectedTestId(tc.id);
    setEditMode(false);
    setEditForm({});
  };

  const handleStartEdit = () => {
    setEditForm({
      title: selectedTest.title,
      expectedResult: selectedTest.expectedResult || '',
      steps: selectedTest.steps || '',
      actualResult: selectedTest.actualResult || '',
      testerNotes: selectedTest.testerNotes || '',
      status: selectedTest.status || 'Not Run',
    });
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateTest && selectedTest) {
      onUpdateTest(selectedTest.id, editForm);
    }
    setEditMode(false);
  };

  const handleClosePanel = () => {
    setSelectedTestId(null);
    setEditMode(false);
  };

  const statusOptions = ['Not Run', 'Pass', 'Fail', 'Blocked'];

  // ─── 1. LIST OF ALL TEST SUITES / FILES ─────────────────────────────────────
  if (!activeFileId || !activeFile) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Suites &amp; Files</h1>
            <p className="text-slate-500 mt-1">
              Manage test collections for <span className="font-semibold text-slate-800">{project?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => {
                setIsCreatingFile(true);
                setCreationTab('manual');
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> New Test File
            </button>
            <button
              onClick={() => {
                setIsCreatingFile(true);
                setCreationTab('bulk');
              }}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 flex items-center gap-2 cursor-pointer"
            >
              <Upload size={15} /> Bulk Import
            </button>
          </div>
        </div>

        {/* Create File / Bulk Import Form */}
        {isCreatingFile && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-4 mb-6 animate-fadeIn">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setCreationTab('manual')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  creationTab === 'manual'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText size={14} /> Blank Suite / Clone
              </button>
              <button
                type="button"
                onClick={() => setCreationTab('bulk')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  creationTab === 'bulk'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload size={14} /> Bulk Import Test Cases
              </button>
            </div>

            {/* Tab 1: Manual / Blank Suite */}
            {creationTab === 'manual' && (
              <form onSubmit={handleCreateFile} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      File / Suite Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      autoFocus
                      type="text"
                      value={newFile.name}
                      onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                      placeholder="e.g. Sprint 43 Regression Tests"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Clone Test Cases From (Optional)
                    </label>
                    <select
                      value={newFile.copyFromId}
                      onChange={(e) => setNewFile({ ...newFile, copyFromId: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white cursor-pointer font-medium"
                    >
                      <option value="">-- Start Blank --</option>
                      {files.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({formatDate(f.date)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingFile(false)}
                    className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newFile.name.trim()}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    Create File
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Bulk Import Suite */}
            {creationTab === 'bulk' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      New Suite / File Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bulkSuiteName}
                      onChange={(e) => setBulkSuiteName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                      placeholder="e.g. Sprint 15 Bulk Import Suite"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles size={14} className="text-indigo-600" /> Load Sample Text
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Raw Text */}
                  <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                      <span>Paste Test Specifications</span>
                      <button
                        type="button"
                        onClick={handleParseBulk}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Parse Text
                      </button>
                    </div>
                    <textarea
                      value={bulkRawText}
                      onChange={(e) => {
                        setBulkRawText(e.target.value);
                        if (e.target.value.trim()) {
                          setBulkPreview(parseBulkText(e.target.value, project?.id, 'preview'));
                        } else {
                          setBulkPreview([]);
                        }
                      }}
                      rows={8}
                      className="w-full p-3 font-mono text-xs outline-none resize-none text-slate-800 leading-relaxed placeholder:text-slate-400"
                      placeholder={`TC001\nVerify User Login with valid credentials\nSteps:\n1. Open login page\n2. Enter valid email and password\n3. Click Login\nExpected:\nDashboard should load and auth token stored.\n\nTC002\nVerify Invalid password handling\nExpected:\nError message shown.`}
                    />
                  </div>

                  {/* Right: Live Preview */}
                  <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                      <span>Live Preview ({bulkPreview.length} Cases)</span>
                      {bulkPreview.length > 0 && (
                        <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          Ready to import
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[190px] p-2 bg-white">
                      {bulkPreview.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-xs text-center space-y-1">
                          <FileText size={28} className="opacity-20" />
                          <p className="font-semibold text-slate-600">No test cases parsed yet</p>
                          <p className="text-[11px]">Type or paste test cases on the left, or click "Load Sample Text".</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {bulkPreview.map((tc, idx) => (
                            <div key={idx} className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-700 text-[11px]">{tc.externalId}</span>
                                <span className="font-bold text-slate-800 truncate">{tc.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{tc.expectedResult}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingFile(false);
                      setBulkRawText('');
                      setBulkPreview([]);
                    }}
                    className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSuiteWithBulkImport}
                    disabled={!bulkSuiteName.trim() || bulkPreview.length === 0}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={15} /> Create Suite &amp; Import {bulkPreview.length} Cases
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Files List */}
        <div className="grid gap-3.5">
          {files.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 space-y-3">
              <FileText size={40} className="mx-auto opacity-20" />
              <div>
                <p className="font-semibold text-slate-700 text-base">No test files created yet</p>
                <p className="text-xs mt-1">Create a test file or import test cases via Bulk Import.</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCreatingFile(true);
                    setCreationTab('manual');
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> New Test File
                </button>
                <button
                  onClick={() => {
                    setIsCreatingFile(true);
                    setCreationTab('bulk');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} /> Bulk Import Cases
                </button>
              </div>
            </div>
          ) : (
            files.map((f) => {
              const fileTestCount = tests.filter((t) => t.fileId === f.id).length;
              const filePassed = tests.filter(t => t.fileId === f.id && t.status === 'Pass').length;
              const fileFailed = tests.filter(t => t.fileId === f.id && t.status === 'Fail').length;
              const fileNotRun = tests.filter(t => t.fileId === f.id && t.status === 'Not Run').length;
              const pct = fileTestCount > 0 ? Math.round(((fileTestCount - fileNotRun) / fileTestCount) * 100) : 0;
              return (
                <div
                  key={f.id}
                  onClick={() => setActiveFileId(f.id)}
                  className="group bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {f.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Created {formatDate(f.createdAt || f.date)}
                        </p>
                        {/* Mini progress bar */}
                        {fileTestCount > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                            {filePassed > 0 && <span className="text-[10px] font-bold text-emerald-600">{filePassed}P</span>}
                            {fileFailed > 0 && <span className="text-[10px] font-bold text-rose-600">{fileFailed}F</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        {fileTestCount} Tests
                      </span>

                      {onDeleteFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${f.name}" and all its test cases?`)) {
                              onDeleteFile(f.id);
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete File"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ─── 2. FILE DETAIL VIEW ─────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">
      
      {/* Left: Test Case Table */}
      <div className={`flex flex-col ${selectedTest ? 'w-1/2 border-r border-slate-200' : 'w-full'} overflow-hidden transition-all duration-300`}>
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* Navigation & Header */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setActiveFileId(null);
                setSelectedTestId(null);
              }}
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to All Suites
            </button>

            {onNavigateToExecute && (
              <button
                onClick={() => {
                  setActiveFileId(activeFile.id);
                  onNavigateToExecute();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Play size={13} /> Run in Test Execution
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeFile.name}</h1>
              <p className="text-slate-500 text-xs mt-1">
                {fileTests.length} test cases • Created {formatDate(activeFile.createdAt || activeFile.date)}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => {
                  setIsBulkImportingInSuite(!isBulkImportingInSuite);
                  setIsAddingTest(false);
                }}
                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} /> Bulk Import Cases
              </button>
              <button
                onClick={() => {
                  setIsAddingTest(!isAddingTest);
                  setIsBulkImportingInSuite(false);
                }}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> New Test Case
              </button>
            </div>
          </div>

          {/* In-Suite Bulk Import Form */}
          {isBulkImportingInSuite && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bulk Import into "{activeFile.name}"</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Paste plain text test cases to add directly to this suite.</p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleForSuite}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-indigo-600" /> Load Sample
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Raw Text */}
                <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                    <span>Paste Test Cases</span>
                    <button
                      type="button"
                      onClick={handleParseBulkForSuite}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Parse Text
                    </button>
                  </div>
                  <textarea
                    value={suiteBulkRawText}
                    onChange={(e) => {
                      setSuiteBulkRawText(e.target.value);
                      if (e.target.value.trim()) {
                        setSuiteBulkPreview(parseBulkText(e.target.value, project?.id, activeFileId));
                      } else {
                        setSuiteBulkPreview([]);
                      }
                    }}
                    rows={7}
                    className="w-full p-3 font-mono text-xs outline-none resize-none text-slate-800 leading-relaxed placeholder:text-slate-400"
                    placeholder={`TC001\nTitle of test case\nSteps:\n1. Step 1\nExpected:\nExpected result`}
                  />
                </div>

                {/* Right: Preview */}
                <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                    <span>Preview ({suiteBulkPreview.length} Cases)</span>
                    {suiteBulkPreview.length > 0 && (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        Ready to add
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[170px] p-2 bg-white">
                    {suiteBulkPreview.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-xs text-center space-y-1">
                        <FileText size={24} className="opacity-20" />
                        <p className="font-semibold text-slate-600 text-xs">No cases parsed yet</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {suiteBulkPreview.map((tc, idx) => (
                          <div key={idx} className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-700 text-[11px]">{tc.externalId}</span>
                              <span className="font-bold text-slate-800 truncate">{tc.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{tc.expectedResult}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkImportingInSuite(false);
                    setSuiteBulkRawText('');
                    setSuiteBulkPreview([]);
                  }}
                  className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportIntoActiveSuite}
                  disabled={suiteBulkPreview.length === 0}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> Add {suiteBulkPreview.length} Cases to Suite
                </button>
              </div>
            </div>
          )}

          {/* Manual Test Case Form */}
          {isAddingTest && (
            <form onSubmit={handleCreateTest} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Create Manual Test Case</h3>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                  Auto-generated ID
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Test Case Title <span className="text-rose-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                  placeholder="e.g. Verify checkout button triggers payment popup"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Steps (Optional)
                </label>
                <textarea
                  value={newTest.steps}
                  onChange={(e) => setNewTest({ ...newTest, steps: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none font-mono"
                  placeholder="1. Navigate to checkout&#10;2. Click the checkout button&#10;3. Observe the popup"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Expected Result <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={newTest.expectedResult}
                  onChange={(e) => setNewTest({ ...newTest, expectedResult: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                  placeholder="What should happen when this test is successfully executed?"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTest(false)}
                  className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTest.title.trim()}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  Save Test Case
                </button>
              </div>
            </form>
          )}

          {/* Tests Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                {filteredTests.length} of {fileTests.length} tests
              </span>
            </div>

            {filteredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                <FileText size={44} className="opacity-20 mb-3" />
                <p className="font-semibold text-slate-700">No test cases found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search or click New Test Case.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4 w-24">ID</th>
                      <th className="p-4">Title</th>
                      <th className="p-4 w-32 text-center">Status</th>
                      <th className="p-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTests.map((tc) => {
                      const statusConf = getStatusConfig(tc.status);
                      const StatusIcon = statusConf.icon;
                      const isSelected = tc.id === selectedTestId;
                      return (
                        <tr
                          key={tc.id}
                          onClick={() => handleOpenTest(tc)}
                          className={`cursor-pointer transition-colors group ${
                            isSelected
                              ? 'bg-indigo-50 border-l-2 border-l-indigo-500'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="p-4 font-mono font-bold text-indigo-700 text-xs">
                            {tc.externalId}
                          </td>
                          <td className="p-4 align-top">
                            <span className={`font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                              {tc.title}
                            </span>
                            {tc.steps && (
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                                Steps: {tc.steps.substring(0, 60)}{tc.steps.length > 60 ? '...' : ''}
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-center align-top">
                            <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}>
                              <StatusIcon size={12} /> {tc.status}
                            </span>
                          </td>
                          <td className="p-4 text-center align-top">
                            <div className="flex items-center gap-1 justify-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenTest(tc); }}
                                className="p-1.5 text-indigo-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                title="Open test case"
                              >
                                <Eye size={14} />
                              </button>
                              {onDeleteTest && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete test case ${tc.externalId}?`)) {
                                      onDeleteTest(tc.id);
                                      if (selectedTestId === tc.id) setSelectedTestId(null);
                                    }
                                  }}
                                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete test case"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Test Case Detail Panel */}
      {selectedTest && (
        <div className="w-1/2 flex flex-col bg-white overflow-hidden">
          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg shrink-0">
                {selectedTest.externalId}
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 truncate">
                {selectedTest.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!editMode ? (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 size={13} /> Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Save size={13} /> Save
                  </button>
                </>
              )}
              <button
                onClick={handleClosePanel}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
              {editMode ? (
                <div className="grid grid-cols-4 gap-2">
                  {statusOptions.map(s => {
                    const conf = getStatusConfig(s);
                    const Icon = conf.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => setEditForm({ ...editForm, status: s })}
                        className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                          editForm.status === s
                            ? `${conf.bg} ${conf.color} ${conf.border} ring-2 ring-offset-1`
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <Icon size={14} />
                        {s}
                      </button>
                    );
                  })}
                </div>
              ) : (
                (() => {
                  const conf = getStatusConfig(selectedTest.status);
                  const Icon = conf.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${conf.bg} ${conf.color} ${conf.border}`}>
                      <Icon size={14} /> {selectedTest.status}
                    </span>
                  );
                })()
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Title</label>
              {editMode ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                />
              ) : (
                <p className="text-sm font-bold text-slate-900 leading-relaxed">{selectedTest.title}</p>
              )}
            </div>

            {/* Steps */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered size={12} className="text-indigo-500" /> Execution Steps
              </label>
              {editMode ? (
                <textarea
                  value={editForm.steps}
                  onChange={e => setEditForm({ ...editForm, steps: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                  rows={4}
                  placeholder="1. Step one&#10;2. Step two..."
                />
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                  {selectedTest.steps || <span className="text-slate-400 italic font-sans">No steps documented.</span>}
                </div>
              )}
            </div>

            {/* Expected Result */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> Expected Result
              </label>
              {editMode ? (
                <textarea
                  value={editForm.expectedResult}
                  onChange={e => setEditForm({ ...editForm, expectedResult: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                  rows={3}
                />
              ) : (
                <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-4 text-sm text-emerald-950 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedTest.expectedResult || <span className="text-slate-400 italic font-normal">Not documented.</span>}
                </div>
              )}
            </div>

            {/* Actual Result */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actual Result (from execution)</label>
              {editMode ? (
                <textarea
                  value={editForm.actualResult}
                  onChange={e => setEditForm({ ...editForm, actualResult: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                  rows={3}
                  placeholder="What actually happened during testing..."
                />
              ) : (
                <div className={`rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed border ${
                  selectedTest.actualResult
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-50/40 border-dashed border-slate-200 text-slate-400 italic'
                }`}>
                  {selectedTest.actualResult || 'Not yet executed.'}
                </div>
              )}
            </div>

            {/* Tester Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tester Notes / Environment</label>
              {editMode ? (
                <textarea
                  value={editForm.testerNotes}
                  onChange={e => setEditForm({ ...editForm, testerNotes: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                  rows={2}
                  placeholder="Browser, environment, credentials used..."
                />
              ) : (
                <div className={`rounded-xl p-4 text-xs whitespace-pre-wrap leading-relaxed border ${
                  selectedTest.testerNotes
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-slate-50/40 border-dashed border-slate-200 text-slate-400 italic'
                }`}>
                  {selectedTest.testerNotes || 'No remarks added.'}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Created {formatDate(selectedTest.createdAt)}
              </span>
              {selectedTest.updatedAt && (
                <span className="flex items-center gap-1">
                  Updated {formatDate(selectedTest.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
