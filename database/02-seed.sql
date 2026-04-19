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
INSERT INTO producto (titulo, descripcion, precio, stock, isbn, anio_publicacion, imagen_url, categoria_id, editorial_id) VALUES
	('Dragon Ball Vol. 1', 'La aventura de Goku comienza en busca de las esferas del dragon', 12.99, 25, '978-84-679-0001-1', 1984, 'https://covers.openlibrary.org/b/isbn/9781569319208-L.jpg', 1, 1),
	('One Piece Vol. 1', 'Monkey D. Luffy zarpa en busca del One Piece', 11.99, 30, '978-84-679-0002-8', 1997, 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg', 1, 5),
	('Shingeki no Kyojin Vol. 1', 'La humanidad lucha por su supervivencia contra los titanes', 13.50, 20, '978-84-679-0003-5', 2009, 'https://covers.openlibrary.org/b/isbn/9781612620244-L.jpg', 1, 1),
	('Berserk Vol. 1', 'Guts, el espadachin negro, busca venganza', 14.99, 15, '978-84-679-0004-2', 1989, 'https://covers.openlibrary.org/b/isbn/9781593070205-L.jpg', 2, 2),
	('Harry Potter y la Piedra Filosofal', 'Un joven mago descubre su destino en Hogwarts', 19.99, 40, '978-84-679-0005-9', 1997, 'https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg', 3, 4),
	('1984', 'Una distopia sobre el control totalitario', 15.99, 35, '978-84-679-0006-6', 1949, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 4, 3),
	('Fundacion', 'El inicio de la saga mas grande de ciencia ficcion', 16.99, 18, '978-84-679-0007-3', 1951, 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg', 4, 3),
	('Batman: El Regreso del Caballero Oscuro', 'Batman regresa despues de 10 anos de retiro', 24.99, 12, '978-84-679-0008-0', 1986, 'https://covers.openlibrary.org/b/isbn/9781563893421-L.jpg', 5, 2),
	('Sailor Moon Vol. 1', 'Usagi Tsukino descubre que es una guerrera magica', 12.50, 22, '978-84-679-0009-7', 1991, 'https://covers.openlibrary.org/b/isbn/9781935429746-L.jpg', 1, 1),
	('Dragon Ball Vol. 2', 'Goku entrena con el maestro Roshi', 12.99, 20, '978-84-679-0010-3', 1984, 'https://covers.openlibrary.org/b/isbn/9781569319222-L.jpg', 1, 1),
	('One Piece Vol. 2', 'Luffy recluta a Roronoa Zoro', 11.99, 28, '978-84-679-0011-0', 1997, 'https://covers.openlibrary.org/b/isbn/9781591160571-L.jpg', 1, 5),
	('Harry Potter y la Camara Secreta', 'El segundo ano de Harry en Hogwarts', 19.99, 38, '978-84-679-0012-7', 1998, 'https://covers.openlibrary.org/b/isbn/9780747538486-L.jpg', 3, 4),
	('National Geographic Enero', 'Edicion especial de naturaleza', 8.99, 50, '978-84-679-0013-4', 2024, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80', 6, 3),
	('Shingeki no Kyojin Vol. 2', 'La batalla por Trost continua', 13.50, 3, '978-84-679-0014-1', 2010, 'https://covers.openlibrary.org/b/isbn/9781612620251-L.jpg', 1, 1),
	('Fundacion e Imperio', 'La continuacion de la saga Fundacion', 16.99, 2, '978-84-679-0015-8', 1952, 'https://covers.openlibrary.org/b/isbn/9780553293371-L.jpg', 4, 3),
	('Dragon Ball Vol. 3', 'El torneo de artes marciales se vuelve intenso', 12.99, 21, '978-84-679-0016-5', 1985, 'https://covers.openlibrary.org/b/isbn/9781569319239-L.jpg', 1, 1),
	('One Piece Vol. 3', 'Aparecen nuevos piratas en el East Blue', 11.99, 26, '978-84-679-0017-2', 1998, 'https://covers.openlibrary.org/b/isbn/9781421536255-L.jpg', 1, 5),
	('Shingeki no Kyojin Vol. 3', 'Secretos detras de los titanes salen a la luz', 13.50, 17, '978-84-679-0018-9', 2011, 'https://covers.openlibrary.org/b/isbn/9781612620268-L.jpg', 1, 1),
	('Berserk Vol. 2', 'Guts enfrenta a los apostoles en una noche oscura', 14.99, 10, '978-84-679-0019-6', 1990, 'https://covers.openlibrary.org/b/isbn/9781593070212-L.jpg', 2, 2),
	('Harry Potter y el Prisionero de Azkaban', 'El pasado de Sirius Black pone en peligro Hogwarts', 20.99, 34, '978-84-679-0020-2', 1999, 'https://covers.openlibrary.org/b/isbn/9780747542155-L.jpg', 3, 4),
	('Rebelion en la Granja', 'Satira politica de George Orwell en una granja', 13.99, 29, '978-84-679-0021-9', 1945, 'https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg', 4, 3),
	('Fundacion y Tierra', 'La busqueda del origen de la humanidad', 17.50, 13, '978-84-679-0022-6', 1986, 'https://covers.openlibrary.org/b/isbn/9780553293388-L.jpg', 4, 3),
	('Batman: Year One', 'El origen moderno del caballero oscuro en Gotham', 22.50, 14, '978-84-679-0023-3', 1987, 'https://covers.openlibrary.org/b/isbn/9781401207526-L.jpg', 5, 2),
	('Sailor Moon Vol. 2', 'Nuevas sailor scouts se unen a la batalla', 12.50, 19, '978-84-679-0024-0', 1992, 'https://covers.openlibrary.org/b/isbn/9781935429753-L.jpg', 1, 1),
	('Scientific American Febrero', 'Tendencias de ciencia y tecnologia del ano', 9.50, 45, '978-84-679-0025-7', 2024, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80', 6, 3),
	('National Geographic Exploradores', 'Vida salvaje y expediciones del planeta', 9.20, 41, '978-84-679-0026-4', 2024, 'https://covers.openlibrary.org/b/isbn/9781426219696-L.jpg', 6, 3),
	('One Piece Vol. 4', 'La tripulacion de Luffy se fortalece para Grand Line', 11.99, 24, '978-84-679-0027-1', 1998, 'https://covers.openlibrary.org/b/isbn/9781421536262-L.jpg', 1, 5),
	('Dragon Ball Vol. 4', 'Goku sigue avanzando en el torneo de artes marciales', 12.99, 23, '978-84-679-0028-8', 1985, 'https://covers.openlibrary.org/b/isbn/9781569319246-L.jpg', 1, 1),
	('One Piece Vol. 5', 'La tripulacion enfrenta nuevos enemigos en alta mar', 11.99, 22, '978-84-679-0029-5', 1999, 'https://covers.openlibrary.org/b/isbn/9781421536279-L.jpg', 1, 5),
	('Shingeki no Kyojin Vol. 4', 'La estrategia de la legion se pone a prueba', 13.50, 16, '978-84-679-0030-1', 2011, 'https://covers.openlibrary.org/b/isbn/9781612622545-L.jpg', 1, 1),
	('Berserk Vol. 3', 'La marca del sacrificio persigue a Guts', 14.99, 11, '978-84-679-0031-8', 1991, 'https://covers.openlibrary.org/b/isbn/9781593070229-L.jpg', 2, 2),
	('Harry Potter y el Caliz de Fuego', 'El Torneo de los Tres Magos inicia en Hogwarts', 20.99, 31, '978-84-679-0032-5', 2000, 'https://covers.openlibrary.org/b/isbn/9780439139601-L.jpg', 3, 4),
	('Fundacion y Caos', 'Nuevos conflictos alrededor del destino de la Fundacion', 17.50, 15, '978-84-679-0033-2', 1998, 'https://covers.openlibrary.org/b/isbn/9780553573329-L.jpg', 4, 3),
	('Batman: The Killing Joke', 'Una historia clave del Joker y Batman', 21.99, 17, '978-84-679-0034-9', 1988, 'https://covers.openlibrary.org/b/isbn/9781401216672-L.jpg', 5, 2),
	('National Geographic Ciencia y Espacio', 'Edicion especial sobre astronomia y exploracion', 9.80, 37, '978-84-679-0035-6', 2024, 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1200&q=80', 6, 3);

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
	(9, 8),
	(16, 1),
	(17, 2), (27, 2),
	(18, 3),
	(19, 1),
	(20, 4),
	(21, 5),
	(22, 6),
	(23, 7),
	(24, 8),
	(28, 1),
	(29, 2),
	(30, 3),
	(31, 1),
	(32, 4),
	(33, 6),
	(34, 7);

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

-- Registros adicionales de usuarios/clientes
INSERT INTO usuario (username, password_hash, rol) VALUES
	('cliente3', crypt('cli123', gen_salt('bf', 10)), 'cliente'),
	('cliente4', crypt('cli123', gen_salt('bf', 10)), 'cliente'),
	('cliente5', crypt('cli123', gen_salt('bf', 10)), 'cliente'),
	('cliente6', crypt('cli123', gen_salt('bf', 10)), 'cliente');

INSERT INTO cliente (nombre, email, telefono, direccion, usuario_id) VALUES
	('Luis Hernandez', 'luis@email.com', '5555-5555', 'Zona 11, Guatemala', (SELECT id_usuario FROM usuario WHERE username = 'cliente3')),
	('Andrea Ruiz', 'andrea@email.com', '5555-6666', 'Zona 12, Guatemala', (SELECT id_usuario FROM usuario WHERE username = 'cliente4')),
	('Sofia Martinez', 'sofia@email.com', '5555-7778', 'Zona 13, Guatemala', (SELECT id_usuario FROM usuario WHERE username = 'cliente5')),
	('Miguel Castro', 'miguel@email.com', '5555-9999', 'Zona 16, Guatemala', (SELECT id_usuario FROM usuario WHERE username = 'cliente6'));

-- Ventas adicionales para poblar reportes e historial
INSERT INTO venta (cliente_id, empleado_id, fecha, total, estado) VALUES
	(5, NULL, '2024-09-15 18:00:00', 37.48, 'completada'),
	(6, 1, '2024-09-20 12:45:00', 25.98, 'completada'),
	(7, NULL, '2024-10-01 09:30:00', 47.97, 'completada'),
	(8, 1, '2024-10-08 16:20:00', 32.49, 'completada'),
	(5, NULL, '2024-10-20 20:10:00', 39.99, 'completada'),
	(6, 1, '2024-11-03 14:15:00', 54.99, 'completada');

INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
	(9, 16, 1, 12.99), (9, 17, 1, 11.99), (9, 24, 1, 12.50),
	(10, 1, 1, 12.99), (10, 2, 1, 12.99),
	(11, 23, 1, 22.50), (11, 18, 1, 13.50), (11, 19, 1, 11.97),
	(12, 25, 1, 9.50), (12, 26, 1, 9.20), (12, 24, 1, 13.79),
	(13, 20, 1, 20.99), (13, 12, 1, 19.00),
	(14, 8, 1, 24.99), (14, 27, 1, 30.00);
