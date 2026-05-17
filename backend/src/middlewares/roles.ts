import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export const requireRole = (rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ error: 'No tiene permisos suficientes para esta acción' });
      return;
    }

    next();
  };
};
