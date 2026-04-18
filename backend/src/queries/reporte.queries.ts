// Subquery #1: Productos que nunca se han vendido (10 pts)
export const PRODUCTOS_NO_VENDIDOS = `
SELECT p.id_producto, p.titulo, p.precio, p.stock
FROM producto p
WHERE NOT EXISTS (
	SELECT 1 FROM detalle_venta dv WHERE dv.producto_id = p.id_producto
)
ORDER BY p.titulo`;

// Subquery #2: Clientes que han gastado mas que el promedio (10 pts)
export const CLIENTES_SOBRE_PROMEDIO = `
SELECT c.id_cliente, c.nombre, c.email, SUM(v.total) AS total_gastado
FROM cliente c
JOIN venta v ON v.cliente_id = c.id_cliente
GROUP BY c.id_cliente, c.nombre, c.email
HAVING SUM(v.total) > (
	SELECT AVG(sub.total_cliente)
	FROM (
		SELECT SUM(v2.total) AS total_cliente
		FROM venta v2
		GROUP BY v2.cliente_id
	) sub
)
ORDER BY total_gastado DESC`;

// GROUP BY + HAVING: Top 10 productos mas vendidos (8 pts)
export const TOP_PRODUCTOS = `
SELECT p.id_producto, p.titulo, SUM(dv.cantidad) AS total_vendido
FROM detalle_venta dv
JOIN producto p ON dv.producto_id = p.id_producto
GROUP BY p.id_producto, p.titulo
HAVING SUM(dv.cantidad) > 0
ORDER BY total_vendido DESC
LIMIT 10`;

// GROUP BY: Ventas totales por mes (8 pts)
export const VENTAS_POR_MES = `
SELECT
	TO_CHAR(v.fecha, 'YYYY-MM') AS mes,
	COUNT(*) AS cantidad_ventas,
	SUM(v.total) AS total
FROM venta v
GROUP BY TO_CHAR(v.fecha, 'YYYY-MM')
ORDER BY mes`;

// GROUP BY + HAVING: Categorias con mas de N productos
export const CATEGORIAS_CON_PRODUCTOS = `
SELECT c.id_categoria, c.nombre, c.tipo, COUNT(p.id_producto) AS cantidad_productos
FROM categoria c
JOIN producto p ON p.categoria_id = c.id_categoria
GROUP BY c.id_categoria, c.nombre, c.tipo
HAVING COUNT(p.id_producto) > $1
ORDER BY cantidad_productos DESC`;

// CTE: Ranking de clientes por total gastado (5 pts)
export const RANKING_CLIENTES = `
WITH totales_cliente AS (
	SELECT
		c.id_cliente,
		c.nombre,
		c.email,
		SUM(v.total) AS total_gastado,
		COUNT(v.id_venta) AS cantidad_compras
	FROM cliente c
	JOIN venta v ON v.cliente_id = c.id_cliente
	GROUP BY c.id_cliente, c.nombre, c.email
)
SELECT
	id_cliente, nombre, email, total_gastado, cantidad_compras,
	RANK() OVER (ORDER BY total_gastado DESC) AS ranking
FROM totales_cliente
ORDER BY ranking`;

// Stock bajo
export const STOCK_BAJO = `
SELECT id_producto, titulo, stock, precio
FROM producto
WHERE stock <= 5
ORDER BY stock ASC`;
