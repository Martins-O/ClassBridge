import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/lib/auth';
import { verifyCsrfToken, extractCsrfToken } from '@/lib/csrf';

const CSRF_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const CSRF_SAFE_PATHS = ['/auth/login', '/auth/register', '/auth/csrf-token'];

export function csrfProtection(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (CSRF_SAFE_METHODS.includes(req.method)) {
    return next();
  }

  if (CSRF_SAFE_PATHS.some(path => req.path.includes(path))) {
    return next();
  }

  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const token = extractCsrfToken(req);
  
  if (!token) {
    res.status(403).json({ 
      error: 'CSRF token missing',
      message: 'csrf_token_required'
    });
    return;
  }

  const sessionId = req.user?.userId || req.cookies?.sessionId || '';
  
  if (!verifyCsrfToken(token, sessionId)) {
    res.status(403).json({ 
      error: 'Invalid CSRF token',
      message: 'csrf_token_invalid'
    });
    return;
  }

  next();
}
