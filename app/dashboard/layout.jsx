'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/store/authStore';
import { LayoutDashboard, ShoppingCart, Users, BarChart3, LogOut, Menu, X, TrendingUp } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      console.log('🔐 Estado de autenticación:', isAuth);
      
      if (!isAuth) {
        console.log('❌ No autenticado, redirigiendo a login...');
        router.push('/login');
      } else {
        console.log('✅ Usuario autenticado:', user);
      }
    };
    
    verifyAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user?.role?.name === 'Administrador';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Ventas', href: '/sales', icon: ShoppingCart, show: true },
    { name: 'Usuarios', href: '/users', icon: Users, show: isAdmin },
    { name: 'Estadísticas', href: '/stats', icon: BarChart3, show: isAdmin },
  ].filter(item => item.show);

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar Profesional */}
      <nav className="bg-white border-b border-slate-200 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y Navegación Desktop */}
            <div className="flex">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sistema Financiero
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">Portal de Ventas</p>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Menu Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {user?.role?.name}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Info Mobile */}
            <div className="px-4 py-4 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {user?.role?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 shadow-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © 2025 Sistema Financiero. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}