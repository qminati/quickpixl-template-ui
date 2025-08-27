// src/components/ImageInputPlugin.tsx
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Upload, X, Plus } from 'lucide-react';
import { ImageInputSettings } from '@/types/interfaces';
import { validateImage, getBlobUrl, revokeBlobUrl, handleImageError } from '@/utils/imageUtils';
import { toast } from 'sonner';

interface ImageInputPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: ImageInputSettings;                  // expects { selectedImages: File[], ... }
  onSettingsChange: (settings: ImageInputSettings) => void;
}

const ImageInputPlugin: React.FC<ImageInputPluginProps> = ({
  isExpanded, onToggleExpanded, settings, onSettingsChange
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

  useEffect(() => {
    return () => {
      // Clean up blob URLs on unmount
      if (settings.selectedImages) {
        settings.selectedImages.forEach(revokeBlobUrl);
      }
    };
  }, []); // cleanup on unmount

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors">
            <div className="flex items-center space-x-2">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-foreground">Image Input</span>
            </div>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 pt-0">
            <div className="flex items-stretch h-24 gap-3">
              {/* Upload Images Label */}
              <div className="flex items-center justify-center w-20 bg-secondary/30 rounded-md border">
                <span className="text-xs font-medium text-foreground text-center leading-tight">Upload Images</span>
              </div>

              {/* File Input Area */}
              <div className="relative w-48">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleImageUpload}
                />
                <div className="h-full border border-dashed border-input rounded-md px-3 py-2 flex items-center justify-center bg-background hover:bg-secondary/20 transition-colors">
                  <span className="text-xs text-muted-foreground text-center leading-tight">
                    Click to select images or drop them here
                  </span>
                </div>
              </div>

              {/* Selected Images Section */}
              <div className="flex-1 min-w-0">
                {(settings.selectedImages?.length || 0) > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center mb-2">
                      <span className="text-xs font-medium text-foreground">
                        Selected Images ({settings.selectedImages.length})
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="grid grid-cols-12 gap-0.5">
                        {settings.selectedImages.map((image, i) => (
                          <div key={`${image.name}-${image.size}-${i}`} className="relative group">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ImageInputPlugin;