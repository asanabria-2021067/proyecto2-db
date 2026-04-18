import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/editorial.queries.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener editoriales' });
	}
});

router.post('/', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, pais, sitio_web } = req.body;
		const result = await pool.query(Q.INSERT, [nombre, pais, sitio_web]);
		res.status(201).json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al crear editorial' });
	}
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, pais, sitio_web } = req.body;
		const result = await pool.query(Q.UPDATE, [nombre, pais, sitio_web, req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Editorial no encontrada' });
			return;
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al actualizar editorial' });
	}
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.DELETE, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Editorial no encontrada' });
			return;
		}
		res.json({ message: 'Editorial eliminada' });
	} catch {
		res.status(500).json({ error: 'Error al eliminar editorial' });
	}
});

export default router;
