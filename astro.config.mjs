// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
    adapter: vercel(),
    site: 'https://kokoneko.art',
    trailingSlash: 'never',
    integrations: [mdx(), sitemap()
    ],
    fonts: [
        {
            provider: fontProviders.local(),
            name: 'Spinnaker',
            cssVariable: '--font-spinnaker',
            fallbacks: ['sans-serif'],
            options: {
                variants: [
                    {
                        src: ['./src/assets/fonts/Spinnaker-Regular.woff2'],
                        weight: 400,
                        style: 'normal',
                        display: 'swap',
                    },
                ],
            },
        },
        {
            provider: fontProviders.local(),
            name: 'Fuzzy Bubbles',
            cssVariable: '--font-fuzzy-bubbles',
            fallbacks: ['cursive'],
            options: {
                variants: [
                    {
                        src: ['./src/assets/fonts/FuzzyBubbles-Regular.woff2'],
                        weight: 400,
                        style: 'normal',
                        display: 'swap',
                    },
                                        {
                        src: ['./src/assets/fonts/FuzzyBubbles-Bold.woff2'],
                        weight: 700,
                        style: 'normal',
                        display: 'swap',
                    },
                ],
            },
        },
        {
            provider: fontProviders.local(),
            name: 'Starborn',
            cssVariable: '--font-starborn',
            fallbacks: ['cursive'],
            options: {
                variants: [
                    {
                        src: ['./src/assets/fonts/Starborn.woff2'],
                        weight: 400,
                        style: 'normal',
                        display: 'swap',
                    },
                ],
            },
        },
    ],
    env: { schema: {
        PUBLIC_RECAPTCHA_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
        PUBLIC_PAYPAL_CLIENT_ID:   envField.string({ context: 'client', access: 'public', optional: true }),
        RECAPTCHA_SECRET_KEY:      envField.string({ context: 'server', access: 'secret', optional: true }),
        PAYPAL_CLIENT_SECRET:      envField.string({ context: 'server', access: 'secret', optional: true }),
        RESEND_API:                envField.string({ context: 'server', access: 'secret', optional: true }),
        PAYPAL_ENV:      envField.enum({ context: 'server', access: 'public', values: ['sandbox', 'live'], default: 'sandbox' }),
        MAIL_FROM:       envField.string({ context: 'server', access: 'public' }),
        FORM_RECIPIENTS: envField.string({ context: 'server', access: 'public' }),
        RECAPTCHA_VERIFY_URL: envField.string({ context: 'server', access: 'public', optional: true }),
        PAYPAL_API_BASE:      envField.string({ context: 'server', access: 'public', optional: true }),
      } },
});