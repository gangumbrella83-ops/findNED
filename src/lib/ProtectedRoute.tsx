import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken, getAuthUser } from './auth';

interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'admin')[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = getAuthToken();
  const user = getAuthUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'Blocked') {
    return <Navigate to="/login?reason=blocked" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
};
