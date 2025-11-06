import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, WEB_SERVICE_URL } from '@env';

const chatApi = axios.create({
  baseURL: API_BASE_URL, // URL del servicio de Chat (Node.js)
  timeout: 10000,
});

const webServiceApi = axios.create({
  baseURL: WEB_SERVICE_URL, // URL del Web Service (FastAPI)
  timeout: 10000,
});

// Función para añadir interceptores a una instancia de Axios
const addInterceptors = (apiInstance: any) => {
  apiInstance.interceptors.request.use(async (config: any) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
        // Lógica para redirigir al login
      }
      return Promise.reject(error);
    }
  );
};

addInterceptors(chatApi);
addInterceptors(webServiceApi);

export const authAPI = {
  // Las rutas de auth ahora apuntan al webServiceApi (FastAPI)
  login: async (email: string, password: string) => {
    const response = await webServiceApi.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await webServiceApi.post('/auth/register', { email, password, full_name: name });
    return response.data;
  },

  // Suponiendo que FastAPI tendrá un endpoint de verificación
  verifyToken: async (token: string) => {
    const response = await webServiceApi.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Suponiendo que el logout no necesita un endpoint específico y se maneja en el cliente
  logout: async () => {
    // await webServiceApi.post('/auth/logout');
    return Promise.resolve();
  },
  
  // ... (otros endpoints de auth que podrían estar en FastAPI)
};

export const chatAPI = {
  // El chat apunta al chatApi (Node.js)
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

    const response = await chatApi.post('/chat/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await chatApi.get('/chat/history');
    return response.data;
  },

  clearChat: async () => {
    await chatApi.delete('/chat/clear');
  },

  getSuggestions: async () => {
    const response = await chatApi.get('/chat/suggestions');
    return response.data;
  },
};

export const gamificationAPI = {
  // La gamificación ahora apunta al webServiceApi (FastAPI)
  getUserStats: async () => {
    // Asumiendo que /users/me devuelve las estadísticas
    const response = await webServiceApi.get('/users/me'); 
    return response.data;
  },

  // Los siguientes son ejemplos y deben coincidir con tu API de FastAPI
  getActivities: async () => {
    const response = await webServiceApi.get('/activities/visible');
    return response.data;
  },

  completeActivity: async (activityId: string, answer: any) => {
    const response = await webServiceApi.post(`/activities/${activityId}/submissions`, { answer });
    return response.data;
  },

  getLeaderboard: async () => {
    // Asumiendo que tienes un endpoint /leaderboard en FastAPI
    const response = await webServiceApi.get('/users/leaderboard');
    return response.data;
  },
  
  // Endpoints como earnCredits/spendCredits ya no se llaman directamente,
  // la lógica de negocio en FastAPI se encarga de ello.
};

export const userAPI = {
  // Las APIs de usuario apuntan al webServiceApi (FastAPI)
  getProfile: async () => {
    const response = await webServiceApi.get('/users/me');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await webServiceApi.put('/users/me', profileData);
    return response.data;
  },
  
  // ... (otros endpoints de userAPI)
};

// La API de admin también debería apuntar a FastAPI
export const adminAPI = {
  getDashboard: async () => {
    const response = await webServiceApi.get('/admin/dashboard'); // Endpoint de ejemplo
    return response.data;
  },
  
  // ... (resto de endpoints de adminAPI)
};

// Exportamos ambas instancias por si se necesitan por separado
export { chatApi, webServiceApi };

