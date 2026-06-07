import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import Spinner from '../../components/Spinner';

const ROLE_BADGE = { admin: 'bg-red-100 text-red-700', freelancer: 'bg-purple-100 text-purple-700', client: 'bg-blue-100 text-blue-700' };
const ROLE_LABEL = { admin: 'Admin', freelancer: 'Freelancer', client: 'Cliente' };

export default function AdminUsers() {
  const [data, setData] = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', isBanned: '', search: '' });
  const [toast, setToast] = useState('');
  const [editModal, setEditModal] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetch = async (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.role) params.role = f.role;
    if (f.isBanned !== '') params.isBanned = f.isBanned;
    if (f.search) params.search = f.search;
    try {
      const r = await api.get('/admin/users', { params });
      setData(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetch(next);
  };

  const toggleBan = async (user) => {
    const action = user.isBanned ? 'desbanear' : 'banear';
    if (!confirm(`¿${action} a ${user.name}?`)) return;
    try {
      await api.put(`/admin/users/${user._id}`, { isBanned: !user.isBanned, isActive: user.isBanned });
      showToast(`Usuario ${action === 'banear' ? 'baneado' : 'desbaneado'} correctamente`);
      fetch();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  const deleteUser = async (user) => {
    if (!confirm(`¿Eliminar permanentemente a ${user.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      showToast('Usuario eliminado');
      fetch();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/users/${editModal._id}`, { name: editModal.name, role: editModal.role });
      showToast('Usuario actualizado');
      setEditModal(null);
      fetch();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm">{toast}</div>}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios <span className="text-gray-400 text-base font-normal">({data.total})</span></h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
          <input
            value={filters.search}
            onChange={(e) => handleFilter('search', e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={filters.role} onChange={(e) => handleFilter('role', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los roles</option>
            <option value="client">Cliente</option>
            <option value="freelancer">Freelancer</option>
            <option value="admin">Admin</option>
          </select>
          <select value={filters.isBanned} onChange={(e) => handleFilter('isBanned', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="false">Activos</option>
            <option value="true">Baneados</option>
          </select>
          <button onClick={() => { const r = { role: '', isBanned: '', search: '' }; setFilters(r); fetch(r); }} className="text-sm text-blue-600 hover:underline px-2">Limpiar</button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? <Spinner className="py-10" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Usuario</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Rol</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Registro</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-600 font-bold text-xs">{u.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isBanned
                          ? <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Baneado</span>
                          : <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('es')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditModal({ ...u })} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors">Editar</button>
                          <button onClick={() => toggleBan(u)} className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${u.isBanned ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-orange-100 hover:bg-orange-200 text-orange-700'}`}>
                            {u.isBanned ? 'Desbanear' : 'Banear'}
                          </button>
                          {u.role !== 'admin' && (
                            <button onClick={() => deleteUser(u)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg transition-colors">Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.users.length === 0 && <p className="text-center text-gray-400 py-10">No se encontraron usuarios.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Editar usuario</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select value={editModal.role} onChange={(e) => setEditModal({ ...editModal, role: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="client">Cliente</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditModal(null)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={saveEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-sm transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
