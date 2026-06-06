import { apiClient } from '../../shared/api/client';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials).then(r => r.data),
  signup: (data) => apiClient.post('/auth/signup', data).then(r => r.data),
  me: () => apiClient.get('/auth/me').then(r => r.data),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }).then(r => r.data),
};
