# Modelo Relacional y Normalizacion - Tienda de Libros y Mangas

## 1. Esquema Relacional

Notacion: **PK** = Primary Key, **FK** = Foreign Key, **NN** = NOT NULL, **UQ** = UNIQUE

```
usuario(id_usuario (PK), username (NN, UQ), password_hash (NN), rol (NN), created_at)

categoria(id_categoria (PK), nombre (NN), tipo (NN), descripcion)

editorial(id_editorial (PK), nombre (NN), pais, sitio_web)

autor(id_autor (PK), nombre (NN), nacionalidad, fecha_nacimiento)

producto(id_producto (PK), titulo (NN), descripcion, precio (NN), stock (NN),
         isbn (UQ), anio_publicacion, imagen_url,
         categoria_id (NN, FK -> categoria.id_categoria),
         editorial_id (NN, FK -> editorial.id_editorial), created_at)

producto_autor(producto_id (PK, FK -> producto.id_producto),
               autor_id (PK, FK -> autor.id_autor))

proveedor(id_proveedor (PK), nombre (NN), contacto, telefono, email, direccion)

compra_proveedor(id_compra (PK), proveedor_id (NN, FK -> proveedor.id_proveedor),
                 fecha, total (NN), estado)

detalle_compra(id_detalle (PK), compra_id (NN, FK -> compra_proveedor.id_compra),
               producto_id (NN, FK -> producto.id_producto),
               cantidad (NN), precio_unitario (NN))

cliente(id_cliente (PK), nombre (NN), email, telefono, direccion,
        usuario_id (UQ, FK -> usuario.id_usuario), created_at)

empleado(id_empleado (PK), nombre (NN), cargo, telefono, email,
         usuario_id (UQ, FK -> usuario.id_usuario), created_at)

venta(id_venta (PK), cliente_id (NN, FK -> cliente.id_cliente),
      empleado_id (FK -> empleado.id_empleado), fecha, total (NN), estado)

detalle_venta(id_detalle (PK), venta_id (NN, FK -> venta.id_venta),
              producto_id (NN, FK -> producto.id_producto),
              cantidad (NN), precio_unitario (NN))
```

---

## 2. Dependencias Funcionales

### usuario
- id_usuario -> username, password_hash, rol, created_at
- username -> id_usuario (candidata)

### categoria
- id_categoria -> nombre, tipo, descripcion

### editorial
- id_editorial -> nombre, pais, sitio_web

### autor
- id_autor -> nombre, nacionalidad, fecha_nacimiento

### producto
- id_producto -> titulo, descripcion, precio, stock, isbn, anio_publicacion, imagen_url, categoria_id, editorial_id, created_at
- isbn -> id_producto (candidata)

### producto_autor
- (producto_id, autor_id) -> {} (relacion pura N:M, sin atributos adicionales)

### proveedor
- id_proveedor -> nombre, contacto, telefono, email, direccion

### compra_proveedor
- id_compra -> proveedor_id, fecha, total, estado

### detalle_compra
- id_detalle -> compra_id, producto_id, cantidad, precio_unitario

### cliente
- id_cliente -> nombre, email, telefono, direccion, usuario_id, created_at
- usuario_id -> id_cliente (candidata, relacion 1:1 parcial)

### empleado
- id_empleado -> nombre, cargo, telefono, email, usuario_id, created_at
- usuario_id -> id_empleado (candidata, relacion 1:1 parcial)

### venta
- id_venta -> cliente_id, empleado_id, fecha, total, estado

### detalle_venta
- id_detalle -> venta_id, producto_id, cantidad, precio_unitario

---

## 3. Justificacion de Normalizacion

### 3.1 Primera Forma Normal (1FN)

**Requisitos:** Todos los atributos son atomicos, no hay grupos repetitivos, cada tabla tiene clave primaria.

**Cumplimiento por tabla:**

| Tabla | Atomicidad | Sin repeticion | PK definida |
|-------|-----------|----------------|-------------|
| usuario | Todos los campos son escalares | No hay arrays/listas | id_usuario SERIAL |
| categoria | nombre, tipo, descripcion son escalares | Sin grupos | id_categoria SERIAL |
| editorial | nombre, pais, sitio_web son escalares | Sin grupos | id_editorial SERIAL |
| autor | nombre, nacionalidad, fecha son escalares | Sin grupos | id_autor SERIAL |
| producto | Todos escalares. Autores NO estan en producto (estan en tabla aparte) | Sin grupos | id_producto SERIAL |
| producto_autor | Solo IDs, relacion N:M separada | Sin grupos | (producto_id, autor_id) compuesta |
| proveedor | Todos escalares | Sin grupos | id_proveedor SERIAL |
| compra_proveedor | Todos escalares | Sin grupos | id_compra SERIAL |
| detalle_compra | Todos escalares | Sin grupos | id_detalle SERIAL |
| cliente | Todos escalares | Sin grupos | id_cliente SERIAL |
| empleado | Todos escalares | Sin grupos | id_empleado SERIAL |
| venta | Todos escalares | Sin grupos | id_venta SERIAL |
| detalle_venta | Todos escalares | Sin grupos | id_detalle SERIAL |

**Conclusion:** Todas las tablas cumplen 1FN. No hay atributos multivaluados (la relacion producto-autor se resolvio con tabla intermedia producto_autor).

---

### 3.2 Segunda Forma Normal (2FN)

**Requisitos:** Cumple 1FN + no existen dependencias parciales (ningun atributo no-clave depende de solo una parte de la clave primaria).

**Analisis:**

- **Tablas con PK simple (SERIAL):** usuario, categoria, editorial, autor, producto, proveedor, compra_proveedor, detalle_compra, cliente, empleado, venta, detalle_venta. En estas tablas, al tener PK simple, es imposible tener dependencias parciales. **Cumplen 2FN automaticamente.**

- **Tabla con PK compuesta:** `producto_autor(producto_id, autor_id)`. Esta tabla NO tiene atributos adicionales fuera de la PK compuesta. No hay atributos no-clave que puedan depender parcialmente. **Cumple 2FN.**

**Conclusion:** Todas las tablas cumplen 2FN.

---

### 3.3 Tercera Forma Normal (3FN)

**Requisitos:** Cumple 2FN + no existen dependencias transitivas (ningun atributo no-clave depende de otro atributo no-clave).

**Analisis por tabla:**

| Tabla | Posible dependencia transitiva | Resultado |
|-------|-------------------------------|-----------|
| usuario | rol no depende de username, depende de id_usuario | OK |
| categoria | tipo no determina nombre ni viceversa | OK |
| editorial | pais no determina nombre | OK |
| autor | nacionalidad no determina nombre | OK |
| producto | categoria_id y editorial_id son FK, no transitivas (los nombres de categoria/editorial estan en sus propias tablas) | OK |
| proveedor | email no determina nombre (distintos proveedores pueden cambiar email) | OK |
| compra_proveedor | total no depende de proveedor_id (depende del detalle) | OK |
| detalle_compra | precio_unitario no depende de producto_id transitivamente (es el precio al momento de la compra, no el precio actual del producto) | OK |
| cliente | email no determina nombre | OK |
| empleado | cargo no determina nombre | OK |
| venta | total no depende de cliente_id | OK |
| detalle_venta | precio_unitario es historico, no derivado de producto | OK |

**Decisiones de diseno que garantizan 3FN:**

1. **Separacion categoria/editorial de producto:** El nombre de la categoria no esta en la tabla producto, solo el FK `categoria_id`. Evita dependencia transitiva `id_producto -> categoria_id -> nombre_categoria`.

2. **Tabla producto_autor:** Los autores no estan como atributo de producto. La relacion N:M se resuelve con tabla intermedia.

3. **precio_unitario en detalle_compra/detalle_venta:** Se almacena el precio historico al momento de la transaccion, independiente del precio actual en tabla producto. No es dato derivado.

4. **usuario separado de cliente/empleado:** Datos de autenticacion (username, hash) separados de datos de negocio (nombre, telefono, direccion). Evita mezclar dominios funcionales.

**Conclusion:** Todas las tablas cumplen 3FN. No hay dependencias transitivas.

---

## 4. Resumen

| Forma Normal | Estado | Justificacion |
|-------------|--------|---------------|
| 1FN | CUMPLE | Atributos atomicos, PKs definidas, sin grupos repetitivos |
| 2FN | CUMPLE | PKs simples (SERIAL) eliminan dependencias parciales. La unica PK compuesta (producto_autor) no tiene atributos extra |
| 3FN | CUMPLE | FKs apuntan a tablas separadas. Precios historicos. Sin dependencias transitivas |
