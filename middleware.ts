import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname.startsWith('/signup');
  const isAboutPage = request.nextUrl.pathname.startsWith('/about'); // Allow access to the /about page

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to the /about page without a token
  if (isAboutPage) {
    return NextResponse.next();
  }

  if (!isAuthPage && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
