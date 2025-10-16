import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.estudiantil-chatbot.com'; // Cambiar por tu URL de API

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      // Redirigir al login
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  verifyToken: async (token: string) => {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (text: string, image?: string, audio?: string) => {
    const formData = new FormData();
    formData.append('text', text);
    if (image) {
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
    }
    if (audio) {
      formData.append('audio', {
        uri: audio,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
    }

    const response = await api.post('/chat/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },

  clearChat: async () => {
    await api.delete('/chat/clear');
  },

  getSuggestions: async () => {
    const response = await api.get('/chat/suggestions');
    return response.data;
  },
};

export const gamificationAPI = {
  getUserStats: async () => {
    const response = await api.get('/gamification/stats');
    return response.data;
  },

  earnCredits: async (amount: number, reason: string) => {
    const response = await api.post('/gamification/earn-credits', { amount, reason });
    return response.data;
  },

  spendCredits: async (amount: number, reason: string) => {
    const response = await api.post('/gamification/spend-credits', { amount, reason });
    return response.data;
  },

  earnExperience: async (amount: number, reason: string) => {
    const response = await api.post('/gamification/earn-experience', { amount, reason });
    return response.data;
  },

  earnPoints: async (amount: number, reason: string) => {
    const response = await api.post('/gamification/earn-points', { amount, reason });
    return response.data;
  },

  getActivities: async () => {
    const response = await api.get('/gamification/activities');
    return response.data;
  },

  completeActivity: async (activityId: string) => {
    const response = await api.post('/gamification/complete-activity', { activityId });
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/gamification/achievements');
    return response.data;
  },

  checkAchievements: async () => {
    const response = await api.get('/gamification/check-achievements');
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/gamification/leaderboard');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  updatePreferences: async (preferences: any) => {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },

  uploadAvatar: async (imageUri: string) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async () => {
    await api.delete('/user/account');
  },
};

export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  createActivity: async (activityData: any) => {
    const response = await api.post('/admin/activities', activityData);
    return response.data;
  },

  updateActivity: async (activityId: string, activityData: any) => {
    const response = await api.put(`/admin/activities/${activityId}`, activityData);
    return response.data;
  },

  deleteActivity: async (activityId: string) => {
    await api.delete(`/admin/activities/${activityId}`);
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    await api.delete(`/admin/users/${userId}`);
  },
};

export default api;

