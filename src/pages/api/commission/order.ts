import type { APIRoute } from 'astro';
import { parseChoice } from '@utils/commission-form';
import { json, readJson } from '@utils/server/http';
import { PayPalError, createOrder } from '@utils/server/paypal';
import { verifyRecaptcha } from '@utils/server/recaptcha';

export const prerender = false;

/** Step 1 of checkout: the browser asks for an order, we price it ourselves and ask PayPal for it. */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJson(request);
  if (!body) return json(400, { ok: false, message: 'Something went wrong with that request.' });

  const choice = parseChoice(body);
  if (!choice.ok) return json(400, { ok: false, errors: choice.errors, message: 'Please check your selection.' });

  if (!(await verifyRecaptcha(body.recaptcha, 'commission'))) {
    return json(403, { ok: false, message: 'reCAPTCHA could not verify you. Please try again in a moment.' });
  }

  try {
    // The total comes from our price list, never from the browser.
    const order = await createOrder(
      choice.resolved.total,
      `KokoNekoArt commission: ${choice.resolved.summary}`,
      choice.key,
    );
    return json(200, { ok: true, id: order.id });
  } catch (e) {
    console.error('PayPal create order failed:', e);
    const status = e instanceof PayPalError && e.status === 500 ? 500 : 502;
    // While developing, show PayPal's actual reason in the browser (never in production).
    const detail = import.meta.env.DEV && e instanceof PayPalError ? `${e.status} ${e.issue ?? ''} ${e.message}`.trim() : undefined;
    return json(status, { ok: false, message: 'I could not start the PayPal checkout. Please try again.', detail });
  }
};
