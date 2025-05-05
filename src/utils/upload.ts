import multer from 'multer';
import path from 'path';
import fs from "fs"
import { fileTypeFromBuffer } from 'file-type';
import { cleanupFiles } from './imageUtils';

export const upload = multer({
  storage: multer.memoryStorage(), // Usar armazenamento em memória em vez de disco
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: async (_req, file, cb) => {
    try {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const validExtensions = ['.jpg', '.jpeg', '.png']

      const fileExtension = path.extname(file.originalname).toLowerCase();

      if (!validExtensions.includes(fileExtension) || !validMimeTypes.includes(file.mimetype)) {
        console.log('Invalid image format. Only JPG, JPEG, and PNG are supported.')
        return cb(new Error('Invalid image format. Only JPG, JPEG, and PNG are supported.'));
      }

      return cb(null, true);

    } catch (error) {
      console.error(error)

      return cb(new Error('Error validating file'));
    }
  }
});