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

export interface TypographySettings {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textCase: 'normal' | 'uppercase' | 'lowercase';
  letterSpacing: number;
  wordSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textStroke: boolean;
  strokeWidth?: number;
  strokeColor?: string;
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
  settings: any;
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
    stops: Array<{
      id: string;
      color: string;
      position: number;
    }>;
  };
  palette: {
    source: 'rgb' | 'component' | 'image';
    colors: Array<{
      id: string;
      value: string | number;
      type: 'manual' | 'component' | 'extracted';
    }>;
    componentInput: number;
    extractedImage?: File;
    randomize: boolean;
  };
  image: {
    mode: 'single' | 'multiple';
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