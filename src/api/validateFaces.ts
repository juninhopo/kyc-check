import express, { Request, Response, Router } from 'express';
import { compareFaces } from '../services/faceService';
import { cleanupFiles } from '../utils/imageUtils';
import { ValidationResponse } from '../types/types';
import { upload } from '../utils/upload';
import fs from 'fs';
import path from 'path';
import os from 'os';

const router: Router = express.Router();

const saveBufferToTempFile = (buffer: Buffer, extension: string): string => {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${extension}`);
  fs.writeFileSync(tempFilePath, buffer);
  return tempFilePath;
};

router.post('/', 
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]), 
  async (req: Request, res: Response) => {
    const tempFiles: string[] = [];
    
    try {
      if (!req.files || !("image1" in req.files) || !("image2" in req.files)) {
        return res.status(400).json({
          success: false,
          error: 'Two images are required for comparison'
        } satisfies ValidationResponse);
      }

      const image1 = req.files.image1[0];
      const image2 = req.files.image2[0];
      
      const ext1 = path.extname(image1.originalname);
      const ext2 = path.extname(image2.originalname);
      
      const tempPath1 = saveBufferToTempFile(image1.buffer, ext1);
      const tempPath2 = saveBufferToTempFile(image2.buffer, ext2);
      
      tempFiles.push(tempPath1, tempPath2);

      try {
        const result = await compareFaces(tempPath1, tempPath2);

        cleanupFiles(tempFiles);

        return res.json({
          success: true,
          data: result
        } satisfies ValidationResponse);
      } catch (error) {
        cleanupFiles(tempFiles);
        
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
      if (tempFiles.length > 0) {
        cleanupFiles(tempFiles);
      }
      
      console.error('Error in face validation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar a comparação facial. Por favor, tente novamente.'
      } satisfies ValidationResponse);
    }
  }
);

export default router; 