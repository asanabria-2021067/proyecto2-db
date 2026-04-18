import api from './api'

export default {
  getAll: () => api.get('/clientes'),
  getById: (id: number) => api.get(`/clientes/${id}`),
  create: (data: any) => api.post('/clientes', data),
  update: (id: number, data: any) => api.put(`/clientes/${id}`, data),
  remove: (id: number) => api.delete(`/clientes/${id}`),
}
