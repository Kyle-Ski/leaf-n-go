import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Create a new response
  const response = NextResponse.json({ message: 'Signed out successfully' });

  // Delete the 'sb-access-token' cookie
  response.cookies.delete({
    name: 'sb-access-token',
    path: '/', // Include path if necessary
  });

  return response;
}
