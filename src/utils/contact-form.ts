import { CONTACT_LIMITS, CONTACT_PLATFORMS, EMAIL_PLATFORM, type PlatformId } from '@data/contact';
import { isEmail, multiLine, oneLine, type FieldErrors } from './validation';

export interface ContactValues {
  platform: PlatformId;
  name: string;
  /** Empty when the platform is Email. */
  username: string;
  /** Only set when the platform is Email. */
  email: string;
  subject: string;
  message: string;
}

export type ContactResult = { ok: true; values: ContactValues } | { ok: false; errors: FieldErrors };

export function validateContact(raw: Record<string, unknown>): ContactResult {
  const errors: FieldErrors = {};
  const platform = CONTACT_PLATFORMS.find((p) => p.id === raw.platform)?.id;
  const name = oneLine(raw.name);
  const username = oneLine(raw.username);
  const email = oneLine(raw.email);
  const subject = oneLine(raw.subject);
  const message = multiLine(raw.message);

  if (!platform) errors.platform = 'You must select a platform for me to reach you on.';
  if (!name) errors.name = 'I need your name.';
  else if (name.length > CONTACT_LIMITS.name) errors.name = `Keep your name under ${CONTACT_LIMITS.name} characters.`;

  if (platform === EMAIL_PLATFORM) {
    if (!email) errors.email = 'I need your email address to reach you.';
    else if (!isEmail(email, CONTACT_LIMITS.email)) errors.email = 'Please enter a valid email address.';
  } else if (platform) {
    if (!username) errors.username = 'I need your username to reach you by.';
    else if (username.length > CONTACT_LIMITS.username)
      errors.username = `Keep your username under ${CONTACT_LIMITS.username} characters.`;
  }

  if (subject.length > CONTACT_LIMITS.subject) errors.subject = `Keep the subject under ${CONTACT_LIMITS.subject} characters.`;
  if (!message) errors.message = 'Please write a message.';
  else if (message.length > CONTACT_LIMITS.message)
    errors.message = `Keep your message under ${CONTACT_LIMITS.message} characters.`;

  if (Object.keys(errors).length || !platform) return { ok: false, errors };

  const isEmailPlatform = platform === EMAIL_PLATFORM;
  return {
    ok: true,
    values: {
      platform,
      name,
      username: isEmailPlatform ? '' : username,
      email: isEmailPlatform ? email : '',
      subject,
      message,
    },
  };
}
