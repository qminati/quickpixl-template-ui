import React, { useState } from 'react';
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
  AlertTriangle
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
          <div className="space-y-4 text-muted-foreground">
            <p className="text-sm">Settings panel ready for {activeSection} configuration.</p>
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
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm">+ New</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">🗑 Delete</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">✏️ Edit</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">📄 Duplicate</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">📁 Folder</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">🔄 Refresh</Button>
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
          </div>

          {/* Start Rendering Button */}
          <Button 
            className="w-full bg-success hover:bg-success/90 text-white font-medium py-3"
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
  );
};

export default QuickPixl;