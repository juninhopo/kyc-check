import multer from 'multer';
import path from 'path';
import fs from "fs";
import { verifyFileType } from './fileTypeVerifier';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: async (_req, file, cb) => {
    try {
      if (!file.mimetype.startsWith('image/')) {
        console.log(`Formato potencialmente não suportado: ${file.mimetype}`);
      }

      return cb(null, true);
    } catch (error) {
      console.error('Erro durante filtro de upload:', error);
      return cb(null, true);
    }
  }
});