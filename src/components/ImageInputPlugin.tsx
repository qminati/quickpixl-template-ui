import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Upload, X, Plus } from 'lucide-react';
import { ImageInputSettings } from '@/types/interfaces';
import { validateImage, getBlobUrl } from '@/utils/imageUtils';
import { toast } from 'sonner';

interface ImageInputPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: ImageInputSettings;
  onSettingsChange: (settings: ImageInputSettings) => void;
  onAddVariation: () => void;
}

const ImageInputPlugin: React.FC<ImageInputPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const validFiles: File[] = [];
    let hasErrors = false;

    try {
      for (const file of files) {
        try {
          const validation = await validateImage(file);
          if (validation.isValid) {
            validFiles.push(file);
          } else {
            hasErrors = true;
            toast.error(`${file.name}: ${validation.error}`);
          }
        } catch (error) {
          hasErrors = true;
          console.error('Failed to validate image:', error);
          toast.error(`Failed to validate ${file.name}`);
        }
      }

      if (validFiles.length > 0) {
        const newImages = settings.selectionMode === 'single' 
          ? [validFiles[validFiles.length - 1]] // Keep only the last selected image for single mode
          : [...settings.selectedImages, ...validFiles];
        
        onSettingsChange({
          ...settings,
          selectedImages: newImages
        });
        
        toast.success(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} uploaded successfully!`);
      }

      if (hasErrors && validFiles.length === 0) {
        toast.error('No valid images could be uploaded');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }

    // Clear the input
    event.target.value = '';
  };

  const handleImageRemove = (imageToRemove: File) => {
    const newImages = settings.selectedImages.filter(img => img !== imageToRemove);
    onSettingsChange({
      ...settings,
      selectedImages: newImages
    });
    toast.success('Image removed');
  };

  const handleSelectionModeChange = (mode: 'single' | 'multiple') => {
    let newImages = settings.selectedImages;
    
    // If switching to single mode and multiple images are selected, keep only the first one
    if (mode === 'single' && settings.selectedImages.length > 1) {
      newImages = [settings.selectedImages[0]];
    }
    
    onSettingsChange({
      ...settings,
      selectionMode: mode,
      selectedImages: newImages
    });
  };

  const getBlobUrlSafe = (file: File): string => {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Failed to create blob URL:', error);
      return '';
    }
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <div 
            className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-foreground">Image Input</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Image Selection</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={settings.selectionMode === 'single' ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleSelectionModeChange('single')}
                  >
                    Single
                  </Button>
                  <Button
                    variant={settings.selectionMode === 'multiple' ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleSelectionModeChange('multiple')}
                  >
                    Multiple
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple={settings.selectionMode === 'multiple'}
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="image-input"
                />
                <Button
                  variant="outline"
                  className="w-full h-16 border-2 border-dashed border-panel-border hover:border-primary hover:bg-primary/5 transition-colors"
                  disabled={isUploading}
                  asChild
                >
                  <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {isUploading ? 'Uploading...' : 'Upload Images'}
                    </span>
                  </label>
                </Button>
              </div>
            </div>

            {/* Selected Images Display */}
            {settings.selectedImages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Selected Images ({settings.selectedImages.length})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {settings.selectedImages.map((image, index) => (
                    <div key={`${image.name}-${index}`} className="relative group">
                      <div className="aspect-square bg-muted rounded border overflow-hidden">
                        <img
                          src={getBlobUrlSafe(image)}
                          alt={`Selected image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleImageRemove(image)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Variation Button */}
            <div className="pt-2">
              <Button
                onClick={onAddVariation}
                className="w-full h-6 text-xs"
                variant="outline"
                disabled={settings.selectedImages.length === 0}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Image Input Variation
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ImageInputPlugin;
