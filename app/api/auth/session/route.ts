import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supbaseClient';

// Session Route (GET /api/auth/session)
export async function GET() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(session);
}
