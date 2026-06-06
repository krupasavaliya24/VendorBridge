import apiClient from './client';

const vendorsApi = {
  getAll: (params) => apiClient.get('/vendors', { params }).then(r => r.data),
  getById: (id) => apiClient.get(`/vendors/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/vendors', data).then(r => r.data),
  update: (id, data) => apiClient.put(`/vendors/${id}`, data).then(r => r.data),
  delete: (id) => apiClient.delete(`/vendors/${id}`).then(r => r.data),
};

export default vendorsApi;
