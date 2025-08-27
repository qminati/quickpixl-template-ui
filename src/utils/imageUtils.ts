// src/utils/imageUtils.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export type ImageValidation = { isValid: boolean; error?: string };

export const validateImage = async (file: File): Promise<ImageValidation> => {
  if (!(file instanceof File)) return { isValid: false, error: 'Invalid file object' };
  if (file.size > MAX_FILE_SIZE) return { isValid: false, error: 'File too large (>10MB)' };
  if (!ALLOWED_TYPES.includes(file.type)) return { isValid: false, error: 'Invalid file type' };
  
  // Additional validation: check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) return { isValid: false, error: 'Invalid file extension' };
  
  // Additional security: validate file content header
  try {
    const arrayBuffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Check for common image file signatures
    if (bytes.length >= 8) {
      // JPEG: FF D8 FF
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return { isValid: true };
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return { isValid: true };
      // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
      if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && 
          bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return { isValid: true };
      // GIF: 47 49 46 38 (GIF8)
      if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return { isValid: true };
    }
    
    return { isValid: false, error: 'File content does not match image format' };
  } catch (error) {
    console.warn('Could not validate file content, allowing based on type:', error);
    return { isValid: true };
  }
};

const blobCache = new WeakMap<File, string>();

export const getBlobUrl = (file: File): string => {
  let url = blobCache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    blobCache.set(file, url);
  }
  return url;
};

export const revokeBlobUrl = (file: File) => {
  const url = blobCache.get(file);
  if (url) {
    URL.revokeObjectURL(url);
    blobCache.delete(file);
  }
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.target as HTMLImageElement;
  if (img) img.style.display = 'none';
};

export const createImageFallback = (): string => {
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#64748b" font-size="12">
        Image
      </text>
    </svg>
  `;
  // Guard btoa for SSR compatibility
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};