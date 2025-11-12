# 🎯 Backend API - Documentación Completa

Documentación de todos los endpoints del backend de Obra360.

**Base URL (via API Gateway)**: `http://localhost:3000`

---

## 🔐 Auth Service

### POST `/api/auth/register`
Registrar nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "role": "CUSTOMER",
  "phone": "+34 600 000 000"
}
```

### POST `/api/auth/login`
Iniciar sesión.

**Body:**
```json
{
  "email": "admin@obra360.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
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

### POST `/api/auth/refresh`
Renovar access token.

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### POST `/api/auth/logout`
Cerrar sesión (invalida refresh token).

### GET `/api/auth/profile` 🔒
Obtener perfil del usuario autenticado.

**Headers:** `Authorization: Bearer TOKEN`

### GET `/api/auth/check-permission` 🔒
Verificar permisos del usuario.

**Query params:**
- `resource`: PROJECTS | TASKS | FILES | DISCUSSIONS | INVOICES | PROPOSALS | ANALYTICS | USERS
- `action`: VIEW | CREATE | EDIT | DELETE
- `resourceId` (opcional)

---

## 📁 Projects Service

### GET `/api/projects` 🔒
Obtener todos los proyectos (filtrado por rol).

### GET `/api/projects/:id` 🔒
Obtener proyecto por ID.

### POST `/api/projects` 🔒
Crear nuevo proyecto (solo STAFF).

**Body:**
```json
{
  "name": "Construcción Edificio",
  "description": "Descripción del proyecto",
  "customerId": "uuid-del-cliente",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 500000
}
```

### PUT `/api/projects/:id` 🔒
Actualizar proyecto (solo STAFF).

### DELETE `/api/projects/:id` 🔒
Eliminar proyecto (solo STAFF).

### POST `/api/projects/:projectId/assignments` 🔒
Asignar contractor a proyecto (solo STAFF).

**Body:**
```json
{
  "userId": "uuid-del-contractor",
  "role": "Arquitecto Principal"
}
```

### DELETE `/api/projects/:projectId/assignments/:userId` 🔒
Remover contractor de proyecto (solo STAFF).

---

## ✅ Tasks

### GET `/api/projects/:projectId/tasks` 🔒
Obtener tareas de un proyecto.

### GET `/api/projects/tasks/:id` 🔒
Obtener tarea por ID.

### POST `/api/projects/tasks` 🔒
Crear nueva tarea.

**Body:**
```json
{
  "title": "Diseño arquitectónico",
  "description": "Elaborar planos",
  "projectId": "uuid",
  "assignedToId": "uuid",
  "priority": "HIGH",
  "dueDate": "2024-03-31"
}
```

**Prioridades:** `LOW` | `MEDIUM` | `HIGH` | `URGENT`
**Estados:** `TODO` | `IN_PROGRESS` | `IN_REVIEW` | `COMPLETED` | `CANCELLED`

### PUT `/api/projects/tasks/:id` 🔒
Actualizar tarea.

### DELETE `/api/projects/tasks/:id` 🔒
Eliminar tarea (solo STAFF).

---

## 💬 Discussions

### GET `/api/projects/:projectId/discussions` 🔒
Obtener discusiones de un proyecto.

### GET `/api/projects/tasks/:taskId/discussions` 🔒
Obtener discusiones de una tarea.

### POST `/api/projects/discussions` 🔒
Crear nueva discusión o respuesta.

**Body (mensaje principal):**
```json
{
  "message": "¿Cuándo empezamos?",
  "projectId": "uuid"
}
```

**Body (respuesta):**
```json
{
  "message": "En 2 semanas",
  "projectId": "uuid",
  "parentId": "uuid-mensaje-padre"
}
```

### DELETE `/api/projects/discussions/:id` 🔒
Eliminar discusión.

---

## 📂 Files Service

### POST `/api/files/upload` 🔒
Subir un archivo.

**Form Data:**
- `file`: Archivo a subir
- `projectId` o `taskId`: Asociación (required)

**Tipos permitidos:**
- Imágenes: JPEG, PNG, GIF, WebP
- Documentos: PDF, Word, Excel, CSV
- Comprimidos: ZIP

**Límite:** 50MB por archivo

### POST `/api/files/upload-multiple` 🔒
Subir múltiples archivos (máximo 10).

**Form Data:**
- `files[]`: Array de archivos
- `projectId` o `taskId`

### GET `/api/files` 🔒
Obtener todos los archivos (filtrado por rol).

### GET `/api/files/project/:projectId` 🔒
Obtener archivos de un proyecto.

### GET `/api/files/task/:taskId` 🔒
Obtener archivos de una tarea.

### GET `/api/files/:id` 🔒
Obtener información de un archivo.

### GET `/api/files/:id/download` 🔒
Descargar un archivo.

### DELETE `/api/files/:id` 🔒
Eliminar un archivo (solo STAFF).

---

## 💰 Billing Service

### GET `/api/billing/invoices` 🔒
Obtener invoices (STAFF ve todos, CUSTOMER solo los suyos).

### GET `/api/billing/invoices/:id` 🔒
Obtener invoice por ID.

### POST `/api/billing/invoices` 🔒
Crear invoice (solo STAFF).

**Body:**
```json
{
  "projectId": "uuid",
  "customerId": "uuid",
  "subtotal": 100000,
  "tax": 21000,
  "total": 121000,
  "dueDate": "2024-02-15",
  "notes": "Pago primer trimestre",
  "items": [
    {
      "description": "Diseño arquitectónico",
      "quantity": 1,
      "unitPrice": 60000,
      "total": 60000
    }
  ]
}
```

**Estados:** `DRAFT` | `SENT` | `PAID` | `OVERDUE` | `CANCELLED`

### PUT `/api/billing/invoices/:id` 🔒
Actualizar invoice (solo STAFF).

**Body:**
```json
{
  "status": "PAID"
}
```

### DELETE `/api/billing/invoices/:id` 🔒
Eliminar invoice (solo STAFF).

### GET `/api/billing/proposals` 🔒
Obtener proposals.

### GET `/api/billing/proposals/:id` 🔒
Obtener proposal por ID.

### POST `/api/billing/proposals` 🔒
Crear proposal (solo STAFF).

**Body:**
```json
{
  "projectId": "uuid",
  "customerId": "uuid",
  "title": "Propuesta Construcción",
  "content": "<h2>Propuesta...</h2>",
  "total": 500000,
  "validUntil": "2024-12-31"
}
```

**Estados:** `DRAFT` | `SENT` | `ACCEPTED` | `REJECTED` | `EXPIRED`

### PUT `/api/billing/proposals/:id` 🔒
Actualizar proposal (solo STAFF).

### DELETE `/api/billing/proposals/:id` 🔒
Eliminar proposal (solo STAFF).

---

## 🔔 Notifications Service

### GET `/api/notifications` 🔒
Obtener notificaciones.

**Query params:**
- `userId`: Filtrar por usuario

### POST `/api/notifications` 🔒
Crear notificación.

**Body:**
```json
{
  "userId": "uuid",
  "type": "IN_APP",
  "priority": "NORMAL",
  "title": "Nueva tarea asignada",
  "message": "Se te ha asignado la tarea 'Diseño'",
  "metadata": { "taskId": "uuid" }
}
```

**Tipos:** `EMAIL` | `IN_APP` | `PUSH`
**Prioridades:** `LOW` | `NORMAL` | `HIGH`

### PUT `/api/notifications/:id/read` 🔒
Marcar notificación como leída.

### PUT `/api/notifications/read-all` 🔒
Marcar todas como leídas.

**Body:**
```json
{
  "userId": "uuid"
}
```

---

## 📊 Analytics Service

### GET `/api/analytics/dashboard` 🔒
Obtener KPIs del dashboard (solo STAFF).

**Response:**
```json
{
  "success": true,
  "data": {
    "totals": {
      "projects": 10,
      "tasks": 50,
      "files": 25,
      "users": 15
    },
    "projectsByStatus": [
      { "status": "ACTIVE", "_count": 5 },
      { "status": "COMPLETED", "_count": 3 }
    ],
    "tasksByStatus": [
      { "status": "TODO", "_count": 10 },
      { "status": "IN_PROGRESS", "_count": 15 }
    ]
  }
}
```

### GET `/api/analytics/projects/:id` 🔒
Analytics de un proyecto específico (solo STAFF).

### GET `/api/analytics/activity` 🔒
Obtener activity logs (solo STAFF).

---

## 🔒 Autenticación

Todos los endpoints marcados con 🔒 requieren autenticación.

**Header requerido:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## ⚠️ Errores Comunes

| Código | Mensaje | Solución |
|--------|---------|----------|
| 401 | Token no proporcionado | Agregar header Authorization |
| 401 | Token inválido o expirado | Renovar token con /api/auth/refresh |
| 403 | No tienes permisos | Tu rol no tiene acceso a este recurso |
| 404 | No encontrado | Verificar que el ID existe |
| 400 | Validación fallida | Revisar los campos requeridos |
| 500 | Error interno | Contactar soporte |

## 🚀 Rate Limiting

El API Gateway limita las peticiones:
- **100 requests** por **15 minutos** por IP

Si excedes el límite:
```json
{
  "success": false,
  "message": "Demasiadas solicitudes, intenta más tarde"
}
```

## 📝 Ejemplo Completo con cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@obra360.com", "password": "Password123!"}' \
  | jq -r '.data.accessToken')

# 2. Crear proyecto
PROJECT_ID=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Proyecto",
    "customerId": "CUSTOMER_ID",
    "budget": 100000
  }' | jq -r '.data.id')

# 3. Crear tarea
curl -X POST http://localhost:3000/api/projects/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Nueva tarea\",
    \"projectId\": \"$PROJECT_ID\",
    \"priority\": \"HIGH\"
  }"

# 4. Subir archivo
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "projectId=$PROJECT_ID"

# 5. Ver analytics
curl http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```
