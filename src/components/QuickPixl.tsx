import React, { useState, useRef, useEffect } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Layers, 
  FileImage, 
  Shuffle,
  Settings,
  Folder,
  Mail,
  HelpCircle,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Copy,
  FolderOpen,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Check,
  Palette,
  Pipette,
  Hash,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlacementPlugin from './PlacementPlugin';
import CanvasEditor from './CanvasEditor';

// Import template images
import templateFocusGood from '@/assets/template-focus-good.jpg';
import templateBowlingCharacter from '@/assets/template-bowling-character.jpg';
import templateSpareShirt from '@/assets/template-spare-shirt.jpg';
import templateGirlsDiamonds from '@/assets/template-girls-diamonds.jpg';
import templateBeLight from '@/assets/template-be-light.jpg';
import templateGiveThanks from '@/assets/template-give-thanks.jpg';
import templateInspirational from '@/assets/template-inspirational.jpg';
import templateTouchdown from '@/assets/template-touchdown.jpg';

// Define interfaces
interface Variation {
  id: string;
  colors: string[];
  images: File[];
  description: string;
}

interface Template {
  id: number;
  title: string;
  size: string;
  image: string;
  category: string;
}

interface TemplateVariation {
  id: string;
  templates: Template[];
  description: string;
}

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

const templates = [
  {
    id: 1,
    title: "Focus on the Good",
    size: "1080×1080",
    image: templateFocusGood,
    category: "TX: 1  IM: 0"
  },
  {
    id: 2,
    title: "Bowling Built My Character",
    size: "1200×800",
    image: templateBowlingCharacter,
    category: "TX: 2  IM: 1"
  },
  {
    id: 3,
    title: "This Is My Spare Shirt",
    size: "1080×1080",
    image: templateSpareShirt,
    category: "TX: 1  IM: 0"
  },
  {
    id: 4,
    title: "Some Girls Love Diamonds",
    size: "1200×1200",
    image: templateGirlsDiamonds,
    category: "TX: 3  IM: 1"
  },
  {
    id: 5,
    title: "Be The Light",
    size: "800×1200",
    image: templateBeLight,
    category: "TX: 1  IM: 0"
  },
  {
    id: 6,
    title: "Give Thanks to the Lord",
    size: "1080×1350",
    image: templateGiveThanks,
    category: "TX: 1  IM: 0"
  },
  {
    id: 7,
    title: "Inspirational Quote",
    size: "1080×1080",
    image: templateInspirational,
    category: "TX: 1  IM: 0"
  },
  {
    id: 8,
    title: "Touch Down Season",
    size: "1200×900",
    image: templateTouchdown,
    category: "TX: 1  IM: 0"
  }
];

// Mock folders
const folders = [
  {
    id: 'folder-1',
    name: 'Christmas Templates',
    templateCount: 12,
    type: 'folder'
  },
  {
    id: 'folder-2', 
    name: 'Sports Collection',
    templateCount: 8,
    type: 'folder'
  }
];

const QuickPixl = () => {
  const [activeSection, setActiveSection] = useState('templates');
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  
  // Canvas and Placement State (lifted up from PlacementPlugin)
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  
  // Background Plugin State
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [backgroundVariations, setBackgroundVariations] = useState<Variation[]>([]);
  const [isBackgroundExpanded, setIsBackgroundExpanded] = useState(true);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  
  // Template Settings State
  const [addedTemplates, setAddedTemplates] = useState<Template[]>([]);
  const [templateVariations, setTemplateVariations] = useState<TemplateVariation[]>([]);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [blobUrls, setBlobUrls] = useState<Map<File, string>>(new Map());
  
  // Search State
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cleanup function for blob URLs
  useEffect(() => {
    return () => {
      blobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [blobUrls]);

  // Helper to safely get blob URL with cleanup tracking
  const getBlobUrl = (file: File): string => {
    // Check if we already have a URL for this file
    if (blobUrls.has(file)) {
      return blobUrls.get(file)!;
    }
    
    // Create new URL and track it
    const url = URL.createObjectURL(file);
    setBlobUrls(prev => new Map(prev).set(file, url));
    return url;
  };

  // Color palette
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#C44569', '#786FA6', '#F79F1F', '#A3CB38', '#1289A7',
    '#D63031', '#74B9FF', '#6C5CE7', '#A29BFE', '#FD79A8'
  ];

  const sidebarItems = [
    { id: 'canvas', icon: Layers, label: 'Canvas' },
    { id: 'templates', icon: FileImage, label: 'Templates' },
    { id: 'images', icon: ImageIcon, label: 'Images' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'variations', icon: Shuffle, label: 'Variations' }
  ];

  const handleTemplateSelect = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template && !addedTemplates.find(t => t.id === templateId)) {
      setAddedTemplates(prev => [...prev, template]);
    }
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Template Settings Handlers
  const handleRemoveTemplate = (templateId: number) => {
    setAddedTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleAddTemplateToVariation = () => {
    if (addedTemplates.length === 0) return;
    
    const newVariation: TemplateVariation = {
      id: `template-variation-${Date.now()}`,
      templates: [...addedTemplates],
      description: `${addedTemplates.length} template${addedTemplates.length > 1 ? 's' : ''}`
    };
    
    setTemplateVariations(prev => [...prev, newVariation]);
    // Clear added templates after adding to variation
    setAddedTemplates([]);
  };

  const handleRemoveTemplateVariation = (variationId: string) => {
    setTemplateVariations(prev => prev.filter(v => v.id !== variationId));
  };

  const handleDoubleClickTemplateVariation = (variation: TemplateVariation) => {
    // Add the templates from this variation back to the added templates
    const templatesNotAlreadyAdded = variation.templates.filter(
      template => !addedTemplates.find(t => t.id === template.id)
    );
    setAddedTemplates(prev => [...prev, ...templatesNotAlreadyAdded]);
  };

  // Background Plugin Handlers
  const handleAddColor = () => {
    if (currentColor && !selectedColors.includes(currentColor)) {
      setSelectedColors(prev => [...prev, currentColor]);
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setSelectedColors(prev => prev.filter(color => color !== colorToRemove));
  };

  const handleEyedropper = async () => {
    if ('EyeDropper' in window) {
      try {
        setIsEyedropperActive(true);
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        setCurrentColor(result.sRGBHex);
      } catch (e) {
        console.log('Eyedropper cancelled');
      } finally {
        setIsEyedropperActive(false);
      }
    } else {
      // Better fallback for unsupported browsers (Safari, Firefox)
      alert('Eyedropper is not supported in your browser. Please use the color picker or enter a hex value instead.');
      // Auto-focus the color input as fallback
      if (colorInputRef.current) {
        colorInputRef.current.focus();
        colorInputRef.current.click();
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
    // Auto-select uploaded images
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleImageSelect = (image: File) => {
    setSelectedImages(prev => 
      prev.includes(image) 
        ? prev.filter(img => img !== image)
        : [...prev, image]
    );
  };

  const handleImageDelete = (imageToDelete: File) => {
    // Clean up the blob URL for this specific image
    const url = blobUrls.get(imageToDelete);
    if (url) {
      URL.revokeObjectURL(url);
      setBlobUrls(prev => {
        const newMap = new Map(prev);
        newMap.delete(imageToDelete);
        return newMap;
      });
    }
    
    setUploadedImages(prev => prev.filter(img => img !== imageToDelete));
    setSelectedImages(prev => prev.filter(img => img !== imageToDelete));
  };

  const handleAddToVariation = () => {
    if (selectedColors.length === 0 && selectedImages.length === 0) return;
    
    const newVariation: Variation = {
      id: Date.now().toString(),
      colors: [...selectedColors],
      images: [...selectedImages],
      description: `${selectedColors.length} colors, ${selectedImages.length} images`
    };
    
    setBackgroundVariations(prev => [...prev, newVariation]);
    setSelectedColors([]);
    setSelectedImages([]);
  };

  const handleRemoveVariation = (variationId: string) => {
    setBackgroundVariations(prev => prev.filter(v => v.id !== variationId));
  };

  // Background Plugin Component
  const BackgroundPlugin = () => {
    const totalSelected = selectedColors.length + selectedImages.length;
    
    return (
      <div className="bg-card border border-panel-border rounded-lg shadow-sm">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
          onClick={() => setIsBackgroundExpanded(!isBackgroundExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium text-foreground">Background</span>
            {totalSelected > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {totalSelected}
              </span>
            )}
          </div>
          {isBackgroundExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        {isBackgroundExpanded && (
          <div className="p-3 pt-0 space-y-3">
            {/* Color Selection */}
            <div>
              <h4 className="text-xs font-medium text-foreground mb-2">Colors</h4>
              
              {/* Color Picker and Eyedropper */}
              <div className="space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1.5 bg-secondary rounded p-1.5 flex-1 min-w-0">
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-6 h-6 rounded border border-panel-border cursor-pointer flex-shrink-0"
                    />
                    <div className="flex items-center space-x-1 flex-1 min-w-0">
                      <Hash className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(e) => setCurrentColor(e.target.value)}
                        className="bg-transparent text-xs text-foreground border-none outline-none flex-1 min-w-0"
                        placeholder="#FF6B6B"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEyedropper}
                    disabled={isEyedropperActive}
                    className="p-1.5 flex-shrink-0"
                    title="Pick color from screen"
                  >
                    <Pipette className={`w-3 h-3 ${isEyedropperActive ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddColor}
                  disabled={!currentColor || selectedColors.includes(currentColor)}
                  className="w-full h-6 text-xs"
                >
                  Add Color
                </Button>
              </div>

              {/* Selected Colors */}
              {selectedColors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedColors.map((color) => (
                    <div 
                      key={color}
                      className="group flex items-center space-x-1 bg-secondary hover:bg-secondary/80 px-1.5 py-0.5 rounded text-xs transition-colors"
                    >
                      <div 
                        className="w-3 h-3 rounded border border-panel-border"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-foreground font-mono text-xs">{color}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveColor(color)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-3 w-3 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <h4 className="text-xs font-medium text-foreground mb-2">Images</h4>
              <div className="border-2 border-dashed border-panel-border rounded p-2 text-center hover:border-muted-foreground transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload
                  </p>
                </label>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div 
                        className={`aspect-square rounded border cursor-pointer transition-all ${
                          selectedImages.includes(image)
                            ? 'border-primary ring-1 ring-primary/20'
                            : 'border-panel-border hover:border-muted-foreground'
                        }`}
                        onClick={() => handleImageSelect(image)}
                      >
                        <img
                          src={getBlobUrl(image)}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        {selectedImages.includes(image) && (
                          <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </div>
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageDelete(image);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    );
  };

  const renderSettingsPanel = () => {
    const settingsMap = {
      text: 'Text Settings',
      canvas: 'Canvas Settings', 
      templates: 'Template Settings',
      images: 'Image Settings',
      variations: 'Variation Settings'
    };

    return (
      <div className="w-80 bg-panel border-r border-panel-border p-4 flex flex-col h-full">
        <h3 className="text-foreground text-lg font-medium mb-4">
          {settingsMap[activeSection as keyof typeof settingsMap]}
        </h3>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {activeSection === 'templates' ? (
            <div className="space-y-4">
              {/* Added Templates Section */}
              {addedTemplates.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Selected Templates</label>
                  <div className="space-y-2">
                    {addedTemplates.map((template) => (
                      <div key={template.id} className="bg-card border border-panel-border rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={template.image} 
                              alt={template.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">{template.title}</h4>
                            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                              <span>{template.size}</span>
                              <span>{template.category}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTemplate(template.id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            title="Remove template"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Template Button */}
              <Button
                onClick={handleAddTemplateToVariation}
                disabled={addedTemplates.length === 0}
                className="w-full h-7 text-xs"
                variant={addedTemplates.length > 0 ? "default" : "secondary"}
              >
                <Plus className="w-3 h-3 mr-1" />
                {addedTemplates.length > 0 
                  ? `Add ${addedTemplates.length} template${addedTemplates.length > 1 ? 's' : ''}`
                  : 'Add Template'
                }
              </Button>

              {/* Template Variation Cards */}
              {templateVariations.length > 0 && (
                <div className="bg-card border border-panel-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                    <FileImage className="w-4 h-4 text-primary" />
                    <span>Template Variations</span>
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {templateVariations.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {templateVariations.map((variation) => (
                      <div 
                        key={variation.id} 
                        className="bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                        onDoubleClick={() => handleDoubleClickTemplateVariation(variation)}
                        title="Double-click to add templates back to panel"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">{variation.description}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTemplateVariation(variation.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          {variation.templates.map((template) => (
                            <div key={template.id} className="w-8 h-8 rounded overflow-hidden">
                              <img 
                                src={template.image} 
                                alt={template.title}
                                className="w-full h-full object-cover"
                                title={template.title}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeSection === 'canvas' ? (
            <div className="space-y-4">
              <BackgroundPlugin />
              <PlacementPlugin 
                canvasWidth={canvasWidth}
                setCanvasWidth={setCanvasWidth}
                canvasHeight={canvasHeight}
                setCanvasHeight={setCanvasHeight}
                containers={containers}
                setContainers={setContainers}
                selectedContainer={selectedContainer}
                setSelectedContainer={setSelectedContainer}
              />
              
              {/* Combined Add to Variations Button */}
              <Button
                onClick={handleAddToVariation}
                disabled={selectedColors.length + selectedImages.length === 0}
                className="w-full h-7 text-xs"
                variant={selectedColors.length + selectedImages.length > 0 ? "default" : "secondary"}
              >
                <Plus className="w-3 h-3 mr-1" />
                {selectedColors.length + selectedImages.length > 0 
                  ? `Add ${selectedColors.length} colors, ${selectedImages.length} images, placements`
                  : 'Add Variation'
                }
              </Button>
              
              {/* Variation Cards Section - Outside of Background Plugin */}
              {backgroundVariations.length > 0 && (
                <div className="bg-card border border-panel-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                    <Shuffle className="w-4 h-4 text-primary" />
                    <span>Variations</span>
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {backgroundVariations.length}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {backgroundVariations.map((variation) => (
                      <div key={variation.id} className="bg-secondary rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {variation.colors.slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded border border-panel-border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {variation.colors.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{variation.colors.length - 3}</span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {variation.images.slice(0, 2).map((image, index) => (
                              <div key={index} className="w-4 h-4 rounded border border-panel-border overflow-hidden">
                                <img
                                  src={getBlobUrl(image)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {variation.images.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{variation.images.length - 2}</span>
                            )}
                          </div>
                          <span className="text-sm text-foreground">{variation.description}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariation(variation.id)}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeSection === 'variations' ? (
            <div className="space-y-4">
              {backgroundVariations.length > 0 && (
                <div className="bg-card border border-panel-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span>Background Variations</span>
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {backgroundVariations.length}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {backgroundVariations.map((variation) => (
                      <div key={variation.id} className="bg-secondary rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {variation.colors.slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded border border-panel-border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {variation.colors.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{variation.colors.length - 3}</span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {variation.images.slice(0, 2).map((image, index) => (
                              <div key={index} className="w-4 h-4 rounded border border-panel-border overflow-hidden">
                                <img
                                  src={getBlobUrl(image)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {variation.images.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{variation.images.length - 2}</span>
                            )}
                          </div>
                          <span className="text-sm text-foreground">{variation.description}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariation(variation.id)}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {templateVariations.length > 0 && (
                <div className="bg-card border border-panel-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                    <FileImage className="w-4 h-4 text-primary" />
                    <span>Template Variations</span>
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {templateVariations.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {templateVariations.map((variation) => (
                      <div 
                        key={variation.id} 
                        className="bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                        onDoubleClick={() => handleDoubleClickTemplateVariation(variation)}
                        title="Double-click to add templates back to panel"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">{variation.description}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTemplateVariation(variation.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          {variation.templates.map((template) => (
                            <div key={template.id} className="w-8 h-8 rounded overflow-hidden">
                              <img 
                                src={template.image} 
                                alt={template.title}
                                className="w-full h-full object-cover"
                                title={template.title}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
               {backgroundVariations.length === 0 && templateVariations.length === 0 && (
                 <div className="bg-card border border-panel-border rounded-lg p-4 text-center">
                   <Shuffle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                   <p className="text-sm text-muted-foreground mb-2">No variations created yet</p>
                   <p className="text-xs text-muted-foreground">Use the Canvas or Templates sections to create variations</p>
                 </div>
               )}
             </div>
           ) : (
             <div className="text-muted-foreground">
               <p className="text-sm">Settings panel ready for {activeSection} configuration.</p>
             </div>
           )}
         </div>

         {/* Send to Render Queue Button - Fixed at bottom for variations section */}
         {activeSection === 'variations' && (backgroundVariations.length > 0 || templateVariations.length > 0) && (
           <div className="flex-shrink-0 mt-6">
             <Button
               className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3"
               onClick={() => {
                 // TODO: Implement send to render queue functionality
                 console.log('Sending to render queue:', { backgroundVariations, templateVariations });
               }}
             >
               Send to Render Queue
             </Button>
             <p className="text-center text-xs text-muted-foreground mt-2">
               Total: {backgroundVariations.length + templateVariations.length} variations
             </p>
           </div>
         )}
       </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="h-12 bg-panel border-b border-panel-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">QP</span>
            </div>
            <span className="font-semibold text-foreground">QuickPixl</span>
          </div>
          <nav className="flex items-center space-x-4 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">File</button>
            <button className="hover:text-foreground transition-colors">Account</button>
            <button className="hover:text-foreground transition-colors">Help</button>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <Folder className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3rem)]">
        {/* Left Sidebar */}
        <div className="w-16 bg-panel border-r border-panel-border flex flex-col items-center py-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Settings Panel */}
        {renderSettingsPanel()}

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-hidden">
          {activeSection === 'canvas' ? (
            <CanvasEditor 
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              containers={containers}
              setContainers={setContainers}
              selectedContainer={selectedContainer}
              setSelectedContainer={setSelectedContainer}
            />
          ) : (
            <div className="p-6 overflow-auto h-full">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">S</span>
                      <div className="w-20 h-1 bg-secondary rounded relative">
                        <div className="absolute left-1/2 w-3 h-3 bg-primary rounded-full -top-1 transform -translate-x-1/2"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">L</span>
                    </div>
                    <span className="text-sm text-muted-foreground ml-4">Background</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="secondary" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground p-2"
                      onClick={() => setIsSearchVisible(!isSearchVisible)}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Search Field - appears when search icon is clicked */}
                {isSearchVisible && (
                  <div className="mb-4">
                    <div className="relative max-w-sm">
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8 pl-3 pr-8 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                        onClick={() => {
                          setIsSearchVisible(false);
                          setSearchQuery('');
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-4 gap-4">
                {/* Render folders first */}
                {folders.map((folder) => (
                  <div 
                    key={folder.id}
                    className="bg-card rounded-lg overflow-hidden border cursor-pointer transition-all hover:border-primary border-panel-border"
                    onClick={() => {
                      // TODO: Handle folder click - could show folder contents
                      console.log('Folder clicked:', folder.name);
                    }}
                  >
                    <div className="aspect-square flex items-center justify-center bg-muted/30">
                      <Folder className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-foreground mb-1">{folder.name}</h4>
                      <div className="text-xs text-muted-foreground">
                        {folder.templateCount} templates
                      </div>
                    </div>
                  </div>
                ))}

                {/* Then render existing templates */}
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`bg-card rounded-lg overflow-hidden border cursor-pointer transition-all hover:border-primary ${
                      selectedTemplates.includes(template.id) ? 'border-primary ring-2 ring-primary/20' : 'border-panel-border'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={template.image} 
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-foreground mb-1">{template.title}</h4>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{template.size}</span>
                        <span>{template.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Render Queue */}
        <div className="w-80 bg-panel border-l border-panel-border p-4 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-foreground mb-4">Render Queue</h3>
            <Button 
              className="w-full mb-4" 
              variant="secondary"
              onClick={() => console.log('Add Selection')}
            >
              + Add Selection
            </Button>
            <div className="flex space-x-2 mb-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => console.log('Clear All')}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => console.log('Remove Last')}
              >
                Remove Last
              </Button>
            </div>
            <div className="flex space-x-2 mb-6">
              <Button variant="secondary" size="sm" className="flex-1">
                💾 Save
              </Button>
              <Button variant="secondary" size="sm" className="flex-1">
                📁 Load
              </Button>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">AMEN</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">5 variations</span>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">COLORS</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">12 variations</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">HUMAN</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">8 variations</span>
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Start Rendering Button - Always at bottom */}
          <div className="flex-shrink-0 mt-6">
            <Button 
              className="w-full bg-green-600 hover:bg-green-600/90 text-white font-medium py-3"
              onClick={() => console.log('Start Rendering')}
            >
              ▶ Start Rendering
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Total: 25 images
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPixl;