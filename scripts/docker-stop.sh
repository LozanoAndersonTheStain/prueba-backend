#!/bin/bash
# filepath: scripts/docker-stop.sh

set -e

MODE=${1:-production}

if [ "$MODE" = "dev" ] || [ "$MODE" = "development" ]; then
    echo "Stopping DEVELOPMENT containers..."
    docker-compose -f docker-compose.dev.yml down
else
    echo "Stopping PRODUCTION containers..."
    docker-compose down
fi

echo "Containers stopped successfully!"