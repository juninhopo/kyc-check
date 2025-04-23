/**
 * Main application entry point for FaceCheck
 */

// Polyfill for isNullOrUndefined (deprecated in Node.js)
// This needs to be before any TensorFlow imports
import util from 'util';
// @ts-ignore - Adding polyfill for deprecated function
if (!util.isNullOrUndefined) {
  // @ts-ignore - Ignoring type check for polyfill
  util.isNullOrUndefined = (arg: unknown): boolean => arg === null || arg === undefined;
}

import '@tensorflow/tfjs-node';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import validateFacesRoute from './api/validateFaces';
import { loadModels } from './services/modelUtils';
import * as faceapi from '@vladmandic/face-api';
import * as canvas from 'canvas';

// Configuration
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Configure face-api to use node-canvas
// This needs to be done before trying to load any models
faceapi.env.monkeyPatch({
  // @ts-expect-error - Type mismatch between node-canvas and browser canvas, but API is compatible
  Canvas: canvas.Canvas,
  // @ts-expect-error - Type mismatch between node-canvas and browser canvas, but API is compatible 
  Image: canvas.Image,
  // @ts-expect-error - Type mismatch between node-canvas and browser canvas, but API is compatible
  ImageData: canvas.ImageData
});

// Initialize app
const app = express();

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/validate-faces', validateFacesRoute);

// Root route - serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global flag for model loading status
export const isModelLoaded = {
  ssdMobilenetv1: false,
  faceLandmark68Net: false,
  faceRecognitionNet: false
};

// Initialize and start the server
const startServer = async () => {
  try {
    // Attempt to load face-api.js models at startup
    console.log('Initializing face recognition models...');
    const result = await loadModels();
    
    if (result.success) {
      // Explicitly set the global flags for model loading
      isModelLoaded.ssdMobilenetv1 = faceapi.nets.ssdMobilenetv1.isLoaded;
      isModelLoaded.faceLandmark68Net = faceapi.nets.faceLandmark68Net.isLoaded;
      isModelLoaded.faceRecognitionNet = faceapi.nets.faceRecognitionNet.isLoaded;
      
      if (isModelLoaded.ssdMobilenetv1 && isModelLoaded.faceLandmark68Net && isModelLoaded.faceRecognitionNet) {
        console.log('Face recognition models initialized successfully.');
      } else {
        console.warn('Some models were not loaded correctly:');
        console.warn(`- SSD MobileNet: ${isModelLoaded.ssdMobilenetv1 ? 'Loaded' : 'Not loaded'}`);
        console.warn(`- Face Landmark: ${isModelLoaded.faceLandmark68Net ? 'Loaded' : 'Not loaded'}`);
        console.warn(`- Face Recognition: ${isModelLoaded.faceRecognitionNet ? 'Loaded' : 'Not loaded'}`);
        console.warn('Server will start, but face comparison may use mock implementation.');
      }
    } else {
      console.error('Error initializing face recognition models:', result.error);
      console.warn('Server will start, but face comparison will use mock implementation.');
    }
  } catch (error) {
    console.error('Error initializing face recognition models:', error);
    console.warn('Server will start, but face comparison will use mock implementation.');
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`FaceCheck server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
  });
};

// Start the server
startServer(); 