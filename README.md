# ARStudio

The ARStudio studio site: Hebrew, RTL, Next.js (App Router).

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Checks:

```bash
npm run typecheck
npm test             # contact form validation
BASE_URL=http://localhost:3100 QA_OUT=lab/qa npm run qa   # browser suite, against a running build
```

## Configuration

Copy `.env.example` to `.env.local` (or set the same variables in the host):

- `NEXT_PUBLIC_SITE_URL` – the public domain, used for canonical links, Open Graph and the sitemap.
- Form delivery, one of:
  - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` – email through Resend.
  - `CONTACT_WEBHOOK_URL` – the lead is POSTed as JSON (Make, Zapier, n8n, a CRM).

With neither set, the form does not pretend to send: the API answers `503 not_configured`
and the visitor is handed over to WhatsApp with their details already written.

## Content

- Studio details, services, process and projects: `lib/site.ts`.
- Project screenshots: `public/work/<id>-desktop.jpg` and `<id>-mobile.jpg`.
  `npm run capture:work` captures them from the live sites (needs network access to them).
  Until a screenshot exists the project shows a marked placeholder.

## Structure

- `app/` – layout, page, styles (`globals.css` tokens and type, `sections.css` sections), API route `app/api/contact`.
- `components/` – one server component per section; static markup.
- `lib/motion/` – all interactivity (GSAP/ScrollTrigger, the three.js hero), loaded once by `ClientInit`.
- `scripts/` – screenshot capture and the browser QA suite.
