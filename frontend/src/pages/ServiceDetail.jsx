import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get(`/services/${id}`),
      api.get(`/reviews/freelancer/${id}`).catch(() => ({ data: [] })),
    ]).then(([sRes]) => {
      setService(sRes.data);
      setLoading(false);
    }).catch(() => { setLoading(false); });

    api.get(`/reviews/freelancer/${id}`).then((r) => setReviews(r.data)).catch(() => {});
  }, [id]);

  const handleOrder = async () => {
    if (!user) return navigate('/login');
    setOrdering(true);
    setError('');
    try {
      await api.post('/orders', { serviceId: id, requirements });
      setShowModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la orden');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!service) return <div className="text-center py-20 text-gray-500">Servicio no encontrado.</div>;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>

          {/* Freelancer */}
          <Link to={`/freelancer/${service.freelancer._id}`} className="flex items-center gap-3 mb-6">
            {service.freelancer.avatar ? (
              <img src={service.freelancer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">{service.freelancer.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{service.freelancer.name}</p>
              {avgRating && (
                <p className="text-sm text-yellow-600">★ {avgRating} ({reviews.length} reseñas)</p>
              )}
            </div>
          </Link>

          {/* Galería de imágenes */}
          {service.images?.length > 0 && (
            <div className="mb-6">
              <img
                src={service.images[activeImage]}
                alt={service.title}
                className="w-full h-64 sm:h-80 object-cover rounded-xl mb-2"
              />
              {service.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {service.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}>
                      <img
                        src={img}
                        alt=""
                        className={`w-16 h-16 object-cover rounded-lg border-2 ${i === activeImage ? 'border-blue-500' : 'border-transparent'}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-900 text-lg mb-3">Descripción</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          {/* Reseñas */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">
              Reseñas {avgRating && <span className="text-yellow-500">★ {avgRating}</span>}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400">Aún no hay reseñas para este freelancer.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      {r.reviewer?.avatar ? (
                        <img src={r.reviewer.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500 text-xs font-bold">{r.reviewer?.name?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.reviewer?.name}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= r.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 ml-11">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de contratación */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-gray-900">${service.price}</span>
              <span className="text-sm text-gray-500 capitalize bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                {service.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Entrega en {service.deliveryDays} día{service.deliveryDays !== 1 ? 's' : ''}
            </div>

            {user?.role === 'client' ? (
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Contratar ahora
              </button>
            ) : user?.role === 'freelancer' ? (
              <p className="text-center text-sm text-gray-400">Los freelancers no pueden contratar servicios.</p>
            ) : (
              <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-center transition-colors">
                Iniciar sesión para contratar
              </Link>
            )}

            <Link
              to={`/freelancer/${service.freelancer._id}`}
              className="block mt-3 w-full text-center border border-gray-200 hover:border-blue-300 text-gray-700 font-medium py-3 rounded-xl transition-colors text-sm"
            >
              Ver perfil del freelancer
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de contratación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contratar servicio</h3>
            <p className="text-gray-600 text-sm mb-4">Cuéntale al freelancer qué necesitas exactamente:</p>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              placeholder="Describe los detalles del proyecto, referencias, colores, etc."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-colors disabled:opacity-60"
              >
                {ordering ? 'Procesando...' : `Confirmar ($${service.price})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
