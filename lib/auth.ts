import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/projectTypes';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This function will handle extracting and validating the user information from the session.
 * @param req - Next.js request object.
 * @returns user ID from the session or null if not authenticated.
 */
export async function getUserFromSession(req: NextRequest): Promise<string | null> {
  // Since accessing cookies in Next.js is now asynchronous, we need to handle it as follows:
  const res = NextResponse.next();
  
  // Create the Supabase client with the request and response
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get session information from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && session.user) {
    return session.user.id; // Return the user ID if the session is valid
  } else {
    return null; // No valid session, return null
  }
}
