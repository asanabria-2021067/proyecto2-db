import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './src/routes/auth.routes.js';
import productoRoutes from './src/routes/producto.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';
import ventaRoutes from './src/routes/venta.routes.js';
import categoriaRoutes from './src/routes/categoria.routes.js';
import editorialRoutes from './src/routes/editorial.routes.js';
import autorRoutes from './src/routes/autor.routes.js';
import proveedorRoutes from './src/routes/proveedor.routes.js';
import compraRoutes from './src/routes/compra.routes.js';
import reporteRoutes from './src/routes/reporte.routes.js';
import exportRoutes from './src/routes/export.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/editoriales', editorialRoutes);
app.use('/api/autores', autorRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
