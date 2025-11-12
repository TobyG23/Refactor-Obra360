# Files Service - Obra360

Microservicio de gestión de archivos con upload/download, almacenamiento local y validación de tipos.

## Características

- ✅ Upload de archivos con Multer
- ✅ Upload múltiple (hasta 10 archivos)
- ✅ Download de archivos
- ✅ Validación de tipos MIME
- ✅ Límite de tamaño configurable (default: 50MB)
- ✅ Almacenamiento local (escalable a S3)
- ✅ Asociación con proyectos y tareas
- ✅ Filtrado por rol de usuario
- ✅ Health checks

## Endpoints

### POST `/api/files/upload`
Subir un archivo.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): El archivo a subir
- `projectId` (optional): ID del proyecto
- `taskId` (optional): ID de la tarea

**Nota**: Se requiere `projectId` o `taskId`.

**Response:**
```json
{
  "success": true,
  "message": "Archivo subido exitosamente",
  "data": {
    "id": "uuid",
    "filename": "abc123.pdf",
    "originalName": "documento.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "sizeFormatted": "1000 KB",
    "uploadedBy": {...},
    "project": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/api/files/upload-multiple`
Subir múltiples archivos (máximo 10).

**Form Data:**
- `files[]` (required): Array de archivos
- `projectId` o `taskId` (required)

### GET `/api/files`
Obtener todos los archivos (filtrado por rol).

### GET `/api/files/project/:projectId`
Obtener archivos de un proyecto.

### GET `/api/files/task/:taskId`
Obtener archivos de una tarea.

### GET `/api/files/:id`
Obtener información de un archivo.

### GET `/api/files/:id/download`
Descargar un archivo.

### DELETE `/api/files/:id`
Eliminar un archivo (solo STAFF).

## Configuración

### Variables de Entorno
```env
PORT=3003
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
AUTH_SERVICE_URL="http://localhost:3001"
NODE_ENV="development"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/zip"
```

### Tipos de Archivo Permitidos (default)
- Imágenes: JPEG, PNG, GIF, WebP
- Documentos: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), CSV
- Comprimidos: ZIP

### Límites
- Tamaño máximo por archivo: 50MB (configurable)
- Archivos múltiples: 10 archivos máximo por request

## Filtrado por Rol

| Rol | Permisos |
|-----|----------|
| **STAFF** | Ve y gestiona todos los archivos |
| **CUSTOMER** | Ve archivos de sus proyectos |
| **CONTRACTOR** | Ve archivos de proyectos asignados |

## Almacenamiento

### Estructura de Directorios
```
uploads/
├── abc123.pdf
├── def456.jpg
└── ghi789.docx
```

Los archivos se almacenan con nombres UUID para evitar colisiones.

### Escalabilidad a S3
El servicio está diseñado para migrar fácilmente a AWS S3:
1. Cambiar `storage` de Multer a `multer-s3`
2. Configurar credenciales de AWS
3. Actualizar `FilesService.getFilePath()` para URLs de S3

## Desarrollo

```bash
npm install
npm run dev
```

## Seguridad

- ✅ Validación de tipos MIME
- ✅ Límite de tamaño de archivo
- ✅ Nombres aleatorios (UUID) para evitar path traversal
- ✅ Verificación de permisos antes de upload/download
- ✅ Eliminación segura de archivos físicos y BD

## Ejemplos de Uso

### Upload con cURL
```bash
curl -X POST http://localhost:3003/api/files/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "projectId=uuid-del-proyecto"
```

### Upload con JavaScript (Fetch)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('projectId', projectId);

const response = await fetch('http://localhost:3003/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Download
```javascript
const response = await fetch(
  `http://localhost:3003/api/files/${fileId}/download`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
```
