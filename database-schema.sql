-- ============================================
-- DUNCAN'S DASHBOARD v2.0
-- Supabase Database Schema
-- Run this in: Supabase → SQL Editor → New Query
-- ============================================

-- Journal Entries (quick idea capture)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    category TEXT DEFAULT 'idea' CHECK (category IN ('idea', 'observation', 'decision', 'question')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard Snapshots (for sweep delta computation)
CREATE TABLE dashboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User State (single-user dashboard state)
CREATE TABLE user_state (
    id TEXT PRIMARY KEY DEFAULT 'duncan',
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    last_snapshot_id UUID REFERENCES dashboard_snapshots(id),
    theme TEXT DEFAULT 'dark',
    dismissed_alerts JSONB DEFAULT '[]'
);

-- Alert Log (history of alerts)
CREATE TABLE alert_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier TEXT NOT NULL CHECK (tier IN ('FLASH', 'PRIORITY', 'ROUTINE')),
    headline TEXT NOT NULL,
    source TEXT,
    triggered_at TIMESTAMPTZ DEFAULT now(),
    dismissed BOOLEAN DEFAULT false
);

-- Create indexes for performance
CREATE INDEX idx_journal_created ON journal_entries(created_at DESC);
CREATE INDEX idx_snapshots_created ON dashboard_snapshots(created_at DESC);
CREATE INDEX idx_alerts_triggered ON alert_log(triggered_at DESC);

-- Enable Row Level Security (allow public read/write for single-user dashboard)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_log ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations with anon key (single-user, no auth needed)
CREATE POLICY "Allow all on journal_entries" ON journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on dashboard_snapshots" ON dashboard_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_state" ON user_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on alert_log" ON alert_log FOR ALL USING (true) WITH CHECK (true);

-- Insert initial user state row
INSERT INTO user_state (id, last_seen_at, theme) VALUES ('duncan', now(), 'dark');

-- Auto-update updated_at on journal entries
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Cleanup old snapshots (keep 48 hours)
-- Run this periodically via Supabase Edge Function or Vercel cron
-- DELETE FROM dashboard_snapshots WHERE created_at < now() - INTERVAL '48 hours';
