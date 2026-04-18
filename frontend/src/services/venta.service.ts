import api from './api'

export default {
  getAll: () => api.get('/ventas'),
  getById: (id: number) => api.get(`/ventas/${id}`),
  getDetalle: (id: number) => api.get(`/ventas/detalle/${id}`),
  getMisCompras: () => api.get('/ventas/mis-compras'),
  create: (data: any) => api.post('/ventas', data),
}
