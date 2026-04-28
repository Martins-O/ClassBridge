import { Request, Response, NextFunction } from 'express';
import { verifyCaptchaToken } from '@/lib/captcha';

/**
 * Middleware to verify CAPTCHA token from request
 * Expects token in: body.captchaToken, headers['x-captcha-token'], or query.captchaToken
 */
export async function captchaVerification(req: Request, res: Response, next: NextFunction) {
  const token =
    req.body?.captchaToken ||
    req.headers['x-captcha-token'] as string ||
    req.query?.captchaToken as string;

  const remoteip = req.ip || req.socket.remoteAddress || undefined;

  const result = await verifyCaptchaToken(token, remoteip);

  if (!result.success) {
    return res.status(403).json({
      success: false,
      error: 'CAPTCHA verification failed',
      errorCode: 'CAPTCHA_FAILED',
      details: result.error
    });
  }

  // For reCAPTCHA v3, check score (optional, threshold can be configured)
  if (result.score !== undefined && result.score < 0.5) {
    return res.status(403).json({
      success: false,
      error: 'CAPTCHA score too low, possible bot detected',
      errorCode: 'CAPTCHA_SCORE_LOW',
      score: result.score
    });
  }

  next();
}

/**
 * Optional CAPTCHA verification - continues regardless of result but logs it
 * Use for endpoints where you want to track but not block
 */
export async function optionalCaptchaVerification(req: Request, _res: Response, next: NextFunction) {
  const token =
    req.body?.captchaToken ||
    req.headers['x-captcha-token'] as string;

  if (!token) {
    console.log('[Captcha] No token provided for optional verification');
    return next();
  }

  const remoteip = req.ip || req.socket.remoteAddress || undefined;
  const result = await verifyCaptchaToken(token, remoteip);

  if (!result.success) {
    console.log('[Captcha] Optional verification failed:', result.error);
  } else {
    console.log('[Captcha] Optional verification passed, score:', result.score);
  }

  next();
}
