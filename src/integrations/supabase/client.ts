import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Clean URL by stripping trailing slashes and /rest/v1 or /auth/v1
const cleanUrl = rawUrl.replace(/\/(rest|auth)\/v\d+\/?$/i, '').replace(/\/+$/, '');
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const supabase = createClient(cleanUrl, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
