import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/library" replace /> : <>{children}</>;
};
