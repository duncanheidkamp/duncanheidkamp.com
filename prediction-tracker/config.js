/*
=============================================
CONFIGURATION FILE
=============================================
This is the ONLY file you need to edit after
setting up Supabase. Replace the placeholder
values below with your actual Supabase keys.

INSTRUCTIONS:
1. Go to your Supabase project dashboard
2. Click "Project Settings" (gear icon)
3. Click "API" in the settings menu
4. Copy your "Project URL" and "anon public" key
5. Paste them below (keep the quotes!)
=============================================
*/

// YOUR SUPABASE CREDENTIALS - REPLACE THESE:
const SUPABASE_URL = 'https://lrkjmpsbrsmqajeyyyoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2ptcHNicnNtcWFqZXl5eW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjIzMzYsImV4cCI6MjA4Mzk5ODMzNn0.3KY0yuqaCShgk3GjYmxAsO5Vw6qXy0gbk2BKB56WUDU';

// ADMIN PASSWORD - REPLACE THIS:
// This is the password you'll use to access the admin page
// Choose something secure that only you know
const ADMIN_PASSWORD = 'password1234';


/*
=============================================
DO NOT EDIT BELOW THIS LINE
=============================================
*/

// Validate configuration
const CONFIG = {
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    adminPassword: ADMIN_PASSWORD,

    // Check if Supabase is configured
    isSupabaseConfigured: function() {
        return this.supabaseUrl !== 'YOUR_SUPABASE_URL' &&
               this.supabaseKey !== 'YOUR_ANON_KEY' &&
               this.supabaseUrl.includes('supabase.co');
    },

    // Check if admin password is configured
    isAdminConfigured: function() {
        return this.adminPassword !== 'CHANGE_THIS_PASSWORD' &&
               this.adminPassword.length >= 8;
    }
};
