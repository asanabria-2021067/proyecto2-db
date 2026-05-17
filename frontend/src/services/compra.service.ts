import api from './api'

export default {
  getAll: () => api.get('/compras'),
  getDetalle: (id: number) => api.get(`/compras/${id}/detalle`),
  create: (data: { proveedor_id: number; items: { producto_id: number; cantidad: number; precio_unitario: number }[] }) => api.post('/compras', data),
}
