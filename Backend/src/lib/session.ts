import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_COOKIE_NAME = 'userId';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? 'development-only-secret' : undefined);

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable must be set in production');
  }

  return secret;
}

function signValue(value: string): string {
  return createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}

export function encodeSessionToken(userId: string): string {
  const signature = signValue(userId);
  return `${userId}.${signature}`;
}

export function verifySessionToken(token: string | undefined): string | null {
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
  } catch {
    // Silent failure for security
  }

  return null;
}

export function getUserIdFromRequest(req: Request): string | null {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  return verifySessionToken(token);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = getUserIdFromRequest(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.userId = userId;
  next();
}

export function roleMiddleware(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
