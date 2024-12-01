import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/projectTypes';

// Session Route (GET /api/auth/session)
export async function GET() {
  console.log("api/auth/session");

  // Create a Supabase client that has access to the cookie context
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Get the current session from Supabase
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.log("api/auth/session DATA:", session);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(session);
}
