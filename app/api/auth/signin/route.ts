import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data, error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message || 'Invalid login' },
      { status: 400 }
    );
  }

  const { access_token, expires_in, user } = data.session;

  // Set a secure, HTTP-only cookie with the access token
  const response = NextResponse.json({ message: 'Signed in successfully', user });
  response.cookies.set({
    name: 'sb-access-token',
    value: access_token,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: expires_in,
    path: '/',
  });

  return response;
}
