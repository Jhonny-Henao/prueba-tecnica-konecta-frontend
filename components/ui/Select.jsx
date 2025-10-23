// src/components/ui/Select.jsx (o la ruta correspondiente)

import React, { forwardRef } from 'react'; 

// Usamos forwardRef para que react-hook-form pueda pasar la 'ref' al elemento nativo <select>
const Select = forwardRef(({ label, options, error, required, ...props }, ref) => {
  // Nota: 'ref' se pasa como segundo argumento aquí

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        // CRÍTICO: Pasamos la ref al elemento <select> nativo
        ref={ref} 
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
        {...props}
      >
        <option value="">Seleccione una opción</option> {/* Opción por defecto */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;