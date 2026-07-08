import { MapPin, Building2, Activity, Globe, Navigation } from 'lucide-react';

export default function LocationCard() {
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-eco-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <MapPin className="w-4 h-4 text-eco-400" />
          <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">Deployment Location</h3>
        </div>

        {/* Stylized map */}
        <div className="relative h-44 rounded-xl overflow-hidden bg-midnight-950 border border-white/[0.06] mb-5">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />

          {/* Topographic contour shapes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
            <path d="M 50 90 Q 120 40, 200 80 T 360 70" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
            <path d="M 30 110 Q 130 70, 220 100 T 370 95" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1" />
            <path d="M 60 130 Q 140 100, 230 120 T 360 115" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="1" />
            <path d="M 80 50 Q 150 20, 240 45 T 380 40" fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="1" />
          </svg>

          {/* Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex flex-col items-center">
              {/* Pulse rings */}
              <div className="absolute w-12 h-12 rounded-full bg-eco-500/20 animate-ping" />
              <div className="absolute w-8 h-8 rounded-full bg-eco-500/30 animate-ping" style={{ animationDelay: '0.5s' }} />
              {/* Pin marker */}
              <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-eco-400 to-eco-600 flex items-center justify-center glow-eco z-10">
                <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              {/* Pin label */}
              <div className="absolute top-9 whitespace-nowrap glass px-2.5 py-1 rounded-md text-[10px] font-semibold text-eco-400 z-10">
                Mukono, Uganda
              </div>
            </div>
          </div>

          {/* Compass */}
          <div className="absolute top-3 right-3 glass px-2 py-1.5 rounded-md flex items-center gap-1">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] text-slate-400 font-mono">0.4044° N, 32.7523° E</span>
          </div>
        </div>

        {/* Location info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-eco-500/10 border border-eco-500/15 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-eco-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Primary Hub</div>
              <div className="text-sm font-medium text-white">Mukono Centralized Smart Biogas Facility</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-eco-500/10 border border-eco-500/15 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-eco-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Operational Status</div>
              <div className="text-sm font-medium text-white flex items-center gap-2">
                Active &amp; Operational
                <span className="status-dot bg-eco-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Impact Region</div>
              <div className="text-sm font-medium text-white">Mukono District Community Networks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
