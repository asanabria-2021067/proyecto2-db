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

// SP invocation (Req 15 pts)
router.post('/sp', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	const client = await pool.connect();
	try {
		const { nombre, email, telefono, direccion, usuario_id } = req.body;

		if (!nombre) {
			res.status(400).json({ error: 'Nombre es requerido' });
			return;
		}

		const result = await client.query(
			'CALL sp_crear_cliente($1, $2, $3, $4, $5, $6)',
			[nombre, email ?? null, telefono ?? null, direccion ?? null, usuario_id ?? null, '']
		);

		res.status(201).json({ message: result.rows[0].p_resultado });
	} catch (err: any) {
		res.status(400).json({ error: err.message || 'Error al crear cliente con SP' });
	} finally {
		client.release();
	}
});

export default router;
