# Docker Setup Guide - Stutter Detection Application

This guide provides comprehensive instructions for running the Stutter Detection application using Docker. The application consists of two main components: the React frontend and the Python Flask backend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Frontend Docker Setup](#frontend-docker-setup)
- [Backend Docker Setup](#backend-docker-setup)
- [Docker Compose Setup (Recommended)](#docker-compose-setup-recommended)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker**: Version 20.10 or higher
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)
  - [Install Docker Engine](https://docs.docker.com/engine/install/) (Linux)

- **Docker Compose**: Version 1.29 or higher (usually included with Docker Desktop)

- **Git**: For cloning the repository

### Verify Installation

```bash
docker --version
docker-compose --version
```

## Project Structure

```
stutter-detection/
├── Stutter-Detection-Frontend-main/
│   ├── Dockerfile
│   ├── src/
│   ├── package.json
│   └── ...
├── Stutter-detection-backend-main/
│   ├── Dockerfile
│   ├── app.py
│   ├── requirements.txt
│   └── ...
└── docker-compose.yml (optional, you'll create this)
```

## Frontend Docker Setup

### Understanding the Frontend Dockerfile

The frontend uses a **multi-stage build** process:

```dockerfile
# Stage 1: Build stage (Node.js)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key Points:**
- Uses `node:18-alpine` for smaller image size
- Builds the React app in the first stage
- Serves the built files using Nginx in the second stage
- Exposes port 80 (HTTP)
- Final image size: ~50MB

### Building the Frontend Docker Image

Navigate to the frontend directory and build the image:

```bash
cd Stutter-Detection-Frontend-main
docker build -t stutter-detection-frontend:latest .
```

**Build Options:**
- Add `--no-cache` to rebuild without using cached layers
- Add `-t` to specify a custom image name and tag

```bash
# Example with custom tag
docker build -t myregistry/stutter-frontend:v1.0 .
```

### Running the Frontend Container

```bash
docker run -d \
  --name stutter-frontend \
  -p 80:80 \
  stutter-detection-frontend:latest
```

**Parameters Explained:**
- `-d`: Run in detached mode (background)
- `--name`: Assign a container name for easy reference
- `-p 80:80`: Map port 80 from container to host
- `stutter-detection-frontend:latest`: Image name and tag

**Access the Application:**
- Open your browser and navigate to `http://localhost`

### Stopping and Removing the Container

```bash
# Stop the container
docker stop stutter-frontend

# Remove the container
docker rm stutter-frontend

# Remove the image
docker rmi stutter-detection-frontend:latest
```

## Backend Docker Setup

### Understanding the Backend Dockerfile

The backend uses Python 3.11 with necessary system dependencies:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    locales \
    gcc \
    libffi-dev \
    libssl-dev \
    portaudio19-dev \
    libsndfile1-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Configure locales
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Install Python dependencies
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

# Download NLP models
RUN python -c "import nltk; nltk.download('punkt'); ..."
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
```

**Key Points:**
- Uses `python:3.11-slim` for smaller base image
- Installs FFmpeg for audio processing
- Downloads NLP models (NLTK, spaCy) during build
- Uses Gunicorn as the WSGI server
- Exposes port 10000
- Final image size: ~2.5GB (due to ML models)

### Building the Backend Docker Image

Navigate to the backend directory and build the image:

```bash
cd Stutter-detection-backend-main
docker build -t stutter-detection-backend:latest .
```

**Note:** The first build may take 5-10 minutes due to downloading NLP models.

### Running the Backend Container

```bash
docker run -d \
  --name stutter-backend \
  -p 10000:10000 \
  -e FLASK_ENV=production \
  stutter-detection-backend:latest
```

**Parameters Explained:**
- `-e FLASK_ENV=production`: Set Flask environment variable
- `-p 10000:10000`: Map port 10000 from container to host

**Verify Backend is Running:**

```bash
curl http://localhost:10000/health
```

## Docker Compose Setup (Recommended)

Docker Compose allows you to run both services together with a single command.

### Create docker-compose.yml

Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./Stutter-Detection-Frontend-main
      dockerfile: Dockerfile
    container_name: stutter-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:10000
    networks:
      - stutter-network
    restart: unless-stopped

  backend:
    build:
      context: ./Stutter-detection-backend-main
      dockerfile: Dockerfile
    container_name: stutter-backend
    ports:
      - "10000:10000"
    environment:
      - FLASK_ENV=production
      - PYTHONUNBUFFERED=1
    volumes:
      - ./Stutter-detection-backend-main/analysis_results:/app/analysis_results
    networks:
      - stutter-network
    restart: unless-stopped

networks:
  stutter-network:
    driver: bridge
```

### Running with Docker Compose

```bash
# Start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up -d --build
```

## Environment Configuration

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:10000
REACT_APP_ENV=production
```

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=production
FLASK_DEBUG=False
PYTHONUNBUFFERED=1
```

## Running the Application

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd stutter-detection

# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop the application
docker-compose down
```

### Option 2: Running Containers Individually

**Terminal 1 - Backend:**
```bash
cd Stutter-detection-backend-main
docker build -t stutter-backend:latest .
docker run -p 10000:10000 stutter-backend:latest
```

**Terminal 2 - Frontend:**
```bash
cd Stutter-Detection-Frontend-main
docker build -t stutter-frontend:latest .
docker run -p 80:80 stutter-frontend:latest
```

### Accessing the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:10000
- **Health Check**: http://localhost:10000/health

## Troubleshooting

### Port Already in Use

If you get an error about ports being in use:

```bash
# Find process using port 80
lsof -i :80

# Find process using port 10000
lsof -i :10000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use different ports in docker-compose.yml
# Change "80:80" to "8080:80" for frontend
# Change "10000:10000" to "10001:10000" for backend
```

### Container Exits Immediately

Check logs to see what went wrong:

```bash
docker logs stutter-frontend
docker logs stutter-backend
```

### Build Fails Due to Network Issues

Retry the build with a longer timeout:

```bash
docker build --network=host -t stutter-backend:latest .
```

### Memory Issues

If you encounter memory issues, increase Docker's memory allocation:

- **Docker Desktop**: Preferences → Resources → Memory (increase to 4GB+)
- **Linux**: Adjust system-wide memory limits

### Audio Processing Issues

Ensure FFmpeg is properly installed in the backend container:

```bash
docker exec stutter-backend ffmpeg -version
```

## Performance Optimization

### Image Size Optimization

**Frontend:**
- Current: ~50MB (using Alpine Linux)
- Already optimized with multi-stage build

**Backend:**
- Current: ~2.5GB (includes ML models)
- Consider using a volume mount for models to share across containers

### Caching Strategy

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t stutter-backend:latest .
```

### Volume Mounts for Development

For development, mount source code as volumes:

```bash
docker run -d \
  -v $(pwd)/src:/app/src \
  -p 10000:10000 \
  stutter-backend:latest
```

### Resource Limits

Limit container resources in docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Production Deployment

### Using Docker Registry

```bash
# Tag image for registry
docker tag stutter-frontend:latest myregistry.azurecr.io/stutter-frontend:v1.0

# Push to registry
docker push myregistry.azurecr.io/stutter-frontend:v1.0

# Pull and run
docker pull myregistry.azurecr.io/stutter-frontend:v1.0
docker run -p 80:80 myregistry.azurecr.io/stutter-frontend:v1.0
```

### Using Kubernetes

For production-grade deployments, consider using Kubernetes:

```bash
# Create deployment
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl logs <pod-name>
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Python Docker Best Practices](https://docs.docker.com/language/python/)

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `docker logs <container-name>`
3. Verify environment variables are set correctly
4. Ensure all required ports are available
5. Check Docker daemon is running: `docker ps`

---

**Last Updated:** December 2024
**Docker Version:** 20.10+
**Docker Compose Version:** 1.29+
