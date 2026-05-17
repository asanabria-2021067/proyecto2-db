import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// Prisma CRUD (Req 10 pts)
router.get('/', authMiddleware, roleGuard('admin'), async (_req: Request, res: Response) => {
	try {
		const usuarios = await prisma.usuario.findMany({
			select: {
				id_usuario: true,
				username: true,
				rol: true,
				created_at: true,
				cliente: true,
				empleado: true,
			},
			orderBy: { created_at: 'desc' },
		});
		res.json(usuarios);
	} catch {
		res.status(500).json({ error: 'Error al obtener usuarios' });
	}
});

router.get('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const usuario = await prisma.usuario.findUnique({
			where: { id_usuario: parseInt((req.params.id as string) ?? '0') },
			select: {
				id_usuario: true,
				username: true,
				rol: true,
				created_at: true,
				cliente: true,
				empleado: true,
			},
		});

		if (!usuario) {
			res.status(404).json({ error: 'Usuario no encontrado' });
			return;
		}

		res.json(usuario);
	} catch {
		res.status(500).json({ error: 'Error al obtener usuario' });
	}
});

router.post('/', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { username, password, rol } = req.body;

		if (!username || !password || !rol) {
			res.status(400).json({ error: 'Username, password y rol son requeridos' });
			return;
		}

		const hash = await bcrypt.hash(password, 10);

		const usuario = await prisma.usuario.create({
			data: {
				username,
				password_hash: hash,
				rol,
			},
			select: {
				id_usuario: true,
				username: true,
				rol: true,
				created_at: true,
			},
		});

		res.status(201).json(usuario);
	} catch (err: any) {
		if (err.code === 'P2002') {
			res.status(409).json({ error: 'El username ya existe' });
			return;
		}
		res.status(500).json({ error: 'Error al crear usuario' });
	}
});

router.put('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		const { username, password, rol } = req.body;
		const data: any = {};

		if (username) data.username = username;
		if (rol) data.rol = rol;
		if (password) data.password_hash = await bcrypt.hash(password, 10);

		const usuario = await prisma.usuario.update({
			where: { id_usuario: parseInt((req.params.id as string) ?? '0') },
			data,
			select: {
				id_usuario: true,
				username: true,
				rol: true,
				created_at: true,
			},
		});

		res.json(usuario);
	} catch (err: any) {
		if (err.code === 'P2025') {
			res.status(404).json({ error: 'Usuario no encontrado' });
			return;
		}
		if (err.code === 'P2002') {
			res.status(409).json({ error: 'El username ya existe' });
			return;
		}
		res.status(500).json({ error: 'Error al actualizar usuario' });
	}
});

router.delete('/:id', authMiddleware, roleGuard('admin'), async (req: Request, res: Response) => {
	try {
		await prisma.usuario.delete({
			where: { id_usuario: parseInt((req.params.id as string) ?? '0') },
		});
		res.json({ message: 'Usuario eliminado' });
	} catch (err: any) {
		if (err.code === 'P2025') {
			res.status(404).json({ error: 'Usuario no encontrado' });
			return;
		}
		res.status(500).json({ error: 'Error al eliminar usuario' });
	}
});

export default router;
