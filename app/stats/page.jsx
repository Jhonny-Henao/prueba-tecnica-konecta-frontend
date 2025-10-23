'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/authStore';
import { statsApi } from '@/lib/api/stats';
import { ArrowLeft } from 'lucide-react';


export default function StatsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [salesByAdvisor, setSalesByAdvisor] = useState([]);
  const [quotasByProduct, setQuotasByProduct] = useState([]);
  const [salesByStatus, setSalesByStatus] = useState([]);
  const [period, setPeriod] = useState('month');
  const [salesByDate, setSalesByDate] = useState([]);

  const isAdmin = user?.role?.name === 'Administrador';

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadStatistics();
  }, [isAdmin, period]);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      const [dashboardRes, advisorRes, productRes, statusRes, dateRes] = await Promise.all([
        statsApi.getDashboard(),
        statsApi.getSalesByAdvisor(),
        statsApi.getQuotasByProduct(),
        statsApi.getSalesByStatus(),
        statsApi.getSalesByDate(period)
      ]);

      console.log('Dashboard Response:', dashboardRes);
      console.log('Sales by Advisor Response:', advisorRes);
      console.log('Quotas by Product Response:', productRes);
      console.log('Sales by Status Response:', statusRes);
      console.log('Sales by Date Response:', dateRes);

      // Extraer la data correctamente
      setDashboard(dashboardRes.data?.data || dashboardRes.data || {});
      setSalesByAdvisor(Array.isArray(advisorRes.data?.data) ? advisorRes.data.data : (Array.isArray(advisorRes.data) ? advisorRes.data : []));
      setQuotasByProduct(Array.isArray(productRes.data?.data) ? productRes.data.data : (Array.isArray(productRes.data) ? productRes.data : []));
      setSalesByStatus(Array.isArray(statusRes.data?.data) ? statusRes.data.data : (Array.isArray(statusRes.data) ? statusRes.data : []));
      setSalesByDate(Array.isArray(dateRes.data?.data) ? dateRes.data.data : (Array.isArray(dateRes.data) ? dateRes.data : []));
    } catch (error) {
      console.error('Error loading statistics:', error);
      console.error('Error details:', error.response?.data);
      alert('Error al cargar las estadísticas: ' + (error.response?.data?.message || error.message));
      setDashboard({});
      setSalesByAdvisor([]);
      setQuotasByProduct([]);
      setSalesByStatus([]);
      setSalesByDate([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Finalizado':
        return 'bg-green-500';
      case 'En Proceso':
        return 'bg-yellow-500';
      case 'Abierto':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProductColor = (index) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    return colors[index % colors.length];
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <div className="bg-white">
            <h1 className="text-2xl font-bold text-gray-900">Estadísticas y Reportes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Dashboard con métricas y análisis del sistema
            </p>
          </div>

        {/* Dashboard General */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                    Total Ventas
                  </p>
                  <p className="text-3xl font-bold mt-2">{dashboard.total_sales || 0}</p>
                </div>
                <svg className="h-12 w-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium uppercase tracking-wide">
                    Cupo Total
                  </p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.total_quotas)}</p>
                </div>
                <svg className="h-12 w-12 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">
                    Usuarios Activos
                  </p>
                  <p className="text-3xl font-bold mt-2">{dashboard.total_users || 0}</p>
                </div>
                <svg className="h-12 w-12 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">
                    Cupo Promedio
                  </p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.average_quota)}</p>
                </div>
                <svg className="h-12 w-12 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Ventas por Asesor y Cupos por Producto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas por Asesor */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Ventas por Asesor
              </h3>
            </div>
            <div className="p-6 bg-white">
              {!salesByAdvisor || salesByAdvisor.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay datos disponibles</p>
              ) : (
                <div className="space-y-4">
                  {salesByAdvisor.map((item, index) => {
                    const maxSales = salesByAdvisor[0]?.total_sales || 1;
                    const percentage = (item.total_sales / maxSales) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {item.advisor?.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {item.advisor?.name || 'Sin nombre'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.total_sales || 0} ventas
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Cupo total: {formatCurrency(item.total_quota)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cupos por Producto */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Cupos por Producto
              </h3>
            </div>
            <div className="p-6 bg-white">
              {!quotasByProduct || quotasByProduct.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay datos disponibles</p>
              ) : (
                <div className="space-y-4">
                  {quotasByProduct.map((item, index) => {
                    const maxQuota = quotasByProduct[0]?.total_quota || 1;
                    const percentage = (item.total_quota / maxQuota) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-3 w-3 ${getProductColor(index)} rounded-full`}></div>
                            <p className="ml-3 text-sm font-medium text-gray-900">
                              {item.product?.name || 'Sin nombre'}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.total_sales || 0} ventas
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${getProductColor(index)} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(item.total_quota)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ventas por Estado */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Ventas por Estado
            </h3>
          </div>
          <div className="p-6 bg-white">
            {!salesByStatus || salesByStatus.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay datos disponibles</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {salesByStatus.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{item.status?.name || 'Sin estado'}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{item.total_sales || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(item.total_quota)}
                        </p>
                      </div>
                      <div className={`h-12 w-12 ${getStatusColor(item.status?.name)} rounded-full flex items-center justify-center`}>
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ventas por Fecha */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Ventas por Fecha
            </h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="day">Por Día</option>
              <option value="month">Por Mes</option>
              <option value="year">Por Año</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad de Ventas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cupo Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!salesByDate || salesByDate.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay datos disponibles para este período
                    </td>
                  </tr>
                ) : (
                  salesByDate.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.period || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.total_sales || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.total_quota)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}