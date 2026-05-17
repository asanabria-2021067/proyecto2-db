-- Creación de roles y asignación de permisos - Proyecto 3

-- Limpieza de roles si existen
DROP ROLE IF EXISTS rol_admin;
DROP ROLE IF EXISTS rol_gerente;
DROP ROLE IF EXISTS rol_vendedor;
DROP ROLE IF EXISTS rol_bodeguero;
DROP ROLE IF EXISTS rol_cliente;

-- Creación de roles
CREATE ROLE rol_admin;
CREATE ROLE rol_gerente;
CREATE ROLE rol_vendedor;
CREATE ROLE rol_bodeguero;
CREATE ROLE rol_cliente;

-- Revocar accesos por defecto al schema public (para no permitir accesos no explícitos)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

-- Permisos globales para los roles (acceso al schema)
GRANT USAGE ON SCHEMA public TO rol_admin, rol_gerente, rol_vendedor, rol_bodeguero, rol_cliente;

-- 1. rol_admin: Administrador total
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

-- 2. rol_gerente: SELECT en todo, INSERT/UPDATE en producto, venta, compra_proveedor
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_gerente;
GRANT INSERT, UPDATE ON producto, venta, compra_proveedor TO rol_gerente;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE producto_id_producto_seq, venta_id_venta_seq, compra_proveedor_id_compra_seq TO rol_gerente;

-- 3. rol_vendedor: SELECT en producto/cliente/categoria, INSERT en venta/detalle_venta
GRANT SELECT ON producto, cliente, categoria TO rol_vendedor;
GRANT INSERT ON venta, detalle_venta TO rol_vendedor;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE venta_id_venta_seq, detalle_venta_id_detalle_seq TO rol_vendedor;

-- 4. rol_bodeguero: SELECT/UPDATE en producto (stock), SELECT/INSERT en compra_proveedor/detalle_compra
GRANT SELECT ON producto, compra_proveedor, detalle_compra TO rol_bodeguero;
GRANT UPDATE (stock) ON producto TO rol_bodeguero;
GRANT INSERT ON compra_proveedor, detalle_compra TO rol_bodeguero;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE compra_proveedor_id_compra_seq, detalle_compra_id_detalle_seq TO rol_bodeguero;

-- 5. rol_cliente: SELECT en producto/categoria/editorial/autor, INSERT en venta/detalle_venta
GRANT SELECT ON producto, categoria, editorial, autor TO rol_cliente;
GRANT INSERT ON venta, detalle_venta TO rol_cliente;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE venta_id_venta_seq, detalle_venta_id_detalle_seq TO rol_cliente;

-- Asignar los roles creados al usuario de la aplicación 'proy3' 
-- Esto le permite a proy3 hacer SET ROLE a cualquiera de estos
GRANT rol_admin, rol_gerente, rol_vendedor, rol_bodeguero, rol_cliente TO proy3;
