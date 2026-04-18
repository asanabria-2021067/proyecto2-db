import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/cliente.queries.js';

const router = express.Router();

router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener clientes' });
	}
});

router.get('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_BY_ID, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Cliente no encontrado' });
			return;
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al obtener cliente' });
	}
});

router.post('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const { nombre, email, telefono, direccion, usuario_id } = req.body;
		const result = await pool.query(Q.INSERT, [nombre, email, telefono, direccion, usuario_id ?? null]);
		res.status(201).json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al crear cliente' });
	}
});

router.put('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const { nombre, email, telefono, direccion } = req.body;
		const result = await pool.query(Q.UPDATE, [nombre, email, telefono, direccion, req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Cliente no encontrado' });
			return;
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al actualizar cliente' });
	}
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.DELETE, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Cliente no encontrado' });
			return;
		}
		res.json({ message: 'Cliente eliminado' });
	} catch {
		res.status(500).json({ error: 'Error al eliminar cliente' });
	}
});

export default router;
