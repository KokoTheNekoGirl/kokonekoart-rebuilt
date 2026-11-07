import { PUBLIC_PAYPAL_CLIENT_ID } from 'astro:env/client';
import { PAYPAL_API_BASE, PAYPAL_CLIENT_SECRET, PAYPAL_ENV } from 'astro:env/server';
import { CURRENCY } from '@data/commissions';

const base = () => PAYPAL_API_BASE || (PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');

export class PayPalError extends Error {
  constructor(
    message: string,
    public status = 502,
    public issue?: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit & { headers?: Record<string, string> }): Promise<T> {
  const res = await fetch(`${base()}${path}`, init);
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    // OAuth errors look like { error: 'invalid_client', error_description: '...' }; orders errors like { name, message, details }.
    const issue = data?.details?.[0]?.issue ?? data?.name ?? data?.error;
    throw new PayPalError(data?.message ?? data?.error_description ?? `PayPal error ${res.status}`, res.status, issue);
  }
  return data as T;
}

async function token(): Promise<string> {
  if (!PUBLIC_PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) throw new PayPalError('PayPal is not configured.', 500);
  const auth = btoa(`${PUBLIC_PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const data = await call<{ access_token: string }>('/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  return data.access_token;
}

const authed = async (extra: Record<string, string> = {}) => ({
  Authorization: `Bearer ${await token()}`,
  'Content-Type': 'application/json',
  ...extra,
});

export interface PayPalOrder {
  id: string;
  status: string;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  purchase_units?: {
    custom_id?: string;
    amount?: { currency_code: string; value: string };
    payments?: { captures?: { id: string; status: string; amount: { currency_code: string; value: string } }[] };
  }[];
}

export async function createOrder(total: number, description: string, customId: string) {
  return call<PayPalOrder>('/v2/checkout/orders', {
    method: 'POST',
    headers: await authed({ 'PayPal-Request-Id': crypto.randomUUID() }),
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: customId,
          description: description.slice(0, 127),
          amount: { currency_code: CURRENCY, value: total.toFixed(2) },
        },
      ],
    }),
  });
}

export async function getOrder(id: string) {
  return call<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}`, { method: 'GET', headers: await authed() });
}

export async function captureOrder(id: string) {
  return call<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, {
    method: 'POST',
    headers: await authed({ 'PayPal-Request-Id': `capture-${id}`, Prefer: 'return=representation' }),
    body: '{}',
  });
}

export const isOrderId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{8,40}$/.test(v);
