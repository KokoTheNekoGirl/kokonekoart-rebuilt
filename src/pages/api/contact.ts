import type { APIRoute } from 'astro';
import { validateContact } from '@utils/contact-form';
import { contactEmail } from '@utils/server/emails';
import { json, readJson } from '@utils/server/http';
import { recipients, sendMail } from '@utils/server/mail';
import { verifyRecaptcha } from '@utils/server/recaptcha';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await readJson(request);
  if (!body) return json(400, { ok: false, message: 'Something went wrong with that request.' });

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (typeof body.website === 'string' && body.website !== '') return json(200, { ok: true });

  const result = validateContact(body);
  if (!result.ok) return json(400, { ok: false, errors: result.errors, message: 'Please fix the highlighted fields.' });

  if (!(await verifyRecaptcha(body.recaptcha, 'contact'))) {
    return json(403, { ok: false, message: 'reCAPTCHA could not verify you. Please try again in a moment.' });
  }

  const mail = contactEmail(result.values);
  const sent = await sendMail({
    to: recipients(),
    ...mail,
    replyTo: result.values.email || undefined,
  });
  if (!sent) return json(502, { ok: false, message: 'Something went wrong with your contact request. Please try again, or email contact@kokoneko.art.' });

  return json(200, { ok: true });
};
