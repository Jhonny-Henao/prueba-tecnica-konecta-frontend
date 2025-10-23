/**
 * Formatea un número a formato de moneda colombiana
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formatea un número a formato de miles con puntos
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('es-CO').format(value);
};

/**
 * Convierte string de formato miles a número
 */
export const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/\./g, '').replace(/,/g, '.') || 0);
};

/**
 * Formatea una fecha
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

/**
 * Formatea una fecha corta
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

/**
 * Trunca un texto
 */
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};