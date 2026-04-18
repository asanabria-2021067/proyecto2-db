import api from './api'

export default {
  getAll: () => api.get('/productos'),
  getById: (id: number) => api.get(`/productos/${id}`),
  create: (data: any) => api.post('/productos', data),
  update: (id: number, data: any) => api.put(`/productos/${id}`, data),
  remove: (id: number) => api.delete(`/productos/${id}`),
}
