import { createClient } from '@supabase/supabase-js';

// Dashboard Supabase (journal, snapshots, state)
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Predictions Supabase (existing prediction tracker)
export const predictionsSupa = createClient(
    process.env.SUPABASE_PREDICTIONS_URL || 'https://lrkjmpsbrsmqajeyyyoe.supabase.co',
    process.env.SUPABASE_PREDICTIONS_KEY
);
