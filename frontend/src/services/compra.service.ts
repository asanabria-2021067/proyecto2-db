import api from './api'

export default {
  getAll: () => api.get('/compras'),
  getDetalle: (id: number) => api.get(`/compras/${id}/detalle`),
}
