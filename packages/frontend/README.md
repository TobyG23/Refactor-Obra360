# Frontend - Obra360

Aplicación frontend con Next.js 14, React 18 y Tailwind CSS.

## Características

- ✅ Next.js 14 con App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Autenticación JWT con refresh tokens
- ✅ Context API para estado global
- ✅ API client con interceptors
- ✅ Diseño responsive
- ✅ Dashboard diferenciado por rol

## Estructura

```
src/
├── app/
│   ├── login/         # Página de login
│   ├── dashboard/     # Dashboard principal
│   ├── layout.tsx     # Layout global
│   └── page.tsx       # Home page
├── components/
│   └── ui/            # Componentes reutilizables
├── contexts/
│   └── AuthContext.tsx # Context de autenticación
├── lib/
│   └── api.ts         # Cliente API con axios
└── types/             # Tipos TypeScript

```

## Instalación

```bash
cd packages/frontend
npm install
```

## Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará en http://localhost:3001

## Build de Producción

```bash
npm run build
npm start
```

## Usuarios de Prueba

- **admin@obra360.com** - Password123! (STAFF)
- **cliente1@example.com** - Password123! (CUSTOMER)
- **arquitecto@example.com** - Password123! (CONTRACTOR)

## Roles y Permisos

### STAFF
- Dashboard con KPIs globales
- Gestionar todos los proyectos
- Crear/editar/eliminar recursos
- Ver analytics completos
- Gestionar invoices y proposals

### CUSTOMER
- Dashboard con sus proyectos
- Ver tareas y archivos
- Participar en discussions
- Sin acceso a facturación

### CONTRACTOR
- Dashboard con proyectos asignados
- Ver y editar tareas asignadas
- Upload/download archivos
- Sin acceso a analytics ni facturación

## Componentes Principales

### AuthContext
Gestiona el estado de autenticación global:
- Login/logout
- Usuario actual
- Refresh de tokens automático

### API Client
Cliente axios con:
- Interceptors para tokens
- Refresh automático de tokens
- Manejo de errores

### Dashboard
Dashboard adaptativo según rol con:
- KPIs (solo STAFF)
- Lista de proyectos
- Filtrado por rol
- Acciones según permisos

## Próximas Funcionalidades

- [ ] Gestión completa de proyectos
- [ ] Sistema de archivos con drag & drop
- [ ] Chat en tiempo real
- [ ] Facturación UI
- [ ] Notificaciones en tiempo real
- [ ] Dark mode
- [ ] PWA support
