import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.SESSION_SECRET || 'csrf-development-secret';
const TOKEN_SIZE = 32;

export function generateCsrfToken(sessionId: string): string {
  const randomBytes = crypto.randomBytes(TOKEN_SIZE);
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${randomBytes.toString('hex')}.${timestamp}.${sessionId}`)
    .digest('hex');
  
  const token = `${randomBytes.toString('hex')}.${timestamp}`;
  return `${token}.${signature}`;
}

export function verifyCsrfToken(token: string, sessionId: string = ''): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [randomPart, timestamp, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${randomPart}.${timestamp}.${sessionId}`)
    .digest('hex');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return false;
    }
  } catch {
    return false;
  }

  const tokenAge = Date.now() - parseInt(timestamp, 10);
  const MAX_TOKEN_AGE = 24 * 60 * 60 * 1000;
  if (tokenAge > MAX_TOKEN_AGE) {
    return false;
  }

  return true;
}

export function extractCsrfToken(req: any): string | null {
  const headerToken = req.headers['x-csrf-token'];
  if (headerToken && typeof headerToken === 'string') {
    return headerToken;
  }

  const cookieToken = req.cookies?.csrfToken;
  if (cookieToken && typeof cookieToken === 'string') {
    return cookieToken;
  }

  return null;
}
