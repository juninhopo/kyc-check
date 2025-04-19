/**
 * Face recognition service
 */

import * as faceapi from 'face-api.js';
import fs from 'fs';
import path from 'path';
import { ValidationResult } from '../types/types';

// Canvas is required for face-api.js to work
// Need to set up canvas for Node.js environment
const canvas = require('canvas');
// Configure face-api.js to use canvas
faceapi.env.monkeyPatch({ Canvas: canvas.Canvas, Image: canvas.Image, ImageData: canvas.ImageData });

/**
 * Configuration for face comparison
 */
const config = {
  similarityThreshold: process.env.API_THRESHOLD ? parseFloat(process.env.API_THRESHOLD) : 0.75,
};

/**
 * Load the face detection models
 */
const loadModels = async (): Promise<void> => {
  const modelsPath = path.join(__dirname, '../../models');
  
  // Check if models directory exists, if not create it
  if (!fs.existsSync(modelsPath)) {
    fs.mkdirSync(modelsPath, { recursive: true });
  }
  
  await Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath),
    faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath),
    faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath)
  ]);
};

/**
 * Load an image file to be processed by face-api
 */
const loadImage = async (imagePath: string): Promise<any> => {
  const buffer = fs.readFileSync(imagePath);
  const image = await canvas.loadImage(buffer);
  return image;
};

/**
 * Compare two face images and determine if they belong to the same person
 */
export const compareFaces = async (image1Path: string, image2Path: string): Promise<ValidationResult> => {
  try {
    // In a production environment, load models once at startup
    // For simplicity, we'll load them on each request here
    // await loadModels();
    
    // Since models may not be available in development, we'll use a mock implementation
    // TODO: Replace with actual face-api.js implementation when models are available
    
    // For demo purposes, we're returning a mock result
    const mockSimilarity = Math.random();
    const isMatch = mockSimilarity >= config.similarityThreshold;
    
    return {
      isMatch,
      similarity: mockSimilarity,
    };
    
    /* Actual implementation would be:
    
    // Load the images
    const img1 = await loadImage(image1Path);
    const img2 = await loadImage(image2Path);
    
    // Detect faces in both images
    const detection1 = await faceapi.detectSingleFace(img1)
      .withFaceLandmarks()
      .withFaceDescriptor();
      
    const detection2 = await faceapi.detectSingleFace(img2)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection1 || !detection2) {
      throw new Error('Could not detect face in one or both images');
    }
    
    // Compare face descriptors
    const distance = faceapi.euclideanDistance(
      detection1.descriptor,
      detection2.descriptor
    );
    
    // Convert distance to similarity (0-1 scale)
    const similarity = 1 - distance;
    const isMatch = similarity >= config.similarityThreshold;
    
    return {
      isMatch,
      similarity,
    };
    */
  } catch (error) {
    console.error('Error in face comparison:', error);
    throw error;
  }
}; 