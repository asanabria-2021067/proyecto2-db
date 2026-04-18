import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

const storage = multer.diskStorage({
	destination: 'uploads/',
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${randomUUID()}${ext}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, allowed.includes(ext));
	},
});

const router = Router();

router.post('/', upload.single('imagen'), (req, res) => {
	if (!req.file) {
		res.status(400).json({ error: 'No se subio ninguna imagen' });
		return;
	}
	const url = `/uploads/${req.file.filename}`;
	res.json({ url });
});

export default router;
