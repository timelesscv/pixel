import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { CONFIG } from './config';

export default defineConfig(({ mode }) => {
  // Load environment variables (fallback)
  const cwd = typeof process !== 'undefined' && typeof (process as any).cwd === 'function' ? (process as any).cwd() : '.';
  const env = loadEnv(mode, cwd, '');

  // MERGE: Config file takes precedence over .env
  // This ensures that if the user puts keys in config.ts, they are used.
  const finalEnv = {
    API_KEY: CONFIG.API_KEY || env.API_KEY || '',
    VITE_SUPABASE_URL: CONFIG.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: CONFIG.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
  };

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(finalEnv.API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(finalEnv.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(finalEnv.VITE_SUPABASE_ANON_KEY)
    },
    optimizeDeps: {
      include: ['@google/genai']
    }
  };
});