import React, { useState } from 'react';
import { 
  Palette, 
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Shuffle,
  Upload,
  Pipette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { validateImage, getBlobUrl, handleImageError } from '@/utils/imageUtils';
import { ImageColorFillSettings } from '@/types/interfaces';

interface ImageColorFillPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: ImageColorFillSettings;
  onSettingsChange: (settings: ImageColorFillSettings) => void;
  onAddVariation: () => void;
}

const ImageColorFillPlugin: React.FC<ImageColorFillPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const [hexInput, setHexInput] = useState(settings.solid.color);

  const updateSettings = (updates: Partial<ImageColorFillSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateModeSettings = (mode: keyof ImageColorFillSettings, updates: Record<string, unknown>) => {
    const currentSettings = settings[mode] as Record<string, unknown>;
    updateSettings({
      ...settings,
      [mode]: { ...currentSettings, ...updates }
    });
  };

  const setMode = (mode: ImageColorFillSettings['mode']) => {
    updateSettings({ mode });
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
      id: crypto.randomUUID(),
      color: '#808080',
      position: 50
    };
    const newStops = [...settings.gradient.stops, newStop];
    updateModeSettings('gradient', { stops: newStops });
  };

  const removeGradientStop = (id: string) => {
    const newStops = settings.gradient.stops.filter(stop => stop.id !== id);
    // Ensure at least 2 stops remain, re-seed if empty
    const finalStops = newStops.length < 2 ? [
      { id: crypto.randomUUID(), color: '#808080', position: 0 },
      { id: crypto.randomUUID(), color: '#808080', position: 100 }
    ] : newStops.sort((a, b) => a.position - b.position);
    updateModeSettings('gradient', { stops: finalStops });
  };

  const updateGradientStop = (id: string, updates: Partial<{ color: string; position: number }>) => {
    const newStops = settings.gradient.stops.map(stop => 
      stop.id === id ? { ...stop, ...updates } : stop
    );
    updateModeSettings('gradient', { stops: newStops });
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
          // For single mode, only take the first valid file
          const imageToAdd = validFiles[0];
          const newImages = [imageToAdd];
          updateModeSettings('image', { images: newImages });
          toast.success('Image uploaded');
        } catch (updateError) {
          console.error('Failed to update settings with new image:', updateError);
          toast.error('Failed to process uploaded image');
        }
      }

      if (hasErrors && validFiles.length === 0) {
        toast.error('No valid image could be uploaded');
      }
    } catch (error) {
      console.error('Upload process failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      // Clear the input to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const removeImage = () => {
    updateModeSettings('image', { images: [] });
  };

  const randomizeImage = () => {
    // For single image mode, randomize doesn't change the array but toggles the randomize flag
    updateModeSettings('image', { randomize: !settings.image.randomize });
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
          <span className="text-sm font-medium text-foreground">Image Color & Fill</span>
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
                    input.style.position = 'absolute';
                    input.style.visibility = 'hidden';
                    input.onchange = (e) => {
                      handleSolidColorChange((e.target as HTMLInputElement).value);
                      document.body.removeChild(input);
                    };
                    input.oncancel = () => {
                      document.body.removeChild(input);
                    };
                    document.body.appendChild(input);
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
                          input.style.position = 'absolute';
                          input.style.visibility = 'hidden';
                          input.onchange = (e) => {
                            updateGradientStop(stop.id, { color: (e.target as HTMLInputElement).value });
                            document.body.removeChild(input);
                          };
                          input.oncancel = () => {
                            document.body.removeChild(input);
                          };
                          document.body.appendChild(input);
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

          {/* Image Mode */}
          {settings.mode === 'image' && (
            <div className="space-y-2">
              {/* Image Upload */}
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs w-full"
                      asChild
                    >
                      <span>
                        <Upload className="w-3 h-3 mr-1" />
                        Upload Image
                      </span>
                    </Button>
                  </label>
                  {settings.image.images.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={randomizeImage}
                      title={settings.image.randomize ? "Randomize: ON" : "Randomize: OFF"}
                    >
                      <Shuffle className={`w-2.5 h-2.5 ${settings.image.randomize ? 'text-primary' : ''}`} />
                    </Button>
                  )}
                </div>

                {/* Image Preview */}
                {settings.image.images.length > 0 && (
                  <div className="space-y-1">
                    <div className="w-full h-16 bg-muted rounded border flex items-center justify-center relative overflow-hidden">
                      <img
                        src={getBlobUrl(settings.image.images[0])}
                        alt="Uploaded"
                        className="max-w-full max-h-full object-contain"
                        onError={handleImageError}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-4 w-4 p-0"
                        onClick={removeImage}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Opacity Slider */}
              {settings.image.images.length > 0 && (
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
              )}
            </div>
          )}

          {/* Add Variation Button */}
          <Button
            onClick={onAddVariation}
            size="sm"
            className="w-full h-6 text-xs bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Variation
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageColorFillPlugin;