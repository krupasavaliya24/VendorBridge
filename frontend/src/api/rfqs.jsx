import apiClient from './client';

const rfqsApi = {
  getAll: (params) => apiClient.get('/rfqs', { params }).then(r => r.data),
  getById: (id) => apiClient.get(`/rfqs/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/rfqs', data).then(r => r.data),
  uploadAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/rfqs/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  downloadAttachment: (rfqId, attachmentId) => apiClient.get(`/rfqs/${rfqId}/attachments/${attachmentId}/download`, { responseType: 'blob' }),
  update: (id, data) => apiClient.put(`/rfqs/${id}`, data).then(r => r.data),
  publish: (id) => apiClient.post(`/rfqs/${id}/publish`).then(r => r.data),
  close: (id) => apiClient.post(`/rfqs/${id}/close`).then(r => r.data),
};

export default rfqsApi;
