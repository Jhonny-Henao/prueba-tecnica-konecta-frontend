'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Shield, ArrowLeft, Search, X } from 'lucide-react';
import { usersApi } from '@/lib/api/users';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll();
      
      console.log('📥 Respuesta completa:', response);
      
      let usersData = [];
      
      // Adaptar a diferentes estructuras de respuesta
      if (response.data?.data) {
        usersData = response.data.data;
      } else if (response.data?.users) {
        usersData = response.data.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }
      
      console.log('👥 Usuarios cargados:', usersData);
      
      // Verificar que sea un array
      if (!Array.isArray(usersData)) {
        console.error('❌ usersData no es un array:', usersData);
        usersData = [];
      }
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      console.error('📋 Detalles del error:', error.response?.data);
      alert(error.response?.data?.message || 'Error al cargar los usuarios. Verifica tu conexión.');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.name?.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(id);
    try {
      await usersApi.delete(id);
      alert('✅ Usuario eliminado exitosamente');
      await loadUsers();
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      alert(error.response?.data?.message || 'Error al eliminar el usuario');
    } finally {
      setDeleting(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
              <p className="text-slate-600 mt-1">Administración de usuarios del sistema</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/users/new')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
            <p className="text-4xl font-bold mt-2">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-purple-100 text-sm font-medium">Administradores</p>
            <p className="text-4xl font-bold mt-2">
              {users.filter(u => u.role?.name === 'Administrador' || u.role?.name === 'Admin').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-green-100 text-sm font-medium">Asesores</p>
            <p className="text-4xl font-bold mt-2">
              {users.filter(u => u.role?.name === 'Asesor').length}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-slate-600">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </p>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                          <Shield className="w-12 h-12 text-slate-400" />
                        </div>
                        {searchTerm ? (
                          <>
                            <p className="text-slate-700 text-lg font-semibold">No se encontraron resultados</p>
                            <p className="text-slate-500 text-sm mt-1 mb-4">
                              Intenta con otros términos de búsqueda
                            </p>
                            <button
                              onClick={clearSearch}
                              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all"
                            >
                              <X className="w-4 h-4" />
                              Limpiar búsqueda
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-slate-700 text-lg font-semibold">No hay usuarios registrados</p>
                            <p className="text-slate-500 text-sm mt-1 mb-4">Crea el primer usuario para comenzar</p>
                            <button
                              onClick={() => router.push('/users/new')}
                              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Nuevo Usuario
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">
                              {user.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                          user.role?.name === 'Administrador' || user.role?.name === 'Admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {(user.role?.name === 'Administrador' || user.role?.name === 'Admin') && <Shield className="w-3 h-3" />}
                          {user.role?.name || 'Sin rol'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 font-medium">
                          {formatDate(user.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/users/${user.id}`)}
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deleting === user.id}
                            className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar usuario"
                          >
                            {deleting === user.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        {filteredUsers.length > 0 && (
          <div className="text-center text-sm text-slate-500">
            Mostrando {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}