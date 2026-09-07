import React, { useState } from 'react';
import { 
  FileText, Plus, Search, ArrowLeft, ChevronRight, 
  Trash2, Calendar, CheckCircle, XCircle, AlertTriangle, Circle 
} from 'lucide-react';
import { formatDate, getStatusConfig } from '../../utils/formatters';

export const TestFilesView = ({ 
  files, 
  tests, 
  project, 
  onAddFile, 
  onDeleteFile,
  onAddTest,
  onDeleteTest 
}) => {
  const [activeFileId, setActiveFileId] = useState(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFile, setNewFile] = useState({ name: '', copyFromId: '' });

  const [isAddingTest, setIsAddingTest] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', expectedResult: '' });
  const [search, setSearch] = useState('');

  const activeFile = files.find((f) => f.id === activeFileId);
  const fileTests = tests.filter((t) => t.fileId === activeFileId);

  const filteredTests = fileTests.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.externalId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (!newFile.name.trim()) return;
    onAddFile(newFile.name, newFile.copyFromId);
    setIsCreatingFile(false);
    setNewFile({ name: '', copyFromId: '' });
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!newTest.title.trim()) return;
    onAddTest({
      title: newTest.title,
      expectedResult: newTest.expectedResult,
      projectId: project.id,
      fileId: activeFileId,
    });
    setNewTest({ title: '', expectedResult: '' });
    setIsAddingTest(false);
  };

  // 1. LIST OF ALL TEST SUITES / FILES
  if (!activeFileId || !activeFile) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Suites & Files</h1>
            <p className="text-slate-500 mt-1">
              Manage test collections for <span className="font-semibold text-slate-800">{project?.name}</span>
            </p>
          </div>
          <button
            onClick={() => setIsCreatingFile(!isCreatingFile)}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} /> New Test File
          </button>
        </div>

        {/* Create File Form */}
        {isCreatingFile && (
          <form onSubmit={handleCreateFile} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-4 mb-6 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900">Create Test Suite File</h3>
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
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
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
                className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newFile.name.trim()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
              >
                Create File
              </button>
            </div>
          </form>
        )}

        {/* Files List */}
        <div className="grid gap-3.5">
          {files.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-slate-700">No test files created yet</p>
              <p className="text-xs mt-1">Create a test file or import test cases via Bulk Import.</p>
            </div>
          ) : (
            files.map((f) => {
              const fileTestCount = tests.filter((t) => t.fileId === f.id).length;
              return (
                <div
                  key={f.id}
                  onClick={() => setActiveFileId(f.id)}
                  className="group bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {f.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Created on {formatDate(f.createdAt || f.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      {fileTestCount} Test Cases
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
              );
            })
          )}
        </div>
      </div>
    );
  }

  // 2. FILE DETAIL VIEW (View all test cases in this file)
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Navigation & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveFileId(null)}
          className="text-slate-500 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:border-slate-300 transition-all"
        >
          <ArrowLeft size={14} /> Back to All Suites
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{activeFile.name}</h1>
          <p className="text-slate-500 text-xs mt-1">
            {fileTests.length} test cases in this suite • Created {formatDate(activeFile.createdAt || activeFile.date)}
          </p>
        </div>
        <button
          onClick={() => setIsAddingTest(!isAddingTest)}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} /> New Test Case
        </button>
      </div>

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
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search test cases by ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredTests.length} of {fileTests.length} tests
          </span>
        </div>

        {filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <FileText size={44} className="opacity-20 mb-3" />
            <p className="font-semibold text-slate-700">No test cases found</p>
            <p className="text-xs text-slate-400 mt-1">Try another search query or click New Test Case.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-28">ID</th>
                  <th className="p-4 w-1/3">Title</th>
                  <th className="p-4">Expected Result</th>
                  <th className="p-4 w-32 text-center">Status</th>
                  <th className="p-4 w-28 text-right">Date Added</th>
                  {onDeleteTest && <th className="p-4 w-12 text-center"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((tc) => {
                  const statusConf = getStatusConfig(tc.status);
                  const StatusIcon = statusConf.icon;
                  return (
                    <tr key={tc.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="p-4 font-mono font-bold text-indigo-700 text-xs">
                        {tc.externalId}
                      </td>
                      <td className="p-4 font-bold text-slate-900 align-top">
                        {tc.title}
                      </td>
                      <td className="p-4 text-slate-600 text-xs leading-relaxed align-top">
                        {tc.expectedResult}
                      </td>
                      <td className="p-4 text-center align-top">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}>
                          <StatusIcon size={12} /> {tc.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-medium text-right whitespace-nowrap align-top">
                        {formatDate(tc.createdAt)}
                      </td>
                      {onDeleteTest && (
                        <td className="p-4 text-center align-top">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete test case ${tc.externalId}?`)) {
                                onDeleteTest(tc.id);
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete test case"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
