import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/categoria.queries.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener categorias' });
	}
});

router.post('/', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, tipo, descripcion } = req.body;
		const result = await pool.query(Q.INSERT, [nombre, tipo, descripcion]);
		res.status(201).json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al crear categoria' });
	}
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, tipo, descripcion } = req.body;
		const result = await pool.query(Q.UPDATE, [nombre, tipo, descripcion, req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Categoria no encontrada' });
			return;
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al actualizar categoria' });
	}
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.DELETE, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Categoria no encontrada' });
			return;
		}
		res.json({ message: 'Categoria eliminada' });
	} catch {
		res.status(500).json({ error: 'Error al eliminar categoria' });
	}
});

export default router;
