import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      if (response.success && response.user && response.token) {
        setAuth(response.user, response.token);
        navigate('/library');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue reading</p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email or Username"
              type="text"
              value={formData.emailOrUsername}
              onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
              placeholder="Enter your email or username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-ring"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-foreground">
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-light font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
