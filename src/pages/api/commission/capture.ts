import type { APIRoute } from 'astro';
import { CURRENCY } from '@data/commissions';
import { checkFiles, parseChoice, sniffImage, validateDetails } from '@utils/commission-form';
import { commissionAdminEmail, commissionCustomerEmail } from '@utils/server/emails';
import { json } from '@utils/server/http';
import { recipients, sendMail } from '@utils/server/mail';
import { PayPalError, captureOrder, getOrder, isOrderId } from '@utils/server/paypal';

export const prerender = false;

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v : '');

/**
 * Step 2 of checkout, after the buyer approved in the PayPal window.
 * Everything is validated BEFORE any money moves; then we capture, then email.
 */
export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, message: 'That upload was not readable. Your payment was not taken.' });
  }

  const orderId = str(form.get('orderID'));
  if (!isOrderId(orderId)) return json(400, { ok: false, message: 'Missing PayPal order. Your payment was not taken.' });

  // 1. Validate the whole submission.
  const choice = parseChoice({
    shot: str(form.get('shot')),
    style: str(form.get('style')),
    bg: str(form.get('bg')),
    addOns: form.getAll('addOns').map(str),
  });
  if (!choice.ok) return json(400, { ok: false, errors: choice.errors, message: 'Please check your selection. Your payment was not taken.' });

  const { errors, email, details } = validateDetails({ email: form.get('email'), details: form.get('details') });
  if (Object.keys(errors).length) return json(400, { ok: false, errors, message: 'Please fix the highlighted fields. Your payment was not taken.' });

  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  const fileError = checkFiles(files);
  if (fileError) return json(400, { ok: false, errors: { files: fileError }, message: `${fileError} Your payment was not taken.` });

  const attachments: { filename: string; content: Buffer }[] = [];
  for (const [i, file] of files.entries()) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind) {
      return json(400, { ok: false, errors: { files: 'One of those files is not a real image.' }, message: 'One of those files is not a real image. Your payment was not taken.' });
    }
    // Never trust the uploaded name: keep a safe version of it and the detected extension.
    const base = file.name.replace(/\.[^.]*$/, '').replace(/[^\w.-]+/g, '_').slice(0, 60) || `reference-${i + 1}`;
    attachments.push({ filename: `${base}.${kind}`, content: Buffer.from(bytes) });
  }

  // 2. Check the PayPal order is the one we created for exactly this selection.
  try {
    const order = await getOrder(orderId);
    const unit = order.purchase_units?.[0];
    if (order.status === 'COMPLETED') return json(409, { ok: false, message: 'That order was already submitted.' });
    if (order.status !== 'APPROVED') return json(400, { ok: false, message: 'That PayPal order was not approved. Your payment was not taken.' });
    if (unit?.custom_id !== choice.key || unit?.amount?.currency_code !== CURRENCY || Number(unit?.amount?.value) !== choice.resolved.total) {
      return json(400, { ok: false, message: 'Your selection changed after checkout started. Your payment was not taken. Please try again.' });
    }

    // 3. Take the money.
    const captured = await captureOrder(orderId);
    const capture = captured.purchase_units?.[0]?.payments?.captures?.[0];
    if (captured.status !== 'COMPLETED' || !capture || capture.status !== 'COMPLETED') {
      return json(402, { ok: false, message: 'PayPal did not complete the payment. Please try again.' });
    }

    // 4. Tell both of us. Failing here must not lose the sale: report it and show the order id.
    const info = {
      orderId,
      captureId: capture.id,
      paymentStatus: capture.status,
      total: choice.resolved.total,
      lines: choice.resolved.lines,
      email,
      details,
      payerEmail: captured.payer?.email_address ?? order.payer?.email_address,
      files: attachments.map((a) => a.filename),
      warning:
        Number(capture.amount.value) !== choice.resolved.total
          ? `PayPal captured ${capture.amount.value} ${capture.amount.currency_code}, expected ${choice.resolved.total} ${CURRENCY}.`
          : undefined,
    };
    const adminMail = commissionAdminEmail(info);
    const adminSent = await sendMail({ to: recipients(), ...adminMail, replyTo: email, attachments });
    const customerMail = commissionCustomerEmail(info);
    const customerSent = await sendMail({ to: email, ...customerMail, replyTo: recipients()[0] });

    return json(200, { ok: true, orderId, emailed: adminSent, confirmationSent: customerSent });
  } catch (e) {
    console.error('PayPal capture failed:', e);
    if (e instanceof PayPalError && e.issue === 'INSTRUMENT_DECLINED') {
      return json(402, { ok: false, message: 'PayPal could not take that payment method. Please choose another and try again.' });
    }
    return json(502, { ok: false, message: 'Something went wrong with PayPal. If you were charged, please email contact@kokoneko.art with your order details.' });
  }
};
