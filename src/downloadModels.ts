/**
 * Script to download face-api models
 */

import '@tensorflow/tfjs-node';
import * as faceapi from '@vladmandic/face-api';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
// Import our centralized canvas setup utility
import { setupCanvas } from './utils/canvasSetup';

// Setup canvas for face-api.js
setupCanvas();

// Path to models directory
const modelsPath = path.join(__dirname, '../models');

// Base URL for models
const MODEL_URL = 'https://vladmandic.github.io/face-api/model';

// Model files to download
const MODEL_FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin'
] as const;

type DownloadFileArgs = {
  url: string;
  filePath: string;
};

type DownloadFileResult = {
  success: boolean;
  error?: string;
};

/**
 * Downloads a file from a URL to a local path
 */
const downloadFile = ({ url, filePath }: DownloadFileArgs): Promise<DownloadFileResult> => {
  return new Promise((resolve) => {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const file = fs.createWriteStream(filePath);

    const options = {
      headers: {
        'User-Agent': 'node-fetch/1.0',
        'Accept': 'application/json, application/octet-stream, */*'
      },
      timeout: 30000 // 30 second timeout
    };

    https.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          file.close();
          fs.unlinkSync(filePath);
          downloadFile({ url: response.headers.location, filePath })
            .then(result => resolve(result))
            .catch(error => resolve({ success: false, error: `Redirect error: ${error.message}` }));
          return;
        } else {
          file.close();
          fs.unlinkSync(filePath);
          resolve({ success: false, error: 'Redirect without location header' });
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filePath);
        resolve({ success: false, error: `Failed to download file: HTTP ${response.statusCode}` });
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();

        // Validate JSON files
        if (filePath.endsWith('.json')) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.trim() === '') {
              throw new Error('Empty JSON file');
            }
            JSON.parse(content); // Will throw if invalid JSON
            resolve({ success: true });
          } catch (error) {
            fs.unlinkSync(filePath);
            resolve({
              success: false,
              error: `Invalid JSON file: ${error instanceof Error ? error.message : String(error)}`
            });
          }
        } else {
          resolve({ success: true });
        }
      });

      file.on('error', (error) => {
        file.close();
        fs.unlinkSync(filePath);
        resolve({ success: false, error: `File write error: ${error.message}` });
      });
    }).on('error', (error) => {
      file.close();
      fs.unlinkSync(filePath);
      resolve({ success: false, error: `Request error: ${error.message}` });
    }).on('timeout', () => {
      file.close();
      fs.unlinkSync(filePath);
      resolve({ success: false, error: 'Request timed out' });
    });
  });
};

type DownloadModelsResult = {
  success: boolean;
  failedModels: string[];
  error?: string;
};

const downloadModels = async (): Promise<DownloadModelsResult> => {
  console.log('Downloading face-api.js models...');

  const failedModels: string[] = [];

  try {
    // Ensure models directory exists
    if (!fs.existsSync(modelsPath)) {
      fs.mkdirSync(modelsPath, { recursive: true });
    }

    // Clean up models directory to ensure fresh download
    console.log('Cleaning up existing models directory...');
    const files = fs.readdirSync(modelsPath);
    for (const file of files) {
      fs.unlinkSync(path.join(modelsPath, file));
    }

    // Download each model file manually
    console.log('Downloading model files directly...');
    for (const modelFile of MODEL_FILES) {
      const url = `${MODEL_URL}/${modelFile}`;
      const filePath = path.join(modelsPath, modelFile);

      console.log(`Downloading ${modelFile}...`);
      try {
        const result = await downloadFile({ url, filePath });
        if (result.success) {
          console.log(`Downloaded ${modelFile} successfully`);
        } else {
          console.error(`Error downloading ${modelFile}:`, result.error);
          failedModels.push(modelFile);
        }
      } catch (error) {
        console.error(`Error downloading ${modelFile}:`, error);
        failedModels.push(modelFile);
      }
    }

    if (failedModels.length > 0) {
      console.warn(`Failed to download ${failedModels.length} model files`);
      return { success: false, failedModels };
    }

    // Verify downloads by loading models
    console.log('Verifying model files by loading models...');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);

    // Check if models are loaded
    if (faceapi.nets.ssdMobilenetv1.isLoaded &&
        faceapi.nets.faceLandmark68Net.isLoaded &&
        faceapi.nets.faceRecognitionNet.isLoaded) {
      console.log('All models downloaded and loaded successfully!');

      // List available models in directory
      console.log('Models available in directory:');
      const updatedFiles = fs.readdirSync(modelsPath);
      updatedFiles.forEach(file => console.log(`- ${file}`));

      return { success: true, failedModels: [] };
    } else {
      const notLoadedModels = [];
      if (!faceapi.nets.ssdMobilenetv1.isLoaded) notLoadedModels.push('ssdMobilenetv1');
      if (!faceapi.nets.faceLandmark68Net.isLoaded) notLoadedModels.push('faceLandmark68Net');
      if (!faceapi.nets.faceRecognitionNet.isLoaded) notLoadedModels.push('faceRecognitionNet');

      const error = `Models failed to load properly: ${notLoadedModels.join(', ')}`;
      console.error(error);
      return { success: false, failedModels: notLoadedModels, error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error downloading models:', errorMessage);
    return {
      success: false,
      failedModels,
      error: errorMessage
    };
  }
};

// Execute the download script
downloadModels()
  .then(result => {
    if (result.success) {
      console.log('Model download complete.');
      process.exit(0);
    } else {
      console.error('Model download failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error in download script:', error);
    process.exit(1);
  });