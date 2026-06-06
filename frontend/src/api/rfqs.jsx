import apiClient from './client';

const rfqsApi = {
  getAll: (params) => apiClient.get('/rfqs', { params }).then(r => r.data),
  getById: (id) => apiClient.get(`/rfqs/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/rfqs', data).then(r => r.data),
  update: (id, data) => apiClient.put(`/rfqs/${id}`, data).then(r => r.data),
  publish: (id) => apiClient.post(`/rfqs/${id}/publish`).then(r => r.data),
  close: (id) => apiClient.post(`/rfqs/${id}/close`).then(r => r.data),
};

export default rfqsApi;
