# CLAUDE.md — Tienda de Libros y Mangas (CC3088 Proyecto 2)

## Contexto del proyecto

Aplicacion web fullstack para gestionar inventario y ventas de una tienda de libros y mangas. Funciona como tienda virtual (clientes compran online) y dashboard admin (empleados gestionan inventario, ventas, reportes). Es un proyecto academico individual de la clase CC3088 Bases de Datos 1 en UVG.

## Stack tecnologico

- **Frontend:** Vue.js 3 + TypeScript (Composition API, `<script setup>`)
- **Backend:** Express.js + TypeScript
- **Base de datos:** PostgreSQL (usar libreria `pg` con queries SQL raw, NO usar ORMs como Prisma o TypeORM)
- **HTTP client:** Axios en frontend
- **Contenedores:** Docker + docker-compose (ya configurados)
- **Monorepo:** `/frontend` y `/backend` en la raiz

## Credenciales fijas (OBLIGATORIO)

```
POSTGRES_USER=proy2
POSTGRES_PASSWORD=secret
POSTGRES_DB=tienda_libros
```

El archivo `.env.example` debe tener estas variables. Si se usan credenciales distintas, el proyecto NO se califica.

## Esquema de base de datos

14 tablas. El DDL esta en `database/ddl.sql`. Resumen de entidades:

- `usuario` — autenticacion (username, password_hash, rol: admin|vendedor|cliente)
- `categoria` — clasificacion de productos (tipo: LIBRO|MANGA|REVISTA|COMIC)
- `editorial` — casas editoriales
- `autor` — autores de productos
- `producto` — libros/mangas con precio, stock, isbn
- `producto_autor` — tabla puente N:M entre producto y autor
- `proveedor` — proveedores de mercaderia
- `compra_proveedor` — compras a proveedores (cabecera)
- `detalle_compra` — lineas de cada compra a proveedor
- `cliente` — clientes con usuario_id opcional (FK → usuario)
- `empleado` — empleados con usuario_id opcional (FK → usuario)
- `venta` — ventas (cabecera), empleado_id es nullable (ventas web no tienen empleado)
- `detalle_venta` — lineas de cada venta

## Requisitos criticos de la rubrica

### I. SQL — Todas las queries DEBEN ejecutarse desde la app web, NO como scripts sueltos

**3 consultas con JOIN entre multiples tablas (10 pts):**
1. Listar productos con nombre de categoria, editorial y autores (producto + categoria + editorial + producto_autor + autor)
2. Listar ventas con nombre del cliente y empleado que atendio (venta + cliente + empleado)
3. Listar detalle de una compra con nombre del proveedor y productos (compra_proveedor + proveedor + detalle_compra + producto)

**2 consultas con subquery (10 pts):**
1. Productos que nunca se han vendido (NOT EXISTS con detalle_venta)
2. Clientes que han gastado mas que el promedio general (subquery en WHERE con AVG)

**Consultas con GROUP BY, HAVING y funciones de agregacion (8 pts):**
- Top 10 productos mas vendidos (SUM cantidad, GROUP BY producto, HAVING cantidad > X)
- Ventas totales por mes (SUM total, GROUP BY mes)
- Categorias con mas de N productos (COUNT, GROUP BY, HAVING)

**Al menos 1 consulta con CTE — WITH (5 pts):**
- Ranking de clientes por total gastado usando CTE

**Al menos 1 VIEW usado por el backend (5 pts):**
- CREATE VIEW vista_producto_completo que une producto + categoria + editorial + autores
- El backend debe hacer SELECT * FROM vista_producto_completo para alimentar la UI

**Al menos 1 transaccion explicita con ROLLBACK (12 pts):**
- Al registrar una venta: BEGIN → insertar venta → insertar detalle_venta (loop) → actualizar stock de cada producto → si stock < 0, ROLLBACK → si todo ok, COMMIT
- Debe estar marcado explicitamente en el codigo con BEGIN/COMMIT/ROLLBACK
- DEBE manejar errores (try/catch que haga ROLLBACK)

### II. Aplicacion web

**CRUD completo de al menos 2 entidades (15 pts):**
- CRUD de Productos (crear, leer, editar, eliminar)
- CRUD de Clientes (crear, leer, editar, eliminar)
- Bonus: CRUD de Categorias, Editoriales, Proveedores, Empleados

**Al menos 1 reporte visible en la UI (10 pts):**
- Dashboard con: top productos vendidos, ventas por mes (grafico), stock bajo
- Los datos deben venir de queries reales a la BD

**Manejo visible de errores (5 pts):**
- Validaciones en formularios (campos requeridos, precio > 0, stock >= 0)
- Mensajes de error visibles cuando falla una operacion (toast/alert)
- Manejar errores del backend (try/catch en API calls)

**README funcional (5 pts):**
- Instrucciones claras para levantar con `docker compose up`
- Variables de entorno documentadas
- Ejemplo de uso

### III. Avanzado

**Autenticacion login/logout con sesion (10 pts):**
- Login con username/password
- Hashear passwords con bcrypt
- Sesiones con JWT (jsonwebtoken)
- Middleware de autenticacion en Express
- Roles: admin ve todo, vendedor solo ventas/inventario, cliente solo puede comprar y ver su historial
- Logout que invalide el token en el frontend

**Exportar reporte a CSV o PDF (5 pts):**
- Boton en la UI para exportar el reporte de ventas a CSV
- Usar json2csv o similar en el backend, o generar CSV en el frontend

## Estructura esperada del backend

```
backend/
  src/
    index.ts              — entry point, Express app setup
    config/
      db.ts               — pool de conexion pg, usar variables de entorno
    middleware/
      auth.ts             — middleware JWT, verificar token, extraer rol
    routes/
      auth.routes.ts      — POST /login, POST /register, POST /logout
      producto.routes.ts  — CRUD /api/productos
      cliente.routes.ts   — CRUD /api/clientes
      venta.routes.ts     — POST /api/ventas (con transaccion), GET /api/ventas
      categoria.routes.ts
      editorial.routes.ts
      autor.routes.ts
      proveedor.routes.ts
      compra.routes.ts
      reporte.routes.ts   — GET /api/reportes/ventas-por-mes, top-productos, etc.
      export.routes.ts    — GET /api/export/ventas-csv
    queries/              — archivos con las queries SQL raw como strings
      producto.queries.ts
      venta.queries.ts
      reporte.queries.ts
      ...
```

## Estructura esperada del frontend

```
frontend/
  src/
    App.vue
    main.ts
    router/
      index.ts            — Vue Router con rutas protegidas por rol
    stores/               — Pinia stores
      auth.store.ts       — estado de autenticacion, token JWT
    views/
      LoginView.vue
      DashboardView.vue   — reportes y metricas
      ProductosView.vue   — tabla con CRUD
      ClientesView.vue    — tabla con CRUD
      VentasView.vue      — lista de ventas + formulario nueva venta
      CatalogoView.vue    — vista publica para clientes (tienda virtual)
    components/
      Navbar.vue
      ProductoForm.vue
      VentaForm.vue
      ReporteVentas.vue
      ...
    services/
      api.ts              — instancia de Axios con baseURL y interceptor para JWT
      producto.service.ts
      venta.service.ts
      auth.service.ts
      ...
```

## Convenio de codigo

- SQL: queries en UPPERCASE (`SELECT`, `INSERT`, `WHERE`), tab indentation, PostgreSQL syntax
- TypeScript: usar tipos estrictos, interfaces para entidades de BD
- Todas las queries SQL deben estar como strings en archivos `.queries.ts`, NO en los handlers directamente
- Usar `pool.query()` de `pg`, NUNCA un ORM
- Transacciones: obtener client con `pool.connect()`, usar `client.query('BEGIN')`, `client.query('COMMIT')`, `client.query('ROLLBACK')` en el catch
- Passwords: hashear con bcrypt (bcryptjs)
- JWT: firmar con jsonwebtoken, secret en variable de entorno

## Ejemplo de transaccion (CRITICO — 12 pts)

```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');

  const ventaResult = await client.query(
    'INSERT INTO venta (cliente_id, empleado_id, fecha, total, estado) VALUES ($1, $2, NOW(), $3, $4) RETURNING id_venta',
    [clienteId, empleadoId, total, 'completada']
  );
  const ventaId = ventaResult.rows[0].id_venta;

  for (const item of items) {
    await client.query(
      'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
      [ventaId, item.productoId, item.cantidad, item.precioUnitario]
    );

    const stockResult = await client.query(
      'UPDATE producto SET stock = stock - $1 WHERE id_producto = $2 RETURNING stock',
      [item.cantidad, item.productoId]
    );

    if (stockResult.rows[0].stock < 0) {
      throw new Error(`Stock insuficiente para producto ${item.productoId}`);
    }
  }

  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Ejemplo de VIEW (CRITICO — 5 pts)

Definir en el DDL:
```sql
CREATE VIEW vista_producto_completo AS
SELECT
  p.id_producto,
  p.titulo,
  p.precio,
  p.stock,
  p.isbn,
  p.anio_publicacion,
  c.nombre AS categoria,
  c.tipo,
  e.nombre AS editorial,
  STRING_AGG(a.nombre, ', ') AS autores
FROM producto p
JOIN categoria c ON p.categoria_id = c.id_categoria
JOIN editorial e ON p.editorial_id = e.id_editorial
LEFT JOIN producto_autor pa ON p.id_producto = pa.producto_id
LEFT JOIN autor a ON pa.autor_id = a.id_autor
GROUP BY p.id_producto, c.nombre, c.tipo, e.nombre;
```

Luego en el backend: `SELECT * FROM vista_producto_completo`

## OUTPUT

- Respuestas sin comentarios innecesarios ni decoraciones
- Codigo limpio y conciso
- Si se edita un archivo, mostrar solo el cambio relevante
- Preferir español para nombres de variables de dominio (clienteId, ventaId) pero ingles para infraestructura (middleware, routes, config)