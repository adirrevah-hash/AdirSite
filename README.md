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

The contact form needs no configuration: a valid submission opens WhatsApp to the
studio's number (`lib/site.ts`) with everything the visitor filled in already written;
the visitor sends it from WhatsApp.

## Content

- Studio details, services, process and projects: `lib/site.ts`.
- Project screenshots: `public/work/<id>-desktop.jpg` and `<id>-mobile.jpg`.
  `npm run capture:work` captures them from the live sites (needs network access to them).
  Until a screenshot exists the project shows a marked placeholder.

## Structure

- `app/` – layout, page, styles (`globals.css` tokens and type, `sections.css` sections, `motion.css`).
- `components/` – one server component per section; static markup.
- `lib/motion/` – all interactivity (GSAP/ScrollTrigger, the three.js hero), loaded once by `ClientInit`.
- `scripts/` – screenshot capture and the browser QA suite.
