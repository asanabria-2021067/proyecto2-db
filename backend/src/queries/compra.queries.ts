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
