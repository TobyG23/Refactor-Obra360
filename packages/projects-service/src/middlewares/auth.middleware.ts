import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken, checkPermission } from '../utils/auth';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(7);

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación',
    });
  }
};

export const authorize = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader!.substring(7);

    // Obtener resourceId del path o body
    const resourceId =
      req.params.id || req.params.projectId || req.body.projectId;

    const hasPermission = await checkPermission(
      token,
      resource,
      action,
      resourceId
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
};
