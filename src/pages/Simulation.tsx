import { useState, useEffect, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Digester3D, { type SimState, type TankMaterial } from '../components/Digester3D';
import { supabase, type SimulationRun } from '../lib/supabase';
import {
  Play, RotateCcw, FlaskConical, Thermometer, Scale, Leaf,
  TrendingUp, Clock, Zap, Info, History, Layers,
} from 'lucide-react';

type PartKey = 'inlet' | 'chamber' | 'dome' | 'outlet' | 'effluent';

const FEEDSTOCK_TYPES = [
  { id: 'food-waste', label: 'Food Waste', methaneFactor: 0.35, color: '#10B981' },
  { id: 'manure', label: 'Animal Manure', methaneFactor: 0.25, color: '#F59E0B' },
  { id: 'agri', label: 'Agricultural Residue', methaneFactor: 0.28, color: '#06B6D4' },
  { id: 'mixed', label: 'Mixed Organic', methaneFactor: 0.32, color: '#8B5CF6' },
];

const TOTAL_DAYS = 30;

export default function Simulation() {
  const [feedstockType, setFeedstockType] = useState(FEEDSTOCK_TYPES[0]);
  const [feedstockMass, setFeedstockMass] = useState(100);
  const [temperature, setTemperature] = useState(37);
  const [tankMaterial, setTankMaterial] = useState<TankMaterial>('metallic');
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(0);
  const [methaneData, setMethaneData] = useState<{ day: number; methane: number; cumulative: number }[]>([]);
  const [hovered, setHovered] = useState<PartKey | null>(null);
  const [selected, setSelected] = useState<PartKey | null>(null);
  const [recentRuns, setRecentRuns] = useState<SimulationRun[]>([]);
  const [savedRun, setSavedRun] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived sim state for 3D
  const tempFactor = Math.max(0.2, (temperature - 20) / 20); // 0..1
  const pressure = running || day > 0
    ? Math.min(1.8, 0.8 + tempFactor * 0.6 + (day / TOTAL_DAYS) * 0.3)
    : 0.8;
  const gasLevel = Math.min(1, day / TOTAL_DAYS);
  const bubbleSpeed = running ? 0.5 + tempFactor * 1.5 : 0.15;

  const sim: SimState = {
    feedstockType: feedstockType.label,
    feedstockMass,
    temperature,
    running,
    pressure,
    gasLevel,
    bubbleSpeed,
    day,
    tankMaterial,
  };

  // Load recent runs
  useEffect(() => {
    supabase
      .from('simulation_runs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setRecentRuns(data as SimulationRun[]);
      });
  }, []);

  const computeMethane = useCallback(
    (d: number) => {
      // Daily methane m³ = mass * factor * tempEfficiency * decayCurve
      const tempEff = temperature >= 35 && temperature <= 40 ? 1 : Math.max(0.3, 1 - Math.abs(temperature - 37.5) / 20);
      const decay = Math.exp(-d / 18); // production tapers over time
      const daily = feedstockMass * feedstockType.methaneFactor * tempEff * decay * 0.1;
      return daily;
    },
    [feedstockMass, feedstockType, temperature]
  );

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setDay(0);
    setMethaneData([]);
    setSavedRun(false);
    let currentDay = 0;
    let cumulative = 0;
    const data: { day: number; methane: number; cumulative: number }[] = [];

    intervalRef.current = setInterval(() => {
      currentDay += 1;
      const daily = computeMethane(currentDay);
      cumulative += daily;
      data.push({ day: currentDay, methane: +daily.toFixed(2), cumulative: +cumulative.toFixed(2) });
      setDay(currentDay);
      setMethaneData([...data]);

      if (currentDay >= TOTAL_DAYS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
        // Save run to Supabase
        supabase
          .from('simulation_runs')
          .insert({
            feedstock_type: feedstockType.label,
            feedstock_mass_kg: feedstockMass,
            temperature_c: temperature,
            methane_m3: +cumulative.toFixed(2),
            duration_days: TOTAL_DAYS,
          })
          .then(() => {
            setSavedRun(true);
            supabase
              .from('simulation_runs')
              .select('*')
              .order('run_at', { ascending: false })
              .limit(5)
              .then(({ data: d2 }) => {
                if (d2) setRecentRuns(d2 as SimulationRun[]);
              });
          });
      }
    }, 200); // ~6 seconds for 30 days
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setDay(0);
    setMethaneData([]);
    setSavedRun(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalMethane = methaneData.length > 0 ? methaneData[methaneData.length - 1].cumulative : 0;
  const energyKwh = totalMethane * 6.1; // ~6.1 kWh per m³ methane
  const co2Saved = totalMethane * 1.96; // ~1.96 kg CO2 per m³ methane

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-4 h-4 text-eco-400" />
          <span className="text-xs font-medium text-eco-400 uppercase tracking-wider">Interactive Simulation</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white">3D Bio-Digester Simulation</h1>
        <p className="text-slate-400 text-sm mt-1">Adjust parameters and run a 30-day methane production cycle</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 3D viewport */}
        <div className="lg:col-span-2 glass-card p-1 relative overflow-hidden" style={{ minHeight: '520px' }}>
          <div className="w-full h-[520px]">
            <Digester3D
              sim={sim}
              hovered={hovered}
              setHovered={setHovered}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
          {/* Day indicator overlay */}
          <div className="absolute top-4 left-4 glass px-4 py-2.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Simulation Day</div>
            <div className="font-display text-2xl font-bold text-white tabular-nums">
              {day}<span className="text-sm text-slate-500"> / {TOTAL_DAYS}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Feedstock type */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-4 h-4 text-eco-400" />
              <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">Waste Input Type</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FEEDSTOCK_TYPES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFeedstockType(f)}
                  disabled={running}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-all duration-300 disabled:opacity-50 ${
                    feedstockType.id === f.id
                      ? 'border-eco-500/40 bg-eco-500/10 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/[0.15]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: f.color }} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedstock mass */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">Feedstock Mass</h3>
              </div>
              <span className="font-display text-lg font-bold text-cyan-400 tabular-nums">{feedstockMass}<span className="text-xs text-slate-500"> kg</span></span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={feedstockMass}
              onChange={(e) => setFeedstockMass(Number(e.target.value))}
              disabled={running}
              className="w-full accent-cyan-500 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10 kg</span>
              <span>500 kg</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">Temperature</h3>
              </div>
              <span className="font-display text-lg font-bold text-amber-400 tabular-nums">{temperature}<span className="text-xs text-slate-500"> °C</span></span>
            </div>
            <input
              type="range"
              min={20}
              max={50}
              step={1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              disabled={running}
              className="w-full accent-amber-500 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>20°C</span>
              <span className="text-eco-400">Optimal: 35–40°C</span>
              <span>50°C</span>
            </div>
          </div>

          {/* Tank material switcher */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-slate-300" />
              <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">Tank Material</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTankMaterial('metallic')}
                disabled={running}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-all duration-300 disabled:opacity-50 ${
                  tankMaterial === 'metallic'
                    ? 'border-slate-400/40 bg-slate-400/10 text-white'
                    : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/[0.15]'
                }`}
              >
                Industrial Metallic
              </button>
              <button
                onClick={() => setTankMaterial('cement')}
                disabled={running}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-all duration-300 disabled:opacity-50 ${
                  tankMaterial === 'cement'
                    ? 'border-slate-300/40 bg-slate-300/10 text-white'
                    : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/[0.15]'
                }`}
              >
                Reinforced Cement
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={runSimulation}
              disabled={running}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Simulation
                </>
              )}
            </button>
            <button
              onClick={reset}
              disabled={running}
              className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all duration-300 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {savedRun && (
            <div className="glass px-4 py-3 flex items-center gap-2 text-xs text-eco-400 animate-fade-in">
              <Info className="w-4 h-4" />
              Run saved to database.
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Cumulative Methane Production</h3>
              <p className="text-xs text-slate-500">30-day simulation timeline</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-eco-400">
                <span className="w-2.5 h-0.5 rounded bg-eco-400" /> Cumulative (m³)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-0.5 rounded bg-cyan-400" /> Daily (m³)
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={methaneData}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" label={{ value: 'Day', fill: '#64748b', fontSize: 10, position: 'insideBottom', offset: -2 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(11,19,43,0.95)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '12px', fontSize: '12px', color: '#fff',
                }}
              />
              <Area type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2.5} fill="url(#cumGrad)" animationDuration={300} />
              <Area type="monotone" dataKey="methane" stroke="#06B6D4" strokeWidth={1.5} fill="url(#dailyGrad)" animationDuration={300} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-eco-400" />
              <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">Output Summary</h3>
            </div>
            <div className="space-y-3">
              <Stat label="Total Methane" value={totalMethane.toFixed(2)} unit="m³" icon={Zap} color="#10B981" />
              <Stat label="Energy Equivalent" value={energyKwh.toFixed(1)} unit="kWh" icon={Zap} color="#06B6D4" />
              <Stat label="CO₂ Prevented" value={co2Saved.toFixed(1)} unit="kg" icon={Leaf} color="#34D399" />
              <Stat label="Duration" value={String(day)} unit="days" icon={Clock} color="#F59E0B" />
            </div>
          </div>

          {/* Recent runs */}
          {recentRuns.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider">Recent Runs</h3>
              </div>
              <div className="space-y-2">
                {recentRuns.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{r.feedstock_type}</div>
                      <div className="text-[10px] text-slate-500">{r.feedstock_mass_kg}kg · {r.temperature_c}°C</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-eco-400">{r.methane_m3.toFixed(1)} m³</div>
                      <div className="text-[10px] text-slate-500">{new Date(r.run_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, icon: Icon, color }: { label: string; value: string; unit: string; icon: typeof Zap; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-display text-lg font-bold tabular-nums" style={{ color }}>{value}</span>
        <span className="text-xs text-slate-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}
