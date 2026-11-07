// Browser-side helpers shared by the contact and commission forms.

declare global {
  interface Window {
    grecaptcha?: {
      ready(cb: () => void): void;
      execute(siteKey: string, opts: { action: string }): Promise<string>;
    };
  }
}

const loaded = new Map<string, Promise<void>>();

/** Loads a script once. Resolves when it has run. */
export function loadScript(src: string): Promise<void> {
  const existing = loaded.get(src);
  if (existing) return existing;
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      loaded.delete(src);
      reject(new Error(`Could not load ${src}`));
    };
    document.head.append(el);
  });
  loaded.set(src, p);
  return p;
}

/** reCAPTCHA v3: loads Google's script on first use and returns a fresh token for `action`. */
export async function recaptchaToken(siteKey: string | undefined, action: string): Promise<string> {
  if (!siteKey) throw new Error('reCAPTCHA is not configured.');
  await loadScript(`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`);
  const g = window.grecaptcha;
  if (!g) throw new Error('reCAPTCHA did not load.');
  await new Promise<void>((r) => g.ready(r));
  return g.execute(siteKey, { action });
}

/** Warms reCAPTCHA up the first time someone touches a form, so submit isn't waiting on Google. */
export function preloadOnFirstUse(form: HTMLElement, siteKey: string | undefined) {
  if (!siteKey) return;
  const go = () => {
    loadScript(`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`).catch(() => {});
  };
  form.addEventListener('focusin', go, { once: true });
  form.addEventListener('pointerdown', go, { once: true });
}

export interface Fields {
  /** Wrapper (.form-field) of each control, keyed by the control's name. */
  [name: string]: HTMLElement | undefined;
}

/** Shows an error under a field and wires it to the control for screen readers. */
export function showError(wrapper: HTMLElement | null | undefined, message: string) {
  if (!wrapper) return;
  const control = wrapper.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea');
  const out = wrapper.querySelector<HTMLElement>('.form-error');
  if (!out) return;
  out.textContent = message;
  out.hidden = false;
  if (control) {
    control.setAttribute('aria-invalid', 'true');
    const ids = new Set((control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
    ids.add(out.id);
    control.setAttribute('aria-describedby', [...ids].join(' '));
  }
  wrapper.classList.add('has-error');
}

export function clearErrors(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.form-error').forEach((out) => {
    out.textContent = '';
    out.hidden = true;
  });
  root.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
  root.querySelectorAll<HTMLElement>('.has-error').forEach((w) => w.classList.remove('has-error'));
}

/** Moves focus to the first field with an error. */
export function focusFirstError(root: HTMLElement) {
  root.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}

/** Live-region message (role="status"). Pass `error` to style it as a problem. */
export function setStatus(el: HTMLElement | null, message: string, error = false) {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('is-error', error);
  el.hidden = !message;
}

/** Character counter, e.g. "12 / 200". */
export function bindCounter(input: HTMLInputElement | HTMLTextAreaElement, out: HTMLElement, max: number) {
  const update = () => {
    out.textContent = `${input.value.length} / ${max}`;
    out.classList.toggle('over', input.value.length > max);
  };
  input.addEventListener('input', update);
  update();
}
