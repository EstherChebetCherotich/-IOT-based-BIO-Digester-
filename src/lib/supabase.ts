import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CommunityImpact = {
  id: number;
  total_waste_diverted_kg: number;
  co2_prevented_kg: number;
  trees_equivalent: number;
  households: number;
  energy_generated_kwh: number;
  updated_at: string;
};

export type SimulationRun = {
  id: string;
  feedstock_type: string;
  feedstock_mass_kg: number;
  temperature_c: number;
  methane_m3: number;
  duration_days: number;
  run_at: string;
};
