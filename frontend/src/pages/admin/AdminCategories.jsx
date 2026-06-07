import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import Spinner from '../../components/Spinner';

const EMPTY = { name: '', icon: '📦', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCats = async () => {
    try { const r = await api.get('/admin/categories'); setCategories(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, form);
        showToast('Categoría actualizada');
      } else {
        await api.post('/admin/categories', form);
        showToast('Categoría creada');
      }
      setForm(EMPTY);
      setEditingId(null);
      fetchCats();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (cat) => {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/admin/categories/${cat._id}`);
      showToast('Categoría eliminada');
      fetchCats();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  const handleToggleActive = async (cat) => {
    try {
      await api.put(`/admin/categories/${cat._id}`, { isActive: !cat.isActive });
      showToast(`Categoría ${cat.isActive ? 'desactivada' : 'activada'}`);
      fetchCats();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm">{toast}</div>}

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de categorías</h1>

        {/* Formulario crear/editar */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <form onSubmit={handleSave} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={2} />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ej: diseño" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-[2] min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve de la categoría" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              {editingId && (
                <button type="button" onClick={() => { setForm(EMPTY); setEditingId(null); }} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
              )}
              <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
                {saving ? '...' : editingId ? 'Guardar' : 'Crear'}
              </button>
            </div>
            {error && <p className="w-full text-red-600 text-sm">{error}</p>}
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? <Spinner className="py-10" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Categoría</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Descripción</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="font-medium text-gray-900 capitalize">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate">{cat.description || '—'}</td>
                      <td className="px-4 py-3">
                        {cat.isActive
                          ? <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activa</span>
                          : <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactiva</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(cat)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors">Editar</button>
                          <button onClick={() => handleToggleActive(cat)} className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${cat.isActive ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}>
                            {cat.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => handleDelete(cat)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg transition-colors">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && <p className="text-center text-gray-400 py-10">No hay categorías creadas.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
