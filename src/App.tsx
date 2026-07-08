import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import Navbar, { type Page } from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Community from './pages/Community';

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>('login');

  // Route based on auth state
  useEffect(() => {
    if (!user) {
      setPage('login');
    } else if (page === 'login') {
      setPage(user.role === 'developer' ? 'dashboard' : 'community');
    }
  }, [user, page]);

  // Permission enforcement
  const canAccess = (p: Page): boolean => {
    if (!user) return p === 'login';
    if (p === 'login') return false;
    if (p === 'dashboard' || p === 'simulation') return user.role === 'developer';
    return true; // community is accessible to all logged-in users
  };

  const handleNavigate = (p: Page) => {
    if (!user && p !== 'login') {
      setPage('login');
      return;
    }
    if (user && p === 'login') {
      setPage(user.role === 'developer' ? 'dashboard' : 'community');
      return;
    }
    if (!canAccess(p)) return;
    setPage(p);
  };

  const renderPage = () => {
    if (!user) return <Login onNavigate={(p) => handleNavigate(p)} />;
    if (!canAccess(page)) {
      setPage(user.role === 'developer' ? 'dashboard' : 'community');
      return null;
    }
    switch (page) {
      case 'login':
        return <Login onNavigate={(p) => handleNavigate(p)} />;
      case 'dashboard':
        return <Dashboard />;
      case 'simulation':
        return <Simulation />;
      case 'community':
        return <Community />;
      default:
        return <Login onNavigate={(p) => handleNavigate(p)} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar page={page} onNavigate={handleNavigate} />
      <main>{renderPage()}</main>
      <footer className="border-t border-white/[0.06] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-eco-500 animate-pulse" />
            BioCore IoT Bio-Digester Platform
          </div>
          <div className="text-xs text-slate-600">
            Empowering communities through sustainable waste-to-energy technology
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
