# Etape 04 — Domain Diversification Design

**Date:** 2026-05-12
**Scope:** `course-site/etapes/etap-04.html` (pilot — single etape)
**Status:** Awaiting Marya's sign-off on this spec before implementation
**Next step after sign-off:** invoke `superpowers:writing-plans` to produce a step-by-step implementation plan.

---

## 1. Motivation

The course's main-course «hard spine» (etapes 02, 03, 04, 08b, capstone) is currently 100% personal-finance projects, while peripheral etapes (00, 05, 06b, 07, 08a, 09, 10, 11) mix finance with other domains. Marya reports thematic fatigue specifically by etape 04: «он уже надоел ко времени 04» — by the time the reader reaches etape 04, five consecutive projects on the same `data/operations.csv` (etape 02) and analogous `data/statements/` (etape 04 itself) have exhausted the finance domain.

The pedagogical diagnosis: etape 04's technique (spec → Plan Mode → TodoWrite → multi-phase execution → verification → markdown report) is genuinely valuable and worth teaching well. The fatigue is not about the technique — it is about the **domain** in which the technique is repeatedly demonstrated. Repeating CSV-parsing-of-money four projects in a row makes etape 04 feel like more of etapes 02–03, not a new lesson.

Marya's goal phrase: «менее однообразно и более интересно и захватывающе.»

## 2. Scope and non-goals

### In scope (this spec)

- Replace 3 of 4 projects in etape 04 with non-finance equivalents, preserving the two underlying pedagogical shapes (year-in-review analytical report; multi-scenario interactive simulator).
- Update etape 04 hero meta block (artefact line currently references «отчёт куда деньги ушли»).
- Replace § II «Что нужно подготовить» data-prep blocks where they reference bank statements.
- Update etape 04 glossary entries that are finance-specific.
- Audit etape 04 quiz items and replace finance-only examples with domain-mixed ones (at least 4 of 7).
- Update `CLAUDE.md` doctrine line about the finance throughline to reflect that etape 04 is the pilot of domain diversification.

### Out of scope (this round, deferred)

- Etapes 02, 03, 05, 06, 06b, 07, 08a, 08b, 09, 10, 11 — keep as is. Most are already domain-mixed; etapes 02 and 03 retain the heaviest finance load but are not redesigned in this iteration.
- Capstone — four finance options retained for now. Future redesign may restructure.
- Design tutorial (`claude-design-*`) — unaffected.
- ComfyUI integration — separate planning thread for etapes 09 / 11 / capstone (see § 9 «Future iterations»).
- Cross-references from later etapes that name etape 04's old artefacts. Etape 11 mentions etape 04 by name but not by content shape; etape 06 references the etape 02 portfolio, not the etape 04 bank-statement report. No outbound link breakage expected.

## 3. Current state

Etape 04 in `course-site/etapes/etap-04.html` contains:

- **Hero § meta:** «Артефакт: отчёт куда ушли деньги и прогноз FI в трёх сценариях.»
- **§ II «Подготовка»:** four preconditions blocks; one is «Банковские выписки за 12 месяцев (для проекта A)» (~lines 138–148).
- **§ III «Проекты»:** four articles —
  - Project A (guided, analytical report): «Куда ушли деньги за год» — bank statement year-in-review → `report.md`.
  - Project B (guided, 3-scenario interactive simulator): «Прогноз финансовой независимости в трёх сценариях» — FI calculator with form + chart.js.
  - Project C (solo, 4-strategy interactive simulator): «Симулятор пенсии в четырёх стратегиях.»
  - Project D (solo, focused analytical deep-dive): «Глубокий анализ одной категории расходов.»
- **§ V Glossary:** terms include `spec.md`, `Plan Mode`, `TodoWrite`, `chart.js`, `verification` — these are technique terms and stay; no finance-specific glossary entries identified for removal beyond perhaps `категория расхода` (kept since Project D is kept).
- **§ VI Quiz:** 7 items; all currently use finance examples for context phrasing. They test technique, but the surface domain is uniformly finance.

## 4. Target state — the four projects

| # | Shape | Domain | New title (RU / EN) |
|---|-------|--------|---------------------|
| **A** guided | year-in-review analytical report | 🎵 Media library | «Год в звуках» / "Your year in sound" |
| **B** guided | 3-scenario interactive simulator | 📚 Reading | «Год чтения в трёх сценариях» / "Your reading year in three scenarios" |
| **C** solo | 4-strategy interactive simulator | 🌱 Habits & life | «Привычка через год — четыре стратегии» / "A habit one year out — four strategies" |
| **D** solo | focused analytical deep-dive | 💰 Personal finance | «Глубокий анализ одной категории расходов» / "Deep dive into one expense category" (unchanged) |

### Design principles preserved across the four

- Two guided, two solo (same ratio as before).
- Two analytical reports (A, D), two simulators (B, C) — same shape ratio as before.
- Single finance project, intentionally placed as solo (Project D), so finance-curious readers still have a path but it is no longer mandatory.
- Each domain is touched exactly once in etape 04.

## 5. Per-project specifications

### Project A — «Год в звуках» (guided, year-in-review report)

**Replaces:** «Куда ушли деньги за год.»

**Technique preserved.** spec.md → Plan Mode → TodoWrite → six phases → verification → markdown report. Identical pedagogical shape to the original Project A.

**Data source.** Spotify Extended Streaming History export (JSON, ~12 months of `endTime`, `artistName`, `trackName`, `msPlayed`, `platform`). Reader requests the export from Spotify Privacy Settings; export arrives by email **after ~4 weeks**. Fallback path: Project A's first prompt asks Claude to generate ~5 000 synthetic streaming events.

**Phases (named by deliverable):**

1. `parse JSON exports → data/all-plays.csv` (one row per stream)
2. `enrich → genre per track via Last.fm/MusicBrainz API or local LLM tagging`
3. `aggregate → totals per artist, per genre, per month, per platform`
4. `visualise → three charts (chart.js): top-artists bar, genre pie, monthly trend`
5. `insights → three surprising facts (e.g. "your most-played artist for 7 months in a row was X")`
6. `assemble report.md`

**Acceptance criteria.** `report.md` with five sections: total listening time, top-10 artists with share, three surprises, monthly trend, three "what to explore next year" pointers.

### Project B — «Год чтения в трёх сценариях» (guided, interactive simulator)

**Replaces:** «Прогноз финансовой независимости в трёх сценариях.»

**Technique preserved.** spec.md → Plan Mode → multi-phase web-app build → frontend-design polish → Playwright verification. Identical pedagogical shape.

**Inputs (form fields).**
- Minutes/day available for reading
- Pages/minute (default 2; user can override)
- Genre mix preference (% fiction / non-fiction / technical)
- Target start date
- Three scenarios (auto-populated, user can edit):
  - **Slow:** 15 min/day, 1.5 pages/min, no weekend boost
  - **Medium:** 30 min/day, 2 pages/min, +50 % weekend
  - **Ambitious:** 60 min/day, 2.5 pages/min, +100 % weekend

**Outputs.**
- A table «books finished by month» per scenario
- A combined chart with three reading-trajectory lines
- Three «critical dates» — when each scenario crosses the 12-book / 26-book / 52-book milestones
- A three-sentence summary

**Phases:** page skeleton → pure calc logic (console) → wire to form → chart (chart.js) → interpretation → UX polish via `frontend-design` + Playwright audit.

### Project C — «Привычка через год — четыре стратегии» (solo, simulator)

**Replaces:** «Симулятор пенсии в четырёх стратегиях.»

**Technique preserved.** 4-strategy interactive simulator with form + chart, same shape as the retirement simulator.

**Inputs.**
- Habit name (free text — sleep hours, daily steps, language-learning minutes, deep-work blocks, etc.)
- Current baseline (numeric, with unit)
- Target metric one year out
- Available time per day (minutes)
- Four strategies (user-editable):
  - **Лёгкий / Easy:** consistent 2 days/week
  - **Стабильный / Steady:** 5 days/week, no weekends
  - **Интенсивный / Intense:** 7 days/week, +10 % monthly intensity increase
  - **Экстрим / Extreme:** 7 days/week, +20 % monthly intensity increase, includes recovery weeks

**Outputs.** Four trajectory lines on one chart, four critical-date markers, three-sentence summary per strategy on hazards / sustainability.

### Project D — «Глубокий анализ одной категории расходов» (solo, deep-dive)

**Unchanged from current state.** Retained as the finance anchor for readers who want one finance project. Position moves from D-solo to D-solo (same slot, same shape).

## 6. Hero, § II, glossary, quiz changes

### Hero meta block (around lines 60–76)

Replace «Артефакт» dd:
- RU before: «отчёт куда ушли деньги и прогноз FI в трёх сценариях»
- RU after: «Spotify-отчёт + симулятор года чтения»
- EN before: «a "where the money went" report and a 3-scenario FI forecast»
- EN after: «a "year in sound" report + a reading-year simulator»

Also update Hero standfirst if it mentions finance specifically.

### § II «Что нужно подготовить» blocks (around lines 138–160)

- **Remove:** the «Банковские выписки за 12 месяцев» block.
- **Add (for Project A):** «Spotify Extended Streaming History» — instruction on how to request from Spotify Privacy Settings, 4-week-delay warning, fallback path (`ask Claude to generate ~5 000 synthetic stream events`).
- **Add (for Project B, optional):** «Goodreads CSV или своя книжная таблица» — a small book-history table is nice-to-have for personalisation but not blocking; Project B works on hypothetical inputs.
- **Add (for Project C, optional):** «Habit-tracker CSV или Notion export» — nice-to-have for grounding in real numbers; not blocking.

### § V Glossary

- **Add new terms:**
  - `streaming history` / `история прослушиваний` — Spotify's term for the export format.
  - `track metadata` / `метаданные трека` — artist, album, genre, ms played.
  - `pages per minute` / `страниц в минуту` — reading-pace metric.
- **Keep all existing technique-domain terms** (`spec.md`, `Plan Mode`, `TodoWrite`, `chart.js`, `verification`, `acceptance criteria`).
- **Audit existing finance terms** in the glossary and remove **only** those that no remaining project references:
  - `банковская выписка` — safe to remove (no project uses bank statements as data source).
  - `категория расхода` — **keep** (Project D is built around expense categories).
  - `доход − расход` — **keep if currently present** (still useful framing inside Project D).
  - Other finance entries — decide case by case in the implementation plan.

### § VI Quiz audit

Iterate every quiz item; for each that uses bank-statement examples to phrase a technique question, rewrite to use a streaming-export or reading-simulator example. Goal: at least 4 of 7 items reference non-finance examples; at most 2 of 7 may keep finance phrasing (since Project D remains finance).

## 7. CLAUDE.md doctrine update

Existing line in [CLAUDE.md](../../CLAUDE.md):

> The **investment-and-finance throughline** (compound interest → portfolio CSV → US Form 1040 capstone) is intentional in the **main course** — keep new examples on that thread.

Replacement:

> The main course had an investment-and-finance throughline (etapes 02, 03, 06, 08b, capstone), but **etape 04 is the pilot of domain diversification**: it splits into four domains (media library, reading, habits, finance). When adding new etapes or projects, do not blindly extend the finance throughline through etape 04 again — and consider whether other etapes should follow 04's diversification model. The design tutorial's four-track structure (café / apartment / indie game / finance) is the closer precedent for etape 04 onwards.

## 8. What stays untouched (regression checks)

- Etape 02's `data/operations.csv` — still exists, still referenced by etape 06.
- Etape 03's API/MCP teaching — unaffected.
- Etape 04's technique-side teaching (Plan Mode, TodoWrite, spec → execute → verify) — strictly preserved across all four new projects.
- Etape 06's «Инвестиционный кабинет» project — still references etape 02's CSV. No change to etape 06 needed.
- Capstone Option A («Полный SaaS из этапа 06») — still works because etape 06 is unchanged.
- Etape 11's reference to etape 04 — generic, not content-shape-dependent; no change required.
- Design tutorial — independent codepath, not affected.

## 9. Future iterations (deferred)

The following items are explicitly deferred to subsequent brainstorming sessions:

1. **Etape 02 / etape 03 redesign.** They retain the heaviest finance load. Whether to extend the four-domain model to them depends on whether etape 04 lands well with readers.
2. **ComfyUI track.** Marya expressed interest in ComfyUI development. The natural home is **etape 09 (MCP server wrapping ComfyUI)** and **etape 11 (Agent SDK driving ComfyUI)**, with optionally a 5th capstone variant. This is a separate brainstorm.
3. **Capstone restructure.** Currently four finance options; could grow to include a creative variant (especially after the ComfyUI track is added).
4. **Etape 04 prose-vs-prompt audit.** Some of the recent fixes (`feedback_spec_must_carry_phases.md`) need to be re-checked across the four new projects so that phase lists also appear inside spec prompts there. Implementation plan should include this.

## 10. Open questions (not blocking sign-off)

These can be resolved during implementation, but flag them now:

- **Spotify 4-week delay** is a real friction point. Implementation should foreground the synthetic-data fallback in Project A so readers can start immediately. Verify the prompt produces realistic-enough data (genres, monthly distribution, repeat-listen patterns).
- **Project C scenarios** are currently parametrised generically. Should we ship 2–3 «recipe» starter sets (sleep, language-learning, exercise) that the reader picks from, or leave it fully free-form? Recommendation: free-form with one worked example.
- **Quiz rewrite tone.** Whether to swap underlying examples surgically (keep question shapes, change context) or rewrite some items from scratch. Recommendation: surgical swap unless an item is genuinely broken.

---

After Marya signs off on this spec, the next step is invoking `superpowers:writing-plans` to produce a per-edit implementation plan that the implementation session can execute incrementally.
