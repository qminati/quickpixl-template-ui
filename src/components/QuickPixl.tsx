import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  Sliders,
  Settings as SettingsIcon,
  Copy as CopyIcon,
  X as XIcon,
  Droplets,
  Paintbrush
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlacementPlugin from './PlacementPlugin';
import CanvasEditor from './CanvasEditor';
import ErrorBoundary from './ErrorBoundary';
import TextEditor from './TextEditor';
import ImageEditor from './ImageEditor';
import { validateImage, handleImageError, createImageFallback } from '@/utils/imageUtils';
import { toast } from 'sonner';
import { Container, Variation, Template, TemplateVariation, FontVariation, TypographySettings, TypographyVariation, ShapeSettings, TextShapeVariation, RotateFlipSettings, RotateFlipVariation, ColorFillSettings, ColorFillVariation, ImageColorFillSettings, ImageColorFillVariation, StrokeSettings, StrokesVariation, ImageStrokeSettings, ImageStrokesVariation, CharacterEffectsSettings, CharacterEffectsVariation, ImageEffectsSettings, ImageEffectsVariation, DropShadowSettings, DropShadowVariation, ImageInput, ImageInputSettings, AnyVariation } from '@/types/interfaces';
import TypographyPlugin from './TypographyPlugin';
import TextShapePlugin from './TextShapePlugin';
import RotateFlipPlugin from './RotateFlipPlugin';
import ColorFillPlugin from './ColorFillPlugin';
import StrokesPlugin from './StrokesPlugin';
import DropShadowPlugin from './DropShadowPlugin';
import TextBackgroundPlugin from './TextBackgroundPlugin';
import CharacterEffectsPlugin from './CharacterEffectsPlugin';
import ImageEffectsPlugin from './ImageEffectsPlugin';
import ImageColorFillPlugin from './ImageColorFillPlugin';
import ImageStrokesPlugin from './ImageStrokesPlugin';
import ImageRotateFlipPlugin from './ImageRotateFlipPlugin';
import ImageBackgroundPlugin from './ImageBackgroundPlugin';
import VariationDetailView from './VariationDetailView';

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
  
  // Refs for auto-scrolling
  const leftSettingsRef = useRef<HTMLDivElement | null>(null);
  const variationsRef = useRef<HTMLDivElement | null>(null);
  
  // Template Settings State
  const [addedTemplates, setAddedTemplates] = useState<Template[]>([]);
  const [templateVariations, setTemplateVariations] = useState<TemplateVariation[]>([]);
  const [templateBackgroundColor, setTemplateBackgroundColor] = useState('#000000');
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [blobUrls, setBlobUrls] = useState<Map<File, string>>(new Map());
  
  // Fonts Plugin State
  const [isFontsExpanded, setIsFontsExpanded] = useState(true);
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [fontVariations, setFontVariations] = useState<FontVariation[]>([]);
  const [lastSelectedFont, setLastSelectedFont] = useState<string>('Inter, sans-serif');
  
  // Typography Plugin State
  const [isTypographyExpanded, setIsTypographyExpanded] = useState(true);
  const [typographySettings, setTypographySettings] = useState<TypographySettings>({
    bold: false,
    italic: false,
    underline: false,
    textCase: 'normal',
    letterSpacing: 0,
    wordSpacing: 0,
    textAlign: 'center',
    textStroke: false,
    strokeWidth: 1,
    strokeColor: '#000000'
  });
  const [typographyVariations, setTypographyVariations] = useState<TypographyVariation[]>([]);
  
  // Text Shape Plugin State
  const [isTextShapeExpanded, setIsTextShapeExpanded] = useState(true);
  const [selectedShape, setSelectedShape] = useState<keyof ShapeSettings>('none');
  const [shapeSettings, setShapeSettings] = useState<ShapeSettings>({
    none: null,
    circle: { radius: 100, startAngle: 0, direction: 'clockwise' },
    arc: { radius: 150, arcAngle: 90, flip: false },
    arch: { height: 30, curve: 50 },
    angle: { angle: 0, skew: 0 },
    flag: { waveHeight: 20, waveLength: 100, reverse: false },
    wave: { amplitude: 20, frequency: 3, phase: 0 },
    distort: {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
      intensity: 50
    }
  });
  const [textShapeVariations, setTextShapeVariations] = useState<TextShapeVariation[]>([]);
  
  // Rotate & Flip Settings State
  const [rotateFlipSettings, setRotateFlipSettings] = useState<RotateFlipSettings>({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false
  });
  const [rotateFlipVariations, setRotateFlipVariations] = useState<RotateFlipVariation[]>([]);
  
  // Rotate & Flip Plugin State
  const [isRotateFlipExpanded, setIsRotateFlipExpanded] = useState(true);
  
  // Color & Fill Plugin State
  const [isColorFillExpanded, setIsColorFillExpanded] = useState(true);
  
  // Text Background Plugin State
  const [isTextBackgroundExpanded, setIsTextBackgroundExpanded] = useState(true);
  
  const [colorFillSettings, setColorFillSettings] = useState<ColorFillSettings>({
    mode: 'solid',
    solid: { color: '#000000' },
    gradient: {
      type: 'linear',
      angle: 0,
      stops: [
        { id: '1', color: '#000000', position: 0 },
        { id: '2', color: '#ffffff', position: 100 }
      ]
    },
    palette: {
      source: 'rgb',
      colors: [],
      componentInput: 1,
      randomize: false
    },
    image: {
      mode: 'single',
      images: [],
      opacity: 100,
      randomize: false
    }
  });
  const [colorFillVariations, setColorFillVariations] = useState<ColorFillVariation[]>([]);
  
  // Strokes Plugin State
  const [isStrokesExpanded, setIsStrokesExpanded] = useState(true);
  const [strokesSettings, setStrokesSettings] = useState<StrokeSettings>({
    regular: { strokes: [] },
    character: {
      strokes: [],
      differentStrokePerCharacter: false,
      perCharacterTransforms: {
        widthScale: 100,
        heightScale: 100,
        rotation: 0,
        xOffset: 0,
        yOffset: 0
      },
      randomizeTransforms: false
    },
    container: {
      strokes: []
    },
    knockout: {
      enabled: false,
      size: 2
    }
  });
  const [strokesVariations, setStrokesVariations] = useState<StrokesVariation[]>([]);

  // Character Effects Plugin State
  const [isCharacterEffectsExpanded, setIsCharacterEffectsExpanded] = useState(true);
  const [characterEffectsSettings, setCharacterEffectsSettings] = useState<CharacterEffectsSettings>({
    characters: [{ width: 100, height: 100, verticalOffset: 0, rotation: 0 }],
    rotationMode: 'individual',
    alignment: 'none'
  });
  const [characterEffectsVariations, setCharacterEffectsVariations] = useState<CharacterEffectsVariation[]>([]);

  // Drop Shadow Plugin State
  const [isDropShadowExpanded, setIsDropShadowExpanded] = useState(true);
  const [dropShadowSettings, setDropShadowSettings] = useState<DropShadowSettings>({
    mode: 'regular',
    regular: { shadows: [] },
    character: { characters: [] }
  });
  const [dropShadowVariations, setDropShadowVariations] = useState<DropShadowVariation[]>([]);

  // Image Input State (for ImageEditor)
  const [imageInputs, setImageInputs] = useState<ImageInput[]>([
    { id: 'II1', selectedImages: [], selectionMode: 'multiple' }
  ]);
  const [imageInputVariations, setImageInputVariations] = useState<Variation[]>([]);

  // Image Effects Plugin State
  const [isImageEffectsExpanded, setIsImageEffectsExpanded] = useState(true);
  const [imageEffectsSettings, setImageEffectsSettings] = useState<ImageEffectsSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    vibrance: 0,
    hue: 0,
    colorize: false,
    grayscale: false,
    invert: false
  });
  const [imageEffectsVariations, setImageEffectsVariations] = useState<ImageEffectsVariation[]>([]);
  
  // Image Color & Fill Plugin State
  const [isImageColorFillExpanded, setIsImageColorFillExpanded] = useState(true);
  const [imageColorFillSettings, setImageColorFillSettings] = useState<ImageColorFillSettings>({
    mode: 'solid',
    solid: { color: '#000000' },
    gradient: {
      type: 'linear',
      angle: 0,
      stops: [
        { id: '1', color: '#000000', position: 0 },
        { id: '2', color: '#ffffff', position: 100 }
      ]
    },
    image: {
      mode: 'single',
      images: [],
      opacity: 100,
      randomize: false
    }
  });
  const [imageColorFillVariations, setImageColorFillVariations] = useState<ImageColorFillVariation[]>([]);
  
  // Image Strokes Plugin State
  const [isImageStrokesExpanded, setIsImageStrokesExpanded] = useState(true);
  const [imageStrokesSettings, setImageStrokesSettings] = useState<ImageStrokeSettings>({
    regular: { strokes: [] },
    container: { strokes: [] },
    knockout: { enabled: false, size: 2 }
  });
  const [imageStrokesVariations, setImageStrokesVariations] = useState<ImageStrokesVariation[]>([]);
  
  // Image Rotate & Flip Plugin State
  const [isImageRotateFlipExpanded, setIsImageRotateFlipExpanded] = useState(true);
  const [imageRotateFlipSettings, setImageRotateFlipSettings] = useState<RotateFlipSettings>({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false
  });
  const [imageRotateFlipVariations, setImageRotateFlipVariations] = useState<RotateFlipVariation[]>([]);
  
  // Image Background Plugin State
  const [isImageBackgroundExpanded, setIsImageBackgroundExpanded] = useState(true);
  const [imageBackgroundVariations, setImageBackgroundVariations] = useState<Variation[]>([]);
  
  // Search State
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Variation Detail View State
  const [selectedVariation, setSelectedVariation] = useState<AnyVariation | null>(null);
  const [selectedVariationType, setSelectedVariationType] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Text Settings Tabs (safe scaffolding) ---
  type TextTabId = 'GLOBAL' | `TI${number}`;
  const [textTabs, setTextTabs] = React.useState<TextTabId[]>(['GLOBAL', 'TI1']);
  const [activeTextTab, setActiveTextTab] = React.useState<TextTabId>('GLOBAL');

  // --- Image Settings Tabs ---
  type ImageTabId = 'GLOBAL' | `II${number}`;
  const [imageTabs, setImageTabs] = React.useState<ImageTabId[]>(['GLOBAL', 'II1']);
  const [activeImageTab, setActiveImageTab] = React.useState<ImageTabId>('GLOBAL');

  // simple util: does a tab exist?
  const ensureTab = (id: TextTabId) => {
    setTextTabs(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const ensureImageTab = (id: ImageTabId) => {
    setImageTabs(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  // delete tab handler
  const deleteTab = (id: TextTabId) => {
    if (id === 'GLOBAL') return; // Cannot delete GLOBAL tab
    
    setTextTabs(prev => {
      const filtered = prev.filter(tabId => tabId !== id);
      
      // If we're deleting the active tab, switch to GLOBAL or previous tab
      if (activeTextTab === id) {
        setActiveTextTab('GLOBAL');
      }
      
      return filtered;
    });
  };

  const deleteImageTab = (id: ImageTabId) => {
    if (id === 'GLOBAL') return; // Cannot delete GLOBAL tab
    
    setImageTabs(prev => {
      const filtered = prev.filter(tabId => tabId !== id);
      
      // If we're deleting the active tab, switch to GLOBAL or previous tab
      if (activeImageTab === id) {
        setActiveImageTab('GLOBAL');
      }
      
      return filtered;
    });
  };

  // Enhanced cleanup function for blob URLs with better error handling
  useEffect(() => {
    return () => {
      // Clean up all blob URLs on unmount
      blobUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('Failed to revoke blob URL:', error);
        }
      });
      setBlobUrls(new Map()); // Clear the map on unmount
    };
  }, []); // Empty dependency array, only cleanup on unmount

  // Helper to safely get blob URL with cleanup tracking and error handling
  const getBlobUrl = useCallback((file: File): string => {
    if (!file || !(file instanceof File)) {
      console.error('Invalid file provided to getBlobUrl');
      return createImageFallback();
    }

    // Check if we already have a URL for this file
    const existingUrl = blobUrls.get(file);
    if (existingUrl) {
      return existingUrl;
    }
    
    try {
      // Create new URL and track it
      const url = URL.createObjectURL(file);
      setBlobUrls(prev => {
        const newMap = new Map(prev);
        newMap.set(file, url);
        return newMap;
      });
      return url;
    } catch (error) {
      console.error('Failed to create blob URL:', error);
      return createImageFallback();
    }
  }, []); // Remove blobUrls dependency to prevent infinite re-renders

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

  const handleTemplateSelect = useCallback((templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template && !addedTemplates.find(t => t.id === templateId)) {
      setAddedTemplates(prev => [...prev, template]);
    }
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, [addedTemplates]);

  // Template Settings Handlers - optimized with useCallback
  const handleRemoveTemplate = useCallback((templateId: number) => {
    setAddedTemplates(prev => prev.filter(t => t.id !== templateId));
  }, []);

  const handleAddTemplateToVariation = useCallback(() => {
    if (addedTemplates.length === 0) return;
    
    const newVariation: TemplateVariation = {
      id: `template-variation-${Date.now()}`,
      templates: [...addedTemplates],
      description: `${addedTemplates.length} template${addedTemplates.length > 1 ? 's' : ''}`
    };
    
    setTemplateVariations(prev => [...prev, newVariation]);
    // Clear added templates after adding to variation
    setAddedTemplates([]);
  }, [addedTemplates]);

  const handleRemoveTemplateVariation = useCallback((variationId: string) => {
    setTemplateVariations(prev => prev.filter(v => v.id !== variationId));
  }, []);

  const handleDoubleClickTemplateVariation = useCallback((variation: TemplateVariation) => {
    // Add the templates from this variation back to the added templates
    const templatesNotAlreadyAdded = variation.templates.filter(
      template => !addedTemplates.find(t => t.id === template.id)
    );
    setAddedTemplates(prev => [...prev, ...templatesNotAlreadyAdded]);
  }, [addedTemplates]);

  // Background Plugin Handlers - optimized with useCallback
  const handleAddColor = useCallback(() => {
    if (currentColor && !selectedColors.includes(currentColor)) {
      setSelectedColors(prev => [...prev, currentColor]);
    }
  }, [currentColor, selectedColors]);

  const handleRemoveColor = useCallback((colorToRemove: string) => {
    setSelectedColors(prev => prev.filter(color => color !== colorToRemove));
  }, []);

  const handleEyedropper = useCallback(async () => {
    if (typeof window === 'undefined' || !window.EyeDropper) {
      toast.error('Eyedropper not supported in this browser');
      return;
    }
    
    setIsEyedropperActive(true);
    
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      if (result?.sRGBHex) {
        setCurrentColor(result.sRGBHex);
        if (colorInputRef.current) {
          colorInputRef.current.value = result.sRGBHex;
        }
        toast.success(`Color picked: ${result.sRGBHex}`);
      } else {
        toast.info('No color was selected');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Eyedropper error:', error);
        toast.error('Failed to pick color. Please try again.');
      }
      // AbortError is expected when user cancels, so we don't show an error
    } finally {
      setIsEyedropperActive(false);
    }
  }, []);

  // Add loading state for image uploads
  const [isUploading, setIsUploading] = useState(false);

  // Enhanced file upload handler with better error handling and loading states
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const validFiles: File[] = [];
    let hasErrors = false;

    try {
      for (const file of files) {
        if (!file) continue;
        
        try {
          const validation = await validateImage(file);
          if (validation.isValid) {
            validFiles.push(file);
          } else {
            hasErrors = true;
            toast.error(`${file.name}: ${validation.error}`);
          }
        } catch (validationError) {
          hasErrors = true;
          console.error('File validation error:', validationError);
          toast.error(`Failed to validate ${file.name}`);
        }
      }

      if (validFiles.length > 0) {
        try {
          setUploadedImages(prev => {
            // Prevent duplicate files
            const existingNames = new Set(prev.map(f => f.name));
            const uniqueFiles = validFiles.filter(f => !existingNames.has(f.name));
            return [...prev, ...uniqueFiles];
          });
          
          setSelectedImages(prev => {
            const existingNames = new Set(prev.map(f => f.name));
            const uniqueFiles = validFiles.filter(f => !existingNames.has(f.name));
            return [...prev, ...uniqueFiles];
          });
          
          toast.success(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} uploaded successfully!`);
        } catch (updateError) {
          console.error('Failed to update state with new images:', updateError);
          toast.error('Failed to process uploaded images');
        }
      }

      if (hasErrors && validFiles.length === 0) {
        toast.error('No valid images could be uploaded');
      }
    } catch (error) {
      console.error('Upload process failed:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the input to allow re-uploading the same file
      event.target.value = '';
    }
  };

  const handleImageSelect = useCallback((image: File) => {
    setSelectedImages(prev => 
      prev.includes(image) 
        ? prev.filter(img => img !== image)
        : [...prev, image]
    );
  }, []);

  const handleImageDelete = useCallback((imageToDelete: File) => {
    if (!imageToDelete || !(imageToDelete instanceof File)) {
      console.warn('Invalid file provided to handleImageDelete');
      return;
    }

    try {
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
      
      // Remove from uploaded and selected images
      setUploadedImages(prev => prev.filter(img => img !== imageToDelete));
      setSelectedImages(prev => prev.filter(img => img !== imageToDelete));
      
      toast.success('Image removed successfully');
     } catch (error) {
       console.error('Error deleting image:', error);
       toast.error('Failed to remove image');
     }
  }, [blobUrls]);

  // Performance optimizations with useMemo
  const totalVariations = useMemo(() => 
    backgroundVariations.length + 
    templateVariations.length + 
    fontVariations.length + 
    typographyVariations.length + 
    textShapeVariations.length + 
    rotateFlipVariations.length + 
    colorFillVariations.length + 
    strokesVariations.length + 
    characterEffectsVariations.length + 
    imageEffectsVariations.length + 
    imageInputVariations.length + 
    dropShadowVariations.length
  , [
    backgroundVariations.length, 
    templateVariations.length, 
    fontVariations.length, 
    typographyVariations.length,
    textShapeVariations.length,
    rotateFlipVariations.length,
    colorFillVariations.length,
    strokesVariations.length,
    characterEffectsVariations.length,
    imageEffectsVariations.length,
    imageRotateFlipVariations.length,
    imageBackgroundVariations.length,
    imageInputVariations.length,
    dropShadowVariations.length
  ]);

  const hasAnyVariations = useMemo(() => totalVariations > 0, [totalVariations]);

  // Optimized variation description generators
  const generateBackgroundVariationDescription = useCallback((colors: string[], images: File[]) => {
    const parts: string[] = [];
    if (colors.length > 0) parts.push(`${colors.length} color${colors.length > 1 ? 's' : ''}`);
    if (images.length > 0) parts.push(`${images.length} image${images.length > 1 ? 's' : ''}`);
    return parts.join(' + ') || 'Background variation';
  }, []);

  const generateImageEffectsDescription = useCallback((settings: ImageEffectsSettings) => {
    const effects: string[] = [];
    if (settings.brightness !== 0) effects.push(`brightness(${settings.brightness > 0 ? '+' : ''}${settings.brightness})`);
    if (settings.contrast !== 0) effects.push(`contrast(${settings.contrast > 0 ? '+' : ''}${settings.contrast})`);
    if (settings.saturation !== 0) effects.push(`saturation(${settings.saturation > 0 ? '+' : ''}${settings.saturation})`);
    if (settings.vibrance !== 0) effects.push(`vibrance(${settings.vibrance > 0 ? '+' : ''}${settings.vibrance})`);
    if (settings.hue !== 0) effects.push(`hue(${settings.hue > 0 ? '+' : ''}${settings.hue}°)`);
    if (settings.grayscale) effects.push('grayscale');
    if (settings.colorize) effects.push('colorize');
    if (settings.invert) effects.push('invert');
    return effects.length > 0 ? effects.join(', ') : 'Visual effects';
  }, []);

  const handleAddToVariation = useCallback(() => {
    if (selectedColors.length === 0 && selectedImages.length === 0) {
      toast.info('Please select colors or images before creating a variation');
      return;
    }
    
    try {
      const newVariation: Variation = {
        id: Date.now().toString(),
        colors: [...selectedColors],
        images: [...selectedImages],
        description: `${selectedColors.length} colors, ${selectedImages.length} images`
      };
      
      setBackgroundVariations(prev => [...prev, newVariation]);
      setSelectedColors([]);
      setSelectedImages([]);
      toast.success('Background variation added successfully');
     } catch (error) {
       console.error('Failed to create variation:', error);
       toast.error('Failed to create variation');
     }
   }, [selectedColors, selectedImages, generateBackgroundVariationDescription]);

  const handleSubmitVariation = (texts: string[]) => {
    // Handle text variation submission logic here
  };

  const handleRemoveVariation = (variationId: string) => {
    setBackgroundVariations(prev => prev.filter(v => v.id !== variationId));
  };

  // Fonts Plugin Handlers - optimized with useCallback
  const handleFontSelect = useCallback((fontFamily: string) => {
    setLastSelectedFont(fontFamily);
    setSelectedFonts(prev => 
      prev.includes(fontFamily) 
        ? prev.filter(font => font !== fontFamily)
        : [...prev, fontFamily]
    );
  }, []);

  const handleAddFontsToVariation = useCallback(() => {
    if (selectedFonts.length === 0) return;
    
    const newFontVariation: FontVariation = {
      id: `font-variation-${Date.now()}`,
      fonts: [...selectedFonts],
      description: `${selectedFonts.length} font${selectedFonts.length > 1 ? 's' : ''}`
    };
    
    setFontVariations(prev => [...prev, newFontVariation]);
    setSelectedFonts([]);
    toast.success(`${newFontVariation.fonts.length} font${newFontVariation.fonts.length > 1 ? 's' : ''} added to variation`);
  }, [selectedFonts]);

  const handleRemoveFontVariation = useCallback((variationId: string) => {
    setFontVariations(prev => prev.filter(v => v.id !== variationId));
  }, []);

  // Typography Plugin Handlers - optimized with useCallback
  const generateTypographyDescription = useCallback((settings: TypographySettings): string => {
    const features = [];
    if (settings.bold) features.push('Bold');
    if (settings.italic) features.push('Italic');
    if (settings.underline) features.push('Underline');
    if (settings.textCase !== 'normal') features.push(settings.textCase);
    if (settings.textStroke) features.push('Stroke');
    if (settings.letterSpacing !== 0) features.push(`Letter: ${settings.letterSpacing}px`);
    if (settings.wordSpacing !== 0) features.push(`Word: ${settings.wordSpacing}px`);
    
    return features.length > 0 ? features.join(', ') : 'Default typography';
  }, []);

  const handleAddTypographyVariation = useCallback(() => {
    const newVariation: TypographyVariation = {
      id: `typography-variation-${Date.now()}`,
      settings: { ...typographySettings },
      description: generateTypographyDescription(typographySettings)
    };
    
    setTypographyVariations(prev => [...prev, newVariation]);
    toast.success('Typography variation added');
  }, [typographySettings, generateTypographyDescription]);

  const handleRemoveTypographyVariation = useCallback((variationId: string) => {
    setTypographyVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Typography variation removed');
  }, []);

  const handleRemoveBackgroundVariation = useCallback((variationId: string) => {
    setBackgroundVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Text background variation removed');
  }, []);

  // Text Shape Plugin Handlers - optimized with useCallback
  const generateTextShapeDescription = useCallback((shape: keyof ShapeSettings, settings: ShapeSettings[keyof ShapeSettings]): string => {
    if (shape === 'none') return 'No shape';
    
    let description = shape.charAt(0).toUpperCase() + shape.slice(1);
    
    if (settings) {
      switch (shape) {
        case 'circle':
          const circleSettings = settings as ShapeSettings['circle'];
          description += ` (${circleSettings.radius}px, ${circleSettings.direction})`;
          break;
        case 'arc':
          const arcSettings = settings as ShapeSettings['arc'];
          description += ` (${arcSettings.radius}px, ${arcSettings.arcAngle}°)`;
          break;
        case 'wave':
          const waveSettings = settings as ShapeSettings['wave'];
          description += ` (${waveSettings.amplitude}px, ${waveSettings.frequency} waves)`;
          break;
        default:
          break;
      }
    }
    
    return description;
  }, []);

  const generateRotateFlipDescription = (settings: RotateFlipSettings): string => {
    const parts = [];
    
    if (settings.rotation !== 0) {
      parts.push(`${settings.rotation}°`);
    }
    
    if (settings.flipHorizontal) {
      parts.push('H-Flip');
    }
    
    if (settings.flipVertical) {
      parts.push('V-Flip');
    }
    
    if (parts.length === 0) {
      return 'No Transform';
    }
    
    return parts.join(', ');
  };

  // Helper to scroll new cards into view - optimized with useCallback
  const scrollNewCardIntoView = useCallback(() => {
    const targets = [leftSettingsRef.current, variationsRef.current];
    requestAnimationFrame(() => {
      targets.forEach((el) => {
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    });
  }, []);

  const handleAddTextShapeVariation = () => {
    const newVariation: TextShapeVariation = {
      id: `text-shape-variation-${Date.now()}`,
      shape: selectedShape,
      settings: selectedShape === 'none' ? null : shapeSettings[selectedShape],
      description: generateTextShapeDescription(selectedShape, selectedShape === 'none' ? null : shapeSettings[selectedShape])
    };
    
    setTextShapeVariations(prev => [...prev, newVariation]);
    toast.success('Text shape variation added');
  };

  // Consolidated auto-scroll effect for all variation types
  useEffect(() => {
    const hasVariations = textShapeVariations.length > 0 || 
                         rotateFlipVariations.length > 0 || 
                         colorFillVariations.length > 0 || 
                         strokesVariations.length > 0 ||
                         backgroundVariations.length > 0 ||
                         typographyVariations.length > 0 ||
                         fontVariations.length > 0 ||
                         templateVariations.length > 0 ||
                         characterEffectsVariations.length > 0 ||
                         imageEffectsVariations.length > 0 ||
                         imageColorFillVariations.length > 0 ||
          imageStrokesVariations.length > 0 ||
          imageRotateFlipVariations.length > 0 ||
          imageBackgroundVariations.length > 0;
    
    if (hasVariations) {
      scrollNewCardIntoView();
    }
  }, [
    textShapeVariations.length, 
    rotateFlipVariations.length, 
    colorFillVariations.length,
    strokesVariations.length,
    backgroundVariations.length,
    typographyVariations.length,
    fontVariations.length,
    templateVariations.length,
    characterEffectsVariations.length,
    imageEffectsVariations.length,
    imageColorFillVariations.length,
    imageStrokesVariations.length,
    imageRotateFlipVariations.length,
    scrollNewCardIntoView
  ]);

  const handleRemoveTextShapeVariation = (variationId: string) => {
    setTextShapeVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Text shape variation removed');
  };

  const handleAddRotateFlipVariation = () => {
    const newVariation: RotateFlipVariation = {
      id: `rotate-flip-variation-${Date.now()}`,
      settings: { ...rotateFlipSettings },
      description: generateRotateFlipDescription(rotateFlipSettings)
    };

    setRotateFlipVariations(prev => [...prev, newVariation]);
    toast.success('Rotate & flip variation added');
  };

  // Strokes Plugin Handlers
  const generateStrokesDescription = useCallback((settings: StrokeSettings): string => {
    const parts = [];
    
    if (settings.regular.strokes.length > 0) {
      parts.push(`${settings.regular.strokes.length} regular stroke${settings.regular.strokes.length > 1 ? 's' : ''}`);
    }
    
    if (settings.character.strokes.length > 0) {
      parts.push(`${settings.character.strokes.length} character stroke${settings.character.strokes.length > 1 ? 's' : ''}`);
    }
    
    if (settings.container.strokes.length > 0) {
      parts.push(`${settings.container.strokes.length} container stroke${settings.container.strokes.length > 1 ? 's' : ''}`);
    }
    
    if (settings.knockout.enabled) {
      parts.push('knockout stroke');
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No strokes';
  }, []);

  const handleAddStrokesVariation = useCallback(() => {
    const newVariation: StrokesVariation = {
      id: `strokes-variation-${Date.now()}`,
      settings: { ...strokesSettings },
      description: generateStrokesDescription(strokesSettings)
    };

    setStrokesVariations(prev => [...prev, newVariation]);
    toast.success('Strokes variation added');
  }, [strokesSettings, generateStrokesDescription]);

  // Drop Shadow variation handlers
  const generateDropShadowDescription = useCallback((settings: DropShadowSettings): string => {
    const { mode } = settings;
    
    if (mode === 'regular') {
      const shadowCount = settings.regular.shadows.length;
      return shadowCount > 0 ? `Regular: ${shadowCount} shadow${shadowCount > 1 ? 's' : ''}` : 'No shadows';
    } else {
      const charCount = settings.character.characters.length;
      const totalShadows = settings.character.characters.reduce((sum, char) => sum + char.shadows.length, 0);
      return charCount > 0 ? `Character: ${charCount} char${charCount > 1 ? 's' : ''}, ${totalShadows} shadow${totalShadows !== 1 ? 's' : ''}` : 'No character shadows';
    }
  }, []);

  const handleAddDropShadowVariation = useCallback(() => {
    const newVariation: DropShadowVariation = {
      id: `drop-shadow-variation-${Date.now()}`,
      settings: { ...dropShadowSettings },
      description: generateDropShadowDescription(dropShadowSettings)
    };

    setDropShadowVariations(prev => [...prev, newVariation]);
    toast.success('Drop shadow variation added');
  }, [dropShadowSettings, generateDropShadowDescription]);

  // Generate description for character effects variation
  const generateCharacterEffectsDescription = useCallback((settings: CharacterEffectsSettings) => {
    const parts: string[] = [];
    
    parts.push(`${settings.characters.length} character${settings.characters.length > 1 ? 's' : ''}`);
    parts.push(`${settings.rotationMode} rotation`);
    
    if (settings.alignment !== 'none') {
      parts.push(`${settings.alignment} aligned`);
    }
    
    return parts.join(', ');
  }, []);

  const handleAddCharacterEffectsVariation = useCallback(() => {
    const newVariation: CharacterEffectsVariation = {
      id: `character-effects-variation-${Date.now()}`,
      settings: { ...characterEffectsSettings },
      description: generateCharacterEffectsDescription(characterEffectsSettings)
    };

    setCharacterEffectsVariations(prev => [...prev, newVariation]);
    toast.success('Character effects variation added');
  }, [characterEffectsSettings, generateCharacterEffectsDescription]);

  const handleRemoveStrokesVariation = useCallback((variationId: string) => {
    setStrokesVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Strokes variation removed');
  }, []);

  const handleRemoveCharacterEffectsVariation = useCallback((variationId: string) => {
    setCharacterEffectsVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Character effects variation removed');
  }, []);

  const handleRemoveDropShadowVariation = useCallback((variationId: string) => {
    setDropShadowVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Drop shadow variation removed');
  }, []);

  const handleAddImageEffectsVariation = useCallback(() => {
    const newVariation: ImageEffectsVariation = {
      id: `image-effects-variation-${Date.now()}`,
      settings: { ...imageEffectsSettings },
      description: generateImageEffectsDescription(imageEffectsSettings)
    };
    
    setImageEffectsVariations(prev => [...prev, newVariation]);
    toast.success('Visual effects variation added');
  }, [imageEffectsSettings, generateImageEffectsDescription]);

  const handleAddImageColorFillVariation = useCallback(() => {
    const newVariation: ImageColorFillVariation = {
      id: `image-color-fill-variation-${Date.now()}`,
      settings: { ...imageColorFillSettings },
      description: generateImageColorFillDescription(imageColorFillSettings)
    };
    
    setImageColorFillVariations(prev => [...prev, newVariation]);
    toast.success('Image color & fill variation added');
  }, [imageColorFillSettings]);

  const generateImageColorFillDescription = (settings: ImageColorFillSettings): string => {
    const parts = [];
    
    switch (settings.mode) {
      case 'solid':
        parts.push(`Solid: ${settings.solid.color}`);
        break;
      case 'gradient':
        parts.push(`${settings.gradient.type} gradient (${settings.gradient.stops.length} stops)`);
        break;
      case 'image':
        if (settings.image.images.length > 0) {
          parts.push(`Image (${settings.image.opacity}% opacity)`);
        } else {
          parts.push('Image (no image selected)');
        }
        break;
    }
    
    return parts.join(', ') || 'Image Color & Fill';
  };

  const handleAddImageStrokesVariation = useCallback(() => {
    const newVariation: ImageStrokesVariation = {
      id: `image-strokes-variation-${Date.now()}`,
      settings: { ...imageStrokesSettings },
      description: generateImageStrokesDescription(imageStrokesSettings)
    };
    
    setImageStrokesVariations(prev => [...prev, newVariation]);
    toast.success('Image strokes variation added');
  }, [imageStrokesSettings]);

  const generateImageStrokesDescription = (settings: ImageStrokeSettings): string => {
    const parts = [];
    
    if (settings.regular.strokes.length > 0) {
      parts.push(`${settings.regular.strokes.length} regular stroke${settings.regular.strokes.length > 1 ? 's' : ''}`);
    }
    
    if (settings.container.strokes.length > 0) {
      parts.push(`${settings.container.strokes.length} container stroke${settings.container.strokes.length > 1 ? 's' : ''}`);
    }
    
    if (settings.knockout.enabled) {
      parts.push('knockout stroke');
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No strokes';
  };

  const handleAddImageRotateFlipVariation = useCallback(() => {
    const newVariation: RotateFlipVariation = {
      id: `image-rotate-flip-variation-${Date.now()}`,
      settings: { ...imageRotateFlipSettings },
      description: generateImageRotateFlipDescription(imageRotateFlipSettings)
    };
    
    setImageRotateFlipVariations(prev => [...prev, newVariation]);
    toast.success('Image rotate & flip variation added');
  }, [imageRotateFlipSettings]);

  const generateImageRotateFlipDescription = (settings: RotateFlipSettings): string => {
    const parts = [];
    
    if (settings.rotation !== 0) {
      parts.push(`${settings.rotation}° rotation`);
    }
    
    if (settings.flipHorizontal) {
      parts.push('horizontal flip');
    }
    
    if (settings.flipVertical) {
      parts.push('vertical flip');
    }
    
    return parts.join(', ') || 'No transformation';
  };

  const handleAddImageInputVariation = useCallback(() => {
    const allImages = imageInputs.flatMap(input => input.selectedImages);
    if (allImages.length === 0) {
      toast.info('Please select images before creating a variation');
      return;
    }

    const newVariation: Variation = {
      id: `image-input-variation-${Date.now()}`,
      colors: [],
      images: [...allImages],
      description: `${allImages.length} image${allImages.length > 1 ? 's' : ''} from ${imageInputs.length} input${imageInputs.length > 1 ? 's' : ''}`
    };
    
    setImageInputVariations(prev => [...prev, newVariation]);
    toast.success('Image input variation added');
    
    // Auto-scroll to bottom of variations
    setTimeout(() => {
      const targets = [leftSettingsRef.current, variationsRef.current];
      targets.forEach((el) => {
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    });
  }, [imageInputs]);

  const handleRemoveImageEffectsVariation = useCallback((variationId: string) => {
    setImageEffectsVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Visual effects variation removed');
  }, []);

  const handleRemoveImageColorFillVariation = useCallback((variationId: string) => {
    setImageColorFillVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Image color & fill variation removed');
  }, []);

  const handleRemoveImageStrokesVariation = useCallback((variationId: string) => {
    setImageStrokesVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Image strokes variation removed');
  }, []);

  const handleRemoveImageRotateFlipVariation = useCallback((variationId: string) => {
    setImageRotateFlipVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Image rotate & flip variation removed');
  }, []);

  const handleAddImageBackgroundVariation = useCallback((variation: Variation) => {
    setImageBackgroundVariations(prev => [...prev, variation]);
    toast.success('Image background variation added');
  }, []);

  const handleRemoveImageBackgroundVariation = useCallback((variationId: string) => {
    setImageBackgroundVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Image background variation removed');
  }, []);

  const handleRemoveImageInputVariation = useCallback((variationId: string) => {
    setImageInputVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Image input variation removed');
  }, []);

  const handleRemoveRotateFlipVariation = (variationId: string) => {
    setRotateFlipVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Rotate & flip variation removed');
  };

  // Color & Fill variation handlers
  const generateColorFillDescription = (settings: ColorFillSettings): string => {
    const { mode } = settings;
    
    switch (mode) {
      case 'solid':
        return `Solid: ${settings.solid.color}`;
      case 'gradient':
        return `${settings.gradient.type} gradient (${settings.gradient.stops.length} stops)`;
      case 'palette':
        return `${settings.palette.source} palette (${settings.palette.colors.length} colors)`;
      case 'image':
        return `${settings.image.mode} image (${settings.image.images.length} images)`;
      default:
        return 'Color & Fill';
    }
  };

  const handleAddColorFillVariation = () => {
    const newVariation: ColorFillVariation = {
      id: `color-fill-variation-${Date.now()}`,
      settings: { ...colorFillSettings },
      description: generateColorFillDescription(colorFillSettings)
    };

    setColorFillVariations(prev => [...prev, newVariation]);
    toast.success('Color & fill variation added');
  };

  const handleAddTextBackgroundVariation = useCallback((variation: Variation) => {
    setBackgroundVariations(prev => [...prev, variation]);
    toast.success('Text background variation added');
  }, []);

  const handleRemoveColorFillVariation = (variationId: string) => {
    setColorFillVariations(prev => prev.filter(v => v.id !== variationId));
    toast.success('Color & fill variation removed');
  };

  // Variation Detail View Handlers
  const handleVariationSelect = (variation: AnyVariation, type: string) => {
    setSelectedVariation(variation);
    setSelectedVariationType(type);
    setHasUnsavedChanges(false);
  };

  const handleVariationSave = (updatedVariation: AnyVariation) => {
    // Update the appropriate variation array based on type
    switch (selectedVariationType) {
      case 'background':
        setBackgroundVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as Variation : v));
        break;
      case 'template':
        setTemplateVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as TemplateVariation : v));
        break;
      case 'font':
        setFontVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as FontVariation : v));
        break;
      case 'typography':
        setTypographyVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as TypographyVariation : v));
        break;
      case 'textShape':
        setTextShapeVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as TextShapeVariation : v));
        break;
      case 'rotateFlip':
        setRotateFlipVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as RotateFlipVariation : v));
        break;
      case 'colorFill':
        setColorFillVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as ColorFillVariation : v));
        break;
      case 'strokes':
        setStrokesVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as StrokesVariation : v));
        break;
      case 'dropShadow':
        setDropShadowVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as DropShadowVariation : v));
        break;
      case 'character-effects':
        setCharacterEffectsVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as CharacterEffectsVariation : v));
        break;
      case 'visual-effects':
        setImageEffectsVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as ImageEffectsVariation : v));
        break;
      case 'image-input':
        setImageInputVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation as Variation : v));
        break;
    }
    setHasUnsavedChanges(false);
  };

  const handleVariationDelete = (variationId: string) => {
    // Remove from appropriate array and clear selection
    switch (selectedVariationType) {
      case 'background':
        setBackgroundVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'template':
        setTemplateVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'font':
        setFontVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'typography':
        setTypographyVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'textShape':
        setTextShapeVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'rotateFlip':
        setRotateFlipVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'colorFill':
        setColorFillVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'strokes':
        setStrokesVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'dropShadow':
        setDropShadowVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'character-effects':
        setCharacterEffectsVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'visual-effects':
        setImageEffectsVariations(prev => prev.filter(v => v.id !== variationId));
        break;
      case 'image-input':
        setImageInputVariations(prev => prev.filter(v => v.id !== variationId));
        break;
    }
    setSelectedVariation(null);
    setSelectedVariationType('');
    setHasUnsavedChanges(false);
  };

  const handleVariationDuplicate = () => {
    if (selectedVariation && selectedVariationType) {
      const duplicatedVariation = {
        ...selectedVariation,
        id: `${selectedVariationType}-variation-${Date.now()}`,
        description: `${selectedVariation.description} (Copy)`
      };

      switch (selectedVariationType) {
        case 'background':
          setBackgroundVariations(prev => [...prev, duplicatedVariation as Variation]);
          break;
        case 'template':
          setTemplateVariations(prev => [...prev, duplicatedVariation as TemplateVariation]);
          break;
        case 'font':
          setFontVariations(prev => [...prev, duplicatedVariation as FontVariation]);
          break;
        case 'typography':
          setTypographyVariations(prev => [...prev, duplicatedVariation as TypographyVariation]);
          break;
        case 'textShape':
          setTextShapeVariations(prev => [...prev, duplicatedVariation as TextShapeVariation]);
          break;
        case 'rotateFlip':
          setRotateFlipVariations(prev => [...prev, duplicatedVariation as RotateFlipVariation]);
          break;
        case 'colorFill':
          setColorFillVariations(prev => [...prev, duplicatedVariation as ColorFillVariation]);
          break;
        case 'strokes':
          setStrokesVariations(prev => [...prev, duplicatedVariation as StrokesVariation]);
          break;
        case 'dropShadow':
          setDropShadowVariations(prev => [...prev, duplicatedVariation as DropShadowVariation]);
          break;
        case 'character-effects':
          setCharacterEffectsVariations(prev => [...prev, duplicatedVariation as CharacterEffectsVariation]);
          break;
        case 'visual-effects':
          setImageEffectsVariations(prev => [...prev, duplicatedVariation as ImageEffectsVariation]);
          break;
        case 'image-input':
          setImageInputVariations(prev => [...prev, duplicatedVariation as Variation]);
          break;
      }
      toast.success('Variation duplicated successfully!');
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    toast.success('Changes discarded');
  };

  // Available fonts list
  const availableFonts = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif' },  
    { name: 'Playfair Display', family: 'Playfair Display, serif' },
    { name: 'Open Sans', family: 'Open Sans, sans-serif' },
    { name: 'Lato', family: 'Lato, sans-serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Source Sans Pro', family: 'Source Sans Pro, sans-serif' }
  ];

  // Fonts Plugin Component
  const FontsPlugin = () => {
    const filteredFonts = availableFonts.filter(font =>
      font.name.toLowerCase().includes(fontSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-card border border-panel-border rounded-lg shadow-sm">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
          onClick={() => setIsFontsExpanded(!isFontsExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Type className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium text-foreground">Fonts</span>
            {selectedFonts.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {selectedFonts.length}
              </span>
            )}
          </div>
          {isFontsExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        {isFontsExpanded && (
          <div className="flex flex-col">
            {/* Font Search */}
            <div className="p-3 pb-2">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={fontSearchQuery}
                  onChange={(e) => setFontSearchQuery(e.target.value)}
                  className="w-full h-6 pl-7 pr-3 text-xs bg-secondary border border-panel-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Scrollable Font List */}
            <div className="max-h-40 overflow-y-auto px-3">
              <div className="space-y-0.5">
                {filteredFonts.map((font) => (
                  <div
                    key={font.name}
                    className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                      selectedFonts.includes(font.family)
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => handleFontSelect(font.family)}
                  >
                    <div className="flex-1 min-w-0">
                      <span 
                        className="text-xs text-foreground truncate block"
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </span>
                    </div>
                    {selectedFonts.includes(font.family) && (
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Variation Button - Always visible at bottom */}
            <div className="p-3 pt-2">
              <Button
                onClick={handleAddFontsToVariation}
                disabled={selectedFonts.length === 0}
                className="w-full h-6 text-xs"
                variant={selectedFonts.length > 0 ? "default" : "secondary"}
              >
                <Plus className="w-3 h-3 mr-1" />
                {selectedFonts.length > 0 
                  ? `Add Variation (${selectedFonts.length})` 
                  : 'Add Variation'
                }
              </Button>
            </div>
          </div>
        )}
      </div>
    );
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
                          onError={handleImageError}
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

  // Functions to handle collapse/expand all for text settings
  const handleCollapseAll = () => {
    setIsColorFillExpanded(false);
    setIsTextBackgroundExpanded(false);
    setIsFontsExpanded(false);
    setIsTypographyExpanded(false);
    setIsTextShapeExpanded(false);
    setIsRotateFlipExpanded(false);
    setIsStrokesExpanded(false);
    setIsDropShadowExpanded(false);
    setIsCharacterEffectsExpanded(false);
    setIsImageEffectsExpanded(false);
  };

  const handleShowAll = () => {
    setIsColorFillExpanded(true);
    setIsTextBackgroundExpanded(true);
    setIsFontsExpanded(true);
    setIsTypographyExpanded(true);
    setIsTextShapeExpanded(true);
    setIsRotateFlipExpanded(true);
    setIsStrokesExpanded(true);
    setIsDropShadowExpanded(true);
    setIsCharacterEffectsExpanded(true);
    setIsImageEffectsExpanded(true);
  };

  // Functions to handle collapse/expand all for image settings
  const handleImageCollapseAll = () => {
    setIsImageEffectsExpanded(false);
    setIsImageColorFillExpanded(false);
    setIsImageStrokesExpanded(false);
    setIsImageRotateFlipExpanded(false);
    setIsImageBackgroundExpanded(false);
  };

  const handleImageShowAll = () => {
    setIsImageEffectsExpanded(true);
    setIsImageColorFillExpanded(true);
    setIsImageStrokesExpanded(true);
    setIsImageRotateFlipExpanded(true);
    setIsImageBackgroundExpanded(true);
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground text-lg font-medium">
            {settingsMap[activeSection as keyof typeof settingsMap]}
          </h3>
          {activeSection === 'text' && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="text-xs px-2 py-1 h-6 text-muted-foreground hover:text-foreground"
              >
                Collapse All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowAll}
                className="text-xs px-2 py-1 h-6 text-muted-foreground hover:text-foreground"
              >
                Show All
              </Button>
            </div>
          )}
          {activeSection === 'images' && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageCollapseAll}
                className="text-xs px-2 py-1 h-6 text-muted-foreground hover:text-foreground"
              >
                Collapse All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageShowAll}
                className="text-xs px-2 py-1 h-6 text-muted-foreground hover:text-foreground"
              >
                Show All
              </Button>
            </div>
          )}
        </div>
        <div 
          ref={leftSettingsRef}
          className="flex-1 space-y-4 overflow-y-auto"
        >
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
                              onError={handleImageError}
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
                                 onError={handleImageError}
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
            <div 
              ref={variationsRef}
              className="space-y-4 overflow-y-auto"
            >
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
                      <div 
                        key={variation.id} 
                        className={`bg-secondary rounded-lg p-3 flex items-center justify-between cursor-pointer transition-all
                          ${selectedVariation?.id === variation.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/80'}
                        `}
                        onClick={() => handleVariationSelect(variation, 'background')}
                      >
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
                          {hasUnsavedChanges && selectedVariation?.id === variation.id && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full" title="Unsaved changes" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveVariation(variation.id);
                          }}
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
                        className={`bg-secondary/30 rounded-lg p-3 cursor-pointer transition-all
                          ${selectedVariation?.id === variation.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/50'}
                        `}
                        onClick={() => handleVariationSelect(variation, 'template')}
                        onDoubleClick={() => handleDoubleClickTemplateVariation(variation)}
                        title="Click to view details, double-click to add templates back to panel"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">{variation.description}</span>
                          {hasUnsavedChanges && selectedVariation?.id === variation.id && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full" title="Unsaved changes" />
                          )}
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
                                 onError={handleImageError}
                               />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {fontVariations.length > 0 && (
                <div className="bg-card border border-panel-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                    <Type className="w-4 h-4 text-primary" />
                    <span>Font Variations</span>
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {fontVariations.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {fontVariations.map((variation) => (
                      <div 
                        key={variation.id} 
                        className={`bg-secondary/30 rounded-lg p-3 cursor-pointer transition-all
                          ${selectedVariation?.id === variation.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/50'}
                        `}
                        onClick={() => handleVariationSelect(variation, 'font')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">{variation.description}</span>
                          {hasUnsavedChanges && selectedVariation?.id === variation.id && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full" title="Unsaved changes" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFontVariation(variation.id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {variation.fonts.map((font, index) => (
                            <span 
                              key={index}
                              className="bg-secondary px-2 py-1 rounded text-xs text-foreground"
                              style={{ fontFamily: font }}
                            >
                              {availableFonts.find(f => f.family === font)?.name || font}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}
                
                {textShapeVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Shapes className="w-4 h-4 text-primary" />
                      <span>Text Shape Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {textShapeVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                       {textShapeVariations.map((variation) => (
                         <div 
                           key={variation.id} 
                           className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                             selectedVariation?.id === variation.id && selectedVariationType === 'textShape' 
                               ? 'ring-2 ring-primary bg-secondary/60' 
                               : ''
                           }`}
                           onClick={() => handleVariationSelect(variation, 'textShape')}
                         >
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-medium text-foreground">{variation.description}</span>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleRemoveTextShapeVariation(variation.id);
                               }}
                               className="p-1 text-muted-foreground hover:text-destructive"
                             >
                               <Trash2 className="w-3 h-3" />
                             </Button>
                           </div>
                           <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                             <span className="capitalize">{variation.shape}</span>
                             {variation.shape !== 'none' && variation.settings && (
                               <>
                                 <span>•</span>
                                 <span>Custom settings</span>
                               </>
                             )}
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                
                {rotateFlipVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <RotateCw className="w-4 h-4 text-primary" />
                      <span>Rotate & Flip Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {rotateFlipVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                       {rotateFlipVariations.map((variation) => (
                         <div 
                           key={variation.id} 
                           className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                             selectedVariation?.id === variation.id && selectedVariationType === 'rotateFlip' 
                               ? 'ring-2 ring-primary bg-secondary/60' 
                               : ''
                           }`}
                           onClick={() => handleVariationSelect(variation, 'rotateFlip')}
                         >
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-medium text-foreground">{variation.description}</span>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleRemoveRotateFlipVariation(variation.id);
                               }}
                               className="p-1 text-muted-foreground hover:text-destructive"
                             >
                               <Trash2 className="w-3 h-3" />
                             </Button>
                           </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {variation.settings.rotation !== 0 && (
                              <span>{variation.settings.rotation}° rotation</span>
                            )}
                            {variation.settings.flipHorizontal && (
                              <>
                                {variation.settings.rotation !== 0 && <span>•</span>}
                                <span>H-flip</span>
                              </>
                            )}
                            {variation.settings.flipVertical && (
                              <>
                                {(variation.settings.rotation !== 0 || variation.settings.flipHorizontal) && <span>•</span>}
                                <span>V-flip</span>
                              </>
                            )}
                            {variation.settings.rotation === 0 && !variation.settings.flipHorizontal && !variation.settings.flipVertical && (
                              <span>No transform</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {colorFillVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>Color Fill Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {colorFillVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {colorFillVariations.map((variation) => (
                        <div key={variation.id} className="bg-secondary/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveColorFillVariation(variation.id)}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className="capitalize">{variation.settings.mode}</span>
                            {variation.settings.mode === 'solid' && (
                              <div 
                                className="w-3 h-3 rounded border border-border"
                                style={{ backgroundColor: variation.settings.solid.color }}
                              />
                            )}
                            {variation.settings.mode === 'gradient' && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{variation.settings.gradient.type}</span>
                                <span>({variation.settings.gradient.stops.length} stops)</span>
                              </>
                            )}
                            {variation.settings.mode === 'palette' && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{variation.settings.palette.source}</span>
                                <span>({variation.settings.palette.colors.length} colors)</span>
                              </>
                            )}
                            {variation.settings.mode === 'image' && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{variation.settings.image.mode}</span>
                                <span>({variation.settings.image.images.length} images)</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                 {typographyVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Type className="w-4 h-4 text-primary" />
                      <span>Typography Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {typographyVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {typographyVariations.map((variation) => (
                        <div key={variation.id} className="bg-secondary/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTypographyVariation(variation.id)}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {variation.settings.bold && <span className="font-bold">B</span>}
                            {variation.settings.italic && <span className="italic">I</span>}
                            {variation.settings.underline && <span className="underline">U</span>}
                            {variation.settings.textCase !== 'normal' && (
                              <span>{variation.settings.textCase === 'uppercase' ? 'ABC' : 'abc'}</span>
                            )}
                            {variation.settings.textStroke && <span>STR</span>}
                            <span>•</span>
                            <span>{variation.settings.textAlign}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {characterEffectsVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <ALargeSmall className="w-4 h-4 text-primary" />
                      <span>Character Effects Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {characterEffectsVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {characterEffectsVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'character-effects' 
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'character-effects')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCharacterEffectsVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{variation.settings.characters.length} char{variation.settings.characters.length > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span className="capitalize">{variation.settings.rotationMode}</span>
                            {variation.settings.alignment !== 'none' && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{variation.settings.alignment} aligned</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {imageEffectsVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-primary" />
                      <span>Visual Effects Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageEffectsVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {imageEffectsVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'visual-effects' 
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'visual-effects')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageEffectsVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {variation.settings.colorize && <span>Colorized</span>}
                            {variation.settings.grayscale && (
                              <>
                                {variation.settings.colorize && <span>•</span>}
                                <span>Grayscale</span>
                              </>
                            )}
                            {variation.settings.invert && (
                              <>
                                {(variation.settings.colorize || variation.settings.grayscale) && <span>•</span>}
                                <span>Inverted</span>
                              </>
                )}
                
                {imageColorFillVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>Image Color & Fill Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageColorFillVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {imageColorFillVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'Image Color & Fill'
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'Image Color & Fill')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageColorFillVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imageStrokesVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Paintbrush className="w-4 h-4 text-primary" />
                      <span>Image Strokes Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageStrokesVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {imageStrokesVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'Image Strokes'
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'Image Strokes')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageStrokesVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                            {!variation.settings.colorize && !variation.settings.grayscale && !variation.settings.invert && 
                             variation.settings.brightness === 0 && variation.settings.contrast === 0 && 
                             variation.settings.saturation === 0 && variation.settings.hue === 0 && (
                              <span>No effects</span>
                )}

                {imageRotateFlipVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <RotateCw className="w-4 h-4 text-primary" />
                      <span>Image Rotate & Flip Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageRotateFlipVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {imageRotateFlipVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'Image Rotate & Flip'
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'Image Rotate & Flip')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageRotateFlipVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {imageBackgroundVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>Image Background Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageBackgroundVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {imageBackgroundVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'Image Background'
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'Image Background')}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageBackgroundVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {imageInputVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span>Image Input Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageInputVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {imageInputVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'image-input'
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'image-input')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageInputVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex space-x-1">
                            {variation.images.slice(0, 4).map((image, index) => (
                              <div key={index} className="w-6 h-6 rounded border border-panel-border overflow-hidden">
                                <img
                                  src={getBlobUrl(image)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {variation.images.length > 4 && (
                              <span className="text-xs text-muted-foreground self-center">+{variation.images.length - 4}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                 
                {dropShadowVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-primary" />
                      <span>Drop Shadow Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {dropShadowVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {dropShadowVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className={`bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                            selectedVariation?.id === variation.id && selectedVariationType === 'dropShadow'
                              ? 'ring-2 ring-primary bg-secondary/60' 
                              : ''
                          }`}
                          onClick={() => handleVariationSelect(variation, 'dropShadow')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDropShadowVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className="capitalize">{variation.settings.mode}</span>
                            {variation.settings.mode === 'regular' && (
                              <>
                                <span>•</span>
                                <span>{variation.settings.regular.shadows.length} shadow{variation.settings.regular.shadows.length !== 1 ? 's' : ''}</span>
                              </>
                            )}
                            {variation.settings.mode === 'character' && (
                              <>
                                <span>•</span>
                                <span>{variation.settings.character.characters.length} char{variation.settings.character.characters.length !== 1 ? 's' : ''}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {backgroundVariations.length === 0 && templateVariations.length === 0 && fontVariations.length === 0 && typographyVariations.length === 0 && textShapeVariations.length === 0 && rotateFlipVariations.length === 0 && colorFillVariations.length === 0 && strokesVariations.length === 0 && dropShadowVariations.length === 0 && characterEffectsVariations.length === 0 && imageEffectsVariations.length === 0 && imageColorFillVariations.length === 0 && imageStrokesVariations.length === 0 && imageRotateFlipVariations.length === 0 && imageBackgroundVariations.length === 0 && imageInputVariations.length === 0 && (
                 <div className="bg-card border border-panel-border rounded-lg p-4 text-center">
                   <Shuffle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                   <p className="text-sm text-muted-foreground mb-2">No variations created yet</p>
                   <p className="text-xs text-muted-foreground">Use the Canvas, Templates, or Text sections to create variations</p>
                 </div>
               )}
             </div>
            ) : activeSection === 'text' ? (
              <div className="space-y-4">
                {/* Text Settings Tabs */}
                <Tabs value={activeTextTab} onValueChange={(v) => setActiveTextTab(v as TextTabId)}>
                  <TabsList className="w-full justify-start gap-1">
                    {textTabs.map(id => (
                      <TabsTrigger key={id} value={id} className="px-3 py-1 h-8 text-xs relative group">
                        {id}
                        {/* indicator dot placeholder; logic added in Step 2 */}
                        <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-transparent" />
                        {/* Delete button - only show for non-GLOBAL tabs */}
                        {id !== 'GLOBAL' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTab(id);
                            }}
                            className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-all"
                            title={`Delete ${id}`}
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        )}
                      </TabsTrigger>
                    ))}
                    {/* read-only [+] placeholder; adding logic in Step 4 when we sync with inputs */}
                    <button
                      type="button"
                      className="ml-2 text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
                      onClick={() => {/* no-op for now */}}
                    >
                      +
                    </button>
                  </TabsList>
                </Tabs>
                <ColorFillPlugin
                  isExpanded={isColorFillExpanded}
                  onToggleExpanded={() => setIsColorFillExpanded(!isColorFillExpanded)}
                  settings={colorFillSettings}
                  onSettingsChange={setColorFillSettings}
                  onAddVariation={handleAddColorFillVariation}
                />
                
                <TextBackgroundPlugin
                  isExpanded={isTextBackgroundExpanded}
                  onToggleExpanded={() => setIsTextBackgroundExpanded(!isTextBackgroundExpanded)}
                  onAddVariation={handleAddTextBackgroundVariation}
                />
                
                <FontsPlugin />
                <TypographyPlugin
                  isExpanded={isTypographyExpanded}
                  onToggleExpanded={() => setIsTypographyExpanded(!isTypographyExpanded)}
                  settings={typographySettings}
                  onSettingsChange={setTypographySettings}
                  onAddVariation={handleAddTypographyVariation}
                />
                <TextShapePlugin
                  isExpanded={isTextShapeExpanded}
                  onToggleExpanded={() => setIsTextShapeExpanded(!isTextShapeExpanded)}
                  selectedShape={selectedShape}
                  onShapeChange={setSelectedShape}
                  shapeSettings={shapeSettings}
                  onShapeSettingsChange={setShapeSettings}
                  onAddVariation={handleAddTextShapeVariation}
                />
                
                <RotateFlipPlugin
                  isExpanded={isRotateFlipExpanded}
                  onToggleExpanded={() => setIsRotateFlipExpanded(!isRotateFlipExpanded)}
                  settings={rotateFlipSettings}
                  onSettingsChange={setRotateFlipSettings}
                  onAddVariation={handleAddRotateFlipVariation}
                />
                
                <StrokesPlugin
                  isExpanded={isStrokesExpanded}
                  onToggleExpanded={() => setIsStrokesExpanded(!isStrokesExpanded)}
                  settings={strokesSettings}
                  onSettingsChange={setStrokesSettings}
                  onAddVariation={handleAddStrokesVariation}
                />
                
                <DropShadowPlugin
                  isExpanded={isDropShadowExpanded}
                  onToggleExpanded={() => setIsDropShadowExpanded(!isDropShadowExpanded)}
                  settings={dropShadowSettings}
                  onSettingsChange={setDropShadowSettings}
                  onAddVariation={handleAddDropShadowVariation}
                />
                
                <CharacterEffectsPlugin
                  isExpanded={isCharacterEffectsExpanded}
                  onToggleExpanded={() => setIsCharacterEffectsExpanded(!isCharacterEffectsExpanded)}
                  settings={characterEffectsSettings}
                  onSettingsChange={setCharacterEffectsSettings}
                  onAddVariation={handleAddCharacterEffectsVariation}
                />
                
                <ImageEffectsPlugin
                  isExpanded={isImageEffectsExpanded}
                  onToggleExpanded={() => setIsImageEffectsExpanded(!isImageEffectsExpanded)}
                  settings={imageEffectsSettings}
                  onSettingsChange={setImageEffectsSettings}
                  onAddVariation={handleAddImageEffectsVariation}
                />
              </div>
            ) : activeSection === 'images' ? (
              <div className="space-y-4">
                {/* Image Settings Tabs */}
                <Tabs value={activeImageTab} onValueChange={(v) => setActiveImageTab(v as ImageTabId)}>
                  <TabsList className="w-full justify-start gap-1">
                    {imageTabs.map(id => (
                      <TabsTrigger key={id} value={id} className="px-3 py-1 h-8 text-xs relative group">
                        {id}
                        {/* indicator dot placeholder; logic can be added later */}
                        <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-transparent" />
                        {/* Delete button - only show for non-GLOBAL tabs */}
                        {id !== 'GLOBAL' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteImageTab(id);
                            }}
                            className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-all"
                            title={`Delete ${id}`}
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        )}
                      </TabsTrigger>
                    ))}
                    {/* Add new image input tab button */}
                    <button
                      type="button"
                      className="ml-2 text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
                      onClick={() => {
                        const newIndex = imageTabs.length;
                        const newTabId = `II${newIndex}` as ImageTabId;
                        setImageTabs(prev => [...prev, newTabId]);
                        setActiveImageTab(newTabId);
                      }}
                    >
                      +
                    </button>
                  </TabsList>
                </Tabs>

                
                {/* Image Effects Plugin */}
                 <ImageEffectsPlugin
                  isExpanded={isImageEffectsExpanded}
                  onToggleExpanded={() => setIsImageEffectsExpanded(!isImageEffectsExpanded)}
                  settings={imageEffectsSettings}
                  onSettingsChange={setImageEffectsSettings}
                  onAddVariation={handleAddImageEffectsVariation}
                />
                
                {/* Image Color & Fill Plugin */}
                <ImageColorFillPlugin
                  isExpanded={isImageColorFillExpanded}
                  onToggleExpanded={() => setIsImageColorFillExpanded(!isImageColorFillExpanded)}
                  settings={imageColorFillSettings}
                  onSettingsChange={setImageColorFillSettings}
                  onAddVariation={handleAddImageColorFillVariation}
                />
                
                {/* Image Strokes Plugin */}
                <ImageStrokesPlugin
                  isExpanded={isImageStrokesExpanded}
                  onToggleExpanded={() => setIsImageStrokesExpanded(!isImageStrokesExpanded)}
                  settings={imageStrokesSettings}
                  onSettingsChange={setImageStrokesSettings}
                  onAddVariation={handleAddImageStrokesVariation}
                />
                
                {/* Image Rotate & Flip Plugin */}
                <ImageRotateFlipPlugin
                  isExpanded={isImageRotateFlipExpanded}
                  onToggleExpanded={() => setIsImageRotateFlipExpanded(!isImageRotateFlipExpanded)}
                  settings={imageRotateFlipSettings}
                  onSettingsChange={setImageRotateFlipSettings}
                  onAddVariation={handleAddImageRotateFlipVariation}
                />
                
                {/* Image Background Plugin */}
                <ImageBackgroundPlugin
                  isExpanded={isImageBackgroundExpanded}
                  onToggleExpanded={() => setIsImageBackgroundExpanded(!isImageBackgroundExpanded)}
                  onAddVariation={handleAddImageBackgroundVariation}
                />
                
                {/* Image Effects Variation Cards */}
                {imageEffectsVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-primary" />
                      <span>Image Effects Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageEffectsVariations.length}
                      </span>
                    </h4>
                    <div className="grid gap-2">
                      {imageEffectsVariations.map((variation) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => {
                            setSelectedVariation(variation);
                            setSelectedVariationType('Image Effects');
                          }}
                        >
                          <span className="text-xs text-muted-foreground">{variation.description}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImageEffectsVariation(variation.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Color & Fill Variation Cards */}
                {imageColorFillVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>Image Color & Fill Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageColorFillVariations.length}
                      </span>
                    </h4>
                    <div className="grid gap-2">
                      {imageColorFillVariations.map((variation) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => {
                            setSelectedVariation(variation);
                            setSelectedVariationType('Image Color & Fill');
                          }}
                        >
                          <span className="text-xs text-muted-foreground">{variation.description}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImageColorFillVariation(variation.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Strokes Variation Cards */}
                {imageStrokesVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Paintbrush className="w-4 h-4 text-primary" />
                      <span>Image Strokes Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageStrokesVariations.length}
                      </span>
                    </h4>
                    <div className="grid gap-2">
                      {imageStrokesVariations.map((variation) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => {
                            setSelectedVariation(variation);
                            setSelectedVariationType('Image Strokes');
                          }}
                        >
                          <span className="text-xs text-muted-foreground">{variation.description}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImageStrokesVariation(variation.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Image Background Variation Cards */}
                {imageBackgroundVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>Image Background Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageBackgroundVariations.length}
                      </span>
                    </h4>
                    <div className="grid gap-2">
                      {imageBackgroundVariations.map((variation) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => {
                            setSelectedVariation(variation);
                            setSelectedVariationType('Image Background');
                          }}
                        >
                          <span className="text-xs text-muted-foreground">{variation.description}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImageBackgroundVariation(variation.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Image Input Variation Cards */}
                {imageInputVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span>Image Input Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageInputVariations.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {imageInputVariations.map((variation) => (
                        <div 
                          key={variation.id} 
                          className="bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-foreground">{variation.description}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageInputVariation(variation.id);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground space-x-1 space-y-1">
                            {variation.images.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={getBlobUrl(image)}
                                alt={`Image ${index + 1}`}
                                className="inline-block w-6 h-6 object-cover rounded border mr-1"
                                onError={handleImageError}
                              />
                            ))}
                            {variation.images.length > 3 && (
                              <span className="text-xs">+{variation.images.length - 3} more</span>
                  )}
                
                {/* Image Rotate & Flip Variation Cards */}
                {imageRotateFlipVariations.length > 0 && (
                  <div className="bg-card border border-panel-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <RotateCw className="w-4 h-4 text-primary" />
                      <span>Image Rotate & Flip Variations</span>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {imageRotateFlipVariations.length}
                      </span>
                    </h4>
                    <div className="grid gap-2">
                      {imageRotateFlipVariations.map((variation) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => {
                            setSelectedVariation(variation);
                            setSelectedVariationType('Image Rotate & Flip');
                          }}
                        >
                          <span className="text-xs text-muted-foreground">{variation.description}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImageRotateFlipVariation(variation.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
                        </div>
                      ))}
                    </div>
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
          {activeSection === 'variations' && (backgroundVariations.length > 0 || templateVariations.length > 0 || fontVariations.length > 0 || typographyVariations.length > 0 || textShapeVariations.length > 0 || rotateFlipVariations.length > 0 || colorFillVariations.length > 0 || strokesVariations.length > 0 || characterEffectsVariations.length > 0 || imageEffectsVariations.length > 0 || imageColorFillVariations.length > 0 || imageStrokesVariations.length > 0 || imageRotateFlipVariations.length > 0 || imageBackgroundVariations.length > 0 || imageInputVariations.length > 0) && (
            <div className="flex-shrink-0 mt-6">
              <Button
                className={`w-full font-medium py-3 ${
                  hasUnsavedChanges 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                disabled={hasUnsavedChanges}
                onClick={() => {
                  // TODO: Implement send to render queue functionality
                }}
              >
                Send to Render Queue
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Total: {backgroundVariations.length + templateVariations.length + fontVariations.length + typographyVariations.length + textShapeVariations.length + rotateFlipVariations.length + colorFillVariations.length + strokesVariations.length + characterEffectsVariations.length + imageEffectsVariations.length + imageColorFillVariations.length + imageStrokesVariations.length + imageRotateFlipVariations.length + imageBackgroundVariations.length + imageInputVariations.length} variations
                {hasUnsavedChanges && <span className="text-destructive"> • Save changes first</span>}
              </p>
            </div>
          )}
       </div>
    );
  };

  return (
    <ErrorBoundary>
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
            <ErrorBoundary>
              <CanvasEditor 
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                containers={containers}
                setContainers={setContainers}
                selectedContainer={selectedContainer}
                setSelectedContainer={setSelectedContainer}
              />
            </ErrorBoundary>
          ) : activeSection === 'text' ? (
            <ErrorBoundary>
              <TextEditor 
                onSubmitVariation={handleSubmitVariation}
                lastSelectedFont={lastSelectedFont}
                typographySettings={typographySettings}
                onFocusInputTab={(i) => {
                  const id = (`TI${i+1}`) as TextTabId;
                  ensureTab(id);
                  setActiveTextTab(id);
                }}
              />
            </ErrorBoundary>
          ) : activeSection === 'images' ? (
            <ErrorBoundary>
              <ImageEditor 
                imageInputs={imageInputs}
                onImageInputsChange={setImageInputs}
                onSubmitVariation={(imageArrays) => {
                  // Handle image variation submission logic here
                  // Process variations for further use
                  setImageInputVariations(prev => [...prev, ...imageArrays.map((images, index) => ({
                    id: `image-variation-${Date.now()}-${index}`,
                    colors: [], // Empty colors array for image-only variations
                    images,
                    description: `${images.length} image${images.length !== 1 ? 's' : ''}`
                  }))]);
                }}
                onFocusInputTab={(inputId) => {
                  const index = imageInputs.findIndex(input => input.id === inputId);
                  const id = (`II${index + 1}`) as ImageTabId;
                  ensureImageTab(id);
                  setActiveImageTab(id);
                }}
              />
            </ErrorBoundary>
          ) : activeSection === 'variations' ? (
            <VariationDetailView
              variation={selectedVariation}
              variationType={selectedVariationType}
              onSave={handleVariationSave}
              onDelete={handleVariationDelete}
              onDuplicate={handleVariationDuplicate}
              hasUnsavedChanges={hasUnsavedChanges}
              onDiscardChanges={handleDiscardChanges}
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
                    <div className="flex items-center space-x-2 ml-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 px-2 text-xs border-panel-border hover:bg-secondary"
                          >
                            <div 
                              className="w-3 h-3 rounded mr-1 border border-panel-border" 
                              style={{ backgroundColor: templateBackgroundColor }}
                            />
                            Background
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={templateBackgroundColor}
                                onChange={(e) => setTemplateBackgroundColor(e.target.value)}
                                className="w-8 h-8 rounded border border-panel-border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={templateBackgroundColor}
                                onChange={(e) => setTemplateBackgroundColor(e.target.value)}
                                className="flex-1 px-2 py-1 text-xs bg-background border border-panel-border rounded"
                                placeholder="#ffffff"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">Template background color</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="flex items-center space-x-1">
                        {[
                          { color: '#000000', name: 'Black' },
                          { color: '#ffffff', name: 'White' },
                          { color: '#6b7280', name: 'Grey' },
                          { color: '#ef4444', name: 'Red' },
                          { color: '#3b82f6', name: 'Blue' },
                          { color: '#10b981', name: 'Green' }
                        ].map((preset) => (
                          <button
                            key={preset.color}
                            onClick={() => setTemplateBackgroundColor(preset.color)}
                            className="w-5 h-5 rounded-full border border-panel-border hover:scale-110 transition-transform"
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="secondary" size="sm" className="px-2 py-1 h-7">
                      <Plus className="w-3 h-3 mr-1" />
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
                           onError={handleImageError}
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
            <div className="flex space-x-2 mb-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  // TODO: Implement clear all functionality  
                }}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  // TODO: Implement remove last functionality
                }}
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
              onClick={() => {
                // TODO: Implement start rendering functionality
              }}
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
    </ErrorBoundary>
  );
};

export default QuickPixl;