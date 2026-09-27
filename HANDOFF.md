# Portfolio (resume-website) — Handoff

Ryan's personal site and portfolio. Four static pages, no build step (see `README.md` for the
file layout). The style guide is `DESIGN.md` (tokens, the tickmark signature, motion rules, what not to bring back). This file is the authority on what the site shows and how projects
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

The Creative page (`/creative`) is hidden from the menus since 26 Sep 2026: it only had placeholder tiles.

Projects in `../PROJECTS.md` that are **not** on the site, and why:

| Project | Why not yet | Add when |
|---|---|---|
| Sidequest | Live, but legal review is the open launch blocker (`../Sidequest/HANDOFF.md`). | Legal review clears. |
| eastbay-childcare | Validation phase: no product, no name. | It has a name and something to show. |
| cpa-reference | Internal data pipeline behind Tickmark, not a product. | Folded into the Tickmark entry if ever mentioned. |
| executive-assistant | Private personal-admin setup. | Never (private by nature). |
| workspace | Internal tooling (Obsidian sync, backups). | Never. |
| curious-little-one | Client website for a San Ramon child care center; built 25 Sep 2026 but not yet approved by the client or moved onto her domain (`../curious-little-one/HANDOFF.md`). The gallery shows real children, so ask the owner before using screenshots. | It is live on curiouslittle1.info and the client is happy to be named; then link the live domain. |

## Adding a project to the site

Every new project goes on the site once it has something a visitor can see, unless it is private by
nature. Sessions do this without being asked, as part of the checkpoint where the project first goes
live (or reaches a milestone worth updating). The owner is only asked when a project's own status
document says its launch is held for a reason that a public link would undercut (as with Sidequest).

1. **Work page (`work.html`)**, three pieces, copied from an existing project:
   - a `<button class="work-row reveal" id="…" data-modal="m-…">` row in `.work-list`, numbered
     in order (renumber `work-num` and the `data-d` stagger 1–4 below it). The `id` is the project's
     link: `/work#id` opens its pop-up, and Back closes it. The title is a `<span class="work-row-title">`
     (no headings inside a button);
   - a `<template id="m-…">` pop-up with the kicker, a few `m-list` bullets of real, checkable facts
     from the project's status document, the `m-stack`, and a `Visit … ↗` button if it is live;
2. **Thumbnail**: a `<canvas class="card-canvas" data-canvas-type="…">` drawn by an `init…`
   function in `main.js` (see `initQuestionBank` for the pattern: a `// label` header, rows or a
   curve in the accent colours, one element highlighted on a loop, a static frame under reduced
   motion). Numbers on a thumbnail are the project's real ones, or the chart says "illustrative"
   in its label and holds still (a fixed seed, never `Math.random`).
3. **Home page (`index.html`)**: `#featured .cards` holds exactly three cards (the grid is three
   across; a fourth leaves a gap). Each card links to `/work#<id>`. The site leads with the résumé;
   projects sit beside it, none singled out in the hero (owner, 25 Sep).
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
- 2026-09-25: Clean-up (owner: keep the look, résumé first, projects beside it, tighten Home and Creative, make it seamless). Charts: the trading and SEC thumbnails say "illustrative" and the equity curve holds still (fixed seed; it used to show a different random return on every load). Stats render their real values without JavaScript; "Revenue audited" became "Client revenue scale", "Above benchmark" became "Student fund vs. benchmark". About drops the facts the hero already states and lists Tickmark among the projects. Projects are linkable (`/work#tickmark`, `#trading-bot`, `#sec-screener`, `#finance-modeling`), home cards open their own project, Back closes a pop-up; the Work filter bar is gone (5 filters for 4 projects). Creative: 10 pillars grouped into 5, placeholder tiles labelled and no longer open an empty lightbox, filter bar is a group, not a tablist. Accessibility: headings never skip a level (footer and skills labels were h4/h5), no headings inside buttons, the animated name is read as "Ryan Lin", tap targets 44 px on phones (theme, menu, filters, footer, breadcrumbs), no label under 11 px. Link previews use a real image (`assets/og.png`, 1200×630) instead of a placehold.co placeholder. Duplicate Vercel project `resume-website` deleted (owner OK): each push now deploys once, to ryan-lin.
- 2026-09-25: The repo is public and Vercel served every file, so `HANDOFF.md` was readable at ryan-lin.vercel.app/HANDOFF.md. `.vercelignore` now keeps `*.md` and `.impeccable/` off the site; `.impeccable/` is also gitignored (critique notes are not for a public repo). Deployed on resume-website-nu-one.vercel.app (HANDOFF.md → 404). **ryan-lin.vercel.app did not redeploy: Vercel returned "Deployment rate limited — retry in 24 hours"** (Hobby plan daily limit; every push here deploys twice, once per Vercel project). A failed deploy does not retry by itself: the next push after the limit resets carries it.

- 2026-09-26 (2a): Design review with the new design skills (Emil Kowalski's design engineering, Impeccable, taste): 22/32, reads as a template; the owner chose a clean-up that keeps the palette and layout, a font swap and an audit-tickmark signature, shipped in four steps. This step removes the animation library: GSAP and ScrollTrigger (two CDN scripts on every page) are gone with the three things only they did, the Receipts count-up (it showed $298M+, 3% and a 3.94 GPA for over a second), magnetic buttons and the name letters chasing the mouse (both moved targets away from the pointer). The three scroll effects stay without it: the timeline rail is a CSS scroll-driven animation on `transform` (it animated `height`), the About roles light from an IntersectionObserver band, and the hero candles read `scrollY` inside their existing draw loop. Checked at 1400 and 390 px: no console errors, no sideways scroll, pop-up opens, no GSAP requests.

- 2026-09-26 (2b): Template tells removed, palette and layout kept. Gone: the rotated "// fremont · ca · ed. 2026" stamp, the vertical SCROLL cue, the hero eyebrow and its four chips, the uppercase label above every section, the footer marquee ("Est. 2026"), the green "open to connect" dot, gold glow shadows (now ordinary offset shadows) and every em-dash in the copy (rewritten; date ranges keep an en dash). "Receipts." is now "By the numbers."; Contact's two column labels are real headings. **Creative is out of every menu** (the page still loads at /creative; bring it back when it has real posts, and fix its copy then). Checked at 1400 and 390 px with wheel scrolling: every section reveals, no console errors, no sideways scroll.

- 2026-09-26 (2c): Display serif Fraunces (the most common AI-built serif) replaced by Newsreader, a news-reading serif with optical sizes, on every page (`--serif` and the Google Fonts link). Newsreader sets wider, so the hero's "finance · data · audit" line is 0.8 of the name's size (one line on desktop) and each dot stays with the word after it, so a phone never ends a line on a dot.

- 2026-09-26 (2d): Signature: **audit tickmarks**. Every figure is ticked in red pencil as its section scrolls in: the four By the numbers figures one after another (the one focal moment), then a legend "Agreed to résumé", and each bold figure in Experience as its job appears ($300M+, $500K+, $25M+, 20%, 12%, 4%, top 3). `bootTickmarks` in main.js adds the marks and the reveal observer's `.in` draws them (stroke-dashoffset, 0.42 s each, 0.14 s apart); reduced motion shows them drawn. `--tick` (#e0765f dark, #b23b26 light) is used for tickmarks only. Checked at 1400 and 390 px, both themes. This finishes the owner's portfolio clean-up (2a to 2d).

- 2026-09-26: `DESIGN.md` written from the shipped site (owner: keep the updates in the style guide): North Star "The Evening Workpaper", one copper accent, red pencil for tickmarks only, Newsreader over Manrope, no animation library, and the tells not to bring back.

## Motion rules (keep it fast)

- No animation library. Scroll-linked motion is CSS (`animation-timeline`) or an IntersectionObserver; canvases read `scrollY` in their own loop.
- Nothing follows the pointer: magnetic buttons and letters that chase the mouse read as lag, like a drawn cursor.
- Never delay navigation for an animation; page changes use `@view-transition` in `styles.css`.
- No scroll smoothing and no drawn cursor: both trail the user's hand and read as lag.
- A canvas animation runs only while on screen (`setupCanvas().run(step)` in `main.js`) and reads
  CSS variables once per theme (`themeVersion`), never per frame.
- Entrances finish within about half a second; animate `transform` and `opacity`, not layout.
- Figures get audit tickmarks (`bootTickmarks`). A new figure in bold inside an Experience bullet is ticked automatically; red (`--tick`) is for tickmarks only.
- No endless animation runs off screen: canvases stop, the marquee pauses (`is-off`), loops that
  only decorate (the scroll cue) play a few times and rest.

**Deploying while over the Vercel limit:** the scheduled task "Portfolio deploy when ready" (hourly, `tools/deploy-when-ready.mjs`, log in `tools/deploy-log.txt`) runs `vercel deploy --prod` until the live site matches this folder and HANDOFF.md is gone, then deletes itself. Set up 25 Sep because Vercel does not retry a Git push it rate-limited.

**Next (26 Sep):** the owner's clean-up is done (2a to 2d above), which also settles last week's open "audit-workpaper identity" item. Open: bring Creative back into the menus once it has real posts (and fix its copy then); Sidequest once its legal review clears (owner's call); `README.md` items: canonical URL, creative gallery photos.

**Earlier next step (25 Sep, done):** the task deployed at 13:25 on 25 Sep (confirmed: https://ryan-lin.vercel.app/HANDOFF.md returns 404 and the Work page has no filter bar). It should delete itself on its next hourly run. If "Portfolio deploy when ready" is still in Task Scheduler after that, delete it. Then the critique's priorities (owner decisions pending): invented chart numbers, Tickmark buried, home page length, audit-workpaper identity. Sidequest once its legal review clears (owner's call). Open items from `README.md`: real
`og:image`, canonical URL, creative gallery photos.
