// Builds src/assets/fontawesome/css/all.subset.css from the full Font Awesome
// stylesheet, keeping only the icon classes the site actually references.
// Run after adding or removing an icon:  npm run fa:subset
import { PurgeCSS } from 'purgecss';
import { writeFile, stat } from 'node:fs/promises';

const SRC = 'src/assets/fontawesome/css/all.min.css';
const OUT = 'src/assets/fontawesome/css/all.subset.css';

const [result] = await new PurgeCSS().purge({
  // Everything that can contain an icon name, including data files and SCSS
  // (some icons are injected with a ::before content code point).
  content: ['src/**/*.{astro,ts,js,md,mdx,scss,json}'],
  css: [SRC],
  fontFace: false,  // handled below: FA picks its family through a CSS variable, which PurgeCSS can't follow
  variables: true,  // drop unused --fa-* custom properties
  keyframes: true,
  safelist: {
    standard: [/^fa$/, /^fa-(solid|brands|classic|fw|spin|beat|bounce|fade|flip|pulse|shake|spin-pulse)$/, /^fa-(xs|sm|lg|xl|2xl|1x|2x|3x|4x|5x)$/, /^fa-(rotate|flip)-/, /^fa-(sr-only|stack)/],
  },
  // Keep the :root/:host variable blocks and the shared base rule.
  defaultExtractor: (c) => c.match(/[A-Za-z0-9_-]+/g) || [],
});

// Keep only the @font-face rules for the families the icons really use
// (7 Brands, and 7 Free regular/solid). Browsers only download a font file
// when a glyph from it is drawn, so this just trims dead bytes.
const KEEP = /font-family:"Font Awesome 7 (Brands|Free)";font-style:normal;font-weight:(400|900)/;
const css = result.css.replace(/@font-face\{[^}]*\}/g, (m) => (KEEP.test(m) ? m : ''));

await writeFile(OUT, css);
const kb = async (f) => ((await stat(f)).size / 1024).toFixed(1);
console.log(`Font Awesome: ${await kb(SRC)} KB -> ${await kb(OUT)} KB (${OUT})`);
