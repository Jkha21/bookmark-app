'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auto-initialize database (runs once per session)
let dbInitialized = false;
export async function ensureDatabaseInitialized() {
  if (dbInitialized) return;
  
  try {
    const response = await fetch('/api/init-db', { method: 'POST' });
    if (response.ok) {
      console.log('✅ Database ready');
    }
    dbInitialized = true;
  } catch (error) {
    console.log('DB init skipped (may already exist):', error);
  }
}
