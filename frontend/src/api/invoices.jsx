import apiClient from './client';

const invoicesApi = {
  getAll: (params) => apiClient.get('/invoices', { params }).then(r => r.data),
  getById: (id) => apiClient.get(`/invoices/${id}`).then(r => r.data),
  generate: (poId) => apiClient.post(`/invoices/generate/${poId}`).then(r => r.data),
  getPdf: (id) => apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id, email) => apiClient.post(`/invoices/${id}/send-email`, { recipient_email: email }).then(r => r.data),
  markPaid: (id) => apiClient.put(`/invoices/${id}/mark-paid`).then(r => r.data),
};

export default invoicesApi;
