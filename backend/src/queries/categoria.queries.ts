export const GET_ALL = `SELECT * FROM categoria ORDER BY id_categoria`;
export const GET_BY_ID = `SELECT * FROM categoria WHERE id_categoria = $1`;
export const INSERT = `INSERT INTO categoria (nombre, tipo, descripcion) VALUES ($1, $2, $3) RETURNING *`;
export const UPDATE = `UPDATE categoria SET nombre = $1, tipo = $2, descripcion = $3 WHERE id_categoria = $4 RETURNING *`;
export const DELETE = `DELETE FROM categoria WHERE id_categoria = $1 RETURNING *`;
