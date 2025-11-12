# Obra360 - Sistema de Gestión de Construcción

Sistema completo de gestión de proyectos de construcción con arquitectura de microservicios escalable y moderna.

## ✅ Estado del Proyecto: BACKEND + FRONTEND + TESTING COMPLETADOS

🎉 **Sistema completamente funcional** con 7 microservicios backend, frontend con Next.js 14 y suite de testing completa.

## 🎯 Características Principales

- ✅ **7 Microservicios backend** (Auth, Projects, Files, Billing, Notifications, Analytics, API Gateway)
- ✅ **Frontend con Next.js 14** + TypeScript + Tailwind CSS
- ✅ **Sistema de roles diferenciados**: Staff, Customers y Contractors
- ✅ **Dashboard adaptativo** según rol con KPIs en tiempo real
- ✅ **Autenticación JWT** con refresh automático de tokens
- ✅ **Permisos granulares** configurables por usuario
- ✅ **Gestión completa de proyectos** con tasks, files y discussions
- ✅ **Sistema de facturación** con invoices y proposals
- ✅ **Notificaciones** multi-canal (Email, In-app, Push)
- ✅ **Analytics** y reportes en tiempo real
- ✅ **Alta disponibilidad** con health checks y graceful shutdown
- ✅ **Seguridad** robusta (JWT, rate limiting, validaciones, CORS)
- ✅ **Testing completo** con Jest y Supertest (unit + integration tests)

## 🚀 Inicio Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/TobyG23/Refactor-Obra360.git
cd Refactor-Obra360

# 2. Instalar dependencias
npm install

# 3. Iniciar base de datos
npm run docker:up

# 4. Ejecutar migraciones
npm run migrate:dev

# 5. Poblar con datos de prueba
cd packages/shared && npm run db:seed && cd ../..

# 6. Iniciar backend
npm run dev

# 7. En otra terminal, iniciar frontend
cd packages/frontend
npm install
npm run dev
```

**¡Listo!**
- **Backend (API)**: http://localhost:3000
- **Frontend**: http://localhost:3001

### Usuarios de Prueba

Todos con password: `Password123!`

- **admin@obra360.com** - Administrador (STAFF)
- **pm@obra360.com** - Project Manager (STAFF)
- **cliente1@example.com** - Cliente (CUSTOMER)
- **arquitecto@example.com** - Arquitecto (CONTRACTOR)

Ver guía completa en [SETUP.md](./SETUP.md)

## 📚 Documentación

- **[SETUP.md](./SETUP.md)** - Guía de instalación paso a paso
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura del sistema
- **[API.md](./API.md)** - Documentación completa de la API
- **[TESTING.md](./TESTING.md)** - Guía de testing y cobertura
- **packages/*/README.md** - Documentación de cada microservicio

## 🏗️ Arquitectura de Microservicios

```
Frontend Next.js :3001
            ↓
    API Gateway :3000
   ↓   ↓   ↓   ↓   ↓   ↓
  3001 3002 3003 3004 3005 3006
  Auth Proj Files Bill Notif Analyt
       ↓
PostgreSQL + Redis
```

## 📊 Microservicios Implementados

| Servicio | Puerto | Estado | Descripción |
|----------|--------|--------|-------------|
| **Frontend** | 3001 | ✅ | Next.js 14, React 18, Tailwind CSS |
| **API Gateway** | 3000 | ✅ | Punto de entrada único, rate limiting |
| Auth Service | 3001 | ✅ | JWT, refresh tokens, permisos granulares |
| Projects Service | 3002 | ✅ | Proyectos, tasks, asignaciones, discussions |
| Files Service | 3003 | ✅ | Upload/download, validación MIME, 50MB max |
| Billing Service | 3004 | ✅ | Invoices, proposals, numeración automática |
| Notifications Service | 3005 | ✅ | Email, in-app, push notifications |
| Analytics Service | 3006 | ✅ | Dashboard KPIs, reportes, activity logs |

## 🏗️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 20+
- **Lenguaje**: TypeScript
- **Framework**: Express.js 5
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 16
- **Cache**: Redis 7
- **Autenticación**: JWT con refresh tokens

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Estilos**: Tailwind CSS
- **State**: Context API
- **HTTP**: Axios con interceptors

### Infraestructura
- **Contenedores**: Docker & Docker Compose
- **Monorepo**: npm workspaces
- **CI/CD**: GitHub Actions (futuro)

## 👥 Sistema de Roles y Permisos

### Roles Base

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **STAFF** | Personal administrativo | Acceso completo a todos los recursos |
| **CUSTOMER** | Clientes | Acceso a sus proyectos, tasks, files, discussions |
| **CONTRACTOR** | Contratistas/Personal | Acceso configurable a proyectos asignados |

### Permisos Granulares

Los administradores pueden configurar permisos específicos por usuario:

- **Recursos**: PROJECTS, TASKS, FILES, DISCUSSIONS, INVOICES, PROPOSALS, ANALYTICS, USERS
- **Acciones**: VIEW, CREATE, EDIT, DELETE
- **Nivel**: Global o por recurso específico (ej: solo proyecto X)

Ejemplo: Un contractor puede tener permiso para VIEW y EDIT tasks, pero no DELETE.

## 📁 Estructura del Proyecto

```
obra360-refactor/
├── packages/
│   ├── shared/           # Código compartido (Prisma client, types)
│   ├── auth-service/     # Microservicio de autenticación
│   ├── projects-service/ # Microservicio de proyectos
│   ├── files-service/    # Microservicio de archivos
│   ├── billing-service/  # Microservicio de facturación
│   ├── notifications-service/ # Microservicio de notificaciones
│   ├── analytics-service/ # Microservicio de analytics
│   ├── api-gateway/      # API Gateway
│   └── frontend/         # Aplicación Next.js (pendiente)
├── docker-compose.yml    # PostgreSQL + Redis
├── SETUP.md             # Guía de instalación
├── ARCHITECTURE.md      # Documentación de arquitectura
├── API.md               # Documentación de API
└── README.md            # Este archivo
```

## 📝 Estado del Proyecto

### ✅ Completado

- [x] Análisis de arquitectura actual
- [x] Análisis de sistema de referencia (Intergraphic)
- [x] Diseño de arquitectura de microservicios
- [x] Implementación de estructura base del monorepo
- [x] Schema de base de datos completo con Prisma
- [x] Docker Compose (PostgreSQL + Redis + PGAdmin)
- [x] **Auth Service** - JWT, refresh tokens, sistema de permisos
- [x] **Projects Service** - CRUD proyectos, tasks, asignaciones, discussions
- [x] **Files Service** - Upload/download con validaciones y límites
- [x] **Billing Service** - Invoices y proposals con auto-numeración
- [x] **Notifications Service** - Sistema de notificaciones multi-canal
- [x] **Analytics Service** - Reportes, KPIs y activity logs
- [x] **API Gateway** - Enrutamiento, rate limiting, CORS
- [x] Seed con datos de prueba (6 usuarios, 3 proyectos, tasks, etc.)
- [x] Documentación completa (SETUP, ARCHITECTURE, API, TESTING)
- [x] READMEs individuales por microservicio
- [x] **Frontend** con Next.js 14
  - [x] Login page con validación
  - [x] Dashboard adaptativo por rol
  - [x] AuthContext y API client
  - [x] Refresh automático de tokens
  - [x] Diseño responsive empresarial
- [x] **Testing Suite Completa**
  - [x] Unit tests para Auth Service (Jest)
  - [x] Unit tests para Projects Service (Jest)
  - [x] Unit tests para Files Service (Jest)
  - [x] Unit tests para Billing Service (Jest)
  - [x] Integration tests para API Gateway (Supertest)
  - [x] Scripts de testing configurados
  - [x] Documentación completa de testing

### ⏳ Pendiente

- [ ] **Expansión Frontend**
  - [ ] CRUD completo de proyectos
  - [ ] Gestión de tasks con drag & drop
  - [ ] Sistema de archivos con upload
  - [ ] Chat/Discussions en tiempo real
  - [ ] Facturación UI
  - [ ] Notificaciones en tiempo real
- [ ] **Testing Adicional**
  - [ ] E2E tests (Playwright)
  - [ ] Frontend unit tests
  - [ ] Performance tests
- [ ] **CI/CD**
  - [ ] GitHub Actions pipelines
  - [ ] Automated testing
  - [ ] Deployment automation
- [ ] **Producción**
  - [ ] Kubernetes manifests
  - [ ] Monitoring (Prometheus + Grafana)
  - [ ] Logging centralizado (ELK)

## 🔧 Comandos Útiles

### Desarrollo

```bash
npm run dev              # Iniciar todos los servicios
npm run dev:auth         # Solo Auth Service
npm run dev:projects     # Solo Projects Service
npm run dev:files        # Solo Files Service
npm run dev:billing      # Solo Billing Service
npm run dev:notifications # Solo Notifications Service
npm run dev:analytics    # Solo Analytics Service
npm run dev:gateway      # Solo API Gateway
npm run dev:frontend     # Solo Frontend
```

### Base de Datos

```bash
npm run migrate:dev      # Ejecutar migraciones en desarrollo
npm run migrate          # Ejecutar migraciones en producción
npm run studio           # Abrir Prisma Studio (BD visual)
cd packages/shared && npm run db:seed  # Poblar con datos de prueba
```

### Docker

```bash
npm run docker:up        # Iniciar PostgreSQL + Redis
npm run docker:down      # Detener contenedores
npm run docker:logs      # Ver logs de contenedores
```

### Build y Calidad

```bash
npm run build            # Build de todos los servicios
npm run lint             # Ejecutar ESLint
npm run format           # Formatear código con Prettier
```

## 🧪 Testing

```bash
npm run test             # Ejecutar todos los tests
npm run test:unit        # Unit tests de servicios
npm run test:integration # Integration tests (API Gateway)
npm run test:coverage    # Coverage report
npm run test:watch       # Tests en modo watch
npm run test:auth        # Solo tests de Auth Service
npm run test:projects    # Solo tests de Projects Service
npm run test:files       # Solo tests de Files Service
npm run test:billing     # Solo tests de Billing Service
npm run test:gateway     # Solo tests de API Gateway
```

Ver guía completa en [TESTING.md](./TESTING.md)

## 🔐 Seguridad

- ✅ **JWT** con access + refresh tokens
- ✅ **Password hashing** con bcrypt (10 rounds)
- ✅ **Validación de contraseñas** fuertes (8+ chars, mayúsc, minúsc, número, especial)
- ✅ **Rate limiting** (100 req/15min)
- ✅ **Helmet** para headers HTTP seguros
- ✅ **CORS** configurado
- ✅ **Validación de tipos MIME** en uploads
- ✅ **SQL Injection protection** con Prisma ORM
- ✅ **Refresh token rotation** automática

## 📊 Base de Datos

### Schema Principal

- **Users** - Usuarios del sistema con roles
- **RefreshTokens** - Tokens de refresco JWT
- **UserPermissions** - Permisos granulares por usuario
- **Projects** - Proyectos de construcción
- **ProjectAssignments** - Asignación de contractors a proyectos
- **Tasks** - Tareas dentro de proyectos
- **Files** - Archivos asociados a proyectos/tasks
- **Discussions** - Sistema de chat con hilos
- **Invoices** + **InvoiceItems** - Facturación
- **Proposals** - Propuestas comerciales
- **Notifications** - Notificaciones del sistema
- **NotificationTokens** - Tokens para push notifications
- **ActivityLogs** - Logs de auditoría

## 🌐 Endpoints Principales

Ver documentación completa en [API.md](./API.md)

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/profile` - Obtener perfil

### Proyectos
- `GET /api/projects` - Listar proyectos (filtrado por rol)
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Ver proyecto
- `PUT /api/projects/:id` - Actualizar proyecto

### Tareas
- `GET /api/projects/:projectId/tasks` - Tareas de proyecto
- `POST /api/projects/tasks` - Crear tarea
- `PUT /api/projects/tasks/:id` - Actualizar tarea

### Archivos
- `POST /api/files/upload` - Subir archivo
- `GET /api/files/:id/download` - Descargar archivo
- `GET /api/files/project/:projectId` - Archivos de proyecto

### Facturación
- `GET /api/billing/invoices` - Listar invoices
- `POST /api/billing/invoices` - Crear invoice
- `GET /api/billing/proposals` - Listar proposals

### Analytics
- `GET /api/analytics/dashboard` - KPIs globales
- `GET /api/analytics/projects/:id` - Analytics de proyecto

## 🤝 Contribución

Este es un proyecto privado. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Privado - Obra360 © 2024

## 👨‍💻 Créditos

Refactorización completa desarrollada por **Claude Code** basándose en:
- Repositorio original: Obra360 (frontend-obra360, backend-obra360)
- Referencia de arquitectura: Intergraphic

## 📞 Contacto y Soporte

- **Repositorio**: https://github.com/TobyG23/Refactor-Obra360
- **Documentación**: Ver archivos SETUP.md, ARCHITECTURE.md, API.md
- **Issues**: https://github.com/TobyG23/Refactor-Obra360/issues

---

**Nota**: El sistema está completamente funcional con backend + frontend + testing suite completa. Próximos pasos: expansión de funcionalidades frontend y E2E testing.
