# Ryan Lin — personal site

Dark, warm-premium personal website + portfolio. Four static pages, no build step,
no dependencies. Hand-written HTML/CSS/JS — no framework, no Tailwind CDN.

```
index.html      Home — intro, about, experience, education + skills, featured work
work.html       Work — finance & data projects with detail modals + filters
creative.html   Creative — content pillars, gallery preview (lightbox), brand CTA
contact.html    Contact — email, LinkedIn, résumé download + "what I'm open to"
styles.css      Shared design system (dark default + light theme via the toggle)
main.js         Theme toggle, mobile nav, scroll reveals, modals, gallery, filters
assets/         Ryan-Lin-Resume.pdf (the "Download résumé" button) + future images
serve.mjs       Optional local preview server (needs Node.js)
vercel.json     Vercel config — clean URLs + basic security headers
```

## Preview locally

- Easiest: just open `index.html` in a browser (double-click it). Everything visual
  works on `file://` — only the contact form needs a deployed host to submit.
- With Node.js installed: `node serve.mjs` → http://localhost:3000
- With Python installed: `python -m http.server 3000` → http://localhost:3000

## Deploy to Vercel (free)

### Option A — import a GitHub repo (recommended; auto-deploys on every push)
1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com → sign up / log in (free) → **Add New… → Project**.
3. Import the repo. Framework preset: **Other**. Build command: *(leave blank)*.
   Output directory: *(leave blank — it serves the repo root)*. → **Deploy**.
4. You get a live URL like `https://ryan-lin.vercel.app`. Rename it under
   **Project → Settings → Domains** (or add a custom domain there).

### Option B — Vercel CLI (needs Node.js installed)
```
npm i -g vercel       # once
vercel                # in this folder; follow the prompts
vercel --prod         # promote to your production URL
```

> Note: the Vercel CLI / Claude's Vercel integration both need Node.js, which isn't
> installed on this machine — so Option A (GitHub import, no Node needed) is the path
> of least resistance here.

### Contact
No contact form — the Contact page links straight to email and LinkedIn (nothing to
configure). If you ever want a form later, Formspree (https://formspree.io, free tier)
drops in as a plain `<form action="https://formspree.io/f/your-id" method="POST">` with
no backend.

### Custom domain (optional, ~$10–15/yr — not required)
Buy a domain anywhere, then add it under **Vercel → Project → Settings → Domains** and
follow the DNS instructions. The free `*.vercel.app` subdomain is perfectly fine for LinkedIn.

## Things you'll probably want to update

- **Résumé PDF** — replace `assets/Ryan-Lin-Resume.pdf` whenever your resume changes
  (keep the filename, or update the links in the 4 HTML files). You can delete the
  loose `Resume.pdf` in the project root — it's just the original copy.
- **Social link preview image** — the `og:image` meta tags point at a `placehold.co`
  placeholder. Drop a real 1200×630 image in `assets/` and update those
  `<meta property="og:image">` tags so the link unfurls nicely on LinkedIn.
- **Phone number** — intentionally left off the public site for privacy. Add a row in
  `contact.html` if you want it public.
- **Creative gallery** — `creative.html` uses styled placeholder tiles. Replace each
  `<div class="ph" ...>` with `<img src="assets/your-photo.jpg" alt="...">` and set the
  tile's `data-lightbox="assets/your-photo.jpg"` so the lightbox shows the real image.
- **Canonical URL** — `index.html` has `<link rel="canonical" href="...">` set to a
  placeholder Vercel URL. Change it to your real URL after deploying.

## Notes on the design

- Bespoke CSS (no Tailwind/framework) for a cohesive warm-premium look and to keep it
  zero-dependency and fast. Fonts: **Fraunces** (display serif) + **Manrope** (sans) +
  **Space Mono** (labels), loaded from Google Fonts.
- Dark is the default theme; the sun/moon button toggles light mode and the choice is
  remembered in `localStorage`.
- Respects `prefers-reduced-motion`. Every interactive element has hover / focus-visible /
  active states. Charts in the project cards are inline SVG placeholders — swap for real
  screenshots in `assets/` when you have them.
