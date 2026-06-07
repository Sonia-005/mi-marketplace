import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/admin',             label: 'Dashboard',   icon: '📊', end: true },
  { to: '/admin/users',       label: 'Usuarios',    icon: '👥' },
  { to: '/admin/services',    label: 'Servicios',   icon: '🛠️' },
  { to: '/admin/orders',      label: 'Órdenes',     icon: '📦' },
  { to: '/admin/categories',  label: 'Categorías',  icon: '🏷️' },
  { to: '/admin/reports',     label: 'Reportes',    icon: '🚨' },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="w-56 shrink-0 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">FreelanceLocal</p>
        <p className="text-white font-bold text-sm">Panel Admin</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {LINKS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Salir */}
      <div className="px-3 py-4 border-t border-gray-700">
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
          ← Volver al sitio
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
