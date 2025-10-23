'use client';
import { useEffect, useState } from 'react';
import useAuth from '@/lib/store/authStore';
import { salesApi } from '@/lib/api/sales';
import Link from 'next/link';
import { TrendingUp, ShoppingCart, Package, Plus, FileText, BarChart3, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role?.name === 'Administrador';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar todas las ventas
      const salesResponse = await salesApi.getAll();
      console.log('📦 Sales response:', salesResponse.data);
      
      // Adaptar a diferentes estructuras de respuesta
      let salesData = [];
      if (salesResponse.data?.data) {
        salesData = salesResponse.data.data;
      } else if (salesResponse.data?.sales) {
        salesData = salesResponse.data.sales;
      } else if (Array.isArray(salesResponse.data)) {
        salesData = salesResponse.data;
      }
      
      setSales(Array.isArray(salesData) ? salesData : []);

    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Convertir a número de forma segura
  const parseQuota = (value) => {
    if (!value) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value) => {
    const numValue = parseQuota(value);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numValue);
  };

  // Calcular estadísticas desde las ventas
  const totalSales = sales.length;
  const totalQuotas = sales.reduce((sum, sale) => sum + parseQuota(sale.requested_quota), 0);
  const approvedCount = sales.filter(sale => {
    const statusName = sale.status?.name || sale.status || '';
    return statusName === 'Finalizado';
  }).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  } 

  return (
    <div className="space-y-6">
      {/* Header Profesional */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.2),transparent_70%)]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                ¡Bienvenido, {user?.name}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-3 py-1 text-sm text-blue-200">
                  {user?.role?.name}
                </span>
                <span className="text-slate-300 text-sm">
                  • {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Total Ventas
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {totalSales}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ventas registradas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Aprobadas
                </p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {approvedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ventas aprobadas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Cupo Solicitado
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalQuotas)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total solicitado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/sales/new"
            className="group flex items-center p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Plus className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-900">Nueva Venta</p>
              <p className="text-xs text-gray-500">Radicar producto</p>
            </div>
          </Link>

          <Link
            href="/sales"
            className="group flex items-center p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
              <FileText className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-900">Ver Ventas</p>
              <p className="text-xs text-gray-500">Listado completo</p>
            </div>
          </Link>

          {isAdmin && (
            <Link
              href="/stats"
              className="group flex items-center p-5 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-900">Estadísticas</p>
                <p className="text-xs text-gray-500">Reportes y gráficos</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Últimas Ventas */}
      {sales.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              Últimas Ventas
            </h2>
            <Link 
              href="/sales"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {sale.product?.name || sale.product_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(sale.requested_quota)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    (sale.status?.name || sale.status) === 'Finalizado' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {sale.status?.name || sale.status || 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}