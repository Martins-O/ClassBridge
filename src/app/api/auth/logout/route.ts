import { NextResponse } from 'next/server';
import { getSessionCookieName } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // Clear the userId cookie
  response.cookies.set(getSessionCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  });

  return response;
}
