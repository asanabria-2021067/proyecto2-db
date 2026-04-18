// JOIN #2: venta + cliente + empleado (10 pts)
export const GET_ALL = `
SELECT
	v.id_venta, v.fecha, v.total, v.estado,
	c.nombre AS cliente, c.email AS cliente_email,
	COALESCE(e.nombre, 'Venta web') AS empleado
FROM venta v
JOIN cliente c ON v.cliente_id = c.id_cliente
LEFT JOIN empleado e ON v.empleado_id = e.id_empleado
ORDER BY v.fecha DESC`;

export const GET_BY_ID = `
SELECT
	v.id_venta, v.fecha, v.total, v.estado, v.cliente_id, v.empleado_id,
	c.nombre AS cliente,
	COALESCE(e.nombre, 'Venta web') AS empleado
FROM venta v
JOIN cliente c ON v.cliente_id = c.id_cliente
LEFT JOIN empleado e ON v.empleado_id = e.id_empleado
WHERE v.id_venta = $1`;

export const GET_DETALLE = `
SELECT
	dv.id_detalle, dv.cantidad, dv.precio_unitario,
	p.titulo AS producto
FROM detalle_venta dv
JOIN producto p ON dv.producto_id = p.id_producto
WHERE dv.venta_id = $1`;

export const INSERT_VENTA = `
INSERT INTO venta (cliente_id, empleado_id, fecha, total, estado)
VALUES ($1, $2, NOW(), $3, 'completada')
RETURNING id_venta`;

export const INSERT_DETALLE = `
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
VALUES ($1, $2, $3, $4)`;

export const UPDATE_STOCK = `
UPDATE producto SET stock = stock - $1 WHERE id_producto = $2 RETURNING stock`;

export const GET_CLIENTE_BY_USUARIO = `
SELECT id_cliente FROM cliente WHERE usuario_id = $1`;

export const GET_MIS_COMPRAS = `
SELECT
	v.id_venta, v.fecha, v.total, v.estado,
	COALESCE(e.nombre, 'Venta web') AS empleado
FROM venta v
LEFT JOIN empleado e ON v.empleado_id = e.id_empleado
WHERE v.cliente_id = $1
ORDER BY v.fecha DESC`;

export const GET_MIS_COMPRAS_DETALLE = `
SELECT
	dv.cantidad, dv.precio_unitario,
	p.titulo AS producto
FROM detalle_venta dv
JOIN producto p ON dv.producto_id = p.id_producto
WHERE dv.venta_id = $1`;
