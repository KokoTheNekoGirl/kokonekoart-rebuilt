import {
  ADD_ONS,
  BACKGROUNDS,
  CURRENCY,
  DEFAULT_SELECTION,
  REF_SHEET,
  SHOTS,
  STYLES,
  resolve,
  type AddOnId,
  type BgId,
  type ShotId,
  type StyleId,
} from '@data/commissions';
import { isEmail, multiLine, oneLine, type FieldErrors } from './validation';

export const REQUEST_LIMITS = {
  details: 1000,
  email: 254,
  files: 5,
  /** Vercel functions reject request bodies over 4.5 MB, so stay under that. */
  totalBytes: 4_000_000,
} as const;

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;

/** Add-ons offered as checkboxes. Ref Sheet is chosen from the Character Shot list instead. */
export const FORM_ADD_ONS = ADD_ONS.filter((a) => a.id !== REF_SHEET);

/** What the form sends: `shot` may be 'ref', `style` is ignored for a Ref Sheet. */
export interface RawChoice {
  shot?: unknown;
  style?: unknown;
  bg?: unknown;
  addOns?: unknown;
}

const has = (list: readonly { id: string }[], v: unknown) => list.some((o) => o.id === v);

export function parseChoice(raw: RawChoice) {
  const errors: FieldErrors = {};
  const isRef = raw.shot === REF_SHEET;

  if (!isRef && !has(SHOTS, raw.shot)) errors.shot = 'A character shot is required.';
  if (!isRef && !has(STYLES, raw.style)) errors.style = 'An art finish is required.';
  if (!has(BACKGROUNDS, raw.bg)) errors.bg = 'A background is required.';

  const addOnList = Array.isArray(raw.addOns) ? raw.addOns : [];
  const addOns = FORM_ADD_ONS.map((a) => a.id).filter((id) => addOnList.includes(id)) as AddOnId[];
  if (addOnList.some((id) => !has(FORM_ADD_ONS, id))) errors.addOns = 'Unknown add-on.';

  if (Object.keys(errors).length) return { ok: false as const, errors };

  const resolved = resolve({
    shot: isRef ? DEFAULT_SELECTION.shot : (raw.shot as ShotId),
    style: isRef ? DEFAULT_SELECTION.style : (raw.style as StyleId),
    bg: raw.bg as BgId,
    addOns: isRef ? [REF_SHEET, ...addOns] : addOns,
  });

  // resolve() quietly fixes an impossible pick; the form should refuse it instead.
  if (resolved.selection.bg !== raw.bg) {
    return { ok: false as const, errors: { bg: 'That background needs a Flatcolor or Shaded finish (or a Ref Sheet).' } };
  }
  return { ok: true as const, resolved, key: selectionKey(resolved.selection, isRef) };
}

/** Short, stable description stored on the PayPal order and checked again at capture. */
export function selectionKey(s: { shot: string; style: string; bg: string; addOns: string[] }, isRef: boolean) {
  const extras = s.addOns.filter((id) => id !== REF_SHEET).join('+') || '-';
  return `${isRef ? REF_SHEET : s.shot}.${isRef ? '-' : s.style}.${s.bg}.${extras}`;
}

export function validateDetails(raw: { email?: unknown; details?: unknown }) {
  const errors: FieldErrors = {};
  const email = oneLine(raw.email);
  const details = multiLine(raw.details);
  if (!email) errors.email = 'I need to contact you for art updates and submission.';
  else if (!isEmail(email, REQUEST_LIMITS.email)) errors.email = 'Please enter a valid email address.';
  if (details.length > REQUEST_LIMITS.details) errors.details = `Keep the details under ${REQUEST_LIMITS.details} characters.`;
  return { errors, email, details };
}

/** File checks both sides can run on name/size/type. The server also checks the real bytes. */
export function checkFiles(files: { name: string; size: number; type: string }[]): string | null {
  if (!files.length) return 'I need a reference to draw from!';
  if (files.length > REQUEST_LIMITS.files) return `Please upload ${REQUEST_LIMITS.files} images or fewer.`;
  if (files.some((f) => !(IMAGE_TYPES as readonly string[]).includes(f.type)))
    return 'Reference files must be PNG, JPG, WebP or GIF images.';
  if (files.reduce((n, f) => n + f.size, 0) > REQUEST_LIMITS.totalBytes)
    return `Your images are over ${REQUEST_LIMITS.totalBytes / 1_000_000} MB in total.`;
  return null;
}

/** File type from the first bytes, so a renamed .exe can't pass as a .png. */
export function sniffImage(b: Uint8Array): 'png' | 'jpg' | 'gif' | 'webp' | null {
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif';
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return 'webp';
  return null;
}

export const money = (n: number) => `$${n.toFixed(2)} ${CURRENCY}`;
