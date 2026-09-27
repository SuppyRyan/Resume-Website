---
name: Ryan Lin
description: A finance and data résumé site read like an evening workpaper, with every figure ticked in red pencil.
colors:
  espresso: "#0c0a08"
  espresso-1: "#141009"
  espresso-2: "#1c170f"
  espresso-3: "#271f15"
  parchment-ink: "#f2ead7"
  parchment-dim: "#b6aa92"
  parchment-faint: "#938873"
  copper: "#cf924f"
  copper-bright: "#e7ad6a"
  copper-deep: "#a96c30"
  red-pencil: "#e0765f"
  on-copper: "#1a1206"
  light-paper: "#f5efe4"
  light-paper-1: "#faf5ea"
  light-card: "#ffffff"
  light-ink: "#211a11"
  light-ink-dim: "#5d5446"
  light-ink-faint: "#6f6452"
  light-copper: "#a4602c"
  light-copper-bright: "#bd7838"
  light-red-pencil: "#b23b26"
typography:
  display:
    fontFamily: "Newsreader, 'Iowan Old Style', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.8rem, 7vw, 5.1rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Newsreader, 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(2rem, 4.2vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Newsreader, 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.25rem, 2vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.7
  lede:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.6vw, 1.28rem)"
    fontWeight: 400
    lineHeight: 1.65
  data:
    fontFamily: "'Space Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.18em"
rounded:
  chip: "8px"
  sm: "10px"
  md: "14px"
  lg: "22px"
  pill: "999px"
spacing:
  gutter: "28px"
  container: "1140px"
  section: "clamp(64px, 9vw, 116px)"
components:
  button-primary:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.on-copper}"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  button-ghost:
    backgroundColor: "{colors.espresso-2}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  card:
    backgroundColor: "{colors.espresso-1}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.md}"
  panel:
    backgroundColor: "{colors.espresso-1}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(24px, 3vw, 34px)"
  chip:
    backgroundColor: "{colors.espresso-3}"
    textColor: "{colors.parchment-dim}"
    rounded: "{rounded.chip}"
    padding: "7px 12px"
  stat-figure:
    textColor: "{colors.copper-bright}"
    typography: "{typography.display}"
---

# Design System: Ryan Lin

Tokens live in `styles.css` (`:root` for dark, `html[data-theme="light"]` for light); this file follows
that file, not the other way round. Written 26 Sep 2026 after the design pass that the owner approved
("I really like the updates"): keep what is recorded here.

## Overview

**Creative North Star: "The Evening Workpaper"**

The site reads like a finance professional's working papers, looked at after hours: a warm espresso
ground, copper ink for what matters, a news-reading serif for the headings, and, the one signature, a
red-pencil audit tickmark beside every figure. Recruiters for audit, valuation and data roles should
recognise the craft in a second and read the résumé in a minute.

It is quiet on purpose. The look is kept, the template habits are gone: no uppercase label above each
section, no rotated stamps or vertical "scroll" hints, no marquee, no glowing buttons, no animation
library. Motion is small, fast and never follows the pointer.

**Key Characteristics:**
- Dark by default (espresso and parchment), with a warm light theme on the toggle.
- Newsreader headings over Manrope text; Space Mono only for data (tags, stat labels, chart labels).
- Copper is the one accent. Red pencil (`--tick`) exists only for tickmarks.
- Every figure on the page is ticked as it scrolls in, with a legend: "Agreed to résumé".
- The résumé leads; projects sit beside it, none singled out in the hero.

## Colors

Warm, low-key and legible: near-black espresso and parchment text, one copper accent, and a red pencil
used for nothing but tickmarks.

### Primary
- **Copper** (#cf924f; light #a4602c): the accent. Primary button fill (a copper-bright to copper
  gradient), active nav link, links, card kickers, the hero candle field.
- **Copper Bright** (#e7ad6a; light #bd7838): figures in By the numbers, hover text, focus ring.

### Tertiary
- **Red Pencil** (#e0765f; light #b23b26): audit tickmarks and their legend mark only.

### Neutral
- **Espresso** (#0c0a08) and its steps **Espresso 1–3** (#141009, #1c170f, #271f15): page, cards and
  panels, chips. Light theme: **Paper** #f5efe4, #faf5ea, white cards, #f0e8d8.
- **Parchment Ink** (#f2ead7; light #211a11): headings and body.
- **Parchment Dim** (#b6aa92; light #5d5446): secondary text, ledes.
- **Parchment Faint** (#938873; light #6f6452): meta and small labels (passes WCAG AA in both themes).
- **Lines** (parchment at 10% and 18%; light ink at 13% and 22%): borders and dividers.

### Named Rules
**The One Accent Rule.** Copper is the only accent. No second hue for status, charts or badges.
**The Red Pencil Rule.** `--tick` is used for tickmarks and nothing else; a red that appears anywhere
else stops meaning "checked".

## Typography

**Display Font:** Newsreader (with Iowan Old Style, Georgia)
**Body Font:** Manrope (with system sans)
**Data Font:** Space Mono

**Character:** A news-reading serif with optical sizes for headlines, a clean humanist sans for reading,
and a monospace kept for data, the way a workpaper sets numbers apart from prose.

### Hierarchy
- **Display** (500, clamp 2.8–5.1rem, 1.08, -0.035em): the hero name. Its descriptor line
  ("finance · data · audit") is 0.8 of that size in faint ink, and each dot stays with the word after it.
- **Headline** (500, clamp 2–3rem, -0.03em): section headings ("Where I've worked.", "By the numbers.").
- **Title** (500, clamp 1.25–1.5rem): card and project titles.
- **Lede** (400, clamp 1.05–1.28rem, 1.65, max 56ch): intro paragraphs in dim ink.
- **Body** (400, 16.5px, 1.7): prose and bullets.
- **Data** (Space Mono, 11px, 0.18em, uppercase): card kickers, stat labels, tags, chart labels.

### Named Rules
**The Replaced-Serif Rule.** Fraunces was the site's serif and is the most common AI-built choice; it was
replaced by Newsreader on 26 Sep 2026. Do not bring it back.
**The Plain Punctuation Rule.** No em-dashes in copy; rewrite with a colon, comma or full stop. Date
ranges use an en dash ("Jul 2024 – Present").

## Layout

One 1140px container with 28px gutters; sections are separated by clamp(64px, 9vw, 116px) of vertical
padding. The home page runs hero (name and quick-facts card side by side, stacked under 880px), About
(the Work / Analyze / Build roles sticky beside three chunks), Experience (a timeline with a rail),
The toolkit (two panels), By the numbers (four figures, two per row under 760px), and Things I've built
(three cards; the grid is three across, so the home page never shows a fourth). No sideways scroll at
any width; tap targets are 44px on phones.

## Elevation & Depth

Depth is tonal first: espresso steps separate page, card and panel, with hairline borders. Shadows are
neutral, offset and soft, never coloured glows.

### Shadow Vocabulary
- **Shadow 1** (`0 1px 2px rgba(0,0,0,.5), 0 10px 28px rgba(0,0,0,.40)`): hover lift on buttons and cards.
- **Shadow 2** (`0 2px 6px rgba(0,0,0,.5), 0 24px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,238,214,.045)`): the hero quick-facts card, pop-ups.
- **Primary button rest** (`0 10px 24px -12px rgba(0,0,0,.7)`): the copper button's own lift.

### Named Rules
**The No-Glow Rule.** Shadows carry an offset and a neutral colour. Copper-tinted halos were removed
on 26 Sep 2026.

## Shapes

Soft and consistent: pills for buttons and the theme toggle, 14px for cards and rows, 22px for panels
and the hero card, 8px for chips.

## Components

### Buttons
- **Primary:** copper gradient pill, dark text, 13px 24px; lifts 2px on hover; presses to 98.5%.
- **Ghost:** outlined pill on espresso; copper border and text on hover.
- Buttons stay where they are: nothing moves toward the pointer.

### Audit tickmarks (signature)
A hand-drawn red-pencil tick (SVG path, `vector-effect: non-scaling-stroke`) drawn with
`stroke-dashoffset` when its section gets `.in` from the reveal observer: 0.42s each, 0.14s apart.
- By the numbers: one per figure, pinned to the figure's top-right corner, then the legend
  "✓ Agreed to résumé" bottom-right of the band. This is the page's one focal moment.
- Experience: every bold figure in a bullet (anything with a digit) gets a small tick after it.
- Added by `bootTickmarks` in `main.js`; a new bold figure is ticked automatically. Reduced motion
  shows them already drawn.

### Cards (Things I've built)
Espresso card, hairline border, a live canvas thumbnail on top (charts say "illustrative" unless the
numbers are real), then a data-font kicker, a serif title, a short description and data-font tags.

### Figures (By the numbers)
Real values in the HTML, shown at once: no count-up. Copper-bright display numerals with a data-font
label beneath.

### Navigation
Home, Work, Contact (Creative is hidden from every menu until it has real posts; the page still loads),
a theme toggle and a "Résumé" download pill.

### Motion
- No animation library. Scroll-linked motion is CSS (`animation-timeline`) or an IntersectionObserver;
  canvases read `scrollY` inside their own loop and stop off screen.
- The hero candle field compresses into a sparkline as the hero leaves; the timeline rail fills with
  `transform: scaleY` (entry 22% to exit 38%); the About roles light up in a band 42–62% down the view.
- Entrances finish within about half a second; page changes use the browser's view transition.
- Everything collapses to static under reduced motion.

## Do's and Don'ts

### Do:
- **Do** tick every new figure: bold it inside an Experience bullet and `bootTickmarks` does the rest.
- **Do** keep copper as the only accent and red pencil for tickmarks only.
- **Do** use real numbers from the project's own status document, or label a chart "illustrative".
- **Do** check new work at 1400 and 390px in both themes, scrolling with the wheel so every section reveals.

### Don't:
- **Don't** add an uppercase label above a section heading; the heading carries it.
- **Don't** bring back the rotated "ED. 2026" stamp, a vertical "SCROLL" cue, a marquee or a status dot.
- **Don't** add count-ups, magnetic buttons, cursor effects or letters that follow the mouse.
- **Don't** use em-dashes, coloured glows, Fraunces, or a second accent colour.
