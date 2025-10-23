'use client';

import { create } from 'zustand';
import Cookies from 'js-cookie';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Inicializar desde cookies
  initAuth: () => {
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isLoading: false });
        return true;
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        set({ isLoading: false });
        return false;
      }
    } else {
      set({ isLoading: false });
      return false;
    }
  },

  // Verificar autenticación (SIN llamada al backend)
  checkAuth: async () => {
    const state = get();
    
    // Si ya está cargado, retornar el estado actual
    if (!state.isLoading) {
      return state.isAuthenticated;
    }
    
    // Si está cargando, inicializar desde cookies
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isLoading: false });
        return true;
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        set({ isLoading: false });
        return false;
      }
    } else {
      set({ isLoading: false });
      return false;
    }
  },

  // Login
  login: (token, user) => {
    Cookies.set('token', token, { expires: 1 }); // 1 día
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  // Logout
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Actualizar usuario
  updateUser: (user) => {
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    set({ user });
  }
}));

// Hook personalizado para usar en los componentes
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
    initAuth: store.initAuth,
    updateUser: store.updateUser
  };
};

export default useAuthStore;