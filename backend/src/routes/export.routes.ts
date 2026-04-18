import express from 'express';
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { authMiddleware, roleGuard } from '../middleware/auth.js';

const router = express.Router();

// CSV export (5 pts)
router.get('/ventas-csv', authMiddleware, roleGuard('admin', 'vendedor'), async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(`
			SELECT
				v.id_venta,
				v.fecha,
				c.nombre AS cliente,
				COALESCE(e.nombre, 'Venta web') AS empleado,
				p.titulo AS producto,
				dv.cantidad,
				dv.precio_unitario,
				(dv.cantidad * dv.precio_unitario) AS subtotal,
				v.total,
				v.estado
			FROM venta v
			JOIN cliente c ON v.cliente_id = c.id_cliente
			LEFT JOIN empleado e ON v.empleado_id = e.id_empleado
			JOIN detalle_venta dv ON dv.venta_id = v.id_venta
			JOIN producto p ON dv.producto_id = p.id_producto
			ORDER BY v.fecha DESC
		`);

		const headers = ['ID Venta', 'Fecha', 'Cliente', 'Empleado', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal', 'Total Venta', 'Estado'];
		const rows = result.rows.map((r: any) =>
			[r.id_venta, r.fecha, r.cliente, r.empleado, r.producto, r.cantidad, r.precio_unitario, r.subtotal, r.total, r.estado]
				.map(v => `"${String(v).replace(/"/g, '""')}"`)
				.join(',')
		);

		const csv = [headers.join(','), ...rows].join('\n');
		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename=ventas.csv');
		res.send(csv);
	} catch {
		res.status(500).json({ error: 'Error al exportar CSV' });
	}
});

export default router;
