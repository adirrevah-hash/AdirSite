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

## Portfolio

Projects are listed in `lib/site.ts`. Each one shows on a laptop and a phone.

1. Capture screenshots: `npm run capture:work` (or `npm run capture:work <id>`).
   Desktop is captured full-page and scrolls inside the laptop; mobile is one screen.
2. Rebuild. The page finds `public/work/<id>-desktop.jpg` and `<id>-mobile.jpg` by name.
   Until they exist, each screen shows the project's name.
3. Optional: fill in `field` (what the client does) and `scope` (what the studio did).

## Deploying

Any Node host works. Vercel is the simplest: import the repository, add the
environment variables above, deploy. The contact API needs a server runtime,
so a purely static export is not supported.
