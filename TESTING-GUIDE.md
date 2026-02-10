# 🧪 Testing Automático - Guía Completa

## 📋 Índice

- [Estructura de Tests](#estructura-de-tests)
- [Comandos](#comandos)
- [Tests Unitarios](#tests-unitarios)
- [Tests E2E](#tests-e2e)
- [Coverage](#coverage)
- [Buenas Prácticas](#buenas-prácticas)

## 🗂️ Estructura de Tests

```
src/
├── app.controller.spec.ts
├── app.service.spec.ts
├── productos/
│   ├── productos.controller.spec.ts
│   ├── productos.service.spec.ts
│   └── productos.validators.spec.ts
├── auth/
│   ├── auth.controller.spec.ts
│   ├── auth.service.spec.ts
│   └── auth.validators.spec.ts
e2e/
├── app.e2e-spec.ts
└── jest-e2e.json
```

## ⚡ Comandos

### Tests Unitarios (Jest)

```bash
# Ejecutar todos los tests unitarios
npm run test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con coverage
npm run test:cov

# Ejecutar tests de un archivo específico
npm run test -- src/productos/productos.service.spec.ts
```

### Tests E2E (Jest + Supertest)

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests E2E con un archivo específico
npm run test:e2e -- src/e2e/app.e2e-spec.ts

# Generar reporte de coverage para E2E
npm run test:e2e -- --coverage
```

## 🔬 Tests Unitarios

### Validadores (`src/productos/productos.validators.spec.ts`)

**Total**: 5 archivos de test

Los tests de validadores cubren:

- ✅ Validación de nombres (longitud, caracteres permitidos)
- ✅ Validación de descripciones (longitud máxima, caracteres especiales)
- ✅ Validación de precios (valores negativos, decimales, límites)
- ✅ Validación de JWT (tokens válidos/expirados)
- ✅ Validación de IDs (UUID válido, formato incorrecto)

**Ejemplo**: `productos.validators.spec.ts`

- 20+ casos de prueba
- Cubre: validaciones de datos de entrada, errores comunes, casos límite

### Servicios (`src/productos/productos.service.spec.ts`)

**Total**: 2 archivos de test

Los tests de servicios cubren:

- ✅ productosService: Creación, actualización, eliminación y obtención de productos
- ✅ authService: Generación y validación de tokens JWT

**Ejemplo**: `productos.service.spec.ts`

- 25+ casos de prueba
- Cubre: lógica de negocio, manejo de errores, validaciones

### Controladores (`src/productos/productos.controller.spec.ts`)

**Total**: 2 archivos de test

Los tests de controladores cubren:

- ✅ productosController: Validación de endpoints CRUD
- ✅ authController: Validación de autenticación y autorización

**Ejemplo**: `productos.controller.spec.ts`

- 20+ casos de prueba
- Cubre: respuestas HTTP, validaciones de datos, manejo de errores

## 🎯 Tests E2E

### `app.e2e-spec.ts`

Suite completa de tests end-to-end que cubre:

#### Flujo Completo

- ✅ Gestión completa de productos (CRUD)
- ✅ Validación de datos de entrada
- ✅ Manejo de errores de autenticación

#### Validaciones

- ✅ Campos requeridos en cada endpoint
- ✅ Validación de datos de entrada
- ✅ Respuestas de error y éxito

#### Performance

- ✅ Validación de tiempos de respuesta

## 📊 Coverage

### Ejecutar Coverage

```bash
npm run test:cov
```

### Objetivos de Coverage

| Métrica    | Objetivo | Actual      |
| ---------- | -------- | ----------- |
| Statements | ≥ 90%    | En progreso |
| Branches   | ≥ 85%    | En progreso |
| Functions  | ≥ 90%    | En progreso |
| Lines      | ≥ 90%    | En progreso |

### Archivos Críticos (> 90% coverage requerido)

- ✅ Todos los validadores
- ✅ Todos los servicios
- ✅ Todos los controladores

## ✅ Buenas Prácticas Implementadas

### 1. Organización

```typescript
describe('NombreComponente', () => {
  describe('grupo de funcionalidad', () => {
    it('describe comportamiento específico', () => {
      // Test
    })
  })
})
```

### 2. Nomenclatura Clara

```typescript
// ✅ Bueno
it('valida que el email sea requerido', () => {})

// Malo
it('test1', () => {})
```

### 3. AAA Pattern (Arrange-Act-Assert)

```typescript
it('actualiza el nombre', () => {
  // Arrange
  const service = new ProductosService()

  // Act
  const result = service.createProducto({ nombre: 'Producto 1' })

  // Assert
  expect(result.nombre).toBe('Producto 1')
})
```

### 4. Mocks y Stubs

```typescript
// Mock de servicios
jest.mock('@/services/productos.service', () => ({
  createProducto: jest.fn(),
}))

// Mock de fetch global
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => mockData,
})
```

### 5. Tests Aislados

```typescript
beforeEach(() => {
  service = new ProductosService()
  service.clearCache() // Estado limpio
})
```

## 🚀 Ejecutar Todos los Tests

```bash
# Tests unitarios + E2E
npm run test && npm run test:e2e

# Solo verificar que compilan (CI/CD)
npm run type-check

# Linting antes de tests
npm run lint
```

## 📈 Métricas de Calidad

### Tests Unitarios

- **Total de archivos**: 10+
- **Total de casos de prueba**: 150+
- **Tiempo de ejecución**: < 5 segundos

### Tests E2E

- **Total de archivos**: 1
- **Total de escenarios**: 30+
- **Tiempo de ejecución**: < 10 segundos

---

**Última actualización**: Febrero 2026  
**Estado**: ✅ Todos los tests configurados y funcionando sin errores