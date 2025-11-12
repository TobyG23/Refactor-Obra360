# Projects Service - Obra360

Microservicio de gestión de proyectos, tareas, asignaciones y discusiones.

## Características

- ✅ CRUD completo de proyectos
- ✅ CRUD completo de tareas
- ✅ Asignación de contractors a proyectos
- ✅ Sistema de discusiones/comentarios con hilos
- ✅ Filtrado de datos según rol del usuario
- ✅ Verificación de permisos granulares
- ✅ Health checks y ready checks

## Endpoints

### Projects

#### GET `/api/projects`
Obtener todos los proyectos (filtrado por rol).

- **STAFF**: Ve todos los proyectos
- **CUSTOMER**: Ve solo sus proyectos
- **CONTRACTOR**: Ve solo proyectos asignados

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Proyecto ejemplo",
      "description": "Descripción",
      "status": "ACTIVE",
      "customerId": "uuid",
      "customer": {
        "id": "uuid",
        "email": "cliente@example.com",
        "firstName": "Juan",
        "lastName": "Pérez"
      },
      "createdBy": {...},
      "assignments": [...],
      "_count": {
        "tasks": 10,
        "files": 5,
        "discussions": 8
      },
      "budget": "500000.00",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/projects/:id`
Obtener proyecto por ID con todos sus detalles.

#### POST `/api/projects`
Crear nuevo proyecto (solo STAFF).

**Body:**
```json
{
  "name": "Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "customerId": "uuid-del-cliente",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 500000
}
```

#### PUT `/api/projects/:id`
Actualizar proyecto (solo STAFF).

**Body:**
```json
{
  "name": "Nombre actualizado",
  "status": "ACTIVE",
  "budget": 550000
}
```

#### DELETE `/api/projects/:id`
Eliminar proyecto (solo STAFF).

### Project Assignments

#### POST `/api/projects/:projectId/assignments`
Asignar contractor a proyecto (solo STAFF).

**Body:**
```json
{
  "userId": "uuid-del-contractor",
  "role": "Arquitecto Principal"
}
```

#### DELETE `/api/projects/:projectId/assignments/:userId`
Remover contractor de proyecto (solo STAFF).

### Tasks

#### GET `/api/projects/:projectId/tasks`
Obtener todas las tareas de un proyecto.

#### GET `/api/projects/tasks/:id`
Obtener tarea por ID con detalles completos.

#### POST `/api/projects/tasks`
Crear nueva tarea.

**Body:**
```json
{
  "title": "Nueva tarea",
  "description": "Descripción de la tarea",
  "projectId": "uuid-del-proyecto",
  "assignedToId": "uuid-del-usuario",
  "priority": "HIGH",
  "dueDate": "2024-03-31",
  "startDate": "2024-03-01"
}
```

**Prioridades**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
**Estados**: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `CANCELLED`

#### PUT `/api/projects/tasks/:id`
Actualizar tarea.

**Body:**
```json
{
  "title": "Título actualizado",
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
```

#### DELETE `/api/projects/tasks/:id`
Eliminar tarea (solo STAFF).

### Discussions

#### GET `/api/projects/:projectId/discussions`
Obtener discusiones de un proyecto.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "message": "Mensaje principal",
      "user": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez",
        "avatar": null
      },
      "replies": [
        {
          "id": "uuid",
          "message": "Respuesta al mensaje",
          "user": {...},
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/projects/tasks/:taskId/discussions`
Obtener discusiones de una tarea.

#### POST `/api/projects/discussions`
Crear nueva discusión o respuesta.

**Body (mensaje principal):**
```json
{
  "message": "Contenido del mensaje",
  "projectId": "uuid-del-proyecto"
}
```

**Body (respuesta):**
```json
{
  "message": "Respuesta al mensaje",
  "projectId": "uuid-del-proyecto",
  "parentId": "uuid-del-mensaje-padre"
}
```

**Body (en tarea):**
```json
{
  "message": "Comentario en tarea",
  "taskId": "uuid-de-la-tarea"
}
```

#### DELETE `/api/projects/discussions/:id`
Eliminar discusión (solo autor o STAFF).

## Sistema de Permisos

El servicio verifica permisos llamando al Auth Service antes de ejecutar acciones.

### Recursos
- `PROJECTS`
- `TASKS`
- `DISCUSSIONS`

### Acciones
- `VIEW` - Ver/leer
- `CREATE` - Crear
- `EDIT` - Editar
- `DELETE` - Eliminar

### Lógica por Rol

| Recurso | Acción | STAFF | CUSTOMER | CONTRACTOR |
|---------|--------|-------|----------|------------|
| PROJECTS | VIEW | ✅ Todos | ✅ Solo suyos | ✅ Solo asignados |
| PROJECTS | CREATE | ✅ | ❌ | ❌ |
| PROJECTS | EDIT | ✅ | ❌ | ❌ |
| PROJECTS | DELETE | ✅ | ❌ | ❌ |
| TASKS | VIEW | ✅ | ✅ | ✅ |
| TASKS | CREATE | ✅ | ❌ | ✅* |
| TASKS | EDIT | ✅ | ❌ | ✅* |
| TASKS | DELETE | ✅ | ❌ | ❌ |
| DISCUSSIONS | VIEW | ✅ | ✅ | ✅ |
| DISCUSSIONS | CREATE | ✅ | ✅ | ✅ |
| DISCUSSIONS | DELETE | ✅ | ❌ | ❌ |

*Según permisos configurados

## Variables de Entorno

```env
PORT=3002
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
AUTH_SERVICE_URL="http://localhost:3001"
NODE_ENV="development"
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build
npm run build

# Producción
npm start
```

## Integración con Auth Service

Este servicio se comunica con el Auth Service para:
1. **Verificar tokens**: Validar que el usuario está autenticado
2. **Obtener información del usuario**: ID, email, rol
3. **Verificar permisos**: Comprobar si puede realizar una acción

### Ejemplo de flujo

```
1. Cliente → Projects Service con token
2. Projects Service → Auth Service para verificar token
3. Auth Service → Projects Service (usuario válido)
4. Projects Service → Auth Service para verificar permisos
5. Auth Service → Projects Service (permisos OK)
6. Projects Service → Base de Datos (ejecutar acción)
7. Projects Service → Cliente (respuesta)
```

## Modelos de Datos

### Project
```typescript
{
  id: string
  name: string
  description?: string
  status: ProjectStatus (DRAFT|ACTIVE|ON_HOLD|COMPLETED|CANCELLED)
  customerId: string
  createdById: string
  startDate?: Date
  endDate?: Date
  budget?: Decimal
}
```

### ProjectAssignment
```typescript
{
  id: string
  projectId: string
  userId: string
  role?: string (ej: "Arquitecto Principal")
}
```

### Task
```typescript
{
  id: string
  title: string
  description?: string
  status: TaskStatus (TODO|IN_PROGRESS|IN_REVIEW|COMPLETED|CANCELLED)
  priority: TaskPriority (LOW|MEDIUM|HIGH|URGENT)
  projectId: string
  assignedToId?: string
  createdById: string
  dueDate?: Date
  startDate?: Date
  endDate?: Date
}
```

### Discussion
```typescript
{
  id: string
  message: string
  projectId?: string
  taskId?: string
  userId: string
  parentId?: string (para hilos de conversación)
}
```

## Casos de Uso

### 1. Staff crea un proyecto para un cliente
```bash
POST /api/projects
{
  "name": "Construcción Edificio Centro",
  "customerId": "uuid-del-cliente",
  "budget": 500000
}
```

### 2. Staff asigna contractors al proyecto
```bash
POST /api/projects/:projectId/assignments
{
  "userId": "uuid-arquitecto",
  "role": "Arquitecto Principal"
}
```

### 3. Staff crea tareas y las asigna
```bash
POST /api/projects/tasks
{
  "title": "Diseño arquitectónico",
  "projectId": "uuid-del-proyecto",
  "assignedToId": "uuid-arquitecto",
  "priority": "HIGH",
  "dueDate": "2024-03-31"
}
```

### 4. Cliente consulta su proyecto
```bash
GET /api/projects/:id
# Ve proyecto completo con tasks, files, discussions
```

### 5. Contractor actualiza estado de tarea asignada
```bash
PUT /api/projects/tasks/:id
{
  "status": "IN_PROGRESS"
}
```

### 6. Cliente crea discusión en el proyecto
```bash
POST /api/projects/discussions
{
  "message": "¿Cuándo empezamos con la cimentación?",
  "projectId": "uuid-del-proyecto"
}
```

### 7. Staff responde a la discusión
```bash
POST /api/projects/discussions
{
  "message": "Estimamos comenzar en 2 semanas",
  "projectId": "uuid-del-proyecto",
  "parentId": "uuid-del-mensaje-del-cliente"
}
```

## Health Checks

### `/health`
Verifica que el servicio está funcionando.

### `/ready`
Verifica que el servicio está listo (incluye conexión a BD y Auth Service).

## Errores Comunes

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | Token no proporcionado | Falta header Authorization |
| 401 | Token inválido o expirado | Token JWT inválido |
| 403 | No tienes permisos | Usuario sin permisos para la acción |
| 404 | Proyecto no encontrado | ID de proyecto inválido |
| 404 | Tarea no encontrada | ID de tarea inválido |
| 400 | Cliente no encontrado | customerId inválido |
| 400 | El usuario debe ser un cliente | Se intentó asignar rol incorrecto |
| 400 | El contractor ya está asignado | Asignación duplicada |
