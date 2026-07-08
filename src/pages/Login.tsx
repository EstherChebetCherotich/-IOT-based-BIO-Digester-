import { useState } from 'react';
import { useAuth } from '../lib/auth';
import {
  Leaf, Terminal, Users, ArrowRight, Lock, User, ShieldCheck, Zap,
  AlertCircle, Eye, EyeOff, Info,
} from 'lucide-react';

type Props = {
  onNavigate: (p: 'dashboard' | 'community') => void;
};

export default function Login({ onNavigate }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        const role = username.trim().toLowerCase() === 'dev_admin' ? 'developer' : 'community';
        onNavigate(role === 'developer' ? 'dashboard' : 'community');
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 500);
  };

  const fillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Organic animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-eco-500/[0.07] blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-cyan-500/[0.06] blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-eco-600/[0.05] blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
        {/* Organic SVG curves */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none" viewBox="0 0 1200 800">
          <path d="M 0 400 Q 300 300, 600 400 T 1200 350" fill="none" stroke="#10B981" strokeWidth="2" />
          <path d="M 0 500 Q 300 420, 600 480 T 1200 450" fill="none" stroke="#06B6D4" strokeWidth="2" />
          <path d="M 0 300 Q 300 200, 600 280 T 1200 250" fill="none" stroke="#10B981" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left — hero */}
        <div className="hidden lg:flex flex-col gap-6 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-eco-500/10 border border-eco-500/20 text-eco-400 text-xs font-medium w-fit">
            <Zap className="w-3.5 h-3.5" />
            IoT Centralized Bio-Digester Platform
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight">
            Transforming organic waste into{' '}
            <span className="text-gradient-eco">clean energy</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Monitor your bio-digester in real time, run advanced methane-production simulations,
            and join a community driving the circular economy forward.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { icon: ShieldCheck, label: 'Secure', value: 'Remote Access' },
              { icon: Terminal, label: 'Real-time', value: 'IoT Sensors' },
              { icon: Users, label: 'Community', value: 'Impact Hub' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="glass-card p-4">
                  <Icon className="w-5 h-5 text-eco-400 mb-2" />
                  <div className="text-sm font-semibold text-white">{f.value}</div>
                  <div className="text-xs text-slate-500">{f.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — login card */}
        <div className="glass-strong p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-eco-500 to-cyan-500 flex items-center justify-center glow-eco">
              <Leaf className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Welcome to BioCore</h2>
              <p className="text-sm text-slate-400">Sign in to access your portal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(null); }}
                  placeholder="dev_admin or community_user"
                  className="input-field pl-11"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-midnight-950/40 border border-white/[0.04]">
            <div className="flex items-center gap-1.5 mb-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              <Info className="w-3 h-3" />
              Demo Credentials — Click to fill
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo('dev_admin', 'password123')}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-eco-500/[0.06] border border-eco-500/10 hover:border-eco-500/25 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-eco-400" />
                  <div>
                    <div className="text-xs font-medium text-white">Developer Access</div>
                    <div className="text-[10px] text-slate-500 font-mono">dev_admin / password123</div>
                  </div>
                </div>
                <span className="text-[9px] text-eco-400 font-medium uppercase">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('community_user', 'community123')}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/10 hover:border-cyan-500/25 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-medium text-white">Community Member</div>
                    <div className="text-[10px] text-slate-500 font-mono">community_user / community123</div>
                  </div>
                </div>
                <span className="text-[9px] text-cyan-400 font-medium uppercase">Public Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
