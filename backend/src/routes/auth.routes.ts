import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env['JWT_SECRET'] ?? 'mi_secreto_jwt_super_seguro_2024';

router.post('/login', async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;
		const result = await pool.query('SELECT * FROM usuario WHERE username = $1', [username]);
		const user = result.rows[0];
		if (!user) {
			res.status(401).json({ error: 'Credenciales invalidas' });
			return;
		}
		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) {
			res.status(401).json({ error: 'Credenciales invalidas' });
			return;
		}
		const token = jwt.sign(
			{ id_usuario: user.id_usuario, username: user.username, rol: user.rol },
			JWT_SECRET,
			{ expiresIn: '8h' }
		);
		res.json({ token, user: { id_usuario: user.id_usuario, username: user.username, rol: user.rol } });
	} catch {
		res.status(500).json({ error: 'Error en login' });
	}
});

router.post('/register', async (req: Request, res: Response) => {
	const { username, password, nombre, email, telefono, direccion } = req.body;
	if (!username || !password || !nombre) {
		res.status(400).json({ error: 'Username, password y nombre son requeridos' });
		return;
	}
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const hash = await bcrypt.hash(password, 10);
		const userResult = await client.query(
			'INSERT INTO usuario (username, password_hash, rol) VALUES ($1, $2, $3) RETURNING id_usuario, username, rol',
			[username, hash, 'cliente']
		);
		const user = userResult.rows[0];
		await client.query(
			'INSERT INTO cliente (nombre, email, telefono, direccion, usuario_id) VALUES ($1, $2, $3, $4, $5)',
			[nombre, email ?? null, telefono ?? null, direccion ?? null, user.id_usuario]
		);
		await client.query('COMMIT');
		const token = jwt.sign(
			{ id_usuario: user.id_usuario, username: user.username, rol: user.rol },
			JWT_SECRET,
			{ expiresIn: '8h' }
		);
		res.status(201).json({ token, user });
	} catch (err: any) {
		await client.query('ROLLBACK');
		if (err.code === '23505') {
			res.status(409).json({ error: 'El username ya existe' });
			return;
		}
		res.status(500).json({ error: 'Error al registrar' });
	} finally {
		client.release();
	}
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
	res.json(req.user);
});

export default router;
