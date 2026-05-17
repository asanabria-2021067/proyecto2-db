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

// POST - Registrar compra a proveedor con transaccion
router.post('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	const client = await pool.connect();
	try {
		const { proveedor_id, items } = req.body;
		if (!proveedor_id) { res.status(400).json({ error: 'Proveedor es requerido' }); return; }
		if (!items || !Array.isArray(items) || items.length === 0) { res.status(400).json({ error: 'Debe incluir al menos un producto' }); return; }

		await client.query('BEGIN');
		let total = 0;
		for (const item of items) { total += item.cantidad * item.precio_unitario; }

		const compraResult = await client.query(Q.INSERT_COMPRA, [proveedor_id, total]);
		const compraId = compraResult.rows[0].id_compra;

		for (const item of items) {
			await client.query(Q.INSERT_DETALLE_COMPRA, [compraId, item.producto_id, item.cantidad, item.precio_unitario]);
			await client.query(Q.UPDATE_STOCK_ADD, [item.cantidad, item.producto_id]);
		}

		await client.query('COMMIT');
		res.status(201).json({ id_compra: compraId, total });
	} catch (err: any) {
		await client.query('ROLLBACK');
		res.status(500).json({ error: 'Error al registrar compra' });
	} finally {
		client.release();
	}
});

export default router;
