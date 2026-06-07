import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  diseño: 'bg-purple-100 text-purple-700',
  desarrollo: 'bg-blue-100 text-blue-700',
  marketing: 'bg-green-100 text-green-700',
  redacción: 'bg-yellow-100 text-yellow-700',
  video: 'bg-red-100 text-red-700',
  otro: 'bg-gray-100 text-gray-700',
};

export default function ServiceCard({ service }) {
  const image = service.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

  return (
    <Link to={`/services/${service._id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'; }}
        />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full capitalize ${CATEGORY_COLORS[service.category] || 'bg-gray-100 text-gray-700'}`}>
          {service.category}
        </span>
      </div>

      <div className="p-4">
        {/* Freelancer */}
        <div className="flex items-center gap-2 mb-2">
          {service.freelancer?.avatar ? (
            <img src={service.freelancer.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">{service.freelancer?.name?.[0]?.toUpperCase()}</span>
            </div>
          )}
          <span className="text-xs text-gray-500">{service.freelancer?.name}</span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-yellow-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span className="text-xs text-gray-600">Nuevo</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Desde</span>
            <p className="font-bold text-gray-900">${service.price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
