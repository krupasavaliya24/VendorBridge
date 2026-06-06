import apiClient from './client';

const notificationsApi = {
  getAll: (params) => apiClient.get('/notifications', { params }).then(r => r.data),
  getUnreadCount: () => apiClient.get('/notifications/unread-count').then(r => r.data),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => apiClient.put('/notifications/read-all').then(r => r.data),
};

export default notificationsApi;
