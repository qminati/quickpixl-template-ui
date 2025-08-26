import React, { useState } from 'react';
import { 
  Palette, 
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Shuffle,
  Upload,
  Pipette,
  Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { validateImage } from '@/utils/imageUtils';
import { ColorFillSettings } from '@/types/interfaces';

interface ColorFillPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: ColorFillSettings;
  onSettingsChange: (settings: ColorFillSettings) => void;
  onAddVariation: () => void;
}

const ColorFillPlugin: React.FC<ColorFillPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const [hexInput, setHexInput] = useState(settings.solid.color);

  const updateSettings = (updates: Partial<ColorFillSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateModeSettings = (mode: keyof ColorFillSettings, updates: any) => {
    const currentSettings = settings[mode] as any;
    updateSettings({
      ...settings,
      [mode]: { ...currentSettings, ...updates }
    });
  };

  const setMode = (mode: ColorFillSettings['mode']) => {
    updateSettings({ mode });
  };

  // Mock color extraction
  const mockExtractColors = (): string[] => {
    return ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
  };

  // Randomize array
  const randomizeArray = <T,>(arr: T[]): T[] => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  // Handle solid color change
  const handleSolidColorChange = (color: string) => {
    setHexInput(color);
    updateModeSettings('solid', { color });
  };

  // Handle hex input
  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateModeSettings('solid', { color: value });
    }
  };

  // Gradient functions
  const addGradientStop = () => {
    const newStop = {
      id: Date.now().toString(),
      color: '#808080',
      position: 50
    };
    const newStops = [...settings.gradient.stops, newStop];
    updateModeSettings('gradient', { stops: newStops });
  };

  const removeGradientStop = (id: string) => {
    const newStops = settings.gradient.stops.filter(stop => stop.id !== id);
    updateModeSettings('gradient', { stops: newStops });
  };

  const updateGradientStop = (id: string, updates: Partial<{ color: string; position: number }>) => {
    const newStops = settings.gradient.stops.map(stop => 
      stop.id === id ? { ...stop, ...updates } : stop
    );
    updateModeSettings('gradient', { stops: newStops });
  };

  // Palette functions
  const addPaletteColorManual = (color: string) => {
    const newColor = {
      id: Date.now().toString(),
      value: color,
      type: 'manual' as const
    };
    const newColors = [...settings.palette.colors, newColor];
    updateModeSettings('palette', { colors: newColors });
  };

  const addPaletteColorComponent = () => {
    const newColor = {
      id: Date.now().toString(),
      value: settings.palette.colors.length + 1,
      type: 'component' as const
    };
    const newColors = [...settings.palette.colors, newColor];
    updateModeSettings('palette', { colors: newColors });
  };

  const addExtractedColors = () => {
    const extractedColors = mockExtractColors();
    const newColors = extractedColors.map((color, index) => ({
      id: `extracted-${Date.now()}-${index}`,
      value: color,
      type: 'extracted' as const
    }));
    const allColors = [...settings.palette.colors, ...newColors];
    updateModeSettings('palette', { colors: allColors });
    toast.success('Colors extracted from image');
  };

  const removePaletteColor = (id: string) => {
    const newColors = settings.palette.colors.filter(color => color.id !== id);
    updateModeSettings('palette', { colors: newColors });
  };

  const randomizePalette = () => {
    const newColors = randomizeArray(settings.palette.colors);
    updateModeSettings('palette', { colors: newColors });
  };

  // Image functions with enhanced error handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    let hasErrors = false;

    try {
      for (const file of files) {
        if (!file) continue;
        
        try {
          const validation = await validateImage(file);
          if (validation.isValid) {
            validFiles.push(file);
          } else {
            hasErrors = true;
            toast.error(`Invalid file ${file.name}: ${validation.error}`);
          }
        } catch (validationError) {
          hasErrors = true;
          console.error('File validation error:', validationError);
          toast.error(`Failed to validate ${file.name}`);
        }
      }

      if (validFiles.length > 0) {
        try {
          if (settings.mode === 'image') {
            const newImages = [...settings.image.images, ...validFiles];
            updateModeSettings('image', { images: newImages });
          } else if (settings.mode === 'palette' && settings.palette.source === 'image') {
            updateModeSettings('palette', { extractedImage: validFiles[0] });
            addExtractedColors();
          }
          toast.success(`${validFiles.length} image(s) uploaded`);
        } catch (updateError) {
          console.error('Failed to update settings with new images:', updateError);
          toast.error('Failed to process uploaded images');
        }
      }

      if (hasErrors && validFiles.length === 0) {
        toast.error('No valid images could be uploaded');
      }
    } catch (error) {
      console.error('Upload process failed:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      // Clear the input to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = settings.image.images.filter((_, i) => i !== index);
    updateModeSettings('image', { images: newImages });
  };

  const randomizeImages = () => {
    const newImages = randomizeArray(settings.image.images);
    updateModeSettings('image', { images: newImages });
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Color & Fill</span>
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
          {/* Mode Selector */}
          <div className="flex space-x-0.5">
            <Button 
              size="sm" 
              className="h-6 text-xs flex-1"
              variant={settings.mode === 'solid' ? 'default' : 'outline'}
              onClick={() => setMode('solid')}
            >
              Solid
            </Button>
            <Button 
              size="sm" 
              className="h-6 text-xs flex-1"
              variant={settings.mode === 'gradient' ? 'default' : 'outline'}
              onClick={() => setMode('gradient')}
            >
              Gradient
            </Button>
            <Button 
              size="sm" 
              className="h-6 text-xs flex-1"
              variant={settings.mode === 'palette' ? 'default' : 'outline'}
              onClick={() => setMode('palette')}
            >
              Palette
            </Button>
            <Button 
              size="sm" 
              className="h-6 text-xs flex-1"
              variant={settings.mode === 'image' ? 'default' : 'outline'}
              onClick={() => setMode('image')}
            >
              Image
            </Button>
          </div>

          {/* Solid Mode */}
          {settings.mode === 'solid' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-6 h-6 rounded border cursor-pointer"
                  style={{ backgroundColor: settings.solid.color }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = settings.solid.color;
                    input.onchange = (e) => handleSolidColorChange((e.target as HTMLInputElement).value);
                    input.click();
                  }}
                />
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  className="h-6 text-xs flex-1"
                  placeholder="#000000"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => toast.info('Eyedropper tool (UI only)')}
                >
                  <Pipette className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Gradient Mode */}
          {settings.mode === 'gradient' && (
            <div className="space-y-2">
              {/* Gradient Type */}
              <div className="flex space-x-0.5">
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.gradient.type === 'linear' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('gradient', { type: 'linear' })}
                >
                  Linear
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.gradient.type === 'radial' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('gradient', { type: 'radial' })}
                >
                  Radial
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.gradient.type === 'conic' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('gradient', { type: 'conic' })}
                >
                  Conic
                </Button>
              </div>

              {/* Angle Slider */}
              {settings.gradient.type === 'linear' && (
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Angle</span>
                    <span className="text-xs text-muted-foreground">{settings.gradient.angle}°</span>
                  </div>
                  <Slider
                    value={[settings.gradient.angle]}
                    onValueChange={([value]) => updateModeSettings('gradient', { angle: value })}
                    min={0}
                    max={360}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Gradient Stops */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Color Stops</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-4 w-4 p-0"
                    onClick={addGradientStop}
                  >
                    <Plus className="w-2 h-2" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {settings.gradient.stops.map((stop) => (
                    <div key={stop.id} className="flex items-center space-x-1">
                      <div 
                        className="w-4 h-4 rounded border cursor-pointer"
                        style={{ backgroundColor: stop.color }}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'color';
                          input.value = stop.color;
                          input.onchange = (e) => updateGradientStop(stop.id, { color: (e.target as HTMLInputElement).value });
                          input.click();
                        }}
                      />
                      <div className="flex-1">
                        <Slider
                          value={[stop.position]}
                          onValueChange={([value]) => updateGradientStop(stop.id, { position: value })}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{stop.position}%</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-4 w-4 p-0"
                        onClick={() => removeGradientStop(stop.id)}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Palette Mode */}
          {settings.mode === 'palette' && (
            <div className="space-y-2">
              {/* Source Type */}
              <div className="flex space-x-0.5">
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.palette.source === 'rgb' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('palette', { source: 'rgb' })}
                >
                  RGB
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.palette.source === 'component' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('palette', { source: 'component' })}
                >
                  Component
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.palette.source === 'image' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('palette', { source: 'image' })}
                >
                  Image
                </Button>
              </div>

              {/* RGB Source */}
              {settings.palette.source === 'rgb' && (
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-6 h-6 rounded border cursor-pointer"
                    style={{ backgroundColor: '#808080' }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'color';
                      input.value = '#808080';
                      input.onchange = (e) => addPaletteColorManual((e.target as HTMLInputElement).value);
                      input.click();
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 flex-1 text-xs"
                    onClick={() => addPaletteColorManual('#808080')}
                  >
                    Add Color
                  </Button>
                </div>
              )}

              {/* Component Source */}
              {settings.palette.source === 'component' && (
                <div className="space-y-1">
                  <Select 
                    value={settings.palette.componentInput.toString()}
                    onValueChange={(value) => updateModeSettings('palette', { componentInput: parseInt(value) })}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue placeholder="Select input" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50 shadow-lg">
                      <SelectItem value="1">Image Input 1</SelectItem>
                      <SelectItem value="2">Image Input 2</SelectItem>
                      <SelectItem value="3">Image Input 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-full text-xs"
                    onClick={addPaletteColorComponent}
                  >
                    Add Component Color
                  </Button>
                </div>
              )}

              {/* Image Source */}
              {settings.palette.source === 'image' && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <label className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-full text-xs"
                        asChild
                      >
                        <span>
                          <Upload className="w-2.5 h-2.5 mr-1" />
                          Upload Image
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {settings.palette.extractedImage && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-full text-xs"
                      onClick={addExtractedColors}
                    >
                      Extract Colors
                    </Button>
                  )}
                </div>
              )}

              {/* Color List */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Colors ({settings.palette.colors.length})</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-4 w-4 p-0"
                    onClick={randomizePalette}
                  >
                    <Shuffle className="w-2 h-2" />
                  </Button>
                </div>
                <div className="flex space-x-1 overflow-x-auto p-1 bg-secondary/50 rounded">
                  {settings.palette.colors.map((color, index) => (
                    <div key={color.id} className="relative group flex-shrink-0">
                      {color.type === 'component' ? (
                        <div 
                          className="w-8 h-8 rounded border flex items-center justify-center"
                          style={{ backgroundColor: `hsl(0, 0%, ${40 + index * 10}%)` }}
                        >
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                      ) : (
                        <div 
                          className="w-8 h-8 rounded border flex items-center justify-center"
                          style={{ backgroundColor: color.value as string }}
                        >
                          <span className="text-xs font-bold text-white shadow-md">{index + 1}</span>
                        </div>
                      )}
                      <button 
                        className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        onClick={() => removePaletteColor(color.id)}
                      >
                        <X className="w-2 h-2 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Mode */}
          {settings.mode === 'image' && (
            <div className="space-y-2">
              {/* Image Mode Type */}
              <div className="flex space-x-0.5">
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.image.mode === 'single' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('image', { mode: 'single' })}
                >
                  Image
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1"
                  variant={settings.image.mode === 'multiple' ? 'default' : 'outline'}
                  onClick={() => updateModeSettings('image', { mode: 'multiple' })}
                >
                  Sequence
                </Button>
              </div>

              {/* Upload Images */}
              <div className="space-y-1">
                <label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-full text-xs"
                    asChild
                  >
                    <span>
                      <Upload className="w-2.5 h-2.5 mr-1" />
                      Upload Images
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Grid */}
              {settings.image.images.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Images ({settings.image.images.length})</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-4 w-4 p-0"
                      onClick={randomizeImages}
                    >
                      <Shuffle className="w-2 h-2" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {settings.image.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover rounded border"
                        />
                        <button 
                          className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-2 h-2 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opacity Slider */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Opacity</span>
                  <span className="text-xs text-muted-foreground">{settings.image.opacity}%</span>
                </div>
                <Slider
                  value={[settings.image.opacity]}
                  onValueChange={([value]) => updateModeSettings('image', { opacity: value })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Add Variation Button */}
          <div className="pt-1">
            <Button
              onClick={onAddVariation}
              className="w-full h-6 text-xs"
              variant="default"
            >
              <Plus className="w-2.5 h-2.5 mr-1" />
              Add Variation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorFillPlugin;