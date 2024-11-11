import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supbaseClient';

// Signout Route (POST /api/auth/signout)
export async function POST() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
}
