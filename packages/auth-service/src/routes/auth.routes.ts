import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token
 * @access  Public
 */
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Public
 */
router.post('/logout', (req, res) => authController.logout(req, res));

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticate, (req, res) =>
  authController.getProfile(req, res)
);

/**
 * @route   GET /api/auth/check-permission
 * @desc    Verificar si el usuario tiene un permiso específico
 * @access  Private
 */
router.get('/check-permission', authenticate, (req, res) =>
  authController.checkPermission(req, res)
);

export default router;
