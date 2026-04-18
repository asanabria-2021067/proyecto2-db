export const GET_ALL = `SELECT * FROM autor ORDER BY id_autor`;
export const GET_BY_ID = `SELECT * FROM autor WHERE id_autor = $1`;
export const INSERT = `INSERT INTO autor (nombre, nacionalidad, fecha_nacimiento) VALUES ($1, $2, $3) RETURNING *`;
export const UPDATE = `UPDATE autor SET nombre = $1, nacionalidad = $2, fecha_nacimiento = $3 WHERE id_autor = $4 RETURNING *`;
export const DELETE = `DELETE FROM autor WHERE id_autor = $1 RETURNING *`;
