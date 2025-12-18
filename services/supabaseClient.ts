
import { createClient } from '@supabase/supabase-js';

// Access environment variables using process.env (injected by Vite config)
declare const process: any;

// We use placeholders to prevent the "supabaseUrl is required" error during initial load
// if the user hasn't set up their .env file yet or if variables aren't loading.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ VITE_SUPABASE_URL is missing or invalid. Using placeholder to prevent crash.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
