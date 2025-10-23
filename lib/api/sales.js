// lib/api/sales.js
import axiosInstance from '../axios';



export const salesApi = {
  // Obtener catálogos (productos, franquicias, estados)
  getCatalogs: () => axiosInstance.get('/sales/catalogs'),
  
  // Listar todas las ventas (Admin ve todas, Asesor solo las suyas)
  getAll: (params) => axiosInstance.get('/sales', { params }),
  
  // Obtener una venta por ID
  getById: (id) => axiosInstance.get(`/sales/${id}`),
  
  // Crear nueva venta
  create: (data) => axiosInstance.post('/sales', data),
  
  // Actualizar venta
  update: (id, data) => axiosInstance.put(`/sales/${id}`, data),
  
  // Eliminar venta
  delete: (id) => axiosInstance.delete(`/sales/${id}`),
  
  // Obtener total de cupos
  getTotalQuotas: () => axiosInstance.get('/sales/summary/total'),
};
