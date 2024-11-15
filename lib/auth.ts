import { cookies } from 'next/headers';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/projectTypes';
import { NextRequest } from 'next/server';

/**
 * This function will handle extracting and validating the user information from the session
 * @param req 
 * @returns user id from the session
 */
export async function getUserFromSession(req: NextRequest) {
  const supabase = createMiddlewareClient<Database>({ req, cookies });

  // Get session information from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && session.user) {
    return session.user.id; // Return the user ID if session is valid
  } else {
    return null; // No valid session, return null
  }
}
