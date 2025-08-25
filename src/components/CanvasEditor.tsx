import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Move, 
  RotateCw, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/types/interfaces';

interface CanvasEditorProps {
  canvasWidth: number;
  canvasHeight: number;
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  selectedContainer: string | null;
  setSelectedContainer: React.Dispatch<React.SetStateAction<string | null>>;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

const CanvasEditor: React.FC<CanvasEditorProps> = ({ 
  canvasWidth,
  canvasHeight,
  containers,
  setContainers,
  selectedContainer,
  setSelectedContainer
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Calculate canvas display size to fit container
  const [displaySize, setDisplaySize] = useState({ width: 800, height: 800 });

  useEffect(() => {
    const updateDisplaySize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth - 100; // Account for rulers
      const containerHeight = containerRef.current.clientHeight - 100;
      
      const aspectRatio = canvasWidth / canvasHeight;
      let displayWidth = containerWidth;
      let displayHeight = containerHeight;
      
      if (containerWidth / containerHeight > aspectRatio) {
        displayWidth = containerHeight * aspectRatio;
      } else {
        displayHeight = containerWidth / aspectRatio;
      }
      
      setDisplaySize({ 
        width: Math.min(displayWidth, 800), 
        height: Math.min(displayHeight, 800) 
      });
    };

    updateDisplaySize();
    window.addEventListener('resize', updateDisplaySize);
    return () => window.removeEventListener('resize', updateDisplaySize);
  }, [canvasWidth, canvasHeight]);

  // Generate ruler marks
  const generateRulerMarks = (length: number, isVertical = false) => {
    const marks = [];
    const scale = displaySize.width / canvasWidth; // pixels per unit
    const step = Math.max(10, Math.round(50 / scale)); // Adaptive step based on zoom
    
    for (let i = 0; i <= length; i += step) {
      const position = (i / length) * (isVertical ? displaySize.height : displaySize.width);
      marks.push(
        <g key={i}>
          <line
            x1={isVertical ? 0 : position}
            y1={isVertical ? position : 0}
            x2={isVertical ? (i % (step * 5) === 0 ? 20 : 10) : position}
            y2={isVertical ? position : (i % (step * 5) === 0 ? 20 : 10)}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
          />
          {i % (step * 5) === 0 && (
            <text
              x={isVertical ? 25 : position}
              y={isVertical ? position + 4 : 30}
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
              textAnchor={isVertical ? "start" : "middle"}
            >
              {i}
            </text>
          )}
        </g>
      );
    }
    return marks;
  };

  // Improved coordinate calculation with bounds checking
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasWidth, (clientX - rect.left) * (canvasWidth / displaySize.width)));
    const y = Math.max(0, Math.min(canvasHeight, (clientY - rect.top) * (canvasHeight / displaySize.height)));
    
    return { x, y };
  }, [canvasWidth, canvasHeight, displaySize]);

  const handleMouseDown = useCallback((e: React.MouseEvent, containerId?: string, resizeHandle?: ResizeHandle) => {
    if (!svgRef.current) return;
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    if (resizeHandle && containerId) {
      // Start resizing
      const container = containers.find(c => c.id === containerId);
      if (container) {
        setIsResizing(resizeHandle);
        setSelectedContainer(containerId);
        setResizeStart({
          x: coords.x,
          y: coords.y,
          width: container.width,
          height: container.height
        });
      }
    } else if (containerId) {
      // Start dragging
      setSelectedContainer(containerId);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Create new container with bounds checking
      const newContainer: Container = {
        id: `container-${Date.now()}`,
        x: Math.max(0, Math.min(canvasWidth - 100, coords.x - 50)),
        y: Math.max(0, Math.min(canvasHeight - 100, coords.y - 50)),
        width: 100,
        height: 100,
        rotation: 0,
        locked: false,
        visible: true,
        name: `Container ${containers.length + 1}`
      };
      setContainers(prev => [...prev, newContainer]);
      setSelectedContainer(newContainer.id);
    }
  }, [canvasWidth, canvasHeight, displaySize, containers, getCanvasCoordinates]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && selectedContainer) {
      // Handle resizing
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      const container = containers.find(c => c.id === selectedContainer);
      if (!container) return;

      let newWidth = container.width;
      let newHeight = container.height;
      let newX = container.x;
      let newY = container.y;

      const deltaX = coords.x - resizeStart.x;
      const deltaY = coords.y - resizeStart.y;

      switch (isResizing) {
        case 'se': // bottom-right
          newWidth = Math.max(20, Math.min(canvasWidth - container.x, resizeStart.width + deltaX));
          newHeight = Math.max(20, Math.min(canvasHeight - container.y, resizeStart.height + deltaY));
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, Math.min(canvasHeight - container.y, resizeStart.height + deltaY));
          newX = Math.max(0, container.x + resizeStart.width - newWidth);
          break;
        case 'ne': // top-right
          newWidth = Math.max(20, Math.min(canvasWidth - container.x, resizeStart.width + deltaX));
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = Math.max(0, container.y + resizeStart.height - newHeight);
          break;
        case 'nw': // top-left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newX = Math.max(0, container.x + resizeStart.width - newWidth);
          newY = Math.max(0, container.y + resizeStart.height - newHeight);
          break;
      }

      setContainers(prev => prev.map(c => 
        c.id === selectedContainer
          ? { ...c, x: newX, y: newY, width: newWidth, height: newHeight }
          : c
      ));
    } else if (isDragging && selectedContainer) {
      // Handle dragging with improved bounds checking
      const deltaX = (e.clientX - dragStart.x) * (canvasWidth / displaySize.width);
      const deltaY = (e.clientY - dragStart.y) * (canvasHeight / displaySize.height);
      
      setContainers(prev => prev.map(container => {
        if (container.id === selectedContainer) {
          const newX = Math.max(0, Math.min(canvasWidth - container.width, container.x + deltaX));
          const newY = Math.max(0, Math.min(canvasHeight - container.height, container.y + deltaY));
          return { ...container, x: newX, y: newY };
        }
        return container;
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isResizing, selectedContainer, dragStart, resizeStart, canvasWidth, canvasHeight, displaySize, containers, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleResetZoom = () => setZoom(1);

  return (
    <div ref={containerRef} className="flex-1 bg-background relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-card border border-panel-border rounded-lg p-2 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-2">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetZoom}
          title="Reset Zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas Info */}
      <div className="absolute top-4 right-4 z-10 bg-card border border-panel-border rounded-lg p-2 shadow-lg">
        <div className="text-xs text-muted-foreground">
          {canvasWidth} × {canvasHeight}px
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex flex-col h-full">
        {/* Top Ruler */}
        <div className="h-8 bg-card border-b border-panel-border flex">
          <div className="w-8"></div> {/* Corner space */}
          <div className="flex-1 relative">
            <svg width="100%" height="32" className="absolute inset-0">
              {generateRulerMarks(canvasWidth)}
            </svg>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Left Ruler */}
          <div className="w-8 bg-card border-r border-panel-border">
            <svg width="32" height="100%" className="absolute">
              {generateRulerMarks(canvasHeight, true)}
            </svg>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
            <div 
              className="relative bg-white shadow-lg"
              style={{
                width: displaySize.width * zoom,
                height: displaySize.height * zoom,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
              }}
            >
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                className="cursor-crosshair"
                onMouseDown={(e) => handleMouseDown(e)}
              >
                {/* Grid Pattern */}
                <defs>
                  <pattern
                    id="grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Containers */}
                {containers.filter(c => c.visible).map((container) => (
                  <g key={container.id}>
                    <rect
                      x={container.x}
                      y={container.y}
                      width={container.width}
                      height={container.height}
                      fill="hsl(var(--primary))"
                      fillOpacity="0.1"
                      stroke={selectedContainer === container.id ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={selectedContainer === container.id ? "2" : "1"}
                      strokeDasharray={selectedContainer === container.id ? "5,5" : "none"}
                      className="cursor-move"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, container.id);
                        }}
                      transform={`rotate(${container.rotation} ${container.x + container.width/2} ${container.y + container.height/2})`}
                    />
                    
                    {/* Container Label */}
                    <text
                      x={container.x + container.width/2}
                      y={container.y + container.height/2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="hsl(var(--muted-foreground))"
                      pointerEvents="none"
                    >
                      {container.name}
                    </text>

                    {/* Selection Handles */}
                    {selectedContainer === container.id && (
                      <>
                        {/* Corner resize handles with proper event handling */}
                        <circle
                          cx={container.x + container.width}
                          cy={container.y + container.height}
                          r="4"
                          fill="hsl(var(--primary))"
                          stroke="white"
                          strokeWidth="1"
                          className="cursor-nw-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(e, container.id, 'se');
                          }}
                        />
                        <circle
                          cx={container.x}
                          cy={container.y}
                          r="4"
                          fill="hsl(var(--primary))"
                          stroke="white"
                          strokeWidth="1"
                          className="cursor-nw-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(e, container.id, 'nw');
                          }}
                        />
                        <circle
                          cx={container.x + container.width}
                          cy={container.y}
                          r="4"
                          fill="hsl(var(--primary))"
                          stroke="white"
                          strokeWidth="1"
                          className="cursor-ne-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(e, container.id, 'ne');
                          }}
                        />
                        <circle
                          cx={container.x}
                          cy={container.y + container.height}
                          r="4"
                          fill="hsl(var(--primary))"
                          stroke="white"
                          strokeWidth="1"
                          className="cursor-sw-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(e, container.id, 'sw');
                          }}
                        />
                      </>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Info */}
      {selectedContainer && (
        <div className="absolute bottom-4 left-4 z-10 bg-card border border-panel-border rounded-lg p-2 shadow-lg">
          {(() => {
            const container = containers.find(c => c.id === selectedContainer);
            if (!container) return null;
            return (
              <div className="text-xs text-muted-foreground">
                {container.name}: {Math.round(container.x)}, {Math.round(container.y)} | {Math.round(container.width)} × {Math.round(container.height)}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;