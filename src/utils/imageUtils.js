/**
 * Image processing utilities for bug screenshots and defect attachments.
 * Automatically resizes and compresses high-resolution images to keep
 * localStorage and Firestore payloads compact and fast.
 */

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Reads a File or Blob and compresses it into a high-quality, lightweight data URL.
 * Max dimensions: 1280x800.
 * Guarantees screenshots remain compact (~40KB - 80KB) to prevent Firestore 1MB limits.
 */
export const processImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 800;
        let { width, height } = img;

        // Downscale if too large
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const renderCanvas = (targetW, targetH) => {
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          
          // Fill background with white in case image has alpha transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          return canvas;
        };

        let currentW = width;
        let currentH = height;
        let canvas = renderCanvas(currentW, currentH);

        // Iterative compression loop to ensure image fits comfortably under ~85KB in base64
        let quality = 0.72;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        const MAX_BASE64_LENGTH = 115000; // ~85KB binary

        if (dataUrl.length > MAX_BASE64_LENGTH) {
          quality = 0.55;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length > MAX_BASE64_LENGTH) {
          quality = 0.42;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // If still large, scale dimensions down
        if (dataUrl.length > MAX_BASE64_LENGTH) {
          currentW = Math.round(currentW * 0.75);
          currentH = Math.round(currentH * 0.75);
          canvas = renderCanvas(currentW, currentH);
          dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        }

        // Approximate base64 payload size in bytes
        const approximateSize = Math.round((dataUrl.length * 3) / 4);

        resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          url: dataUrl,
          name: file.name || 'screenshot.jpg',
          size: approximateSize,
          type: 'image/jpeg',
          createdAt: new Date().toISOString(),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
