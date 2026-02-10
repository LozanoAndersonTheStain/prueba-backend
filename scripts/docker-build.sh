#!/bin/bash
# filepath: scripts/docker-build.sh

set -e

echo "Building Docker image..."

# Build production image
docker build -t prueba-backend:latest -t prueba-backend:$(git rev-parse --short HEAD) .

echo "Docker image built successfully!"
echo ""
echo "Available tags:"
echo "  - prueba-backend:latest"
echo "  - prueba-backend:$(git rev-parse --short HEAD)"