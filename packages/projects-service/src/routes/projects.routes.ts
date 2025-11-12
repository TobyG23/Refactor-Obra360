import { Router } from 'express';
import { ProjectsController } from '../controllers/projects.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const projectsController = new ProjectsController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// ============================================================================
// PROJECTS ROUTES
// ============================================================================

/**
 * @route   GET /api/projects
 * @desc    Obtener todos los proyectos (filtrado por rol)
 * @access  Private
 */
router.get('/', (req, res) => projectsController.getAllProjects(req, res));

/**
 * @route   GET /api/projects/:id
 * @desc    Obtener proyecto por ID
 * @access  Private (con verificación de permisos)
 */
router.get(
  '/:id',
  authorize('PROJECTS', 'VIEW'),
  (req, res) => projectsController.getProjectById(req, res)
);

/**
 * @route   POST /api/projects
 * @desc    Crear nuevo proyecto
 * @access  Private (solo STAFF)
 */
router.post(
  '/',
  authorize('PROJECTS', 'CREATE'),
  (req, res) => projectsController.createProject(req, res)
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Actualizar proyecto
 * @access  Private (solo STAFF)
 */
router.put(
  '/:id',
  authorize('PROJECTS', 'EDIT'),
  (req, res) => projectsController.updateProject(req, res)
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Eliminar proyecto
 * @access  Private (solo STAFF)
 */
router.delete(
  '/:id',
  authorize('PROJECTS', 'DELETE'),
  (req, res) => projectsController.deleteProject(req, res)
);

// ============================================================================
// PROJECT ASSIGNMENTS ROUTES
// ============================================================================

/**
 * @route   POST /api/projects/:projectId/assignments
 * @desc    Asignar contractor a proyecto
 * @access  Private (solo STAFF)
 */
router.post(
  '/:projectId/assignments',
  authorize('PROJECTS', 'EDIT'),
  (req, res) => projectsController.assignContractor(req, res)
);

/**
 * @route   DELETE /api/projects/:projectId/assignments/:userId
 * @desc    Remover contractor de proyecto
 * @access  Private (solo STAFF)
 */
router.delete(
  '/:projectId/assignments/:userId',
  authorize('PROJECTS', 'EDIT'),
  (req, res) => projectsController.removeContractor(req, res)
);

// ============================================================================
// TASKS ROUTES
// ============================================================================

/**
 * @route   GET /api/projects/:projectId/tasks
 * @desc    Obtener todas las tareas de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId/tasks',
  authorize('TASKS', 'VIEW'),
  (req, res) => projectsController.getTasksByProject(req, res)
);

/**
 * @route   POST /api/projects/tasks
 * @desc    Crear nueva tarea
 * @access  Private (STAFF puede crear, CONTRACTOR según permisos)
 */
router.post(
  '/tasks',
  authorize('TASKS', 'CREATE'),
  (req, res) => projectsController.createTask(req, res)
);

/**
 * @route   GET /api/projects/tasks/:id
 * @desc    Obtener tarea por ID
 * @access  Private
 */
router.get(
  '/tasks/:id',
  authorize('TASKS', 'VIEW'),
  (req, res) => projectsController.getTaskById(req, res)
);

/**
 * @route   PUT /api/projects/tasks/:id
 * @desc    Actualizar tarea
 * @access  Private (STAFF o asignado puede editar)
 */
router.put(
  '/tasks/:id',
  authorize('TASKS', 'EDIT'),
  (req, res) => projectsController.updateTask(req, res)
);

/**
 * @route   DELETE /api/projects/tasks/:id
 * @desc    Eliminar tarea
 * @access  Private (solo STAFF)
 */
router.delete(
  '/tasks/:id',
  authorize('TASKS', 'DELETE'),
  (req, res) => projectsController.deleteTask(req, res)
);

// ============================================================================
// DISCUSSIONS ROUTES
// ============================================================================

/**
 * @route   GET /api/projects/:projectId/discussions
 * @desc    Obtener discusiones de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId/discussions',
  authorize('DISCUSSIONS', 'VIEW'),
  (req, res) => projectsController.getDiscussionsByProject(req, res)
);

/**
 * @route   GET /api/projects/tasks/:taskId/discussions
 * @desc    Obtener discusiones de una tarea
 * @access  Private
 */
router.get(
  '/tasks/:taskId/discussions',
  authorize('DISCUSSIONS', 'VIEW'),
  (req, res) => projectsController.getDiscussionsByTask(req, res)
);

/**
 * @route   POST /api/projects/discussions
 * @desc    Crear nueva discusión/comentario
 * @access  Private
 */
router.post(
  '/discussions',
  authorize('DISCUSSIONS', 'CREATE'),
  (req, res) => projectsController.createDiscussion(req, res)
);

/**
 * @route   DELETE /api/projects/discussions/:id
 * @desc    Eliminar discusión
 * @access  Private (solo autor o STAFF)
 */
router.delete(
  '/discussions/:id',
  authorize('DISCUSSIONS', 'DELETE'),
  (req, res) => projectsController.deleteDiscussion(req, res)
);

export default router;
