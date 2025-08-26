import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sliders, Plus } from 'lucide-react';
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
    <div className="border rounded-lg bg-card">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-primary" />
              <span className="font-medium">Image Effects</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-6">
            {/* Colorize Mode Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="colorize"
                  checked={settings.colorize}
                  onCheckedChange={(checked) => updateSettings({ colorize: !!checked })}
                />
                <label htmlFor="colorize" className="text-sm font-medium">
                  Colorize
                </label>
              </div>
              
              {settings.colorize && (
                <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
                  {/* Colorize Hue */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Hue</span>
                      <span className="text-sm text-muted-foreground">{settings.colorizeHue}°</span>
                    </div>
                    <div className="relative">
                      <div 
                        className="absolute inset-0 rounded-md"
                        style={{
                          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                          height: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      />
                      <Slider
                        value={[settings.colorizeHue]}
                        onValueChange={([value]) => updateSettings({ colorizeHue: value })}
                        min={0}
                        max={360}
                        step={1}
                        className="relative z-10"
                      />
                    </div>
                  </div>
                  
                  {/* Colorize Saturation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Saturation</span>
                      <span className="text-sm text-muted-foreground">{settings.colorizeSaturation}%</span>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Brightness</span>
                      <span className="text-sm text-muted-foreground">{settings.colorizeBrightness}</span>
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
            </div>

            {/* Standard Adjustments Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Standard Adjustments</h4>
              
              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Brightness</span>
                  <span className="text-sm text-muted-foreground">{settings.brightness}</span>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Contrast</span>
                  <span className="text-sm text-muted-foreground">{settings.contrast}</span>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Saturation</span>
                  <span className="text-sm text-muted-foreground">{settings.saturation}</span>
                </div>
                <Slider
                  value={[settings.saturation]}
                  onValueChange={([value]) => updateSettings({ saturation: value })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>
              
              {/* Hue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hue</span>
                  <span className="text-sm text-muted-foreground">{settings.hue}°</span>
                </div>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-md"
                    style={{
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                      height: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  <Slider
                    value={[settings.hue]}
                    onValueChange={([value]) => updateSettings({ hue: value })}
                    min={0}
                    max={360}
                    step={1}
                    className="relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Quick Effects Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Quick Effects</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="grayscale"
                  checked={settings.grayscale}
                  onCheckedChange={(checked) => updateSettings({ grayscale: !!checked })}
                />
                <label htmlFor="grayscale" className="text-sm">
                  Grayscale
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="invert"
                  checked={settings.invert}
                  onCheckedChange={(checked) => updateSettings({ invert: !!checked })}
                />
                <label htmlFor="invert" className="text-sm">
                  Invert
                </label>
              </div>
            </div>

            {/* Add Variation Button */}
            <Button 
              onClick={onAddVariation}
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Image Effects Variation
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ImageEffectsPlugin;