import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Settings as SettingsIcon, Copy, Plus, Minus, Trash2, Target, ImageIcon } from 'lucide-react';
import { ImageInput, ImageInputSettings } from '@/types/interfaces';
import { getBlobUrl } from '@/utils/imageUtils';
import ImageInputPlugin from './ImageInputPlugin';

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

  // Use prop inputs if provided, otherwise use internal state
  const imageInputs = propImageInputs || internalImageInputs;

  // Ensure currentInputIndex is within bounds
  useEffect(() => {
    if (currentInputIndex >= imageInputs.length) {
      setCurrentInputIndex(Math.max(0, imageInputs.length - 1));
    }
  }, [imageInputs, currentInputIndex]);

  // Get images from current input index
  const getCurrentInputImages = (): File[] => {
    return imageInputs[currentInputIndex]?.selectedImages || [];
  };

  // Get all images from all inputs for preview
  const getAllImages = (): File[] => {
    return imageInputs.flatMap(input => input.selectedImages);
  };

  const currentInputImages = getCurrentInputImages();
  const allImages = getAllImages();
  const currentPreviewImage = currentInputIndex < imageInputs.length
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
      return '';
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
              
              <span className="text-sm text-muted-foreground">
                {currentInputImages.length > 0 
                  ? `${currentPreviewIndex + 1} of ${currentInputImages.length}` 
                  : 'No images'
                }
              </span>
              
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
            
            {/* Thumbnail Navigation */}
            {currentInputImages.length > 0 && (
              <div className="flex items-center space-x-1">
                {currentInputImages.slice(0, 5).map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    onClick={() => setCurrentPreviewIndex(index)}
                    className={`w-px h-px rounded border overflow-hidden transition-all ${
                      index === currentPreviewIndex 
                        ? 'border-primary' 
                        : 'border-panel-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={getBlobUrlSafe(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
                {currentInputImages.length > 5 && (
                  <span className="text-xs text-muted-foreground px-2">
                    +{currentInputImages.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Canvas Content */}
          <div className="relative bg-muted/10 overflow-hidden" style={{ height: 'calc(100% - 40px)' }}>
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
              settings={imageInputs[currentInputIndex]}
              onSettingsChange={(settings) => {
                updateImageInput(imageInputs[currentInputIndex].id, settings.selectedImages, settings.selectionMode);
              }}
            />
          </div>
          
          {/* Manage Image Inputs - 3-Column Grid */}
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-base font-medium text-foreground">Manage Image Inputs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {imageInputs.map((input, index) => (
                <Card 
                  key={input.id} 
                  className={`group transition-all hover:shadow-sm ${
                    index === currentInputIndex 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">Image Input {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setCurrentInputIndex(index);
                            onFocusInputTab?.(input.id);
                          }} 
                          className="h-6 w-6"
                          aria-label="Focus"
                        >
                          <Target className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => duplicateImageInput(input.id)} 
                          className="h-6 w-6"
                          aria-label="Duplicate"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {imageInputs.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeImageInput(input.id)} 
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 space-y-3">
                    {/* Thumbnails */}
                    {input.selectedImages?.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {input.selectedImages.slice(0, 6).map((img, i) => (
                          <button 
                            key={i} 
                            onClick={() => {
                              setCurrentInputIndex(index);
                              setCurrentPreviewIndex(i);
                            }}
                            className="relative rounded-md overflow-hidden border hover:border-primary"
                            aria-label={`Select image ${i + 1}`}
                          >
                            <img 
                              src={getBlobUrlSafe(img)} 
                              className="h-16 w-full object-cover" 
                              alt=""
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </button>
                        ))}
                        {input.selectedImages.length > 6 && (
                          <div className="h-16 rounded-md border bg-muted/40 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{input.selectedImages.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-16 bg-muted/40 rounded-lg flex items-center justify-center">
                        <div className="text-xs text-muted-foreground">No images yet</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentInputIndex(index)}
                        className="text-xs"
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
                className="h-full min-h-[220px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center hover:bg-muted/30 transition-colors group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">＋</div>
                <div className="text-sm font-medium">Add Image Input</div>
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