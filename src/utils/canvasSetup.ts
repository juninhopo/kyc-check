/**
 * Canvas setup utility for face-api.js
 * This file provides a unified configuration for @napi-rs/canvas
 * to work properly with face-api.js in Node.js environment
 */

import * as faceapi from '@vladmandic/face-api';
import * as napiCanvas from '@napi-rs/canvas';

// Default dimensions for canvases if none are provided
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

/**
 * Enhanced ImageData class that adds browser-compatible properties
 */
export class EnhancedImageData extends napiCanvas.ImageData {
  readonly colorSpace: PredefinedColorSpace = 'srgb';

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    super(data, width, height);
  }
}

/**
 * Safe canvas creation function that ensures valid dimensions
 */
export const safeCreateCanvas = (width?: unknown, height?: unknown): napiCanvas.Canvas => {
  // Ensure width is a positive number
  const validWidth = typeof width === 'number' && width > 0
    ? width
    : DEFAULT_WIDTH;

  // Ensure height is a positive number
  const validHeight = typeof height === 'number' && height > 0
    ? height
    : DEFAULT_HEIGHT;

  return new napiCanvas.Canvas(validWidth, validHeight);
};

/**
 * Safe image creation function
 */
export const safeCreateImage = async (): Promise<napiCanvas.Image> => {
  return new napiCanvas.Image();
};

/**
 * Configures face-api.js to use @napi-rs/canvas safely
 */
export const setupCanvas = (): void => {
  try {
    console.log('Setting up @napi-rs/canvas for face-api.js...');

    // Create a wrapper for Canvas constructor that enforces valid dimensions
    const CanvasWrapper = function(width?: number, height?: number): napiCanvas.Canvas {
      return safeCreateCanvas(width, height);
    } as unknown as typeof HTMLCanvasElement;

    // Apply monkey patch with our safe implementations
    faceapi.env.monkeyPatch({
      Canvas: CanvasWrapper,
      Image: napiCanvas.Image as unknown as typeof HTMLImageElement,
      ImageData: EnhancedImageData as unknown as typeof ImageData,
      createCanvasElement: safeCreateCanvas as unknown as any,
      createImageElement: safeCreateImage as unknown as any
    });

    console.log('@napi-rs/canvas setup completed successfully');
  } catch (error) {
    console.error('Error setting up @napi-rs/canvas:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export default {
  setupCanvas,
  safeCreateCanvas,
  safeCreateImage,
  EnhancedImageData
};