import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Search,
  Shapes,
  RotateCw,
  ALargeSmall,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PlacementPlugin from './PlacementPlugin';
import CanvasEditor from './CanvasEditor';
import ErrorBoundary from './ErrorBoundary';
import TextEditor from './TextEditor';
import { validateImage, handleImageError, createImageFallback } from '@/utils/imageUtils';
import { toast } from 'sonner';
import { Container, Variation, Template, TemplateVariation, FontVariation, TypographySettings, TypographyVariation, ShapeSettings, TextShapeVariation, RotateFlipSettings, RotateFlipVariation, ColorFillSettings, ColorFillVariation, StrokeSettings, StrokesVariation, CharacterEffectsSettings, CharacterEffectsVariation, ImageEffectsSettings, ImageEffectsVariation, AnyVariation } from '@/types/interfaces';
import TypographyPlugin from './TypographyPlugin';
import TextShapePlugin from './TextShapePlugin';
import RotateFlipPlugin from './RotateFlipPlugin';
import ColorFillPlugin from './ColorFillPlugin';
import StrokesPlugin from './StrokesPlugin';
import TextBackgroundPlugin from './TextBackgroundPlugin';
import CharacterEffectsPlugin from './CharacterEffectsPlugin';
import ImageEffectsPlugin from './ImageEffectsPlugin';
import VariationDetailView from './VariationDetailView';
import TabSettings from './TabSettings';
import useTabSettings from '@/hooks/useTabSettings';

// Import merchandise-style template images
import merchFocusGood from '@/assets/merch-focus-good.jpg';
import merchBeLight from '@/assets/merch-be-light.jpg';
import merchBowling from '@/assets/merch-bowling.jpg';
import merchDiamonds from '@/assets/merch-diamonds.jpg';
import merchGiveThanks from '@/assets/merch-give-thanks.jpg';
import merchSpareEffort from '@/assets/merch-spare-effort.jpg';
import merchTouchdown from '@/assets/merch-touchdown.jpg';
import merchInspirational from '@/assets/merch-inspirational.jpg';

const templates = [
  {
    id: 1,
    title: "Focus on the Good",
    size: "1080×1080",
    image: merchFocusGood,
    category: "TX: 1  IM: 0"
  },
  {
    id: 2,
    title: "Bowling Strike",
    size: "1200×800",
    image: merchBowling,
    category: "TX: 2  IM: 1"
  },
  {
    id: 3,
    title: "No Spare Effort",
    size: "1080×1080",
    image: merchSpareEffort,
    category: "TX: 1  IM: 0"
  },
  {
    id: 4,
    title: "Diamonds & Dreams",
    size: "1200×1200",
    image: merchDiamonds,
    category: "TX: 3  IM: 1"
  },
  {
    id: 5,
    title: "Be The Light",
    size: "800×1200",
    image: merchBeLight,
    category: "TX: 1  IM: 0"
  },
  {
    id: 6,
    title: "Give Thanks",
    size: "1080×1350",
    image: merchGiveThanks,
    category: "TX: 1  IM: 0"
  },
  {
    id: 7,
    title: "Dream Big Work Hard",
    size: "1080×1080",
    image: merchInspirational,
    category: "TX: 1  IM: 0"
  },
  {
    id: 8,
    title: "Touchdown",
    size: "1200×900",
    image: merchTouchdown,
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
  
  // Canvas and Placement State
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
  
  // Text Settings Tab Management
  const [textInputCount, setTextInputCount] = useState(3);
  const tabSettings = useTabSettings(textInputCount);

  // Plugin states using tab settings
  const getTypographySettings = (): TypographySettings => {
    return tabSettings.getSettings('typography', {
      bold: false,
      italic: false,
      underline: false,
      textCase: 'normal' as 'normal' | 'uppercase' | 'lowercase',
      letterSpacing: 0,
      wordSpacing: 0,
      textAlign: 'center' as 'left' | 'center' | 'right' | 'justify',
      textStroke: false,
      strokeWidth: 1,
      strokeColor: '#000000'
    });
  };

  const setTypographySettings = (settings: TypographySettings) => {
    tabSettings.setSettings('typography', settings);
  };

  // Simplified TextEditor section
  const renderMainContent = () => {
    if (activeSection === 'text') {
      return (
        <div className="h-full flex">
          {/* Settings Panel with Tabs */}
          <div className="w-80 bg-panel border-r border-panel-border flex flex-col">
            <TabSettings
              currentTab={tabSettings.currentTab}
              onTabChange={tabSettings.setCurrentTab}
              tabs={tabSettings.tabs}
              onAddTab={() => tabSettings.addTab()}
              onRemoveTab={tabSettings.removeTab}
              hasCustomSettings={tabSettings.hasCustomSettings}
            />
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <TypographyPlugin
                isExpanded={true}
                onToggleExpanded={() => {}}
                settings={getTypographySettings()}
                onSettingsChange={setTypographySettings}
                onAddVariation={() => {}}
              />
            </div>
          </div>

          {/* TextEditor */}
          <div className="flex-1">
            <TextEditor 
              onSubmitVariation={() => {}}
              lastSelectedFont="Inter, sans-serif"
              typographySettings={getTypographySettings()}
              onInputSettingsClick={(inputIndex) => {
                const tabId = `TI${inputIndex + 1}`;
                tabSettings.setCurrentTab(tabId);
              }}
              onInputDuplicate={(inputIndex) => {
                const sourceTabId = `TI${inputIndex + 1}`;
                const newInputIndex = textInputCount;
                const newTabId = `TI${newInputIndex + 1}`;
                setTextInputCount(prev => prev + 1);
                tabSettings.duplicateTabSettings(sourceTabId, newTabId);
              }}
              inputSettingsIndicators={Object.fromEntries(
                Array.from({ length: textInputCount }, (_, i) => [
                  i, tabSettings.hasCustomSettings(`TI${i + 1}`)
                ])
              )}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Select Text Section</h3>
          <p className="text-sm">Click on "Text" in the sidebar to see the tabbed settings system</p>
        </div>
      </div>
    );
  };

  // Sidebar items
  const sidebarItems = [
    { id: 'canvas', icon: Layers, label: 'Canvas' },
    { id: 'templates', icon: FileImage, label: 'Templates' },
    { id: 'images', icon: ImageIcon, label: 'Images' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'variations', icon: Shuffle, label: 'Variations' }
  ];

  return (
    <ErrorBoundary>
      <div className="h-screen flex bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <div className="w-16 bg-panel border-r border-panel-border flex flex-col items-center py-4 space-y-2 z-10">
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

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuickPixl;