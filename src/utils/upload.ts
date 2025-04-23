/**
 * File upload middleware configuration
 */

import multer from 'multer';
import path from 'path';

// Setup file uploads
export const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req, file, cb) => {
    try {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const validExtensions = ['.jpg', '.jpeg', '.png'];
      
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      // Check if the file extension is valid
      if (!validExtensions.includes(fileExtension)) {
        return cb(new Error('Invalid file extension. Only JPG, JPEG, and PNG are supported.'));
      }
      
      // Check if the mimetype is valid
      if (!validMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are supported.'));
      }
      
      return cb(null, true);
    } catch (error) {
      console.error(error);
      return cb(new Error('Error validating file'));
    }
  }
}); 