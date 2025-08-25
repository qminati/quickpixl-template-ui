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