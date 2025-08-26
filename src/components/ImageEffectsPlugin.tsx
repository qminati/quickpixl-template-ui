import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Sliders, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageEffectsSettings } from '@/types/interfaces';

interface ImageEffectsPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: ImageEffectsSettings;
  onSettingsChange: (settings: ImageEffectsSettings) => void;
  onAddVariation: () => void;
}

const ImageEffectsPlugin: React.FC<ImageEffectsPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const updateSettings = (updates: Partial<ImageEffectsSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <div 
            className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-foreground">Image Effects</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-3">
            {/* Standard Adjustments Section */}
            <div className="space-y-3">
              {/* Brightness */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Brightness</span>
                  <span className="text-xs text-muted-foreground">{settings.brightness}</span>
                </div>
                <Slider
                  value={[settings.brightness]}
                  onValueChange={([value]) => updateSettings({ brightness: value })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>
              
              {/* Contrast */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Contrast</span>
                  <span className="text-xs text-muted-foreground">{settings.contrast}</span>
                </div>
                <Slider
                  value={[settings.contrast]}
                  onValueChange={([value]) => updateSettings({ contrast: value })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>
              
              {/* Saturation */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Saturation</span>
                  <span className="text-xs text-muted-foreground">{settings.saturation}</span>
                </div>
                <Slider
                  value={[settings.saturation]}
                  onValueChange={([value]) => updateSettings({ saturation: value })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>
              
              {/* Vibrance */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Vibrance</span>
                  <span className="text-xs text-muted-foreground">{settings.vibrance || 0}</span>
                </div>
                <Slider
                  value={[settings.vibrance || 0]}
                  onValueChange={([value]) => updateSettings({ vibrance: value })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>
              
              {/* Hue with rainbow gradient on the slider track */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Hue</span>
                  <span className="text-xs text-muted-foreground">{settings.hue}°</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md pointer-events-none"
                    style={{
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                      height: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 1
                    }}
                  />
                  <Slider
                    value={[settings.hue]}
                    onValueChange={([value]) => updateSettings({ hue: value })}
                    min={0}
                    max={360}
                    step={1}
                    className="relative z-10 [&_[data-slider-track]]:bg-transparent"
                  />
                </div>
              </div>
              
              {/* Colorize Mode Section */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="colorize"
                  checked={settings.colorize}
                  onCheckedChange={(checked) => updateSettings({ colorize: !!checked })}
                />
                <label htmlFor="colorize" className="text-xs font-medium">
                  Colorize
                </label>
              </div>
              
              {settings.colorize && (
                <div className="ml-5 space-y-3 border-l-2 border-muted pl-3">
                  {/* Colorize Hue */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Hue</span>
                      <span className="text-xs text-muted-foreground">{settings.colorizeHue}°</span>
                    </div>
                    <div className="relative">
                      <div 
                        className="absolute inset-0 rounded-md pointer-events-none"
                        style={{
                          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                          height: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 1
                        }}
                      />
                      <Slider
                        value={[settings.colorizeHue]}
                        onValueChange={([value]) => updateSettings({ colorizeHue: value })}
                        min={0}
                        max={360}
                        step={1}
                        className="relative z-10 [&_[data-slider-track]]:bg-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Colorize Saturation */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Saturation</span>
                      <span className="text-xs text-muted-foreground">{settings.colorizeSaturation}%</span>
                    </div>
                    <Slider
                      value={[settings.colorizeSaturation]}
                      onValueChange={([value]) => updateSettings({ colorizeSaturation: value })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  {/* Colorize Brightness */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Brightness</span>
                      <span className="text-xs text-muted-foreground">{settings.colorizeBrightness}</span>
                    </div>
                    <Slider
                      value={[settings.colorizeBrightness]}
                      onValueChange={([value]) => updateSettings({ colorizeBrightness: value })}
                      min={-100}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              )}
              
              {/* Grayscale and Invert side by side */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="grayscale"
                    checked={settings.grayscale}
                    onCheckedChange={(checked) => updateSettings({ grayscale: !!checked })}
                  />
                  <label htmlFor="grayscale" className="text-xs">
                    Grayscale
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invert"
                    checked={settings.invert}
                    onCheckedChange={(checked) => updateSettings({ invert: !!checked })}
                  />
                  <label htmlFor="invert" className="text-xs">
                    Invert
                  </label>
                </div>
              </div>
            </div>

            {/* Add Variation Button */}
            <div className="pt-2">
              <Button
                onClick={onAddVariation}
                className="w-full h-6 text-xs"
                variant="outline"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Image Effects Variation
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ImageEffectsPlugin;