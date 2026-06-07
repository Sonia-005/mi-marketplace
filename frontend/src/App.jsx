import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import FreelancerProfile from './pages/FreelancerProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyServices from './pages/MyServices';
import NewService from './pages/NewService';
import EditService from './pages/EditService';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminServices from './pages/admin/AdminServices';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReports from './pages/admin/AdminReports';

const Spinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Ruta protegida: redirige al login si no hay sesión
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
};

// Ruta solo para freelancers
const FreelancerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'freelancer') return <Navigate to="/dashboard" replace />;
  return children;
};

// Ruta solo para admins — redirige a / si no tiene rol admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// El panel admin no usa el Navbar ni el footer del sitio principal
const AdminShell = ({ children }) => <>{children}</>;

export default function App() {
  return (
    <Routes>
      {/* Rutas del panel admin (sin Navbar ni footer del sitio) */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/services" element={<AdminRoute><AdminServices /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

      {/* Rutas del sitio principal */}
      <Route path="/*" element={
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/freelancer/:id" element={<FreelancerProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
              <Route path="/my-services" element={<FreelancerRoute><MyServices /></FreelancerRoute>} />
              <Route path="/services/new" element={<FreelancerRoute><NewService /></FreelancerRoute>} />
              <Route path="/services/edit/:id" element={<FreelancerRoute><EditService /></FreelancerRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm">
            © 2024 FreelanceLocal — Proyecto Universitario
          </footer>
        </div>
      } />
    </Routes>
  );
}
