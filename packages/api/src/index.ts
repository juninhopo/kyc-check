import util from 'util';
if (!util.isNullOrUndefined) {
  util.isNullOrUndefined = (arg: unknown): arg is null | undefined => arg === null || arg === undefined;
}

import '@tensorflow/tfjs-node';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import validateFacesRoute from './api/validateFaces';
import { loadModels } from './services/modelUtils';
import * as faceapi from '@vladmandic/face-api';
import { setupCanvas } from './utils/canvasSetup';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

setupCanvas();

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/validate-faces', validateFacesRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export const isModelLoaded = {
  ssdMobilenetv1: false,
  faceLandmark68Net: false,
  faceRecognitionNet: false
};

const startServer = async () => {
  try {
    console.log('Initializing face recognition models...');
    const result = await loadModels();

    if (result.success) {
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

  app.listen(PORT, () => {
    console.log(`FaceCheck server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
  });
};

startServer();