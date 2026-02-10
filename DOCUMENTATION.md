# 📚 Documentación Técnica - Prueba Backend

## Índice

- [Introducción](#introducción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Características Principales](#características-principales)
- [Guía de Instalación y Configuración](#guía-de-instalación-y-configuración)
- [Guía de Testing](#guía-de-testing)
- [Guía de CI/CD](#guía-de-cicd)
- [Guía de Uso](#guía-de-uso)
- [Changelog](#changelog)
- [Contribuciones](#contribuciones)

## Introducción

Este proyecto es una API backend desarrollada con **NestJS** y **TypeScript**. Está diseñada para gestionar productos, implementando una arquitectura modular y escalable. Además, incluye integración con **PostgreSQL** como base de datos y utiliza **Prisma** como ORM. El proyecto está preparado para ser desplegado en entornos de desarrollo y producción utilizando **Docker** y **Docker Compose**.

## Estructura del Proyecto

```
eslint.config.mjs
nest-cli.json
package.json
README.md
tsconfig.build.json
tsconfig.json
src/
  app.controller.spec.ts
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
test/
  app.e2e-spec.ts
  jest-e2e.json
scripts/
  docker-build.sh
  docker-run.sh
  docker-stop.sh
  docker-clean.sh
.github/
  workflows/
    ci.yml
    cd.yml
```

### Descripción de Carpetas

- **src/**: Contiene el código fuente principal del proyecto.
- **test/**: Contiene los archivos de pruebas E2E.
- **scripts/**: Scripts para la gestión de Docker.
- **.github/workflows/**: Configuración de pipelines CI/CD para GitHub Actions.

## Características Principales

- **API RESTful** para la gestión de productos.
- **Autenticación JWT** para proteger los endpoints.
- **Validación de datos** utilizando `class-validator`.
- **Pruebas unitarias y E2E** con Jest.
- **Integración con PostgreSQL** y Prisma ORM.
- **Despliegue con Docker y Docker Compose**.
- **Pipelines CI/CD** configurados con GitHub Actions.

## Guía de Instalación y Configuración

### Requisitos Previos

- Node.js v20 o superior
- Docker y Docker Compose
- PostgreSQL

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/HomePower-Co/prueba-backend.git
   cd prueba-backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar las variables de entorno:
   - Copiar el archivo `.env.example` a `.env` y completar los valores necesarios.

4. Ejecutar migraciones de Prisma:
   ```bash
   npx prisma migrate dev
   ```

5. Sembrar datos iniciales:
   ```bash
   npm run prisma:seed
   ```

## Guía de Testing

### Pruebas Unitarias

Ejecutar las pruebas unitarias:
```bash
npm run test:unit
```

### Pruebas E2E

Ejecutar las pruebas E2E:
```bash
npm run test:e2e
```

### Cobertura de Código

Generar reporte de cobertura:
```bash
npm run test:cov
```

## Guía de CI/CD

### CI Pipeline

El archivo `.github/workflows/ci.yml` define el pipeline de integración continua, que incluye:

- Lint y formato del código.
- Pruebas unitarias y E2E.
- Construcción de la imagen Docker.
- Escaneo de seguridad.

### CD Pipeline

El archivo `.github/workflows/cd.yml` define el pipeline de despliegue continuo, que incluye:

- Construcción y publicación de la imagen Docker en GitHub Container Registry.
- Despliegue automático en el entorno de producción al hacer push a la rama `main` o al crear un tag con el formato `v*.*.*`.

## Guía de Uso

### Desarrollo

1. Construir la imagen Docker para desarrollo:
   ```bash
   ./scripts/docker-build.sh
   ```

2. Iniciar el entorno de desarrollo:
   ```bash
   ./scripts/docker-run.sh dev
   ```

3. Detener los contenedores:
   ```bash
   ./scripts/docker-stop.sh dev
   ```

4. Limpiar recursos de Docker:
   ```bash
   ./scripts/docker-clean.sh
   ```

### Producción

1. Construir la imagen Docker para producción:
   ```bash
   ./scripts/docker-build.sh
   ```

2. Iniciar el entorno de producción:
   ```bash
   ./scripts/docker-run.sh
   ```

3. Detener los contenedores:
   ```bash
   ./scripts/docker-stop.sh
   ```

## Changelog

### [1.0.0] - 2026-02-10

- Configuración inicial del proyecto.
- Implementación de la API RESTful para la gestión de productos.
- Configuración de Prisma y PostgreSQL.
- Configuración de Docker y Docker Compose.
- Configuración de pipelines CI/CD.
- Implementación de pruebas unitarias y E2E.

## Contribuciones

1. Hacer un fork del repositorio.
2. Crear una nueva rama:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realizar los cambios y confirmar los commits.
4. Enviar un pull request a la rama `develop`.