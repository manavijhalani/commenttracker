import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_DATABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  headers: {
    apikey: supabaseAnonKey, // Explicitly include the API key
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
});
