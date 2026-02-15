import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
  }

  // Service role bypasses RLS - no auth header needed
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if table exists (service role ignores RLS)
    const { error: checkError } = await supabase
      .from('bookmarks')
      .select('id', { count: 'exact', head: true });

    if (!checkError) {
      return NextResponse.json({ 
        success: true, 
        message: '✅ Table exists and ready' 
      });
    }

    console.log('🚀 Creating database schema...');

    // 1. Create execute_sql RPC function (if missing)
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    // 2. Enable UUID extension
    await supabase.rpc('execute_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    });

    // 3. Create table + indexes + RLS
    await supabase.rpc('execute_sql', {
      sql: `
        -- Create table
        CREATE TABLE IF NOT EXISTS public.bookmarks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Indexes
        CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
        CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON bookmarks(created_at DESC);
        
        -- Enable RLS
        ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
      `
    });

    // 4. Create RLS policies
    await supabase.rpc('execute_sql', {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users view own" ON bookmarks;
        DROP POLICY IF EXISTS "Users insert own" ON bookmarks;
        DROP POLICY IF EXISTS "Users delete own" ON bookmarks;
        DROP POLICY IF EXISTS "Users update own" ON bookmarks;

        -- Create new policies
        CREATE POLICY "Users view own" ON bookmarks 
          FOR SELECT USING (auth.uid() = user_id);
          
        CREATE POLICY "Users insert own" ON bookmarks 
          FOR INSERT WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "Users update own" ON bookmarks 
          FOR UPDATE USING (auth.uid() = user_id);
          
        CREATE POLICY "Users delete own" ON bookmarks 
          FOR DELETE USING (auth.uid() = user_id);
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: '✅ Database fully initialized!' 
    });

  } catch (error: any) {
    console.error('DB init error:', error);
    return NextResponse.json({ 
      error: 'Init failed', 
      details: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}
