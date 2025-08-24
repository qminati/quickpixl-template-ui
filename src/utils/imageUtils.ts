// Image validation and processing utilities

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  size?: number;
  dimensions?: { width: number; height: number };
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DIMENSION = 4096; // pixels
export const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const validateImage = (file: File): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      resolve({
        isValid: false,
        error: `Unsupported file type. Please use: ${ALLOWED_TYPES.join(', ')}`
      });
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      resolve({
        isValid: false,
        error: `File too large. Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
      });
      return;
    }

    // Check image dimensions
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        resolve({
          isValid: false,
          error: `Image too large. Maximum dimensions are ${MAX_DIMENSION}x${MAX_DIMENSION}px`
        });
        return;
      }

      resolve({
        isValid: true,
        size: file.size,
        dimensions: { width: img.width, height: img.height }
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Invalid or corrupted image file'
      });
    };

    img.src = url;
  });
};

export const createImageFallback = (text: string, width = 300, height = 300): string => {
  return `https://via.placeholder.com/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`;
};

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (!img.dataset.fallbackApplied) {
    img.dataset.fallbackApplied = 'true';
    img.src = createImageFallback('Image Error', 300, 300);
  }
};