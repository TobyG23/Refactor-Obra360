import { Router } from 'express';
import { FilesController } from '../controllers/files.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../utils/storage';

const router = Router();
const filesController = new FilesController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/files/upload
 * @desc    Subir un archivo
 * @access  Private (con permisos FILES.CREATE)
 */
router.post(
  '/upload',
  authorize('FILES', 'CREATE'),
  upload.single('file'),
  (req, res) => filesController.uploadFile(req, res)
);

/**
 * @route   POST /api/files/upload-multiple
 * @desc    Subir múltiples archivos
 * @access  Private (con permisos FILES.CREATE)
 */
router.post(
  '/upload-multiple',
  authorize('FILES', 'CREATE'),
  upload.array('files', 10), // Máximo 10 archivos
  (req, res) => filesController.uploadMultipleFiles(req, res)
);

/**
 * @route   GET /api/files
 * @desc    Obtener todos los archivos (filtrado por rol)
 * @access  Private
 */
router.get('/', (req, res) => filesController.getAllFiles(req, res));

/**
 * @route   GET /api/files/project/:projectId
 * @desc    Obtener archivos de un proyecto
 * @access  Private (con permisos FILES.VIEW)
 */
router.get(
  '/project/:projectId',
  authorize('FILES', 'VIEW'),
  (req, res) => filesController.getFilesByProject(req, res)
);

/**
 * @route   GET /api/files/task/:taskId
 * @desc    Obtener archivos de una tarea
 * @access  Private (con permisos FILES.VIEW)
 */
router.get(
  '/task/:taskId',
  authorize('FILES', 'VIEW'),
  (req, res) => filesController.getFilesByTask(req, res)
);

/**
 * @route   GET /api/files/:id
 * @desc    Obtener información de un archivo
 * @access  Private (con permisos FILES.VIEW)
 */
router.get(
  '/:id',
  authorize('FILES', 'VIEW'),
  (req, res) => filesController.getFileById(req, res)
);

/**
 * @route   GET /api/files/:id/download
 * @desc    Descargar un archivo
 * @access  Private (con permisos FILES.VIEW)
 */
router.get(
  '/:id/download',
  authorize('FILES', 'VIEW'),
  (req, res) => filesController.downloadFile(req, res)
);

/**
 * @route   DELETE /api/files/:id
 * @desc    Eliminar un archivo
 * @access  Private (con permisos FILES.DELETE o solo STAFF)
 */
router.delete(
  '/:id',
  authorize('FILES', 'DELETE'),
  (req, res) => filesController.deleteFile(req, res)
);

export default router;
