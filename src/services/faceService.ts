import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
import { ValidationResult, FaceDetectionInfo, FaceDebugInfo } from '../types/types';
import { loadModels } from './modelUtils';
import { isModelLoaded } from '../index';
import { setupCanvas, safeCreateCanvas } from '../utils/canvasSetup';
import * as napiCanvas from '@napi-rs/canvas';

// Configure TensorFlow.js for better performance and memory management
tf.enableProdMode();
tf.setBackend('tensorflow');

setupCanvas();

const config = {
  similarityThreshold: process.env.API_THRESHOLD ? parseFloat(process.env.API_THRESHOLD) : 0.75,
};

/**
 * Ensures tensor has correct shape and channels for face detection
 */
const normalizeTensor = (tensor: tf.Tensor3D): tf.Tensor3D => {
  const [height, width, channels] = tensor.shape;
  
  // Ensure we have 3 channels (RGB)
  if (channels === 4) {
    // Convert RGBA to RGB
    const rgbTensor = tensor.slice([0, 0, 0], [height, width, 3]) as tf.Tensor3D;
    tensor.dispose();
    return rgbTensor;
  } else if (channels === 1) {
    // Convert grayscale to RGB
    const rgbTensor = tf.stack([tensor, tensor, tensor], -1) as tf.Tensor3D;
    tensor.dispose();
    return rgbTensor;
  }
  
  return tensor;
};

const bufferToTensor = async (buffer: Buffer): Promise<tf.Tensor3D> => {
  try {
    const tensor = tf.node.decodeImage(buffer);

    if (tensor.shape.length === 4) {
      const squeezed = tensor.squeeze([0]) as tf.Tensor3D;
      tensor.dispose();
      return normalizeTensor(squeezed);
    }

    // Ensure the tensor has the correct shape and size
    const [height, width, channels] = tensor.shape;
    
    // Resize to a standard size if the image is too large or too small
    const maxDimension = 1024;
    const minDimension = 224;
    
    let resizedTensor = normalizeTensor(tensor as tf.Tensor3D);
    
    if (height > maxDimension || width > maxDimension) {
      const scale = Math.min(maxDimension / height, maxDimension / width);
      const newHeight = Math.round(height * scale);
      const newWidth = Math.round(width * scale);
      
      const tempTensor = tf.image.resizeBilinear(resizedTensor, [newHeight, newWidth]);
      resizedTensor.dispose();
      resizedTensor = tempTensor as tf.Tensor3D;
    } else if (height < minDimension || width < minDimension) {
      const scale = Math.max(minDimension / height, minDimension / width);
      const newHeight = Math.round(height * scale);
      const newWidth = Math.round(width * scale);
      
      const tempTensor = tf.image.resizeBilinear(resizedTensor, [newHeight, newWidth]);
      resizedTensor.dispose();
      resizedTensor = tempTensor as tf.Tensor3D;
    }
    
    return resizedTensor;
  } catch (error) {
    console.error('Error converting buffer to tensor:', error);
    throw new Error('Failed to convert image to tensor');
  }
};

const enhanceCanvasCompatibility = (canvas: napiCanvas.Canvas): napiCanvas.Canvas & Partial<HTMLCanvasElement> => {
  const enhancedCanvas = canvas as napiCanvas.Canvas & Partial<HTMLCanvasElement>;

  if (!enhancedCanvas.width || typeof enhancedCanvas.width !== 'number') {
    Object.defineProperty(enhancedCanvas, 'width', {
      value: canvas.width || 640,
      writable: true,
      enumerable: true
    });
  }

  if (!enhancedCanvas.height || typeof enhancedCanvas.height !== 'number') {
    Object.defineProperty(enhancedCanvas, 'height', {
      value: canvas.height || 480,
      writable: true,
      enumerable: true
    });
  }

  if (!enhancedCanvas.getContext) {
    enhancedCanvas.getContext = ((contextType: "2d", contextAttributes?: napiCanvas.ContextAttributes) => {
      return canvas.getContext(contextType, contextAttributes) as unknown as CanvasRenderingContext2D | null;
    }) as any;
  }

  return enhancedCanvas;
};

const loadImage = async (imagePath: string): Promise<tf.Tensor3D | (napiCanvas.Canvas & Partial<HTMLCanvasElement>)> => {
  try {
    const buffer = fs.readFileSync(imagePath);

    try {
      console.log(`Loading image as tensor: ${imagePath}`);
      const tensor = await bufferToTensor(buffer);
      
      // Verify tensor shape is valid
      const [height, width, channels] = tensor.shape;
      if (height <= 0 || width <= 0 || channels !== 3) {
        throw new Error(`Invalid tensor shape: ${height}x${width}x${channels}`);
      }
      
      return tensor;
    } catch (tensorError) {
      console.warn('Failed to load image as tensor:', tensorError);
      console.warn('Falling back to canvas approach...');

      try {
        const image = await napiCanvas.loadImage(buffer);

        // Use consistent dimensions for canvas
        const maxDimension = 1024;
        const minDimension = 224;
        
        let width = image.width || 640;
        let height = image.height || 480;
        
        // Resize if too large
        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        
        // Resize if too small
        if (width < minDimension || height < minDimension) {
          const scale = Math.max(minDimension / width, minDimension / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = safeCreateCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, width, height);

        return enhanceCanvasCompatibility(canvas);
      } catch (canvasError) {
        console.error('Failed to load image with canvas:', canvasError);
        throw new Error('Failed to load image with any available method');
      }
    }
  } catch (error: unknown) {
    console.error('Error loading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error loading image';
    throw new Error(`Failed to load image: ${errorMessage}`);
  }
};


const areAllModelsLoaded = (): boolean => {
  return isModelLoaded.ssdMobilenetv1 &&
         isModelLoaded.faceLandmark68Net &&
         isModelLoaded.faceRecognitionNet;
};

const extractFaceDetectionInfo = (detection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }>>) => {
  const detectionInfo: FaceDetectionInfo = {
    score: detection.detection.score,
    box: {
      x: detection.detection.box.x,
      y: detection.detection.box.y,
      width: detection.detection.box.width,
      height: detection.detection.box.height
    }
  };

  return detectionInfo;
};

export const compareFaces = async (image1Path: string, image2Path: string): Promise<ValidationResult> => {
  const startTime = Date.now();
  let usingMock = false;

  try {
    if (!areAllModelsLoaded()) {
      try {
        console.log('Models not loaded, loading now...');
        const loadResult = await loadModels();
        if (loadResult.success) {
          isModelLoaded.ssdMobilenetv1 = true;
          isModelLoaded.faceLandmark68Net = true;
          isModelLoaded.faceRecognitionNet = true;
        } else {
          console.error('Models loading failed:', loadResult.error);
          console.warn('Falling back to mock implementation due to model loading failure');
          usingMock = true;
          return useMockImplementation(image1Path, image2Path);
        }
      } catch (error) {
        console.error('Failed to load face-api.js models:', error);
        console.warn('Falling back to mock implementation due to model loading failure');
        usingMock = true;
        return useMockImplementation(image1Path, image2Path);
      }
    }

    try {
      if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
        throw new Error('SsdMobilenetv1 model is not loaded');
      }
      if (!faceapi.nets.faceLandmark68Net.isLoaded) {
        throw new Error('faceLandmark68Net model is not loaded');
      }
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        throw new Error('faceRecognitionNet model is not loaded');
      }

      const img1 = await loadImage(image1Path);
      const img2 = await loadImage(image2Path);

      console.log('Images loaded successfully, detecting faces...');
      
      // Log tensor information for debugging
      if (img1 instanceof tf.Tensor) {
        console.log(`Image 1 tensor shape: ${img1.shape.join('x')}`);
      }
      if (img2 instanceof tf.Tensor) {
        console.log(`Image 2 tensor shape: ${img2.shape.join('x')}`);
      }

      let detection1;
      try {
        detection1 = await faceapi.detectSingleFace(img1 as faceapi.TNetInput)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection1) {
          throw new Error('No face detected in first image');
        }
      } catch (detectionError: unknown) {
        const errorMessage = detectionError instanceof Error
          ? detectionError.message
          : 'Unknown detection error';
        console.error('Face detection error on image 1:', errorMessage);
        throw new Error(`Face detection failed on first image: ${errorMessage}`);
      }

      let detection2;
      try {
        detection2 = await faceapi.detectSingleFace(img2 as faceapi.TNetInput)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection2) {
          throw new Error('No face detected in second image');
        }
      } catch (detectionError: unknown) {
        const errorMessage = detectionError instanceof Error
          ? detectionError.message
          : 'Unknown detection error';
        console.error('Face detection error on image 2:', errorMessage);
        throw new Error(`Face detection failed on second image: ${errorMessage}`);
      }

      console.log('Face detection successful, comparing faces...');

      const distance = faceapi.euclideanDistance(
        detection1.descriptor,
        detection2.descriptor
      );


      const similarity = 1 - Math.min(distance, 1.0);
      const isMatch = similarity >= config.similarityThreshold;

      console.log(`Face comparison complete: match=${isMatch}, similarity=${similarity.toFixed(4)}`);

      const processingTimeMs = Date.now() - startTime;
      const debugInfo: FaceDebugInfo = {
        threshold: config.similarityThreshold,
        rawDistance: distance,
        faceDetection1: extractFaceDetectionInfo(detection1),
        faceDetection2: extractFaceDetectionInfo(detection2),
        processingTimeMs,
        usingMockImplementation: false
      };

      if (img1 instanceof tf.Tensor) img1.dispose();
      if (img2 instanceof tf.Tensor) img2.dispose();

      return {
        isMatch,
        similarity,
        debugInfo
      };
    } catch (error) {
      console.error('Error in face detection/comparison:', error);
      console.warn('Falling back to mock implementation due to face detection failure');
      usingMock = true;
      return useMockImplementation(image1Path, image2Path);
    }
  } catch (error) {
    console.error('Error in face comparison:', error);
    throw error;
  }
};

/**
 */
const useMockImplementation = (image1Path: string, image2Path: string): ValidationResult => {
  console.log('Using mock implementation for face comparison');

  const isSameFile = path.basename(image1Path) === path.basename(image2Path);

  if (isSameFile) {
    return {
      isMatch: true,
      similarity: 0.95,
      debugInfo: {
        threshold: config.similarityThreshold,
        rawDistance: 0.05,
        processingTimeMs: 0,
        usingMockImplementation: true
      }
    };
  }

  const combinedPaths = image1Path + image2Path;
  let mockSimilarity = 0;

  for (let i = 0; i < combinedPaths.length; i++) {
    mockSimilarity += combinedPaths.charCodeAt(i);
  }

  mockSimilarity = (mockSimilarity % 100) / 100;

  const isMatch = mockSimilarity >= config.similarityThreshold;

  return {
    isMatch,
    similarity: mockSimilarity,
    debugInfo: {
      threshold: config.similarityThreshold,
      rawDistance: 1 - mockSimilarity,
      processingTimeMs: 0,
      usingMockImplementation: true
    }
  };
};