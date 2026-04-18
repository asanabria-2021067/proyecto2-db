export const GET_ALL = `SELECT * FROM editorial ORDER BY id_editorial`;
export const GET_BY_ID = `SELECT * FROM editorial WHERE id_editorial = $1`;
export const INSERT = `INSERT INTO editorial (nombre, pais, sitio_web) VALUES ($1, $2, $3) RETURNING *`;
export const UPDATE = `UPDATE editorial SET nombre = $1, pais = $2, sitio_web = $3 WHERE id_editorial = $4 RETURNING *`;
export const DELETE = `DELETE FROM editorial WHERE id_editorial = $1 RETURNING *`;
