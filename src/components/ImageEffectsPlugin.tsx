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
              <span className="text-sm font-medium text-foreground">Visual Effects</span>
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
                <Slider
                  value={[settings.hue]}
                  onValueChange={([value]) => updateSettings({ hue: value })}
                  min={0}
                  max={360}
                  step={1}
                  className="[&_[data-radix-slider-track]]:bg-gradient-to-r [&_[data-radix-slider-track]]:from-red-500 [&_[data-radix-slider-track]]:via-yellow-500 [&_[data-radix-slider-track]]:via-green-500 [&_[data-radix-slider-track]]:via-cyan-500 [&_[data-radix-slider-track]]:via-blue-500 [&_[data-radix-slider-track]]:via-purple-500 [&_[data-radix-slider-track]]:to-red-500"
                />
              </div>
              
              {/* Colorize, Greyscale, and Invert options */}
              <div className="flex items-center space-x-6">
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
                variant="default"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Visual Effects Variation
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ImageEffectsPlugin;