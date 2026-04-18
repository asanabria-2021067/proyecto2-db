import pg from 'pg';

const pool = new pg.Pool({
	host: process.env['DB_HOST'] ?? 'localhost',
	port: Number(process.env['DB_PORT'] ?? 5432),
	user: process.env['POSTGRES_USER'] ?? 'proy2',
	password: process.env['POSTGRES_PASSWORD'] ?? 'secret',
	database: process.env['POSTGRES_DB'] ?? 'tienda_libros',
});

export default pool;
