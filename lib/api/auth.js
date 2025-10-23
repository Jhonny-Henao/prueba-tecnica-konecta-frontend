import axios from 'axios';

// 🧩 Configuración global
// 👉 En .env.local debe quedar así:
// NEXT_PUBLIC_API_URL=http://localhost:5000
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 🧠 Endpoints del módulo Auth
export const authApi = {
  /**
   * Obtener un nuevo captcha
   */
  getCaptcha: async () => {
    const { data } = await api.get('/auth/captcha');
    return data;
  },

  /**
   * Iniciar sesión
   */
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  /**
   * Verificar token
   */
  verifyToken: async () => {
    const { data } = await api.get('/auth/verify');
    return data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};
