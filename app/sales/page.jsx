'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, TrendingUp, DollarSign, CheckCircle, Edit } from 'lucide-react';
import { salesApi } from '@/lib/api/sales';
import { layout } from '@/app/dashboard/layout'

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesApi.getAll();
      console.log('📦 Respuesta completa de ventas:', response);
      
      // Adaptar a diferentes estructuras de respuesta
      let salesData = [];
      
      if (response.data?.data) {
        salesData = response.data.data;
      } else if (response.data?.sales) {
        salesData = response.data.sales;
      } else if (Array.isArray(response.data)) {
        salesData = response.data;
      } else if (Array.isArray(response)) {
        salesData = response;
      }
      
      console.log('📦 Sales Data procesada:', salesData);
      
      // Verificar que sea un array
      if (!Array.isArray(salesData)) {
        console.error('❌ salesData no es un array:', salesData);
        salesData = [];
      }
      
      setSales(salesData);
    } catch (error) {
      console.error('❌ Error al cargar ventas:', error);
      console.error('❌ Response:', error.response);
      setError('Error al cargar las ventas');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta venta?')) return;
    
    try {
      await salesApi.delete(id);
      alert('✅ Venta eliminada exitosamente');
      // Recargar ventas después de eliminar
      loadSales();
    } catch (error) {
      console.error('❌ Error al eliminar venta:', error);
      alert('❌ Error al eliminar la venta: ' + (error.response?.data?.message || error.message));
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pendiente': 'bg-amber-50 text-amber-700 border-amber-200',
      'Aprobada': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Rechazada': 'bg-rose-50 text-rose-700 border-rose-200',
      'En Revisión': 'bg-blue-50 text-blue-700 border-blue-200',
      'Abierto': 'bg-sky-50 text-sky-700 border-sky-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusConfig[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  // Calcular totales correctamente
  const totalRequested = sales.reduce((sum, sale) => sum + parseQuota(sale.requested_quota), 0);
  const totalApproved = sales.reduce((sum, sale) => sum + parseQuota(sale.approved_quota), 0);
  const approvedCount = sales.filter(sale => {
    const statusName = sale.status?.name || sale.status || '';
    return statusName === 'Aprobada';
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header con botón de regreso */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <div className="h-8 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mis Ventas</h1>
              <p className="text-slate-600 mt-1">Gestiona tus productos financieros</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/sales/new')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nueva Venta
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-6 py-4 rounded-lg shadow-sm">
            <p className="font-semibold">⚠️ Error</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={loadSales} 
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Stats cards */}
        {sales && sales.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Ventas</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {sales.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Aprobadas</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {approvedCount}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Cupo Solicitado</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {formatCurrency(totalRequested)}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Cupo Aprobado</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    {formatCurrency(totalApproved)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de ventas */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cupo Solicitado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cupo Aprobado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {!sales || sales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                          <svg
                            className="w-12 h-12 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-slate-700 text-lg font-semibold">No hay ventas registradas</p>
                        <p className="text-slate-500 text-sm mt-1 mb-4">Crea tu primera venta para comenzar</p>
                        <button
                          onClick={() => router.push('/sales/new')}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Nueva Venta
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">
                          #{sale.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {sale.product?.name || sale.product_name || 'N/A'}
                        </div>
                        {sale.franchise?.name && (
                          <div className="text-xs text-slate-600 mt-1 font-medium">
                            {sale.franchise.name}
                          </div>
                        )}
                        {sale.rate && (
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                            Tasa: {sale.rate}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">
                          {formatCurrency(sale.requested_quota)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-600">
                          {sale.approved_quota 
                            ? formatCurrency(sale.approved_quota)
                            : <span className="text-slate-400">-</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sale.status?.name || sale.status || 'Pendiente')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {formatDate(sale.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/sales/${sale.id}`)}
                          className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-rose-600 hover:text-white hover:bg-rose-600 p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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