'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LogIn, RefreshCw, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, initAuth } = useAuth(); // ✅ Agregar initAuth aquí
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // ✅ Inicializar auth al cargar
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
        
        // Guardar en el store usando la función login
        login(token, user);

        console.log('✅ Login exitoso, redirigiendo...');

        // Redirigir al dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión';
      
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-600 mt-2">Sistema de Ventas Financieras</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className={`w-full px-4 py-2 border text-black rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
         <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña <span className="text-red-500">*</span>
          </label>

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`w-full px-4 py-2 border text-black rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            } disabled:bg-gray-100 disabled:cursor-not-allowed pr-10`} // espacio para el ícono
            disabled={loading}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres',
              },
            })}
          />

          {/* Icono del ojo centrado verticalmente */}
          <div className="absolute top-3 right-3 h-full flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Captcha <span className="text-red-500">*</span>
            </label>
            
            {loadingCaptcha ? (
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-8 text-center">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Cargando captcha...</p>
              </div>
            ) : captcha ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
                    <span className="text-2xl font-mono font-bold tracking-widest text-gray-800 select-none">
                      {captcha.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={loadCaptcha}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
                    title="Recargar captcha"
                    disabled={loading || loadingCaptcha}
                  >
                    <RefreshCw className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ingrese el código captcha"
                  className={`w-full px-4 py-2 border text-black rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      message: 'El captcha debe tener 6 caracteres'
                    },
                    maxLength: {
                      value: 6,
                      message: 'El captcha debe tener 6 caracteres'
                    }
                  })}
                />
                {errors.captcha && (
                  <p className="mt-1 text-sm text-red-600">{errors.captcha.message}</p>
                )}
              </>
            ) : (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-700 mb-2">Error al cargar captcha</p>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={!captcha || loading || loadingCaptcha}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          {/* 🔽 Botón de volver a inicio (debajo del botón de iniciar sesión) */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="
            w-full mt-3 px-4 py-3
            flex items-center justify-center gap-2
            bg-white border border-gray-300
            text-blue-700 font-medium rounded-lg
            hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500
            hover:text-white
            transition-all duration-300 ease-in-out
          "
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </button>
        </form>

        {/* Info de usuarios de prueba */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 font-semibold mb-2">👤 Usuarios de prueba:</p>
          <div className="space-y-1">
            <p className="text-xs text-blue-700">
              <strong>Admin:</strong> admin@banco.com / Admin123
            </p>
            <p className="text-xs text-blue-700">
              <strong>Asesor:</strong> juan.perez@banco.com / Asesor123
            </p>
          </div>
        </div>

        {/* Debug info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && captcha && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <p className="font-semibold mb-1">🐛 Debug Info:</p>
            <p>Captcha Code: {captcha.code}</p>
            {/* <p>Token: {captcha.token?.substring(0, 30)}...</p> */}
            <p>Expira: {new Date(captcha.expiresAt).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}