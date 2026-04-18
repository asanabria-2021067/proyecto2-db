import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/proveedor.queries.js';

const router = express.Router();

router.get('/', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener proveedores' });
	}
});

router.post('/', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, contacto, telefono, email, direccion } = req.body;
		const result = await pool.query(Q.INSERT, [nombre, contacto, telefono, email, direccion]);
		res.status(201).json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al crear proveedor' });
	}
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, contacto, telefono, email, direccion } = req.body;
		const result = await pool.query(Q.UPDATE, [nombre, contacto, telefono, email, direccion, req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Proveedor no encontrado' });
			return;
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al actualizar proveedor' });
	}
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.DELETE, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Proveedor no encontrado' });
			return;
		}
		res.json({ message: 'Proveedor eliminado' });
	} catch {
		res.status(500).json({ error: 'Error al eliminar proveedor' });
	}
});

export default router;
