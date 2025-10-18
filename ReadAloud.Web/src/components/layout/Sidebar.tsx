import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Library, Upload, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useState } from 'react';

export const Sidebar = () => {
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Upload Book', href: '/upload', icon: Upload },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <BookOpen className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">ReadAloud</h1>
          <p className="text-xs text-muted-foreground">{user?.username}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-foreground hover:bg-muted transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};
