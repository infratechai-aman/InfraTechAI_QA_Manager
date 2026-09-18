import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Search, ArrowLeft, ChevronRight, 
  Trash2, Calendar, CheckCircle,
  X, Edit3, Save, ListOrdered, CheckCircle2, Eye,
  Upload, Sparkles, Play, Shield, User, Filter,
  UserCheck
} from 'lucide-react';
import { formatDate, getStatusConfig, getUserColor, getUserInitial } from '../../utils/formatters';
import { parseBulkText } from '../../services/parser';
import { getFileSharingMeta } from '../../utils/visibility';

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
  allTests,
  project, 
  onAddFile, 
  onDeleteFile,
  onAddTest,
  onDeleteTest,
  onUpdateTest,
  onBulkAssignSuite,
  onImportTests,
  activeFileId: propActiveFileId,
  onSelectFile,
  onExitTestFile,
  onNavigateToExecute,
  currentUser,
  triggerNewFileModal,
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

  useEffect(() => {
    if (triggerNewFileModal) {
      setIsCreatingFile(true);
      setCreationTab('manual');
    }
  }, [triggerNewFileModal]);

  // Bulk Import state for new suite
  const [bulkSuiteName, setBulkSuiteName] = useState('');
  const [bulkRawText, setBulkRawText] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);

  // Bulk Import state for active suite
  const [isBulkImportingInSuite, setIsBulkImportingInSuite] = useState(false);
  const [suiteBulkRawText, setSuiteBulkRawText] = useState('');
  const [suiteBulkPreview, setSuiteBulkPreview] = useState([]);

  // Task Assignment states
  const [assigneeFilter, setAssigneeFilter] = useState('ALL'); // 'ALL' | 'MINE' | 'UNASSIGNED' | email
  const [isAssignSuiteModalOpen, setIsAssignSuiteModalOpen] = useState(false);
  const [selectedSuiteAssignee, setSelectedSuiteAssignee] = useState('');

  const [isAddingTest, setIsAddingTest] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', expectedResult: '', steps: '', assignedTo: '' });
  const [search, setSearch] = useState('');
  const [testerFilter, setTesterFilter] = useState('ALL'); // 'ALL' | 'MINE' | 'TEAM' | 'UNEXECUTED'

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

  // Selected test for detail panel
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  const activeFile = files.find((f) => f.id === activeFileId);
  const fileTests = tests.filter((t) => t.fileId === activeFileId);
  const selectedTest = fileTests.find(t => t.id === selectedTestId);

  const filteredTests = fileTests.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.externalId.toLowerCase().includes(search.toLowerCase()) ||
      (t.executedBy && t.executedBy.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignedToName && t.assignedToName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (testerFilter === 'MINE') {
      if (!t.executedBy || t.executedBy.toLowerCase() !== currentUser?.email?.toLowerCase()) return false;
    } else if (testerFilter === 'TEAM') {
      if (!t.executedBy || t.executedBy.toLowerCase() === currentUser?.email?.toLowerCase()) return false;
    } else if (testerFilter === 'UNEXECUTED') {
      if (t.executedBy && t.status !== 'Not Run') return false;
    }

    if (assigneeFilter === 'MINE') {
      if (!t.assignedTo || t.assignedTo.toLowerCase() !== currentUser?.email?.toLowerCase()) return false;
    } else if (assigneeFilter === 'UNASSIGNED') {
      if (t.assignedTo) return false;
    } else if (assigneeFilter !== 'ALL') {
      if (!t.assignedTo || t.assignedTo.toLowerCase() !== assigneeFilter.toLowerCase()) return false;
    }

    return true;
  });

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
      createdBy: currentUser?.email || 'Unknown',
      createdByName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
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
      createdBy: currentUser?.email || 'Unknown',
      createdByName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
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
    const matchedCrewmate = crewmates.find(c => c.email === newTest.assignedTo?.toLowerCase());
    onAddTest({
      title: newTest.title,
      expectedResult: newTest.expectedResult,
      steps: newTest.steps,
      projectId: project.id,
      fileId: activeFileId,
      createdBy: currentUser?.email || 'Unknown',
      createdByName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
      assignedTo: newTest.assignedTo || null,
      assignedToName: matchedCrewmate ? matchedCrewmate.name : (newTest.assignedTo ? newTest.assignedTo.split('@')[0] : null),
    });
    setNewTest({ title: '', expectedResult: '', steps: '', assignedTo: '' });
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
      assignedTo: selectedTest.assignedTo || '',
      assignedToName: selectedTest.assignedToName || '',
    });
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateTest && selectedTest) {
      const matched = crewmates.find(c => c.email === editForm.assignedTo?.toLowerCase());
      onUpdateTest(selectedTest.id, {
        ...editForm,
        assignedTo: editForm.assignedTo || null,
        assignedToName: matched ? matched.name : (editForm.assignedTo ? editForm.assignedTo.split('@')[0] : null)
      });
    }
    setEditMode(false);
  };

  const handleQuickAssign = (assignedToEmail) => {
    if (!onUpdateTest || !selectedTest) return;
    const matched = crewmates.find(c => c.email === assignedToEmail?.toLowerCase());
    onUpdateTest(selectedTest.id, {
      ...selectedTest,
      assignedTo: assignedToEmail || null,
      assignedToName: matched ? matched.name : (assignedToEmail ? assignedToEmail.split('@')[0] : null)
    });
  };

  const handleExecuteBulkAssignSuite = () => {
    if (!onBulkAssignSuite || !activeFileId) return;
    const matched = crewmates.find(c => c.email === selectedSuiteAssignee?.toLowerCase());
    onBulkAssignSuite(
      activeFileId,
      selectedSuiteAssignee || null,
      matched ? matched.name : (selectedSuiteAssignee ? selectedSuiteAssignee.split('@')[0] : null)
    );
    setIsAssignSuiteModalOpen(false);
  };

  const handleClosePanel = () => {
    setSelectedTestId(null);
    setEditMode(false);
  };

  const statusOptions = ['Not Run', 'Pass', 'Fail', 'Blocked'];

  // ─── 1. LIST OF ALL TEST SUITES / FILES ─────────────────────────────────────
  if (!activeFileId || !activeFile) {
    return (
      <div className="p-4 sm:p-8 pb-28 sm:pb-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
        
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

                        {/* Suite Creator & Role Attribution */}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">
                            Created {formatDate(f.createdAt || f.date)}
                          </span>
                          {f.createdBy && (() => {
                            const isAuthorOwner = project?.ownerEmail?.toLowerCase() === f.createdBy?.toLowerCase() || f.creatorRole === 'Owner';
                            const isMe = f.createdBy?.toLowerCase() === currentUser?.email?.toLowerCase();
                            const authorColor = getUserColor(f.createdBy);
                            const authorInitial = getUserInitial(f.createdBy);
                            return (
                              <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md text-[11px]">
                                <span className={`w-3.5 h-3.5 rounded-full ${authorColor.badge} flex items-center justify-center text-[8px] font-black`}>
                                  {authorInitial}
                                </span>
                                <span className="text-slate-600">
                                  By <strong className={isMe ? 'text-indigo-600 font-bold' : 'text-slate-800'}>{isMe ? 'You' : f.createdBy}</strong>
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                                  isAuthorOwner
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                  <Shield size={9} />
                                  {isAuthorOwner ? 'OWNER' : 'QA TESTER'}
                                </span>
                              </span>
                            );
                          })()}

                          {/* Account A / Account B Visibility & Sharing Status Badge */}
                          {(() => {
                            const meta = getFileSharingMeta(f, allTests || tests, currentUser);
                            if (meta.isCreator) {
                              return meta.isSharedWithTeam ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  👥 Shared with Team ({meta.passedOrFailedCount} TC Run)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  🔒 Private Draft (Execute 1 TC to share with team)
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                👥 Shared Suite
                              </span>
                            );
                          })()}
                        </div>

                        {/* Mini progress bar & Tester summary */}
                        {fileTestCount > 0 && (
                          <div className="space-y-1.5 mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[140px]">
                                <div
                                  className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                              {filePassed > 0 && <span className="text-[10px] font-bold text-emerald-600">{filePassed}P</span>}
                              {fileFailed > 0 && <span className="text-[10px] font-bold text-rose-600">{fileFailed}F</span>}
                            </div>

                            {/* Who tested this suite */}
                            {(() => {
                              const suiteTests = tests.filter(t => t.fileId === f.id && t.executedBy);
                              if (suiteTests.length === 0) return null;
                              const testerCounts = {};
                              suiteTests.forEach(t => {
                                testerCounts[t.executedBy] = (testerCounts[t.executedBy] || 0) + 1;
                              });
                              const entries = Object.entries(testerCounts);
                              return (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100/80">
                                  <span className="text-[10px] text-slate-400 font-semibold">Tested by:</span>
                                  {entries.map(([email, count]) => {
                                    const isTesterOwner = project?.ownerEmail?.toLowerCase() === email?.toLowerCase();
                                    const isMe = email?.toLowerCase() === currentUser?.email?.toLowerCase();
                                    const color = getUserColor(email);
                                    return (
                                      <span key={email} className="inline-flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                        <span className={`w-3 h-3 rounded-full ${color.badge} flex items-center justify-center text-[7px] font-black`}>
                                          {getUserInitial(email)}
                                        </span>
                                        <span className="font-semibold text-slate-700">{isMe ? 'You' : email.split('@')[0]}</span>
                                        <span className="text-slate-400">({count})</span>
                                        <span className={`px-1 py-0.2 rounded text-[8px] font-black uppercase ${
                                          isTesterOwner ? 'text-indigo-700 bg-indigo-50' : 'text-emerald-700 bg-emerald-50'
                                        }`}>
                                          {isTesterOwner ? 'OWNER' : 'QA TESTER'}
                                        </span>
                                      </span>
                                    );
                                  })}
                                </div>
                              );
                            })()}
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
      <div className={`flex flex-col ${selectedTest ? 'w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200' : 'w-full'} overflow-hidden transition-all duration-300`}>
        <div className="p-4 sm:p-6 pb-28 sm:pb-6 space-y-5 overflow-y-auto flex-1">

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
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => {
                  setSelectedSuiteAssignee('');
                  setIsAssignSuiteModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Assign all test cases in this suite to a crewmate"
              >
                <UserCheck size={14} /> Assign Suite
              </button>
              <button
                onClick={() => {
                  setIsBulkImportingInSuite(!isBulkImportingInSuite);
                  setIsAddingTest(false);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} /> Bulk Import
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

          {/* Account A / Account B Private Draft Guidance Banner */}
          {(() => {
            const meta = getFileSharingMeta(activeFile, allTests || tests, currentUser);
            if (meta.isCreator && !meta.isSharedWithTeam) {
              return (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 animate-fadeIn">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                    <Shield size={16} />
                  </div>
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-bold text-amber-300">Private Draft Suite (Visible only to you)</p>
                    <p className="text-amber-200/80 mt-0.5">
                      This test file is currently invisible to Account B and other team members.
                      As soon as you pass or fail <strong>1 single test case</strong>, this suite will automatically unlock and appear for everyone in this project.
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <UserCheck size={13} className="text-indigo-600" />
                  Assign To Crewmate (Optional)
                </label>
                <select
                  value={newTest.assignedTo || ''}
                  onChange={(e) => setNewTest({ ...newTest, assignedTo: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="">Unassigned (Open for any tester)</option>
                  {crewmates.map(c => (
                    <option key={c.email} value={c.email}>
                      {c.name} ({c.email}) • {c.role}
                    </option>
                  ))}
                </select>
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
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, title, or tester..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Tester Filter Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={testerFilter}
                    onChange={(e) => setTesterFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 bg-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                    title="Filter test cases by tester execution"
                  >
                    <option value="ALL">All Executions</option>
                    <option value="MINE">Tested by Me</option>
                    <option value="TEAM">Tested by Team</option>
                    <option value="UNEXECUTED">Unexecuted</option>
                  </select>
                </div>

                {/* Assignee Filter Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <UserCheck size={14} className="text-indigo-600" />
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 bg-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                    title="Filter test cases by assigned crewmate"
                  >
                    <option value="ALL">All Assignees</option>
                    <option value="MINE">Assigned to Me</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {crewmates.length > 0 && (
                      <option disabled>──────────</option>
                    )}
                    {crewmates.map(c => {
                      const isMe = c.email === currentUser?.email?.toLowerCase();
                      return (
                        <option key={c.email} value={c.email}>
                          {c.name} {isMe ? '(You)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                {filteredTests.length} of {fileTests.length} tests
              </span>
            </div>

            {filteredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                <FileText size={44} className="opacity-20 mb-3" />
                <p className="font-semibold text-slate-700">No test cases found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search or filter, or click New Test Case.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4 w-24">ID</th>
                      <th className="p-4">Title</th>
                      <th className="p-4 w-44">Assigned To</th>
                      <th className="p-4 w-52">Tested By</th>
                      <th className="p-4 w-32 text-center">Status</th>
                      <th className="p-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTests.map((tc) => {
                      const statusConf = getStatusConfig(tc.status);
                      const StatusIcon = statusConf.icon;
                      const isSelected = tc.id === selectedTestId;

                      const isTesterOwner = (project?.ownerEmail?.toLowerCase() === tc.executedBy?.toLowerCase()) || (tc.executedByRole === 'Owner');
                      const isMe = tc.executedBy?.toLowerCase() === currentUser?.email?.toLowerCase();
                      const testerColor = tc.executedBy ? getUserColor(tc.executedBy) : null;
                      const testerInitial = tc.executedBy ? getUserInitial(tc.executedBy) : null;

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
                          <td className="p-4 font-mono font-bold text-indigo-700 text-xs align-top">
                            {tc.externalId}
                          </td>
                          <td className="p-4 align-top">
                            <span className={`font-bold text-sm block ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                              {tc.title}
                            </span>
                            {tc.steps && (
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                                Steps: {tc.steps.substring(0, 60)}{tc.steps.length > 60 ? '...' : ''}
                              </p>
                            )}
                            {tc.createdBy && (
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                                <span>Created by {tc.createdBy === currentUser?.email ? 'You' : tc.createdBy.split('@')[0]}</span>
                                <span className={`px-1 py-0.2 rounded text-[8px] font-bold uppercase ${
                                  (project?.ownerEmail?.toLowerCase() === tc.createdBy?.toLowerCase() || tc.creatorRole === 'Owner')
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {(project?.ownerEmail?.toLowerCase() === tc.createdBy?.toLowerCase() || tc.creatorRole === 'Owner') ? 'Owner' : 'QA Tester'}
                                </span>
                              </div>
                            )}
                          </td>
                          
                          {/* Assigned To Column */}
                          <td className="p-4 align-top">
                            {tc.assignedTo ? (() => {
                              const color = getUserColor(tc.assignedTo);
                              const initial = getUserInitial(tc.assignedToName || tc.assignedTo);
                              const isMe = tc.assignedTo?.toLowerCase() === currentUser?.email?.toLowerCase();
                              return (
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-5 h-5 rounded-full ${color.badge} flex items-center justify-center text-[9px] font-black shrink-0 shadow-2xs`}>
                                    {initial}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className={`text-xs font-bold truncate max-w-[110px] ${isMe ? 'text-indigo-600' : 'text-slate-800'}`}>
                                      {isMe ? 'You' : (tc.assignedToName || tc.assignedTo.split('@')[0])}
                                    </span>
                                    <span className="text-[9px] text-slate-400 truncate max-w-[110px]">
                                      {tc.assignedTo}
                                    </span>
                                  </div>
                                </div>
                              );
                            })() : (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium italic">
                                <User size={11} className="opacity-40" /> Unassigned
                              </span>
                            )}
                          </td>

                          {/* Tested By Column (Who executed this TC: Owner vs QA Tester) */}
                          <td className="p-4 align-top">
                            {tc.executedBy ? (
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <div className={`w-4 h-4 rounded-full ${testerColor?.badge} flex items-center justify-center text-[8px] font-black shrink-0 shadow-2xs`}>
                                    {testerInitial}
                                  </div>
                                  <span className={`text-xs font-bold truncate max-w-[130px] ${isMe ? 'text-indigo-600' : 'text-slate-800'}`}>
                                    {isMe ? 'You' : tc.executedBy}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                                    isTesterOwner 
                                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  }`}>
                                    <Shield size={9} />
                                    {isTesterOwner ? 'OWNER' : 'QA TESTER'}
                                  </span>
                                </div>
                                {tc.executedAt && (
                                  <span className="text-[10px] text-slate-400 pl-5.5">
                                    {formatDate(tc.executedAt)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic">
                                Not Executed
                              </span>
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

            {/* Task Assignment Section */}
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={12} className="text-indigo-600" /> Assigned Crewmate
                </span>
                {selectedTest.assignedTo && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    Active Task
                  </span>
                )}
              </div>

              {editMode ? (
                <div>
                  <select
                    value={editForm.assignedTo || ''}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    className="w-full border border-indigo-200 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {crewmates.map(c => (
                      <option key={c.email} value={c.email}>
                        {c.name} ({c.email}) • {c.role}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  {selectedTest.assignedTo ? (() => {
                    const color = getUserColor(selectedTest.assignedTo);
                    const initial = getUserInitial(selectedTest.assignedToName || selectedTest.assignedTo);
                    const isMe = selectedTest.assignedTo?.toLowerCase() === currentUser?.email?.toLowerCase();
                    return (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full ${color.badge} flex items-center justify-center text-xs font-black shadow-2xs shrink-0`}>
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {selectedTest.assignedToName || selectedTest.assignedTo.split('@')[0]} {isMe ? '(You)' : ''}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{selectedTest.assignedTo}</p>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                      <User size={14} className="opacity-40" />
                      <span>Not assigned to any crewmate</span>
                    </div>
                  )}

                  {/* Inline Quick Assign Dropdown */}
                  <select
                    value={selectedTest.assignedTo || ''}
                    onChange={(e) => handleQuickAssign(e.target.value)}
                    className="text-[11px] font-bold border border-indigo-200 bg-white text-indigo-700 rounded-lg px-2 py-1 outline-none hover:border-indigo-400 cursor-pointer shadow-2xs shrink-0"
                    title="Quick assign this test case"
                  >
                    <option value="">{selectedTest.assignedTo ? 'Remove' : 'Assign to...'}</option>
                    {crewmates.map(c => (
                      <option key={c.email} value={c.email}>
                        {c.name} {c.email === currentUser?.email?.toLowerCase() ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Tester & Creator Attribution Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Execution Attribution</span>
                {selectedTest.executedBy ? (() => {
                  const isTesterOwner = (project?.ownerEmail?.toLowerCase() === selectedTest.executedBy?.toLowerCase()) || (selectedTest.executedByRole === 'Owner');
                  return (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      isTesterOwner
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      <Shield size={10} />
                      {isTesterOwner ? 'OWNER' : 'QA TESTER'}
                    </span>
                  );
                })() : null}
              </div>

              {selectedTest.executedBy ? (() => {
                const color = getUserColor(selectedTest.executedBy);
                const initial = getUserInitial(selectedTest.executedBy);
                const isMe = selectedTest.executedBy?.toLowerCase() === currentUser?.email?.toLowerCase();
                return (
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full ${color.badge} flex items-center justify-center text-xs font-black shadow-2xs`}>
                      {initial}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Tested by <span className={isMe ? 'text-indigo-600' : 'text-slate-900'}>{isMe ? 'You' : selectedTest.executedBy}</span>
                      </p>
                      {selectedTest.executedAt && (
                        <p className="text-[10px] text-slate-400">{formatDate(selectedTest.executedAt)}</p>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <p className="text-xs text-slate-400 italic">This test case has not been executed yet.</p>
              )}

              {selectedTest.createdBy && (() => {
                const isCreatorOwner = (project?.ownerEmail?.toLowerCase() === selectedTest.createdBy?.toLowerCase()) || (selectedTest.creatorRole === 'Owner');
                const isMe = selectedTest.createdBy?.toLowerCase() === currentUser?.email?.toLowerCase();
                return (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Created by: <strong className="text-slate-700">{isMe ? 'You' : selectedTest.createdBy}</strong></span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      isCreatorOwner 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isCreatorOwner ? 'Owner' : 'QA Tester'}
                    </span>
                  </div>
                );
              })()}
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

      {/* Assign Suite Modal */}
      {isAssignSuiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Assign Test Suite</h3>
                  <p className="text-xs text-slate-400">Assign all test cases in this file to a crewmate</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAssignSuiteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Select Assignee</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedSuiteAssignee('')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedSuiteAssignee === '' 
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Unassigned</p>
                      <p className="text-[10px] text-slate-400">Clear all assignments in this suite</p>
                    </div>
                  </div>
                  {selectedSuiteAssignee === '' && <CheckCircle size={16} className="text-indigo-600" />}
                </button>

                {crewmates.map(c => {
                  const isSelected = selectedSuiteAssignee === c.email;
                  const isMe = c.email === currentUser?.email?.toLowerCase();
                  const color = getUserColor(c.email);
                  const initial = getUserInitial(c.name || c.email);
                  return (
                    <button
                      key={c.email}
                      type="button"
                      onClick={() => setSelectedSuiteAssignee(c.email)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${color.badge} flex items-center justify-center text-xs font-black shadow-2xs`}>
                          {initial}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {c.name} {isMe ? '(You)' : ''}
                          </p>
                          <p className="text-[10px] text-slate-400">{c.email} • {c.role}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle size={16} className="text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignSuiteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkAssignSuite}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 rounded-xl transition-all cursor-pointer"
              >
                Apply to Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
