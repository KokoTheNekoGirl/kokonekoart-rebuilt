// Small helpers shared by the browser (inline validation) and the API routes (the real check).

export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export const isEmail = (value: string, max = 254): boolean => value.length <= max && EMAIL_RE.test(value);

/** One-line text: trims and collapses anything that could break a header or subject line. */
export const oneLine = (value: unknown): string =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim() : '';

/** Multi-line text: trims, normalises newlines, drops other control characters. */
export const multiLine = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .replace(/\r\n?/g, '\n')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
        .trim()
    : '';
