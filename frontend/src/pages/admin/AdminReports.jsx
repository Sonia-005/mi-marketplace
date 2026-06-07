import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import Spinner from '../../components/Spinner';

const STATUS_STYLES = { pending: 'bg-yellow-100 text-yellow-800', reviewed: 'bg-blue-100 text-blue-800', resolved: 'bg-green-100 text-green-800' };
const STATUS_LABELS = { pending: 'Pendiente', reviewed: 'Revisado', resolved: 'Resuelto' };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchReports = async (s = filterStatus) => {
    setLoading(true);
    try {
      const params = s ? { status: s } : {};
      const r = await api.get('/admin/reports', { params });
      setReports(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const updateStatus = async (report, newStatus) => {
    if (!confirm(`¿Marcar reporte como "${STATUS_LABELS[newStatus]}"?`)) return;
    try {
      await api.put(`/admin/reports/${report._id}`, { status: newStatus });
      showToast('Reporte actualizado');
      fetchReports();
    } catch (err) { showToast(err.response?.data?.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm">{toast}</div>}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reportes <span className="text-gray-400 text-base font-normal">({reports.length})</span></h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); fetchReports(e.target.value); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="reviewed">Revisado</option>
            <option value="resolved">Resuelto</option>
          </select>
          <button onClick={() => { setFilterStatus(''); fetchReports(''); }} className="text-sm text-blue-600 hover:underline px-2">Limpiar</button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? <Spinner className="py-10" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Reportó</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Reportado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Motivo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.reporter?.name}</p>
                        <p className="text-xs text-gray-400">{r.reporter?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {r.reported ? (
                          <>
                            <p className="font-medium text-gray-900">{r.reported?.name}</p>
                            <p className="text-xs text-gray-400">{r.reported?.email}</p>
                          </>
                        ) : r.service ? (
                          <p className="text-gray-600 text-xs">Servicio reportado</p>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                        <p className="truncate" title={r.reason}>{r.reason}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString('es')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'pending' && (
                            <button onClick={() => updateStatus(r, 'reviewed')} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2.5 py-1 rounded-lg transition-colors">Revisar</button>
                          )}
                          {r.status !== 'resolved' && (
                            <button onClick={() => updateStatus(r, 'resolved')} className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2.5 py-1 rounded-lg transition-colors">Resolver</button>
                          )}
                          {r.status === 'resolved' && <span className="text-xs text-gray-400">Cerrado</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reports.length === 0 && <p className="text-center text-gray-400 py-10">No hay reportes.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
