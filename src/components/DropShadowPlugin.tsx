import React, { useState, useCallback, useRef } from 'react';
import { 
  Droplets, 
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Upload,
  Shuffle,
  Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { validateImage } from '@/utils/imageUtils';
import { DropShadowSettings } from '@/types/interfaces';

interface DropShadowPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  settings: DropShadowSettings;
  onSettingsChange: (settings: DropShadowSettings) => void;
  onAddVariation: () => void;
}

const DropShadowPlugin: React.FC<DropShadowPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  settings,
  onSettingsChange,
  onAddVariation
}) => {
  const [expandedShadows, setExpandedShadows] = useState<Set<string>>(new Set());
  
  // File input refs
  const regularShadowImageInputRef = useRef<HTMLInputElement>(null);

  const updateSettings = useCallback((updates: Partial<DropShadowSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  }, [settings, onSettingsChange]);

  // Regular Shadow Functions
  const addRegularShadow = useCallback(() => {
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
      regular: {
        shadows: [...settings.regular.shadows, newShadow]
      }
    });
  }, [settings.regular.shadows, updateSettings]);

  const removeRegularShadow = useCallback((shadowId: string) => {
    updateSettings({
      regular: {
        shadows: settings.regular.shadows.filter(s => s.id !== shadowId)
      }
    });
  }, [settings.regular.shadows, updateSettings]);

  const updateRegularShadow = useCallback((shadowId: string, updates: Record<string, unknown>) => {
    updateSettings({
      regular: {
        shadows: settings.regular.shadows.map(s => 
          s.id === shadowId ? { ...s, ...updates } : s
        )
      }
    });
  }, [settings.regular.shadows, updateSettings]);

  // Character Shadow Functions
  const addCharacterConfiguration = useCallback(() => {
    const newCharacter = {
      id: Date.now().toString(),
      characterIndex: 0, // Will be calculated based on position in array
      shadows: [{
        id: `${Date.now()}-shadow`,
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
      }]
    };
    
    updateSettings({
      character: {
        characters: [...settings.character.characters, newCharacter]
      }
    });
  }, [settings.character.characters, updateSettings]);

  const removeCharacterConfiguration = useCallback((characterId: string) => {
    updateSettings({
      character: {
        characters: settings.character.characters.filter(c => c.id !== characterId)
      }
    });
  }, [settings.character.characters, updateSettings]);

  const addShadowToCharacter = useCallback((characterId: string) => {
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
      character: {
        characters: settings.character.characters.map(c => 
          c.id === characterId 
            ? { ...c, shadows: [...c.shadows, newShadow] }
            : c
        )
      }
    });
  }, [settings.character.characters, updateSettings]);

  const removeShadowFromCharacter = useCallback((characterId: string, shadowId: string) => {
    updateSettings({
      character: {
        characters: settings.character.characters.map(c => 
          c.id === characterId 
            ? { ...c, shadows: c.shadows.filter(s => s.id !== shadowId) }
            : c
        )
      }
    });
  }, [settings.character.characters, updateSettings]);

  const updateCharacterShadow = useCallback((characterId: string, shadowId: string, updates: Record<string, unknown>) => {
    updateSettings({
      character: {
        characters: settings.character.characters.map(c => 
          c.id === characterId 
            ? {
                ...c, 
                shadows: c.shadows.map(s => 
                  s.id === shadowId ? { ...s, ...updates } : s
                )
              }
            : c
        )
      }
    });
  }, [settings.character.characters, updateSettings]);

  // Gradient Functions
  const addGradientStop = useCallback((shadowType: 'regular' | 'character', shadowId: string, characterId?: string) => {
    const newStop = {
      id: Date.now().toString(),
      color: '#808080',
      position: 50
    };

    if (shadowType === 'regular') {
      const shadow = settings.regular.shadows.find(s => s.id === shadowId);
      if (!shadow?.gradient) return;
      
      updateRegularShadow(shadowId, {
        gradient: {
          ...shadow.gradient,
          stops: [...shadow.gradient.stops, newStop]
        }
      });
    } else if (shadowType === 'character' && characterId) {
      const character = settings.character.characters.find(c => c.id === characterId);
      const shadow = character?.shadows.find(s => s.id === shadowId);
      if (!shadow?.gradient) return;
      
      updateCharacterShadow(characterId, shadowId, {
        gradient: {
          ...shadow.gradient,
          stops: [...shadow.gradient.stops, newStop]
        }
      });
    }
  }, [settings, updateRegularShadow, updateCharacterShadow]);

  const removeGradientStop = useCallback((shadowType: 'regular' | 'character', stopId: string, shadowId: string, characterId?: string) => {
    if (shadowType === 'regular') {
      const shadow = settings.regular.shadows.find(s => s.id === shadowId);
      if (shadow) {
        updateRegularShadow(shadowId, {
          gradient: {
            ...shadow.gradient,
            stops: shadow.gradient.stops.filter(stop => stop.id !== stopId)
          }
        });
      }
    } else if (shadowType === 'character' && characterId) {
      const character = settings.character.characters.find(c => c.id === characterId);
      const shadow = character?.shadows.find(s => s.id === shadowId);
      if (shadow) {
        updateCharacterShadow(characterId, shadowId, {
          gradient: {
            ...shadow.gradient,
            stops: shadow.gradient.stops.filter(stop => stop.id !== stopId)
          }
        });
      }
    }
  }, [settings, updateRegularShadow, updateCharacterShadow]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, shadowType: 'regular' | 'character', shadowId: string, characterId?: string) => {
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

      if (shadowType === 'regular') {
        const shadow = settings.regular.shadows.find(s => s.id === shadowId);
        if (!shadow) return;
        
        updateRegularShadow(shadowId, {
          images: [...shadow.images, ...validImages]
        });
      } else if (shadowType === 'character' && characterId) {
        const character = settings.character.characters.find(c => c.id === characterId);
        const shadow = character?.shadows.find(s => s.id === shadowId);
        if (!shadow) return;
        
        updateCharacterShadow(characterId, shadowId, {
          images: [...shadow.images, ...validImages]
        });
      }

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

  const renderShadowControls = (shadow: Record<string, any>, shadowType: 'regular' | 'character', onUpdate: (updates: Record<string, unknown>) => void, characterId?: string) => {
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
                if (shadowType === 'regular') removeRegularShadow(shadow.id);
                else if (shadowType === 'character' && characterId) removeShadowFromCharacter(characterId, shadow.id);
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
                    onClick={() => addGradientStop(shadowType, shadow.id, characterId)}
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
                      onClick={() => removeGradientStop(shadowType, stop.id, shadow.id, characterId)}
                      disabled={shadow.gradient.stops.length <= 2}
                      className="p-1 h-auto w-auto"
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </div>
                ))}
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
                      input.onchange = (e) => handleImageUpload(e as any, shadowType, shadow.id, characterId);
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
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Shadow ${index + 1}`}
                          className="w-full h-8 object-cover rounded border"
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

  if (!isExpanded) {
    return (
      <div className="bg-card border border-input rounded-lg">
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onToggleExpanded}
        >
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Drop Shadow</span>
        </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-input rounded-lg">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-input"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Drop Shadow</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="p-3 space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Mode:</span>
          <div className="flex items-center space-x-1">
            <Button
              variant={settings.mode === 'regular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ mode: 'regular' })}
              className="h-6 px-2 text-xs"
            >
              Regular
            </Button>
            <Button
              variant={settings.mode === 'character' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSettings({ mode: 'character' })}
              className="h-6 px-2 text-xs"
            >
              Character
            </Button>
          </div>
        </div>

        {/* Regular Mode */}
        {settings.mode === 'regular' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground">
                Drop Shadows ({settings.regular.shadows.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={addRegularShadow}
                className="h-6 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Shadow
              </Button>
            </div>

            {settings.regular.shadows.length > 0 ? (
              <div className="space-y-2">
                {settings.regular.shadows.map((shadow) =>
                  renderShadowControls(
                    shadow,
                    'regular',
                    (updates) => updateRegularShadow(shadow.id, updates)
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No drop shadows added yet. Click "Add Shadow" to get started.
              </div>
            )}
          </div>
        )}

        {/* Character Mode */}
        {settings.mode === 'character' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground">
                Character Shadows ({settings.character.characters.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={addCharacterConfiguration}
                className="h-6 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Character
              </Button>
            </div>

            {settings.character.characters.length > 0 ? (
              <div className="space-y-3">
                {settings.character.characters.map((character, charIndex) => (
                  <div key={character.id} className="bg-secondary/10 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium">
                          Char {charIndex + 1} ({character.shadows.length} shadow{character.shadows.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addShadowToCharacter(character.id)}
                          className="h-5 px-2 text-xs"
                        >
                          <Plus className="w-2 h-2 mr-1" />
                          Shadow
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCharacterConfiguration(character.id)}
                          className="h-5 px-2 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </div>
                    </div>

                    {character.shadows.length > 0 ? (
                      <div className="space-y-2 pl-2">
                        {character.shadows.map((shadow) =>
                          renderShadowControls(
                            shadow,
                            'character',
                            (updates) => updateCharacterShadow(character.id, shadow.id, updates),
                            character.id
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs text-muted-foreground">
                        No shadows for this character yet.
                      </div>
                    )}
                  </div>
                ))}

                {/* Pattern Info */}
                {settings.character.characters.length > 1 && (
                  <div className="bg-muted/20 rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">Repeat Pattern:</div>
                      <div>
                        Characters will cycle through configurations: {' '}
                        {settings.character.characters.map((_, index) => `Char ${index + 1}`).join(' → ')} → repeat
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No character configurations added yet. Click "Add Character" to get started.
              </div>
            )}
          </div>
        )}

        {/* Add Variation Button */}
        <Button
          onClick={onAddVariation}
          className="w-full h-8 text-xs"
          variant="outline"
        >
          Add Variation
        </Button>
      </div>
    </div>
  );
};

export default DropShadowPlugin;