import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Settings as SettingsIcon, Copy, Plus, Minus, Trash2, Target, ImageIcon } from 'lucide-react';
import { ImageInput } from '@/types/interfaces';
import ImageInputPlugin from './ImageInputPlugin';
import { getBlobUrl, createImageFallback } from '@/utils/imageUtils';
import ImageErrorBoundary from './ImageErrorBoundary';

interface ImageEditorProps {
  onSubmitVariation: (images: File[][]) => void;
  onFocusInputTab?: (inputId: string) => void;
  imageInputs?: ImageInput[];
  onImageInputsChange?: (inputs: ImageInput[]) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  onSubmitVariation, 
  onFocusInputTab = () => {},
  imageInputs: propImageInputs,
  onImageInputsChange
}) => {
  const [internalImageInputs, setInternalImageInputs] = useState<ImageInput[]>([
    { id: crypto.randomUUID(), selectedImages: [], selectionMode: 'multiple' }
  ]);
  
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const [isImageInputExpanded, setIsImageInputExpanded] = useState(true);
  const [imageBackgroundColor, setImageBackgroundColor] = useState('#000000');

  // Use prop inputs if provided, otherwise use internal state
  const imageInputs = propImageInputs || internalImageInputs;

  // Ensure currentInputIndex is within bounds
  useEffect(() => {
    if (currentInputIndex >= imageInputs.length) {
      setCurrentInputIndex(Math.max(0, imageInputs.length - 1));
    }
  }, [imageInputs, currentInputIndex]);

  // Get images from current input index with null check
  const getCurrentInputImages = (): File[] => {
    const currentInput = imageInputs[currentInputIndex];
    return currentInput?.selectedImages || [];
  };

  // Get all images from all inputs for preview
  const getAllImages = (): File[] => {
    return imageInputs.flatMap(input => input.selectedImages);
  };

  const currentInputImages = getCurrentInputImages();
  const allImages = getAllImages();
  const currentInput = imageInputs[currentInputIndex];
  const currentPreviewImage = currentInput && currentInputIndex < imageInputs.length
    ? currentInputImages[currentPreviewIndex] 
    : allImages[currentPreviewIndex];

  const addImageInput = () => {
    const newInput: ImageInput = {
      id: crypto.randomUUID(),
      selectedImages: [],
      selectionMode: 'multiple'
    };
    if (onImageInputsChange) {
      onImageInputsChange([...imageInputs, newInput]);
    } else {
      setInternalImageInputs(prev => [...prev, newInput]);
    }
  };

  const removeImageInput = (id: string) => {
    if (imageInputs.length > 1) {
      const filtered = imageInputs.filter(input => input.id !== id);
      if (onImageInputsChange) {
        onImageInputsChange(filtered);
      } else {
        setInternalImageInputs(filtered);
      }
    }
  };

  const duplicateImageInput = (id: string) => {
    const inputToDuplicate = imageInputs.find(input => input.id === id);
    if (inputToDuplicate) {
      const newInput: ImageInput = {
        id: crypto.randomUUID(),
        selectedImages: [...inputToDuplicate.selectedImages], // Copy the images
        selectionMode: inputToDuplicate.selectionMode
      };
      const index = imageInputs.findIndex(input => input.id === id);
      // Insert the duplicate right after the original
      const newArray = [...imageInputs.slice(0, index + 1), newInput, ...imageInputs.slice(index + 1)];
      
      if (onImageInputsChange) {
        onImageInputsChange(newArray);
      } else {
        setInternalImageInputs(newArray);
      }
    }
  };

  const updateImageInput = (id: string, selectedImages: File[], selectionMode?: 'single' | 'multiple') => {
    const updated = imageInputs.map(input => 
      input.id === id ? { 
        ...input, 
        selectedImages,
        ...(selectionMode && { selectionMode })
      } : input
    );
    
    if (onImageInputsChange) {
      onImageInputsChange(updated);
    } else {
      setInternalImageInputs(updated);
    }
  };

  const handleSubmit = () => {
    const imageArrays = imageInputs
      .map(input => input.selectedImages)
      .filter(images => images.length > 0);
    
    onSubmitVariation(imageArrays);
  };

  const handlePreviousImage = () => {
    const imagesToUse = currentInputImages;
    if (imagesToUse.length > 0) {
      setCurrentPreviewIndex(prev => prev > 0 ? prev - 1 : imagesToUse.length - 1);
    }
  };

  const handleNextImage = () => {
    const imagesToUse = currentInputImages;
    if (imagesToUse.length > 0) {
      setCurrentPreviewIndex(prev => prev < imagesToUse.length - 1 ? prev + 1 : 0);
    }
  };

  const getBlobUrlSafe = (file: File): string => {
    try {
      return getBlobUrl(file);
    } catch (error) {
      console.error('Failed to create blob URL:', error);
      return createImageFallback();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Canvas - Fixed Height */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="bg-background border border-input rounded-lg overflow-hidden" style={{ height: '320px' }}>
          {/* Top Toolbar with Image Controls */}
          <div className="bg-muted/30 border-b border-input px-4 py-2 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Input Selector Dropdown */}
              <Select value={currentInputIndex.toString()} onValueChange={(value) => setCurrentInputIndex(parseInt(value))}>
                <SelectTrigger className="w-[150px] h-7">
                  <SelectValue placeholder="Select input" />
                </SelectTrigger>
                <SelectContent>
                  {imageInputs.map((input, index) => (
                    <SelectItem key={input.id} value={index.toString()}>
                      Image Input {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousImage}
                disabled={currentInputImages.length <= 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
               <Button
                variant="outline"
                size="sm"
                onClick={handleNextImage}
                disabled={currentInputImages.length <= 1}
                className="h-7 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Background Color Picker on the Right */}
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    <div 
                      className="w-3 h-3 rounded mr-1 border border-panel-border" 
                      style={{ backgroundColor: imageBackgroundColor }}
                    />
                    Background
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={imageBackgroundColor}
                        onChange={(e) => setImageBackgroundColor(e.target.value)}
                        className="w-8 h-8 rounded border border-panel-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={imageBackgroundColor}
                        onChange={(e) => setImageBackgroundColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-background border border-panel-border rounded"
                        placeholder="#000000"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Image background color</div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex items-center space-x-1">
                {[
                  { color: '#000000', name: 'Black' },
                  { color: '#ffffff', name: 'White' },
                  { color: '#f3f4f6', name: 'Light Grey' },
                  { color: '#6b7280', name: 'Grey' },
                  { color: '#ef4444', name: 'Red' },
                  { color: '#3b82f6', name: 'Blue' }
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setImageBackgroundColor(preset.color)}
                    className="w-5 h-5 rounded-full border border-panel-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Canvas Content */}
          <div 
            className="relative overflow-hidden" 
            style={{ 
              height: 'calc(100% - 40px)',
              backgroundColor: imageBackgroundColor 
            }}
          >
            <ImageErrorBoundary>
              {currentPreviewImage ? (
                <img
                  src={getBlobUrlSafe(currentPreviewImage)}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <p className="text-sm">No images selected</p>
                  </div>
                </div>
              )}
            </ImageErrorBoundary>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area - Image Upload and Management */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-4">
        <div className="bg-card border border-input rounded-lg">
          {/* Image Upload Plugin - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-input">
            <ImageInputPlugin
              isExpanded={isImageInputExpanded}
              onToggleExpanded={() => setIsImageInputExpanded(!isImageInputExpanded)}
              settings={currentInput || { id: '', selectedImages: [], selectionMode: 'multiple' }}
              onSettingsChange={(settings) => {
                if (currentInput) {
                  updateImageInput(currentInput.id, settings.selectedImages, settings.selectionMode);
                }
              }}
            />
          </div>
          
          {/* Manage Image Inputs - Compact 3-Column Grid */}
          <div className="p-3">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-foreground">Manage Image Inputs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {imageInputs.map((input, index) => (
                <Card 
                  key={input.id} 
                  className={`group transition-all hover:shadow-sm ${
                    index === currentInputIndex 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                >
                  <CardHeader className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium truncate">Image Input {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setCurrentInputIndex(index);
                            onFocusInputTab?.(input.id);
                          }} 
                          className="h-5 w-5"
                          aria-label="Settings"
                        >
                          <SettingsIcon className="h-2.5 w-2.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => duplicateImageInput(input.id)} 
                          className="h-5 w-5"
                          aria-label="Duplicate"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                        {imageInputs.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeImageInput(input.id)} 
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-2 space-y-2">
                    {/* Thumbnails */}
                    {input.selectedImages?.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1">
                        {input.selectedImages.slice(0, 5).map((img, i) => (
                          <button 
                            key={`input-${input.id}-img-${img.name}-${img.size}-${i}`} 
                            onClick={() => {
                              setCurrentInputIndex(index);
                              setCurrentPreviewIndex(i);
                            }}
                            className="relative rounded overflow-hidden border hover:border-primary"
                            aria-label={`Select image ${i + 1}`}
                          >
                            <img 
                              src={getBlobUrlSafe(img)} 
                              className="h-12 w-full object-cover"
                              alt=""
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </button>
                        ))}
                        {input.selectedImages.length > 5 && (
                          <button 
                            onClick={() => setCurrentInputIndex(index)}
                            className="h-16 rounded-md border bg-muted/40 flex items-center justify-center hover:border-primary"
                            aria-label={`View ${input.selectedImages.length - 5} more images`}
                          >
                            <span className="text-xs text-muted-foreground">
                              +{input.selectedImages.length - 5}
                            </span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 flex items-center justify-center border border-dashed border-input rounded text-xs text-muted-foreground">
                        No images
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentInputIndex(index)}
                        className="text-xs h-6"
                      >
                        Add images
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {input.selectedImages?.length ?? 0} image{(input.selectedImages?.length ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add Image Input Tile */}
              <button 
                onClick={addImageInput}
                className="h-full min-h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-muted/30 transition-colors group"
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">＋</div>
                <div className="text-xs font-medium">Add Image Input</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Submit Button Footer */}
      <div className="flex-shrink-0 border-t border-input bg-background p-3">
        <Button 
          onClick={handleSubmit}
          className="w-full h-12 rounded-md bg-primary text-primary-foreground font-medium"
          disabled={imageInputs.every(input => input.selectedImages.length === 0)}
        >
          Submit Variation
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;