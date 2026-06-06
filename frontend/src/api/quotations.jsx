import apiClient from './client';

const quotationsApi = {
  getAll: (params) => apiClient.get('/quotations', { params }).then(r => r.data),
  getById: (id) => apiClient.get(`/quotations/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/quotations', data).then(r => r.data),
  compare: (rfqId) => apiClient.get(`/quotations/compare/${rfqId}`).then(r => r.data),
  select: (id) => apiClient.post(`/quotations/${id}/select`).then(r => r.data),
};

export default quotationsApi;
