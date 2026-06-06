import apiClient from './client';

const settingsApi = {
  getAll: (category) => apiClient.get('/settings', { params: category ? { category } : {} }).then(r => r.data),
  getByKey: (key) => apiClient.get(`/settings/${key}`).then(r => r.data),
  update: (key, data) => apiClient.put(`/settings/${key}`, data).then(r => r.data),
  bulkUpdate: (settings) => apiClient.post('/settings/bulk', { settings }).then(r => r.data),
};

export default settingsApi;
