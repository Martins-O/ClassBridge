const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET_KEY;
const CAPTCHA_SITE_KEY = process.env.CAPTCHA_SITE_KEY;

export interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
  score?: number;
}

/**
 * Verify a CAPTCHA token using Cloudflare Turnstile
 * Falls back to reCAPTCHA v2/v3 if configured
 */
export async function verifyCaptchaToken(token: string, remoteip?: string): Promise<CaptchaVerificationResult> {
  if (!CAPTCHA_SECRET) {
    console.warn('[Captcha] No secret key configured, skipping verification');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'CAPTCHA token is required' };
  }

  try {
    // Try Cloudflare Turnstile first (preferred)
    if (CAPTCHA_SITE_KEY && CAPTCHA_SITE_KEY.startsWith('0x')) {
      return await verifyTurnstile(token, remoteip);
    }

    // Fall back to reCAPTCHA
    return await verifyRecaptcha(token, remoteip);
  } catch (error) {
    console.error('[Captcha] Verification error:', error);
    return { success: false, error: 'CAPTCHA verification failed' };
  }
}

async function verifyTurnstile(token: string, remoteip?: string): Promise<CaptchaVerificationResult> {
  const formData = new URLSearchParams();
  formData.append('secret', CAPTCHA_SECRET!);
  formData.append('response', token);
  if (remoteip) formData.append('remoteip', remoteip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  const data: any = await response.json();

  if (data.success) {
    return { success: true };
  }

  return {
    success: false,
    error: data['error-codes']?.join(', ') || 'Turnstile verification failed'
  };
}

async function verifyRecaptcha(token: string, remoteip?: string): Promise<CaptchaVerificationResult> {
  const url = new URL('https://www.google.com/recaptcha/api/siteverify');
  url.searchParams.append('secret', CAPTCHA_SECRET!);
  url.searchParams.append('response', token);
  if (remoteip) url.searchParams.append('remoteip', remoteip);

  const response = await fetch(url.toString(), { method: 'POST' });
  const data: any = await response.json();

  if (data.success) {
    return {
      success: true,
      score: data.score
    };
  }

  return {
    success: false,
    error: data['error-codes']?.join(', ') || 'reCAPTCHA verification failed'
  };
}
