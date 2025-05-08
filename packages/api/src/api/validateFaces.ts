import express, { Request, Response, Router } from 'express';
import { compareFaces } from '../services/faceService';
import { cleanupFiles } from '../utils/imageUtils';
import { ValidationResponse } from '../types/types';
import { upload } from '../utils/upload';
import { verifyFileType } from '../utils/fileTypeVerifier';
import fs from 'fs';
import path from 'path';
import os from 'os';

const router: Router = express.Router();

const errorMessages = {
  'pt': {
    'facesNotDetected': 'Faces não detectados em uma ou ambas as imagens. Por favor, utilize imagens com rostos claramente visíveis.',
    'processingError': 'Erro ao processar a comparação facial. Por favor, tente novamente.',
    'invalidFileFormat': 'Formato de imagem inválido. Por favor, utilize uma imagem em um formato comum (JPG, PNG, WEBP, etc.)'
  },
  'en': {
    'facesNotDetected': 'Faces not detected in one or both images. Please use images with clearly visible faces.',
    'processingError': 'Error processing facial comparison. Please try again.',
    'invalidFileFormat': 'Invalid image format. Please use an image in a common format (JPG, PNG, WEBP, etc.)'
  }
};

const saveBufferToTempFile = (buffer: Buffer, extension: string): string => {
  const safeExtension = extension.startsWith('.') ? extension : `.${extension}`;

  const finalExtension = (!safeExtension || safeExtension === '.') ? '.tmp' : safeExtension;

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${finalExtension}`);
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
    const lang = req.headers['accept-language']?.includes('en') ? 'en' : 'pt';

    try {
      if (!req.files || Array.isArray(req.files)) {
        throw new Error('No files uploaded');
      }

      const fileFields = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!fileFields.image1 || !fileFields.image2 ||
          !fileFields.image1[0] || !fileFields.image2[0]) {
        throw new Error('Missing required image files');
      }

      const image1 = fileFields.image1[0];
      const image2 = fileFields.image2[0];

      const fileCheck1 = await verifyFileType(image1.buffer);
      const fileCheck2 = await verifyFileType(image2.buffer);

      if (!fileCheck1.valid || !fileCheck2.valid) {
        return res.status(400).json({
          success: false,
          error: errorMessages[lang].invalidFileFormat
        } satisfies ValidationResponse);
      }

      console.log(`Processando imagens - Tipo 1: ${fileCheck1.mime}, Tipo 2: ${fileCheck2.mime}`);

      const getExtension = (file: Express.Multer.File, mime?: string) => {
        if (!mime || mime === 'image/unknown') {
          return path.extname(file.originalname).toLowerCase() || '.jpg';
        }

        const mimeToExt: Record<string, string> = {
          'image/jpeg': '.jpg',
          'image/jpg': '.jpg',
          'image/png': '.png',
          'image/webp': '.webp',
          'image/gif': '.gif',
          'image/bmp': '.bmp',
          'image/tiff': '.tiff',
          'image/svg+xml': '.svg',
          'image/heic': '.heic',
          'image/heif': '.heif'
        };

        return mimeToExt[mime] || '.jpg';
      };

      const image1Path = saveBufferToTempFile(image1.buffer, getExtension(image1, fileCheck1.mime));
      const image2Path = saveBufferToTempFile(image2.buffer, getExtension(image2, fileCheck2.mime));

      tempFiles.push(image1Path, image2Path);

      try {
        const result = await compareFaces(image1Path, image2Path);

        cleanupFiles(tempFiles);

        return res.json({
          success: true,
          data: result
        } satisfies ValidationResponse);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('Could not detect face') ||
            errorMessage.includes('No face detected')) {
          return res.status(400).json({
            success: false,
            error: errorMessages[lang].facesNotDetected
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
        error: errorMessages[lang].processingError
      } satisfies ValidationResponse);
    }
  }
);

export default router;