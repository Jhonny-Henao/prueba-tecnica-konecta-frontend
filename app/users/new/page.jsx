'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Mail, Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/store/authStore';
import { usersApi } from '@/lib/api/users';

export default function NewUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: ''
  });
  const [errors, setErrors] = useState({});

  const isAdmin = user?.role?.name === 'Administrador';

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadRoles();
  }, [isAdmin]);

  const loadRoles = async () => {
    // En una implementación real, cargarías los roles desde el API
    setRoles([
      { id: 1, name: 'Administrador' },
      { id: 2, name: 'Asesor' }
    ]);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.length > 50) {
      newErrors.name = 'El nombre es obligatorio (máximo 50 caracteres)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    } else if (formData.email.length > 50) {
      newErrors.email = 'El email no puede superar 50 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6 || formData.password.length > 20) {
      newErrors.password = 'La contraseña debe tener entre 6 y 20 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role_id: parseInt(formData.role_id)
      };

      await usersApi.create(dataToSend);
      alert('✅ Usuario creado exitosamente');
      router.push('/users');
    } catch (error) {
      console.error('❌ Error creating user:', error);
      alert(error.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Verificar fortaleza de contraseña
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { level: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { level: strength, text: 'Débil', color: 'text-red-600' };
    if (strength === 3) return { level: strength, text: 'Media', color: 'text-yellow-600' };
    return { level: strength, text: 'Fuerte', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/users')}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          <div className="h-8 w-px bg-slate-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nuevo Usuario</h1>
            <p className="text-slate-600 mt-1">Crea un nuevo usuario del sistema</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Información del Usuario</h2>
                <p className="text-blue-100 text-sm">Completa todos los campos requeridos</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre Completo
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                placeholder="Ej: Juan Pérez"
                className={`w-full px-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">Máximo 50 caracteres</p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={50}
                placeholder="correo@banco.com"
                className={`w-full px-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.email && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">Debe ser un email válido</p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contraseña
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                maxLength={20}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </div>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-600">Fortaleza:</span>
                    <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.level <= 2 ? 'bg-red-500' :
                        passwordStrength.level === 3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">Entre 6 y 20 caracteres</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar Contraseña
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                maxLength={20}
                placeholder="Repita la contraseña"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </div>
              )}
              {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Las contraseñas coinciden
                </div>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Tipo de Usuario
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white ${
                  errors.role_id ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              >
                <option value="">Seleccione un rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.role_id}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.push('/users')}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Crear Usuario
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💡</span>
              </div>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Requisitos de contraseña:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Mínimo 6 caracteres, máximo 20</li>
                <li>Se recomienda usar mayúsculas, minúsculas y números</li>
                <li>Los caracteres especiales aumentan la seguridad</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}