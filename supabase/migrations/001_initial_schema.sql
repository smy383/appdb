-- Apps table: cached metadata from iTunes Lookup API
CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  bundle_id TEXT,
  artwork_url TEXT,
  primary_genre_id TEXT,
  primary_genre_name TEXT,
  price NUMERIC DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  description TEXT,
  release_date DATE,
  current_version TEXT,
  store_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chart snapshots: one row per collection run
CREATE TABLE IF NOT EXISTS chart_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  chart_type TEXT NOT NULL,
  genre_id TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chart entries: individual app positions within a snapshot
CREATE TABLE IF NOT EXISTS chart_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES chart_snapshots(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL REFERENCES apps(id),
  rank INTEGER NOT NULL,
  rank_change INTEGER
);

-- Indexes for performance
CREATE INDEX idx_snapshots_lookup
  ON chart_snapshots(country, chart_type, collected_at DESC);

CREATE INDEX idx_entries_snapshot
  ON chart_entries(snapshot_id);

CREATE INDEX idx_entries_app
  ON chart_entries(app_id, snapshot_id);

CREATE INDEX idx_apps_genre
  ON apps(primary_genre_id);

-- Convenient view for API queries
CREATE OR REPLACE VIEW daily_rankings AS
SELECT
  ce.rank,
  ce.rank_change,
  ce.app_id,
  cs.country,
  cs.chart_type,
  cs.genre_id,
  cs.collected_at::date AS date,
  a.name,
  a.artist_name,
  a.artwork_url,
  a.average_rating,
  a.rating_count,
  a.primary_genre_name
FROM chart_entries ce
JOIN chart_snapshots cs ON cs.id = ce.snapshot_id
JOIN apps a ON a.id = ce.app_id;

-- Row Level Security
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_entries ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read apps" ON apps FOR SELECT USING (true);
CREATE POLICY "Public read snapshots" ON chart_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read entries" ON chart_entries FOR SELECT USING (true);
