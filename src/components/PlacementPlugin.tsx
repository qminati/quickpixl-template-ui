import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Settings, 
  Layers,
  Move,
  RotateCw,
  Maximize2,
  Copy,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Container {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
  name: string;
}

const PlacementPlugin = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [dpi, setDpi] = useState(300);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  const presets = [
    { id: 'custom', name: 'Custom', width: 1080, height: 1080 },
    { id: 'instagram-square', name: 'Instagram Square', width: 1080, height: 1080 },
    { id: 'instagram-portrait', name: 'Instagram Story', width: 1080, height: 1920 },
    { id: 'facebook-post', name: 'Facebook Post', width: 1200, height: 630 },
    { id: 'twitter-post', name: 'Twitter Post', width: 1024, height: 512 },
    { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720 },
  ];

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setCanvasWidth(preset.width);
      setCanvasHeight(preset.height);
    }
  };

  const addContainer = () => {
    const newContainer: Container = {
      id: `container-${Date.now()}`,
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      rotation: 0,
      locked: false,
      visible: true,
      name: `Container ${containers.length + 1}`
    };
    setContainers(prev => [...prev, newContainer]);
  };

  const deleteContainer = (id: string) => {
    setContainers(prev => prev.filter(c => c.id !== id));
    if (selectedContainer === id) {
      setSelectedContainer(null);
    }
  };

  const duplicateContainer = (id: string) => {
    const container = containers.find(c => c.id === id);
    if (container) {
      const newContainer: Container = {
        ...container,
        id: `container-${Date.now()}`,
        x: container.x + 20,
        y: container.y + 20,
        name: `${container.name} Copy`
      };
      setContainers(prev => [...prev, newContainer]);
    }
  };

  const toggleContainerVisibility = (id: string) => {
    setContainers(prev => prev.map(c => 
      c.id === id ? { ...c, visible: !c.visible } : c
    ));
  };

  return (
    <div className="bg-card border border-panel-border rounded-lg flex flex-col max-h-full">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2.5 flex items-center justify-between text-left hover:bg-accent/50 transition-colors rounded-t-lg flex-shrink-0"
      >
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">Placement</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="flex flex-col min-h-0 flex-1">
          {/* Canvas Dimensions */}
          <div className="p-3 pt-0 space-y-3 flex-shrink-0">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Canvas Size</label>
              
              {/* Preset Selector */}
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full h-7 px-2 bg-background border border-input rounded text-xs"
              >
                {presets.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>

              {/* Dimensions and DPI in one row */}
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-xs text-muted-foreground">W</label>
                  <Input
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => {
                      setCanvasWidth(Number(e.target.value));
                      setSelectedPreset('custom');
                    }}
                    className="h-6 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">H</label>
                  <Input
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => {
                      setCanvasHeight(Number(e.target.value));
                      setSelectedPreset('custom');
                    }}
                    className="h-6 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">DPI</label>
                  <Input
                    type="number"
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="h-6 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Container Controls */}
          <div className="flex-1 min-h-0 px-3">
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Containers</label>
                <Button
                  onClick={addContainer}
                  size="sm"
                  variant="outline"
                  className="h-6 px-1.5 text-xs"
                >
                  <Plus className="w-3 h-3 mr-0.5" />
                  Add
                </Button>
              </div>
            </div>

            {/* Container List - Scrollable */}
            <div className="h-full overflow-y-auto space-y-1">
              {containers.map((container) => (
                <div
                  key={container.id}
                  className={`flex items-center justify-between p-1.5 rounded border transition-colors cursor-pointer ${
                    selectedContainer === container.id
                      ? 'border-primary bg-primary/10'
                      : 'border-panel-border hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedContainer(container.id)}
                >
                  <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleContainerVisibility(container.id);
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      {container.visible ? '👁️' : '🙈'}
                    </button>
                    <span className="text-xs font-medium truncate">{container.name}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateContainer(container.id);
                      }}
                      className="p-0.5 text-muted-foreground hover:text-foreground"
                      title="Duplicate"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteContainer(container.id);
                      }}
                      className="p-0.5 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
              {containers.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No containers added yet
                </div>
              )}

              {/* Selected Container Properties */}
              {selectedContainer && (
                <div className="space-y-2 border-t border-panel-border pt-2 mt-3">
                  <label className="text-xs font-medium text-foreground">Properties</label>
                  {(() => {
                    const container = containers.find(c => c.id === selectedContainer);
                    if (!container) return null;
                    
                    return (
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-xs text-muted-foreground">X</label>
                          <Input
                            type="number"
                            value={container.x}
                            onChange={(e) => {
                              const newX = Number(e.target.value);
                              setContainers(prev => prev.map(c => 
                                c.id === selectedContainer ? { ...c, x: newX } : c
                              ));
                            }}
                            className="h-6 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Y</label>
                          <Input
                            type="number"
                            value={container.y}
                            onChange={(e) => {
                              const newY = Number(e.target.value);
                              setContainers(prev => prev.map(c => 
                                c.id === selectedContainer ? { ...c, y: newY } : c
                              ));
                            }}
                            className="h-6 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">W</label>
                          <Input
                            type="number"
                            value={container.width}
                            onChange={(e) => {
                              const newWidth = Number(e.target.value);
                              setContainers(prev => prev.map(c => 
                                c.id === selectedContainer ? { ...c, width: newWidth } : c
                              ));
                            }}
                            className="h-6 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">H</label>
                          <Input
                            type="number"
                            value={container.height}
                            onChange={(e) => {
                              const newHeight = Number(e.target.value);
                              setContainers(prev => prev.map(c => 
                                c.id === selectedContainer ? { ...c, height: newHeight } : c
                              ));
                            }}
                            className="h-6 text-xs"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Add to Variations button */}
          <div className="p-3 pt-2 flex-shrink-0 border-t border-panel-border">
            <Button variant="secondary" className="w-full h-8 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add to Variations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementPlugin;