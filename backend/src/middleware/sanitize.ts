import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Middleware to sanitize user input to prevent NoSQL injection attacks
 * Uses express-mongo-sanitize to remove $ and . operators from request body, query, and params
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize body, query, and params
  mongoSanitize()(req, res, next);
}

/**
 * Recursively sanitize strings in an object to prevent XSS attacks
 * Removes HTML tags and encodes special characters
 */
export function xssSanitize(obj: any): any {
  if (typeof obj === 'string') {
    // Remove HTML tags and encode special characters
    return obj
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .replace(/[<>'"&]/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          case "'": return '&#x27;';
          case '&': return '&amp;';
          default: return char;
        }
      })
      .trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => xssSanitize(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = xssSanitize(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware to sanitize request body, query, and params against XSS attacks
 */
export function xssSanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = xssSanitize(req.body);
  }
  if (req.query) {
    req.query = xssSanitize(req.query);
  }
  if (req.params) {
    req.params = xssSanitize(req.params);
  }
  next();
}

/**
 * Combined sanitization middleware for all common attack vectors
 */
export function fullSanitize(req: Request, res: Response, next: NextFunction) {
  mongoSanitize()(req, res, () => {
    xssSanitizeMiddleware(req, res, next);
  });
}
