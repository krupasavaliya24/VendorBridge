import apiClient from './client';

const approvalsApi = {
  getAll: (params) => apiClient.get('/approvals', { params }).then(r => r.data),
  getPending: () => apiClient.get('/approvals/pending').then(r => r.data),
  create: (data) => apiClient.post('/approvals', data).then(r => r.data),
  decide: (id, data) => apiClient.put(`/approvals/${id}/decide`, data).then(r => r.data),
};

export default approvalsApi;
