# FaceCheck

A facial validation service for KYC (Know Your Customer) processes that compares two face images to determine if they belong to the same person.

You can use documents such as a driver's license to verify if it matches the photo.

## Features

- Upload two images containing faces
- Real-time image preview
- Face similarity comparison
- Percentage-based similarity score
- Simple and intuitive user interface
- REST API for integration with other systems

## Live Demo

A live demo is available at: [https://facecheck-production.up.railway.app/](https://facecheck-production.up.railway.app/)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/facecheck.git
cd facecheck

# Install dependencies
pnpm install
```

## Environment Setup

Create a `.env` file in the root directory:

```
PORT=3000
API_THRESHOLD=0.50
```

## Usage

```bash
# Start the development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Access the application at `http://localhost:3000`

## API Reference

### Face Validation Endpoint

```
POST /api/validate-faces
```

#### Request

Form data with two image files:

| Parameter | Type | Description |
|-----------|------|-------------|
| image1 | File | First face image |
| image2 | File | Second face image |

#### Response

```typescript
type ValidationResponse = {
  success: boolean;
  data?: {
    isMatch: boolean;
    similarity: number;
    debugInfo?: {
      // Debug information about face detection
    };
  };
  error?: string;
};
```

#### Sample Response (Success)

```json
{
  "success": true,
  "data": {
    "isMatch": true,
    "similarity": 0.92,
    "debugInfo": {
      "face1": {
        "confidence": 0.99,
        "detectionTime": 156
      },
      "face2": {
        "confidence": 0.98,
        "detectionTime": 142
      },
      "comparisonTime": 85
    }
  }
}
```

#### Sample Response (Error)

```json
{
  "success": false,
  "error": "Faces não detectados em uma ou ambas as imagens. Por favor, utilize imagens com rostos claramente visíveis."
}
```

### API Usage Example with cURL

Here's an example of how to use the API with cURL to compare two face images:

```bash
curl -X POST \
  https://facecheck-production.up.railway.app/api/validate-faces \
  -H 'Content-Type: multipart/form-data' \
  -F 'image1=@/path/to/first/image.jpg' \
  -F 'image2=@/path/to/second/image.jpg'
```

For local testing:

```bash
curl -X POST \
  http://localhost:3000/api/validate-faces \
  -H 'Content-Type: multipart/form-data' \
  -F 'image1=@/path/to/first/image.jpg' \
  -F 'image2=@/path/to/second/image.jpg'
```

## Technologies

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Face Recognition: @vladmandic/face-api.js
- File Handling: multer

## Project Structure

```
facecheck/
├── public/             # Static assets
│   └── index.html      # Main frontend interface
├── src/
│   ├── api/            # API endpoints
│   ├── services/       # Face detection services
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── uploads/            # Temporary storage for uploaded images
├── .env                # Environment variables
└── package.json        # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
