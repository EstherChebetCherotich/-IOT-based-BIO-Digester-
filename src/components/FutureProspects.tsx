import { useState } from 'react';
import { Network, BrainCircuit, Smartphone, ArrowRight, Target, CheckCircle2, Circle } from 'lucide-react';

type Feature = {
  id: string;
  step: string;
  title: string;
  icon: typeof Network;
  color: string;
  body: string;
  milestones: string[];
};

const FEATURES: Feature[] = [
  {
    id: 'multi-hub',
    step: 'Phase 01',
    title: 'Multi-Hub Centralization',
    icon: Network,
    color: '#10B981',
    body: 'Expanding from a single Mukono hub into a decentralized network of smart bio-digesters across neighboring districts. The web architecture is built to support a "Global Admin View," allowing developers to toggle between different regional digester locations on a single map dropdown.',
    milestones: ['District-level node deployment', 'Global Admin map dropdown', 'Cross-hub telemetry aggregation'],
  },
  {
    id: 'ai-predictive',
    step: 'Phase 02',
    title: 'AI-Driven Predictive Maintenance',
    icon: BrainCircuit,
    color: '#06B6D4',
    body: 'Integrating Machine Learning models into the simulation backend. Future updates will transition the system from basic telemetry tracking to predictive analytics—forecasting potential pH drops or pressure surges 24 hours before they occur based on ambient Mukono weather patterns and historical feedstock data.',
    milestones: ['ML model integration', '24-hour anomaly forecasting', 'Weather-correlated predictions'],
  },
  {
    id: 'payg-grid',
    step: 'Phase 03',
    title: 'Pay-As-You-Go Biogas Grid',
    icon: Smartphone,
    color: '#34D399',
    body: 'Preparing the IoT infrastructure to interface with smart electronic gas meters. This will pave the way for a community micro-grid monetization model, allowing local households to purchase clean cooking gas seamlessly via mobile money platforms integrated directly into this portal.',
    milestones: ['Smart gas meter IoT interface', 'Mobile money integration', 'Community micro-grid billing'],
  },
];

type Props = {
  variant: 'roadmap' | 'stakeholder';
};

export default function FutureProspects({ variant }: Props) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className={variant === 'roadmap' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-eco-500/10 border border-eco-500/20 text-eco-400 text-xs font-medium mb-4">
          <Target className="w-3.5 h-3.5" />
          Strategic Roadmap
        </div>
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3">
          Future Prospects &amp; Next-Gen Scaling
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          {variant === 'roadmap'
            ? 'The development roadmap for scaling BioCore beyond Mukono — from network expansion to AI-driven intelligence and community monetization.'
            : 'Our vision for the future — scaling clean energy across Uganda with smart technology, predictive intelligence, and accessible community monetization.'}
        </p>
      </div>

      {/* Progression line for roadmap variant */}
      {variant === 'roadmap' && (
        <div className="relative mb-8 hidden md:block">
          <div className="absolute top-6 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-eco-500/40 via-cyan-500/40 to-eco-400/40" />
          <div className="flex justify-between px-[16%]">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.id} className="flex flex-col items-center gap-2 relative z-10">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-midnight-900 border-2 transition-all duration-300"
                    style={{ borderColor: f.color, boxShadow: `0 0 16px ${f.color}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: f.color }}>
                    {f.step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          const isActive = active === f.id;
          return (
            <div
              key={f.id}
              onMouseEnter={() => setActive(f.id)}
              onMouseLeave={() => setActive(null)}
              className={`glass-card p-6 relative overflow-hidden group transition-all duration-500 ${
                isActive ? 'border-eco-500/30 -translate-y-1' : ''
              }`}
            >
              {/* Glow background */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `${f.color}20` }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: `${f.color}10`, color: f.color, border: `1px solid ${f.color}20` }}
                  >
                    {f.step}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{f.body}</p>

                {/* Milestones */}
                <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                  {f.milestones.map((m, mi) => (
                    <div key={mi} className="flex items-center gap-2.5">
                      {mi === 0 && f.id === 'multi-hub' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: f.color }} />
                      ) : (
                        <Circle className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
                      )}
                      <span className={`text-xs ${mi === 0 && f.id === 'multi-hub' ? 'text-slate-300' : 'text-slate-500'}`}>
                        {m}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Arrow indicator */}
                {variant === 'roadmap' && i < FEATURES.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-midnight-800 border border-white/10 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
