import express, { Request, Response, Router } from 'express';
import { compareFaces } from '../services/faceService';
import { cleanupFiles } from '../utils/imageUtils';
import { ValidationResponse } from '../types/types';
import { upload } from '../utils/upload';
import fs from 'fs';
import path from 'path';
import os from 'os';

const router: Router = express.Router();

// Traduções para mensagens de erro
const errorMessages = {
  'pt': {
    'facesNotDetected': 'Faces não detectados em uma ou ambas as imagens. Por favor, utilize imagens com rostos claramente visíveis.',
    'processingError': 'Erro ao processar a comparação facial. Por favor, tente novamente.'
  },
  'en': {
    'facesNotDetected': 'Faces not detected in one or both images. Please use images with clearly visible faces.',
    'processingError': 'Error processing facial comparison. Please try again.'
  }
};

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
    // Verificar idioma da requisição (padrão é português)
    const lang = req.headers['accept-language']?.includes('en') ? 'en' : 'pt';

    try {
      // Verificar se existem arquivos enviados
      if (!req.files || Array.isArray(req.files)) {
        throw new Error('No files uploaded');
      }

      const fileFields = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Verificar se as duas imagens foram enviadas
      if (!fileFields.image1 || !fileFields.image2 ||
          !fileFields.image1[0] || !fileFields.image2[0]) {
        throw new Error('Missing required image files');
      }

      const image1 = fileFields.image1[0];
      const image2 = fileFields.image2[0];

      // Salvar os buffers como arquivos temporários
      const image1Path = saveBufferToTempFile(image1.buffer, path.extname(image1.originalname));
      const image2Path = saveBufferToTempFile(image2.buffer, path.extname(image2.originalname));

      tempFiles.push(image1Path, image2Path);

      try {
        // Comparar faces
        const result = await compareFaces(image1Path, image2Path);

        // Limpar arquivos temporários
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