import { useEffect, useState } from 'react';
import { supabase, type CommunityImpact } from '../lib/supabase';
import {
  Trash2, CloudOff, TreePine, Users, Zap, ChevronDown, Leaf,
  Recycle, Sprout, ArrowRight, Heart, TrendingUp, Lightbulb,
} from 'lucide-react';
import FutureProspects from '../components/FutureProspects';

const FAQS = [
  {
    q: 'What is anaerobic digestion?',
    a: 'Anaerobic digestion is a natural biological process where microorganisms break down organic material — like food waste, manure, and crop residue — in an oxygen-free environment. This process produces biogas (mostly methane and CO₂) and a nutrient-rich byproduct called digestate, which makes excellent organic fertilizer.',
  },
  {
    q: 'How does a bio-digester help the environment?',
    a: 'Bio-digesters capture methane that would otherwise escape into the atmosphere from decomposing waste — methane is 25x more potent than CO₂ as a greenhouse gas. The captured biogas replaces fossil fuels for cooking and electricity, while the digestate replaces synthetic fertilizers. It is a true circular-economy solution.',
  },
  {
    q: 'What household organic waste can I sort for the digester?',
    a: 'Yes to: fruit and vegetable peels, coffee grounds, tea bags, eggshells, cooked food scraps, garden trimmings, and shredded paper. No to: plastics, glass, metal, bones in large quantities, chemical waste, and synthetic materials. The key rule is: if it was once alive, it can go in.',
  },
  {
    q: 'How is the biogas used in our community?',
    a: 'The biogas produced by the centralized digester is piped to nearby households for clean cooking (replacing wood and LPG), used to fuel a small generator for community electricity, and can be upgraded to biomethane for vehicles. The digestate is distributed to local farms as bio-fertilizer.',
  },
  {
    q: 'How much waste does one household typically divert?',
    a: 'An average household produces 0.5–1 kg of organic waste per day. Over a year, that is 180–365 kg per household diverted from landfills. Our community digester currently serves 38 households, diverting over 12 tonnes of waste annually.',
  },
  {
    q: 'Is the digestate safe to use as fertilizer?',
    a: 'Yes. The anaerobic digestion process kills pathogens and weed seeds through the sealed, warm environment. The resulting digestate is a stable, nutrient-rich bio-fertilizer that improves soil structure, retains moisture, and reduces the need for chemical fertilizers.',
  },
];

export default function Community() {
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [pledging, setPledging] = useState(false);
  const [pledged, setPledged] = useState(false);

  useEffect(() => {
    supabase
      .from('community_impact')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setImpact(data as CommunityImpact);
        setLoading(false);
      });
  }, []);

  const pledge = async () => {
    if (!impact || pledging) return;
    setPledging(true);
    const newImpact = {
      ...impact,
      households: impact.households + 1,
      total_waste_diverted_kg: impact.total_waste_diverted_kg + 250,
      co2_prevented_kg: impact.co2_prevented_kg + 62.5,
      trees_equivalent: impact.trees_equivalent + 2.8,
      energy_generated_kwh: impact.energy_generated_kwh + 37,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('community_impact')
      .update({
        households: newImpact.households,
        total_waste_diverted_kg: newImpact.total_waste_diverted_kg,
        co2_prevented_kg: newImpact.co2_prevented_kg,
        trees_equivalent: newImpact.trees_equivalent,
        energy_generated_kwh: newImpact.energy_generated_kwh,
        updated_at: newImpact.updated_at,
      })
      .eq('id', 1)
      .select()
      .maybeSingle();
    if (!error && data) {
      setImpact(data as CommunityImpact);
      setPledged(true);
    }
    setPledging(false);
  };

  const stats = impact
    ? [
        { label: 'Waste Diverted', value: impact.total_waste_diverted_kg, unit: 'kg', icon: Trash2, color: '#10B981' },
        { label: 'CO₂ Prevented', value: impact.co2_prevented_kg, unit: 'kg', icon: CloudOff, color: '#06B6D4' },
        { label: 'Trees Equivalent', value: impact.trees_equivalent, unit: 'trees', icon: TreePine, color: '#34D399' },
        { label: 'Households', value: impact.households, unit: 'homes', icon: Users, color: '#8B5CF6' },
        { label: 'Energy Generated', value: impact.energy_generated_kwh, unit: 'kWh', icon: Zap, color: '#F59E0B' },
      ]
    : [];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-eco-500/10 border border-eco-500/20 text-eco-400 text-xs font-medium mb-6">
                <Sprout className="w-3.5 h-3.5" />
                Community Awareness Portal
              </div>
              <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Turning waste into{' '}
                <span className="text-gradient-eco">a greener future</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
                Our IoT-powered centralized bio-digester transforms household organic waste into clean energy and organic fertilizer — reducing emissions, cutting landfill use, and powering our community sustainably.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={pledge} disabled={pledging || pledged} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {pledged ? (
                    <>
                      <Heart className="w-4 h-4 fill-current" />
                      Pledged! Thank you
                    </>
                  ) : (
                    <>
                      <Leaf className="w-4 h-4" />
                      Pledge Your Waste
                    </>
                  )}
                </button>
                <a href="#impact" className="btn-ghost flex items-center gap-2 border border-white/[0.08]">
                  See Our Impact
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="glass-strong p-8 relative animate-float">
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-eco-500/20 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-cyan-500/20 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-eco-500 to-cyan-500 flex items-center justify-center glow-eco">
                      <Recycle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white">How It Works</h3>
                      <p className="text-xs text-slate-400">The circular economy in 3 steps</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { n: '01', t: 'Collect', d: 'Households sort organic waste into dedicated bins' },
                      { n: '02', t: 'Digest', d: 'Centralized digester converts waste to biogas + fertilizer' },
                      { n: '03', t: 'Return', d: 'Clean energy and bio-fertilizer flow back to the community' },
                    ].map((s) => (
                      <div key={s.n} className="flex items-start gap-3">
                        <span className="font-display text-2xl font-bold text-eco-500/30">{s.n}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{s.t}</div>
                          <div className="text-xs text-slate-400">{s.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact tracker */}
      <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            Environmental Impact Tracker
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3">Our Community's Real Impact</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Live aggregated statistics from the BioCore centralized bio-digester network. Every kilogram of waste diverted makes a measurable difference.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-6 h-40 shimmer-bg animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-card p-6 text-center group">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <div className="font-display text-3xl font-bold text-white tabular-nums mb-1">
                    {s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-slate-400">{s.unit}</div>
                  <div className="text-sm font-medium text-slate-300 mt-2">{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {pledged && (
          <div className="mt-6 glass-strong border-eco-500/30 bg-eco-500/[0.08] p-4 flex items-center gap-3 animate-fade-in max-w-2xl mx-auto">
            <Heart className="w-5 h-5 text-eco-400 fill-current flex-shrink-0" />
            <p className="text-sm text-eco-200">
              Thank you for pledging! Your household has been added to the community tracker. Together we are making a real difference.
            </p>
          </div>
        )}
      </section>

      {/* Educational section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Waste sorting guide */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-eco-500/15 border border-eco-500/20 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-eco-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Waste Sorting Guide</h3>
                <p className="text-xs text-slate-400">What goes into the bio-digester</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot bg-eco-500" />
                  <span className="text-sm font-semibold text-eco-400">Yes — Feed the Digester</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Fruit & veg peels', 'Coffee grounds', 'Tea bags', 'Eggshells', 'Cooked food', 'Garden trimmings', 'Shredded paper'].map((t) => (
                    <span key={t} className="px-3 py-1.5 rounded-lg bg-eco-500/10 border border-eco-500/15 text-xs text-eco-300">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot bg-red-500" />
                  <span className="text-sm font-semibold text-red-400">No — Keep Out</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Plastics', 'Glass', 'Metal', 'Chemicals', 'Large bones', 'Synthetic materials'].map((t) => (
                    <span key={t} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15 text-xs text-red-300">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                <span className="text-cyan-400 font-medium">Rule of thumb:</span> If it was once alive (plant or animal), it can go in the digester.
              </p>
            </div>
          </div>

          {/* FAQ accordion */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-400">Understanding anaerobic digestion</p>
              </div>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`glass-card overflow-hidden transition-all duration-300 ${open ? 'border-eco-500/20' : ''}`}
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    >
                      <span className={`text-sm font-medium transition-colors ${open ? 'text-eco-400' : 'text-white'}`}>
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${open ? 'text-eco-400 rotate-180' : 'text-slate-500'}`} />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: open ? '300px' : '0px', opacity: open ? 1 : 0 }}
                    >
                      <p className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Future Prospects */}
      <FutureProspects variant="stakeholder" />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="glass-strong p-10 lg:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-eco-500/10 blur-3xl" />
          <div className="relative">
            <Leaf className="w-10 h-10 text-eco-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-3">
              Be part of the circular economy
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-6">
              Every household that joins our network diverts hundreds of kilograms of waste from landfills each year and produces clean, renewable energy.
            </p>
            <button onClick={pledge} disabled={pledging || pledged} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
              {pledged ? (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  You are part of the movement
                </>
              ) : (
                <>
                  <Leaf className="w-4 h-4" />
                  Join the Community
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
