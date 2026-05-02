import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'a58357173f277af9328127d173d9efe57d8c91f0efdcab66b7a4158af776ac61ca985e7b696ed7ab5c9e8b536a3efbd1f0dae3f05078fe8e14c22192ee12d68d';

export interface AuthPayload {
	id_usuario: number;
	username: string;
	rol: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
	}
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
	const header = req.headers['authorization'];
	if (!header) {
		res.status(401).json({ error: 'Token requerido' });
		return;
	}
	const token = header.split(' ')[1];
	if (!token) {
		res.status(401).json({ error: 'Token invalido' });
		return;
	}
	try {
		const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
		req.user = payload;
		next();
	} catch {
		res.status(401).json({ error: 'Token invalido o expirado' });
	}
}

export function roleGuard(...roles: string[]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.rol)) {
			res.status(403).json({ error: 'No autorizado' });
			return;
		}
		next();
	};
}
