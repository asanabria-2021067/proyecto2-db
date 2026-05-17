// JOIN #3: compra_proveedor + proveedor + detalle_compra + producto (10 pts)
export const GET_ALL = `
SELECT
	cp.id_compra, cp.fecha, cp.total, cp.estado,
	p.nombre AS proveedor
FROM compra_proveedor cp
JOIN proveedor p ON cp.proveedor_id = p.id_proveedor
ORDER BY cp.fecha DESC`;

export const GET_DETALLE = `
SELECT
	dc.id_detalle, dc.cantidad, dc.precio_unitario,
	pr.titulo AS producto,
	prov.nombre AS proveedor
FROM detalle_compra dc
JOIN producto pr ON dc.producto_id = pr.id_producto
JOIN compra_proveedor cp ON dc.compra_id = cp.id_compra
JOIN proveedor prov ON cp.proveedor_id = prov.id_proveedor
WHERE dc.compra_id = $1`;

export const INSERT_COMPRA = `
INSERT INTO compra_proveedor (proveedor_id, fecha, total, estado)
VALUES ($1, NOW(), $2, 'completada')
RETURNING id_compra`;

export const INSERT_DETALLE_COMPRA = `
INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario)
VALUES ($1, $2, $3, $4)`;

export const UPDATE_STOCK_ADD = `
UPDATE producto SET stock = stock + $1 WHERE id_producto = $2 RETURNING stock`;
