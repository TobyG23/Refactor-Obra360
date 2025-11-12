import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/auth';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en autenticación' });
  }
};

export const authorizeStaff = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'STAFF') {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  next();
};
