import { Response } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/auth.service';
import { validatePasswordStrength } from '../utils/password';

const authService = new AuthService();

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const { email, password, firstName, lastName, role, phone } = req.body;

      // Validaciones
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos',
        });
      }

      // Validar fortaleza de contraseña
      if (!validatePasswordStrength(password)) {
        return res.status(400).json({
          success: false,
          message:
            'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
        });
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
        phone,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al registrar usuario',
        });
      }
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
        });
      }

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        message: 'Login exitoso',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al iniciar sesión',
        });
      }
    }
  }

  async refreshToken(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token es requerido',
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al renovar token',
        });
      }
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token es requerido',
        });
      }

      await authService.logout(refreshToken);

      res.json({
        success: true,
        message: 'Logout exitoso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión',
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const user = await authService.getProfile(req.user.userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al obtener perfil',
        });
      }
    }
  }

  async checkPermission(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const { resource, action, resourceId } = req.query;

      if (!resource || !action) {
        return res.status(400).json({
          success: false,
          message: 'Resource y action son requeridos',
        });
      }

      const hasPermission = await authService.checkPermission(
        req.user.userId,
        resource as string,
        action as string,
        resourceId as string | undefined
      );

      res.json({
        success: true,
        data: {
          hasPermission,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
      });
    }
  }
}
