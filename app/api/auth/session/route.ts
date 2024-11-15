import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supbaseClient';

// Session Route (GET /api/auth/session)
export async function GET() {
  console.log("api/auth/session")
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.log("api/auth/session DATA:",session)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(session);
}
