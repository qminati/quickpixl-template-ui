interface EyeDropper {
  open(): Promise<{ sRGBHex: string }>;
}

interface EyeDropperConstructor {
  new (): EyeDropper;
}

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

export {};