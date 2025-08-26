import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Palette, Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Variation } from '@/types/interfaces';

interface TextBackgroundPluginProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onAddVariation: (variation: Variation) => void;
}

const TextBackgroundPlugin: React.FC<TextBackgroundPluginProps> = ({
  isExpanded,
  onToggleExpanded,
  onAddVariation,
}) => {
  const [mode, setMode] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [solidColor, setSolidColor] = useState('#3B82F6');
  const [gradientFrom, setGradientFrom] = useState('#3B82F6');
  const [gradientTo, setGradientTo] = useState('#8B5CF6');
  const [gradientAngle, setGradientAngle] = useState([45]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVariation = () => {
    let colors: string[] = [];
    let images: File[] = [];
    let description = '';

    if (mode === 'solid') {
      colors = [solidColor];
      description = `Solid ${solidColor}`;
    } else if (mode === 'gradient') {
      colors = [gradientFrom, gradientTo];
      description = `Gradient ${gradientFrom}→${gradientTo} @${gradientAngle[0]}°`;
    } else if (mode === 'image') {
      images = selectedImages;
      description = `${selectedImages.length} image${selectedImages.length !== 1 ? 's' : ''}`;
    }

    const variation: Variation = {
      id: Date.now().toString(),
      colors,
      images,
      description,
    };

    onAddVariation(variation);

    // Reset form
    if (mode === 'image') {
      setSelectedImages([]);
    }
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-secondary/30 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Text Container Background</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-panel-border">
          {/* Mode Selection */}
          <div className="flex bg-secondary/30 rounded-lg p-1">
            {(['solid', 'gradient', 'image'] as const).map((modeOption) => (
              <button
                key={modeOption}
                onClick={() => setMode(modeOption)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                  mode === modeOption
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
              </button>
            ))}
          </div>

          {/* Solid Color Mode */}
          {mode === 'solid' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="w-12 h-8 p-1 border-0"
                />
                <Input
                  type="text"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="flex-1 text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}

          {/* Gradient Mode */}
          {mode === 'gradient' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground w-12">From:</span>
                  <Input
                    type="color"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="w-12 h-8 p-1 border-0"
                  />
                  <Input
                    type="text"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="flex-1 text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground w-12">To:</span>
                  <Input
                    type="color"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="w-12 h-8 p-1 border-0"
                  />
                  <Input
                    type="text"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="flex-1 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Angle</span>
                  <span className="text-xs text-foreground">{gradientAngle[0]}°</span>
                </div>
                <Slider
                  value={gradientAngle}
                  onValueChange={setGradientAngle}
                  max={360}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              {/* Gradient Preview */}
              <div
                className="w-full h-8 rounded-md border border-border"
                style={{
                  background: `linear-gradient(${gradientAngle[0]}deg, ${gradientFrom}, ${gradientTo})`
                }}
              />
            </div>
          )}

          {/* Image Mode */}
          {mode === 'image' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="background-image-upload"
                />
                <label
                  htmlFor="background-image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload images
                  </span>
                </label>
              </div>
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">
                    Selected images ({selectedImages.length}):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Background ${index + 1}`}
                          className="w-full h-16 object-cover rounded-md border border-border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Variation Button */}
          <Button
            onClick={handleAddVariation}
            disabled={mode === 'image' && selectedImages.length === 0}
            className="w-full"
            size="sm"
          >
            Add Variation
          </Button>
        </div>
      )}
    </div>
  );
};

export default TextBackgroundPlugin;