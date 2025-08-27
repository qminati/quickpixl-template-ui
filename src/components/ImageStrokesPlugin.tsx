import React, { useState, useCallback, useRef } from 'react';
import { 
  Paintbrush, 
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Upload,
  Shuffle,
  Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { validateImage, getBlobUrl, handleImageError } from '@/utils/imageUtils';
import { ImageStrokeSettings } from '@/types/interfaces';

interface ImageStrokesPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: ImageStrokeSettings;
  onSettingsChange: (settings: ImageStrokeSettings) => void;
  onAddVariation: () => void;
}

const ImageStrokesPlugin: React.FC<ImageStrokesPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const [activeStrokeType, setActiveStrokeType] = useState<'regular' | 'container' | 'knockout'>('regular');
  const [expandedStrokes, setExpandedStrokes] = useState<Set<string>>(new Set());
  
  // File input refs
  const regularStrokeImageInputRef = useRef<HTMLInputElement>(null);
  const containerImageInputRef = useRef<HTMLInputElement>(null);

  const updateSettings = useCallback((updates: Partial<ImageStrokeSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  }, [settings, onSettingsChange]);

  // Regular Stroke Functions
  const addRegularStroke = useCallback(() => {
    const newStroke = {
      id: Date.now().toString(),
      width: 2,
      offset: 0,
      blur: 0,
      opacity: 100,
      size: 2,
      fillType: 'solid' as const,
      color: '#000000',
      gradient: {
        type: 'linear' as const,
        angle: 0,
        stops: [
          { id: '1', color: '#000000', position: 0 },
          { id: '2', color: '#ffffff', position: 100 }
        ]
      },
      images: []
    };
    
    updateSettings({
      regular: {
        strokes: [...settings.regular.strokes, newStroke]
      }
    });
  }, [settings.regular.strokes, updateSettings]);

  const removeRegularStroke = useCallback((strokeId: string) => {
    updateSettings({
      regular: {
        strokes: settings.regular.strokes.filter(s => s.id !== strokeId)
      }
    });
  }, [settings.regular.strokes, updateSettings]);

  const updateRegularStroke = useCallback((strokeId: string, updates: Record<string, unknown>) => {
    updateSettings({
      regular: {
        strokes: settings.regular.strokes.map(s => 
          s.id === strokeId ? { ...s, ...updates } : s
        )
      }
    });
  }, [settings.regular.strokes, updateSettings]);

  // Container Stroke Functions
  const addContainerStroke = useCallback(() => {
    const newStroke = {
      id: Date.now().toString(),
      width: 2,
      offset: 0,
      blur: 0,
      opacity: 100,
      size: 2,
      fillType: 'solid' as const,
      color: '#000000',
      gradient: {
        type: 'linear' as const,
        angle: 0,
        stops: [
          { id: '1', color: '#000000', position: 0 },
          { id: '2', color: '#ffffff', position: 100 }
        ]
      },
      images: []
    };
    
    updateSettings({
      container: {
        strokes: [...settings.container.strokes, newStroke]
      }
    });
  }, [settings.container.strokes, updateSettings]);

  const removeContainerStroke = useCallback((strokeId: string) => {
    updateSettings({
      container: {
        strokes: settings.container.strokes.filter(s => s.id !== strokeId)
      }
    });
  }, [settings.container.strokes, updateSettings]);

  const updateContainerStroke = useCallback((strokeId: string, updates: Record<string, unknown>) => {
    updateSettings({
      container: {
        strokes: settings.container.strokes.map(s => 
          s.id === strokeId ? { ...s, ...updates } : s
        )
      }
    });
  }, [settings.container.strokes, updateSettings]);

  // Gradient Functions
  const addGradientStop = useCallback((strokeType: 'regular' | 'container', strokeId: string) => {
    const newStop = {
      id: Date.now().toString(),
      color: '#808080',
      position: 50
    };

    if (strokeType === 'regular') {
      const stroke = settings.regular.strokes.find(s => s.id === strokeId);
      if (!stroke?.gradient) return;
      
      updateRegularStroke(strokeId, {
        gradient: {
          ...stroke.gradient,
          stops: [...stroke.gradient.stops, newStop]
        }
      });
    } else if (strokeType === 'container') {
      const stroke = settings.container.strokes.find(s => s.id === strokeId);
      if (!stroke?.gradient) return;
      
      updateContainerStroke(strokeId, {
        gradient: {
          ...stroke.gradient,
          stops: [...stroke.gradient.stops, newStop]
        }
      });
    }
  }, [settings, updateRegularStroke, updateContainerStroke]);

  const removeGradientStop = useCallback((strokeType: 'regular' | 'container', stopId: string, strokeId: string) => {
    if (strokeType === 'regular') {
      const stroke = settings.regular.strokes.find(s => s.id === strokeId);
      if (stroke) {
        updateRegularStroke(strokeId, {
          gradient: {
            ...stroke.gradient,
            stops: stroke.gradient.stops.filter(stop => stop.id !== stopId)
          }
        });
      }
    } else if (strokeType === 'container') {
      const stroke = settings.container.strokes.find(s => s.id === strokeId);
      if (stroke) {
        updateContainerStroke(strokeId, {
          gradient: {
            ...stroke.gradient,
            stops: stroke.gradient.stops.filter(stop => stop.id !== stopId)
          }
        });
      }
    }
  }, [settings, updateRegularStroke, updateContainerStroke]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, strokeType: 'regular' | 'container', strokeId: string) => {
    try {
      const files = Array.from(e.target.files || []);
      const validImages: File[] = [];
      
      for (const file of files) {
        const validation = await validateImage(file);
        if (!validation.isValid) {
          toast.error(`Invalid file: ${validation.error}`);
          continue;
        }
        validImages.push(file);
      }

      if (validImages.length === 0) return;

      if (strokeType === 'regular') {
        const stroke = settings.regular.strokes.find(s => s.id === strokeId);
        if (!stroke) return;
        
        updateRegularStroke(strokeId, {
          images: [...stroke.images, ...validImages]
        });
      } else if (strokeType === 'container') {
        const stroke = settings.container.strokes.find(s => s.id === strokeId);
        if (!stroke) return;
        
        updateContainerStroke(strokeId, {
          images: [...stroke.images, ...validImages]
        });
      }

      toast.success(`${validImages.length} image${validImages.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images');
    }
  };

  const toggleStrokeExpansion = (strokeId: string) => {
    setExpandedStrokes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(strokeId)) {
        newSet.delete(strokeId);
      } else {
        newSet.add(strokeId);
      }
      return newSet;
    });
  };

  const renderStrokeControls = (stroke: Record<string, any>, strokeType: 'regular' | 'container', onUpdate: (updates: Record<string, unknown>) => void) => {
    const isExpanded = expandedStrokes.has(stroke.id);
    
    return (
      <div key={stroke.id} className="bg-secondary/20 rounded-lg p-2 space-y-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleStrokeExpansion(stroke.id)}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: stroke.fillType === 'solid' ? stroke.color : '#ccc' }}
            />
            <span className="text-xs font-medium">
              Stroke {stroke.size}px
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (strokeType === 'regular') removeRegularStroke(stroke.id);
                else if (strokeType === 'container') removeContainerStroke(stroke.id);
              }}
              className="p-1 h-auto text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </Button>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-2 pl-4">
            {/* Size Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Size</span>
                <span className="text-xs text-muted-foreground">{stroke.size}px</span>
              </div>
              <Slider
                value={[stroke.size]}
                onValueChange={([value]) => onUpdate({ size: value })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Fill Type */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Fill Type</span>
              <Select value={stroke.fillType} onValueChange={(value) => onUpdate({ fillType: value })}>
                <SelectTrigger className="h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Solid Color */}
            {stroke.fillType === 'solid' && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Color</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="color"
                    value={stroke.color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="w-6 h-6 rounded border cursor-pointer"
                  />
                  <Input
                    value={stroke.color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="h-6 text-xs flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {/* Gradient */}
            {stroke.fillType === 'gradient' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Gradient</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addGradientStop(strokeType, stroke.id)}
                    className="h-5 px-2 text-xs"
                  >
                    <Plus className="w-2 h-2 mr-1" />
                    Stop
                  </Button>
                </div>
                
                <Select 
                  value={stroke.gradient.type} 
                  onValueChange={(value) => onUpdate({ 
                    gradient: { ...stroke.gradient, type: value }
                  })}
                >
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                    <SelectItem value="conic">Conic</SelectItem>
                  </SelectContent>
                </Select>

                {stroke.gradient.type === 'linear' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Angle</span>
                      <span className="text-xs text-muted-foreground">{stroke.gradient.angle}°</span>
                    </div>
                    <Slider
                      value={[stroke.gradient.angle]}
                      onValueChange={([value]) => onUpdate({ 
                        gradient: { ...stroke.gradient, angle: value }
                      })}
                      min={0}
                      max={360}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                {stroke.gradient.stops.map((stop: Record<string, any>) => (
                  <div key={stop.id} className="flex items-center space-x-1">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => {
                        const newStops = stroke.gradient.stops.map((s: Record<string, any>) => 
                          s.id === stop.id ? { ...s, color: e.target.value } : s
                        );
                        onUpdate({ gradient: { ...stroke.gradient, stops: newStops } });
                      }}
                      className="w-4 h-4 rounded border cursor-pointer"
                    />
                    <Slider
                      value={[stop.position]}
                      onValueChange={([value]) => {
                        const newStops = stroke.gradient.stops.map((s: Record<string, any>) => 
                          s.id === stop.id ? { ...s, position: value } : s
                        );
                        onUpdate({ gradient: { ...stroke.gradient, stops: newStops } });
                      }}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGradientStop(strokeType, stop.id, stroke.id)}
                      className="p-1 h-auto text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Image Upload */}
            {stroke.fillType === 'image' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Images</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = strokeType === 'container' ? containerImageInputRef.current : regularStrokeImageInputRef.current;
                      if (input) {
                        input.click();
                      }
                    }}
                    className="h-5 px-2 text-xs"
                  >
                    <Upload className="w-2 h-2 mr-1" />
                    Upload
                  </Button>
                </div>
                
                {stroke.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {stroke.images.map((img: File, index: number) => (
                      <div key={`stroke-image-${img.name}-${img.size}-${index}`} className="relative">
                        <img
                          src={getBlobUrl(img)}
                          alt={`Stroke image ${index + 1}`}
                          className="w-full h-12 object-cover rounded border"
                          onError={handleImageError}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newImages = stroke.images.filter((_: File, i: number) => i !== index);
                            onUpdate({ images: newImages });
                          }}
                          className="absolute -top-1 -right-1 p-0 h-4 w-4 bg-destructive text-white rounded-full"
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Opacity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Opacity</span>
                <span className="text-xs text-muted-foreground">{stroke.opacity}%</span>
              </div>
              <Slider
                value={[stroke.opacity]}
                onValueChange={([value]) => onUpdate({ opacity: value })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <Paintbrush className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Strokes</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-2.5 pt-0 space-y-2.5">
          {/* Type Selector */}
          <div className="flex space-x-0.5">
            <Button 
              size="sm" 
              className="h-6 text-xs flex-1"
              variant={activeStrokeType === 'regular' ? 'default' : 'outline'}
              onClick={() => setActiveStrokeType('regular')}
            >
              Regular
            </Button>
            <Button 
              size="sm" 
              className="h-6 text-xs flex-1"
              variant={activeStrokeType === 'container' ? 'default' : 'outline'}
              onClick={() => setActiveStrokeType('container')}
            >
              Container
            </Button>
            <Button 
              size="sm" 
              className="h-6 text-xs flex-1"
              variant={activeStrokeType === 'knockout' ? 'default' : 'outline'}
              onClick={() => setActiveStrokeType('knockout')}
            >
              Knockout
            </Button>
          </div>

          {/* Regular Stroke */}
          {activeStrokeType === 'regular' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">Regular Strokes</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRegularStroke}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="w-2.5 h-2.5 mr-1" />
                  Add Stroke
                </Button>
              </div>
              
              <div className="space-y-1">
                {settings.regular.strokes.map((stroke) => 
                  renderStrokeControls(stroke, 'regular', (updates) => updateRegularStroke(stroke.id, updates))
                )}
                {settings.regular.strokes.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No regular strokes added yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Container Stroke */}
          {activeStrokeType === 'container' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">Container Strokes</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addContainerStroke}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="w-2.5 h-2.5 mr-1" />
                  Add Stroke
                </Button>
              </div>
              
              <div className="space-y-1">
                {settings.container.strokes.map((stroke) => 
                  renderStrokeControls(stroke, 'container', (updates) => updateContainerStroke(stroke.id, updates))
                )}
                {settings.container.strokes.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No container strokes added yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Knockout Stroke */}
          {activeStrokeType === 'knockout' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.knockout.enabled}
                  onCheckedChange={(checked) => updateSettings({
                    knockout: { ...settings.knockout, enabled: !!checked }
                  })}
                />
                <span className="text-xs font-medium text-foreground">Enable Knockout</span>
              </div>
              
              {settings.knockout.enabled && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Size</span>
                    <span className="text-xs text-muted-foreground">{settings.knockout.size}px</span>
                  </div>
                  <Slider
                    value={[settings.knockout.size]}
                    onValueChange={([value]) => updateSettings({
                      knockout: { ...settings.knockout, size: value }
                    })}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={regularStrokeImageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const expandedStrokeIds = Array.from(expandedStrokes);
              const activeStrokeId = expandedStrokeIds[expandedStrokeIds.length - 1];
              if (activeStrokeId) {
                handleImageUpload(e, 'regular', activeStrokeId);
              }
            }}
          />
          
          <input
            ref={containerImageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const expandedStrokeIds = Array.from(expandedStrokes);
              const activeStrokeId = expandedStrokeIds[expandedStrokeIds.length - 1];
              if (activeStrokeId) {
                handleImageUpload(e, 'container', activeStrokeId);
              }
            }}
          />

          {/* Add Variation Button */}
          <Button
            onClick={onAddVariation}
            size="sm"
            variant="secondary"
            className="w-full h-6 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Variation
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageStrokesPlugin;