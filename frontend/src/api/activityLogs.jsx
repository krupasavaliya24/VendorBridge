import apiClient from './client';

const activityLogsApi = {
  getAll: (params) => apiClient.get('/activity-logs', { params }).then(r => r.data),
};

export default activityLogsApi;
