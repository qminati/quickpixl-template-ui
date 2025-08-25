import React, { useState } from 'react';
import { 
  Shapes, 
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ShapeSettings, TextShapeVariation } from '@/types/interfaces';

interface TextShapePluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  selectedShape: keyof ShapeSettings;
  onShapeChange: (shape: keyof ShapeSettings) => void;
  shapeSettings: ShapeSettings;
  onShapeSettingsChange: (settings: ShapeSettings) => void;
  onAddVariation: () => void;
}

const TextShapePlugin: React.FC<TextShapePluginProps> = ({
  isExpanded,
  onToggleExpanded,
  selectedShape,
  onShapeChange,
  shapeSettings,
  onShapeSettingsChange,
  onAddVariation
}) => {
  const shapes: (keyof ShapeSettings)[] = [
    'none', 'circle', 'arc', 'arch', 'angle', 'flag', 'wave', 'distort'
  ];

  const updateShapeSettings = <T extends keyof ShapeSettings>(
    shape: T,
    updates: Partial<ShapeSettings[T]>
  ) => {
    onShapeSettingsChange({
      ...shapeSettings,
      [shape]: { ...shapeSettings[shape], ...updates }
    });
  };

  const renderShapeControls = () => {
    switch (selectedShape) {
      case 'circle':
        return (
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Radius</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.circle.radius}px</span>
              </div>
              <Slider
                value={[shapeSettings.circle.radius]}
                onValueChange={([value]) => updateShapeSettings('circle', { radius: value })}
                min={50}
                max={200}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Start Angle</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.circle.startAngle}°</span>
              </div>
              <Slider
                value={[shapeSettings.circle.startAngle]}
                onValueChange={([value]) => updateShapeSettings('circle', { startAngle: value })}
                min={0}
                max={360}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-0.5">
              <Button
                variant={shapeSettings.circle.direction === 'clockwise' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-6 text-xs"
                onClick={() => updateShapeSettings('circle', { direction: 'clockwise' })}
              >
                CW
              </Button>
              <Button
                variant={shapeSettings.circle.direction === 'counter-clockwise' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-6 text-xs"
                onClick={() => updateShapeSettings('circle', { direction: 'counter-clockwise' })}
              >
                CCW
              </Button>
            </div>
          </div>
        );
      
      case 'arc':
        return (
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Radius</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.arc.radius}px</span>
              </div>
              <Slider
                value={[shapeSettings.arc.radius]}
                onValueChange={([value]) => updateShapeSettings('arc', { radius: value })}
                min={50}
                max={300}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Arc Angle</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.arc.arcAngle}°</span>
              </div>
              <Slider
                value={[shapeSettings.arc.arcAngle]}
                onValueChange={([value]) => updateShapeSettings('arc', { arcAngle: value })}
                min={0}
                max={180}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-0.5">
              <Button
                variant={shapeSettings.arc.flip ? 'default' : 'outline'}
                size="sm"
                className="w-full h-6 text-xs"
                onClick={() => updateShapeSettings('arc', { flip: !shapeSettings.arc.flip })}
              >
                Flip Arc
              </Button>
            </div>
          </div>
        );

      case 'arch':
        return (
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Height</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.arch.height}px</span>
              </div>
              <Slider
                value={[shapeSettings.arch.height]}
                onValueChange={([value]) => updateShapeSettings('arch', { height: value })}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Curve</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.arch.curve}</span>
              </div>
              <Slider
                value={[shapeSettings.arch.curve]}
                onValueChange={([value]) => updateShapeSettings('arch', { curve: value })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'angle':
        return (
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Angle</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.angle.angle}°</span>
              </div>
              <Slider
                value={[shapeSettings.angle.angle]}
                onValueChange={([value]) => updateShapeSettings('angle', { angle: value })}
                min={-45}
                max={45}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Skew</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.angle.skew}°</span>
              </div>
              <Slider
                value={[shapeSettings.angle.skew]}
                onValueChange={([value]) => updateShapeSettings('angle', { skew: value })}
                min={-30}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'flag':
        return (
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Wave Height</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.flag.waveHeight}px</span>
              </div>
              <Slider
                value={[shapeSettings.flag.waveHeight]}
                onValueChange={([value]) => updateShapeSettings('flag', { waveHeight: value })}
                min={10}
                max={50}
                step={2}
                className="w-full"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Wave Length</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.flag.waveLength}px</span>
              </div>
              <Slider
                value={[shapeSettings.flag.waveLength]}
                onValueChange={([value]) => updateShapeSettings('flag', { waveLength: value })}
                min={50}
                max={200}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-0.5">
              <Button
                variant={shapeSettings.flag.reverse ? 'default' : 'outline'}
                size="sm"
                className="w-full h-6 text-xs"
                onClick={() => updateShapeSettings('flag', { reverse: !shapeSettings.flag.reverse })}
              >
                Reverse
              </Button>
            </div>
          </div>
        );

      case 'wave':
        return (
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Amplitude</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.wave.amplitude}px</span>
              </div>
              <Slider
                value={[shapeSettings.wave.amplitude]}
                onValueChange={([value]) => updateShapeSettings('wave', { amplitude: value })}
                min={5}
                max={50}
                step={2}
                className="w-full"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Frequency</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.wave.frequency}</span>
              </div>
              <Slider
                value={[shapeSettings.wave.frequency]}
                onValueChange={([value]) => updateShapeSettings('wave', { frequency: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Phase</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.wave.phase}°</span>
              </div>
              <Slider
                value={[shapeSettings.wave.phase]}
                onValueChange={([value]) => updateShapeSettings('wave', { phase: value })}
                min={0}
                max={360}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'distort':
        return (
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Intensity</span>
                <span className="text-xs text-muted-foreground">{shapeSettings.distort.intensity}%</span>
              </div>
              <Slider
                value={[shapeSettings.distort.intensity]}
                onValueChange={([value]) => updateShapeSettings('distort', { intensity: value })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <Shapes className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Text Shape</span>
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
          {/* Shape Type Grid */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Shape Type</label>
            <div className="grid grid-cols-2 gap-0.5">
              {shapes.map((shape) => (
                <Button
                  key={shape}
                  variant={selectedShape === shape ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs capitalize"
                  onClick={() => onShapeChange(shape)}
                >
                  {shape === 'none' ? 'None' : shape.charAt(0).toUpperCase() + shape.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Dynamic Shape Controls */}
          {selectedShape !== 'none' && renderShapeControls()}

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

export default TextShapePlugin;