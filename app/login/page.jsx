'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LogIn, RefreshCw, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, initAuth } = useAuth();
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Inicializar auth al cargar
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Ya autenticado, redirigiendo...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Generar captcha al cargar la página
  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    setLoadingCaptcha(true);
    setError('');
    
    try {
      const response = await authApi.getCaptcha();
      console.log('✅ Captcha cargado:', response);
      
      if (response.success && response.data) {
        setCaptcha(response.data);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('❌ Error al cargar captcha:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al cargar captcha. Intente de nuevo.';
      setError(errorMessage);
      setCaptcha(null);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  const onSubmit = async (formData) => {
    console.log('📝 Datos del formulario:', formData);
    setLoading(true);
    setError('');

    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
        captcha: formData.captcha,
        captchaToken: captcha.token
      };

      console.log('🚀 Enviando login:', loginData);

      const response = await authApi.login(loginData);

      console.log('✅ Respuesta del servidor:', response);

      if (response.success && response.data) {
        const { token, user } = response.data;
        
        console.log('✅ Token recibido:', token);
        console.log('✅ Usuario recibido:', user);
        
        login(token, user);
        console.log('✅ Login exitoso, redirigiendo...');
        router.push('/dashboard');
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // ✅ VALIDACIÓN MEJORADA DE ERRORES
      let errorMessage = 'Error al iniciar sesión';
      
      // Validar errores específicos por código de estado HTTP
      if (error.response?.status === 401) {
        // Error de credenciales incorrectas
        errorMessage = 'Usuario o contraseña incorrectos. Por favor verifica tus credenciales.';
      } else if (error.response?.status === 400) {
        // Error de datos inválidos (puede incluir captcha incorrecto)
        const serverMessage = error.response?.data?.message || '';
        
        // Detectar si es error de captcha o de credenciales
        if (serverMessage.toLowerCase().includes('captcha')) {
          errorMessage = 'Código captcha incorrecto o expirado. Intente nuevamente.';
        } else if (serverMessage.toLowerCase().includes('usuario') || 
                   serverMessage.toLowerCase().includes('email') ||
                   serverMessage.toLowerCase().includes('correo')) {
          errorMessage = 'El usuario no existe o está desactivado.';
        } else if (serverMessage.toLowerCase().includes('contraseña') || 
                   serverMessage.toLowerCase().includes('password')) {
          errorMessage = 'La contraseña ingresada es incorrecta.';
        } else {
          errorMessage = serverMessage || 'Datos inválidos. Verifique la información ingresada.';
        }
      } else if (error.response?.status === 403) {
        // Error de acceso denegado
        errorMessage = 'Acceso denegado. Tu cuenta puede estar bloqueada o inactiva.';
      } else if (error.response?.status === 422) {
        // Error de validación
        errorMessage = 'Datos de inicio de sesión inválidos. Revisa todos los campos.';
      } else if (error.response?.status === 429) {
        // Demasiados intentos
        errorMessage = 'Demasiados intentos de inicio de sesión. Por favor espera unos minutos.';
      } else if (error.response?.status >= 500) {
        // Error del servidor
        errorMessage = 'Error del servidor. Por favor intenta más tarde.';
      } else if (error.response?.data?.message) {
        // Mensaje personalizado del servidor
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Mensaje de error genérico
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Recargar captcha y limpiar solo el campo de captcha
      loadCaptcha();
      reset({ captcha: '' }, { 
        keepValues: true, 
        keepErrors: false,
        keepDefaultValues: true 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header compacto con degradado */}
        <div className="bg-white text-gray-600 text-center py-6 px-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full mb-3">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Bienvenido</h1>
          <p className="text-gray-700 text-sm mt-1">Sistema de Ventas Financieras</p>
        </div>

        <div className="p-6">
          {/* Error Alert con animación */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Formulario con espaciado optimizado */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className={`w-full px-3.5 py-2.5 border text-black rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                disabled={loading}
                {...register('email', { 
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo inválido'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input con toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 border text-black rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  disabled={loading}
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Captcha compacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Captcha <span className="text-red-500">*</span>
              </label>
              
              {loadingCaptcha ? (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 mt-2">Cargando...</p>
                </div>
              ) : captcha ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-3 text-center">
                      <span className="text-xl font-mono font-bold tracking-widest text-gray-800 select-none">
                        {captcha.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={loadCaptcha}
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 active:scale-95"
                      title="Recargar captcha"
                      disabled={loading || loadingCaptcha}
                    >
                      <RefreshCw className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Ingrese el código"
                    className={`w-full px-3.5 py-2.5 border text-black rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                      errors.captcha 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    disabled={loading}
                    autoComplete="off"
                    maxLength={6}
                    {...register('captcha', { 
                      required: 'El captcha es obligatorio',
                      minLength: {
                        value: 6,
                        message: 'Debe tener 6 caracteres'
                      },
                      maxLength: {
                        value: 6,
                        message: 'Debe tener 6 caracteres'
                      }
                    })}
                  />
                  {errors.captcha && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.captcha.message}
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
                  <p className="text-xs text-red-700 mb-2">Error al cargar captcha</p>
                  <button
                    type="button"
                    onClick={loadCaptcha}
                    className="text-xs text-red-600 hover:text-red-800 underline font-medium"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="space-y-2.5 pt-1">
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                disabled={!captcha || loading || loadingCaptcha}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              {/* Botón de volver */}
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full px-4 py-2.5 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all duration-300 active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Inicio</span>
              </button>
            </div>
          </form>

          {/* Info de usuarios de prueba - Compacta */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-semibold mb-1.5">👤 Usuarios de prueba:</p>
            <div className="space-y-0.5 text-xs text-blue-700">
              <p><strong>Admin:</strong> admin@banco.com / Admin123</p>
              <p><strong>Asesor:</strong> juan.perez@banco.com / Asesor123</p>
            </div>
          </div>

          {/* Debug info - Solo desarrollo */}
          {process.env.NODE_ENV === 'development' && captcha && (
            <div className="mt-3 p-2.5 bg-gray-50 rounded text-xs text-gray-600 border border-gray-200">
              <p className="font-semibold mb-0.5">🐛 Debug:</p>
              <p>Code: {captcha.code} | Expira: {new Date(captcha.expiresAt).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Estilos para animación shake */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}