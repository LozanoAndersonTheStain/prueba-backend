#!/bin/bash
# filepath: scripts/docker-clean.sh

set -e

echo "Cleaning Docker resources..."

# Detener containers
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Eliminar volúmenes (¡CUIDADO! Esto borra los datos)
read -p "Do you want to remove volumes (database data)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    echo "Volumes removed"
fi

# Limpiar imágenes huérfanas
docker image prune -f

echo "Docker cleanup completed!"