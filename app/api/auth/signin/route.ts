import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supbaseClient';

// Signin Route (POST /api/auth/signin)
export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Successfully signed in.' }, { status: 200 });
}