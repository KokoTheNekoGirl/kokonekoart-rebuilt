// Anonymous analytics (Umami). Everything here is a no-op when Umami isn't loaded
// (dev, preview deploys, Do Not Track, ad blockers), so it is always safe to call.
//
// Rules for what gets sent: event names plus a few short labels (which page, which
// platform, which form, which field NAME). Never anything a visitor typed.

type Data = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track(event: string, data?: Data): void };
  }
}

export function track(event: string, data?: Data) {
  try {
    window.umami?.track(event, data);
  } catch {
    /* analytics must never break the page */
  }
}

export interface FormTracker {
  /** The form went through. */
  success(): void;
  /** Something stopped a real submit: validation, the server, or the network. `fields` are field names only. */
  error(kind: 'validation' | 'server' | 'network', fields?: string[]): void;
  /** reCAPTCHA refused it. Treated as a bot: no error event, and leaving is not counted as abandonment. */
  blocked(): void;
}

/**
 * Form funnel: form-start -> (form-error)* -> form-success, or form-abandon when someone
 * started the form and left without finishing.
 *
 * Bots are left out on purpose: anything that fills the honeypot field, or that reCAPTCHA
 * rejects, is never counted as a start, success or abandonment.
 */
export function trackForm(form: HTMLFormElement, name: string, context?: () => Data): FormTracker {
  let started = false;
  let finished = false;
  let bot = false;
  let reported = false;
  let lastField = '';

  const honeypot = form.elements.namedItem('website') as HTMLInputElement | null;
  const isBot = () => bot || (!!honeypot && honeypot.value !== '');

  const filledCount = () =>
    [...form.elements].filter((el) => {
      const c = el as HTMLInputElement;
      if (!c.name || c === honeypot || c.disabled || c.type === 'hidden' || c.type === 'submit' || c.type === 'button') return false;
      return c.type === 'checkbox' || c.type === 'radio' ? c.checked : c.value !== '';
    }).length;

  const onEdit = (e: Event) => {
    const t = e.target as HTMLInputElement | null;
    if (!t || t === honeypot || !t.name) return;
    lastField = t.name; // a field NAME like "message", never its value
    if (!started && !isBot()) {
      started = true;
      track('form-start', { form: name });
    }
  };
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);

  // Leaving (closing the tab, navigating away, switching apps) after starting but before finishing.
  const leave = () => {
    if (!started || finished || reported || isBot()) return;
    reported = true;
    track('form-abandon', { form: name, last_field: lastField, filled: filledCount(), ...context?.() });
  };
  addEventListener('pagehide', leave);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && leave());

  return {
    success() {
      if (isBot()) return;
      finished = true;
      track('form-success', { form: name });
    },
    error(kind, fields = []) {
      if (isBot()) return;
      track('form-error', { form: name, kind, ...(fields.length ? { fields: fields.join(',') } : {}), ...context?.() });
    },
    blocked() {
      bot = true;
    },
  };
}

const IDLE_MS = 10_000; // a pause longer than this isn't "playing"; it's someone who wandered off

const bucket = (s: number) => (s < 10 ? 'under 10s' : s < 30 ? '10-30s' : s < 60 ? '30-60s' : s < 180 ? '1-3 min' : '3+ min');

/**
 * How long people play with an interactive widget (the commission calculator), without
 * logging every click. Sends ONE `<name>-play` event when the visitor leaves or switches tabs:
 *   seconds  active time (gaps between changes, each capped at 10s, so idling doesn't count)
 *   time     that time as a bucket, easy to read in the dashboard
 *   changes  how many options they changed
 *   left_via which button they used to leave, if any (request form / pay directly / ko-fi)
 * plus whatever `snapshot()` returns (the final selection). Nothing is sent without a change.
 */
export function trackPlay(root: HTMLElement, name: string, snapshot: () => Data) {
  let changes = 0;
  let active = 0;
  let last = 0;
  let leftVia = '';

  root.addEventListener('change', () => {
    const now = Date.now();
    if (last) active += Math.min(now - last, IDLE_MS);
    last = now;
    changes++;
  });

  root.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a');
    if (!a) return;
    leftVia = a.classList.contains('form-link') ? 'request form' : a.classList.contains('paypal-link') ? 'pay directly' : a.classList.contains('kofi-link') ? 'kofi' : '';
  });

  const send = () => {
    if (!changes) return;
    // Count a short tail after the last change (looking at the result), capped like any other gap.
    const seconds = Math.round((active + Math.min(Date.now() - last, IDLE_MS)) / 1000);
    track(`${name}-play`, { seconds, time: bucket(seconds), changes, ...snapshot(), ...(leftVia ? { left_via: leftVia } : {}) });
    changes = active = last = 0;
    leftVia = '';
  };

  addEventListener('pagehide', send);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && send());
}
