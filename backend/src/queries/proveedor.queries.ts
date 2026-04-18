export const GET_ALL = `SELECT * FROM proveedor ORDER BY id_proveedor`;
export const GET_BY_ID = `SELECT * FROM proveedor WHERE id_proveedor = $1`;
export const INSERT = `INSERT INTO proveedor (nombre, contacto, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
export const UPDATE = `UPDATE proveedor SET nombre = $1, contacto = $2, telefono = $3, email = $4, direccion = $5 WHERE id_proveedor = $6 RETURNING *`;
export const DELETE = `DELETE FROM proveedor WHERE id_proveedor = $1 RETURNING *`;
