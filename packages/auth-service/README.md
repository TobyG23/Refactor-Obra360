# Auth Service - Obra360

Microservicio de autenticación y autorización para Obra360.

## Características

- ✅ Registro de usuarios
- ✅ Login con JWT
- ✅ Refresh tokens con rotación
- ✅ Verificación de permisos granulares
- ✅ Logout seguro
- ✅ Health checks y ready checks
- ✅ Validación de contraseñas fuertes
- ✅ Rate limiting (via API Gateway)

## Endpoints

### Públicos

#### POST `/api/auth/register`
Registrar nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123!",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "role": "CUSTOMER",
  "phone": "+34 600 000 000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "firstName": "Nombre",
      "lastName": "Apellido",
      "role": "CUSTOMER"
    }
  }
}
```

#### POST `/api/auth/login`
Iniciar sesión.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

#### POST `/api/auth/refresh`
Renovar access token usando refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/api/auth/logout`
Cerrar sesión (invalida refresh token).

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Privados (requieren Authentication)

#### GET `/api/auth/profile`
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### GET `/api/auth/check-permission`
Verificar si el usuario tiene un permiso específico.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query params:**
- `resource`: PROJECTS | TASKS | FILES | DISCUSSIONS | INVOICES | PROPOSALS | ANALYTICS | USERS
- `action`: VIEW | CREATE | EDIT | DELETE
- `resourceId` (opcional): ID del recurso específico

**Response:**
```json
{
  "success": true,
  "data": {
    "hasPermission": true
  }
}
```

## Sistema de Permisos

### Roles Base

| Rol | Descripción |
|-----|-------------|
| STAFF | Acceso completo a todos los recursos |
| CUSTOMER | Acceso a sus proyectos, tasks, files, discussions |
| CONTRACTOR | Acceso configurable a proyectos asignados |

### Permisos Personalizados

Los administradores pueden configurar permisos granulares por usuario en la tabla `user_permissions`:

- `resource`: Qué recurso (PROJECTS, TASKS, etc.)
- `action`: Qué acción (VIEW, CREATE, EDIT, DELETE)
- `allowed`: true/false
- `resourceId`: (opcional) ID del recurso específico

## Variables de Entorno

```env
PORT=3001
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
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

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Tokens JWT firmados y verificables
- ✅ Refresh tokens almacenados en BD con expiración
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de fortaleza de contraseña
- ✅ Rate limiting (via API Gateway)

## Requisitos de Contraseña

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial (@$!%*?&)
