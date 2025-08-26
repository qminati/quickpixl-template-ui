import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings as SettingsIcon, Copy as CopyIcon, Plus, Minus } from 'lucide-react';
import { ImageInput } from '@/types/interfaces';

interface ImageEditorProps {
  onSubmitVariation: (images: File[][]) => void;
  onFocusInputTab?: (index: number) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  onSubmitVariation, 
  onFocusInputTab = () => {} 
}) => {
  const [imageInputs, setImageInputs] = useState<ImageInput[]>([
    { id: crypto.randomUUID(), selectedImages: [], selectionMode: 'multiple' },
    { id: crypto.randomUUID(), selectedImages: [], selectionMode: 'multiple' },
    { id: crypto.randomUUID(), selectedImages: [], selectionMode: 'multiple' }
  ]);
  
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Get all images from all inputs for preview
  const getAllImages = (): File[] => {
    return imageInputs.flatMap(input => input.selectedImages);
  };

  const allImages = getAllImages();
  const currentPreviewImage = allImages[currentPreviewIndex];

  const addImageInput = () => {
    const newInput: ImageInput = {
      id: crypto.randomUUID(),
      selectedImages: [],
      selectionMode: 'multiple'
    };
    setImageInputs(prev => [...prev, newInput]);
  };

  const removeImageInput = (id: string) => {
    if (imageInputs.length > 1) {
      setImageInputs(prev => prev.filter(input => input.id !== id));
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
      setImageInputs(prev => {
        const index = prev.findIndex(input => input.id === id);
        // Insert the duplicate right after the original
        const newArray = [...prev.slice(0, index + 1), newInput, ...prev.slice(index + 1)];
        return newArray;
      });
    }
  };

  const updateImageInput = (id: string, selectedImages: File[], selectionMode?: 'single' | 'multiple') => {
    setImageInputs(prev => prev.map(input => 
      input.id === id ? { 
        ...input, 
        selectedImages,
        ...(selectionMode && { selectionMode })
      } : input
    ));
  };

  const handleSubmit = () => {
    const imageArrays = imageInputs
      .map(input => input.selectedImages)
      .filter(images => images.length > 0);
    
    onSubmitVariation(imageArrays);
  };

  const handlePreviousImage = () => {
    if (allImages.length > 0) {
      setCurrentPreviewIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1);
    }
  };

  const handleNextImage = () => {
    if (allImages.length > 0) {
      setCurrentPreviewIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0);
    }
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
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Preview Canvas */}
        <div className="bg-background border border-input rounded-lg mb-4" style={{ height: '300px' }}>
          {/* Top Toolbar with Image Controls */}
          <div className="bg-muted/30 border-b border-input px-4 py-2 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousImage}
                disabled={allImages.length <= 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {allImages.length > 0 ? `${currentPreviewIndex + 1} of ${allImages.length}` : 'No images'}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextImage}
                disabled={allImages.length <= 1}
                className="h-7 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Thumbnail Navigation */}
            {allImages.length > 0 && (
              <div className="flex items-center space-x-1">
                {allImages.slice(0, 5).map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    onClick={() => setCurrentPreviewIndex(index)}
                    className={`w-8 h-8 rounded border-2 overflow-hidden transition-all ${
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
                {allImages.length > 5 && (
                  <span className="text-xs text-muted-foreground px-2">
                    +{allImages.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Canvas Content */}
          <div className="h-full flex items-center justify-center bg-muted/10">
            {currentPreviewImage ? (
              <div className="max-w-full max-h-full p-4">
                <img
                  src={getBlobUrlSafe(currentPreviewImage)}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
                <p className="text-sm">No images selected</p>
                <p className="text-xs">Upload images using the inputs below</p>
              </div>
            )}
          </div>
        </div>

        {/* Image Input Management Panel */}
        <div className="bg-card border border-input rounded-lg p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-medium text-foreground mb-3">Image Input Management</h3>
          
          {/* Image Input Fields */}
          <div className="space-y-2 mb-4">
            {imageInputs.map((input, index) => (
              <div key={input.id} className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground min-w-[20px]">
                  {index + 1}.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFocusInputTab(index)}
                  className="p-2 h-8 w-8"
                  title="Input settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </Button>
                
                {/* Thumbnails of selected images */}
                <div className="flex-1 flex items-center space-x-2 min-h-[32px] bg-background border border-input rounded px-3 py-1">
                  {input.selectedImages.length > 0 ? (
                    <>
                      <div className="flex items-center space-x-1 flex-1">
                        {input.selectedImages.slice(0, 3).map((image, imgIndex) => (
                          <div key={`img-${imgIndex}`} className="w-6 h-6 rounded border overflow-hidden">
                            <img
                              src={getBlobUrlSafe(image)}
                              alt={`Image ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                        {input.selectedImages.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{input.selectedImages.length - 3}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {input.selectedImages.length} image{input.selectedImages.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No images selected</span>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateImageInput(input.id)}
                  className="p-2 h-8 w-8"
                  title="Duplicate input"
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImageInput(input.id)}
                  disabled={imageInputs.length <= 1}
                  className="p-2 h-8 w-8"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={addImageInput}
              className="p-2 h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Submit Button Container - Fixed at Bottom */}
      <div className="border-t border-input bg-card p-4">
        <Button 
          onClick={handleSubmit}
          className="w-full py-3 font-medium"
          disabled={imageInputs.every(input => input.selectedImages.length === 0)}
        >
          Submit Variation
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;