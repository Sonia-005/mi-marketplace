import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';

const CATEGORIES = ['diseño', 'desarrollo', 'marketing', 'redacción', 'video', 'otro'];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
  });

  const fetchServices = async (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.category) params.category = f.category;
    if (f.minPrice) params.minPrice = f.minPrice;
    if (f.maxPrice) params.maxPrice = f.maxPrice;
    if (f.search) params.search = f.search;

    try {
      const res = await api.get('/services', { params });
      setServices(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleFilter = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    setSearchParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v)));
    fetchServices(merged);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Filtros</h2>

            {/* Buscador */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                value={filters.search}
                onChange={(e) => handleFilter({ search: e.target.value })}
                placeholder="Ej: diseño logo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categoría */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!filters.category}
                    onChange={() => handleFilter({ category: '' })}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">Todas</span>
                </label>
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer capitalize">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={filters.category === cat}
                      onChange={() => handleFilter({ category: cat })}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-600">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (USD)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilter({ minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilter({ maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const reset = { category: '', minPrice: '', maxPrice: '', search: '' };
                setFilters(reset);
                setSearchParams({});
                fetchServices(reset);
              }}
              className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.category ? `Servicios de ${filters.category}` : 'Todos los servicios'}
            </h1>
            <span className="text-sm text-gray-500">{services.length} resultados</span>
          </div>

          {loading ? (
            <Spinner className="py-20" />
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No se encontraron servicios con esos filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((s) => <ServiceCard key={s._id} service={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
