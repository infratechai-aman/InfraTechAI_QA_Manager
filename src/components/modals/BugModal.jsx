import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Bug as BugIcon, XCircle, AlertCircle, UploadCloud, Image as ImageIcon, 
  Trash2, Eye, UserCheck, Paperclip, Loader2 
} from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { processImageFile, formatFileSize } from '../../utils/imageUtils';
import { ImageLightboxModal } from './ImageLightboxModal';

export const BugModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  currentUser = null,
  project = null 
}) => {
  // Lock background body scroll whenever modal is open
  useBodyScrollLock(isOpen);

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Close on Escape key press (unless lightbox is open)
  useEffect(() => {
    if (!isOpen || lightboxIndex !== null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lightboxIndex, onClose]);

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

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    severity: initialData?.severity || 'High',
    priority: initialData?.priority || 'P1',
    actualBehavior: initialData?.actualBehavior || '',
    expectedBehavior: initialData?.expectedBehavior || '',
    reproductionSteps: initialData?.reproductionSteps || '',
    testCaseId: initialData?.testCaseId || null,
    projectId: initialData?.projectId || project?.id || null,
    reportedBy: initialData?.reportedBy || currentUser?.email || 'Unknown',
    reportedByName: initialData?.reportedByName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
    assignedTo: initialData?.assignedTo || '',
    assignedToName: initialData?.assignedToName || '',
    images: initialData?.images || (initialData?.imageUrl ? [{ id: 'img_legacy', url: initialData.imageUrl, name: 'Screenshot', size: 0 }] : []),
  });

  // Re-sync form state when modal reopens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        severity: initialData?.severity || 'High',
        priority: initialData?.priority || 'P1',
        actualBehavior: initialData?.actualBehavior || '',
        expectedBehavior: initialData?.expectedBehavior || '',
        reproductionSteps: initialData?.reproductionSteps || '',
        testCaseId: initialData?.testCaseId || null,
        projectId: initialData?.projectId || project?.id || null,
        reportedBy: initialData?.reportedBy || currentUser?.email || 'Unknown',
        reportedByName: initialData?.reportedByName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
        assignedTo: initialData?.assignedTo || '',
        assignedToName: initialData?.assignedToName || '',
        images: initialData?.images || (initialData?.imageUrl ? [{ id: 'img_legacy', url: initialData.imageUrl, name: 'Screenshot', size: 0 }] : []),
      });
    }
  }, [isOpen, initialData, currentUser, project]);

  // Global Clipboard Paste (Ctrl+V) listener while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e) => {
      // Don't intercept paste if user is pasting text into an input or textarea
      const targetTag = e.target?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea';

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        // If image found in clipboard, prevent default only if not text
        e.preventDefault();
        setIsProcessingImages(true);
        try {
          const processed = await Promise.all(imageFiles.map(processImageFile));
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...processed]
          }));
        } catch (err) {
          console.error('Error pasting image:', err);
        } finally {
          setIsProcessingImages(false);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingImages(true);
    try {
      const processed = await Promise.all(files.map(processImageFile));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processed]
      }));
    } catch (err) {
      alert('Failed to process image: ' + err.message);
    } finally {
      setIsProcessingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsProcessingImages(true);
    try {
      const processed = await Promise.all(files.map(processImageFile));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processed]
      }));
    } catch (err) {
      alert('Failed to process dropped image: ' + err.message);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit({
      ...formData,
      reportedBy: formData.reportedBy || currentUser?.email || 'Unknown',
      reportedByName: formData.reportedByName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tester',
      imageUrl: formData.images?.[0]?.url || null, // Backwards compatibility
    });
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overscroll-none touch-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onWheel={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div 
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 overscroll-contain select-text"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Modal Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <BugIcon size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Log Defect / Bug</h2>
                <p className="text-xs text-slate-500">Record an issue detected during test execution.</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <XCircle size={20} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div 
              className="p-5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 overscroll-contain"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Defect Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-900"
                  placeholder="e.g. Rate limit header missing after 5 failed attempts"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="Critical">Critical (System Down / Blocker)</option>
                    <option value="High">High (Major Feature Broken)</option>
                    <option value="Medium">Medium (Minor Glitch)</option>
                    <option value="Low">Low (Cosmetic / Trivial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="P0">P0 (Immediate Hotfix)</option>
                    <option value="P1">P1 (High Priority)</option>
                    <option value="P2">P2 (Normal Sprint)</option>
                    <option value="P3">P3 (Backlog / Low)</option>
                  </select>
                </div>
              </div>

              {/* Task Assignment: Assign Defect to Crewmate */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck size={14} className="text-indigo-600" />
                    Assign To Crewmate
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional task assignment</span>
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => {
                    const selEmail = e.target.value;
                    const matched = crewmates.find(c => c.email === selEmail);
                    setFormData({
                      ...formData,
                      assignedTo: selEmail,
                      assignedToName: matched ? matched.name : (selEmail ? selEmail.split('@')[0] : '')
                    });
                  }}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium text-slate-800"
                >
                  <option value="">Unassigned (Available for anyone)</option>
                  {crewmates.map((c) => (
                    <option key={c.email} value={c.email}>
                      {c.name} ({c.email}) • {c.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Actual Behavior</label>
                <textarea
                  value={formData.actualBehavior}
                  onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none font-medium text-slate-800"
                  rows={2}
                  placeholder="Describe what occurred unexpectedly..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expected Behavior</label>
                <textarea
                  value={formData.expectedBehavior}
                  onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none bg-slate-50 text-slate-700 font-medium"
                  rows={2}
                  placeholder="What was supposed to happen according to requirements?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Steps to Reproduce</label>
                <textarea
                  value={formData.reproductionSteps}
                  onChange={(e) => setFormData({ ...formData, reproductionSteps: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none font-mono text-xs text-slate-700"
                  rows={3}
                  placeholder="1. Go to page...&#10;2. Click on...&#10;3. Observe..."
                />
              </div>

              {/* Attachments / Screenshots Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip size={13} className="text-rose-500" />
                    Screenshots &amp; Evidence
                    {formData.images.length > 0 && (
                      <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                        {formData.images.length}
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Paste with <kbd className="bg-slate-100 px-1 py-0.5 rounded border text-slate-600 font-mono">Ctrl+V</kbd>
                  </span>
                </div>

                {/* Dropzone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="hidden"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  {isProcessingImages ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-indigo-600">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-xs font-bold">Compressing screenshot...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-xl mb-1.5">
                        <UploadCloud size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        Click to upload screenshot <span className="font-normal text-slate-400">or drag &amp; drop</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WEBP • Or copy screenshot &amp; press Ctrl+V anywhere
                      </p>
                    </div>
                  )}
                </div>

                {/* Thumbnails grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {formData.images.map((img, idx) => (
                      <div 
                        key={img.id || idx} 
                        className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col shadow-xs"
                      >
                        <div className="h-24 w-full overflow-hidden bg-slate-900/5 relative">
                          <img 
                            src={img.url} 
                            alt={img.name || `Screenshot ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => setLightboxIndex(idx)}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
                            title="Remove attachment"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxIndex(idx);
                            }}
                            className="absolute bottom-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs transition-opacity cursor-pointer"
                            title="Preview image"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                        <div className="p-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate font-medium max-w-[90px]" title={img.name}>{img.name}</span>
                          <span className="font-mono text-slate-400 shrink-0">{formatFileSize(img.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.title.trim()}
                className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-sm shadow-rose-200 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <BugIcon size={16} /> Save Defect
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Lightbox Modal for previewing images */}
      <ImageLightboxModal
        isOpen={lightboxIndex !== null}
        images={formData.images}
        initialIndex={lightboxIndex || 0}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
};
