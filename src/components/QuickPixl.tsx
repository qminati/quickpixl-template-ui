import React, { useState, useRef } from 'react';
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
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const QuickPixl = () => {
  const [activeSection, setActiveSection] = useState('templates');
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  
  // Background Plugin State
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [backgroundVariations, setBackgroundVariations] = useState<Variation[]>([]);
  const [isBackgroundExpanded, setIsBackgroundExpanded] = useState(true);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

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
    console.log('Template selected:', templateId);
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
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
        setIsEyedropperActive(false);
      } catch (e) {
        setIsEyedropperActive(false);
        console.log('Eyedropper cancelled');
      }
    } else {
      console.log('EyeDropper API not supported');
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
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
          onClick={() => setIsBackgroundExpanded(!isBackgroundExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Background</span>
            {totalSelected > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {totalSelected}
              </span>
            )}
          </div>
          {isBackgroundExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        {isBackgroundExpanded && (
          <div className="p-4 pt-0 space-y-6">
            {/* Color Selection */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Colors</h4>
              
              {/* Color Picker and Eyedropper */}
              <div className="flex flex-col space-y-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-secondary rounded-lg p-2 flex-1 min-w-0">
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-panel-border cursor-pointer flex-shrink-0"
                    />
                    <div className="flex items-center space-x-1 flex-1 min-w-0">
                      <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(e) => setCurrentColor(e.target.value)}
                        className="bg-transparent text-sm text-foreground border-none outline-none flex-1 min-w-0"
                        placeholder="#FF6B6B"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEyedropper}
                    disabled={isEyedropperActive}
                    className="p-2 flex-shrink-0"
                    title="Pick color from screen"
                  >
                    <Pipette className={`w-4 h-4 ${isEyedropperActive ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddColor}
                  disabled={!currentColor || selectedColors.includes(currentColor)}
                  className="w-full"
                >
                  Add Color
                </Button>
              </div>

              {/* Selected Colors */}
              {selectedColors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((color) => (
                      <div 
                        key={color}
                        className="group flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-2 py-1 rounded text-xs transition-colors"
                      >
                        <div 
                          className="w-4 h-4 rounded border border-panel-border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-foreground font-mono">{color}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveColor(color)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-4 w-4 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Images</h4>
              <div className="border-2 border-dashed border-panel-border rounded-lg p-4 text-center hover:border-muted-foreground transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                </label>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div 
                        className={`aspect-square rounded border-2 cursor-pointer transition-all ${
                          selectedImages.includes(image)
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-panel-border hover:border-muted-foreground'
                        }`}
                        onClick={() => handleImageSelect(image)}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        {selectedImages.includes(image) && (
                          <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
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
                        className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add to Variation Button */}
            <Button
              onClick={handleAddToVariation}
              disabled={totalSelected === 0}
              className="w-full"
              variant={totalSelected > 0 ? "default" : "secondary"}
            >
              {totalSelected > 0 
                ? `Add ${selectedColors.length} colors, ${selectedImages.length} images to variation`
                : 'Select colors or images to add'
              }
            </Button>

            {/* Variation Cards */}
            {backgroundVariations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Variations</h4>
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
                              src={URL.createObjectURL(image)}
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
            )}
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
      <div className="w-80 bg-panel border-r border-panel-border p-4">
        <h3 className="text-foreground text-lg font-medium mb-4">
          {settingsMap[activeSection as keyof typeof settingsMap]}
        </h3>
        <div className="space-y-4">
          {activeSection === 'canvas' ? (
            <BackgroundPlugin />
          ) : activeSection === 'variations' ? (
            <div className="space-y-4">
              {backgroundVariations.length > 0 ? (
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
                                  src={URL.createObjectURL(image)}
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
              ) : (
                <div className="bg-card border border-panel-border rounded-lg p-4 text-center">
                  <Palette className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No variations created yet</p>
                  <p className="text-xs text-muted-foreground">Use the Canvas section to create background variations</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground">
              <p className="text-sm">Settings panel ready for {activeSection} configuration.</p>
            </div>
          )}
        </div>
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
        <div className="flex-1 p-6 overflow-auto">
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
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-4 gap-4">
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

        {/* Right Sidebar - Render Queue */}
        <div className="w-80 bg-panel border-l border-panel-border p-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Render Queue</h3>
            <Button 
              className="w-full mb-4" 
              variant="secondary"
              onClick={() => console.log('Add Selection')}
            >
              + Add Selection
            </Button>
            <div className="flex justify-between text-sm mb-4">
              <button 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => console.log('Clear All')}
              >
                Clear All
              </button>
              <button 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => console.log('Remove Last')}
              >
                Remove Last
              </button>
            </div>
            <div className="flex space-x-2 mb-6">
              <Button variant="secondary" size="sm" className="flex-1">
                💾 Save
              </Button>
              <Button variant="secondary" size="sm" className="flex-1">
                📁 Load
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4 mb-8">
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
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">HUMAN</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">8 variations</span>
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
            </div>
            {backgroundVariations.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">BACKGROUND</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">{backgroundVariations.length} variations</span>
                  <Palette className="w-4 h-4 text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Start Rendering Button */}
          <Button 
            className="w-full bg-success hover:bg-success/90 text-white font-medium py-3"
            onClick={() => console.log('Start Rendering')}
          >
            ▶ Start Rendering
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Total: {25 + backgroundVariations.length} images
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickPixl;