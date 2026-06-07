import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';

const CATEGORIES = ['diseño', 'desarrollo', 'marketing', 'redacción', 'video', 'otro'];

const CATEGORY_ICONS = {
  diseño: '🎨',
  desarrollo: '💻',
  marketing: '📢',
  redacción: '✍️',
  video: '🎬',
  otro: '⭐',
};

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/services').then((res) => {
      setServices(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(search)}`);
  };

  const byCategory = (cat) => services.filter((s) => s.category === cat).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Encuentra el freelancer perfecto
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Miles de profesionales listos para dar vida a tus proyectos
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="¿Qué servicio necesitas?"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorar por categoría</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/services?category=${cat}`)}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all capitalize"
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
              <span className="text-xs font-medium text-gray-600">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Servicios por categoría */}
      {loading ? (
        <Spinner className="py-16" />
      ) : (
        CATEGORIES.map((cat) => {
          const list = byCategory(cat);
          if (!list.length) return null;
          return (
            <section key={cat} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 capitalize">{CATEGORY_ICONS[cat]} {cat}</h2>
                <button
                  onClick={() => navigate(`/services?category=${cat}`)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Ver todos →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((s) => <ServiceCard key={s._id} service={s} />)}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
