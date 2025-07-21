import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiLoginTelegram = (user: any) => api.post('/auth/telegram', user).then(r => r.data);
export const getSummary = () => api.get('/analytics/summary').then(r => r.data);
export const getActivity = () => api.get('/analytics/activity').then(r => r.data);
export const getTopUsers = () => api.get('/analytics/topusers').then(r => r.data);
export const getTopWords = () => api.get('/analytics/topwords').then(r => r.data);
export const getCategories = () => api.get('/analytics/categories').then(r => r.data);
export const getUsers = () => api.get('/users/list').then(r => r.data);
export const muteUser = (id: number) => api.post(`/users/mute/${id}`);
export const banUser = (id: number) => api.post(`/users/ban/${id}`);
export const promoteUser = (id: number, role: string) => api.post(`/users/promote/${id}`, { role });
export const getSettings = () => api.get('/settings').then(r => r.data);
export const updateSettings = (data: any) => api.post('/settings', data).then(r => r.data);
export const getAdmins = () => api.get('/admins').then(r => r.data);
export const addAdmin = (admin: any) => api.post('/admins', admin);
export const removeAdmin = (id: number) => api.delete(`/admins/${id}`); 