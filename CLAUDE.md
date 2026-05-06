# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
# Serve the site locally (required for any dev or PDF build).
# Run from course-site/. Port 8765 is what build_pdfs.py expects.
python -m http.server 8765

# Build PDFs of all main-course etapes (server must be up first).
# Output: course-site/pdf/<slug>_<title>_<lang>.pdf
python build_pdfs.py ru        # or: python build_pdfs.py en
```

Open `http://localhost:8765/index.html` for the main course or `http://localhost:8765/claude-design.html` for the parallel design tutorial. **No tests, no lint, no transpilation, no CI** — editing means direct file changes.

## Project overview

This repo contains **two** bilingual (RU/EN) static self-study courses sharing one stylesheet and one JS layer:

- **«Полевое руководство по Claude Code» / "A Field Guide to Claude Code"** — the main course, walking a non-programmer through Claude Code. Lives at [course-site/index.html](course-site/index.html) + [course-site/etapes/etap-00.html](course-site/etapes/etap-00.html) through `etap-11.html` + [capstone.html](course-site/etapes/capstone.html). The main-course slugs are non-contiguous: `etap-00 … etap-06`, then `etap-06b` (an *extension etape* on Telegram bots that builds on the etape-06 web office), then `etap-07`, `etap-08a`/`etap-08b` (a/b split because etape 8 is too dense for one unit), then `etap-09 … etap-11`. **14 etape pages + capstone = 15 entries**, which is what the progress pill counter shows.
- **«Полевое руководство по Claude Design» / "A Field Guide to Claude Design"** — a parallel tutorial designed *for graduates of the main course*, covering the Anthropic Labs product `claude.ai/design` (launched 17 Apr 2026). Ten etapes + capstone. Lives at [course-site/claude-design.html](course-site/claude-design.html) + `claude-design-00.html` through `claude-design-10.html` + [claude-design-capstone.html](course-site/etapes/claude-design-capstone.html). Skips basics the main course already taught (prompts, iteration, references) and focuses on design-specific topics (visual literacy with three reading layers, three refinement tools, workspace inheritance, handoff back into Claude Code).

Authoritative source documents:

- [instructions.md](instructions.md) — original brief for the main course (RU). Authoritative voice/audience: a person who once learned basic Python years ago and is **not** a developer. Jargon (`parse`, `GitHub`, etc.) is introduced gradually with inline tooltips, never assumed.
- [Python_Crash_Course.pdf](Python_Crash_Course.pdf) — pedagogical reference: the per-etape practice + "do this guided / now do this on your own" structure mirrors that book.
- The **investment-and-finance throughline** (compound interest → portfolio CSV → US Form 1040 capstone) is intentional in the **main course** — keep new examples on that thread. The **design tutorial** deliberately breaks the constraint and uses **four parallel tracks** (café / apartment / indie game / finance), with finance as one option that doubles as a bridge back to the main course. Each design etape's two guided projects are on specific tracks and the two solo projects let the reader pick — by the end the portfolio holds work across all four.

## Running and editing

There is no build step, package.json, or test runner. The site is plain HTML/CSS/JS:

- **View locally**: open [course-site/index.html](course-site/index.html) by double-click, or serve the folder (e.g. `python -m http.server 8765` from `course-site/` — port 8765 is what [build_pdfs.py](build_pdfs.py) expects).
- **No deps**: editing means changing files in place. There is no transpilation, no linter config, no CI.
- **Visual verification**: the only tools whitelisted in [.claude/settings.local.json](.claude/settings.local.json) are Playwright MCP (`browser_navigate`, `browser_take_screenshot`, `browser_click`, `browser_resize`, `browser_close`, `browser_evaluate`). Use them to verify layout / theme / RU-vs-EN changes.
- **Repo-root noise**: `etap-*.png`, `home-*.png`, `pdf-preview*.png`, `site-open.png`, `doodle-*.png`, `theme-*.png`, `design-*.png`, `claude-design-*.png` are screenshots from prior sessions. `preview/` and `__pycache__/` are scratch dirs from PDF building. None of these are referenced by the site — ignore them when reasoning about behaviour.

## PDF build pipeline

The main course also ships as one PDF per etape under [course-site/pdf/](course-site/pdf/). The pipeline is intentionally split across three places — touching one without the others breaks layout silently.

1. **[build_pdfs.py](build_pdfs.py)** — calls headless Edge (`msedge.exe --headless=new --print-to-pdf=…`) for each entry in its hard-coded `PAGES` list, against `http://localhost:8765/etapes/<slug>.html?print=1&lang=ru`. Output filename is `<slug>_<title-from-<title>-tag>_<lang>.pdf`. Run as `python build_pdfs.py ru` (or `en`) **with the HTTP server already up**. Adding a new main-course etape = update `PAGES` here AND the `ETAPES` array in `progress.js` AND the `<span class="total">` count in every page header. **The design tutorial pages are not in the `PAGES` list** — extending the pipeline to the design course requires adding their slugs and verifying their print CSS hasn't drifted from the main course's.
2. **`@media print { … }` block in [styles.css](course-site/styles.css)** — defines the entire paper layout: `@page { margin: 8mm 0 4mm 0; size: A4; background: #f1e9d2 }` (cream paper extends through margins; CSS variables don't resolve inside `@page`, so the colour is hard-coded to match light's `--bg`), hides the topbar / language toggle / theme toggle / progress pill / `❦` ornaments / `summary::before` markers, and contains the page-break contract (project-on-its-own-page, quiz/checklist on a fresh page, `<pre>` and `ol.steps > li` and `dt+dd` and quiz items unsplittable, `summary` heading-stuck-to-body). The `body::before` paper-grain SVG is force-disabled in print — it was rasterising as huge bitmaps and inflating PDFs from ~1 MB to ~25 MB.
3. **`?print=1&lang=ru` URL params, parsed at the top of [progress.js](course-site/progress.js)** — when present, force the **light** theme (overriding the `doodle` default), force the requested language, and add `[open]` to every `<details>` on `DOMContentLoaded`. Without this, headless Edge would render the site in doodle theme (the default) with all topic and quiz `<details>` collapsed. The parameter is invisible to live readers — it's a feature flag, not a build mode.

If a new "blank page" or "orphan heading" appears in the PDF, the suspect is almost always the print CSS: `break-inside: avoid` on a tall block (creates whitespace), symmetric `break-after: avoid` + `break-before: avoid` (creates phantom blank pages in Chromium), or a decorative pseudo-element that survived without its parent (`hr.ornament`, `summary::before`).

## Architecture

### One state machine, one storage key, two id namespaces

[course-site/progress.js](course-site/progress.js) is the entire JS layer. It owns a single `localStorage` blob under the key `claude-code-course-v1` with five fields: `theme`, `lang`, `done` (per-etape completion), `checks` (per-checklist-item ticks), `scores` (per-quiz-question "knew" / "did not know"). Every UI handler reads/writes that one object.

**Stable DOM attributes are the schema.** The script keys storage off:

- `<button class="btn-complete" data-id="etap-XX">` (main) or `<button class="btn-complete" data-id="design-XX">` / `data-id="design-capstone"` (design) — etape completion. Both id families share the same `state.done` map; the prefix is the namespace.
- `<li data-key="eXX-...">` (main) or `<li data-key="dXX-...">` / `<li data-key="dc-...">` (design) — checklist state.
- `<li class="quiz-item" data-q="qN">` — quiz scoring (per-page, no namespace needed).

Renaming any of these attributes silently wipes a reader's progress. Treat them like a database schema.

The `ETAPES` array near the top of [progress.js](course-site/progress.js) **only lists main-course IDs** (`etap-00`, …, `etap-06b`, …, `capstone`, currently 15 entries). It drives `renderProgressPill` (top-bar `0/15 DONE` counter) and the home-page contents progress. Design-tutorial completions are stored under the same `state.done` key but **not** counted toward the main-course pill — by design. Each design page therefore declares its pill as a static `<span class="progress-pill">RESEARCH PREVIEW</span>` with no `.num` / `.total` spans, so `renderProgressPill` becomes a no-op there (defended by `if (numEl)` / `if (totEl)` guards).

`renderEtapeRowState` applies the `.done` class to **any** `.etap-row[data-id]` whose id is in `state.done` — so a click on a design-tutorial complete button visually marks the row in `claude-design.html`'s contents list, even though that id never enters the main pill counter. Same UX, two scoreboards.

Adding or renaming a main-course etape = update the `ETAPES` array in `progress.js` AND the `PAGES` list in `build_pdfs.py` AND the `<span class="total">` count in the header pill of every main-course page. Adding a design etape = update [claude-design.html](course-site/claude-design.html)'s contents listing AND the prev/next links of neighbouring etapes (no `ETAPES` change needed).

### Bilingual content is twin-spans, not separate files

The whole site is one DOM. Every user-facing string is a pair:

```html
<span lang="ru">Этап завершён</span><span lang="en">Etape completed</span>
```

CSS hides the non-active locale; `progress.js` flips `<html lang>` and a few dynamically-rendered labels (see `renderQuizSummary`, `renderCompleteButton`). When you edit copy, **always edit both spans**. When you add a new string, add both spans, even if one is a stub. Language is per-reader and persisted; do not assume RU is "primary" in code.

A handful of strings are written from JavaScript (the `advice` text in `renderQuizSummary`, complete-button labels, theme labels via the `THEME_VIEW` lookup table — `DAY` / `NIGHT` / `DOODLE`). These have explicit `if (lang === 'ru')` branches or per-theme entries — keep both branches and all entries in sync.

### Etape page template

Every etape file (main-course `etap-XX.html` and design `claude-design-NN.html`) follows the same skeleton, in this order:

1. `<section class="etap-hero" data-num="XX">` — eyebrow, h1, standfirst, `<dl class="etap-meta">` (duration / what you master / outcome / artefact).
2. `<section id="topics">` — § I body content, structured as a sequence of `<details class="topic"><summary>Topic title</summary><div class="topic-body">…</div></details>` units. Topic prose mixes paragraphs with `<pre class="shell">` blocks for terminal examples.
3. `<section id="projects">` — § III, two guided projects + two solo projects per etape (this is the rule from the brief — do not drop it). Each project is an `<article class="project">` (or `class="project solo"`); solo projects often end with a `<details class="verify">` block of expected outcomes.
4. `<section id="glossary">` with `<dl class="glossary">` — § V, every new term that appeared in the prose.
5. `<section id="quiz">` with seven `<li class="quiz-item">` entries plus `.quiz-summary` block — § VI.
6. `<section id="checklist">` ending with the `btn-complete` button — § VII.
7. `<section class="tight">` with `.etap-nav` prev/next links.

Inline definitions use `<dfn class="term" tabindex="0" data-def="...">word</dfn>`. The tooltip text is **the same language as the surrounding `<span lang>`** — every term that appears in the RU side needs a paired one in the EN side with translated `data-def`.

A "next" link can be marked `class="next disabled" href="#" aria-disabled="true"` when the next etape file does not exist yet — this prevents 404s during incremental authoring. The same pattern marks `class="prev disabled"` on the first etape (etap-00, claude-design-00).

### Visual system: three themes, doodle is default

[course-site/styles.css](course-site/styles.css) is the single stylesheet. The aesthetic is "editorial / practical handbook / paper-and-ink" — design tokens at the top of the file (`--bg`, `--ink`, `--accent`, `--rule`, `--highlight`, `--shadow`, etc.) drive **three** themes via `<body>` class overrides:

- **Light** (`:root` block) — warm cream paper, deep sepia ink, brick-red accent.
- **Dark** (`body.dark` block) — deep navy paper, cream ink, amber accent.
- **Doodle** (`body.doodle` block) — pale-sky "school notebook" paper, navy ink, coral accent. **Doodle is the default theme for new visitors** (`progress.js`: `if (!state.theme) state.theme = 'doodle';`). The theme button in the topbar cycles `light → dark → doodle → light` via the `THEME_CYCLE` map.

All themes share the same token names — content code is theme-agnostic (just consume `var(--accent)` etc.). Three Google Fonts: Fraunces (display), Newsreader (body), IBM Plex Mono (terminal/code). Do not introduce other fonts; reuse the tokens rather than hard-coding colours.

The screen design has a per-theme `body::before` background:

- Light/dark — subtle paper-grain (SVG `feTurbulence` filter at `mix-blend-mode: multiply` / `screen`).
- Doodle — horizontal ruled lines (32px spacing, `mix-blend-mode: multiply`).

All `body::before` effects are force-disabled in `@media print` — see the PDF pipeline section.

**Doodle decorations** are scoped strictly to `body.doodle` selectors at the bottom of `styles.css`: hand-drawn SVG checkboxes for `.checklist li`, wavy SVG underlines (see below), sticker-tilted labels (`.project .label`, `.aside-card .label`, `.practice h4`), sticky-note `.note`, highlighter-yellow `<strong>` in body paragraphs, hand-drawn ovals around `.etap-row .num`, washi-tape on `.aside-card`, sparkles around `.etap-hero h1`, wavy SVG `hr.rule`, triple-flower `hr.ornament`, ★ margin marks on `.quiz-item`. Light and dark themes are unaffected because every rule is prefixed with `body.doodle`. **When adding new decorations, follow the same scoping discipline** — accidentally-global rules will leak into the editorial light/dark aesthetics.

**The two wavy underlines mean different things.** In doodle the same SVG-wave shape is used for both `<em>` (decorative italics) and `dfn.term` / `a:hover` (interactive — opens a tooltip / is a link), but they carry **different colours by function**: red wavy (`#e63a5e`) is reserved for interactive markers, ink-blue wavy (`#1a2547`) is decorative `<em>`. Do not unify the two colours, and do not swap `<em>` to `dotted`/`dashed` — the colour-by-function pairing is intentional, so an italic emphasis no longer reads as "click me." Rules live at [styles.css:142-161](course-site/styles.css#L142-L161).

### Cross-course navigation

The two courses are stitched together at **two layers**: the index pages and every etape's topbar.

**Index-level (richer wiring):**

- Main → Design: topbar `<nav>` `Claude Design` link · `<section id="design-cta">` callout after `#capstone` (with two buttons: primary `→ Open Claude Design` and secondary `Course Contents`) · footer "Navigation" column entry.
- Design → Main: topbar `<nav>` `основной курс / main course` link · footer "Course" column entry.

**Etape-level (single symmetric link):**

- Every Claude Code etape (`etap-*.html` + `capstone.html`) has `<a href="../claude-design.html">Claude Design ↗</a>` as the last anchor in its topbar `<nav>`.
- Every Claude Design etape (`claude-design-*.html` + `claude-design-capstone.html`) has `<a href="../index.html">основной курс ↗ / main course ↗</a>` in the same slot.

The ↗ glyph distinguishes cross-course links from in-page anchors. On 1280px desktops the link wraps to a second nav line for Claude Code etapes (which already have 7 in-page anchors); on 375px mobile both courses wrap cleanly via `flex-wrap`.

The CTA card on `index.html` uses inline-styled anchors (not the `.btn-complete` class) — the class triggers `progress.js`'s `renderCompleteButton`, which would overwrite the link text with "Mark etape complete." Use inline styles or a fresh class for any non-completion buttons.

When adding navigation or new etapes, mirror both directions to keep the pair symmetric.

## Smithery-installed skills

[skills-lock.json](skills-lock.json) records four well-known skills installed under [.claude/skills/](.claude/skills/): `excalidraw-diagram-generator`, `frontend-design`, `pdf`, `playground`. They are installed assets, not source — do not hand-edit. The main course teaches the user how to install/use these around etapes 03 and 09, so their presence in the repo is intentional pedagogical scaffolding. **`frontend-design` (the Claude Code skill) is distinct from `Claude Design` (the Anthropic Labs product covered in the design tutorial)** — do not conflate them. The design tutorial covers the latter; the former is a skill for generating frontend code from inside Claude Code.

**Install commands inside the course are externally-versioned.** The Smithery CLI changed in 2026 (deprecated `install`, dropped the `@smithery/cli` npm name, added `mcp add` / `skill add` subcommands). For *MCP servers* the course now prefers the **native** `claude mcp add <name> -- npx '<package>@latest'` (writes `~/.claude.json`, survives Smithery API changes); for *skills* it uses `npx smithery@latest skill add <owner/skill> --agent claude-code`. A yellow note at the top of [etap-03 setup](course-site/etapes/etap-03.html) tells readers where to look when external syntax shifts again. If you update install commands, also update the Smithery glossary entry in etap-03 and the "where skills come from" `.note` in etap-06.
