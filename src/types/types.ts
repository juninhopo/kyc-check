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