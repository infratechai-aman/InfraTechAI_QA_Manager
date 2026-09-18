import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { formatFileSize } from '../../utils/imageUtils';

export const ImageLightboxModal = ({ 
  isOpen, 
  images = [], 
  initialIndex = 0, 
  onClose 
}) => {
  useBodyScrollLock(isOpen);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setScale(1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setScale(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.3, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = () => {
    if (!currentImage?.url) return;
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = currentImage.name || `defect_attachment_${currentIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn overscroll-none touch-none select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between z-10 bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-2xl max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
            <ImageIcon size={18} />
          </div>
          <div className="truncate">
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {currentImage.name || `Screenshot ${currentIndex + 1}`}
            </p>
            <p className="text-[10px] text-slate-400">
              {formatFileSize(currentImage.size)} {images.length > 1 && `• ${currentIndex + 1} of ${images.length}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Download Screenshot"
          >
            <Download size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-rose-600 text-white rounded-xl transition-all cursor-pointer ml-1"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div 
        className="flex-1 flex items-center justify-center relative overflow-hidden my-3 select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {images.length > 1 && currentIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => prev - 1);
              setScale(1);
            }}
            className="absolute left-2 sm:left-6 z-20 p-2.5 sm:p-3 bg-slate-900/80 hover:bg-indigo-600 text-white rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl transition-all cursor-pointer"
            title="Previous Image"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="flex items-center justify-center max-w-full max-h-full p-2 transition-transform duration-200" style={{ transform: `scale(${scale})` }}>
          <img
            src={currentImage.url}
            alt={currentImage.name || 'Defect Screenshot'}
            className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-white/10 select-none pointer-events-auto cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation();
              setScale(prev => prev === 1 ? 1.8 : 1);
            }}
          />
        </div>

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => prev + 1);
              setScale(1);
            }}
            className="absolute right-2 sm:right-6 z-20 p-2.5 sm:p-3 bg-slate-900/80 hover:bg-indigo-600 text-white rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl transition-all cursor-pointer"
            title="Next Image"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Thumbnails Strip (if multiple images) */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 max-w-xl mx-auto overflow-x-auto p-2 bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-md">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setScale(1);
              }}
              className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                idx === currentIndex ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
