'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LayoutDashboard, FileText, Users, TrendingUp, ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const goToLogin = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  const features = [
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Panel de Control",
      description: "Visualiza tus métricas y gestiona tu operación diaria"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Solicitudes de Crédito",
      description: "Procesa y da seguimiento a las solicitudes de tus clientes"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestión de Clientes",
      description: "Administra tu cartera de clientes de forma eficiente"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Reportes de Ventas",
      description: "Consulta tus comisiones y desempeño en tiempo real"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">Portal de Asesores</span>
            </div>
            <div className="text-sm text-blue-300">
              Acceso Interno
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm font-medium">Sistema Interno</span>
            </div>

            {/* Título principal */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Bienvenido a tu
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                Espacio de Trabajo
              </span>
            </h1>

            {/* Descripción */}
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Accede a tus herramientas de trabajo para gestionar productos financieros, 
              atender solicitudes de crédito y dar seguimiento a tus ventas.
            </p>

            {/* CTA Button */}
            <button
              onClick={goToLogin}
              disabled={loading}
              className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-10 py-4 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Cargando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            <p className="text-slate-400 text-sm mt-4">
              Ingresa con tus credenciales de asesor o administrador
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Info adicional */}
            <div className="mt-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-white font-semibold text-xl mb-4">
                Para el equipo interno
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="text-blue-300 font-medium mb-2">Asesores</h4>
                  <p className="text-slate-400 text-sm">
                    Gestiona tu cartera de clientes, solicitudes de crédito y consulta tus comisiones de ventas.
                  </p>
                </div>
                <div>
                  <h4 className="text-purple-300 font-medium mb-2">Administradores</h4>
                  <p className="text-slate-400 text-sm">
                    Acceso completo al sistema para supervisar operaciones, gestionar usuarios y generar reportes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
            <p>© 2025 Sistema Interno de Ventas Financieras · Uso exclusivo para personal autorizado</p>
          </div>
        </footer>
      </div>
    </div>
  );
}