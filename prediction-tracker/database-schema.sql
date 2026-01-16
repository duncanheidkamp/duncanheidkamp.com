--=============================================
-- PREDICTION TRACKER DATABASE SCHEMA
-- Run this in Supabase SQL Editor
--=============================================

-- ==================== TABLE 1: PREDICTIONS ====================
-- This stores all your predictions
create table predictions (
    -- Unique identifier (auto-generated)
    id uuid primary key default gen_random_uuid(),

    -- Prediction details
    name text not null,                    -- Short title
    description text not null,             -- Full description
    probability integer not null           -- Your confidence (1-99%)
        check (probability >= 1 and probability <= 99),
    category text not null                 -- Category type
        check (category in ('world_events', 'us_politics', 'business_finance', 'sports', 'misc')),
    resolution_date date not null,         -- When you'll know the outcome

    -- Timestamps
    created_at timestamptz default now(),  -- When prediction was created

    -- Resolution data (filled in when resolved)
    resolved boolean default false,        -- Has it been resolved?
    outcome boolean,                       -- true = happened, false = didn't happen
    brier_score decimal,                   -- Calculated Brier score
    resolved_at timestamptz                -- When it was resolved
);


-- ==================== TABLE 2: PREDICTION HISTORY ====================
-- This logs all changes to predictions (for transparency)
create table prediction_history (
    id uuid primary key default gen_random_uuid(),
    prediction_id uuid references predictions(id) on delete cascade,
    changed_at timestamptz default now(),
    field_name text not null,              -- What field changed
    old_value text,                        -- Previous value
    new_value text                         -- New value
);


-- ==================== SECURITY: ROW LEVEL SECURITY ====================
-- Enable RLS (required by Supabase)
alter table predictions enable row level security;
alter table prediction_history enable row level security;

-- Allow anyone to READ predictions (public view)
create policy "Allow public read on predictions"
    on predictions for select
    using (true);

-- Allow anyone to READ history (public view)
create policy "Allow public read on history"
    on prediction_history for select
    using (true);

-- Allow all operations (INSERT, UPDATE, DELETE) for authenticated and anon users
-- Note: Your admin page will handle password protection client-side
-- For production, you may want server-side auth instead
create policy "Allow all writes on predictions"
    on predictions for all
    using (true)
    with check (true);

create policy "Allow all writes on history"
    on prediction_history for all
    using (true)
    with check (true);


-- ==================== INDEXES (for faster queries) ====================
create index idx_predictions_resolved on predictions(resolved);
create index idx_predictions_category on predictions(category);
create index idx_predictions_resolution_date on predictions(resolution_date);
create index idx_history_prediction_id on prediction_history(prediction_id);


--=============================================
-- DONE! Your database is now ready.
--=============================================
