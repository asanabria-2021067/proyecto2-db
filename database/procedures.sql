-- Procedimientos Almacenados - Proyecto 3

-- 1. sp_registrar_venta (Transacción explícita, manejo de excepciones e INOUT)
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
    IN p_cliente_id INT,
    IN p_empleado_id INT,
    IN p_detalle JSON, -- Formato: [{"id": 1, "cantidad": 2, "precio": 12.99}, ...]
    INOUT p_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_venta_id INT;
    v_total DECIMAL(10, 2) := 0;
    item JSON;
    v_stock_actual INT;
BEGIN
    -- Crear la venta
    INSERT INTO venta (cliente_id, empleado_id, fecha, total, estado)
    VALUES (p_cliente_id, p_empleado_id, NOW(), 0, 'completada')
    RETURNING id_venta INTO v_venta_id;

    -- Iterar sobre el JSON de detalles
    FOR item IN SELECT * FROM json_array_elements(p_detalle)
    LOOP
        -- Validar stock (bloqueando fila para actualización concurrente)
        SELECT stock INTO v_stock_actual FROM producto WHERE id_producto = (item->>'id')::INT FOR UPDATE;
        
        IF v_stock_actual < (item->>'cantidad')::INT THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto ID %', item->>'id';
        END IF;

        -- Insertar detalle
        INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
        VALUES (v_venta_id, (item->>'id')::INT, (item->>'cantidad')::INT, (item->>'precio')::DECIMAL);
        
        -- Actualizar stock
        UPDATE producto SET stock = stock - (item->>'cantidad')::INT WHERE id_producto = (item->>'id')::INT;
        
        -- Sumar al total
        v_total := v_total + ((item->>'cantidad')::INT * (item->>'precio')::DECIMAL);
    END LOOP;

    -- Actualizar el total final de la venta
    UPDATE venta SET total = v_total WHERE id_venta = v_venta_id;

    p_resultado := 'Venta registrada exitosamente con ID ' || v_venta_id;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := 'Error al registrar la venta: ' || SQLERRM;
        RAISE;
END;
$$;


-- 2. sp_registrar_compra_proveedor
CREATE OR REPLACE PROCEDURE sp_registrar_compra_proveedor(
    IN p_proveedor_id INT,
    IN p_detalle JSON, -- Formato: [{"id": 1, "cantidad": 10, "precio": 5.00}, ...]
    INOUT p_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_compra_id INT;
    v_total DECIMAL(10, 2) := 0;
    item JSON;
BEGIN
    INSERT INTO compra_proveedor (proveedor_id, fecha, total, estado)
    VALUES (p_proveedor_id, NOW(), 0, 'completada')
    RETURNING id_compra INTO v_compra_id;

    FOR item IN SELECT * FROM json_array_elements(p_detalle)
    LOOP
        INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario)
        VALUES (v_compra_id, (item->>'id')::INT, (item->>'cantidad')::INT, (item->>'precio')::DECIMAL);
        
        -- Aumentar stock
        UPDATE producto SET stock = stock + (item->>'cantidad')::INT WHERE id_producto = (item->>'id')::INT;
        
        v_total := v_total + ((item->>'cantidad')::INT * (item->>'precio')::DECIMAL);
    END LOOP;

    UPDATE compra_proveedor SET total = v_total WHERE id_compra = v_compra_id;

    p_resultado := 'Compra registrada exitosamente con ID ' || v_compra_id;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := 'Error al registrar la compra: ' || SQLERRM;
        RAISE;
END;
$$;


-- 3. sp_actualizar_stock
CREATE OR REPLACE PROCEDURE sp_actualizar_stock(
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_operacion VARCHAR, -- 'AUMENTAR' o 'DISMINUIR'
    INOUT p_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_actual INT;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
    END IF;

    SELECT stock INTO v_stock_actual FROM producto WHERE id_producto = p_producto_id FOR UPDATE;
    
    IF v_stock_actual IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado';
    END IF;

    IF p_operacion = 'DISMINUIR' AND v_stock_actual < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para disminuir';
    END IF;

    IF p_operacion = 'AUMENTAR' THEN
        UPDATE producto SET stock = stock + p_cantidad WHERE id_producto = p_producto_id;
    ELSIF p_operacion = 'DISMINUIR' THEN
        UPDATE producto SET stock = stock - p_cantidad WHERE id_producto = p_producto_id;
    ELSE
        RAISE EXCEPTION 'Operación no válida. Use AUMENTAR o DISMINUIR';
    END IF;

    p_resultado := 'Stock actualizado exitosamente para el producto ' || p_producto_id;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := 'Error: ' || SQLERRM;
        RAISE;
END;
$$;


-- 4. sp_reporte_ventas_periodo
CREATE OR REPLACE PROCEDURE sp_reporte_ventas_periodo(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    INOUT p_resultado JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::JSON) INTO p_resultado
    FROM (
        SELECT p.id_producto, p.titulo, SUM(dv.cantidad) as total_vendido, SUM(dv.cantidad * dv.precio_unitario) as ingresos
        FROM detalle_venta dv
        JOIN venta v ON dv.venta_id = v.id_venta
        JOIN producto p ON dv.producto_id = p.id_producto
        WHERE DATE(v.fecha) >= p_fecha_inicio AND DATE(v.fecha) <= p_fecha_fin
        GROUP BY p.id_producto, p.titulo
        ORDER BY ingresos DESC
    ) t;
END;
$$;


-- 5. sp_crear_cliente
CREATE OR REPLACE PROCEDURE sp_crear_cliente(
    IN p_nombre VARCHAR,
    IN p_email VARCHAR,
    IN p_telefono VARCHAR,
    IN p_direccion TEXT,
    IN p_usuario_id INT,
    INOUT p_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM cliente WHERE email = p_email) THEN
        RAISE EXCEPTION 'El email ya está registrado para otro cliente';
    END IF;

    IF p_usuario_id IS NOT NULL AND EXISTS (SELECT 1 FROM cliente WHERE usuario_id = p_usuario_id) THEN
        RAISE EXCEPTION 'El usuario ya tiene un cliente asociado';
    END IF;

    INSERT INTO cliente (nombre, email, telefono, direccion, usuario_id)
    VALUES (p_nombre, p_email, p_telefono, p_direccion, p_usuario_id);

    p_resultado := 'Cliente creado exitosamente';
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := 'Error al crear cliente: ' || SQLERRM;
        RAISE;
END;
$$;
