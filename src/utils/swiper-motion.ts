import type Swiper from 'swiper';

/**
 * Stops a Swiper's autoplay while reduced motion is on (OS setting or the site's toggle)
 * and starts it again when it is switched off. Needs the Autoplay module.
 */
export function respectReducedMotion(swiper: Swiper) {
  const sync = (reduced: boolean) => (reduced ? swiper.autoplay.stop() : swiper.autoplay.start());
  sync(document.documentElement.classList.contains('reduce-motion'));
  document.addEventListener('reducemotion:change', (e) =>
    sync((e as CustomEvent<{ enabled: boolean }>).detail.enabled),
  );
}
