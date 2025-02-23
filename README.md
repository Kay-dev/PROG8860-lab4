# Simple Web Service

A lightweight Node.js web service with Docker support and CI/CD pipeline integration.

## Repository Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline configuration
├── server.js              # Main application file
├── server.test.js         # Unit tests
├── Dockerfile            # Docker configuration
├── package.json          # Node.js dependencies and scripts
├── package-lock.json     # Locked dependencies
└── .gitignore           # Git ignore rules
```

## Prerequisites

- Node.js 20.x
- Docker (optional, for containerization)
- Git

## Local Development

### Installing Dependencies

```bash
npm install
```

### Running the Application

```bash
npm start
```

The server will start on http://localhost:3000

### Running Tests

```bash
npm test
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/greeting` - Get default greeting
- `GET /api/greeting?name=YourName` - Get personalized greeting

## Docker Support

### Building the Docker Image

```bash
docker build -t web-service .
```

### Running the Docker Container

```bash
docker run -p 3000:3000 web-service
```

## CI Pipeline

This project uses GitHub Actions for continuous integration. The pipeline:

1. Triggers on:
   - Push or pull request to main branch

2. Pipeline Steps:
   - Sets up Node.js 20.x
   - Installs dependencies
   - Runs tests
   - Builds and pushes Docker image

### Steps to test the CI pipeline

1. Fork this repository
2. Make changes to any file
3. Create a pull request
4. GitHub Actions will automatically run the CI pipeline
5. Check the Actions tab in GitHub to see the pipeline status

## How to pull the Docker image from the registry
```bash
docker pull sonawei/prog8860-midterm:<tag>
```
