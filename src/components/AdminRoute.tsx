import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
