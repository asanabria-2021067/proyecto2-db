import pg from 'pg';

const pool = new pg.Pool({
	host: process.env['DB_HOST'] ?? 'localhost',
	port: Number(process.env['DB_PORT'] ?? 5432),
	user: process.env['DB_USER'] ?? 'proy3',
	password: process.env['DB_PASSWORD'] ?? 'secret',
	database: process.env['DB_NAME'] ?? 'tienda_libros',
});

export default pool;
