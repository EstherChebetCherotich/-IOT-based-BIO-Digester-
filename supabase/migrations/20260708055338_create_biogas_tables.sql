/*
# Smart Biogas Dashboard — community impact + simulation runs

1. New Tables
- `community_impact` — single shared row holding aggregated community stats
  (total_waste_diverted_kg, co2_prevented_kg, trees_equivalent, households,
  energy_generated_kwh, updated_at). Public read/write (no-auth app: the
  community portal increments these counters).
- `simulation_runs` — log of bio-digester simulation runs submitted by
  developers (feedstock_type, feedstock_mass_kg, temperature_c, methane_m3,
  duration_days, run_at). Public read/write so the anon-key client can insert
  and list runs.
2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD on both tables because the data is
  intentionally public/shared (no sign-in screen for the community portal).
*/

CREATE TABLE IF NOT EXISTS community_impact (
  id integer PRIMARY KEY DEFAULT 1,
  total_waste_diverted_kg double precision NOT NULL DEFAULT 0,
  co2_prevented_kg double precision NOT NULL DEFAULT 0,
  trees_equivalent double precision NOT NULL DEFAULT 0,
  households integer NOT NULL DEFAULT 0,
  energy_generated_kwh double precision NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT community_impact_singleton CHECK (id = 1)
);

INSERT INTO community_impact (id, total_waste_diverted_kg, co2_prevented_kg, trees_equivalent, households, energy_generated_kwh)
VALUES (1, 12480, 3120, 142, 38, 1860)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE community_impact ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_impact" ON community_impact;
CREATE POLICY "anon_select_impact" ON community_impact FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_impact" ON community_impact;
CREATE POLICY "anon_update_impact" ON community_impact FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS simulation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedstock_type text NOT NULL,
  feedstock_mass_kg double precision NOT NULL,
  feedstock_mass_kg_check double precision,
  temperature_c double precision NOT NULL,
  methane_m3 double precision NOT NULL,
  duration_days integer NOT NULL,
  run_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_runs" ON simulation_runs;
CREATE POLICY "anon_select_runs" ON simulation_runs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_runs" ON simulation_runs;
CREATE POLICY "anon_insert_runs" ON simulation_runs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_simulation_runs_run_at ON simulation_runs(run_at DESC);
