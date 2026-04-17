# Altitude Pro — Restructure Design

**Date:** 2026-04-16
**Author:** maxbrustein (with Claude)
**Status:** Approved — ready for implementation plan

## Goal

Restructure Altitude Pro from a single 3,119-line / 441KB HTML file into an organized, data-driven project. Current pain points:

1. **Content maintenance** — ACS tasks and quiz questions are hand-written HTML/JS. Adding or editing content is tedious and error-prone.
2. **Growth readiness** — near-term roadmap (progress tracking → auth + cloud sync → content expansion) will not scale on the current structure.

Non-goals: redesigning the UI, changing the AeroForce visual identity, adding a framework, or changing how the app is deployed (Vercel auto-deploy from GitHub `main` stays).

## Decisions

| Decision | Choice | Alternatives considered |
|---|---|---|
| Tooling | Vite + vanilla JS modules | Pure zero-deps; framework (Svelte/Astro) |
| Content format | Hybrid: JSON for index/quiz, Markdown for task prose | Pure JSON; pure Markdown; HTML partials |
| Routing | Hash routes (`#/area/I/task/C`) | None; path routing via Vercel rewrites |
| Progress storage | localStorage now, Supabase-ready adapter | Direct Supabase from day one |
| Quiz progress shape | Aggregates only (not full answer history) | Full session records |
| Local quiz history cap | 50 sessions | Unlimited |
| Quiz → task mapping | `taskIds: []` on each question | Topic-only |

## Architecture

### Directory structure

```
altitude-pro/
├── index.html              # minimal shell: fonts, <div id="app">, <script type="module" src="/src/main.js">
├── package.json
├── vite.config.js
├── public/                 # favicon, og-image
├── src/
│   ├── main.js             # bootstrap: load manifest, init router + state, mount app
│   ├── router.js           # hash router
│   ├── state.js            # progress state + storage adapter
│   ├── content.js          # async loaders for manifest, tasks, quiz (with in-memory cache)
│   ├── markdown.js         # markdown-it + custom :::callout / :::mnemonic containers
│   ├── views/
│   │   ├── sidebar.js
│   │   ├── area.js
│   │   ├── task.js
│   │   ├── quiz.js
│   │   └── mobile-nav.js
│   └── styles/
│       ├── tokens.css      # colors, fonts, spacing vars
│       ├── base.css        # resets, typography
│       ├── layout.css      # sidebar, content pane, mobile breakpoints
│       ├── components.css  # sb-task, task-badge, callout, table, chips
│       └── quiz.css
└── content/
    └── certs/
        └── ppl/
            ├── manifest.json
            ├── tasks/
            │   ├── I-A.md … XII-D.md      # 40 files
            └── quiz/
                ├── regulations.json
                ├── weather.json
                ├── airspace.json
                ├── navigation.json
                ├── maneuvers.json
                ├── systems.json
                └── aeromedical.json
```

**Rationale:**
- `content/certs/ppl/` — cert type is top-level namespace. Adding IR/commercial later means `content/certs/ir/` with identical structure. No restructuring needed.
- CSS split by concern, not by component. Five focused files beats one 690-line file and also beats 20 micro-files.
- Views separated from state/router — views are pure-ish: take data, return DOM.
- Storage adapter seam in `state.js` from day one — the single most important choice for the auth/sync roadmap.

### Content schema

**`content/certs/ppl/manifest.json`** — drives sidebar and routing without parsing markdown:

```json
{
  "cert": "ppl",
  "title": "Private Pilot — ACS FAA-S-ACS-6C",
  "areas": [
    {
      "id": "I",
      "title": "Preflight Preparation",
      "tasks": [
        {
          "id": "I-A",
          "letter": "A",
          "title": "Pilot Qualifications",
          "references": ["14 CFR 61", "14 CFR 91", "AC 68-1"]
        }
      ]
    }
  ]
}
```

**`content/certs/ppl/tasks/I-A.md`** — minimal frontmatter + markdown with custom containers:

```markdown
---
id: I-A
title: Pilot Qualifications
---

Part 61 vs 141 comparison:

| Category | Part 61 | Part 141 |
|---|---|---|
| Hours required | 40 | 35 |

::: callout ✅
Must have current medical + student pilot certificate.
:::

::: mnemonic IMSAFE
Illness · Medication · Stress · Alcohol · Fatigue · Eating/Emotion
:::
```

Custom containers (`:::callout`, `:::mnemonic`, `:::formula` as needed) are `markdown-it-container` plugins — each is a few lines, each maps to existing CSS classes (`.callout`, `.mnemonic`) so rendered output matches today's look.

**`content/certs/ppl/quiz/regulations.json`** — questions are inherently structured:

```json
{
  "topic": "regulations",
  "title": "Regulations",
  "questions": [
    {
      "id": "reg-001",
      "taskIds": ["I-E"],
      "difficulty": 2,
      "q": "What is the minimum visibility for VFR in Class E below 10,000 MSL?",
      "choices": ["1 SM", "3 SM", "5 SM", "10 SM"],
      "answer": 1,
      "explanation": "14 CFR 91.155 requires 3 SM visibility for VFR in Class E below 10,000 MSL.",
      "ref": "14 CFR 91.155"
    }
  ]
}
```

`taskIds` is an array because some questions test concepts spanning multiple ACS tasks. Enables "quiz me on just Task I-C" filtering and per-task mastery tracking later.

### Module contracts

- **`router.js`** — `init()`, `navigate(path)`, emits route-change events. Knows nothing about content.
- **`state.js`** — `get()`, `set(patch)`, `subscribe(fn)`, `tasks.markViewed(id)`, `quiz.startSession(...)`, `quiz.recordAnswer(...)`, `quiz.endSession(id)`. Storage behind an adapter interface (`persist(state) → Promise`, `load() → Promise<state>`). `localStorageAdapter` ships now; `supabaseAdapter` can swap in later with identical interface.
- **`content.js`** — `loadManifest(cert)`, `loadTask(cert, id)`, `loadQuiz(cert, topic)`. All return Promises. In-memory Map cache; re-visits are instant.
- **`markdown.js`** — `render(mdText) → htmlString`. Configured once at boot with container plugins.
- **`views/*`** — each exports `render(ctx) → HTMLElement` or `mount(root, ctx)`. No direct state reads outside `ctx`.

### Data flow — viewing a task

```
URL hash change → router.parse() → { view: "task", cert: "ppl", taskId: "I-C" }
                      ↓
                content.loadTask("ppl", "I-C")   // fetch I-C.md, cached
                      ↓
                markdown.render(mdText)          // markdown-it + containers
                      ↓
                views.task.render({ meta, html, progress })
                      ↓
                mount into #app; state.tasks.markViewed("I-C"); sidebar re-highlights
```

### Progress state shape

```js
// localStorage key: "altitudepro:progress"
{
  version: 1,                          // bump on breaking schema change
  updatedAt: "2026-04-16T22:14:00Z",

  tasks: {
    "I-A": { viewed: true, viewedAt: "2026-04-15T..." }
  },

  quiz: {
    recent: [                          // capped at 50
      {
        id: "sess-01HN...",            // ULID
        endedAt: "...",
        topic: "regulations",
        taskFilter: null,              // or ["I-C"]
        length: 20,
        score: { correct: 17, total: 20 }
      }
    ],
    byTopic: {
      "regulations": { attempted: 40, correct: 32 }
    },
    byQuestion: {                      // enables "retry wrong ones"
      "reg-001": { attempts: 3, correct: 2, lastCorrect: true }
    }
  }
}
```

**Design notes:**
- `version: 1` — `state.js` reads on load; if shape changes, run migration function.
- `tasks` keyed by taskId (flat), not nested under area. Easier to update and merge. Area membership comes from manifest.
- Quiz session records are summaries (score + metadata), not per-answer history. Aggregates only.
- `byQuestion` is a derived index updated on every answer — enables "retry wrong ones" without full session history.
- No user identity in local shape. When Supabase lands, `user_id` lives on the row, not in the blob.
- Writes to the adapter debounced ~200ms to avoid thrashing localStorage during rapid quiz answers.

## Build & deploy

**Dependencies:**
- `vite` — build tool
- `markdown-it` — markdown parser (~30KB)
- `markdown-it-container` — custom block containers

**Vite config highlights:**
- `import.meta.glob('/content/certs/ppl/tasks/*.md', { as: 'raw' })` bundles all 40 task markdown files into the build as string imports. No per-task network roundtrip in production.
- JSON imports are native.

**`package.json` scripts:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

**Vercel:** zero-config. Vercel auto-detects Vite (`npm run build` → serves `dist/`). Existing GitHub auto-deploy continues to work. No `vercel.json` needed.

**Expected size:** ~80KB gzipped shipped JS, content in separately chunked bundles. Significant improvement over current 441KB single HTML.

## Migration plan

Guiding principle: **never break `main`.** Each phase ends with a working, deployed app. No long-running rewrite branch.

### Phase 0 — Scaffold
Create new Vite project structure. Get a minimal `index.html` + `main.js` deploying to a Vercel preview URL. Confirm end-to-end deploy still works.

### Phase 1 — CSS split
Move the current 690-line `<style>` block into `src/styles/` split by concern (tokens, base, layout, components, quiz). No logic changes. Visually diff against v10 screenshots to confirm no drift.

### Phase 2 — JS modules (shell only)
Port current JS into `router.js`, `state.js` stub, `views/sidebar.js`, `views/quiz.js`, `views/mobile-nav.js`. Content still renders from inline HTML. App should behave identically to v10.

### Phase 3 — Extract manifest + quiz JSON
- Write `manifest.json` from the area/task structure in v10.html (11 areas, 40 tasks).
- Extract 352 quiz questions from the JS array into 7 topic files.
- Add `taskIds` on each question (this step takes care per-question).
- Sidebar + quiz now fully data-driven.

### Phase 4 — Extract ACS content to markdown
The largest phase. 40 markdown files, one per task.
- Write a one-shot extraction script: parse each `<section data-task-val="...">`, convert tables/callouts/mnemonics to markdown + custom containers, write `I-A.md` through `XII-D.md`.
- Spot-check at least 5 tasks spanning multiple areas and content types (Area I-C Weather for tables, I-H Human Factors for mnemonics, VII/VIII for lighter prose) render identically; iterate on the script until all 40 pass.
- Fall back to manual conversion for any tasks the script can't handle cleanly.

### Phase 5 — Hash routing
Wire `hashchange` → router → view. URLs like `#/area/I/task/C` work. Sidebar clicks update the hash rather than calling view functions directly.

### Phase 6 — Progress tracking
Add `state.js` with localStorage adapter. Mark tasks viewed on navigation. Record quiz results as aggregates. Light UI pass: checkmarks in sidebar for viewed tasks, show last quiz score.

### Phase 7 — Ship
Switch `altitude-pro.vercel.app` to the new build. Keep `v10.html` archived at `/archive/v10.html` until the new version is proven stable.

### Effort estimate
- Phases 0–2: one afternoon
- Phase 3: ~2 hours
- Phase 4: half a day (best case, script works well) to a full day (if per-task hand-review needed)
- Phases 5–7: small

### Sequencing recommendation
Do not start Phase 4 until Phases 0–3 are merged and live. If Phase 4 hits trouble, the app still works and is not blocked.

## Open questions for implementation

- Exact extraction script approach for Phase 4 (AST parsing vs regex vs AI-assisted) — decide during Phase 3 when the HTML structure is fully understood.
- Whether to add a small test for the markdown renderer (verify `:::callout` → `.callout` HTML). Recommended but not required to start.

## Out of scope

- Supabase integration (deferred to Post-Shape feature B)
- Instrument/commercial ACS content (deferred to Post-Shape feature C)
- Spaced repetition / smart review (deferred — schema supports it via `byQuestion`)
- Accessibility audit (worth its own spec later)
- Offline/PWA (worth its own spec later)
