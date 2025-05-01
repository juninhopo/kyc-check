import { fileTypeFromBuffer } from 'file-type';

export const verifyFileType = async (buffer: Buffer) => {
  try {
    const type = await fileTypeFromBuffer(buffer);
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (!type || !validMimeTypes.includes(type.mime)) {
      return {
        valid: false,
        message: 'Invalid image format. Only JPG, JPEG, and PNG are supported.'
      };
    }

    return {
      valid: true,
      mime: type.mime
    };
  } catch (error) {
    console.error('Error verifying file type:', error);
    return {
      valid: false,
      message: 'Error validating file type'
    };
  }
}; 