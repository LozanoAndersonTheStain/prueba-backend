#!/bin/bash
# filepath: scripts/docker-run.sh

set -e

echo "Starting application with Docker Compose..."

# Verificar si .env existe
if [ ! -f .env ]; then
    echo " .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo ".env created. Please update it with your values."
    exit 1
fi

# Modo (production o development)
MODE=${1:-production}

if [ "$MODE" = "dev" ] || [ "$MODE" = "development" ]; then
    echo "Starting in DEVELOPMENT mode..."
    docker-compose -f docker-compose.dev.yml up --build
else
    echo "Starting in PRODUCTION mode..."
    docker-compose up --build
fi