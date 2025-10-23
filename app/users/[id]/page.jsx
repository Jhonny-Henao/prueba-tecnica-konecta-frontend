'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Mail, Lock, Shield } from 'lucide-react';
import { usersApi } from '@/lib/api/users';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: ''
  });

  const [roles] = useState([
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Asesor' }
  ]);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usersApi.getById(userId);
      console.log('📥 Usuario cargado:', response);
      
      let userData = response.data?.data || response.data || response;
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '', // Dejamos vacío por seguridad
        role_id: userData.role_id || userData.role?.id || ''
      });
    } catch (error) {
      console.error('❌ Error al cargar usuario:', error);
      setError(error.response?.data?.message || 'Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return;
    }

    if (!formData.role_id) {
      setError('Debes seleccionar un rol');
      return;
    }

    setSaving(true);
    try {
      // Preparar datos para enviar (sin password si está vacío)
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        role_id: parseInt(formData.role_id)
      };

      // Solo incluir password si se ingresó uno nuevo
      if (formData.password.trim()) {
        dataToSend.password = formData.password;
      }

      console.log('📤 Enviando datos:', dataToSend);
      
      await usersApi.update(userId, dataToSend);
      
      alert('✅ Usuario actualizado exitosamente');
      router.push('/users');
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      setError(error.response?.data?.message || 'Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando usuario...</p>
        </div>
      </div>
    );
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
            <h1 className="text-3xl font-bold text-slate-900">Editar Usuario</h1>
            <p className="text-slate-600 mt-1">Actualiza la información del usuario</p>
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
                <p className="text-blue-100 text-sm">Modifica los campos necesarios</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre Completo
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-3 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nueva Contraseña
                  <span className="text-xs font-normal text-slate-500">(Opcional - Dejar vacío para mantener la actual)</span>
                </div>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Dejar vacío para no cambiar"
                className="w-full px-4 py-3 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <p className="mt-1 text-xs text-slate-500">
                Solo completa este campo si deseas cambiar la contraseña
              </p>
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rol
                </div>
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                required
              >
                <option value="">Selecciona un rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
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
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
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
              <p className="font-semibold mb-1">Consejos:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>El campo de contraseña es opcional al editar</li>
                <li>Solo complétalo si deseas cambiar la contraseña actual</li>
                <li>Todos los demás campos son obligatorios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}