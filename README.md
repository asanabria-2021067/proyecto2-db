# Tienda de Libros y Mangas

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/asanabria-2021067/proyecto2-db)

Aplicacion web fullstack para gestionar inventario y ventas de una tienda de libros y mangas.

## Stack Tecnologico

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS v4 + shadcn/ui + Recharts
- **Backend:** Express 5 + TypeScript + Node.js
- **Base de datos:** PostgreSQL 16
- **Contenedores:** Docker + docker-compose
- **Animaciones:** GSAP + Framer Motion
- **Notificaciones:** SweetAlert2
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint con typescript-eslint

> **Nota sobre la migracion:** El profesor Erick indico que se podia mantener el stack original con Vue, sin embargo se opto por migrar a React para poner en practica los hooks de React (`useState`, `useEffect`, `useReducer`, `useMemo`, `useCallback`) como parte de los requerimientos del curso cc3062.

## Requisitos Previos

Antes de comenzar, asegurate de tener instalado:

- **Docker Desktop** (version 20.10 o superior)
  - [Descargar para Windows](https://www.docker.com/products/docker-desktop)
  - [Descargar para Mac](https://www.docker.com/products/docker-desktop)
  - [Descargar para Linux](https://docs.docker.com/desktop/install/linux-install/)
- **Docker Compose** (incluido con Docker Desktop)
- **Git** (para clonar el repositorio)

Verificar instalacion:
```bash
docker --version
docker compose version
```

## Instalacion y Configuracion

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto2-db
```

### 2. Configurar variables de entorno (Opcional)

El proyecto ya incluye todas las variables necesarias en `docker-compose.yaml` y `.env.example`.

Si deseas personalizar las credenciales:

```bash
cp .env.example .env
# Editar .env con tus valores personalizados
```

### 3. Levantar el proyecto

**IMPORTANTE:** Si ya levantaste el proyecto antes y tuviste problemas, primero limpia los volumenes:

```bash
docker compose down -v
docker volume prune
```

Luego, levanta todos los servicios:

```bash
docker compose up --build
```

Este comando hace lo siguiente:
1. Construye las imagenes de frontend y backend
2. Levanta contenedor PostgreSQL
3. Inicializa base de datos con esquema DDL y datos seed
4. Levanta API REST backend
5. Levanta aplicacion React frontend

**Tiempo estimado:** 2-3 minutos en primera ejecucion.

### 4. Acceder a la aplicacion

Una vez que veas en consola:
```
backend-1   | Server running on port 3000
frontend-1  | VITE ready in X ms
```

Abre en tu navegador:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Base de datos:** localhost:5432

## Arquitectura de Servicios

| Servicio | Puerto | Descripcion | Healthcheck |
|----------|--------|-------------|-------------|
| **db** | 5432 | PostgreSQL 16 con datos seed | pg_isready |
| **db-init** | - | Inicializa esquema y seed (ejecucion unica) | - |
| **backend** | 3000 | API REST Express + TypeScript | - |
| **frontend** | 5173 | Aplicacion React 19 + Vite | - |

### Dependencias entre servicios

```
frontend → backend → db-init → db
```

Los servicios se levantan en orden secuencial para garantizar disponibilidad.

## Variables de entorno

```
POSTGRES_USER=proy2
POSTGRES_PASSWORD=secret
POSTGRES_DB=tienda_libros
JWT_SECRET=a58357173f277af9328127d173d9efe57d8c91f0efdcab66b7a4158af776ac61ca985e7b696ed7ab5c9e8b536a3efbd1f0dae3f05078fe8e14c22192ee12d68d
```

Estas variables ya estan configuradas en `docker-compose.yaml`.

**Nota sobre JWT_SECRET:** El secreto fue generado usando https://jwtsecrets.com/#generator. Se usa un string hexadecimal de 512 bits (128 caracteres) con entropia criptografica en lugar de un nombre o frase porque:
- Nombres/frases predecibles son vulnerables a ataques de diccionario
- Secretos con baja entropia permiten fuerza bruta para falsificar tokens
- JWT_SECRET protege la integridad de TODOS los tokens - si se compromete, un atacante puede crear tokens validos con cualquier payload (ej. rol admin)
- 512 bits de entropia criptografica hacen computacionalmente imposible adivinar el secreto

## Usuarios de Prueba

El sistema incluye usuarios pre-configurados para probar cada rol:

| Usuario | Password | Rol | Descripcion |
|---------|----------|-----|-------------|
| **admin** | admin123 | Administrador | Acceso completo al sistema |
| **vendedor1** | vend123 | Vendedor | Puede registrar ventas y gestionar productos |
| **cliente1** | cli123 | Cliente | Puede navegar catalogo y realizar compras |

**Nota:** Tambien puedes registrar nuevos usuarios desde la pagina de registro. Todos los nuevos registros se crean con rol "cliente".

## Troubleshooting (Solucion de Problemas)

### Error: "role proy2 does not exist"

**Causa:** Docker esta usando un volumen de PostgreSQL de una ejecucion anterior con credenciales diferentes.

**Solucion:**
```bash
# Detener servicios y eliminar volumenes
docker compose down -v

# Verificar que no queden volumenes
docker volume ls | grep proyecto2

# Si aparece algun volumen, eliminarlo manualmente
docker volume rm proyecto2-db_pgdata

# Levantar de nuevo
docker compose up --build
```

### Error: "Port 5432 is already in use"

**Causa:** Ya tienes PostgreSQL corriendo en tu sistema.

**Solucion:**
```bash
# Windows: Detener servicio PostgreSQL
net stop postgresql-x64-16

# Linux/Mac: Detener PostgreSQL
sudo service postgresql stop

# O cambiar puerto en docker-compose.yaml
ports:
  - "5433:5432"  # Usar 5433 en lugar de 5432
```

### Frontend no carga / Muestra pantalla en blanco

**Solucion:**
```bash
# Reconstruir contenedores sin cache
docker compose build --no-cache
docker compose up
```

### Base de datos sin datos seed

**Solucion:**
```bash
# Forzar reinicializacion completa
docker compose down -v
docker compose up --build
```

## Funcionalidades del Sistema

### Autenticacion y Autorizacion
- Login/logout con JWT
- 3 roles de usuario: admin, vendedor, cliente
- Proteccion de rutas segun rol
- Sesiones persistentes con localStorage

### Gestion de Inventario
- **CRUD Productos:** Crear, editar, eliminar productos (libros, mangas, comics, revistas)
- **Categorias y Editoriales:** Clasificacion por tipo y editorial
- **Autores:** Relacion muchos-a-muchos entre productos y autores
- **Stock:** Control de inventario en tiempo real
- **Imagenes:** URLs de portadas con fallback visual

### Gestion de Clientes
- **CRUD Clientes:** Alta, edicion y eliminacion de clientes
- **Datos completos:** Nombre, email, telefono, direccion
- **Vinculacion con usuarios:** Clientes pueden tener cuenta de login

### Sistema de Ventas
- **Registro de ventas:** Diferenciacion entre venta web y venta fisica por empleado
- **Carrito de compras:** Sistema completo para clientes web
- **Detalle de venta:** Items con cantidad y precio unitario
- **Transacciones:** BEGIN/COMMIT/ROLLBACK explicito en registro de ventas
- **Historial:** Consulta de ventas pasadas con detalle expandible
- **Filtrado:** Por vendedor (web o empleado especifico)

### Compras a Proveedores
- **Registro de compras:** Alta de compras con detalle
- **Proveedores:** Gestion de proveedores y contactos
- **Historial:** Consulta de compras anteriores

### Dashboard y Reportes
- **Top 10 productos mas vendidos:** Grafico de barras con Recharts
- **Ventas por mes:** Grafico de lineas con Recharts
- **Stock bajo:** Productos con 5 o menos unidades disponibles
- **Productos no vendidos:** Inventario sin movimiento
- **Ranking de clientes:** CTE con clientes ordenados por gasto total
- **Clientes sobre promedio:** Reporte de clientes que gastaron mas que el promedio
- **Exportar CSV:** Descarga de reporte de ventas completo

### Catalogo Publico
- **Navegacion sin login:** Acceso libre al catalogo
- **Busqueda:** Por titulo o autor
- **Filtros:** Por tipo de producto (libro, manga, comic, revista)
- **Vista de producto:** Dialog con detalles completos al hacer click
- **Agregar al carrito:** Para usuarios autenticados como cliente
- **Badges:** Stock disponible y tipo de producto

### Caracteristicas Tecnicas
- **Base de datos:**
  - Vista `vista_producto_completo` para consultas optimizadas
  - 5 indices para queries frecuentes (fecha, categoria, editorial, cliente, proveedor)
  - Consultas con JOINs, subqueries, GROUP BY/HAVING, CTEs
  - 25 usuarios seed, 36 productos, 25 ventas de ejemplo
- **Frontend:**
  - React Context API (AuthContext, CartContext, ThemeContext)
  - useReducer para estado complejo del carrito
  - useMemo/useCallback para optimizacion de renders
  - Animaciones GSAP + Framer Motion
  - Componentes shadcn/ui (Radix UI + TailwindCSS)
  - Modo claro/oscuro con toggle
  - Responsive design (mobile-first)
  - SweetAlert2 para notificaciones
  - React Router v7 con 14 rutas
  - Lazy loading de paginas con Suspense
  - 6 tests unitarios con Vitest
- **Backend:**
  - Arquitectura REST
  - Middleware de autenticacion JWT
  - Guards de roles
  - Manejo de errores centralizado

## Uso de React Hooks (Requisito)

Como parte de la migracion y requerimientos, se implementaron extensivamente los hooks de React para manejar el ciclo de vida y estado de la aplicacion:

- **`useState`**: Utilizado en todos los componentes para el manejo de estado local (ej. inputs de formularios, modales abiertos/cerrados, paginacion).
- **`useEffect`**: Empleado para fetching de datos al montar componentes (llamadas a la API) y para sincronizar animaciones de GSAP con el DOM renderizado.
- **`useReducer`**: Implementado en `AuthContext` (estados `LOGIN`, `LOGOUT`) y `CartContext` (acciones `ADD_ITEM`, `REMOVE_ITEM`, `CLEAR_CART`, `SYNC_STOCK`) para manejar logica de estado compleja y predecible.
- **`useContext`**: Extraido en custom hooks (`useAuth`, `useCart`, `useTheme`) para consumir el estado global sin prop-drilling en la aplicacion.
- **`useMemo`**: Utilizado para optimizar renderizados costosos, como el filtrado interactivo del catalogo por titulo y tipo, y para calcular la data derivada de los graficos de Recharts.
- **`useCallback`**: Empleado para memorizar funciones que se pasan como dependencias o props (ej. handlers de agregar al carrito o descargar CSV), evitando re-renders innecesarios.
- **Custom Hooks**: Se desarrollo el hook `useSwal` para abstraer y estandarizar la configuracion de SweetAlert2 en notificaciones de exito, error y confirmacion.

## Documentacion de Base de Datos

- [Modelo relacional y normalizacion (3FN)](assets/docs/modelo_relacional_normalizacion.md)
- [Diagrama ER](assets/img/der%20completo%20bases%20de%20datos%20proyecto%202.png)

### Esquema Principal

**Entidades:**
- `usuario` - Autenticacion y roles
- `cliente` - Datos de clientes
- `empleado` - Datos de empleados
- `producto` - Inventario de libros/mangas
- `categoria` - Clasificacion de productos
- `editorial` - Editoriales
- `autor` - Autores de productos
- `producto_autor` - Relacion M:N productos-autores
- `venta` - Registro de ventas
- `detalle_venta` - Items de cada venta
- `proveedor` - Proveedores
- `compra_proveedor` - Compras realizadas
- `detalle_compra` - Items de cada compra

### Indices Creados

```sql
CREATE INDEX idx_venta_fecha ON venta(fecha);
CREATE INDEX idx_producto_categoria ON producto(categoria_id);
CREATE INDEX idx_producto_editorial ON producto(editorial_id);
CREATE INDEX idx_venta_cliente ON venta(cliente_id);
CREATE INDEX idx_compra_proveedor ON compra_proveedor(proveedor_id);
```

## Comandos Utiles

```bash
# Ver logs de un servicio especifico
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Ver logs en tiempo real
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Detener servicios
docker compose down

# Detener y eliminar volumenes (reinicio completo)
docker compose down -v

# Reconstruir sin cache
docker compose build --no-cache

# Ver estado de servicios
docker compose ps

# Entrar a contenedor de base de datos
docker compose exec db psql -U proy2 -d tienda_libros

# Ejecutar query SQL directamente
docker compose exec db psql -U proy2 -d tienda_libros -c "SELECT * FROM usuario;"
```

## Estructura del Proyecto

```
proyecto2-db/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuracion (DB, env)
│   │   ├── middleware/     # Auth, validacion
│   │   ├── routes/         # Endpoints API
│   │   └── queries/        # SQL queries
│   ├── index.ts           # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React (UI, layout, forms)
│   │   ├── pages/         # Paginas (lazy-loaded)
│   │   ├── contexts/      # React Context (Auth, Cart, Theme)
│   │   ├── services/      # API clients (axios)
│   │   ├── hooks/         # Custom hooks (useSwal)
│   │   ├── lib/           # Utilidades (cn)
│   │   └── __tests__/     # Tests unitarios
│   └── Dockerfile
├── database/
│   ├── 01-ddl.sql        # Esquema de base de datos
│   └── 02-seed.sql       # Datos iniciales
├── assets/
│   ├── docs/             # Documentacion
│   └── img/              # Diagramas
├── docker-compose.yaml   # Orquestacion de servicios
└── README.md
```
