-- Tienda de Libros y Mangas - DDL
-- CC3088 Bases de Datos 1 - Proyecto 2

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Usuario
CREATE TABLE usuario (
	id_usuario		SERIAL PRIMARY KEY,
	username		VARCHAR(50) UNIQUE NOT NULL,
	password_hash	VARCHAR(255) NOT NULL,
	rol				VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'vendedor', 'cliente')),
	created_at		TIMESTAMP DEFAULT NOW()
);

-- 2. Categoria
CREATE TABLE categoria (
	id_categoria	SERIAL PRIMARY KEY,
	nombre			VARCHAR(100) NOT NULL,
	tipo			VARCHAR(20) NOT NULL CHECK (tipo IN ('LIBRO', 'MANGA', 'REVISTA', 'COMIC')),
	descripcion		TEXT
);

-- 3. Editorial
CREATE TABLE editorial (
	id_editorial	SERIAL PRIMARY KEY,
	nombre			VARCHAR(100) NOT NULL,
	pais			VARCHAR(50),
	sitio_web		VARCHAR(255)
);

-- 4. Autor
CREATE TABLE autor (
	id_autor			SERIAL PRIMARY KEY,
	nombre				VARCHAR(100) NOT NULL,
	nacionalidad		VARCHAR(50),
	fecha_nacimiento	DATE
);

-- 5. Producto
CREATE TABLE producto (
	id_producto			SERIAL PRIMARY KEY,
	titulo				VARCHAR(255) NOT NULL,
	descripcion			TEXT,
	precio				DECIMAL(10, 2) NOT NULL CHECK (precio > 0),
	stock				INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
	isbn				VARCHAR(20) UNIQUE,
	anio_publicacion	INT,
	imagen_url			VARCHAR(500),
	categoria_id		INT NOT NULL REFERENCES categoria(id_categoria),
	editorial_id		INT NOT NULL REFERENCES editorial(id_editorial),
	created_at			TIMESTAMP DEFAULT NOW()
);

-- 6. Producto-Autor (N:M)
CREATE TABLE producto_autor (
	producto_id		INT REFERENCES producto(id_producto) ON DELETE CASCADE,
	autor_id		INT REFERENCES autor(id_autor) ON DELETE CASCADE,
	PRIMARY KEY (producto_id, autor_id)
);

-- 7. Proveedor
CREATE TABLE proveedor (
	id_proveedor	SERIAL PRIMARY KEY,
	nombre			VARCHAR(100) NOT NULL,
	contacto		VARCHAR(100),
	telefono		VARCHAR(20),
	email			VARCHAR(100),
	direccion		TEXT
);

-- 8. Compra a Proveedor (cabecera)
CREATE TABLE compra_proveedor (
	id_compra		SERIAL PRIMARY KEY,
	proveedor_id	INT NOT NULL REFERENCES proveedor(id_proveedor),
	fecha			TIMESTAMP DEFAULT NOW(),
	total			DECIMAL(10, 2) NOT NULL DEFAULT 0,
	estado			VARCHAR(20) DEFAULT 'completada'
);

-- 9. Detalle de Compra
CREATE TABLE detalle_compra (
	id_detalle			SERIAL PRIMARY KEY,
	compra_id			INT NOT NULL REFERENCES compra_proveedor(id_compra) ON DELETE CASCADE,
	producto_id			INT NOT NULL REFERENCES producto(id_producto),
	cantidad			INT NOT NULL CHECK (cantidad > 0),
	precio_unitario		DECIMAL(10, 2) NOT NULL CHECK (precio_unitario > 0)
);

-- 10. Cliente
CREATE TABLE cliente (
	id_cliente		SERIAL PRIMARY KEY,
	nombre			VARCHAR(100) NOT NULL,
	email			VARCHAR(100),
	telefono		VARCHAR(20),
	direccion		TEXT,
	usuario_id		INT UNIQUE REFERENCES usuario(id_usuario),
	created_at		TIMESTAMP DEFAULT NOW()
);

-- 11. Empleado
CREATE TABLE empleado (
	id_empleado		SERIAL PRIMARY KEY,
	nombre			VARCHAR(100) NOT NULL,
	cargo			VARCHAR(50),
	telefono		VARCHAR(20),
	email			VARCHAR(100),
	usuario_id		INT UNIQUE REFERENCES usuario(id_usuario),
	created_at		TIMESTAMP DEFAULT NOW()
);

-- 12. Venta (cabecera)
CREATE TABLE venta (
	id_venta		SERIAL PRIMARY KEY,
	cliente_id		INT NOT NULL REFERENCES cliente(id_cliente),
	empleado_id		INT REFERENCES empleado(id_empleado),
	fecha			TIMESTAMP DEFAULT NOW(),
	total			DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
	estado			VARCHAR(20) DEFAULT 'completada'
);

-- 13. Detalle de Venta
CREATE TABLE detalle_venta (
	id_detalle			SERIAL PRIMARY KEY,
	venta_id			INT NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
	producto_id			INT NOT NULL REFERENCES producto(id_producto),
	cantidad			INT NOT NULL CHECK (cantidad > 0),
	precio_unitario		DECIMAL(10, 2) NOT NULL CHECK (precio_unitario > 0)
);

-- VIEW: vista_producto_completo (5 pts)
CREATE VIEW vista_producto_completo AS
SELECT
	p.id_producto,
	p.titulo,
	p.descripcion,
	p.precio,
	p.stock,
	p.isbn,
	p.anio_publicacion,
	p.imagen_url,
	p.categoria_id,
	p.editorial_id,
	c.nombre AS categoria,
	c.tipo,
	e.nombre AS editorial,
	STRING_AGG(a.nombre, ', ') AS autores
FROM producto p
JOIN categoria c ON p.categoria_id = c.id_categoria
JOIN editorial e ON p.editorial_id = e.id_editorial
LEFT JOIN producto_autor pa ON p.id_producto = pa.producto_id
LEFT JOIN autor a ON pa.autor_id = a.id_autor
GROUP BY p.id_producto, p.titulo, p.descripcion, p.precio, p.stock,
	p.isbn, p.anio_publicacion, p.imagen_url, p.categoria_id, p.editorial_id,
	c.nombre, c.tipo, e.nombre;
