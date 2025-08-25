import React from 'react';
import { 
  RotateCw, 
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUpDown,
  ArrowLeftRight,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export interface RotateFlipSettings {
  enabled: boolean;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface RotateFlipVariation {
  id: string;
  settings: RotateFlipSettings;
  description: string;
}

interface RotateFlipPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: RotateFlipSettings;
  onSettingsChange: (settings: RotateFlipSettings) => void;
  onAddVariation: () => void;
}

const RotateFlipPlugin: React.FC<RotateFlipPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const updateSettings = (updates: Partial<RotateFlipSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const setRotation = (rotation: number) => {
    updateSettings({ rotation });
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <RotateCw className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Rotate & Flip</span>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSettings({ enabled })}
            onClick={(e) => e.stopPropagation()}
          />
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-2.5 pt-0 space-y-2.5">
          {/* Rotation Slider */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Rotation</label>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Angle</span>
                <span className="text-xs text-muted-foreground">{settings.rotation}°</span>
              </div>
              <Slider
                value={[settings.rotation]}
                onValueChange={([value]) => updateSettings({ rotation: value })}
                min={-45}
                max={45}
                step={1}
                className="w-full"
                disabled={!settings.enabled}
              />
            </div>
          </div>

          {/* Flip and Quick Rotation Buttons */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Transform</label>
            <div className="flex items-center space-x-0.5">
              {/* Flip Buttons */}
              <Button
                variant={settings.flipHorizontal ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => updateSettings({ flipHorizontal: !settings.flipHorizontal })}
                disabled={!settings.enabled}
              >
                <ArrowLeftRight className="w-2.5 h-2.5 mr-1" />
                H
              </Button>
              <Button
                variant={settings.flipVertical ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => updateSettings({ flipVertical: !settings.flipVertical })}
                disabled={!settings.enabled}
              >
                <ArrowUpDown className="w-2.5 h-2.5 mr-1" />
                V
              </Button>
              
              {/* Divider */}
              <div className="w-px h-4 bg-border mx-0.5" />
              
              {/* Quick Rotation Buttons */}
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setRotation(45)}
                disabled={!settings.enabled}
              >
                <RotateCw className="w-2.5 h-2.5 mr-1" />
                45°
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setRotation(-45)}
                disabled={!settings.enabled}
              >
                <RotateCcw className="w-2.5 h-2.5 mr-1" />
                -45°
              </Button>
            </div>
          </div>

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

export default RotateFlipPlugin;