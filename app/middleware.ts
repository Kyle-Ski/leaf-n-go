import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/projectTypes';

// Define paths that are publicly accessible without authentication
const publicPaths = ["/auth", "/about", "/404", "/api/auth/session"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client using the request and response
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Check if the current path is publicly accessible
  const { pathname } = req.nextUrl;
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return res; // Allow public paths without authentication
  }

  // Get the current session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Middleware session check:", session);
  if (!session) {
    // If no session, redirect to the authentication page
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // If session exists, continue with the request
  return res;
}

// Specify the routes on which the middleware should run
export const config = {
  matcher: ['/((?!api/auth).*)'], // Runs on all routes except those in the auth API
};
