# Tienda de Libros y Mangas

> **Proyecto 3 — CC3088 Bases de Datos 1, UVG, Ciclo 1 2026.**  
> La rama de entrega es `proyecto-3`. El Proyecto 2 se encuentra en la rama `proyecto-2-web`.

Aplicación web fullstack para gestionar inventario y ventas de una tienda de libros y mangas.  
El Proyecto 3 extiende el P2 agregando: **5 roles a nivel DBMS**, **5 stored procedures**, **ORM con Prisma** y **autenticación con control de acceso por rol**.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 + TypeScript (Composition API) + Vite |
| Estilos | TailwindCSS + shadcn-vue |
| Backend | Express + TypeScript + Node.js |
| ORM | **Prisma** (nuevo en P3) |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker + docker-compose |

---

## Requisitos Previos

- **Docker Desktop** (versión 20.10 o superior)
- **Docker Compose** (incluido con Docker Desktop)
- **Git**

```bash
docker --version
docker compose version
```

---

## Instalación y Configuración

### 1. Clonar el repositorio y cambiar a rama del proyecto

```bash
git clone <url-del-repositorio>
cd proyecto2-db
git checkout proyecto-3
```

### 2. Levantar el proyecto

Si ya levantaste el proyecto antes, primero limpia los volúmenes:

```bash
docker compose down -v
```

Luego, levanta todos los servicios:

```bash
docker compose up --build
```

Este comando:
1. Construye las imágenes de frontend y backend
2. Levanta el contenedor PostgreSQL
3. Ejecuta `01-ddl.sql` → `roles.sql` → `procedures.sql` → `02-seed.sql`
4. Levanta la API REST backend
5. Levanta la aplicación Vue frontend

**Tiempo estimado:** 2–3 minutos en primera ejecución.

### 3. Acceder a la aplicación

```
Frontend:   http://localhost:5173
Backend API: http://localhost:3000/api
Base de datos: localhost:5432
```

---

## Variables de Entorno

```env
POSTGRES_USER=proy3
POSTGRES_PASSWORD=secret
POSTGRES_DB=tienda_libros
JWT_SECRET=a58357173f277af9328127d173d9efe57d8c91f0efdcab66b7a4158af776ac61ca985e7b696ed7ab5c9e8b536a3efbd1f0dae3f05078fe8e14c22192ee12d68d
```

El JWT_SECRET usa 512 bits de entropía criptográfica para evitar ataques de diccionario y fuerza bruta sobre los tokens.

---

## Usuarios de Prueba (un usuario por cada rol)

| Usuario | Password | Rol | Descripción |
|---------|----------|-----|-------------|
| **admin** | admin123 | admin | Acceso total al sistema |
| **gerente1** | ger123 | gerente | Reportes, productos, ventas y compras |
| **vendedor1** | vend123 | vendedor | Ventas y clientes |
| **bodeguero1** | bod123 | bodeguero | Inventario y compras a proveedores |
| **cliente1** | cli123 | cliente | Catálogo, carrito y mis compras |

---

## Seguridad y Roles (Proyecto 3)

### Roles en el DBMS (CREATE ROLE)

Se crean 5 roles directamente en PostgreSQL mediante `database/roles.sql`. Cada rol tiene permisos granulares via `GRANT`/`REVOKE`:

| Rol DBMS | Tablas accesibles | Operaciones permitidas |
|---|---|---|
| `rol_admin` | **Todas las tablas** | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `rol_gerente` | Todas las tablas | `SELECT` en todo; `INSERT`, `UPDATE` en `producto`, `venta`, `compra_proveedor` |
| `rol_vendedor` | `producto`, `cliente`, `categoria` | `SELECT`; `INSERT` en `venta`, `detalle_venta` |
| `rol_bodeguero` | `producto`, `compra_proveedor`, `detalle_compra` | `SELECT`; `UPDATE (stock)` en `producto`; `INSERT` en compras |
| `rol_cliente` | `producto`, `categoria`, `editorial`, `autor` | `SELECT`; `INSERT` en `venta`, `detalle_venta` |

Los roles se crean con:
```sql
CREATE ROLE rol_admin;
CREATE ROLE rol_gerente;
CREATE ROLE rol_vendedor;
CREATE ROLE rol_bodeguero;
CREATE ROLE rol_cliente;
```

### Rutas Protegidas por Rol (Frontend + Backend)

| Ruta | Roles con acceso |
|------|-----------------|
| `/dashboard` | admin, gerente, vendedor |
| `/productos` | admin, gerente, bodeguero |
| `/clientes` | admin, vendedor |
| `/ventas` | admin, vendedor, gerente |
| `/compras` | admin, gerente, bodeguero |
| `/reportes/*` | admin, vendedor, gerente |
| `/catalogo` | Todos (incluyendo sin login) |
| `/carrito` | cliente |
| `/mis-compras` | cliente |

El backend valida el rol en cada endpoint mediante el middleware `roleGuard(...)`. El frontend oculta los links de navegación y redirige al rol correspondiente si intenta acceder a una ruta no autorizada.

---

## Stored Procedures (Proyecto 3)

Definidos en `database/procedures.sql`, invocados desde rutas Express vía `CALL sp_nombre(...)`:

| SP | Ruta que lo invoca | Parámetros OUT | Transacción |
|----|--------------------|----------------|-------------|
| `sp_registrar_venta(cliente_id, empleado_id, detalle JSON, INOUT resultado)` | `POST /api/ventas/sp` | ✅ `INOUT p_resultado TEXT` | ✅ ROLLBACK en EXCEPTION |
| `sp_registrar_compra_proveedor(proveedor_id, detalle JSON, INOUT resultado)` | `POST /api/compras/sp` | ✅ `INOUT p_resultado TEXT` | ✅ ROLLBACK en EXCEPTION |
| `sp_actualizar_stock(producto_id, cantidad, operacion, INOUT resultado)` | `POST /api/productos/:id/stock` | ✅ `INOUT p_resultado TEXT` | ✅ ROLLBACK en EXCEPTION |
| `sp_reporte_ventas_periodo(fecha_inicio, fecha_fin, INOUT resultado JSON)` | `GET /api/reportes/ventas-periodo` | ✅ `INOUT p_resultado JSON` | — |
| `sp_crear_cliente(nombre, email, tel, dir, usuario_id, INOUT resultado)` | `POST /api/clientes/sp` | ✅ `INOUT p_resultado TEXT` | ✅ ROLLBACK en EXCEPTION |

Todos los SPs usan parámetros `INOUT` y manejan excepciones con `EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;`.

---

## ORM con Prisma (Proyecto 3)

Se usa **Prisma** para al menos 3 operaciones CRUD:

| Módulo | Archivo | Operaciones Prisma |
|--------|---------|-------------------|
| **Productos** | `producto.routes.ts` | `findMany` con filtros (search, categoria), `findUnique` |
| **Categorías** | `categoria.routes.ts` | `findMany`, `create`, `update`, `delete` |
| **Usuarios** | `usuario.routes.ts` | `findMany`, `findUnique`, `create`, `update`, `delete` |

Las consultas avanzadas (reportes, JOINs complejos, SPs) usan `pg` raw SQL.

---

## Arquitectura de Servicios

```
frontend → backend → db-init → db
```

| Servicio | Puerto | Descripción |
|---------|--------|-------------|
| `db` | 5432 | PostgreSQL 16 |
| `db-init` | — | Ejecuta DDL → roles → procedures → seed |
| `backend` | 3000 | API REST Express + TypeScript + Prisma |
| `frontend` | 5173 | Vue 3 + Vite |

---

## Troubleshooting

### Error: "role proy3 does not exist" o similar

```bash
docker compose down -v
docker compose up --build
```

### Error: "Port 5432 is already in use"

```bash
# Windows
net stop postgresql-x64-16
# o cambiar puerto en docker-compose.yaml a 5433:5432
```

### Frontend en blanco

```bash
docker compose build --no-cache
docker compose up
```

---

## Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Reinicio completo con borrado de datos
docker compose down -v && docker compose up --build

# Conectar a la base de datos
docker compose exec db psql -U proy3 -d tienda_libros

# Verificar roles creados en PostgreSQL
docker compose exec db psql -U proy3 -d tienda_libros -c "\du"

# Verificar stored procedures
docker compose exec db psql -U proy3 -d tienda_libros -c "\df sp_*"
```

---

## Estructura del Proyecto

```
proyecto2-db/
├── backend/
│   ├── src/
│   │   ├── config/         # db.ts (pg pool), prisma.ts (Prisma client)
│   │   ├── middleware/     # auth.ts (JWT + roleGuard)
│   │   ├── routes/         # Endpoints API (auth, productos, ventas, etc.)
│   │   └── queries/        # SQL raw queries
│   ├── prisma/
│   │   └── schema.prisma   # Mapeo ORM del esquema
│   ├── index.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, UI components
│   │   ├── views/          # Páginas por módulo
│   │   ├── router/         # Rutas protegidas por rol
│   │   ├── stores/         # auth.store.ts (Pinia)
│   │   └── services/       # api.ts (axios)
│   └── Dockerfile
├── database/
│   ├── 01-ddl.sql          # Esquema de tablas
│   ├── roles.sql           # CREATE ROLE + GRANT/REVOKE (P3)
│   ├── procedures.sql      # 5 Stored Procedures (P3)
│   └── 02-seed.sql         # Datos + 5 usuarios de prueba
├── docker-compose.yaml
├── .env.example
└── README.md
```

---

## Documentación Adicional

- [Modelo relacional y normalización (3FN)](assets/docs/modelo_relacional_normalizacion.md)
- [Diagrama ER](assets/img/der%20completo%20bases%20de%20datos%20proyecto%202.png)
