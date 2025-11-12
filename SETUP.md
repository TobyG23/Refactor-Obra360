# Guía de Instalación - Obra360

Guía paso a paso para instalar y ejecutar todo el sistema Obra360.

## Requisitos Previos

- **Node.js** 20+ y npm 10+
- **Docker** y **Docker Compose** (para PostgreSQL y Redis)
- **Git**

## 1. Clonar el Repositorio

```bash
git clone https://github.com/TobyG23/Refactor-Obra360.git
cd Refactor-Obra360
```

## 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias de todos los workspaces (microservicios).

## 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones (puedes usar los valores por defecto para desarrollo local).

## 4. Iniciar Base de Datos

Inicia PostgreSQL y Redis con Docker Compose:

```bash
npm run docker:up
```

Esto levantará:
- **PostgreSQL** en puerto 5432
- **Redis** en puerto 6379
- **PGAdmin** en puerto 5050 (opcional, para gestionar BD visualmente)

### Acceder a PGAdmin

- URL: http://localhost:5050
- Email: admin@obra360.com
- Password: admin

## 5. Ejecutar Migraciones de Base de Datos

```bash
npm run migrate:dev
```

Esto creará todas las tablas en PostgreSQL usando Prisma.

## 6. Poblar la Base de Datos (Seed)

```bash
cd packages/shared
npm run db:seed
cd ../..
```

Esto creará datos de prueba:
- 6 usuarios (admin, PM, 2 clientes, 2 contractors)
- 3 proyectos con tasks
- Discussions, invoices, proposals, etc.

### Usuarios de Prueba

Todos tienen la contraseña: `Password123!`

| Email | Rol | Descripción |
|-------|-----|-------------|
| admin@obra360.com | STAFF | Administrador con acceso completo |
| pm@obra360.com | STAFF | Project Manager |
| cliente1@example.com | CUSTOMER | Cliente 1 |
| cliente2@example.com | CUSTOMER | Cliente 2 |
| arquitecto@example.com | CONTRACTOR | Arquitecto |
| ingeniero@example.com | CONTRACTOR | Ingeniero |

## 7. Iniciar Todos los Servicios

### Opción A: Iniciar todos a la vez

```bash
npm run dev
```

Esto iniciará los 7 microservicios simultáneamente:
- Auth Service (3001)
- Projects Service (3002)
- Files Service (3003)
- Billing Service (3004)
- Notifications Service (3005)
- Analytics Service (3006)
- API Gateway (3000)

### Opción B: Iniciar servicios individuales

```bash
# En terminales separadas:
npm run dev:auth         # Puerto 3001
npm run dev:projects     # Puerto 3002
npm run dev:files        # Puerto 3003
npm run dev:billing      # Puerto 3004
npm run dev:notifications # Puerto 3005
npm run dev:analytics    # Puerto 3006
npm run dev:gateway      # Puerto 3000
```

## 8. Verificar que Todo Funciona

### Health Checks

Cada servicio expone un endpoint `/health`:

```bash
# Via API Gateway (recomendado)
curl http://localhost:3000/api/auth/health
curl http://localhost:3000/api/projects/health
curl http://localhost:3000/api/files/health
curl http://localhost:3000/api/billing/health
curl http://localhost:3000/api/notifications/health
curl http://localhost:3000/api/analytics/health

# O directamente a cada servicio
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Projects
curl http://localhost:3003/health  # Files
curl http://localhost:3004/health  # Billing
curl http://localhost:3005/health  # Notifications
curl http://localhost:3006/health  # Analytics
```

Todos deberían responder:
```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Probar Autenticación

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@obra360.com",
    "password": "Password123!"
  }'
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@obra360.com",
      "firstName": "Admin",
      "lastName": "Sistema",
      "role": "STAFF"
    }
  }
}
```

### Probar Proyectos

```bash
# Obtener proyectos (usa el accessToken del login anterior)
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 9. Prisma Studio (Opcional)

Para visualizar y editar datos en la BD:

```bash
npm run studio
```

Abre http://localhost:5555

## Estructura de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| **API Gateway** | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Projects Service | 3002 | http://localhost:3002 |
| Files Service | 3003 | http://localhost:3003 |
| Billing Service | 3004 | http://localhost:3004 |
| Notifications Service | 3005 | http://localhost:3005 |
| Analytics Service | 3006 | http://localhost:3006 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| PGAdmin | 5050 | http://localhost:5050 |
| Prisma Studio | 5555 | http://localhost:5555 |

## Uso del API Gateway

**Importante**: Todas las peticiones desde el frontend deben ir al API Gateway (puerto 3000), no directamente a los microservicios.

### URLs del API Gateway

```
http://localhost:3000/api/auth/*          → Auth Service
http://localhost:3000/api/projects/*      → Projects Service
http://localhost:3000/api/files/*         → Files Service
http://localhost:3000/api/billing/*       → Billing Service
http://localhost:3000/api/notifications/* → Notifications Service
http://localhost:3000/api/analytics/*     → Analytics Service
```

### Ejemplo de Flujo Completo

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@obra360.com", "password": "Password123!"}' \
  | jq -r '.data.accessToken')

# 2. Obtener proyectos
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN"

# 3. Crear proyecto
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Proyecto",
    "description": "Descripción del proyecto",
    "customerId": "ID_DEL_CLIENTE",
    "budget": 100000
  }'

# 4. Ver analytics
curl http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## Comandos Útiles

### Desarrollo

```bash
npm run dev                # Iniciar todos los servicios
npm run dev:auth          # Solo Auth Service
npm run dev:projects      # Solo Projects Service
# etc...
```

### Base de Datos

```bash
npm run migrate:dev       # Ejecutar migraciones en desarrollo
npm run migrate           # Ejecutar migraciones en producción
npm run studio            # Abrir Prisma Studio
npm run db:seed           # Poblar con datos de prueba
```

### Docker

```bash
npm run docker:up         # Iniciar contenedores
npm run docker:down       # Detener contenedores
npm run docker:logs       # Ver logs de contenedores
```

### Build

```bash
npm run build             # Build de todos los servicios
npm run lint              # Ejecutar ESLint
npm run format            # Formatear código con Prettier
```

## Troubleshooting

### Error: "Port already in use"

Algún puerto está ocupado. Detén el proceso que lo usa o cambia el puerto en `.env`.

```bash
# Linux/Mac: Encontrar proceso en puerto 3000
lsof -i :3000

# Matar proceso
kill -9 PID
```

### Error: "Connection refused" al conectar a PostgreSQL

Asegúrate de que Docker está corriendo:

```bash
docker ps
```

Deberías ver los contenedores `obra360-postgres` y `obra360-redis`.

Si no están:
```bash
npm run docker:up
```

### Error: "Cannot find module '@obra360/shared'"

Las dependencias no están instaladas:

```bash
npm install
```

### Error: "Table does not exist"

Las migraciones no se ejecutaron:

```bash
npm run migrate:dev
```

### Prisma Studio no abre

Asegúrate de estar en el directorio correcto:

```bash
cd packages/shared
npm run studio
```

## Siguiente Paso: Frontend

Con el backend corriendo, ya puedes:
1. Probar todos los endpoints con Postman/cURL
2. Desarrollar el frontend Next.js
3. Integrar el frontend con el API Gateway

## Soporte

- **Documentación**: Ver `/ARCHITECTURE.md` y `/packages/*/README.md`
- **Repositorio**: https://github.com/TobyG23/Refactor-Obra360
