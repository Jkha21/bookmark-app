// app/api/init-db/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Check if table exists
    const { data: tableCheck } = await supabase
      .from('bookmarks')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (tableCheck) {
      return NextResponse.json({ success: true, message: 'Table exists' });
    }

    // Execute full schema via REST API (service role bypasses RLS)
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'params=single-object',
      },
      body: JSON.stringify({
        sql: `
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          
          CREATE TABLE IF NOT EXISTS public.bookmarks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);

          ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

          -- Drop existing policies first
          DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
          DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.bookmarks;
          DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
          DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.bookmarks;

          -- Create policies
          CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
            FOR SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks
            FOR INSERT WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
            FOR DELETE USING (auth.uid() = user_id);

          CREATE POLICY "Users can update their own bookmarks" ON public.bookmarks
            FOR UPDATE USING (auth.uid() = user_id);
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase API failed: ${errorText}`);
    }

    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: 'Initialization failed' },
      { status: 500 }
    );
  }
}
