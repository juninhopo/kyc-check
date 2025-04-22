/**
 * Face validation API endpoint
 */

import express, { Request, Response, Router } from 'express';
import { compareFaces } from '../services/faceService';
import { cleanupFiles } from '../utils/imageUtils';
import { ValidationResponse } from '../types/types';
import { upload } from '../';

// Define the router
const router: Router = express.Router();

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

      // Check if files exist

      // TODO: ideally, we should validate if the file exists and also if it's a file 
      if (!req.files || !("image1" in req.files) || !("image2" in req.files)) {
        return res.status(400).json({
          success: false,
          error: 'Two images are required for comparison'
        } satisfies ValidationResponse);
      }

      const image1 = req!.files.image1[0];
      const image2 = req!.files.image2[0];

      try {
        // Compare faces
        const result = await compareFaces(image1.path, image2.path);

        // Clean up temporary files
        cleanupFiles([image1.path, image2.path]);

        return res.json({
          success: true,
          data: result
        } satisfies ValidationResponse);
      } catch (error) {
        // Clean up temporary files even on error
        cleanupFiles([image1.path, image2.path]);
        
        // Check for specific error types
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('Could not detect face')) {
          return res.status(400).json({
            success: false,
            error: 'Faces não detectados em uma ou ambas as imagens. Por favor, utilize imagens com rostos claramente visíveis.'
          } satisfies ValidationResponse);
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error in face validation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar a comparação facial. Por favor, tente novamente.'
      } satisfies ValidationResponse);
    }
  }
);

export default router; 