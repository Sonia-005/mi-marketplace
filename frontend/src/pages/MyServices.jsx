import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function MyServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtiene todos los servicios del freelancer (incluyendo inactivos) filtrando por su ID
    api.get('/services').then((res) => {
      const mine = res.data.filter((s) => s.freelancer?._id === user?.id || s.freelancer === user?.id);
      setServices(mine);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const toggleActive = async (serviceId, currentState) => {
    try {
      if (currentState) {
        await api.delete(`/services/${serviceId}`);
        setServices((prev) => prev.map((s) => s._id === serviceId ? { ...s, isActive: false } : s));
      } else {
        const res = await api.put(`/services/${serviceId}`, { isActive: true });
        setServices((prev) => prev.map((s) => s._id === serviceId ? { ...s, isActive: true } : s));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar servicio');
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis servicios</h1>
        <Link
          to="/services/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + Nuevo servicio
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No has publicado servicios todavía.</p>
          <Link to="/services/new" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">
            Publicar mi primer servicio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => {
            const image = service.images?.[0];
            return (
              <div key={service._id} className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row gap-4 ${!service.isActive ? 'opacity-60 border-gray-100' : 'border-gray-100'}`}>
                {image && (
                  <img src={image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {service.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{service.category} · ${service.price} · {service.deliveryDays} días</p>

                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/services/edit/${service._id}`}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => toggleActive(service._id, service.isActive)}
                      className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${service.isActive ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                    >
                      {service.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <Link
                      to={`/services/${service._id}`}
                      className="text-sm text-blue-600 hover:underline px-3 py-1.5"
                    >
                      Ver →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
