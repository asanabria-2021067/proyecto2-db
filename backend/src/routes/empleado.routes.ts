import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query('SELECT id_empleado, nombre, cargo FROM empleado ORDER BY nombre');
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener empleados' });
	}
});

export default router;
