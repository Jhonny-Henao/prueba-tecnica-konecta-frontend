'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CreditCard, TrendingUp, Percent, Building2, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { salesApi } from '@/lib/api/sales';

export default function NewSalePage() {
  const router = useRouter();
  const [catalogs, setCatalogs] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      product_id: '',
      requested_quota: '',
      franchise_id: '',
      rate: ''
    }
  });
  
  const productIdWatch = watch('product_id');

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (productIdWatch && productIdWatch !== '' && catalogs?.products) {
      const product = catalogs.products.find(p => p.id === parseInt(productIdWatch));
      console.log('🔍 Producto seleccionado:', product);
      setSelectedProduct(product);
      
      if (!product?.requires_franchise) {
        setValue('franchise_id', '');
      }
      if (!product?.requires_rate) {
        setValue('rate', '');
      }
    } else {
      setSelectedProduct(null);
    }
  }, [productIdWatch, catalogs, setValue]);

  const loadCatalogs = async () => {
    try {
      setError(null);
      const response = await salesApi.getCatalogs();
      console.log('📦 Respuesta completa:', response);
      
      const catalogsData = response.data?.data || response.data || response;
      console.log('📦 Catalogs Data:', catalogsData);
      
      if (!catalogsData.products || !Array.isArray(catalogsData.products)) {
        throw new Error('Estructura de catálogos inválida');
      }
      
      setCatalogs(catalogsData);
    } catch (error) {
      console.error('❌ Error al cargar catálogos:', error);
      setError('Error al cargar los catálogos. Por favor, intenta de nuevo.');
    }
  };

  const onSubmit = async (data) => {
    console.log('📝 Datos del formulario:', data);
    
    setLoading(true);
    setError(null);
    
    try {
      const saleData = {
        product_id: parseInt(data.product_id),
        requested_quota: parseFloat(data.requested_quota)
      };

      if (selectedProduct?.requires_franchise && data.franchise_id) {
        saleData.franchise_id = parseInt(data.franchise_id);
      }
      
      if (selectedProduct?.requires_rate && data.rate) {
        saleData.rate = parseFloat(data.rate);
      }

      console.log('📤 Enviando venta:', saleData);
      
      const response = await salesApi.create(saleData);
      console.log('✅ Venta creada:', response);
      
      alert('✅ Venta creada exitosamente');
      
      reset();
      setSelectedProduct(null);
      router.push('/sales');
      
    } catch (error) {
      console.error('❌ Error al crear venta:', error);
      console.error('❌ Response:', error.response);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Error al crear la venta. Por favor, verifica los datos.';
      
      setError(errorMessage);
      alert('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!catalogs && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Cargando catálogos...</p>
        </div>
      </div>
    );
  }

  if (error && !catalogs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-bold text-xl">Error al cargar</p>
          <p className="text-gray-600 mt-3">{error}</p>
          <Button onClick={loadCatalogs} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Mejorado */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                Dashboard
              </span>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Nueva Venta
                  </h1>
                  <p className="text-gray-600 mt-1">Radicar un nuevo producto financiero</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de error general */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl shadow-md p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario Principal */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Producto con Cards Visuales */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Selecciona el Producto
                <span className="text-red-500">*</span>
              </label>
              <select
                {...register('product_id', { 
                  required: 'El producto es obligatorio',
                  validate: value => value !== '' || 'Debes seleccionar un producto'
                })}
                className="w-full px-4 py-3 border-2 text-gray-800 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              >
                <option value="">Seleccione un producto...</option>
                {catalogs.products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.product_id.message}
                </p>
              )}
            </div>

            {/* Información del producto seleccionado - Mejorada */}
            {selectedProduct && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      {selectedProduct.name}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {selectedProduct.requires_franchise && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Requiere franquicia
                        </span>
                      )}
                      {selectedProduct.requires_rate && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Requiere tasa de interés
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cupo Solicitado */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                Cupo Solicitado
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="5,000,000"
                  {...register('requested_quota', { 
                    required: 'El cupo solicitado es obligatorio',
                    min: { value: 1, message: 'El cupo debe ser mayor a 0' }
                  })}
                  className="w-full pl-8 pr-4 py-3 border-2 text-gray-800 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 hover:bg-white"
                />
              </div>
              {errors.requested_quota && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.requested_quota.message}
                </p>
              )}
            </div>

            {/* Franquicia (Condicional) */}
            {selectedProduct?.requires_franchise && catalogs.franchises && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Franquicia
                  <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('franchise_id', { 
                    required: 'La franquicia es obligatoria para este producto',
                    validate: value => value !== '' || 'Debes seleccionar una franquicia'
                  })}
                  className="w-full px-4 py-3 border-2 text-gray-800 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 hover:bg-white"
                >
                  <option value="">Seleccione una franquicia...</option>
                  {catalogs.franchises.map(franchise => (
                    <option key={franchise.id} value={franchise.id}>
                      {franchise.name}
                    </option>
                  ))}
                </select>
                {errors.franchise_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.franchise_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Tasa de Interés (Condicional) */}
            {selectedProduct?.requires_rate && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <Percent className="w-4 h-4 text-orange-600" />
                  Tasa de Interés
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="99.99"
                    placeholder="12.50"
                    {...register('rate', { 
                      required: 'La tasa es obligatoria para este producto',
                      min: { value: 0, message: 'La tasa debe ser mayor o igual a 0' },
                      max: { value: 99.99, message: 'La tasa no puede superar 99.99' }
                    })}
                    className="w-full px-4 pr-12 py-3 border-2 text-gray-800 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 hover:bg-white"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 font-medium">%</span>
                </div>
                {errors.rate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.rate.message}
                  </p>
                )}
              </div>
            )}

            {/* Resumen Visual */}
            {selectedProduct && watch('requested_quota') && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="font-bold text-gray-900">Resumen de la Venta</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Producto</p>
                    <p className="text-gray-900 font-semibold">{selectedProduct.name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">Cupo Solicitado</p>
                    <p className="text-green-600 font-bold text-lg">
                      ${parseFloat(watch('requested_quota')).toLocaleString('es-CO')}
                    </p>
                  </div>
                  {selectedProduct.requires_rate && watch('rate') && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-medium mb-1">Tasa de Interés</p>
                      <p className="text-orange-600 font-bold text-lg">{watch('rate')}%</p>
                    </div>
                  )}
                  {selectedProduct.requires_franchise && watch('franchise_id') && catalogs.franchises && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-medium mb-1">Franquicia</p>
                      <p className="text-purple-600 font-semibold">
                        {catalogs.franchises.find(f => f.id === parseInt(watch('franchise_id')))?.name || 'Seleccionada'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Crear Venta
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
                className="px-8 py-4 border-2 text-gray-700 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Información de Ayuda - Mejorada */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-3">Información Importante</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-semibold text-blue-600 mb-1">Crédito de Consumo</p>
                  <p className="text-gray-600 text-xs">Requiere tasa de interés</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-semibold text-purple-600 mb-1">Libranza</p>
                  <p className="text-gray-600 text-xs">Requiere tasa de interés</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-semibold text-green-600 mb-1">Tarjeta de Crédito</p>
                  <p className="text-gray-600 text-xs">Requiere franquicia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}