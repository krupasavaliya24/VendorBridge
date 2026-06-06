import apiClient from './client';

const usersApi = {
  getAll: () => apiClient.get('/auth/users').then(r => r.data),
  getApprovers: () => apiClient.get('/auth/approvers').then(r => r.data),
  update: (id, data) => apiClient.put(`/auth/users/${id}`, data).then(r => r.data),
};

export default usersApi;
