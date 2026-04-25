import { Navigate, Outlet } from 'react-router-dom';
import { useFirebase } from './FirebaseProvider';

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'admin')[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'Blocked') {
    return <Navigate to="/login?reason=blocked" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
};
