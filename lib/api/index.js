// lib/api/index.js
export { authApi } from './auth';
export { salesApi } from './sales';
export { usersApi } from './users';
export { statsApi } from './stats';

// También exportar la instancia de axios por si se necesita
export { default as axiosInstance } from './axios';