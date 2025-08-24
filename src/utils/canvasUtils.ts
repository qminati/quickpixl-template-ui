// Canvas and container validation utilities

export interface CanvasValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ContainerValidationResult {
  isValid: boolean;
  error?: string;
}

// Canvas dimension limits
export const MIN_CANVAS_SIZE = 100;
export const MAX_CANVAS_SIZE = 8192;

// Container property limits
export const MIN_CONTAINER_SIZE = 10;
export const MAX_CONTAINER_SIZE = 4096;

/**
 * Validates canvas dimensions
 */
export const validateCanvasDimensions = (width: number, height: number): CanvasValidationResult => {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return {
      isValid: false,
      error: 'Canvas dimensions must be whole numbers'
    };
  }

  if (width < MIN_CANVAS_SIZE || height < MIN_CANVAS_SIZE) {
    return {
      isValid: false,
      error: `Canvas dimensions must be at least ${MIN_CANVAS_SIZE}px`
    };
  }

  if (width > MAX_CANVAS_SIZE || height > MAX_CANVAS_SIZE) {
    return {
      isValid: false,
      error: `Canvas dimensions cannot exceed ${MAX_CANVAS_SIZE}px`
    };
  }

  return { isValid: true };
};

/**
 * Validates container properties
 */
export const validateContainer = (
  container: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  canvasWidth: number,
  canvasHeight: number
): ContainerValidationResult => {
  const { x, y, width, height } = container;

  // Validate container dimensions
  if (width < MIN_CONTAINER_SIZE || height < MIN_CONTAINER_SIZE) {
    return {
      isValid: false,
      error: `Container must be at least ${MIN_CONTAINER_SIZE}px wide and tall`
    };
  }

  if (width > MAX_CONTAINER_SIZE || height > MAX_CONTAINER_SIZE) {
    return {
      isValid: false,
      error: `Container cannot exceed ${MAX_CONTAINER_SIZE}px in width or height`
    };
  }

  // Validate container position (must be within canvas bounds)
  if (x < 0 || y < 0) {
    return {
      isValid: false,
      error: 'Container position cannot be negative'
    };
  }

  if (x + width > canvasWidth || y + height > canvasHeight) {
    return {
      isValid: false,
      error: 'Container extends outside canvas boundaries'
    };
  }

  return { isValid: true };
};

/**
 * Clamps a value within bounds
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Ensures container stays within canvas bounds
 */
export const constrainContainer = (
  container: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  canvasWidth: number,
  canvasHeight: number
) => {
  return {
    ...container,
    x: clamp(container.x, 0, canvasWidth - container.width),
    y: clamp(container.y, 0, canvasHeight - container.height),
    width: clamp(container.width, MIN_CONTAINER_SIZE, Math.min(MAX_CONTAINER_SIZE, canvasWidth)),
    height: clamp(container.height, MIN_CONTAINER_SIZE, Math.min(MAX_CONTAINER_SIZE, canvasHeight))
  };
};