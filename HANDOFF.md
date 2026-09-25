# Portfolio (resume-website) — Handoff

Ryan's personal site and portfolio. Four static pages, no build step (see `README.md` for the
file layout and design notes). This file is the authority on what the site shows and how projects
get onto it.

**Live:** https://ryan-lin.vercel.app (also https://resume-website-nu-one.vercel.app; both Vercel
projects, `ryan-lin` and `resume-website`, deploy from this repo). Pushing to `main` on
`SuppyRyan/Resume-Website` (public) redeploys both in under a minute.

## Projects on the site

| Project | Work page | Home "Selected work" | Links to |
|---|---|---|---|
| Tickmark | 01 (Products) | card 1 | https://tickmark-pink.vercel.app |
| Algorithmic Trading System | 02 (Quant & Automation) | card 2 | — |
| SEC Earnings Sentiment & Fundamental Screener | 03 (Data & NLP) | card 3 | — |
| Mathematical Modeling for Finance | 04 (Modeling) | — | — |

Projects in `../PROJECTS.md` that are **not** on the site, and why:

| Project | Why not yet | Add when |
|---|---|---|
| Sidequest | Live, but legal review is the open launch blocker (`../Sidequest/HANDOFF.md`). | Legal review clears. |
| eastbay-childcare | Validation phase: no product, no name. | It has a name and something to show. |
| cpa-reference | Internal data pipeline behind Tickmark, not a product. | Folded into the Tickmark entry if ever mentioned. |
| executive-assistant | Private personal-admin setup. | Never (private by nature). |
| workspace | Internal tooling (Obsidian sync, backups). | Never. |

## Adding a project to the site

Every new project goes on the site once it has something a visitor can see, unless it is private by
nature. Sessions do this without being asked, as part of the checkpoint where the project first goes
live (or reaches a milestone worth updating). The owner is only asked when a project's own status
document says its launch is held for a reason that a public link would undercut (as with Sidequest).

1. **Work page (`work.html`)**, three pieces, copied from an existing project:
   - a `<button class="work-row reveal" data-cats="…" data-modal="m-…">` row in `.work-list`,
     numbered in order (newest or most important first; renumber `work-num` and the `data-d`
     stagger 1–4 below it);
   - a `<template id="m-…">` pop-up with the kicker, a few `m-list` bullets of real, checkable facts
     from the project's status document, the `m-stack`, and a `Visit … ↗` button if it is live;
   - a filter button if no existing `data-filter` fits (`product`, `quant`, `data`, `modeling`).
2. **Thumbnail**: a `<canvas class="card-canvas" data-canvas-type="…">` drawn by an `init…`
   function in `main.js` (see `initQuestionBank` for the pattern: a `// label` header, rows or a
   curve in the accent colours, one element highlighted on a loop, a static frame under reduced
   motion). Use the project's real numbers.
3. **Home page (`index.html`)**: `#featured .cards` holds exactly three cards (the grid is three
   across; a fourth leaves a gap). Put a new flagship project first and drop the oldest card, which
   stays on the Work page.
4. **Meta**: add it to `work.html`'s `description` / `og:description` and the intro `lede`.
5. **Check**: render both pages at 1400 px and 390 px (Playwright + Chrome, as Tickmark's
   `tools/e2e` does), open the pop-up, and confirm no console errors and no sideways scroll.
6. **Ship**: commit, push, confirm https://ryan-lin.vercel.app shows it, and update the tables above
   and the checkpoint log below. The Obsidian mirror picks up the change on its next run.

Copy rules: first person, plain and specific, numbers from the project's own status document (never
estimated), no pricing for products that are not charging yet.

## Checkpoint log

- 2026-09-25: Cloned to `C:\Users\shaol\Projects\resume-website` (it had only lived on GitHub). Tickmark added: Work page row 01 with a new Products filter, a detail pop-up linking to the live site, and an animated "questions by exam" thumbnail (`initQuestionBank` in main.js, real bank counts); home card 1, replacing Mathematical Modeling for Finance there (still on the Work page). This file created, with the procedure for adding projects. Checked at desktop and phone width: no console errors, no overflow.

- 2026-09-25: Speed and feel (owner: animations lag, clicks feel slow, the mouse feels slow, scrolling into projects is iffy). Removed Lenis smooth scroll (native scrolling; it also made the wheel scroll the page behind an open project pop-up), the drawn cursor (the dot trailed the pointer by 100 px, the ring by 250 px; the real pointer is back) and the 470 ms cover sweep before every page change (replaced by the browser's own View Transition, 0.18 s, while the next page loads). Internal links are clean URLs (`/work`), skipping a 308 redirect per click; pages prerender on hover (speculation rules). Canvas animations stop off-screen and read theme colours once per theme instead of every frame. Reveals 0.8 s → 0.5 s, hero entrance 0.9 s → 0.6 s, pop-up 0.4 s → 0.22 s. Faint text now passes WCAG AA in both themes (dark `#938873`, light `#6f6452`); link underline and footer/menu hovers animate transforms, not width or padding.
- 2026-09-25: Idle cost halved (home page at rest, CPU slowed 4×: about 77% → 39%). The hero candle field draws at 30 fps with one colour per theme and per-candle opacity (its script time fell from ~30% to 3%); the footer marquee pauses while off screen; the scroll cue plays three times, then rests. Live, before → after: click to the Work page 3.06 s → 1.36 s, wheel settles 1.0 s → 0.14 s, dropped frames while moving the mouse 11 → 1, project pop-up 1.04 s → 0.67 s and it now scrolls itself instead of the page.
- 2026-09-25: Phone gutters fixed: `.section` used the `padding` shorthand, which zeroed `.wrap`'s side gutters, so text ran edge to edge on every phone and sat 28 px off the header on desktop (now `padding-block`; checked at 390, 1024 and 1400 px on all four pages). The header tag "· Finance & Data" hides below 440 px so the name stays on one line. Impeccable critique run (dual-agent): 22/36; report in `.impeccable/critique/`.
- 2026-09-25: The repo is public and Vercel served every file, so `HANDOFF.md` was readable at ryan-lin.vercel.app/HANDOFF.md. `.vercelignore` now keeps `*.md` and `.impeccable/` off the site; `.impeccable/` is also gitignored (critique notes are not for a public repo). Deployed on resume-website-nu-one.vercel.app (HANDOFF.md → 404). **ryan-lin.vercel.app did not redeploy: Vercel returned "Deployment rate limited — retry in 24 hours"** (Hobby plan daily limit; every push here deploys twice, once per Vercel project). A failed deploy does not retry by itself: the next push after the limit resets carries it.

## Motion rules (keep it fast)

- Never delay navigation for an animation; page changes use `@view-transition` in `styles.css`.
- No scroll smoothing and no drawn cursor: both trail the user's hand and read as lag.
- A canvas animation runs only while on screen (`setupCanvas().run(step)` in `main.js`) and reads
  CSS variables once per theme (`themeVersion`), never per frame.
- Entrances finish within about half a second; animate `transform` and `opacity`, not layout.
- No endless animation runs off screen: canvases stop, the marquee pauses (`is-off`), loops that
  only decorate (the scroll cue) play a few times and rest.

**Next:** after the Vercel limit resets (from about 19:05 UTC on 26 Sep 2026), push any commit and confirm https://ryan-lin.vercel.app/HANDOFF.md returns 404. Then the critique's priorities (owner decisions pending): invented chart numbers, Tickmark buried, home page length, audit-workpaper identity. Sidequest once its legal review clears (owner's call). Open items from `README.md`: real
`og:image`, canonical URL, creative gallery photos.
