/**
 * Main application entry point for FaceCheck
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import multer from 'multer';
import validateFacesRoute from './api/validateFaces';

// Configuration
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize app
const app = express();

// Setup file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/validate-faces', validateFacesRoute);

// Root route - serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`FaceCheck server running on port ${PORT}`);
}); 