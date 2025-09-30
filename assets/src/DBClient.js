// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Get the environment variables from Vite
const VITE_db_URL = import.meta.env.VITE_db_URL;
const VITE_db_ANON_KEY = import.meta.env.VITE_db_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(VITE_db_URL, VITE_db_ANON_KEY);