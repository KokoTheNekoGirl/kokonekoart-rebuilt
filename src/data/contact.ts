// Single source for the contact form: the platform list and the length limits.
// The form markup, the browser validation and the API route all read from here.

export const CONTACT_PLATFORMS = [
  { id: 'discord', label: 'Discord' },
  { id: 'email', label: 'Email' },
  { id: 'bluesky', label: 'Bluesky' },
  { id: 'cara', label: 'Cara' },
  { id: 'instagram', label: 'Instagram' },
] as const;

export type PlatformId = (typeof CONTACT_PLATFORMS)[number]['id'];

/** Choosing this platform shows the Email field instead of Username. */
export const EMAIL_PLATFORM: PlatformId = 'email';

export const CONTACT_LIMITS = {
  name: 80,
  username: 80,
  email: 254,
  subject: 120,
  message: 200,
} as const;
