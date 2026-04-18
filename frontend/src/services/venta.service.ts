import api from './api'

export default {
  getAll: () => api.get('/ventas'),
  getById: (id: number) => api.get(`/ventas/${id}`),
  create: (data: any) => api.post('/ventas', data),
}
