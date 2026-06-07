import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FL</span>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">FreelanceLocal</span>
          </Link>

          {/* Links centrales */}
          <div className="flex items-center gap-6">
            <Link to="/services" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
              Explorar
            </Link>
            {user && user.role !== 'admin' && (
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                Mis Órdenes
              </Link>
            )}
            {user?.role === 'freelancer' && (
              <Link to="/my-services" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                Mis Servicios
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-red-600 hover:text-red-700 text-sm font-bold transition-colors">
                ⚙️ Admin
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'freelancer' && (
                  <Link
                    to="/services/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    + Publicar
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
