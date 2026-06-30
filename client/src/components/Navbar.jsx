import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            PE
          </span>
          <span className="text-lg font-semibold text-slate-900">Placement Experiences</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Companies
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-brand-600">
              Admin
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-slate-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm text-slate-700 sm:inline">{user.name}</span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
