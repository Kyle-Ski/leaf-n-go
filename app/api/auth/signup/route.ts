import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClientFactory';

export async function POST(request: Request) {
  const supabase = getSupabaseClient();
  const body = await request.json();
  const { email, password } = body;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'A confirmation email has been sent. Please check your inbox to verify your account.' }, { status: 200 });
}
