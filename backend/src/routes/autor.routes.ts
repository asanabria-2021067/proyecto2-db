import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/autor.queries.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener autores' });
	}
});

router.post('/', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, nacionalidad, fecha_nacimiento } = req.body;
		const result = await pool.query(Q.INSERT, [nombre, nacionalidad, fecha_nacimiento]);
		res.status(201).json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al crear autor' });
	}
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, nacionalidad, fecha_nacimiento } = req.body;
		const result = await pool.query(Q.UPDATE, [nombre, nacionalidad, fecha_nacimiento, req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Autor no encontrado' });
			return;
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al actualizar autor' });
	}
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.DELETE, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Autor no encontrado' });
			return;
		}
		res.json({ message: 'Autor eliminado' });
	} catch {
		res.status(500).json({ error: 'Error al eliminar autor' });
	}
});

export default router;
