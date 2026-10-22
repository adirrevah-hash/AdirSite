# ARStudio

The ARStudio website: a studio for websites, landing pages, logos and business cards.
Hebrew, right to left, built with Next.js 16, React 19 and Tailwind 4, with
scroll motion from the scroll-craft engine.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Checks:

```bash
npm test             # unit tests for the contact form rules
npm run typecheck
npm run qa           # end-to-end checks against a running server (BASE_URL, default :3000)
```

## Where things live

| What | Where |
|---|---|
| Every business fact: phone, Instagram, services, process, portfolio | `lib/site.ts` |
| Contact form rules (shared by browser and server) | `lib/contact.ts` |
| Contact API: validation, honeypot, rate limit, delivery | `app/api/contact/route.ts` |
| Sections | `components/` |
| Design tokens, type system, all styling | `app/globals.css` |
| Scroll engine (vendored, not edited) | `public/scrollcraft.js`, `app/scrollcraft.css` |

## Before going live

1. **Contact form delivery.** Copy `.env.example` to `.env.local` (or set the
   variables in your host) and configure email through Resend, or a webhook
   (Make, Zapier, n8n, a CRM). Until one is set, the form still validates and
   then hands the visitor over to WhatsApp with their details already written.
2. **Site URL.** Set `NEXT_PUBLIC_SITE_URL` so canonical links, Open Graph and
   the sitemap use the real domain.
3. **Business email.** Add it to `site.email` in `lib/site.ts`; it then appears in the footer.

## Adding portfolio projects

Projects are listed in `lib/site.ts` and stay hidden until confirmed. For each one:

1. Capture screenshots: `npm run capture:work <id>` (saves to `public/work/`).
2. Fill in `scope` (exactly what the studio did, e.g. "עיצוב ובניית אתר"),
   `field` (what the client does) and `image`, then set `verified: true`.

The "עבודות" section and its menu link appear automatically once at least one project is confirmed.

## Deploying

Any Node host works. Vercel is the simplest: import the repository, add the
environment variables above, deploy. The contact API needs a server runtime,
so a purely static export is not supported.
