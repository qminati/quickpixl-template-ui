import React, { useState } from 'react';
import { 
  ALargeSmall,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { CharacterEffectsSettings, CharacterSettings } from '@/types/interfaces';

interface CharacterEffectsPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: CharacterEffectsSettings;
  onSettingsChange: (settings: CharacterEffectsSettings) => void;
  onAddVariation: () => void;
}

const CharacterEffectsPlugin: React.FC<CharacterEffectsPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const [expandedCharacters, setExpandedCharacters] = useState<Set<number>>(new Set([0]));

  const updateSettings = (updates: Partial<CharacterEffectsSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateCharacterSettings = (index: number, updates: Partial<CharacterSettings>) => {
    const newCharacters = [...settings.characters];
    newCharacters[index] = { ...newCharacters[index], ...updates };
    updateSettings({ characters: newCharacters });
  };

  const addCharacter = () => {
    if (settings.characters.length >= 10) {
      toast.info('Maximum 10 characters allowed');
      return;
    }
    
    const newCharacter: CharacterSettings = {
      width: 100,
      height: 100,
      verticalOffset: 0,
      rotation: 0
    };
    
    const newCharacters = [...settings.characters, newCharacter];
    updateSettings({ characters: newCharacters });
    
    // Expand the new character
    setExpandedCharacters(prev => new Set([...prev, newCharacters.length - 1]));
  };

  const removeCharacter = (index: number) => {
    if (settings.characters.length <= 1) {
      toast.info('At least one character is required');
      return;
    }
    
    const newCharacters = settings.characters.filter((_, i) => i !== index);
    updateSettings({ characters: newCharacters });
    
    // Update expanded characters set
    setExpandedCharacters(prev => {
      const newSet = new Set<number>();
      prev.forEach(i => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const toggleCharacterExpanded = (index: number) => {
    setExpandedCharacters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const randomizeRotations = () => {
    const newCharacters = settings.characters.map(char => ({
      ...char,
      rotation: Math.floor(Math.random() * 361) - 180
    }));
    updateSettings({ characters: newCharacters });
  };

  const applyMirrorRotation = () => {
    if (settings.mirrorRotationValue === undefined) return;
    
    const newCharacters = settings.characters.map((char, index) => ({
      ...char,
      rotation: index % 2 === 0 ? settings.mirrorRotationValue! : -settings.mirrorRotationValue!
    }));
    updateSettings({ characters: newCharacters });
  };

  const applyWaveRotation = () => {
    if (settings.waveRotationStart === undefined || settings.waveRotationEnd === undefined) return;
    
    const { waveRotationStart, waveRotationEnd } = settings;
    const step = settings.characters.length > 1 
      ? (waveRotationEnd - waveRotationStart) / (settings.characters.length - 1)
      : 0;
    
    const newCharacters = settings.characters.map((char, index) => ({
      ...char,
      rotation: waveRotationStart + (step * index)
    }));
    updateSettings({ characters: newCharacters });
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <ALargeSmall className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Character Effects</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* Character Settings List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Character Settings</label>
              <Button
                onClick={addCharacter}
                size="sm"
                variant="outline"
                className="h-5 w-5 p-0"
                disabled={settings.characters.length >= 10}
              >
                <Plus className="w-2.5 h-2.5" />
              </Button>
            </div>

            {settings.characters.map((character, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-1 bg-muted/30 border border-border rounded-md">
                  {/* Character Header */}
                  <div 
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCharacterExpanded(index)}
                  >
                    <span className="text-xs font-medium text-foreground">
                      Character {index + 1}
                    </span>
                    <div className="flex items-center space-x-1">
                      {expandedCharacters.has(index) ? (
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Character Content */}
                  {expandedCharacters.has(index) && (
                    <div className="p-2 pt-0 space-y-2">
                      {/* Sizing Section */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Sizing</label>
                        
                        {/* Width */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Width</span>
                            <span className="text-xs text-muted-foreground">{character.width}%</span>
                          </div>
                          <Slider
                            value={[character.width]}
                            onValueChange={([value]) => updateCharacterSettings(index, { width: value })}
                            min={50}
                            max={200}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        {/* Height */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Height</span>
                            <span className="text-xs text-muted-foreground">{character.height}%</span>
                          </div>
                          <Slider
                            value={[character.height]}
                            onValueChange={([value]) => updateCharacterSettings(index, { height: value })}
                            min={50}
                            max={200}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        {/* Vertical Position */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Vertical Position</span>
                            <span className="text-xs text-muted-foreground">{character.verticalOffset}px</span>
                          </div>
                          <Slider
                            value={[character.verticalOffset]}
                            onValueChange={([value]) => updateCharacterSettings(index, { verticalOffset: value })}
                            min={-50}
                            max={50}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Individual Rotation (only show in individual mode) */}
                        {settings.rotationMode === 'individual' && (
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Rotation</span>
                              <span className="text-xs text-muted-foreground">{character.rotation}°</span>
                            </div>
                            <Slider
                              value={[character.rotation]}
                              onValueChange={([value]) => updateCharacterSettings(index, { rotation: value })}
                              min={-180}
                              max={180}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {settings.characters.length > 1 && (
                  <Button
                    onClick={() => removeCharacter(index)}
                    size="sm"
                    variant="outline"
                    className="h-5 w-5 p-0 mt-2 flex-shrink-0"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Rotation Mode Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Rotation Mode</label>
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant={settings.rotationMode === 'individual' ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
                onClick={() => updateSettings({ rotationMode: 'individual' })}
              >
                Individual
              </Button>
              <Button
                variant={settings.rotationMode === 'mirror' ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
                onClick={() => updateSettings({ rotationMode: 'mirror' })}
              >
                Mirror
              </Button>
              <Button
                variant={settings.rotationMode === 'wave' ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
                onClick={() => updateSettings({ rotationMode: 'wave' })}
              >
                Wave
              </Button>
              <Button
                variant={settings.rotationMode === 'random' ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
                onClick={() => updateSettings({ rotationMode: 'random' })}
              >
                Random
              </Button>
            </div>

            {/* Mode-specific controls */}
            {settings.rotationMode === 'mirror' && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.mirrorRotationValue || 0}
                    onChange={(e) => updateSettings({ mirrorRotationValue: Number(e.target.value) })}
                    min={-180}
                    max={180}
                    className="flex-1 h-6 px-2 text-xs bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Rotation value"
                  />
                  <Button
                    onClick={applyMirrorRotation}
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            {settings.rotationMode === 'wave' && (
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={settings.waveRotationStart || 0}
                    onChange={(e) => updateSettings({ waveRotationStart: Number(e.target.value) })}
                    min={-180}
                    max={180}
                    className="flex-1 h-6 px-2 text-xs bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Start"
                  />
                  <input
                    type="number"
                    value={settings.waveRotationEnd || 0}
                    onChange={(e) => updateSettings({ waveRotationEnd: Number(e.target.value) })}
                    min={-180}
                    max={180}
                    className="flex-1 h-6 px-2 text-xs bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="End"
                  />
                  <Button
                    onClick={applyWaveRotation}
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            {settings.rotationMode === 'random' && (
              <Button
                onClick={randomizeRotations}
                size="sm"
                className="w-full h-6 text-xs"
              >
                <Shuffle className="w-2.5 h-2.5 mr-1" />
                Randomize
              </Button>
            )}
          </div>

          {/* Alignment Override */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Alignment Override</label>
            <div className="flex items-center space-x-1">
              <Button
                variant={settings.alignment === 'none' ? "default" : "outline"}
                size="sm"
                className="flex-1 h-6 text-xs"
                onClick={() => updateSettings({ alignment: 'none' })}
              >
                None
              </Button>
              <Button
                variant={settings.alignment === 'top' ? "default" : "outline"}
                size="sm"
                className="flex-1 h-6 text-xs"
                onClick={() => updateSettings({ alignment: 'top' })}
              >
                Top
              </Button>
              <Button
                variant={settings.alignment === 'bottom' ? "default" : "outline"}
                size="sm"
                className="flex-1 h-6 text-xs"
                onClick={() => updateSettings({ alignment: 'bottom' })}
              >
                Bottom
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Overrides vertical positioning</p>
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

export default CharacterEffectsPlugin;