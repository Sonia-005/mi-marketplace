import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABELS = { pending: 'Pendiente', in_progress: 'En progreso', completed: 'Completado', cancelled: 'Cancelado' };

export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetch = async (s = filterStatus) => {
    setLoading(true);
    const params = s ? { status: s } : {};
    try {
      const r = await api.get('/admin/orders', { params });
      setData(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleStatusChange = async (orderId) => {
    if (!editStatus) return;
    if (!confirm(`¿Cambiar estado a "${STATUS_LABELS[editStatus]}"?`)) return;
    try {
      await api.put(`/admin/orders/${orderId}`, { status: editStatus });
      showToast('Estado actualizado');
      setEditingId(null);
      fetch();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm">{toast}</div>}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de órdenes <span className="text-gray-400 text-base font-normal">({data.total})</span></h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); fetch(e.target.value); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button onClick={() => { setFilterStatus(''); fetch(''); }} className="text-sm text-blue-600 hover:underline px-2">Limpiar</button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? <Spinner className="py-10" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Servicio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Freelancer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Precio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[150px] truncate">{order.service?.title}</td>
                      <td className="px-4 py-3 text-gray-600">{order.client?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{order.freelancer?.name}</td>
                      <td className="px-4 py-3">
                        {editingId === order._id ? (
                          <div className="flex items-center gap-1">
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                            </select>
                            <button onClick={() => handleStatusChange(order._id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg">OK</button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 px-1">✕</button>
                          </div>
                        ) : (
                          <StatusBadge status={order.status} />
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">${order.price}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('es')}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditingId(order._id); setEditStatus(order.status); }}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Cambiar estado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.orders.length === 0 && <p className="text-center text-gray-400 py-10">No se encontraron órdenes.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
