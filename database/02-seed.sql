-- Seed data - Tienda de Libros y Mangas

-- Usuarios (passwords hasheadas con pgcrypto, compatibles con bcryptjs)
-- admin/admin123, vendedor1/vend123, cliente1/cli123
INSERT INTO usuario (username, password_hash, rol) VALUES
	('admin', crypt('admin123', gen_salt('bf', 10)), 'admin'),
	('vendedor1', crypt('vend123', gen_salt('bf', 10)), 'vendedor'),
	('cliente1', crypt('cli123', gen_salt('bf', 10)), 'cliente'),
	('cliente2', crypt('cli123', gen_salt('bf', 10)), 'cliente');

-- Categorias
INSERT INTO categoria (nombre, tipo, descripcion) VALUES
	('Shonen', 'MANGA', 'Manga orientado a jovenes varones'),
	('Seinen', 'MANGA', 'Manga orientado a adultos'),
	('Fantasia', 'LIBRO', 'Novelas de fantasia y mundos ficticios'),
	('Ciencia Ficcion', 'LIBRO', 'Novelas de ciencia ficcion'),
	('Superheroes', 'COMIC', 'Comics de superheroes'),
	('Divulgacion', 'REVISTA', 'Revistas de divulgacion cientifica');

-- Editoriales
INSERT INTO editorial (nombre, pais, sitio_web) VALUES
	('Norma Editorial', 'Espana', 'https://www.normaeditorial.com'),
	('Panini Comics', 'Italia', 'https://www.paninicomics.com'),
	('Editorial Planeta', 'Espana', 'https://www.planetadelibros.com'),
	('Salamandra', 'Espana', 'https://www.salamandra.info'),
	('Ivrea', 'Argentina', 'https://www.editorialivrea.com');

-- Autores
INSERT INTO autor (nombre, nacionalidad, fecha_nacimiento) VALUES
	('Akira Toriyama', 'Japonesa', '1955-04-05'),
	('Eiichiro Oda', 'Japonesa', '1975-01-01'),
	('Hajime Isayama', 'Japonesa', '1986-08-29'),
	('J.K. Rowling', 'Britanica', '1965-07-31'),
	('George Orwell', 'Britanica', '1903-06-25'),
	('Isaac Asimov', 'Estadounidense', '1920-01-02'),
	('Frank Miller', 'Estadounidense', '1957-01-27'),
	('Naoko Takeuchi', 'Japonesa', '1967-03-15');

-- Productos
INSERT INTO producto (titulo, descripcion, precio, stock, isbn, anio_publicacion, categoria_id, editorial_id) VALUES
	('Dragon Ball Vol. 1', 'La aventura de Goku comienza en busca de las esferas del dragon', 12.99, 25, '978-84-679-0001-1', 1984, 1, 1),
	('One Piece Vol. 1', 'Monkey D. Luffy zarpa en busca del One Piece', 11.99, 30, '978-84-679-0002-8', 1997, 1, 5),
	('Shingeki no Kyojin Vol. 1', 'La humanidad lucha por su supervivencia contra los titanes', 13.50, 20, '978-84-679-0003-5', 2009, 1, 1),
	('Berserk Vol. 1', 'Guts, el espadachin negro, busca venganza', 14.99, 15, '978-84-679-0004-2', 1989, 2, 2),
	('Harry Potter y la Piedra Filosofal', 'Un joven mago descubre su destino en Hogwarts', 19.99, 40, '978-84-679-0005-9', 1997, 3, 4),
	('1984', 'Una distopia sobre el control totalitario', 15.99, 35, '978-84-679-0006-6', 1949, 4, 3),
	('Fundacion', 'El inicio de la saga mas grande de ciencia ficcion', 16.99, 18, '978-84-679-0007-3', 1951, 4, 3),
	('Batman: El Regreso del Caballero Oscuro', 'Batman regresa despues de 10 anos de retiro', 24.99, 12, '978-84-679-0008-0', 1986, 5, 2),
	('Sailor Moon Vol. 1', 'Usagi Tsukino descubre que es una guerrera magica', 12.50, 22, '978-84-679-0009-7', 1991, 1, 1),
	('Dragon Ball Vol. 2', 'Goku entrena con el maestro Roshi', 12.99, 20, '978-84-679-0010-3', 1984, 1, 1),
	('One Piece Vol. 2', 'Luffy recluta a Roronoa Zoro', 11.99, 28, '978-84-679-0011-0', 1997, 1, 5),
	('Harry Potter y la Camara Secreta', 'El segundo ano de Harry en Hogwarts', 19.99, 38, '978-84-679-0012-7', 1998, 3, 4),
	('National Geographic Enero', 'Edicion especial de naturaleza', 8.99, 50, '978-84-679-0013-4', 2024, 6, 3),
	('Shingeki no Kyojin Vol. 2', 'La batalla por Trost continua', 13.50, 3, '978-84-679-0014-1', 2010, 1, 1),
	('Fundacion e Imperio', 'La continuacion de la saga Fundacion', 16.99, 2, '978-84-679-0015-8', 1952, 4, 3);

-- Producto-Autor
INSERT INTO producto_autor (producto_id, autor_id) VALUES
	(1, 1), (10, 1),
	(2, 2), (11, 2),
	(3, 3), (14, 3),
	(4, 1),
	(5, 4), (12, 4),
	(6, 5),
	(7, 6), (15, 6),
	(8, 7),
	(9, 8);

-- Proveedores
INSERT INTO proveedor (nombre, contacto, telefono, email, direccion) VALUES
	('Distribuidora Manga GT', 'Carlos Mendez', '5555-1234', 'carlos@mangagt.com', 'Zona 10, Ciudad de Guatemala'),
	('Libros del Sur', 'Maria Fernandez', '5555-5678', 'maria@librosdelsur.com', 'Zona 14, Ciudad de Guatemala'),
	('Comic World Import', 'Roberto Chan', '5555-9012', 'roberto@comicworld.com', 'Zona 4, Ciudad de Guatemala');

-- Clientes
INSERT INTO cliente (nombre, email, telefono, direccion, usuario_id) VALUES
	('Juan Perez', 'juan@email.com', '5555-1111', 'Zona 1, Guatemala', 3),
	('Maria Garcia', 'maria@email.com', '5555-2222', 'Zona 5, Guatemala', 4),
	('Carlos Lopez', 'carlos@email.com', '5555-3333', 'Zona 10, Guatemala', NULL),
	('Ana Rodriguez', 'ana@email.com', '5555-4444', 'Zona 15, Guatemala', NULL);

-- Empleados
INSERT INTO empleado (nombre, cargo, telefono, email, usuario_id) VALUES
	('Pedro Martinez', 'Vendedor', '5555-7777', 'pedro@tienda.com', 2),
	('Laura Gomez', 'Cajera', '5555-8888', 'laura@tienda.com', NULL);

-- Compras a proveedores
INSERT INTO compra_proveedor (proveedor_id, fecha, total, estado) VALUES
	(1, '2024-01-15 10:00:00', 650.00, 'completada'),
	(2, '2024-02-20 14:30:00', 890.00, 'completada'),
	(3, '2024-03-10 09:00:00', 450.00, 'completada');

-- Detalle compras
INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario) VALUES
	(1, 1, 20, 8.00), (1, 2, 25, 7.50), (1, 3, 15, 9.00),
	(2, 5, 30, 12.00), (2, 6, 25, 10.00), (2, 7, 15, 11.00),
	(3, 8, 10, 18.00), (3, 9, 20, 7.50), (3, 4, 10, 10.00);

-- Ventas
INSERT INTO venta (cliente_id, empleado_id, fecha, total, estado) VALUES
	(1, 1, '2024-06-01 11:30:00', 37.97, 'completada'),
	(2, 1, '2024-06-05 15:00:00', 59.97, 'completada'),
	(1, NULL, '2024-06-10 20:00:00', 19.99, 'completada'),
	(3, 1, '2024-07-01 12:00:00', 25.98, 'completada'),
	(2, NULL, '2024-07-15 18:30:00', 44.98, 'completada'),
	(4, 1, '2024-08-01 10:00:00', 53.97, 'completada'),
	(1, 1, '2024-08-15 14:00:00', 31.98, 'completada'),
	(3, NULL, '2024-09-01 16:00:00', 16.99, 'completada');

-- Detalle ventas
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
	(1, 1, 1, 12.99), (1, 2, 1, 11.99), (1, 3, 1, 13.50),
	(2, 5, 1, 19.99), (2, 6, 1, 15.99), (2, 8, 1, 24.99),
	(3, 5, 1, 19.99),
	(4, 1, 2, 12.99),
	(5, 7, 1, 16.99), (5, 9, 1, 12.50), (5, 6, 1, 15.99),
	(6, 5, 1, 19.99), (6, 12, 1, 19.99), (6, 3, 1, 13.50),
	(7, 2, 1, 11.99), (7, 5, 1, 19.99),
	(8, 7, 1, 16.99);
