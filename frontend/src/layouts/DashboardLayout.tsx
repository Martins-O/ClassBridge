import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { NotificationBell } from '@/components/NotificationBell';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Schools', href: '/schools' },
  { name: 'Classes', href: '/classes' },
  { name: 'Courses', href: '/courses' },
  { name: 'Grades', href: '/grades' },
];

export function DashboardLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CB</span>
                </div>
                <span className="font-bold text-text hidden sm:block">ClassBridge</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-text">{user?.name}</p>
                <p className="text-xs text-text-secondary capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={logout}
                className="text-sm text-text-secondary hover:text-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;