import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles = ['admin'] }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// Backward-compatible wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <RoleRoute allowedRoles={['admin']}>{children}</RoleRoute>;
};

export default AdminRoute;
