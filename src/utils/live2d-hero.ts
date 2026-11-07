// Koko's Live2D model on the home page.
//
// Cost control: nothing here is downloaded until the page has loaded and gone idle, and never for
// people who have reduced motion on, are saving data, or are on a slow connection. They keep the
// still image. The heavy code (PixiJS + the Live2D engine) is a separate chunk loaded on demand.
//
// The model has no motion files, so the life comes from code: it looks at the pointer, blinks,
// breathes and sways a little, and smiles when poked.
import { track } from './track';

const CORE_URL = '/live2d/live2dcubismcore.min.js';
const MODEL_URL = '/live2d/puppet-full/puppet-full.model3.json';

const html = document.documentElement;
const reducedMotion = () => html.classList.contains('reduce-motion');

function shouldSkipLoading(): boolean {
  const c = (navigator as any).connection as { saveData?: boolean; effectiveType?: string } | undefined;
  return !!c && (!!c.saveData || /(^|-)2g$/.test(c.effectiveType ?? ''));
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function loadCore(): Promise<void> {
  if ((window as any).Live2DCubismCore) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CORE_URL;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Live2D core failed to load'));
    document.head.append(s);
  });
}

const whenIdle = (cb: () => void) =>
  'requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 1200);

export function initKokoLive2D(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas');
  if (!canvas || shouldSkipLoading() || !hasWebGL()) return;

  let state: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';
  let onScreen = true;
  let frame = 0;
  let tick: ((now: number) => void) | null = null;

  const shouldRun = () => state === 'ready' && onScreen && !reducedMotion() && document.visibilityState === 'visible';

  function sync() {
    const run = shouldRun();
    root.classList.toggle('is-live', state === 'ready' && !reducedMotion());
    if (run && !frame && tick) frame = requestAnimationFrame(tick);
    if (!run && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  async function start() {
    if (state !== 'idle' || reducedMotion()) return;
    state = 'loading';
    try {
      // Heavy part: only now. The core is Live2D's own file; the engine is a separate chunk.
      const [, PIXI, engine] = await Promise.all([
        loadCore(),
        import('pixi.js'),
        import('untitled-pixi-live2d-engine/cubism'),
      ]);
      await import('pixi.js/unsafe-eval'); // lets the renderer run under a CSP without 'unsafe-eval'
      const { Application, extensions } = PIXI;
      const { Live2DModel, Live2DPlugin } = engine;
      extensions.add(Live2DPlugin);

      const size = () => Math.max(1, Math.round(root.clientWidth));
      const app = new Application();
      await app.init({
        canvas,
        width: size(),
        height: size(),
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        preference: 'webgl',
        autoStart: false, // we drive the loop ourselves so we can pause it
        sharedTicker: false,
      });

      const model = await Live2DModel.from(MODEL_URL, { autoUpdate: false, autoFocus: false, autoHitTest: false } as any);
      app.stage.addChild(model);

      // Core 6 moved render orders onto the model; the engine's framework still asks the drawables.
      // Hand it dense 0..n-1 draw ranks so the art stacks correctly.
      const core: any = (model.internalModel as any).coreModel;
      const raw = core._model;
      if (!raw.drawables?.renderOrders && raw.renderOrders) {
        const n: number = raw.drawables.count;
        const ranks = new Int32Array(n);
        const order = Array.from({ length: n }, (_, i) => i);
        core.getDrawableRenderOrders = () => {
          order.sort((a, b) => raw.renderOrders[a] - raw.renderOrders[b]);
          order.forEach((drawable, rank) => (ranks[drawable] = rank));
          return ranks;
        };
      }

      const base = model.internalModel as any;
      const modelW = base.width as number;
      const modelH = base.height as number;

      function layout() {
        const w = size();
        app.renderer.resize(w, w);
        const s = Math.min(w / modelW, w / modelH);
        model.scale.set(s);
        model.x = (w - modelW * s) / 2;
        model.y = (w - modelH * s) / 2;
      }
      layout();
      new ResizeObserver(() => {
        layout();
        if (!frame) app.renderer.render(app.stage);
      }).observe(root);

      // --- life ---------------------------------------------------------------------------
      // Where she looks, -1..1 on each axis. She follows any pointer (mouse, pen or a finger dragging)
      // relative to where her head sits on the page, and looks around on her own whenever nothing
      // has moved for a few seconds (which is all the time on a phone).
      let ptrX = 0;
      let ptrY = 0;
      let ptrAt = -Infinity; // last time a pointer moved over the page
      let ptrInside = false;
      let gx = 0; // smoothed gaze
      let gy = 0;
      let pokeAt = -Infinity;
      let nextFidget = performance.now() + 2500; // quick head tilt now and then, which also swings the hair
      let fidgetAt = -Infinity;
      let fidgetDir = 1;
      let nextBlink = performance.now() + 900;
      let blinkStart = -Infinity;
      const clamp = (v: number, a = -1, b = 1) => Math.max(a, Math.min(b, v));

      addEventListener(
        'pointermove',
        (e) => {
          const r = canvas.getBoundingClientRect();
          const cx = r.left + r.width / 2; // her head is roughly top-centre of the canvas
          const cy = r.top + r.height * 0.3;
          const reach = Math.max(220, r.width * 0.7); // how far away counts as "fully turned"
          ptrX = clamp((e.clientX - cx) / reach);
          ptrY = clamp((cy - e.clientY) / reach);
          ptrAt = performance.now();
          ptrInside = true;
        },
        { passive: true },
      );
      document.documentElement.addEventListener('pointerleave', () => (ptrInside = false));
      canvas.addEventListener('pointerdown', () => {
        if (performance.now() - pokeAt > 1800) track('koko-poke');
        pokeAt = performance.now();
      });

      // Slow, never-repeating looking around (sums of unrelated sine waves)
      const wander = (t: number) => ({
        x: Math.sin(t * 0.55) * 0.55 + Math.sin(t * 1.13 + 1.3) * 0.3,
        y: Math.sin(t * 0.41 + 0.8) * 0.3 + Math.sin(t * 0.97) * 0.12,
      });

      // Hair is driven by the rig's own physics file (puppet-full.physics3.json). The player would
      // run it before our head angles are set (and then reset them), so it never sees the head move.
      // Take it over and evaluate it ourselves, right after the angles are written.
      const physics: any = base.physics;
      base.physics = undefined;
      let physDt = 1 / 60;
      const HAIR_IDS = ['ParamHairFront', 'ParamHairSide', 'ParamHairBack'];
      const HAIR_GAIN = 8;
      const params = core._model.parameters;
      const values: Float32Array = params.values;
      const hairIdx = HAIR_IDS.map((id) => params.ids.indexOf(id)).filter((i) => i >= 0);

      const set = (id: string, v: number) => core.setParameterValueById(id, v);
      const BLINK_MS = 300;

      base.on('beforeModelUpdate', () => {
        const now = performance.now();
        const t = now / 1000;

        if (now >= nextFidget) {
          fidgetAt = now;
          fidgetDir = Math.random() < 0.5 ? -1 : 1;
          nextFidget = now + 4000 + Math.random() * 5000;
        }
        const f = (now - fidgetAt) / 700;
        const fidget = f >= 0 && f <= 1 ? Math.sin(f * Math.PI) * Math.sin(f * Math.PI * 1.5 + 0.3) : 0;

        // Head angles are small in this rig (X/Y ±10, Z ±30, body ±30), so scale to those.
        set('ParamAngleX', clamp(gx * 10 + fidget * fidgetDir * 4, -10, 10));
        set('ParamAngleY', gy * 10);
        set('ParamAngleZ', gx * -16 + Math.sin(t * 0.9) * 4 + fidget * fidgetDir * 18);
        set('ParamBodyAngleX', gx * 14 + Math.sin(t * 0.5) * 2);
        set('ParamBodyAngleY', gy * 8);
        set('ParamEyeBallX', clamp(gx * 1.3));
        set('ParamEyeBallY', clamp(gy * 1.3));

        physics?.evaluate(core, physDt);
        // The physics output is gentle at web-page head speeds, so give it more swing
        for (const i of hairIdx) values[i] = clamp(values[i] * HAIR_GAIN);

        // Breathing
        set('ParamBreath', (Math.sin(t * 1.9) + 1) / 2);

        // Blinking, every few seconds
        if (now >= nextBlink) {
          blinkStart = now;
          // every 2-5 s, and now and then a quick double blink
          nextBlink = now + (Math.random() < 0.2 ? BLINK_MS + 120 : 2000 + Math.random() * 3000);
        }
        const b = (now - blinkStart) / BLINK_MS;
        // Close fast (first 35%), hold a beat, then open a little slower
        const open = b < 0 || b > 1 ? 1 : b < 0.35 ? 1 - b / 0.35 : Math.min(1, (b - 0.45) / 0.55);
        set('ParamEyeLOpen', open);
        set('ParamEyeROpen', open);

        // A poke makes her smile, easing in and out
        const p = (now - pokeAt) / 1400;
        const smile = p >= 0 && p <= 1 ? Math.sin(p * Math.PI) : 0;
        if (smile > 0) {
          set('ParamEyeLSmile', smile);
          set('ParamEyeRSmile', smile);
          set('ParamMouthForm', smile);
          set('ParamCheek', smile);
        }
      });

      let last = performance.now();
      tick = (now: number) => {
        frame = 0;
        const dt = Math.min(now - last, 100);
        last = now;
        // Follow the cursor while it is active on the page, otherwise look around by herself
        const following = ptrInside && now - ptrAt < 3500;
        const w = wander(now / 1000);
        const goalX = following ? ptrX : w.x;
        const goalY = following ? ptrY : w.y;
        physDt = Math.min(dt / 1000, 0.05);
        const ease = Math.min(1, dt * (following ? 0.012 : 0.004));
        gx += (goalX - gx) * ease;
        gy += (goalY - gy) * ease;
        model.update(dt);
        app.renderer.render(app.stage);
        if (shouldRun()) frame = requestAnimationFrame(tick!);
      };

      state = 'ready';
      last = performance.now();
      sync();
    } catch {
      state = 'failed'; // quietly keep the still image
      root.classList.remove('is-live');
    }
  }

  // Pause when scrolled away or the tab is hidden; honour the site's reduced-motion toggle.
  new IntersectionObserver(
    ([e]) => {
      onScreen = e.isIntersecting;
      sync();
    },
    { threshold: 0.01 },
  ).observe(root);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('reducemotion:change', () => {
    if (reducedMotion()) sync();
    else if (state === 'idle') start();
    else sync();
  });

  const begin = () => whenIdle(start);
  if (document.readyState === 'complete') begin();
  else addEventListener('load', begin, { once: true });
}
