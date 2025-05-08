import * as faceapi from '@vladmandic/face-api';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { dirname } from 'path';
import { IncomingMessage } from 'http';
import { setupCanvas } from '../utils/canvasSetup';

type ModelName = string;
type ModelUrl = string;

type DownloadResult = {
  success: boolean;
  modelName: ModelName;
  error?: string;
};

type ModelsAvailableResult = {
  available: boolean;
  missingModels: ModelName[];
};

type LoadModelsResult = {
  success: boolean;
  error?: string;
  details?: string;
};

const MODEL_URL = 'https://vladmandic.github.io/face-api/model';

const modelsPath = path.join(__dirname, '../../models');

const MODEL_VERSION = {
  VLADMANDIC: 'vladmandic',
  JUSTADUDEWHOHACKS: 'justadudewhohacks',
} as const;

const MODELS = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin'
] as const;

const ALTERNATIVE_MODELS = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin'
] as const;

export const downloadFile = async (url: string, filePath: string): Promise<void> => {
  const directory = dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  return new Promise<void>((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'node-fetch/1.0',
        'Accept': 'application/json, application/octet-stream, */*'
      },
      timeout: 30000
    };

    const file = fs.createWriteStream(filePath);

    file.on('error', (error) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(new Error(`File write error: ${error.message}`));
    });

    const req = https.get(url, options, (response: IncomingMessage) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        if (response.headers.location) {
          downloadFile(response.headers.location, filePath)
            .then(resolve)
            .catch(reject);
          return;
        } else {
          fs.unlink(filePath, () => {});
          reject(new Error('Redirect received but no location header found'));
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
        return;
      }

      if (filePath.endsWith('.json') &&
          response.headers['content-type'] &&
          !String(response.headers['content-type']).includes('application/json') &&
          !String(response.headers['content-type']).includes('text/plain')) {
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error(`Expected JSON but received content-type: ${response.headers['content-type']}`));
        return;
      }

      response.pipe(file);
    });

    req.on('error', (error: Error) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(new Error(`Request error: ${error.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      file.close();
      fs.unlink(filePath, () => {});
      reject(new Error('Request timed out'));
    });

    file.on('finish', () => {
      file.close();

      if (filePath.endsWith('.json')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.trim() === '') {
            throw new Error('Empty JSON file');
          }
          JSON.parse(content);
          resolve();
        } catch (error: unknown) {
          fs.unlink(filePath, () => {});
          reject(new Error(`Invalid JSON file: ${error instanceof Error ? error.message : String(error)}`));
        }
      } else {
        resolve();
      }
    });
  });
};

export const areModelsAvailable = (): ModelsAvailableResult => {
  const missingModels: ModelName[] = [];

  MODELS.forEach((model) => {
    const modelPath = path.join(modelsPath, model);
    if (!fs.existsSync(modelPath)) {
      missingModels.push(model);
    } else {
      if (model.endsWith('.json')) {
        try {
          const content = fs.readFileSync(modelPath, 'utf8');
          JSON.parse(content);
        } catch (error) {
          missingModels.push(model);
        }
      }
    }
  });

  return {
    available: missingModels.length === 0,
    missingModels
  };
};

export const downloadModels = async (): Promise<DownloadResult[]> => {
  if (!fs.existsSync(modelsPath)) {
    fs.mkdirSync(modelsPath, { recursive: true });
  }

  console.log('Downloading face-api.js models...');

  const results: DownloadResult[] = [];

  for (const model of MODELS) {
    const modelPath = path.join(modelsPath, model);

    if (fs.existsSync(modelPath)) {
      if (model.endsWith('.json')) {
        try {
          const content = fs.readFileSync(modelPath, 'utf8');
          JSON.parse(content);
          console.log(`Model ${model} already exists and is valid, skipping.`);
          results.push({ success: true, modelName: model });
          continue;
        } catch (error) {
          console.log(`Model ${model} exists but is invalid, redownloading.`);
          try {
            fs.unlinkSync(modelPath);
          } catch (unlinkError: unknown) {
            console.error(`Failed to remove invalid model file: ${unlinkError instanceof Error ? unlinkError.message : String(unlinkError)}`);
          }
        }
      } else {
        console.log(`Model ${model} already exists, skipping.`);
        results.push({ success: true, modelName: model });
        continue;
      }
    }

    console.log(`Downloading ${model}...`);
    try {
      await downloadFile(`${MODEL_URL}/${model}`, modelPath);
      console.log(`Downloaded ${model} successfully.`);
      results.push({ success: true, modelName: model });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error downloading ${model}: ${errorMessage}`);
      results.push({
        success: false,
        modelName: model,
        error: errorMessage
      });
    }
  }

  console.log('All downloads attempted.');
  return results;
};

const setupNodeCanvas = (): void => {
  try {
    setupCanvas();
    console.log('Node canvas setup complete');
  } catch (error) {
    console.error('Failed to setup node-canvas:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export const loadModels = async (): Promise<LoadModelsResult> => {
  try {
    console.log('Loading face-api.js models...');

    setupNodeCanvas();

    try {
      console.log('Attempting to load models from disk...');

      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
      console.log('SSD MobileNet model loaded');

      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
      console.log('Face landmark model loaded');

      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
      console.log('Face recognition model loaded');

      if (!faceapi.nets.ssdMobilenetv1.isLoaded ||
          !faceapi.nets.faceLandmark68Net.isLoaded ||
          !faceapi.nets.faceRecognitionNet.isLoaded) {
        throw new Error('One or more models failed to load from disk');
      }

      console.log('All models loaded successfully from disk.');
      return { success: true };
    } catch (diskError) {
      console.warn(`Loading from disk failed: ${diskError instanceof Error ? diskError.message : String(diskError)}`);
      console.log('Attempting to load models from web...');

      try {
        console.log('Reinitializing models before loading from web...');

        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log('SSD MobileNet model loaded from web');

        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('Face landmark model loaded from web');

        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log('Face recognition model loaded from web');

        if (!faceapi.nets.ssdMobilenetv1.isLoaded ||
            !faceapi.nets.faceLandmark68Net.isLoaded ||
            !faceapi.nets.faceRecognitionNet.isLoaded) {
          throw new Error('One or more models failed to load from web');
        }

        console.log('All models loaded successfully from web.');

        try {
          console.log('Attempting to download models for future use...');
          await downloadModels();
          console.log('Models saved to disk successfully.');
        } catch (downloadError) {
          console.warn(`Failed to save models to disk: ${downloadError instanceof Error ? downloadError.message : String(downloadError)}`);
        }

        return { success: true };
      } catch (webError) {
        return {
          success: false,
          error: 'Failed to load models from any source',
          details: `Disk error: ${diskError instanceof Error ? diskError.message : String(diskError)},
                   Web error: ${webError instanceof Error ? webError.message : String(webError)}`
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in model loading process:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};