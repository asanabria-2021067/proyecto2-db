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

// SP invocation (Req 15 pts)
router.post('/sp', authMiddleware, roleGuard('admin', 'bodeguero'), async (req: Request, res: Response) => {
	const client = await pool.connect();
	try {
		const { proveedor_id, detalle } = req.body;

		if (!proveedor_id || !detalle || !Array.isArray(detalle) || detalle.length === 0) {
			res.status(400).json({ error: 'Proveedor y detalle son requeridos' });
			return;
		}

		const result = await client.query(
			'CALL sp_registrar_compra_proveedor($1, $2::JSON, $3)',
			[proveedor_id, JSON.stringify(detalle), '']
		);

		res.status(201).json({ message: result.rows[0].p_resultado });
	} catch (err: any) {
		res.status(400).json({ error: err.message || 'Error al registrar compra con SP' });
	} finally {
		client.release();
	}
});

export default router;
