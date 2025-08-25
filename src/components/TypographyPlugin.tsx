import React, { useState } from 'react';
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

export interface TypographySettings {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textCase: 'normal' | 'uppercase' | 'lowercase';
  letterSpacing: number;
  wordSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textStroke: boolean;
  strokeWidth?: number;
  strokeColor?: string;
}

export interface TypographyVariation {
  id: string;
  settings: TypographySettings;
  description: string;
}

interface TypographyPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: TypographySettings;
  onSettingsChange: (settings: TypographySettings) => void;
  onAddVariation: () => void;
}

const TypographyPlugin: React.FC<TypographyPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const updateSettings = (updates: Partial<TypographySettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <Type className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Typography</span>
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
          {/* Format buttons */}
          <div className="flex items-center space-x-0.5">
            <Button
              variant={settings.bold ? "default" : "outline"}
              size="sm"  
              className="h-6 w-6 p-0 font-bold text-xs"
              onClick={() => updateSettings({ bold: !settings.bold })}
            >
              B
            </Button>
            <Button
              variant={settings.italic ? "default" : "outline"}
              size="sm"
              className="h-6 w-6 p-0 italic text-xs"
              onClick={() => updateSettings({ italic: !settings.italic })}
            >
              I
            </Button>
            <Button
              variant={settings.underline ? "default" : "outline"}
              size="sm"
              className="h-6 w-6 p-0 underline text-xs"
              onClick={() => updateSettings({ underline: !settings.underline })}
            >
              U
            </Button>
          </div>

          {/* Text Case */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Case</label>
            <div className="flex items-center space-x-0.5">
              <Button
                variant={settings.textCase === 'normal' ? "default" : "outline"}
                size="sm"
                className="flex-1 h-6 text-xs px-1"
                onClick={() => updateSettings({ textCase: 'normal' })}
              >
                Aa
              </Button>
              <Button
                variant={settings.textCase === 'uppercase' ? "default" : "outline"}
                size="sm"
                className="flex-1 h-6 text-xs px-1"
                onClick={() => updateSettings({ textCase: 'uppercase' })}
              >
                AA
              </Button>
              <Button
                variant={settings.textCase === 'lowercase' ? "default" : "outline"}
                size="sm"
                className="flex-1 h-6 text-xs px-1"
                onClick={() => updateSettings({ textCase: 'lowercase' })}
              >
                aa
              </Button>
            </div>
          </div>

          {/* Spacing */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Spacing</label>
            
            {/* Letter Spacing */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Letter</span>
                <span className="text-xs text-muted-foreground">{settings.letterSpacing}px</span>
              </div>
              <Slider
                value={[settings.letterSpacing]}
                onValueChange={([value]) => updateSettings({ letterSpacing: value })}
                min={-5}
                max={20}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Word Spacing */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Word</span>
                <span className="text-xs text-muted-foreground">{settings.wordSpacing}px</span>
              </div>
              <Slider
                value={[settings.wordSpacing]}
                onValueChange={([value]) => updateSettings({ wordSpacing: value })}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Alignment</label>
            <div className="flex items-center space-x-0.5">
              <Button
                variant={settings.textAlign === 'left' ? "default" : "outline"}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => updateSettings({ textAlign: 'left' })}
              >
                <AlignLeft className="w-2.5 h-2.5" />
              </Button>
              <Button
                variant={settings.textAlign === 'center' ? "default" : "outline"}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => updateSettings({ textAlign: 'center' })}
              >
                <AlignCenter className="w-2.5 h-2.5" />
              </Button>
              <Button
                variant={settings.textAlign === 'right' ? "default" : "outline"}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => updateSettings({ textAlign: 'right' })}
              >
                <AlignRight className="w-2.5 h-2.5" />
              </Button>
              <Button
                variant={settings.textAlign === 'justify' ? "default" : "outline"}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => updateSettings({ textAlign: 'justify' })}
              >
                <AlignJustify className="w-2.5 h-2.5" />
              </Button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <Button
                variant={settings.textStroke ? "default" : "outline"}
                size="sm"
                className="h-6 px-1.5 text-xs"
                onClick={() => updateSettings({ textStroke: !settings.textStroke })}
              >
                STR
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

export default TypographyPlugin;