// VIEW (5 pts)
export const GET_ALL = `SELECT * FROM vista_producto_completo ORDER BY id_producto`;

export const GET_BY_ID = `SELECT * FROM vista_producto_completo WHERE id_producto = $1`;

// JOIN #1: producto + categoria + editorial + producto_autor + autor (10 pts)
export const GET_WITH_JOINS = `
SELECT
	p.id_producto, p.titulo, p.descripcion, p.precio, p.stock, p.isbn,
	p.anio_publicacion, p.imagen_url,
	c.nombre AS categoria, c.tipo,
	e.nombre AS editorial,
	STRING_AGG(a.nombre, ', ') AS autores
FROM producto p
JOIN categoria c ON p.categoria_id = c.id_categoria
JOIN editorial e ON p.editorial_id = e.id_editorial
LEFT JOIN producto_autor pa ON p.id_producto = pa.producto_id
LEFT JOIN autor a ON pa.autor_id = a.id_autor
GROUP BY p.id_producto, c.nombre, c.tipo, e.nombre
ORDER BY p.id_producto`;

export const INSERT = `
INSERT INTO producto (titulo, descripcion, precio, stock, isbn, anio_publicacion, imagen_url, categoria_id, editorial_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *`;

export const UPDATE = `
UPDATE producto
SET titulo = $1, descripcion = $2, precio = $3, stock = $4, isbn = $5,
	anio_publicacion = $6, imagen_url = $7, categoria_id = $8, editorial_id = $9
WHERE id_producto = $10
RETURNING *`;

export const DELETE = `DELETE FROM producto WHERE id_producto = $1 RETURNING *`;

export const SET_AUTHORS = `INSERT INTO producto_autor (producto_id, autor_id) VALUES ($1, $2)`;
export const DELETE_AUTHORS = `DELETE FROM producto_autor WHERE producto_id = $1`;
