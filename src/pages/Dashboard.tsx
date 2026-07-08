import { useEffect, useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, ReferenceLine,
} from 'recharts';
import {
  Thermometer, Droplets, Wind, Gauge, AlertTriangle, Activity,
  Radio, Cpu, Wifi, X, CheckCircle,
} from 'lucide-react';
import LocationCard from '../components/LocationCard';
import FutureProspects from '../components/FutureProspects';

type MetricStatus = 'normal' | 'warning' | 'critical';

type Reading = {
  time: string;
  temperature: number;
  ph: number;
  methane: number;
  pressure: number;
};

type Metric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  target: string;
  status: MetricStatus;
  icon: typeof Thermometer;
  color: string;
  history: number[];
};

const MAX_POINTS = 20;

function statusColor(s: MetricStatus) {
  return s === 'normal' ? '#10B981' : s === 'warning' ? '#F59E0B' : '#EF4444';
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function fluctuate(base: number, range: number, min: number, max: number) {
  return clamp(base + (Math.random() - 0.5) * range, min, max);
}

export default function Dashboard() {
  const [readings, setReadings] = useState<Reading[]>(() => {
    const now = Date.now();
    return Array.from({ length: 10 }, (_, i) => ({
      time: new Date(now - (10 - i) * 3000).toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }),
      temperature: fluctuate(37.5, 1.2, 30, 42),
      ph: fluctuate(7.1, 0.15, 6.0, 7.8),
      methane: fluctuate(62, 4, 40, 75),
      pressure: fluctuate(1.0, 0.15, 0.5, 1.8),
    }));
  });

  const [alert, setAlert] = useState<string | null>(null);
  const alertRef = useRef(alert);
  alertRef.current = alert;

  const latest = readings[readings.length - 1];

  const getMetric = (
    id: string, label: string, value: number, unit: string, target: string,
    icon: typeof Thermometer, color: string, status: MetricStatus
  ): Metric => ({
    id, label, value, unit, target, status, icon, color,
    history: readings.map((r) => (r as unknown as Record<string, number>)[id]),
  });

  const tempStatus: MetricStatus = latest.temperature < 35 || latest.temperature > 40 ? 'warning' : 'normal';
  const phStatus: MetricStatus = latest.ph < 6.5 ? 'critical' : latest.ph < 6.8 || latest.ph > 7.4 ? 'warning' : 'normal';
  const methaneStatus: MetricStatus = latest.methane < 50 ? 'warning' : 'normal';
  const pressureStatus: MetricStatus = latest.pressure > 1.5 ? 'critical' : latest.pressure > 1.3 ? 'warning' : 'normal';

  const metrics: Metric[] = [
    getMetric('temperature', 'Temperature', latest.temperature, '°C', '35 – 40 °C', Thermometer, '#F59E0B', tempStatus),
    getMetric('ph', 'pH Level', latest.ph, '', '6.8 – 7.4', Droplets, '#06B6D4', phStatus),
    getMetric('methane', 'Methane (CH₄)', latest.methane, '%', '> 55%', Wind, '#10B981', methaneStatus),
    getMetric('pressure', 'Gas Pressure', latest.pressure, 'bar', '< 1.5 bar', Gauge, '#8B5CF6', pressureStatus),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings((prev) => {
        const last = prev[prev.length - 1];
        const next: Reading = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }),
          temperature: fluctuate(last.temperature, 0.8, 30, 42),
          ph: fluctuate(last.ph, 0.1, 6.0, 7.8),
          methane: fluctuate(last.methane, 2.5, 40, 75),
          pressure: fluctuate(last.pressure, 0.08, 0.5, 1.8),
        };
        return [...prev.slice(-(MAX_POINTS - 1)), next];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ph = latest.ph;
    const pressure = latest.pressure;
    const newAlert =
      ph < 6.5
        ? `CRITICAL: pH level dropped to ${ph.toFixed(2)} — below safe threshold of 6.5. Acidic conditions may inhibit methanogens.`
        : pressure > 1.5
        ? `CRITICAL: Gas pressure at ${pressure.toFixed(2)} bar — exceeds safe limit of 1.5 bar. Pressure relief valve recommended.`
        : null;
    setAlert(newAlert);
  }, [latest.ph, latest.pressure]);

  const chartData = readings.map((r) => ({
    time: r.time,
    Temperature: +r.temperature.toFixed(2),
    pH: +r.ph.toFixed(2),
    Methane: +r.methane.toFixed(1),
    Pressure: +r.pressure.toFixed(2),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="status-dot bg-eco-500 animate-pulse" />
            <span className="text-xs font-medium text-eco-400 uppercase tracking-wider">Live · Unit BC-001</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Remote Monitoring Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time telemetry from bio-digester sensor array</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2.5 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-eco-400" />
            <span className="text-xs text-slate-300">Connection</span>
            <span className="text-xs font-semibold text-eco-400">Stable</span>
          </div>
          <div className="glass px-4 py-2.5 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300">Sensors</span>
            <span className="text-xs font-semibold text-cyan-400">12 / 12</span>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      {alert && (
        <div className="glass-strong border-red-500/30 bg-red-500/[0.08] p-4 flex items-start gap-3 animate-slide-down">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Automated Alert</span>
              <span className="text-xs text-red-400/60">{new Date().toLocaleTimeString()}</span>
            </div>
            <p className="text-sm text-red-200">{alert}</p>
          </div>
          <button onClick={() => setAlert(null)} className="text-red-400/60 hover:text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const color = statusColor(m.status);
          return (
            <div key={m.id} className="glass-card p-5 relative overflow-hidden group">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }}
              />
              <div className="flex items-start justify-between mb-4 relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="status-dot animate-pulse" style={{ background: color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                    {m.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-1">{m.label}</div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="font-display text-3xl font-bold text-white tabular-nums">
                  {m.value.toFixed(m.id === 'ph' || m.id === 'pressure' ? 2 : 1)}
                </span>
                <span className="text-sm text-slate-400">{m.unit}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Target: {m.target}</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Activity className="w-3 h-3" />
                  Live
                </span>
              </div>
              {/* Mini sparkline */}
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={m.history.map((v, i) => ({ i, v }))}>
                    <defs>
                      <linearGradient id={`spark-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#spark-${m.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts + Location */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Temperature & Pressure</h3>
              <p className="text-xs text-slate-500">3-second sampling interval</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-0.5 rounded bg-amber-400" /> Temp (°C)
              </span>
              <span className="flex items-center gap-1.5 text-violet-400">
                <span className="w-2.5 h-0.5 rounded bg-violet-400" /> Pressure (bar)
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(11,19,43,0.95)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '12px', fontSize: '12px', color: '#fff',
                }}
              />
              <ReferenceLine y={35} yAxisId="left" stroke="#F59E0B40" strokeDasharray="4 4" />
              <ReferenceLine y={40} yAxisId="left" stroke="#F59E0B40" strokeDasharray="4 4" />
              <ReferenceLine y={1.5} yAxisId="right" stroke="#EF444440" strokeDasharray="4 4" />
              <Line yAxisId="left" type="monotone" dataKey="Temperature" stroke="#F59E0B" strokeWidth={2} dot={false} animationDuration={800} />
              <Line yAxisId="right" type="monotone" dataKey="Pressure" stroke="#8B5CF6" strokeWidth={2} dot={false} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <LocationCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">pH & Methane Concentration</h3>
              <p className="text-xs text-slate-500">3-second sampling interval</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-0.5 rounded bg-cyan-400" /> pH
              </span>
              <span className="flex items-center gap-1.5 text-eco-400">
                <span className="w-2.5 h-0.5 rounded bg-eco-400" /> CH₄ (%)
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
              <YAxis yAxisId="left" domain={[6, 8]} tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
              <YAxis yAxisId="right" orientation="right" domain={[40, 80]} tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(11,19,43,0.95)', border: '1px solid rgba(6,182,212,0.2)',
                  borderRadius: '12px', fontSize: '12px', color: '#fff',
                }}
              />
              <ReferenceLine y={6.5} yAxisId="left" stroke="#EF444460" strokeDasharray="4 4" label={{ value: 'pH 6.5', fill: '#EF4444', fontSize: 9 }} />
              <Line yAxisId="left" type="monotone" dataKey="pH" stroke="#06B6D4" strokeWidth={2} dot={false} animationDuration={800} />
              <Line yAxisId="right" type="monotone" dataKey="Methane" stroke="#10B981" strokeWidth={2} dot={false} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System status strip */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-4 h-4 text-eco-400" />
          <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">System Status</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Heater Coil', value: 'Active', ok: true },
            { label: 'Agitator Motor', value: 'Running', ok: true },
            { label: 'Gas Sensor Array', value: 'Online', ok: true },
            { label: 'Pressure Relief', value: 'Standby', ok: true },
            { label: 'pH Probe', value: 'Calibrated', ok: true },
            { label: 'Data Uplink', value: 'Streaming', ok: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <CheckCircle className="w-4 h-4 text-eco-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-slate-400 truncate">{s.label}</div>
                <div className="text-xs font-semibold text-eco-400">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Prospects Roadmap */}
      <FutureProspects variant="roadmap" />
    </div>
  );
}
