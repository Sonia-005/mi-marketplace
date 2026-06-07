import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CATEGORIES = ['diseño', 'desarrollo', 'marketing', 'redacción', 'video', 'otro'];

export default function NewService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'diseño',
    price: '',
    deliveryDays: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.price || Number(form.price) < 1) return setError('El precio mínimo es $1');
    if (!form.deliveryDays || Number(form.deliveryDays) < 1) return setError('El tiempo de entrega mínimo es 1 día');

    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => data.append(key, val));
    images.forEach((img) => data.append('images', img));

    try {
      await api.post('/services', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/my-services');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Publicar nuevo servicio</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título del servicio *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ej: Diseño de logo profesional"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe tu servicio, qué incluye, proceso de trabajo..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (USD) *</label>
            <input
              type="number"
              required
              min="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="150"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Días de entrega *</label>
            <input
              type="number"
              required
              min="1"
              value={form.deliveryDays}
              onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
              placeholder="5"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Subida de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imágenes (máx. 5, hasta 5MB c/u)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
          />
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/my-services')}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Publicando...' : 'Publicar servicio'}
          </button>
        </div>
      </form>
    </div>
  );
}
