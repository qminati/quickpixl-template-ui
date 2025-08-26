import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageTabSettings, ImagePluginSettings, ImageInputSettings } from '@/types/interfaces';
import ImageInputPlugin from './ImageInputPlugin';
import ImageEffectsPlugin from './ImageEffectsPlugin';
import { getBlobUrl } from '@/utils/imageUtils';

interface ImageEditorProps {
  imageSettings: ImageTabSettings;
  onImageSettingsChange: (settings: ImageTabSettings) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  imageSettings,
  onImageSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState('global');
  const [expandedPlugins, setExpandedPlugins] = useState<Record<string, boolean>>({});
  const [selectedInputId, setSelectedInputId] = useState('II1');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get current input's images
  const selectedInputImages = imageSettings.inputs[selectedInputId]?.imageInput?.selectedImages || [];

  // Reset image index when switching inputs or when images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedInputId, selectedInputImages.length]);

  // Update selected input when inputs change
  useEffect(() => {
    const inputIds = Object.keys(imageSettings.inputs);
    if (inputIds.length > 0 && !inputIds.includes(selectedInputId)) {
      setSelectedInputId(inputIds[0]);
    }
  }, [imageSettings.inputs, selectedInputId]);

  const addImageInput = useCallback(() => {
    const inputCount = Object.keys(imageSettings.inputs).length;
    const newInputId = `II${inputCount + 1}`;
    
    const newInput: ImagePluginSettings = {
      imageInput: {
        selectedImages: [],
        selectionMode: 'multiple'
      },
      imageEffects: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        colorize: false,
        grayscale: false,
        invert: false
      }
    };

    onImageSettingsChange({
      ...imageSettings,
      inputs: {
        ...imageSettings.inputs,
        [newInputId]: newInput
      }
    });

    setActiveTab(newInputId);
  }, [imageSettings, onImageSettingsChange]);

  const removeImageInput = useCallback((inputId: string) => {
    const { [inputId]: removed, ...remaining } = imageSettings.inputs;
    
    onImageSettingsChange({
      ...imageSettings,
      inputs: remaining
    });

    // Switch to global tab if we removed the active tab
    if (activeTab === inputId) {
      setActiveTab('global');
    }
  }, [imageSettings, onImageSettingsChange, activeTab]);

  const duplicateImageInput = useCallback((inputId: string) => {
    const inputToDuplicate = imageSettings.inputs[inputId];
    if (!inputToDuplicate) return;

    const inputCount = Object.keys(imageSettings.inputs).length;
    const newInputId = `II${inputCount + 1}`;

    onImageSettingsChange({
      ...imageSettings,
      inputs: {
        ...imageSettings.inputs,
        [newInputId]: JSON.parse(JSON.stringify(inputToDuplicate)) // Deep copy
      }
    });

    setActiveTab(newInputId);
  }, [imageSettings, onImageSettingsChange]);

  const updateCurrentTabSettings = useCallback((pluginType: keyof ImagePluginSettings, settings: any) => {
    if (activeTab === 'global') {
      onImageSettingsChange({
        ...imageSettings,
        global: {
          ...imageSettings.global,
          [pluginType]: settings
        }
      });
    } else {
      const currentInput = imageSettings.inputs[activeTab] || {
        imageInput: { selectedImages: [], selectionMode: 'multiple' },
        imageEffects: { brightness: 100, contrast: 100, saturation: 100, hue: 0, colorize: false, grayscale: false, invert: false }
      };

      onImageSettingsChange({
        ...imageSettings,
        inputs: {
          ...imageSettings.inputs,
          [activeTab]: {
            ...currentInput,
            [pluginType]: settings
          }
        }
      });
    }
  }, [activeTab, imageSettings, onImageSettingsChange]);

  const getCurrentImageInputSettings = useCallback((): ImageInputSettings => {
    if (activeTab === 'global') {
      return imageSettings.global.imageInput;
    } else {
      const inputSettings = imageSettings.inputs[activeTab];
      return inputSettings?.imageInput || imageSettings.global.imageInput;
    }
  }, [activeTab, imageSettings]);

  const getCurrentImageEffectsSettings = useCallback(() => {
    if (activeTab === 'global') {
      return imageSettings.global.imageEffects;
    } else {
      const inputSettings = imageSettings.inputs[activeTab];
      return inputSettings?.imageEffects || imageSettings.global.imageEffects;
    }
  }, [activeTab, imageSettings]);

  const togglePluginExpanded = useCallback((pluginName: string) => {
    setExpandedPlugins(prev => ({
      ...prev,
      [pluginName]: !prev[pluginName]
    }));
  }, []);

  const inputIds = Object.keys(imageSettings.inputs);
  const hasCustomSettings = (inputId: string) => {
    return inputId in imageSettings.inputs;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {/* Image Preview Area */}
        <div className="bg-card border border-panel-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Image Preview</h3>
            {Object.keys(imageSettings.inputs).length > 0 && (
              <div className="flex items-center space-x-2">
                <select
                  value={selectedInputId}
                  onChange={(e) => setSelectedInputId(e.target.value)}
                  className="text-xs bg-background border border-panel-border rounded px-2 py-1"
                >
                  {Object.keys(imageSettings.inputs).map((inputId) => (
                    <option key={inputId} value={inputId}>
                      {inputId}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-panel-border relative">
            {selectedInputImages.length > 0 ? (
              <>
                <img
                  src={getBlobUrl(selectedInputImages[currentImageIndex])}
                  alt={`Preview ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {selectedInputImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : selectedInputImages.length - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border border-panel-border rounded-full p-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex < selectedInputImages.length - 1 ? currentImageIndex + 1 : 0)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border border-panel-border rounded-full p-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-background/80 border border-panel-border rounded px-2 py-1">
                      <span className="text-xs text-foreground">
                        {currentImageIndex + 1} of {selectedInputImages.length}
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center">
                <span className="text-muted-foreground text-sm block">
                  {Object.keys(imageSettings.inputs).length > 0 ? selectedInputId : 'Image Input 1'}
                </span>
                <span className="text-muted-foreground text-xs">No images loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Input Management */}
        <div className="bg-card border border-panel-border rounded-lg p-4 mt-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Image Input Management</h3>
          
          <div className="space-y-2">
            {inputIds.map((inputId) => {
              const input = imageSettings.inputs[inputId];
              const imageCount = input?.imageInput?.selectedImages?.length || 0;
              
              return (
                <div key={inputId} className="flex items-center space-x-2 p-2 bg-background rounded border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab(inputId)}
                    className="p-1 h-6 w-6"
                    title="Jump to settings"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                  
                  <span className="text-sm font-medium text-foreground min-w-[60px]">
                    {inputId}
                  </span>
                  
                  <div className="flex-1 flex items-center space-x-1">
                    {input?.imageInput?.selectedImages?.slice(0, 4).map((image, idx) => (
                      <div key={idx} className="w-6 h-6 rounded border overflow-hidden">
                        <img
                          src={getBlobUrl(image)}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                    {imageCount > 4 && (
                      <span className="text-xs text-muted-foreground">+{imageCount - 4}</span>
                    )}
                    {imageCount === 0 && (
                      <span className="text-xs text-muted-foreground">No images</span>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateImageInput(inputId)}
                    className="p-1 h-6 w-6"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImageInput(inputId)}
                    className="p-1 h-6 w-6"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={addImageInput}
              className="w-full h-8 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Image Input
            </Button>
          </div>
        </div>

        {/* Tabs for Settings */}
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-[auto_1fr] gap-1">
              <TabsTrigger value="global" className="text-xs px-3">
                GLOBAL
              </TabsTrigger>
              
              <div className="flex flex-wrap gap-1">
                {inputIds.map((inputId) => (
                  <TabsTrigger
                    key={inputId}
                    value={inputId}
                    className={`text-xs px-2 relative ${
                      hasCustomSettings(inputId) ? 'font-medium' : ''
                    }`}
                  >
                    {inputId}
                    {hasCustomSettings(inputId) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>

            <TabsContent value="global" className="mt-4 space-y-3">
              <div className="text-xs text-muted-foreground mb-3">
                Global settings apply to all image inputs unless overridden
              </div>
              
              <div className="space-y-2">
                <ImageInputPlugin
                  isExpanded={expandedPlugins['imageInput'] || false}
                  onToggleExpanded={() => togglePluginExpanded('imageInput')}
                  settings={getCurrentImageInputSettings()}
                  onSettingsChange={(settings) => updateCurrentTabSettings('imageInput', settings)}
                  onAddVariation={() => {}}
                />
                
                <ImageEffectsPlugin
                  isExpanded={expandedPlugins['imageEffects'] || false}
                  onToggleExpanded={() => togglePluginExpanded('imageEffects')}
                  settings={getCurrentImageEffectsSettings()}
                  onSettingsChange={(settings) => updateCurrentTabSettings('imageEffects', settings)}
                  onAddVariation={() => {}}
                />
              </div>
            </TabsContent>

            {inputIds.map((inputId) => (
              <TabsContent key={inputId} value={inputId} className="mt-4 space-y-3">
                <div className="text-xs text-muted-foreground mb-3">
                  Settings for {inputId} (overrides global settings)
                </div>
                
                <div className="space-y-2">
                  <ImageInputPlugin
                    isExpanded={expandedPlugins[`${inputId}-imageInput`] || false}
                    onToggleExpanded={() => togglePluginExpanded(`${inputId}-imageInput`)}
                    settings={getCurrentImageInputSettings()}
                    onSettingsChange={(settings) => updateCurrentTabSettings('imageInput', settings)}
                    onAddVariation={() => {}}
                  />
                  
                  <ImageEffectsPlugin
                    isExpanded={expandedPlugins[`${inputId}-imageEffects`] || false}
                    onToggleExpanded={() => togglePluginExpanded(`${inputId}-imageEffects`)}
                    settings={getCurrentImageEffectsSettings()}
                    onSettingsChange={(settings) => updateCurrentTabSettings('imageEffects', settings)}
                    onAddVariation={() => {}}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;