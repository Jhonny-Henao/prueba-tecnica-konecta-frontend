import axiosInstance  from '../axios';

export const usersApi = {
  // Listar todos los usuarios (solo Admin)
  getAll: (params) => axiosInstance.get('/users', { params }),
  
  // Obtener un usuario por ID
  getById: (id) => axiosInstance.get(`/users/${id}`),
  
  // Crear nuevo usuario
  create: (data) => axiosInstance.post('/users', data),
  
  // Actualizar usuario
  update: (id, data) => axiosInstance.put(`/users/${id}`, data),
  
  // Eliminar usuario
  delete: (id) => axiosInstance.delete(`/users/${id}`),
};