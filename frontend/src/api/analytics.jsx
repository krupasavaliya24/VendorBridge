import apiClient from './client';

const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard').then(r => r.data),
  getTrends: () => apiClient.get('/analytics/trends').then(r => r.data),
  getVendorPerformance: () => apiClient.get('/analytics/vendor-performance').then(r => r.data),
};

export default analyticsApi;
