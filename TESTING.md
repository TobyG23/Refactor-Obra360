# Testing Documentation - Obra360

Esta guía describe la estrategia de testing implementada en el proyecto Obra360.

## Tabla de Contenidos

- [Tecnologías de Testing](#tecnologías-de-testing)
- [Estructura de Testing](#estructura-de-testing)
- [Ejecutar Tests](#ejecutar-tests)
- [Escribir Tests](#escribir-tests)
- [Cobertura de Testing](#cobertura-de-testing)
- [CI/CD Integration](#cicd-integration)

## Tecnologías de Testing

El proyecto utiliza las siguientes herramientas para testing:

- **Jest**: Framework de testing para JavaScript/TypeScript
- **Supertest**: Librería para testing de APIs HTTP
- **ts-jest**: Preset de Jest para TypeScript
- **@types/jest**: Definiciones de tipos para Jest
- **@types/supertest**: Definiciones de tipos para Supertest

## Estructura de Testing

Cada servicio tiene su propia suite de tests ubicada en el directorio `src/__tests__`:

```
packages/
├── auth-service/
│   └── src/
│       └── __tests__/
│           └── auth.service.test.ts
├── projects-service/
│   └── src/
│       └── __tests__/
│           └── projects.service.test.ts
├── files-service/
│   └── src/
│       └── __tests__/
│           └── files.service.test.ts
├── billing-service/
│   └── src/
│       └── __tests__/
│           └── billing.controller.test.ts
└── api-gateway/
    └── src/
        └── __tests__/
            └── gateway.integration.test.ts
```

## Ejecutar Tests

### Todos los Tests

```bash
# Ejecutar todos los tests de todos los servicios
npm test
```

### Tests por Servicio

```bash
# Tests del Auth Service
npm run test:auth

# Tests del Projects Service
npm run test:projects

# Tests del Files Service
npm run test:files

# Tests del Billing Service
npm run test:billing

# Tests del API Gateway
npm run test:gateway
```

### Tests Unitarios vs Integración

```bash
# Ejecutar solo tests unitarios (servicios)
npm run test:unit

# Ejecutar solo tests de integración (gateway)
npm run test:integration
```

### Modo Watch

```bash
# Ejecutar tests en modo watch (recarga automática)
npm run test:watch
```

### Cobertura de Código

```bash
# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

Este comando generará un reporte de cobertura en el directorio `coverage/` que incluye:
- Porcentaje de líneas cubiertas
- Porcentaje de funciones cubiertas
- Porcentaje de branches cubiertos
- Reporte HTML interactivo

## Escribir Tests

### Estructura Básica de un Test

```typescript
describe('NombreDelServicio', () => {
  // Setup antes de cada test
  beforeEach(() => {
    // Inicializar mocks, limpiar estado, etc.
  });

  // Cleanup después de cada test
  afterEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('nombreDelMetodo', () => {
    it('should do something expected', async () => {
      // Arrange: Preparar datos de prueba
      const input = 'test data';

      // Act: Ejecutar la función bajo prueba
      const result = await service.method(input);

      // Assert: Verificar el resultado
      expect(result).toBeDefined();
      expect(result).toEqual(expectedValue);
    });

    it('should handle errors gracefully', async () => {
      // Test de manejo de errores
      await expect(
        service.method(invalidInput)
      ).rejects.toThrow('Expected error message');
    });
  });
});
```

### Mocking de Prisma Client

Los tests mockean el Prisma Client para aislar la lógica de negocio:

```typescript
jest.mock('@obra360/shared', () => {
  const actualModule = jest.requireActual('@obra360/shared');
  return {
    ...actualModule,
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      // ... otros modelos
    })),
  };
});
```

### Tests de Controladores HTTP

Para testear controladores que manejan requests/responses HTTP:

```typescript
import { Request, Response } from 'express';
import { Controller } from '../controllers/controller';

describe('Controller', () => {
  let controller: Controller;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new Controller();

    mockRequest = {
      params: {},
      body: {},
      query: {},
      user: { id: 'user-123' } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should return data', async () => {
    await controller.method(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expectedData);
  });
});
```

### Tests de Integración (API Gateway)

Los tests de integración usan Supertest para simular requests HTTP:

```typescript
import request from 'supertest';
import app from '../index';

describe('API Gateway Integration Tests', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });

  it('should handle authentication', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });
});
```

## Cobertura de Testing

### Objetivos de Cobertura

El proyecto busca mantener los siguientes niveles mínimos de cobertura:

- **Líneas**: >80%
- **Funciones**: >80%
- **Branches**: >75%
- **Statements**: >80%

### Áreas Cubiertas

#### Auth Service
- ✅ Registro de usuarios
- ✅ Login y generación de tokens
- ✅ Refresh tokens
- ✅ Logout
- ✅ Validación de usuarios
- ✅ Hashing de contraseñas
- ✅ Generación y verificación de JWT

#### Projects Service
- ✅ CRUD de proyectos
- ✅ Asignación de usuarios a proyectos
- ✅ CRUD de tareas
- ✅ Actualizaciones de progreso
- ✅ Validación de permisos
- ✅ Manejo de errores

#### Files Service
- ✅ Upload de archivos
- ✅ Download de archivos
- ✅ Versionado de archivos
- ✅ Compartir archivos (share links)
- ✅ Gestión de tipos de archivo
- ✅ Validación de acceso
- ✅ Manejo de archivos físicos

#### Billing Service
- ✅ CRUD de facturas
- ✅ Generación de números de factura
- ✅ CRUD de pagos
- ✅ Validación de montos
- ✅ Actualización de estados
- ✅ Relación con proyectos

#### API Gateway
- ✅ Health check
- ✅ Configuración de CORS
- ✅ Security headers (Helmet)
- ✅ Rate limiting
- ✅ Proxy routing
- ✅ Manejo de errores 404
- ✅ Parsing de JSON

## CI/CD Integration

### GitHub Actions

Para integrar los tests en GitHub Actions, agrega el siguiente workflow:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

### Pre-commit Hooks

Para ejecutar tests antes de cada commit, usa Husky:

```bash
# Instalar Husky
npm install --save-dev husky

# Inicializar Husky
npx husky-init

# Agregar hook de pre-commit
echo "npm test" > .husky/pre-commit
```

## Best Practices

### 1. Aislamiento de Tests

Cada test debe ser independiente y no depender del estado de otros tests:

```typescript
beforeEach(() => {
  // Reset del estado antes de cada test
  jest.clearAllMocks();
  // Reinicializar servicios, mocks, etc.
});
```

### 2. Tests Descriptivos

Usa nombres descriptivos para tus tests:

```typescript
// ❌ Malo
it('should work', () => {});

// ✅ Bueno
it('should create a new user with hashed password', () => {});
```

### 3. Arrange-Act-Assert Pattern

Estructura tus tests siguiendo el patrón AAA:

```typescript
it('should calculate total correctly', () => {
  // Arrange: Preparar datos
  const items = [10, 20, 30];

  // Act: Ejecutar función
  const total = calculateTotal(items);

  // Assert: Verificar resultado
  expect(total).toBe(60);
});
```

### 4. Test de Casos Edge

No olvides probar casos límite:

```typescript
describe('edge cases', () => {
  it('should handle empty input', () => {});
  it('should handle null values', () => {});
  it('should handle very large numbers', () => {});
  it('should handle special characters', () => {});
});
```

### 5. Mocking Apropiado

Mockea solo lo necesario y mantén los mocks simples:

```typescript
// ✅ Bueno: Mock específico
prisma.user.findUnique.mockResolvedValue(mockUser);

// ❌ Malo: Mock excesivamente complejo
prisma.user.findUnique.mockImplementation(async (args) => {
  // Lógica compleja innecesaria
});
```

## Troubleshooting

### Tests Fallando

Si los tests están fallando:

1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Asegúrate de que Prisma esté generado: `npm run prisma:generate`
3. Limpia la caché de Jest: `npx jest --clearCache`
4. Revisa los logs para identificar el error específico

### Problemas de Timeout

Si los tests están timing out:

```typescript
// Aumentar el timeout para tests específicos
it('should handle long operation', async () => {
  // Test code
}, 10000); // 10 segundos

// O globalmente en jest.config.js
module.exports = {
  testTimeout: 10000,
};
```

### Mocks No Funcionan

Si los mocks no están funcionando:

1. Verifica que el mock esté antes de importar el módulo
2. Usa `jest.clearAllMocks()` en `beforeEach`
3. Revisa la sintaxis del mock

## Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
- [TypeScript Testing Guide](https://www.typescriptlang.org/docs/handbook/testing.html)

## Contribuir

Al agregar nuevas funcionalidades:

1. ✅ Escribe tests para la nueva funcionalidad
2. ✅ Asegúrate de que todos los tests existentes pasen
3. ✅ Mantén la cobertura de código por encima del 80%
4. ✅ Documenta casos de prueba complejos
5. ✅ Sigue las convenciones de naming establecidas

## Contacto y Soporte

Para preguntas sobre testing:
- Revisa la documentación existente
- Consulta ejemplos en el código
- Contacta al equipo de desarrollo
