/**
 * Canvas setup utility for face-api.js
 *
 * This utility centralizes configuration for @napi-rs/canvas to work properly with face-api.js
 * in a Node.js environment. It addresses common issues with canvas compatibility when
 * using face-api.js outside of a browser context.
 */

import * as faceapi from '@vladmandic/face-api';
import * as napiCanvas from '@napi-rs/canvas';

// Default dimensions for canvases if none are provided
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

/**
 * Enhanced ImageData class that adds browser-compatible properties
 * as expected by face-api.js
 */
export class EnhancedImageData extends napiCanvas.ImageData {
  readonly colorSpace: PredefinedColorSpace = 'srgb';

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    super(data, width, height);
  }
}

/**
 * Safe canvas creation function that ensures valid dimensions
 * This avoids the "Failed to convert napi value Undefined into rust type `i32`" error
 * by providing fallback values for width and height
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

    // Apply monkey patch with safe implementations
    faceapi.env.monkeyPatch({
      Canvas: napiCanvas.Canvas as unknown as typeof HTMLCanvasElement,
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