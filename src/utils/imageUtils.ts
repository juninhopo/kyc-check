/**
 * Utility functions for image handling
 */

import fs from 'fs';


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