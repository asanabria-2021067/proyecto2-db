import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import prisma from '../config/prisma.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/producto.queries.js';

const router = express.Router();

// GET all - Prisma CRUD (Req 10 pts)
router.get('/', async (req: Request, res: Response) => {
	try {
		const { search, categoria_id } = req.query;
		const where: any = {};

		if (search && typeof search === 'string') {
			where.OR = [
				{ titulo: { contains: search, mode: 'insensitive' } },
				{ descripcion: { contains: search, mode: 'insensitive' } },
			];
		}

		if (categoria_id && typeof categoria_id === 'string') {
			where.categoria_id = parseInt(categoria_id);
		}

		const productos = await prisma.producto.findMany({
			where,
			include: {
				categoria: true,
				editorial: true,
				producto_autor: {
					include: {
						autor: true,
					},
				},
			},
			orderBy: { created_at: 'desc' },
		});

		res.json(productos);
	} catch {
		res.status(500).json({ error: 'Error al obtener productos' });
	}
});

// GET by id - Prisma CRUD
router.get('/:id', async (req: Request, res: Response) => {
	try {
		const producto = await prisma.producto.findUnique({
			where: { id_producto: parseInt(req.params['id'] ?? '0') },
			include: {
				categoria: true,
				editorial: true,
				producto_autor: {
					include: {
						autor: true,
					},
				},
			},
		});

		if (!producto) {
			res.status(404).json({ error: 'Producto no encontrado' });
			return;
		}

		res.json(producto);
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

// SP invocation (Req 15 pts)
router.post('/:id/stock', authMiddleware, roleGuard('admin', 'bodeguero'), async (req: Request, res: Response) => {
	const client = await pool.connect();
	try {
		const { cantidad, operacion } = req.body;

		if (!cantidad || !operacion) {
			res.status(400).json({ error: 'Cantidad y operacion son requeridos' });
			return;
		}

		const result = await client.query(
			'CALL sp_actualizar_stock($1, $2, $3, $4)',
			[parseInt(req.params['id'] ?? '0'), cantidad, operacion.toUpperCase(), '']
		);

		res.json({ message: result.rows[0].p_resultado });
	} catch (err: any) {
		res.status(400).json({ error: err.message || 'Error al actualizar stock con SP' });
	} finally {
		client.release();
	}
});

export default router;
