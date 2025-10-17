import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../contexts/useAuthStore';

export function Header() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
                ReadAloud
            </Link>

            <nav className="flex items-center gap-6">
                {isAuthenticated ? (
                <>
                    <Link
                    to="/home"
                    className="text-foreground hover:text-primary transition-colors"
                    >
                    Home
                    </Link>
                    <Link
                    to="/text-to-speech"
                    className="text-foreground hover:text-primary transition-colors"
                    >
                    Text to Speech
                    </Link>
                    <div className="flex items-center gap-4">
                    <span className="text-muted-foreground text-sm">
                        {user?.username}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Logout
                    </button>
                    </div>
                </>
                ) : (
                <>
                    <Link
                    to="/login"
                    className="text-foreground hover:text-primary transition-colors"
                    >
                    Login
                    </Link>
                    <Link
                    to="/register"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                    Register
                    </Link>
                </>
                )}
            </nav>
            </div>
        </div>
        </header>
    );
}
