# KokoNekoArt

A hand-built portfolio and commission site for digital artist and web developer Jess (KokoNekoArt). It replaces a WordPress theme with a fast, fully static Astro site: portfolio archive, slide-style project pages, a live commission price calculator, and contact and commission forms with PayPal checkout.

**Live site:** https://kokoneko.art
**Preview:** https://kokonekoart-rebuilt.vercel.app 

## Features

- **Portfolio archive and project pages.** Pieces are Markdown files in a content collection. The archive sorts by completion date and filters by category. Each piece opens as a Swiper presentation: title slide, custom slides, Final Result.
- **Commission calculator.** Prices live in one data file that both the calculator and the request form read, so they can never disagree.
- **Commission request form.** Plain HTML form. The server recalculates the total from the selected options (never trusting the browser), takes the PayPal payment, then emails the request with attached reference images.
- **Contact form.** reCAPTCHA v3, honeypot field, and HTML-escaped email notifications through Resend.
- **Terms of Service accordion** written in MDX.
- **Animated home page** with Swiper sections, star background, and a respect for reduced-motion settings.
- **Accessible by default.** Skip link, reduced-motion toggle, keyboard-operable custom checkboxes, and accessible-astro-components for the skip link and motion toggle.
- **Performance work.** Modular SCSS with dead rules removed, a trimmed Font Awesome stylesheet, animate.css reduced to the two animations in use, and self-hosted fonts via the Astro Fonts API.
- **Privacy considerate.** Anonymous, cookieless analytics through Umami instead of Google Analytics, so I have more control over and transparency about what I track.
- **SEO.** Sitemap, RSS feed, canonical URLs and Open Graph metadata. A privacy policy is at `/privacy`.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Astro 7 (static output, server routes for the forms) |
| Hosting | Vercel (`@astrojs/vercel`), clean URLs, no trailing slashes |
| Content | Astro content collections, Markdown and MDX |
| Styling | Modular SCSS partials, CSS custom properties |
| Analytics | Umami (cookieless, anonymous)
| Carousels | Swiper |
| Fonts and icons | Astro Fonts API (local provider), Font Awesome |
| Forms | Vercel serverless API routes, Google reCAPTCHA v3, Resend, PayPal REST API |
| Images | Astro `<Image>` with Sharp |
| Language | TypeScript |

## Requirements

- Node.js 22.23.4 or newer
- npm
- Accounts and keys (only needed to test the forms): Google reCAPTCHA v3, PayPal developer app, Resend

## Local deployment

```bash
git clone https://github.com/KokoTheNekoGirl/kokonekoart-rebuilt.git
cd kokonekoart-rebuilt
npm install
cp .env.example .env     # then fill in the values below
npm run dev
```

The site runs at http://localhost:4321.

### Environment variables

Set these in `.env` locally and under Project Settings, Environment Variables in Vercel. `PUBLIC_` values are baked in at build time, so redeploy after changing them.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key (public by design) |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret key |
| `PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID (public by design) |
| `PAYPAL_CLIENT_SECRET` | PayPal secret |
| `PAYPAL_ENV` | `sandbox` or `live`. Sandbox and live use different client IDs and secrets, so they must match |
| `RESEND_API` | Resend API key |
| `MAIL_FROM` | Sender, e.g. `Name <hello@example.com>` |
| `FORM_RECIPIENTS` | Comma-separated addresses that receive form submissions |

Never commit `.env`.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build to `.vercel/output` |
| `npm run preview` | Preview the production build |
| `npm run fa:subset` | Rebuild the trimmed Font Awesome stylesheet after adding or removing an icon |

## Project structure

```text
src/
  assets/       Images, fonts, Font Awesome
  components/   Astro components (cards, presentation, calculator, forms)
  content/      Portfolio entries (Markdown) and legal pages (MDX)
  data/         Prices, social links, about info, categories
  layouts/      Page layout
  pages/        Routes, including api/ for the form endpoints
  styles/       SCSS partials: base, components, layout
  utils/        Validation, form helpers, server-only helpers
scripts/        fa-subset.mjs
vercel.json     Headers (CSP, HSTS) and clean URLs
```

Import aliases (`@assets`, `@components`, `@data/*`, `@layouts`, `@utils/*`, `@consts`) are defined in `tsconfig.json`.

## Security notes

- Prices are computed on the server, and the PayPal order is verified again before capture.
- Uploaded images are checked by file signature and capped at 4 MB in total.
- Secrets are server-side only; only the reCAPTCHA site key and PayPal client ID reach the browser.
- A Content-Security-Policy runs in report-only mode from `vercel.json`.

## Credits and licences

- Site code, design and artwork: Jess (KokoNekoArt). All artwork is copyrighted and not licensed for reuse.
- Fonts: Spinnaker and Fuzzy Bubbles (SIL Open Font Licence). Starborn by Hawtpixel, used under a licence that does not allow redistribution, so the font files are not in this repository.
- Icons: Font Awesome. The Pro files are used under a commercial licence and are not redistributable, so they are not in this repository.
- Libraries: Astro, Swiper, accessible-astro-components, animate.css, Sharp.
- Third-party services: Umami (anonymous analytics), Google reCAPTCHA v3 (spam protection), PayPal (payments), Resend (email delivery), Vercel (hosting).
