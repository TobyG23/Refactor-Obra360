# Obra360 - Refactorización con Arquitectura de Microservicios

Refactorización completa de Obra360 con arquitectura de microservicios escalable, inspirada en el sistema Intergraphic.

## 🎯 Objetivos del Proyecto

- **Sistema de roles diferenciados**: Staff, Customers y Contractors
- **Permisos granulares** por rol
- **Arquitectura de microservicios** escalable y resiliente
- **Sistema de proyectos** con tasks, files y discussions
- **Alta disponibilidad** con capacidad de mantenimiento por servicio

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Node.js 20+ con TypeScript
- Express.js 5
- Prisma ORM
- PostgreSQL 16
- Redis para cache y message queue

**Frontend:**
- Next.js 14
- TypeScript
- Tailwind CSS
- React 18

**Infraestructura:**
- Docker & Docker Compose
- API Gateway
- BullMQ para jobs asíncronos
- Swagger/OpenAPI para documentación

### Microservicios

1. **Auth Service** (Puerto 3001) - Autenticación y autorización
2. **Projects Service** (Puerto 3002) - Gestión de proyectos y tasks
3. **Files Service** (Puerto 3003) - Gestión de archivos
4. **Billing Service** (Puerto 3004) - Invoices y proposals
5. **Notifications Service** (Puerto 3005) - Notificaciones
6. **Analytics Service** (Puerto 3006) - Reportes y métricas
7. **API Gateway** (Puerto 3000) - Punto de entrada único

## 👥 Sistema de Roles y Permisos

### Roles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **STAFF** | Personal administrativo | Acceso completo: crear customers/contractors, gestionar proyectos, ver invoices, proposals y analytics |
| **CUSTOMER** | Clientes | Ver proyectos asignados, tasks, files, discussions. Sin acceso a invoices/proposals |
| **CONTRACTOR** | Contratistas/Personal | Interactuar con proyectos asignados, tasks y files. Sin acceso a datos financieros ni analytics |

### Matriz de Permisos

| Funcionalidad | STAFF | CUSTOMER | CONTRACTOR |
|---------------|-------|----------|------------|
| Crear/editar customers | ✅ | ❌ | ❌ |
| Crear/editar contractors | ✅ | ❌ | ❌ |
| Ver todos los proyectos | ✅ | ❌ | ❌ |
| Ver proyectos asignados | ✅ | ✅ | ✅ |
| Gestionar tasks | ✅ | Ver | Editar asignadas |
| Upload/download files | ✅ | ✅ | ✅ |
| Participar en discussions | ✅ | ✅ | ✅ |
| Ver/crear invoices | ✅ | ❌ | ❌ |
| Ver/crear proposals | ✅ | ❌ | ❌ |
| Ver analytics | ✅ | ❌ | ❌ |

## 📁 Estructura del Proyecto

```
obra360-refactor/
├── packages/
│   ├── auth-service/         # Microservicio de autenticación
│   ├── projects-service/     # Microservicio de proyectos
│   ├── files-service/        # Microservicio de archivos
│   ├── billing-service/      # Microservicio de facturación
│   ├── notifications-service/# Microservicio de notificaciones
│   ├── analytics-service/    # Microservicio de analytics
│   ├── api-gateway/          # API Gateway
│   ├── frontend/             # Aplicación Next.js
│   └── shared/               # Código compartido
│       ├── types/
│       ├── utils/
│       └── constants/
├── docker/
│   ├── postgres/
│   ├── redis/
│   └── nginx/
├── docker-compose.yml
├── package.json
└── README.md
```

## 🚀 Características de Alta Disponibilidad

1. **Health Checks**: Cada microservicio expone `/health` y `/ready`
2. **Circuit Breaker**: Resiliencia entre servicios
3. **Graceful Shutdown**: Manejo apropiado de señales
4. **Database Migrations**: Versionadas con Prisma
5. **Modo Mantenimiento**: Por microservicio individual

## 📚 Modelos de Datos Principales

### Users
- id, email, password, firstName, lastName
- role: STAFF | CUSTOMER | CONTRACTOR
- isActive, createdAt, updatedAt

### Projects
- id, name, description, status
- customerId (FK to Users)
- createdBy (FK to Users - Staff)
- startDate, endDate

### ProjectAssignments
- projectId, userId (Contractors asignados)
- role, permissions

### Tasks
- id, projectId, title, description, status
- assignedTo (FK to Users)
- dueDate, priority

### Files
- id, projectId, taskId (optional)
- filename, path, uploadedBy
- createdAt

### Discussions
- id, projectId, userId, message
- parentId (para hilos), createdAt

### Invoices & Proposals
- Solo visibles para STAFF
- Asociados a proyectos

## 🛠️ Instalación y Desarrollo

```bash
# Clonar el repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar base de datos con Docker
docker-compose up -d postgres redis

# Ejecutar migraciones
npm run migrate

# Iniciar todos los servicios en desarrollo
npm run dev

# Iniciar un servicio específico
npm run dev:auth
npm run dev:projects
```

## 📖 Documentación API

La documentación completa de la API está disponible en:
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI Spec: http://localhost:3000/api-docs.json

## 🔒 Seguridad

- JWT para autenticación
- Refresh tokens con rotación
- Rate limiting en API Gateway
- CORS configurado
- Validación de datos con Zod
- SQL injection protection con Prisma
- XSS protection

## 📝 Estado del Proyecto

- [x] Análisis de arquitectura actual
- [x] Análisis de sistema de referencia (Intergraphic)
- [x] Diseño de arquitectura de microservicios
- [ ] Implementación de estructura base
- [ ] Implementación de Auth Service
- [ ] Implementación de Projects Service
- [ ] Implementación de Files Service
- [ ] Implementación de Billing Service
- [ ] Implementación de Notifications Service
- [ ] Implementación de Analytics Service
- [ ] Implementación de API Gateway
- [ ] Implementación de Frontend
- [ ] Testing
- [ ] Documentación
- [ ] Despliegue

## 📄 Licencia

Privado - Obra360

## 👨‍💻 Desarrollo

Refactorización desarrollada por Claude Code basándose en:
- Repositorio original: Obra360 (frontend-obra360, backend-obra360)
- Referencia de arquitectura: Intergraphic
