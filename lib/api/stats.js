import axiosInstance  from '../axios';

export const statsApi = {
  // Dashboard general (solo Admin)
  getDashboard: () => axiosInstance.get('/stats/dashboard'),
  
  // Ventas por asesor
  getSalesByAdvisor: () => axiosInstance.get('/stats/sales-by-advisor'),
  
  // Cupos por producto
  getQuotasByProduct: () => axiosInstance.get('/stats/quotas-by-product'),
  
  // Ventas por fecha (day, month, year)
  getSalesByDate: (period = 'day') => 
    axiosInstance.get('/stats/sales-by-date', { params: { period } }),
  
  // Ventas por estado
  getSalesByStatus: () => axiosInstance.get('/stats/sales-by-status'),
};