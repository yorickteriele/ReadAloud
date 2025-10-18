import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return { user, token, isAuthenticated, logout };
};
