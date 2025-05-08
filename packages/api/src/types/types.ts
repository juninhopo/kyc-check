export type ValidationResponse = {
  success: boolean;
  data?: ValidationResult;
  error?: string;
};

export type ValidationResult = {
  isMatch: boolean;
  similarity: number;
  debugInfo?: FaceDebugInfo;
};

export type FaceDebugInfo = {
  threshold: number;
  rawDistance: number;
  faceDetection1?: FaceDetectionInfo;
  faceDetection2?: FaceDetectionInfo;
  processingTimeMs: number;
  usingMockImplementation: boolean;
};

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

export type ImageValidationArgs = {
  image: Express.Multer.File;
};

export type FaceComparisonArgs = {
  image1Path: string;
  image2Path: string;
};