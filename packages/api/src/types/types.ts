/**
 * Type definitions for FaceCheck
 */

/**
 * Response for validation API endpoints
 */
export type ValidationResponse = {
  success: boolean;
  data?: ValidationResult;
  error?: string;
};

/**
 * Result of face validation
 */
export type ValidationResult = {
  isMatch: boolean;
  similarity: number;
  debugInfo?: FaceDebugInfo;
};

/**
 * Debug information about face detection and comparison
 */
export type FaceDebugInfo = {
  threshold: number;
  rawDistance: number;
  faceDetection1?: FaceDetectionInfo;
  faceDetection2?: FaceDetectionInfo;
  processingTimeMs: number;
  usingMockImplementation: boolean;
};

/**
 * Face detection information
 */
export type FaceDetectionInfo = {
  score: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: Record<string, unknown>;
};

/**
 * Arguments for image validation
 */
export type ImageValidationArgs = {
  image: Express.Multer.File;
};

/**
 * Arguments for face comparison
 */
export type FaceComparisonArgs = {
  image1Path: string;
  image2Path: string;
}; 