const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export interface ImageValidation {
  isValid: boolean;
  error?: string;
}

export const validateImage = async (file: File): Promise<ImageValidation> => {
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: 'Invalid file object' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size too large (max 10MB)' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type' };
  }

  return { isValid: true };
};

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.target as HTMLImageElement;
  if (!img) return;
  
  // Simple fallback - just hide broken images gracefully
  img.style.display = 'none';
  
  // Set a fallback src to prevent further error events
  img.src = createImageFallback();
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