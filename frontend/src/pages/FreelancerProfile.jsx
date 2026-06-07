import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';

export default function FreelancerProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/profile/${id}`)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner className="py-20" />;
  if (!data) return <div className="text-center py-20 text-gray-500">Perfil no encontrado.</div>;

  const { user, services, avgRating, totalReviews } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Perfil */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold text-4xl">{user.name?.[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full capitalize mt-1">
                  {user.role}
                </span>
              </div>
              {avgRating && (
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl">
                  <span className="text-yellow-500 text-xl">★</span>
                  <div>
                    <p className="font-bold text-gray-900 leading-none">{avgRating}</p>
                    <p className="text-xs text-gray-500">{totalReviews} reseñas</p>
                  </div>
                </div>
              )}
            </div>
            {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
            {user.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.skills.map((skill, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Servicios activos */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios activos ({services.length})</h2>
      {services.length === 0 ? (
        <p className="text-gray-400">Este freelancer no tiene servicios activos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => <ServiceCard key={s._id} service={{ ...s, freelancer: user }} />)}
        </div>
      )}
    </div>
  );
}
