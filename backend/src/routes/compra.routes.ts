import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/compra.queries.js';

const router = express.Router();

// JOIN #3: compra + proveedor
router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener compras' });
	}
});

// JOIN #3 detalle: compra + proveedor + detalle_compra + producto
router.get('/:id/detalle', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_DETALLE, [req.params['id']]);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener detalle de compra' });
	}
});

export default router;
