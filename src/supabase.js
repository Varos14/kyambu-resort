/* ==========================================================================
   Supabase Client Configuration — Kyambu Resort
   ──────────────────────────────────────────────
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual values from:
   Supabase Dashboard → Settings → API
   ========================================================================== */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mwcaanctieuxfntspbwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Y2FhbmN0aWV1eGZudHNwYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjE3MjIsImV4cCI6MjEwMjE5NzcyMn0.iXK9qbJijPQ4cyHwuXOg1EJ7JYvmdorlhO4ttLWHEqQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
