import api from './api'

export default {
  topProductos: () => api.get('/reportes/top-productos'),
  ventasPorMes: () => api.get('/reportes/ventas-por-mes'),
  productosNoVendidos: () => api.get('/reportes/productos-no-vendidos'),
  clientesSobrePromedio: () => api.get('/reportes/clientes-sobre-promedio'),
  rankingClientes: () => api.get('/reportes/ranking-clientes'),
  stockBajo: () => api.get('/reportes/stock-bajo'),
  exportCsv: () => api.get('/export/ventas-csv', { responseType: 'blob' }),
}
