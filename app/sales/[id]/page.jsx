'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Trash2, Edit } from 'lucide-react'; 
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select'; // Asegúrate que este componente usa forwardRef
import { salesApi } from '@/lib/api/sales';
import useAuthStore from '@/lib/store/authStore';
import { formatDate, formatCurrency } from '@/lib/utils/format'; 

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();

  const [sale, setSale] = useState(null);
  const [catalogs, setCatalogs] = useState({
    products: [],
    franchises: [],
    statuses: []
  });
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const productIdWatch = watch('product_id');

  // Calcula los datos de visualización (incluyendo el objeto 'product') cuando 'sale' cambia.
  const displayData = useMemo(() => {
    if (!sale) return { 
      productName: 'Cargando...', franchiseName: '-', requestedQuota: formatCurrency(0), 
      finalQuota: formatCurrency(0), rate: '-', statusName: 'Cargando...', statusId: null,
      createdAt: '-', createdBy: '-',
      product: null, 
    }; 
    
    const product = sale.product;
    const status = sale.status;
    
    const requestedQuotaValue = parseFloat(sale.requested_quota);
    const approvedQuotaValue = parseFloat(sale.approved_quota);

    const rateDisplay = sale.rate ? `${parseFloat(sale.rate)}%` : '-';
    
    const finalQuotaDisplay = sale.approved_quota 
      ? formatCurrency(approvedQuotaValue) 
      : formatCurrency(requestedQuotaValue);
      
    const franchiseName = product?.requires_franchise 
        ? sale.franchise?.name || 'Sin Franquicia' 
        : '-';

    return {
      productName: product?.name || 'Producto No Encontrado',
      franchiseName: franchiseName,
      requestedQuota: formatCurrency(requestedQuotaValue),
      finalQuota: finalQuotaDisplay,
      rate: rateDisplay,
      statusName: status?.name || 'Estado Desconocido',
      statusId: status?.id,
      createdAt: formatDate(sale.created_at),
      createdBy: sale.creator?.name || '-',
      product: product, 
    };
  }, [sale]); 
  
  // LÓGICA DE ESTADO: Determina el siguiente estado para un Asesor
  const getNextStatusData = useMemo(() => {
    if (!sale || !catalogs.statuses || user?.role?.name !== 'Asesor') return null;

    const currentStatusCode = sale.status?.code;
    let nextStatus = null;
    let buttonText = '';
    let isTransitionAllowed = false;

    // Asesor solo puede ir de Abierto a En Proceso
    if (currentStatusCode === 'OPEN') { 
        nextStatus = catalogs.statuses.find(s => s.code === 'IN_PROGRESS'); 
        buttonText = 'Mover a En Proceso';
        isTransitionAllowed = true;
    } 
    
    return { nextStatus, buttonText, isTransitionAllowed };
  }, [sale, catalogs.statuses, user?.role?.name]);

  // Función de carga de datos
  const loadData = async () => {
    try {
      const [saleResponse, catalogsResponse] = await Promise.all([
        salesApi.getById(params.id),
        salesApi.getCatalogs()
      ]);

      const saleData = saleResponse.data.data || saleResponse.data;
      setSale(saleData);
      
      const catalogsData = catalogsResponse.data.data || catalogsResponse.data;
      const loadedCatalogs = catalogsData || { products: [], franchises: [], statuses: [] };
      setCatalogs(loadedCatalogs);

      setSelectedProduct(saleData.product);
      
      const requestedQuotaNumber = parseFloat(saleData.requested_quota);

      // CRÍTICO: Convertir IDs a String para que el formulario Select funcione correctamente
      reset({
        product_id: String(saleData.product_id), 
        requested_quota: isNaN(requestedQuotaNumber) ? 0 : requestedQuotaNumber, 
        franchise_id: saleData.franchise_id ? String(saleData.franchise_id) : '', 
        rate: saleData.rate || '',
        status_id: saleData.status_id ? String(saleData.status_id) : '' 
      });

    } catch (error) {
      console.error('Error al cargar venta:', error); 
      alert('Error al cargar la venta');
      router.push('/sales');
    }
  };

  // Cargar datos al montar el componente o cambiar el ID
  useEffect(() => {
    loadData();
  }, [params.id]);

  // Actualizar selectedProduct si el usuario cambia el producto en el formulario
  useEffect(() => {
    if (isEditing && productIdWatch && catalogs?.products?.length) { 
      const product = catalogs.products.find(p => p.id === parseInt(productIdWatch)); 
      setSelectedProduct(product);
    }
  }, [isEditing, productIdWatch, catalogs]);

  // Función para cambiar el estado (llamada por el nuevo botón del Asesor)
  const handleStatusTransition = async () => {
    if (!getNextStatusData?.nextStatus) return;

    setLoading(true);
    try {
        const newStatusId = getNextStatusData.nextStatus.id;
        
        // Enviamos solo el status_id y el backend debe manejar la auditoría.
        await salesApi.update(params.id, { 
            status_id: newStatusId 
        });

        alert(`Venta movida a estado: ${getNextStatusData.nextStatus.name}`);
        await loadData(); // Recargar datos para reflejar el nuevo estado
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert(error.response?.data?.message || 'Error al cambiar el estado de la venta');
    } finally {
        setLoading(false);
    }
};

  // Actualizar venta (llamada por el formulario de edición)
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const saleData = {
        product_id: parseInt(data.product_id), 
        requested_quota: parseFloat(data.requested_quota)
      };

      if (selectedProduct?.requires_franchise) {
        saleData.franchise_id = parseInt(data.franchise_id);
      }
      if (selectedProduct?.requires_rate) {
        saleData.rate = parseFloat(data.rate);
      }

      // El administrador puede cambiar el estado con el select
      if (user?.role?.name === 'Administrador' && data.status_id) {
        saleData.status_id = parseInt(data.status_id);
      }

      await salesApi.update(params.id, saleData);
      alert('Venta actualizada exitosamente');
      await loadData(); 
      setIsEditing(false); 
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      alert(error.response?.data?.message || 'Error al actualizar la venta');
    } finally {
      setLoading(false);
    }
  };

  if (!sale) { 
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-gray-700 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando datos de la venta...</p>
        </div>
      </div>
    );
  }

  // Función para determinar el color del estado
  const getStatusColor = (statusId) => {
    switch(statusId) {
      case 1: return 'text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full font-medium'; // Abierto
      case 2: return 'text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium';  // En Proceso
      case 3: return 'text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium'; // Finalizado/Completed 
      default: return 'text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full font-medium';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-700 hover:bg-gray-200 rounded-full transition duration-150"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-blue-800">Venta #{sale.id}</h1>
              <p className="text-gray-500 mt-1">{isEditing ? 'Modificando detalles de la venta' : 'Detalles completos de la solicitud'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* El Asesor solo puede editar si la venta NO está Finalizada */}
            {user?.role?.name === 'Administrador' || sale.status?.code !== 'COMPLETED' ? (
                <Button
                    variant="secondary"
                    onClick={() => setIsEditing(!isEditing)}
                    loading={loading}
                    icon={<Edit className="w-4 h-4" />}
                >
                    {isEditing ? 'Ver Detalles' : 'Editar Venta'}
                </Button>
            ) : null}
          </div>
        </div>

        {/* ********************************************* */}
        {/* BLOQUE DE ACCIÓN DE ESTADO (SOLO ASESOR)     */}
        {/* ********************************************* */}
        {!isEditing && user?.role?.name === 'Asesor' && getNextStatusData?.isTransitionAllowed && (
            <Card title="Acción de Estado" className="shadow-md border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                    <p className="text-gray-700">
                        La venta está en estado **{sale.status.name}**. 
                        Haga clic para avanzar a **{getNextStatusData.nextStatus.name}**.
                    </p>
                    <Button
                        variant="primary"
                        onClick={handleStatusTransition}
                        loading={loading}
                    >
                        {getNextStatusData.buttonText}
                    </Button>
                </div>
            </Card>
        )}

        {/* ********************************************* */}
        {/* DETALLES DE LA VENTA (MODO VER)               */}
        {/* ********************************************* */}
        {!isEditing && (
          <>
            <Card title="Resumen de la Venta" className="bg-white shadow-lg border-l-4 border-blue-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-semibold mb-1">Producto</span>
                  <span className="font-bold text-gray-900 text-base">{displayData.productName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-semibold mb-1">Franquicia</span>
                  <span className="font-bold text-gray-900 text-base">{displayData.franchiseName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-semibold mb-1">Cupo Solicitado</span>
                  <span className="font-bold text-blue-600 text-base">{displayData.requestedQuota}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-semibold mb-1">Estado</span>
                  <span className={getStatusColor(displayData.statusId)}>
                    {displayData.statusName}
                  </span>
                </div>
                
                {/* Campos condicionales */}
                {sale.product?.requires_rate && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-semibold mb-1">Tasa de Interés</span>
                    <span className="font-medium text-gray-700">{displayData.rate}</span>
                  </div>
                )}
                {sale.approved_quota && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-semibold mb-1">Cupo Aprobado</span>
                    <span className="font-bold text-green-700">{displayData.finalQuota}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Información de Auditoría" className="shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Creado por</span>
                  <span className="font-medium text-gray-800">{displayData.createdBy}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Fecha de creación</span>
                  <span className="font-medium text-gray-800">{displayData.createdAt}</span>
                </div>
                {sale.updater && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Última actualización por</span>
                      <span className="font-medium text-gray-800">{sale.updater?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Fecha de actualización</span>
                      <span className="font-medium text-gray-800">{formatDate(sale.updated_at)}</span>
                    </div>
                  </>
                )}
                {/* Campos de Auditoría de Estado */}
                {sale.status_changed_at && (
                    <>
                        <div className="flex flex-col">
                            <span className="text-gray-500">Último cambio de estado</span>
                            <span className="font-medium text-gray-800">{formatDate(sale.status_changed_at)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">Cambiado por</span>
                            <span className="font-medium text-gray-800">{sale.status_changed_by_user_id ? sale.status_changed_by_user_id : 'Sistema'}</span>
                        </div>
                    </>
                )}
              </div>
            </Card>
          </>
        )}
        
        {/* ********************************************* */}
        {/* FORMULARIO DE EDICIÓN (MODO EDITAR)           */}
        {/* ********************************************* */}
        {isEditing && (
          <Card title="Formulario de Edición de Venta">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-black">
              
              {/* Producto (Bloqueado si no es Admin) */}
              <Select
                label="Producto*"
                options={catalogs?.products?.map(p => ({
                  value: String(p.id), 
                  label: p.name
                })) || []}
                {...register('product_id', { 
                  required: 'El producto es obligatorio',
                  validate: value => value !== '' || 'El producto es obligatorio' 
                })}
                error={errors.product_id?.message}
                required
                disabled={user?.role?.name !== 'Administrador'} // Solo admin puede cambiar producto
              />

              {/* Cupo Solicitado */}
              <Input
                label="Cupo Solicitado *"
                type="number"
                step="0.01"
                placeholder="Ej: 5000000"
                {...register('requested_quota', { 
                  required: 'El cupo solicitado es obligatorio',
                  min: { value: 1, message: 'El cupo debe ser mayor a 0' }
                })}
                error={errors.requested_quota?.message}
                required
                disabled={sale.status?.code === 'COMPLETED' && user?.role?.name !== 'Administrador'}
              />

              {/* Franquicia (solo si aplica) */}
              {selectedProduct?.requires_franchise && (
                <Select
                  label="Franquicia*"
                  options={catalogs?.franchises?.map(f => ({
                    value: String(f.id), 
                    label: f.name
                  })) || []}
                  {...register('franchise_id', { 
                    required: 'La franquicia es obligatoria para este producto' 
                  })}
                  error={errors.franchise_id?.message}
                  required
                  disabled={user?.role?.name !== 'Administrador'} // Solo admin puede cambiar franquicia
                />
              )}

              {/* Tasa (solo si aplica) */}
              {selectedProduct?.requires_rate && (
                <Input
                  label="Tasa de Interés (%)*"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 12.50"
                  {...register('rate', { 
                    required: 'La tasa es obligatoria para este producto',
                    min: { value: 0, message: 'La tasa debe ser mayor o igual a 0' },
                    max: { value: 99.99, message: 'La tasa no puede superar 99.99' }
                  })}
                  error={errors.rate?.message}
                  required
                  disabled={user?.role?.name !== 'Administrador'} // Solo admin puede cambiar tasa
                />
              )}

              {/* ESTADO (Solo Admin) */}
              {user?.role?.name === 'Administrador' && (
                <Select
                  label="Estado"
                  options={catalogs?.statuses?.map(s => ({
                    value: String(s.id), 
                    label: s.name
                  })) || []}
                  {...register('status_id')}
                />
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="flex-1"
                  icon={<Edit className="w-4 h-4" />}
                >
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}