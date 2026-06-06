import apiClient from './client';

const purchaseOrdersApi = {
  getAll: (params) => apiClient.get('/purchase-orders', { params }).then(r => r.data),
  getById: (id) => apiClient.get(`/purchase-orders/${id}`).then(r => r.data),
  updateStatus: (id, status) => apiClient.put(`/purchase-orders/${id}/status`, { status }).then(r => r.data),
};

export default purchaseOrdersApi;
