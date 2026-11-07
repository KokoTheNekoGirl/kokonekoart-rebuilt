import { RECAPTCHA_SECRET_KEY, RECAPTCHA_VERIFY_URL } from 'astro:env/server';

const MIN_SCORE = 0.5;

/** Verifies a reCAPTCHA v3 token server-side. `action` must match what the browser asked for. */
export async function verifyRecaptcha(token: unknown, action: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY || typeof token !== 'string' || !token) return false;
  try {
    const res = await fetch(RECAPTCHA_VERIFY_URL || 'https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }),
    });
    const data = (await res.json()) as { success?: boolean; score?: number; action?: string };
    return data.success === true && data.action === action && (data.score ?? 0) >= MIN_SCORE;
  } catch {
    return false;
  }
}
