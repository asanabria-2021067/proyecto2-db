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
	try {
		const { username, password, rol } = req.body;
		const hash = await bcrypt.hash(password, 10);
		const result = await pool.query(
			'INSERT INTO usuario (username, password_hash, rol) VALUES ($1, $2, $3) RETURNING id_usuario, username, rol',
			[username, hash, rol ?? 'cliente']
		);
		res.status(201).json(result.rows[0]);
	} catch (err: any) {
		if (err.code === '23505') {
			res.status(409).json({ error: 'El username ya existe' });
			return;
		}
		res.status(500).json({ error: 'Error al registrar' });
	}
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
	res.json(req.user);
});

export default router;
