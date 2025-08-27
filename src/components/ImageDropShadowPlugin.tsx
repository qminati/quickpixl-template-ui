import React, { useState, useCallback, useRef } from 'react';
import { 
  Droplets, 
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { validateImage, getBlobUrl, handleImageError } from '@/utils/imageUtils';
import { ImageDropShadowSettings } from '@/types/interfaces';

interface ImageDropShadowPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: ImageDropShadowSettings;
  onSettingsChange: (settings: ImageDropShadowSettings) => void;
  onAddVariation: () => void;
}

const ImageDropShadowPlugin: React.FC<ImageDropShadowPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const [expandedShadows, setExpandedShadows] = useState<Set<string>>(new Set());
  
  const updateSettings = useCallback((updates: Partial<ImageDropShadowSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  }, [settings, onSettingsChange]);

  // Shadow Functions
  const addShadow = useCallback(() => {
    const newShadow = {
      id: Date.now().toString(),
      offsetX: 5,
      offsetY: 5,
      blur: 10,
      spread: 0,
      opacity: 80,
      inset: false,
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
      shadows: [...settings.shadows, newShadow]
    });
  }, [settings.shadows, updateSettings]);

  const removeShadow = useCallback((shadowId: string) => {
    updateSettings({
      shadows: settings.shadows.filter(s => s.id !== shadowId)
    });
  }, [settings.shadows, updateSettings]);

  const updateShadow = useCallback((shadowId: string, updates: Record<string, unknown>) => {
    updateSettings({
      shadows: settings.shadows.map(s => 
        s.id === shadowId ? { ...s, ...updates } : s
      )
    });
  }, [settings.shadows, updateSettings]);

  // Gradient Functions
  const addGradientStop = useCallback((shadowId: string) => {
    const newStop = {
      id: Date.now().toString(),
      color: '#808080',
      position: 50
    };

    const shadow = settings.shadows.find(s => s.id === shadowId);
    if (!shadow?.gradient) return;
    
    updateShadow(shadowId, {
      gradient: {
        ...shadow.gradient,
        stops: [...shadow.gradient.stops, newStop]
      }
    });
  }, [settings, updateShadow]);

  const removeGradientStop = useCallback((stopId: string, shadowId: string) => {
    const shadow = settings.shadows.find(s => s.id === shadowId);
    if (shadow) {
      updateShadow(shadowId, {
        gradient: {
          ...shadow.gradient,
          stops: shadow.gradient.stops.filter(stop => stop.id !== stopId)
        }
      });
    }
  }, [settings, updateShadow]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, shadowId: string) => {
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

      const shadow = settings.shadows.find(s => s.id === shadowId);
      if (!shadow) return;
      
      updateShadow(shadowId, {
        images: [...shadow.images, ...validImages]
      });

      toast.success(`${validImages.length} image${validImages.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images');
    }
  };

  const toggleShadowExpansion = (shadowId: string) => {
    setExpandedShadows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shadowId)) {
        newSet.delete(shadowId);
      } else {
        newSet.add(shadowId);
      }
      return newSet;
    });
  };

  const renderShadowControls = (shadow: Record<string, any>, onUpdate: (updates: Record<string, unknown>) => void) => {
    const isExpanded = expandedShadows.has(shadow.id);
    
    return (
      <div key={shadow.id} className="bg-secondary/20 rounded-lg p-2 space-y-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleShadowExpansion(shadow.id)}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: shadow.fillType === 'solid' ? shadow.color : '#ccc',
                opacity: shadow.opacity / 100 
              }}
            />
            <span className="text-xs font-medium">
              Shadow {shadow.offsetX}px, {shadow.offsetY}px
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeShadow(shadow.id);
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
            {/* Offset X Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Offset X</span>
                <span className="text-xs text-muted-foreground">{shadow.offsetX}px</span>
              </div>
              <Slider
                value={[shadow.offsetX]}
                onValueChange={([value]) => onUpdate({ offsetX: value })}
                min={-50}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Offset Y Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Offset Y</span>
                <span className="text-xs text-muted-foreground">{shadow.offsetY}px</span>
              </div>
              <Slider
                value={[shadow.offsetY]}
                onValueChange={([value]) => onUpdate({ offsetY: value })}
                min={-50}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Blur Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Blur</span>
                <span className="text-xs text-muted-foreground">{shadow.blur}px</span>
              </div>
              <Slider
                value={[shadow.blur]}
                onValueChange={([value]) => onUpdate({ blur: value })}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Opacity</span>
                <span className="text-xs text-muted-foreground">{shadow.opacity}%</span>
              </div>
              <Slider
                value={[shadow.opacity]}
                onValueChange={([value]) => onUpdate({ opacity: value })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Fill Type */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Fill Type</span>
              <Select value={shadow.fillType} onValueChange={(value) => onUpdate({ fillType: value })}>
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
            {shadow.fillType === 'solid' && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Color</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="color"
                    value={shadow.color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="w-6 h-6 rounded border cursor-pointer"
                  />
                  <Input
                    value={shadow.color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="h-6 text-xs flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {/* Gradient */}
            {shadow.fillType === 'gradient' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Gradient</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addGradientStop(shadow.id)}
                    className="h-5 px-2 text-xs"
                  >
                    <Plus className="w-2 h-2 mr-1" />
                    Stop
                  </Button>
                </div>
                
                <Select 
                  value={shadow.gradient.type} 
                  onValueChange={(value) => onUpdate({ 
                    gradient: { ...shadow.gradient, type: value }
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

                {shadow.gradient.type === 'linear' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Angle</span>
                      <span className="text-xs text-muted-foreground">{shadow.gradient.angle}°</span>
                    </div>
                    <Slider
                      value={[shadow.gradient.angle]}
                      onValueChange={([value]) => onUpdate({ 
                        gradient: { ...shadow.gradient, angle: value }
                      })}
                      min={0}
                      max={360}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  {shadow.gradient.stops.map((stop: Record<string, any>) => (
                    <div key={stop.id} className="flex items-center space-x-1">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => {
                          const newStops = shadow.gradient.stops.map((s: Record<string, any>) => 
                            s.id === stop.id ? { ...s, color: e.target.value } : s
                          );
                          onUpdate({ gradient: { ...shadow.gradient, stops: newStops } });
                        }}
                        className="w-4 h-4 rounded border cursor-pointer"
                      />
                      <Slider
                        value={[stop.position]}
                        onValueChange={([value]) => {
                          const newStops = shadow.gradient.stops.map((s: Record<string, any>) => 
                            s.id === stop.id ? { ...s, position: value } : s
                          );
                          onUpdate({ gradient: { ...shadow.gradient, stops: newStops } });
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGradientStop(stop.id, shadow.id)}
                        disabled={shadow.gradient.stops.length <= 2}
                        className="p-1 h-auto w-auto"
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image */}
            {shadow.fillType === 'image' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Images</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = true;
                      input.onchange = (e) => handleImageUpload(e as any, shadow.id);
                      input.click();
                    }}
                    className="h-5 px-2 text-xs"
                  >
                    <Upload className="w-2 h-2 mr-1" />
                    Upload
                  </Button>
                </div>
                
                {shadow.images && shadow.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {shadow.images.map((image: File, index: number) => (
                      <div key={`shadow-image-${image.name}-${image.size}-${index}`} className="relative group">
                        <img
                          src={getBlobUrl(image)}
                          alt={`Shadow ${index + 1}`}
                          className="w-full h-8 object-cover rounded border"
                          onError={handleImageError}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newImages = shadow.images.filter((_: File, i: number) => i !== index);
                            onUpdate({ images: newImages });
                          }}
                          className="absolute -top-1 -right-1 p-0 h-auto w-auto bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      <div
        className="p-2.5 cursor-pointer flex items-center justify-between hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <Droplets className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Image Drop Shadow</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-panel-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground">
                Drop Shadows ({settings.shadows.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={addShadow}
                className="h-6 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Shadow
              </Button>
            </div>

            {settings.shadows.length > 0 ? (
              <div className="space-y-2">
                {settings.shadows.map((shadow) =>
                  renderShadowControls(
                    shadow,
                    (updates) => updateShadow(shadow.id, updates)
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No drop shadows added yet. Click "Add Shadow" to get started.
              </div>
            )}
          </div>

          {/* Add Variation Button */}
          <Button
            onClick={onAddVariation}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            size="sm"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Variation
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageDropShadowPlugin;