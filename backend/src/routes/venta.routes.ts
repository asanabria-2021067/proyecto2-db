import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/venta.queries.js';

const router = express.Router();

router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener ventas' });
	}
});

// GET detalle de una venta (admin/vendedor)
router.get('/detalle/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const detalle = await pool.query(Q.GET_DETALLE, [req.params['id']]);
		res.json(detalle.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener detalle' });
	}
});

// GET mis compras (cliente)
router.get('/mis-compras', authMiddleware, roleGuard('cliente'), async (req: Request, res: Response) => {
	try {
		const clienteResult = await pool.query(Q.GET_CLIENTE_BY_USUARIO, [req.user!.id_usuario]);
		if (clienteResult.rows.length === 0) {
			res.json([]);
			return;
		}
		const clienteId = clienteResult.rows[0].id_cliente;
		const result = await pool.query(Q.GET_MIS_COMPRAS, [clienteId]);

		// Traer detalle de cada compra
		const compras = [];
		for (const venta of result.rows) {
			const detalle = await pool.query(Q.GET_MIS_COMPRAS_DETALLE, [venta.id_venta]);
			compras.push({ ...venta, detalle: detalle.rows });
		}
		res.json(compras);
	} catch {
		res.status(500).json({ error: 'Error al obtener compras' });
	}
});

router.get('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const venta = await pool.query(Q.GET_BY_ID, [req.params['id']]);
		if (venta.rows.length === 0) {
			res.status(404).json({ error: 'Venta no encontrada' });
			return;
		}
		const detalle = await pool.query(Q.GET_DETALLE, [req.params['id']]);
		res.json({ ...venta.rows[0], detalle: detalle.rows });
	} catch {
		res.status(500).json({ error: 'Error al obtener venta' });
	}
});

// POST - Transaccion explicita (12 pts)
router.post('/', authMiddleware, roleGuard('admin', 'vendedor', 'cliente'), async (req: Request, res: Response) => {
	const client = await pool.connect();
	try {
		let { cliente_id, empleado_id, items } = req.body;

		// Auto-resolver cliente_id para rol cliente
		if (req.user!.rol === 'cliente') {
			const clienteResult = await client.query(Q.GET_CLIENTE_BY_USUARIO, [req.user!.id_usuario]);
			if (clienteResult.rows.length === 0) {
				res.status(400).json({ error: 'No se encontro perfil de cliente' });
				return;
			}
			cliente_id = clienteResult.rows[0].id_cliente;
			empleado_id = null;
		}

		if (!cliente_id) {
			res.status(400).json({ error: 'Cliente es requerido' });
			return;
		}

		if (!items || !Array.isArray(items) || items.length === 0) {
			res.status(400).json({ error: 'Debe incluir al menos un producto' });
			return;
		}

		await client.query('BEGIN');

		// Calcular total
		let total = 0;
		for (const item of items) {
			total += item.cantidad * item.precio_unitario;
		}

		// Insertar venta
		const ventaResult = await client.query(Q.INSERT_VENTA, [
			cliente_id,
			empleado_id ?? null,
			total,
		]);
		const ventaId = ventaResult.rows[0].id_venta;

		// Insertar detalle y actualizar stock
		for (const item of items) {
			await client.query(Q.INSERT_DETALLE, [
				ventaId,
				item.producto_id,
				item.cantidad,
				item.precio_unitario,
			]);

			const stockResult = await client.query(Q.UPDATE_STOCK, [
				item.cantidad,
				item.producto_id,
			]);

			if (stockResult.rows[0].stock < 0) {
				throw new Error(`Stock insuficiente para producto ${item.producto_id}`);
			}
		}

		await client.query('COMMIT');
		res.status(201).json({ id_venta: ventaId, total });
	} catch (err: any) {
		await client.query('ROLLBACK');
		if (err.message?.startsWith('Stock insuficiente')) {
			res.status(400).json({ error: err.message });
		} else if (err.message?.startsWith('No se encontro')) {
			res.status(400).json({ error: err.message });
		} else {
			res.status(500).json({ error: 'Error al registrar venta' });
		}
	} finally {
		client.release();
	}
});

export default router;
