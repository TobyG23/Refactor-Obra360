# Arquitectura de Obra360 - Refactorización

## Visión General

Obra360 ha sido completamente refactorizado con una arquitectura de **microservicios escalable y resiliente**. El sistema está diseñado para permitir mantenimiento independiente de cada servicio sin afectar a toda la aplicación.

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 20+
- **Lenguaje**: TypeScript
- **Framework**: Express.js 5
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Autenticación**: JWT con Refresh Tokens

### Frontend (En desarrollo)
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Validación**: Zod

### Infraestructura
- **Contenedores**: Docker & Docker Compose
- **Monorepo**: npm workspaces
- **CI/CD**: GitHub Actions (futuro)

## Arquitectura de Microservicios

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│              Dashboard | Projects | Files                │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│              API GATEWAY (Port 3000)                     │
│   Rate Limiting | Autenticación | Routing                │
└──┬────┬────┬────┬────┬────┬─────────────────────────────┘
   │    │    │    │    │    │
   ▼    ▼    ▼    ▼    ▼    ▼
┌─────┐┌───┐┌───┐┌───┐┌───┐┌────┐
│Auth ││Pro││Fil││Bil││Not││Ana │
│3001 ││3002││3003││3004││3005││3006│
└─────┘└───┘└───┘└───┘└───┘└────┘
   │      │    │    │    │    │
   └──────┴────┴────┴────┴────┘
              │
   ┌──────────▼───────────┐
   │  PostgreSQL + Redis  │
   └──────────────────────┘
```

## Microservicios Implementados

### 1. Auth Service (✅ Completado)
**Puerto**: 3001
**Responsabilidad**: Autenticación y autorización

**Endpoints**:
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovación de tokens
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/profile` - Perfil de usuario
- `GET /api/auth/check-permission` - Verificar permisos

**Características**:
- ✅ JWT con access + refresh tokens
- ✅ Refresh token rotation
- ✅ Sistema de permisos granulares
- ✅ Validación de contraseñas fuertes
- ✅ Health checks
- ✅ Graceful shutdown

### 2. Projects Service (Pendiente)
**Puerto**: 3002
**Responsabilidad**: Gestión de proyectos y tareas

**Funcionalidades planificadas**:
- CRUD de proyectos
- Asignación de contractors
- Gestión de tasks
- Estados y prioridades
- Timeline y deadlines

### 3. Files Service (Pendiente)
**Puerto**: 3003
**Responsabilidad**: Gestión de archivos

**Funcionalidades planificadas**:
- Upload/Download de archivos
- Asociación con proyectos/tasks
- Versionado
- Storage (filesystem o S3)
- Generación de thumbnails

### 4. Billing Service (Pendiente)
**Puerto**: 3004
**Responsabilidad**: Facturación y propuestas

**Funcionalidades planificadas**:
- CRUD de invoices
- CRUD de proposals
- Generación de PDFs
- Estados de pago
- Historial financiero

### 5. Notifications Service (Pendiente)
**Puerto**: 3005
**Responsabilidad**: Notificaciones multi-canal

**Funcionalidades planificadas**:
- Email notifications (NodeMailer)
- In-app notifications
- Push notifications (Firebase/OneSignal)
- Plantillas de notificaciones
- Cola de procesamiento con Redis

### 6. Analytics Service (Pendiente)
**Puerto**: 3006
**Responsabilidad**: Reportes y métricas

**Funcionalidades planificadas**:
- KPIs del dashboard
- Reportes por proyecto
- Estadísticas de equipo
- Exportación de datos

### 7. API Gateway (Pendiente)
**Puerto**: 3000
**Responsabilidad**: Punto de entrada único

**Funcionalidades planificadas**:
- Rate limiting
- Request routing
- Authentication proxy
- CORS handling
- Logging centralizado

## Modelo de Datos

### Sistema de Roles

| Rol | Descripción | Permisos Base |
|-----|-------------|---------------|
| **STAFF** | Personal administrativo | Acceso completo a todos los recursos |
| **CUSTOMER** | Clientes | Ver proyectos asignados, tasks, files, discussions |
| **CONTRACTOR** | Contratistas | Permisos configurables por administrador |

### Entidades Principales

#### Users
```typescript
{
  id: string
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  phone?: string
  avatar?: string
}
```

#### Projects
```typescript
{
  id: string
  name: string
  description?: string
  status: ProjectStatus (DRAFT|ACTIVE|ON_HOLD|COMPLETED|CANCELLED)
  customerId: string (FK)
  createdById: string (FK)
  startDate?: Date
  endDate?: Date
  budget?: Decimal
}
```

#### Tasks
```typescript
{
  id: string
  title: string
  description?: string
  status: TaskStatus (TODO|IN_PROGRESS|IN_REVIEW|COMPLETED|CANCELLED)
  priority: TaskPriority (LOW|MEDIUM|HIGH|URGENT)
  projectId: string (FK)
  assignedToId?: string (FK)
  createdById: string (FK)
  dueDate?: Date
}
```

#### Files
```typescript
{
  id: string
  filename: string
  originalName: string
  path: string
  mimeType: string
  size: number (bytes)
  projectId?: string (FK)
  taskId?: string (FK)
  uploadedById: string (FK)
}
```

#### Discussions
```typescript
{
  id: string
  message: string
  projectId?: string (FK)
  taskId?: string (FK)
  userId: string (FK)
  parentId?: string (FK) // Para hilos
}
```

#### Invoices
```typescript
{
  id: string
  invoiceNumber: string (unique)
  status: InvoiceStatus (DRAFT|SENT|PAID|OVERDUE|CANCELLED)
  projectId: string (FK)
  customerId: string (FK)
  createdById: string (FK)
  subtotal: Decimal
  tax?: Decimal
  total: Decimal
  dueDate: Date
  paidAt?: Date
  items: InvoiceItem[]
}
```

#### Proposals
```typescript
{
  id: string
  proposalNumber: string (unique)
  title: string
  status: ProposalStatus (DRAFT|SENT|ACCEPTED|REJECTED|EXPIRED)
  projectId: string (FK)
  customerId: string (FK)
  createdById: string (FK)
  content: string (HTML/Markdown)
  total: Decimal
  validUntil?: Date
  acceptedAt?: Date
}
```

## Sistema de Permisos Granulares

### Recursos Protegidos
- `PROJECTS`
- `TASKS`
- `FILES`
- `DISCUSSIONS`
- `INVOICES`
- `PROPOSALS`
- `ANALYTICS`
- `USERS`

### Acciones
- `VIEW` - Ver/leer
- `CREATE` - Crear
- `EDIT` - Editar
- `DELETE` - Eliminar

### Lógica de Permisos

1. **STAFF**: Acceso completo a todo
2. **CUSTOMER**: Permisos por defecto configurados
3. **CONTRACTOR**: Verificación en orden:
   - Si hay permisos personalizados → usar esos
   - Si no → usar permisos por defecto del rol

### Configuración de Permisos

Los administradores pueden crear registros en `user_permissions`:

```typescript
{
  userId: string
  resource: PermissionResource
  action: PermissionAction
  allowed: boolean
  resourceId?: string // Opcional: permiso a nivel de registro específico
}
```

**Ejemplo**: Permitir a un contractor ver solo invoices de proyectos específicos:
```typescript
{
  userId: "contractor-uuid",
  resource: "INVOICES",
  action: "VIEW",
  allowed: true,
  resourceId: "project-uuid"
}
```

## Seguridad

### Autenticación
- ✅ JWT con access tokens (expiración 15m)
- ✅ Refresh tokens con rotación (expiración 7d)
- ✅ Refresh tokens almacenados en BD
- ✅ Invalidación de tokens en logout

### Passwords
- ✅ Hashing con bcrypt (10 rounds)
- ✅ Validación de fortaleza:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
  - Al menos 1 carácter especial

### Headers de Seguridad
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado
- ✅ Rate limiting (futuro, en API Gateway)

### Protección contra Ataques
- ✅ SQL Injection: Prevención con Prisma ORM
- ✅ XSS: Sanitización de inputs
- ✅ CSRF: Tokens en requests sensibles
- ✅ Session hijacking: Refresh token rotation

## Alta Disponibilidad

### Health Checks
Cada microservicio expone:
- `/health` - Estado básico del servicio
- `/ready` - Estado + verificación de dependencias (BD, Redis)

### Graceful Shutdown
Todos los servicios manejan señales `SIGTERM` y `SIGINT`:
1. Dejan de aceptar nuevas conexiones
2. Completan requests en curso
3. Cierran conexiones a BD
4. Terminan el proceso limpiamente

### Resiliencia
- Circuit breaker patterns (futuro)
- Retry logic con exponential backoff (futuro)
- Fallback responses (futuro)

## Base de Datos

### PostgreSQL 16
- Pool de conexiones gestionado por Prisma
- Migraciones versionadas con Prisma Migrate
- Seed data para desarrollo

### Redis 7
- Cache de sesiones
- Queue para jobs asíncronos (BullMQ, futuro)
- Pub/Sub para eventos entre servicios (futuro)

## Monorepo

### Estructura de Workspaces
```
packages/
├── shared/           # Código compartido (Prisma client, types)
├── auth-service/     # Microservicio de autenticación
├── projects-service/ # Microservicio de proyectos
├── files-service/    # Microservicio de archivos
├── billing-service/  # Microservicio de facturación
├── notifications-service/ # Microservicio de notificaciones
├── analytics-service/ # Microservicio de analytics
├── api-gateway/      # API Gateway
└── frontend/         # Aplicación Next.js
```

### Ventajas del Monorepo
- ✅ Código compartido fácilmente
- ✅ Versionado unificado
- ✅ Refactorings atómicos
- ✅ CI/CD simplificado

## Desarrollo Local

### Setup Inicial
```bash
# Clonar repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar base de datos
docker-compose up -d

# Ejecutar migraciones
npm run migrate:dev

# Seed de datos de prueba
npm run db:seed
```

### Ejecutar Servicios
```bash
# Todos los servicios
npm run dev

# Servicio específico
npm run dev:auth
npm run dev:projects
```

### Usuarios de Prueba
```
Admin:      admin@obra360.com       | Password123!
PM:         pm@obra360.com          | Password123!
Cliente 1:  cliente1@example.com    | Password123!
Cliente 2:  cliente2@example.com    | Password123!
Contractor: arquitecto@example.com  | Password123!
Contractor: ingeniero@example.com   | Password123!
```

## Roadmap

### Fase 1: Backend Core (80% completado)
- [x] Estructura del monorepo
- [x] Schema de base de datos
- [x] Docker Compose
- [x] Auth Service
- [ ] Projects Service
- [ ] Files Service
- [ ] Billing Service

### Fase 2: Comunicaciones (0% completado)
- [ ] Notifications Service
- [ ] API Gateway
- [ ] Event bus con Redis

### Fase 3: Analytics & Frontend (0% completado)
- [ ] Analytics Service
- [ ] Frontend Next.js
- [ ] Dashboard
- [ ] Gestión de proyectos UI
- [ ] Sistema de archivos UI

### Fase 4: Optimización (0% completado)
- [ ] Cache con Redis
- [ ] Rate limiting
- [ ] Compression
- [ ] CDN para archivos estáticos

### Fase 5: Producción (0% completado)
- [ ] CI/CD pipelines
- [ ] Kubernetes manifests
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Logging centralizado (ELK)
- [ ] Backups automatizados

## Decisiones de Diseño

### ¿Por qué Microservicios?
- ✅ **Escalabilidad independiente**: Cada servicio puede escalar según su carga
- ✅ **Mantenimiento sin downtime**: Actualizar un servicio no afecta a otros
- ✅ **Tecnologías específicas**: Cada servicio puede usar la mejor herramienta
- ✅ **Equipos independientes**: Equipos pueden trabajar en paralelo

### ¿Por qué TypeScript?
- ✅ **Type safety**: Menos bugs en producción
- ✅ **IntelliSense**: Mejor experiencia de desarrollo
- ✅ **Refactoring seguro**: El compilador detecta errores
- ✅ **Documentación implícita**: Los types documentan el código

### ¿Por qué Prisma?
- ✅ **Type-safe queries**: TypeScript end-to-end
- ✅ **Migraciones automáticas**: Schema como fuente de verdad
- ✅ **Prisma Studio**: GUI para explorar datos
- ✅ **Performance**: Query optimization automática

### ¿Por qué JWT?
- ✅ **Stateless**: No requiere storage del lado del servidor
- ✅ **Escalable**: Funciona con múltiples instancias
- ✅ **Standard**: Ampliamente soportado
- ✅ **Información en el token**: Roles y permisos incluidos

### ¿Base de Datos Compartida?
✅ **Decisión: Compartida inicialmente**
- Más simple de mantener
- Transacciones ACID entre entidades
- Queries complejas más eficientes
- Migración futura a BD separadas posible

## Contribución

### Estándares de Código
- ESLint + Prettier configurados
- Commits con formato convencional (feat, fix, docs, etc.)
- Pull requests requieren review

### Testing (Futuro)
- Unit tests con Jest
- Integration tests con Supertest
- E2E tests con Playwright

## Contacto y Soporte

- **Repositorio**: [GitHub](https://github.com/TobyG23/Refactor-Obra360)
- **Documentación**: Ver `/packages/*/README.md` para cada servicio
