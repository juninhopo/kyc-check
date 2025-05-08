import { fileTypeFromBuffer } from 'file-type';

export const verifyFileType = async (buffer: Buffer) => {
  try {
    const type = await fileTypeFromBuffer(buffer);

    const validMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/svg+xml',
      'image/heic',
      'image/heif'
    ];

    if (!type) {
      try {
        const tf = require('@tensorflow/tfjs-node');
        tf.node.decodeImage(buffer);
        return {
          valid: true,
          mime: 'image/unknown'
        };
      } catch (decodeError) {
        return {
          valid: false,
          message: 'Não foi possível detectar um formato de imagem válido.'
        };
      }
    }

    if (!validMimeTypes.includes(type.mime)) {
      return {
        valid: false,
        message: `Formato de imagem não suportado: ${type.mime}. Por favor, utilize JPG, PNG, WEBP, GIF, BMP, TIFF, SVG, HEIC ou HEIF.`
      };
    }

    return {
      valid: true,
      mime: type.mime
    };
  } catch (error) {
    console.error('Erro verificando tipo de arquivo:', error);

    try {
      const tf = require('@tensorflow/tfjs-node');
      tf.node.decodeImage(buffer);
      return {
        valid: true,
        mime: 'image/unknown'
      };
    } catch (decodeError) {
      return {
        valid: false,
        message: 'Erro ao validar o tipo de arquivo. Verifique se é uma imagem válida.'
      };
    }
  }
};