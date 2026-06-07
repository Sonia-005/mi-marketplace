import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import Spinner from '../../components/Spinner';

const CATEGORIES = ['diseño', 'desarrollo', 'marketing', 'redacción', 'video', 'otro'];

export default function AdminServices() {
  const [data, setData] = useState({ services: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', isActive: '' });
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetch = async (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.category) params.category = f.category;
    if (f.isActive !== '') params.isActive = f.isActive;
    try {
      const r = await api.get('/admin/services', { params });
      setData(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetch(next);
  };

  const toggleActive = async (service) => {
    if (!confirm(`¿${service.isActive ? 'Desactivar' : 'Activar'} "${service.title}"?`)) return;
    try {
      await api.put(`/admin/services/${service._id}`, { isActive: !service.isActive });
      showToast(`Servicio ${service.isActive ? 'desactivado' : 'activado'}`);
      fetch();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  const deleteService = async (service) => {
    if (!confirm(`¿Eliminar permanentemente "${service.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/admin/services/${service._id}`);
      showToast('Servicio eliminado');
      fetch();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm">{toast}</div>}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de servicios <span className="text-gray-400 text-base font-normal">({data.total})</span></h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
          <select value={filters.category} onChange={(e) => handleFilter('category', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize">
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <select value={filters.isActive} onChange={(e) => handleFilter('isActive', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <button onClick={() => { const r = { category: '', isActive: '' }; setFilters(r); fetch(r); }} className="text-sm text-blue-600 hover:underline px-2">Limpiar</button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? <Spinner className="py-10" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Servicio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Freelancer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Categoría</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Precio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.services.map((s) => (
                    <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 max-w-[200px] truncate">{s.title}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.freelancer?.name}<p className="text-xs text-gray-400">{s.freelancer?.email}</p></td>
                      <td className="px-4 py-3"><span className="capitalize text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{s.category}</span></td>
                      <td className="px-4 py-3 font-semibold text-gray-900">${s.price}</td>
                      <td className="px-4 py-3">
                        {s.isActive
                          ? <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
                          : <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactivo</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleActive(s)} className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${s.isActive ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}>
                            {s.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => deleteService(s)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg transition-colors">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.services.length === 0 && <p className="text-center text-gray-400 py-10">No se encontraron servicios.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
