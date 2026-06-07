import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then((res) => {
      setOrders(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const isFreelancer = user?.role === 'freelancer';

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: res.data.status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  if (loading) return <Spinner className="py-20" />;

  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const past = orders.filter((o) => ['completed', 'cancelled'].includes(o.status));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isFreelancer ? 'Órdenes recibidas' : 'Mis órdenes'}
        </h1>
        {isFreelancer && (
          <Link
            to="/my-services"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Mis servicios
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No tienes órdenes aún.</p>
          {!isFreelancer && (
            <Link to="/services" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">
              Explorar servicios
            </Link>
          )}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Órdenes activas</h2>
              <div className="space-y-4">
                {active.map((order) => (
                  <OrderCard key={order._id} order={order} isFreelancer={isFreelancer} onUpdateStatus={updateStatus} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Historial</h2>
              <div className="space-y-4">
                {past.map((order) => (
                  <OrderCard key={order._id} order={order} isFreelancer={isFreelancer} onUpdateStatus={updateStatus} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({ order, isFreelancer, onUpdateStatus }) {
  const other = isFreelancer ? order.client : order.freelancer;
  const image = order.service?.images?.[0];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-4">
      {image && (
        <img src={image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{order.service?.title}</h3>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-sm text-gray-500 mb-1">
          {isFreelancer ? 'Cliente' : 'Freelancer'}: <span className="font-medium text-gray-700">{other?.name}</span>
        </p>
        <p className="text-sm font-bold text-gray-900">${order.price}</p>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Link
            to={`/orders/${order._id}`}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Ver chat
          </Link>

          {isFreelancer && order.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(order._id, 'in_progress')}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Aceptar orden
            </button>
          )}
          {isFreelancer && order.status === 'in_progress' && (
            <button
              onClick={() => onUpdateStatus(order._id, 'completed')}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Marcar completada
            </button>
          )}
          {!isFreelancer && ['pending', 'in_progress'].includes(order.status) && (
            <button
              onClick={() => {
                if (confirm('¿Cancelar esta orden?')) onUpdateStatus(order._id, 'cancelled');
              }}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
