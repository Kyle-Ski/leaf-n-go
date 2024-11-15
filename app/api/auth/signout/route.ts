import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClientFactory';

// Signout Route (POST /api/auth/signout)
export async function POST() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
}
