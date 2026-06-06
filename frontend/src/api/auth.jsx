import apiClient from './client';

const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials).then(r => r.data),
  signup: (data) => apiClient.post('/auth/signup', data).then(r => r.data),
  me: () => apiClient.get('/auth/me').then(r => r.data),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }).then(r => r.data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data).then(r => r.data),
};

export default authApi;
