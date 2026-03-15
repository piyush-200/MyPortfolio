import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://uunjjmtuimtkxlmxqxin.supabase.co';
const supabaseAnonKey = 'sb_publishable_E3vQToXYHCDqDQs4Jurp5Q_wX4bL_Ls';

// Create Supabase client with minimal options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'portfolio-app'
    }
  }
});

// Export these for Edge Function calls
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;