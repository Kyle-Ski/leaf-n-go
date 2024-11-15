import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClientFactory';

// Session Route (GET /api/auth/session)
export async function GET() {
  const supabase = getSupabaseClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(session);
}
