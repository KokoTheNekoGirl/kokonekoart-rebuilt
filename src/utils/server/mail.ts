import { FORM_RECIPIENTS, MAIL_FROM, RESEND_API } from 'astro:env/server';
import { Resend } from 'resend';

export const recipients = () =>
  FORM_RECIPIENTS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

interface Mail {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}

/** Returns true when Resend accepted the message. */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!RESEND_API) return false;
  try {
    const { error } = await new Resend(RESEND_API).emails.send({
      from: MAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
      attachments: mail.attachments,
    });
    if (error) console.error('Resend rejected the email:', error);
    return !error;
  } catch (e) {
    console.error('Resend request failed:', e);
    return false;
  }
}

const wrap = (body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#23182d;max-width:560px">${body}</div>`;

/** Label/value rows. Values are escaped here, so callers pass plain text. */
export const rows = (items: [string, string][]) =>
  `<table style="border-collapse:collapse;width:100%">${items
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:bold;white-space:nowrap">${escapeHtml(k)}</td>` +
        `<td style="padding:6px 0;vertical-align:top;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table>`;

export const plainRows = (items: [string, string][]) => items.map(([k, v]) => `${k}: ${v}`).join('\n');

export { wrap };
