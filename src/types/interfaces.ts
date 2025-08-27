// Shared interfaces for the application

export interface Container {
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

export interface Variation {
  id: string;
  colors: string[];
  images: File[];
  description: string;
}

export interface Template {
  id: number;
  title: string;
  size: string;
  image: string;
  category: string;
}

export interface TemplateVariation {
  id: string;
  templates: Template[];
  description: string;
}

export interface FontVariation {
  id: string;
  fonts: string[];
  description: string;
}

export interface TextInput {
  id: string;
  text: string;
}

export interface ImageInput {
  id: string;
  selectedImages: File[];
  selectionMode: 'single' | 'multiple';
}

export interface TypographySettings {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textCase: 'normal' | 'uppercase' | 'lowercase';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  wordSpacing: number;
  textStroke: boolean;
  strokeWidth: number;
  strokeColor: string;
}

export interface TypographyVariation {
  id: string;
  settings: TypographySettings;
  description: string;
}

export interface ShapeSettings {
  none: null;
  circle: {
    radius: number;
    startAngle: number;
    direction: 'clockwise' | 'counter-clockwise';
  };
  arc: {
    radius: number;
    arcAngle: number;
    flip: boolean;
  };
  arch: {
    height: number;
    curve: number;
  };
  angle: {
    angle: number;
    skew: number;
  };
  flag: {
    waveHeight: number;
    waveLength: number;
    reverse: boolean;
  };
  wave: {
    amplitude: number;
    frequency: number;
    phase: number;
  };
  distort: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
    intensity: number;
  };
}

export interface TextShapeVariation {
  id: string;
  shape: keyof ShapeSettings;
  settings: ShapeSettings[keyof ShapeSettings];
  description: string;
}

export interface RotateFlipSettings {
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface RotateFlipVariation {
  id: string;
  settings: RotateFlipSettings;
  description: string;
}

export interface ColorFillSettings {
  mode: 'solid' | 'gradient' | 'palette' | 'image';
  solid: {
    color: string;
  };
  gradient: {
    type: 'linear' | 'radial' | 'conic';
    angle: number;
    stops: {
      id: string;
      color: string;
      position: number;
    }[];
  };
  palette: {
    source: 'rgb' | 'cmyk' | 'hsl' | 'component' | 'image';
    colors: {
      id: string;
      value: string | number;
      type: 'manual' | 'component' | 'extracted';
    }[];
    componentInput: number;
    randomize: boolean;
    extractedImage?: File;
  };
  image: {
    mode: 'single' | 'multiple';
    images: File[];
    opacity: number;
    randomize: boolean;
  };
}

export interface ImageColorFillSettings {
  mode: 'solid' | 'gradient' | 'image';
  solid: {
    color: string;
  };
  gradient: {
    type: 'linear' | 'radial' | 'conic';
    angle: number;
    stops: {
      id: string;
      color: string;
      position: number;
    }[];
  };
  image: {
    mode: 'single';
    images: File[];
    opacity: number;
    randomize: boolean;
  };
}

export interface ColorFillVariation {
  id: string;
  settings: ColorFillSettings;
  description: string;
}

export interface ImageColorFillVariation {
  id: string;
  settings: ImageColorFillSettings;
  description: string;
}

export interface SingleStroke {
  id: string;
  width: number;
  color: string;
  opacity: number;
  offset: number;
  blur: number;
  size?: number;
  fillType?: 'solid' | 'gradient' | 'image';
  gradient?: {
    type: 'linear' | 'radial' | 'conic';
    angle: number;
    stops: {
      id: string;
      color: string;
      position: number;
    }[];
  };
  images?: File[];
}

export interface StrokeSettings {
  regular: {
    strokes: SingleStroke[];
  };
  character: {
    strokes: SingleStroke[];
    differentStrokePerCharacter: boolean;
    perCharacterTransforms: {
      widthScale: number;
      heightScale: number;
      rotation: number;
      xOffset: number;
      yOffset: number;
    };
    randomizeTransforms: boolean;
  };
  container: {
    strokes: SingleStroke[];
  };
  knockout: {
    enabled: boolean;
    size: number;
  };
}

export interface ImageStrokeSettings {
  regular: {
    strokes: SingleStroke[];
  };
  container: {
    strokes: SingleStroke[];
  };
  knockout: {
    enabled: boolean;
    size: number;
  };
}

export interface StrokesVariation {
  id: string;
  settings: StrokeSettings;
  description: string;
}

export interface ImageStrokesVariation {
  id: string;
  settings: ImageStrokeSettings;
  description: string;
}

export interface CharacterSettings {
  width: number;
  height: number;
  verticalOffset: number;
  rotation: number;
}

export interface CharacterEffectsSettings {
  characters: CharacterSettings[];
  rotationMode: 'individual' | 'progressive' | 'wave' | 'mirror' | 'random';
  alignment: 'none' | 'top' | 'center' | 'bottom' | 'baseline';
  mirrorRotationValue?: number;
  waveRotationStart?: number;
  waveRotationEnd?: number;
}

export interface CharacterEffectsVariation {
  id: string;
  settings: CharacterEffectsSettings;
  description: string;
}

export interface ImageEffectsSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  vibrance?: number;
  hue: number;
  colorize: boolean;
  grayscale: boolean;
  invert: boolean;
}

export interface ImageEffectsVariation {
  id: string;
  settings: ImageEffectsSettings;
  description: string;
}

export interface DropShadow {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
  fillType?: 'solid' | 'gradient' | 'image';
  gradient?: {
    type: 'linear' | 'radial' | 'conic';
    angle: number;
    stops: {
      id: string;
      color: string;
      position: number;
    }[];
  };
  images?: File[];
}

export interface DropShadowSettings {
  mode: 'regular' | 'character';
  regular: {
    shadows: DropShadow[];
  };
  character: {
    characters: {
      id: string;
      characterIndex: number;
      shadows: DropShadow[];
    }[];
  };
}

export interface DropShadowVariation {
  id: string;
  settings: DropShadowSettings;
  description: string;
}

export interface ImageDropShadowSettings {
  shadows: DropShadow[];
}

export interface ImageDropShadowVariation {
  id: string;
  settings: ImageDropShadowSettings;
  description: string;
}

export interface ImageInputSettings {
  selectedImages: File[];
  selectionMode: 'single' | 'multiple';
}

export interface ImagePluginSettings {
  imageInput: ImageInputSettings;
  imageEffects: ImageEffectsSettings;
  // Add other image-specific plugin settings here as needed
}

export interface ImageTabSettings {
  global: ImagePluginSettings;
  inputs: {
    [key: string]: ImagePluginSettings; // II1, II2, etc.
  };
}

export type AnyVariation = 
  | Variation
  | TemplateVariation 
  | FontVariation 
  | TypographyVariation 
  | TextShapeVariation 
  | RotateFlipVariation 
  | ColorFillVariation 
  | StrokesVariation 
  | CharacterEffectsVariation 
  | ImageEffectsVariation 
  | DropShadowVariation
  | ImageColorFillVariation
  | ImageStrokesVariation
  | ImageDropShadowVariation;