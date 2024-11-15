import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/projectTypes';

// Signin Route (POST /api/auth/signin)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // Create a Supabase client with cookie support
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Error during sign-in:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data?.session) {
      return NextResponse.json({ error: 'Sign-in failed, no session created.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Successfully signed in.' }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error during sign-in:", err);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}
