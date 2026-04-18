# Tienda de Libros y Mangas

Aplicacion web fullstack para gestionar inventario y ventas de una tienda de libros y mangas.

## Stack

- **Frontend:** Vue 3 + TypeScript + Vite
- **Backend:** Express + TypeScript
- **Base de datos:** PostgreSQL 16
- **Contenedores:** Docker + docker-compose

## Requisitos

- Docker y docker-compose instalados

## Levantar el proyecto

```bash
docker compose up --build
```

Esto levanta 3 servicios:

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| db | 5432 | PostgreSQL con esquema y datos seed |
| backend | 3000 | API REST Express |
| frontend | 5173 | Aplicacion Vue 3 |

Abrir http://localhost:5173 en el navegador.

## Variables de entorno

```
POSTGRES_USER=proy2
POSTGRES_PASSWORD=secret
POSTGRES_DB=tienda_libros
JWT_SECRET=mi_secreto_jwt_super_seguro_2024
```

Estas variables ya estan configuradas en `docker-compose.yaml`.

## Usuarios de prueba

| Usuario | Password | Rol |
|---------|----------|-----|
| admin | admin123 | admin |
| vendedor1 | vend123 | vendedor |
| cliente1 | cli123 | cliente |

## Funcionalidades

- Login/logout con JWT y roles (admin, vendedor, cliente)
- CRUD completo de Productos y Clientes
- Registro de ventas con transaccion explicita (BEGIN/COMMIT/ROLLBACK)
- Dashboard con reportes: top productos, ventas por mes, stock bajo
- Catalogo publico de productos con busqueda y filtros
- Exportar reporte de ventas a CSV
- Vista (VIEW) `vista_producto_completo` usada por el backend
- Consultas con JOINs, subqueries, GROUP BY/HAVING, y CTE
