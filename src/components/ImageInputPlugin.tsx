// src/components/ImageInputPlugin.tsx
import React, { useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { ImageInputSettings } from '@/types/interfaces';
import { validateImage, getBlobUrl, revokeBlobUrl, handleImageError } from '@/utils/imageUtils';
import { toast } from 'sonner';

interface ImageInputPluginProps {
  settings: ImageInputSettings;
  onSettingsChange: (settings: ImageInputSettings) => void;
}

const ImageInputPlugin: React.FC<ImageInputPluginProps> = ({
  settings, onSettingsChange
}) => {
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const valid: File[] = [];
    let hadErrors = false;

    for (const f of files) {
      const v = await validateImage(f);
      if (v.isValid) valid.push(f); else { hadErrors = true; toast.error(`${f.name}: ${v.error}`); }
    }

    if (valid.length) {
      onSettingsChange({ ...settings, selectedImages: [...(settings.selectedImages || []), ...valid] });
      toast.success(`${valid.length} image${valid.length > 1 ? 's' : ''} uploaded`);
    } else if (hadErrors) {
      toast.error('No valid images could be uploaded');
    }

    event.target.value = ''; // allow re-upload of same filename
  };

  const handleImageRemove = (file: File) => {
    revokeBlobUrl(file);
    onSettingsChange({ ...settings, selectedImages: (settings.selectedImages || []).filter(x => x !== file) });
  };

  const handleKnockoutImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const valid: File[] = [];
    let hadErrors = false;

    for (const f of files) {
      const v = await validateImage(f);
      if (v.isValid) valid.push(f); else { hadErrors = true; toast.error(`${f.name}: ${v.error}`); }
    }

    if (valid.length) {
      onSettingsChange({ ...settings, selectedKnockoutImages: [...(settings.selectedKnockoutImages || []), ...valid] });
      toast.success(`${valid.length} knockout image${valid.length > 1 ? 's' : ''} uploaded`);
    } else if (hadErrors) {
      toast.error('No valid knockout images could be uploaded');
    }

    event.target.value = ''; // allow re-upload of same filename
  };

  const handleKnockoutImageRemove = (file: File) => {
    revokeBlobUrl(file);
    onSettingsChange({ ...settings, selectedKnockoutImages: (settings.selectedKnockoutImages || []).filter(x => x !== file) });
  };

  useEffect(() => {
    return () => {
      // Clean up blob URLs on unmount
      if (settings.selectedImages) {
        settings.selectedImages.forEach(revokeBlobUrl);
      }
      if (settings.selectedKnockoutImages) {
        settings.selectedKnockoutImages.forEach(revokeBlobUrl);
      }
    };
  }, [settings.selectedImages, settings.selectedKnockoutImages]);

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      <div className="p-3">
        <div className="flex items-stretch h-24 gap-3">
              {/* Regular Images Upload Area */}
              <div className="relative w-28">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleImageUpload}
                />
                <div className="h-full border border-dashed border-input rounded-md px-2 py-1 flex flex-col items-center justify-center bg-background hover:bg-secondary/20 transition-colors">
                  <Upload className="w-3 h-3 text-primary mb-1" />
                  <span className="text-xs font-medium text-foreground text-center leading-tight">
                    Upload Images
                  </span>
                  <span className="text-xs text-muted-foreground text-center leading-tight mt-0.5">
                    Click or drag
                  </span>
                </div>
              </div>

              {/* Knockout Images Upload Area */}
              <div className="relative w-28">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleKnockoutImageUpload}
                />
                <div className="h-full border border-dashed border-input rounded-md px-2 py-1 flex flex-col items-center justify-center bg-background hover:bg-secondary/20 transition-colors">
                  <Upload className="w-3 h-3 text-primary mb-1" />
                  <span className="text-xs font-medium text-foreground text-center leading-tight">
                    Upload Knockout
                  </span>
                  <span className="text-xs text-muted-foreground text-center leading-tight mt-0.5">
                    Click or drag
                  </span>
                </div>
              </div>

              {/* Selected Images Section */}
              <div className="flex-1 min-w-0">
                {((settings.selectedImages?.length || 0) > 0) || ((settings.selectedKnockoutImages?.length || 0) > 0) ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center mb-2 gap-4">
                      {(settings.selectedImages?.length || 0) > 0 && (
                        <span className="text-xs font-medium text-foreground">
                          Images ({settings.selectedImages.length})
                        </span>
                      )}
                      {(settings.selectedKnockoutImages?.length || 0) > 0 && (
                        <span className="text-xs font-medium text-foreground">
                          Knockout ({settings.selectedKnockoutImages.length})
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="grid grid-cols-12 gap-0.5">
                        {/* Regular Images */}
                        {settings.selectedImages?.map((image, i) => (
                          <div key={`regular-${image.name}-${image.size}-${i}`} className="relative group">
                            <div className="aspect-square bg-muted rounded border overflow-hidden">
                              <img
                                src={getBlobUrl(image)}
                                alt={`Selected image ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                draggable={false}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleImageRemove(image)}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-input flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                        {/* Knockout Images */}
                        {settings.selectedKnockoutImages?.map((image, i) => (
                          <div key={`knockout-${image.name}-${image.size}-${i}`} className="relative group">
                            <div className="aspect-square bg-muted rounded border overflow-hidden">
                              <div className="relative w-full h-full">
                                <img
                                  src={getBlobUrl(image)}
                                  alt={`Selected knockout image ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                  draggable={false}
                                />
                                {/* Black overlay to represent knockout */}
                                <div className="absolute inset-0 bg-black/80"></div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleKnockoutImageRemove(image)}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-input flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center border border-dashed border-input rounded-md bg-secondary/10">
                    <span className="text-xs text-muted-foreground">No images selected</span>
                  </div>
                )}
              </div>
        </div>
      </div>
    </div>
  );
};

export default ImageInputPlugin;