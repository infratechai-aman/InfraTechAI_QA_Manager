import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, Sparkles, AlertCircle } from 'lucide-react';
import { parseBulkText } from '../../services/parser';

const SAMPLE_BULK_TEXT = `TC001
User Authentication via Email OTP
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

export const BulkImportView = ({ onImport, project, files, onAddFile }) => {
  const [targetFileId, setTargetFileId] = useState('');
  const [rawText, setRawText] = useState('');
  const [preview, setPreview] = useState([]);
  const [isNewFileMode, setIsNewFileMode] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    if (!targetFileId && files.length > 0) {
      setTargetFileId(files[0].id);
    }
  }, [files, targetFileId]);

  const handleLoadSample = () => {
    setRawText(SAMPLE_BULK_TEXT);
    if (targetFileId) {
      setPreview(parseBulkText(SAMPLE_BULK_TEXT, project?.id, targetFileId));
    }
  };

  const handleParse = () => {
    if (!rawText.trim()) return;
    const resolvedFileId = isNewFileMode ? 'temp-new-file' : targetFileId;
    setPreview(parseBulkText(rawText, project?.id, resolvedFileId));
  };

  const handleImport = () => {
    if (preview.length === 0) return;

    let destinationFileId = targetFileId;
    if (isNewFileMode && newFileName.trim()) {
      const createdFile = onAddFile(newFileName.trim());
      destinationFileId = createdFile?.id || files[0]?.id;
    }

    // Attach destination file ID to preview items
    const testCasesToSave = preview.map((t) => ({
      ...t,
      fileId: destinationFileId || t.fileId,
      projectId: project?.id,
    }));

    onImport(testCasesToSave);
    setRawText('');
    setPreview([]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bulk Test Import</h1>
          <p className="text-slate-500 mt-1">
            Paste plain-text test plans to automatically parse test cases into structured data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLoadSample}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles size={14} className="text-indigo-600" /> Load Sample Text
          </button>

          <div className="flex flex-col">
            <select
              value={isNewFileMode ? 'NEW' : targetFileId}
              onChange={(e) => {
                if (e.target.value === 'NEW') {
                  setIsNewFileMode(true);
                } else {
                  setIsNewFileMode(false);
                  setTargetFileId(e.target.value);
                }
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer text-slate-800"
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  Target: {f.name}
                </option>
              ))}
              <option value="NEW">+ Create New Suite for Import</option>
            </select>
          </div>

          {isNewFileMode && (
            <input
              type="text"
              placeholder="New suite name..."
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          )}

          <button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-700 shadow-xs transition-all disabled:opacity-50"
          >
            Parse Text
          </button>

          <button
            onClick={handleImport}
            disabled={preview.length === 0 || (isNewFileMode && !newFileName.trim())}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5"
          >
            <Check size={14} /> Import {preview.length} Cases
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[480px]">
        
        {/* Left: Raw Text Input */}
        <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Raw Plain Text Input
            </span>
            <span className="text-[11px] text-slate-400">
              Format: TC001 / Title / Expected Result
            </span>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-xs resize-none outline-none text-slate-800 leading-relaxed placeholder:text-slate-400"
            placeholder="TC001&#10;Login with valid credentials&#10;Expected:&#10;User should be logged in and redirected to home.&#10;&#10;TC002&#10;Invalid password handling&#10;Expected:&#10;Alert displayed indicating wrong credentials."
          />
        </div>

        {/* Right: Parsed Preview */}
        <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Live Preview ({preview.length} Test Cases)
            </span>
            {preview.length > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Ready to import
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-white">
            {preview.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-8 text-center space-y-2">
                <FileText size={36} className="opacity-20" />
                <p className="font-semibold text-slate-600">No test cases parsed yet</p>
                <p className="text-slate-400">
                  Paste test specifications on the left and click "Parse Text" to preview.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold text-slate-600 w-24 uppercase tracking-wider">ID</th>
                    <th className="p-3 font-bold text-slate-600 w-1/3 uppercase tracking-wider">Title</th>
                    <th className="p-3 font-bold text-slate-600 uppercase tracking-wider">Expected Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.map((tc, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-indigo-700 align-top">
                        {tc.externalId}
                      </td>
                      <td className="p-3 font-bold text-slate-900 align-top">
                        {tc.title}
                      </td>
                      <td className="p-3 text-slate-600 align-top line-clamp-2 leading-relaxed">
                        {tc.expectedResult}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
