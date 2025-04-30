/**
 * File upload middleware configuration
 */

import multer from 'multer';
import path from 'path';
import fs from "fs"
import { fileTypeFromBuffer } from 'file-type';
import { cleanupFiles } from './imageUtils';

// Setup file uploads
export const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: async (_req, file, cb) => {
    try {
    const filePath = file.path;

    const buffer = fs.readFileSync(filePath);

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validExtensions = ['.jpg', '.jpeg', '.png'] 
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    const type = await fileTypeFromBuffer(buffer);

    if (!validExtensions.includes(fileExtension) || !type || !validMimeTypes.includes(type.mime)) {
       cleanupFiles([file.path]);

      return cb(new Error('Invalid image format. Only JPG, JPEG, and PNG are supported.'));
    }
    
    return cb(null, true);

  } catch (error) {
      console.error(error)

      return cb(new Error('Error validating file'));
    }
  }
});