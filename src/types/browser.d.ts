// TypeScript declarations for browser APIs

declare global {
  interface Window {
    EyeDropper?: {
      new (): EyeDropper;
    };
  }

  interface EyeDropper {
    open(): Promise<{
      sRGBHex: string;
    }>;
  }
}

export {};