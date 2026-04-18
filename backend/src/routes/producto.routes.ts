import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/producto.queries.js';

const router = express.Router();

// GET all - uses VIEW vista_producto_completo
router.get('/', async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_ALL);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener productos' });
	}
});

// GET by id
router.get('/:id', async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.GET_BY_ID, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Producto no encontrado' });
			return;
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al obtener producto' });
	}
});

// POST - create
router.post('/', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const { titulo, descripcion, precio, stock, isbn, anio_publicacion, imagen_url, categoria_id, editorial_id, autores } = req.body;
		const result = await pool.query(Q.INSERT, [titulo, descripcion, precio, stock, isbn, anio_publicacion, imagen_url, categoria_id, editorial_id]);
		const producto = result.rows[0];
		if (autores && Array.isArray(autores)) {
			for (const autorId of autores) {
				await pool.query(Q.SET_AUTHORS, [producto.id_producto, autorId]);
			}
		}
		res.status(201).json(producto);
	} catch (err: any) {
		if (err.code === '23505') {
			res.status(409).json({ error: 'El ISBN ya existe' });
			return;
		}
		res.status(500).json({ error: 'Error al crear producto' });
	}
});

// PUT - update
router.put('/:id', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const { titulo, descripcion, precio, stock, isbn, anio_publicacion, imagen_url, categoria_id, editorial_id, autores } = req.body;
		const result = await pool.query(Q.UPDATE, [titulo, descripcion, precio, stock, isbn, anio_publicacion, imagen_url, categoria_id, editorial_id, req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Producto no encontrado' });
			return;
		}
		if (autores && Array.isArray(autores)) {
			await pool.query(Q.DELETE_AUTHORS, [req.params['id']]);
			for (const autorId of autores) {
				await pool.query(Q.SET_AUTHORS, [req.params['id'], autorId]);
			}
		}
		res.json(result.rows[0]);
	} catch {
		res.status(500).json({ error: 'Error al actualizar producto' });
	}
});

// DELETE
router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.DELETE, [req.params['id']]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Producto no encontrado' });
			return;
		}
		res.json({ message: 'Producto eliminado' });
	} catch {
		res.status(500).json({ error: 'Error al eliminar producto' });
	}
});

export default router;
