# FaceCheck

A facial validation service for KYC (Know Your Customer) processes that compares two face images to determine if they belong to the same person.

## Features

- Upload two images containing faces
- Real-time image preview
- Face similarity comparison
- Percentage-based similarity score
- Simple and intuitive user interface

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
API_THRESHOLD=0.75
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
  };
  error?: string;
};
```

## Technologies

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- Face Recognition: Face-api.js or similar face matching library

## Project Structure

```
facecheck/
├── index.html          # Main frontend interface
├── public/             # Static assets
├── src/
│   ├── api/            # API endpoints
│   ├── services/       # Face detection services
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
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