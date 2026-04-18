export const GET_ALL = `
SELECT c.*, u.username
FROM cliente c
LEFT JOIN usuario u ON c.usuario_id = u.id_usuario
ORDER BY c.id_cliente`;

export const GET_BY_ID = `
SELECT c.*, u.username
FROM cliente c
LEFT JOIN usuario u ON c.usuario_id = u.id_usuario
WHERE c.id_cliente = $1`;

export const INSERT = `
INSERT INTO cliente (nombre, email, telefono, direccion, usuario_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING *`;

export const UPDATE = `
UPDATE cliente
SET nombre = $1, email = $2, telefono = $3, direccion = $4
WHERE id_cliente = $5
RETURNING *`;

export const DELETE = `DELETE FROM cliente WHERE id_cliente = $1 RETURNING *`;
