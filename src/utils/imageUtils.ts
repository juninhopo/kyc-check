/**
 * Utility functions for image handling
 */

import path from 'path';
import fs from 'fs';
import { Express } from 'express';

/**
 * Check if a file is a valid image based on mimetype and extension
 */
export const isValidImage = (file: Express.Multer.File): boolean => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'] as const;
  const validExtensions = ['.jpg', '.jpeg', '.png'] as const;
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  return (
    validMimeTypes.includes(file.mimetype as any) &&
    validExtensions.includes(fileExtension as any)
  );
};

/**
 * Clean up temporary uploaded files
 */
export const cleanupFiles = (filePaths: string[]): void => {
  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}; 