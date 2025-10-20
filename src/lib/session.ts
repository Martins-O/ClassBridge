import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'userId';

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? 'development-only-secret' : undefined);

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable must be set in production');
  }

  return secret;
}

function signValue(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}

export function encodeSessionToken(userId: string) {
  const signature = signValue(userId);
  return `${userId}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [userId, signature] = token.split('.');
  if (!userId || !signature) {
    return null;
  }

  try {
    const expectedSignature = signValue(userId);
    const provided = Buffer.from(signature, 'hex');
    const expected = Buffer.from(expectedSignature, 'hex');

    if (provided.length !== expected.length) {
      return null;
    }

    if (timingSafeEqual(provided, expected)) {
      return userId;
    }
  } catch (error) {
    console.error('Failed to verify session token:', error);
  }

  return null;
}

export function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
