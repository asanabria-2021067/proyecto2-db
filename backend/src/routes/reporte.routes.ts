import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';
import * as Q from '../queries/reporte.queries.js';

const router = express.Router();

router.get('/top-productos', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.TOP_PRODUCTOS);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener top productos' });
	}
});

router.get('/ventas-por-mes', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.VENTAS_POR_MES);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener ventas por mes' });
	}
});

router.get('/productos-no-vendidos', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.PRODUCTOS_NO_VENDIDOS);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener productos no vendidos' });
	}
});

router.get('/clientes-sobre-promedio', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.CLIENTES_SOBRE_PROMEDIO);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener clientes sobre promedio' });
	}
});

router.get('/categorias-con-productos', authMiddleware, roleGuard('admin', 'vendedor'), async (req: Request, res: Response) => {
	try {
		const min = req.query['min'] ?? 1;
		const result = await pool.query(Q.CATEGORIAS_CON_PRODUCTOS, [min]);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener categorias' });
	}
});

router.get('/ranking-clientes', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.RANKING_CLIENTES);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener ranking de clientes' });
	}
});

router.get('/stock-bajo', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(Q.STOCK_BAJO);
		res.json(result.rows);
	} catch {
		res.status(500).json({ error: 'Error al obtener stock bajo' });
	}
});

export default router;
