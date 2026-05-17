import express from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// Prisma CRUD (Req 10 pts)
router.get('/', async (_req: Request, res: Response) => {
	try {
		const categorias = await prisma.categoria.findMany({
			orderBy: { nombre: 'asc' },
		});
		res.json(categorias);
	} catch {
		res.status(500).json({ error: 'Error al obtener categorias' });
	}
});

router.post('/', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, tipo, descripcion } = req.body;
		const categoria = await prisma.categoria.create({
			data: { nombre, tipo, descripcion },
		});
		res.status(201).json(categoria);
	} catch {
		res.status(500).json({ error: 'Error al crear categoria' });
	}
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { nombre, tipo, descripcion } = req.body;
		const categoria = await prisma.categoria.update({
			where: { id_categoria: parseInt((req.params.id as string) ?? '0') },
			data: { nombre, tipo, descripcion },
		});
		res.json(categoria);
	} catch (err: any) {
		if (err.code === 'P2025') {
			res.status(404).json({ error: 'Categoria no encontrada' });
			return;
		}
		res.status(500).json({ error: 'Error al actualizar categoria' });
	}
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		await prisma.categoria.delete({
			where: { id_categoria: parseInt((req.params.id as string) ?? '0') },
		});
		res.json({ message: 'Categoria eliminada' });
	} catch (err: any) {
		if (err.code === 'P2025') {
			res.status(404).json({ error: 'Categoria no encontrada' });
			return;
		}
		res.status(500).json({ error: 'Error al eliminar categoria' });
	}
});

export default router;
