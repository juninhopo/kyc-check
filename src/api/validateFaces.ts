/**
 * Face validation API endpoint
 */

import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { compareFaces } from '../services/faceService';
import { isValidImage, cleanupFiles } from '../utils/imageUtils';
import { ValidationResponse } from '../types/types';

// Define the router
const router: Router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Define the extended request type
interface MulterRequest extends Request {
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
}

/**
 * POST /api/validate-faces
 * Compare two face images and determine if they match
 */
router.post('/', 
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]), 
  async (req: Request, res: Response) => {
    try {
      const multerReq = req as MulterRequest;
      
      // Check if files exist
      if (!multerReq.files || !multerReq.files.image1 || !multerReq.files.image2) {
        return res.status(400).json({
          success: false,
          error: 'Two images are required for comparison'
        } as ValidationResponse);
      }

      const image1 = multerReq.files.image1[0];
      const image2 = multerReq.files.image2[0];

      // Validate images
      if (!isValidImage(image1) || !isValidImage(image2)) {
        // Clean up files
        cleanupFiles([image1.path, image2.path]);
        
        return res.status(400).json({
          success: false,
          error: 'Invalid image format. Only JPG, JPEG, and PNG are supported.'
        } as ValidationResponse);
      }

      try {
        // Compare faces
        const result = await compareFaces(image1.path, image2.path);

        // Clean up temporary files
        cleanupFiles([image1.path, image2.path]);

        return res.json({
          success: true,
          data: result
        } as ValidationResponse);
      } catch (error) {
        // Clean up temporary files even on error
        cleanupFiles([image1.path, image2.path]);
        
        // Check for specific error types
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('Could not detect face')) {
          return res.status(400).json({
            success: false,
            error: 'Faces não detectados em uma ou ambas as imagens. Por favor, utilize imagens com rostos claramente visíveis.'
          } as ValidationResponse);
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error in face validation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar a comparação facial. Por favor, tente novamente.'
      } as ValidationResponse);
    }
  }
);

export default router; 