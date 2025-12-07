// Shared Supabase client instance (singleton pattern)
// This prevents creating multiple instances across different components
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ydmavbbgtvkygosbyezv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '******';

// Create a single instance to be reused across the application
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
