import { useAuth, type Role } from '../lib/auth';
import { Leaf, LayoutDashboard, Users, LogOut, FlaskConical, Home } from 'lucide-react';

type Page = 'login' | 'dashboard' | 'simulation' | 'community';

type Props = {
  page: Page;
  onNavigate: (p: Page) => void;
};

export default function Navbar({ page, onNavigate }: Props) {
  const { user, logout } = useAuth();

  const devLinks: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Monitoring', icon: LayoutDashboard },
    { id: 'simulation', label: 'Simulation', icon: FlaskConical },
  ];

  const communityLinks: { id: Page; label: string; icon: typeof Users }[] = [
    { id: 'community', label: 'Community', icon: Users },
  ];

  const links = user?.role === 'developer' ? devLinks : communityLinks;

  return (
    <nav className="sticky top-0 z-50 glass-strong border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate(user ? (user.role === 'developer' ? 'dashboard' : 'community') : 'login')}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-500 to-cyan-500 flex items-center justify-center glow-eco group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-display font-bold text-lg text-white tracking-tight">BioCore</span>
              <span className="text-[10px] text-eco-400 font-medium tracking-wider uppercase">IoT Bio-Digester</span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {user && links.map((l) => {
              const Icon = l.icon;
              const active = page === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => onNavigate(l.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'bg-eco-500/15 text-eco-400 border border-eco-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {l.label}
                </button>
              );
            })}
            {user?.role === 'developer' && (
              <button
                onClick={() => onNavigate('community')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  page === 'community'
                    ? 'bg-eco-500/15 text-eco-400 border border-eco-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Home className="w-4 h-4" />
                Community
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-eco-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-medium text-white">
                      {user.role === 'developer' ? 'Developer' : 'Community Member'}
                    </span>
                    <span className="text-[10px] text-eco-400/70">{user.hub}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="btn-primary text-sm py-2 px-4"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export type { Page, Role };
