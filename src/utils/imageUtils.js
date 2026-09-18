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
 * Reads a File or Blob and compresses it into a high-quality data URL.
 * Max dimensions: 1920x1080 (HD), quality: 0.85.
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
        const maxWidth = 1920;
        const maxHeight = 1200;
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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG compression for compactness, or PNG if small/transparent
        const isPng = file.type === 'image/png' && file.size < 400 * 1024;
        const outputFormat = isPng ? 'image/png' : 'image/jpeg';
        const quality = outputFormat === 'image/jpeg' ? 0.85 : undefined;
        const dataUrl = canvas.toDataURL(outputFormat, quality);

        // Approximate base64 payload size
        const approximateSize = Math.round((dataUrl.length * 3) / 4);

        resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          url: dataUrl,
          name: file.name || 'screenshot.png',
          size: approximateSize,
          type: outputFormat,
          createdAt: new Date().toISOString(),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
