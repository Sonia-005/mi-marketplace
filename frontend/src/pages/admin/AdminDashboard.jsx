import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

const COLORS = { pending: '#F59E0B', in_progress: '#3B82F6', completed: '#10B981', cancelled: '#EF4444' };

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><Spinner className="py-20" /></AdminLayout>;

  const pieData = (stats?.ordersByStatus || []).map((d) => ({
    name: { pending: 'Pendiente', in_progress: 'En progreso', completed: 'Completado', cancelled: 'Cancelado' }[d._id] || d._id,
    value: d.count,
    color: COLORS[d._id] || '#6B7280',
  }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Usuarios" value={stats?.totalUsers ?? 0} icon="👥" color="bg-blue-50" />
          <StatCard label="Servicios" value={stats?.totalServices ?? 0} icon="🛠️" color="bg-purple-50" />
          <StatCard label="Órdenes" value={stats?.totalOrders ?? 0} icon="📦" color="bg-yellow-50" />
          <StatCard label="Ingresos" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`} icon="💰" color="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfica de órdenes por estado */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Órdenes por estado</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-10">Sin datos</p>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Accesos rápidos</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/admin/users',      label: 'Gestionar usuarios',   icon: '👥', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
                { to: '/admin/services',   label: 'Gestionar servicios',  icon: '🛠️', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
                { to: '/admin/orders',     label: 'Ver todas las órdenes',icon: '📦', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' },
                { to: '/admin/reports',    label: 'Revisar reportes',     icon: '🚨', color: 'bg-red-50 hover:bg-red-100 text-red-700' },
                { to: '/admin/categories', label: 'Categorías',           icon: '🏷️', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
              ].map(({ to, label, icon, color }) => (
                <Link key={to} to={to} className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-colors ${color}`}>
                  <span>{icon}</span> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Órdenes recientes */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Últimas 5 órdenes</h2>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline">Ver todas →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500">Servicio</th>
                  <th className="text-left py-2 font-medium text-gray-500">Cliente</th>
                  <th className="text-left py-2 font-medium text-gray-500">Freelancer</th>
                  <th className="text-left py-2 font-medium text-gray-500">Estado</th>
                  <th className="text-right py-2 font-medium text-gray-500">Precio</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders || []).map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-900 max-w-[140px] truncate">{order.service?.title}</td>
                    <td className="py-2.5 text-gray-600">{order.client?.name}</td>
                    <td className="py-2.5 text-gray-600">{order.freelancer?.name}</td>
                    <td className="py-2.5"><StatusBadge status={order.status} /></td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">${order.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
