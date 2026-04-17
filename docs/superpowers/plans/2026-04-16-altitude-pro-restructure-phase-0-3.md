# Altitude Pro Restructure — Phases 0–3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Altitude Pro from a single 3,119-line HTML file to a Vite-based project with split CSS, modular JS, a JSON manifest driving the sidebar, and quiz questions in topic JSON files. At the end, the app behaves identically to today but is data-driven for sidebar/quiz. Task body content remains inline HTML until Phase 4.

**Architecture:** Vite + vanilla JS ES modules. No framework. `src/main.js` bootstraps router/state stubs and mounts views. `content/certs/ppl/manifest.json` drives the sidebar. `content/certs/ppl/quiz/*.json` drives the quiz. Task body content stays embedded in `index.html` during Phases 0–3; Phase 4 extracts it to markdown.

**Tech Stack:** Vite, vanilla JS, Vitest (tests), deployed via Vercel auto-deploy from GitHub `main`.

**Scope note:** This plan covers Phases 0–3 of the 7-phase migration defined in `docs/superpowers/specs/2026-04-16-altitude-pro-restructure-design.md`. Phase 4 (markdown extraction), Phase 5 (hash routing), Phase 6 (progress tracking), and Phase 7 (ship switch) will each be planned separately after Phase 3 is complete and deployed.

---

## Phase 0 — Scaffold

**Goal:** A minimal Vite project deploying to Vercel preview, with v10.html archived. No functional regression — the live app is still v10 until Phase 7.

### Task 0.1: Archive v10.html and create project skeleton

**Files:**
- Create: `/Users/maxbrustein/Documents/Altitude Pro/archive/altitude-pro-v10.html` (move v10 here)
- Create: `/Users/maxbrustein/Documents/Altitude Pro/.gitignore`
- Create: `/Users/maxbrustein/Documents/Altitude Pro/README.md`

- [ ] **Step 1: Archive v10.html**

```bash
cd "/Users/maxbrustein/Documents/Altitude Pro"
mkdir -p archive
mv "altitude-pro v10.html" archive/altitude-pro-v10.html
```

- [ ] **Step 2: Create .gitignore**

Create `.gitignore`:

```
node_modules/
dist/
.DS_Store
.vercel/
.env
.env.local
*.log
.vite/
```

- [ ] **Step 3: Create minimal README.md**

```markdown
# Altitude Pro

Private pilot checkride study app — single-page web app covering ACS FAA-S-ACS-6C.

## Dev

```bash
npm install
npm run dev        # start Vite dev server
npm run build      # production build → dist/
npm run preview    # preview production build
npm run test       # run Vitest
```

## Structure

- `src/` — app code (entry, router, state, views, styles)
- `content/certs/ppl/` — ACS content (manifest, task markdown, quiz JSON)
- `archive/` — legacy single-file version

Deployed via Vercel auto-deploy from `main`: https://altitude-pro.vercel.app
```

- [ ] **Step 4: Commit**

(Skip commit — repo is initialized in Task 0.5 after files exist.)

---

### Task 0.2: Initialize Vite project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "altitude-pro",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: true },
});
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` created.

---

### Task 0.3: Create minimal index.html shell

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Altitude Pro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

### Task 0.4: Create src/main.js entry + verify dev server

**Files:**
- Create: `src/main.js`

- [ ] **Step 1: Write placeholder main.js**

```js
import './styles/tokens.css';

const app = document.getElementById('app');
app.innerHTML = `
  <div style="padding:24px;color:#9DD968;font-family:Outfit,sans-serif;">
    <h1>Altitude Pro — scaffold running</h1>
    <p>Vite dev server is working. Next phase: CSS split.</p>
  </div>
`;
```

- [ ] **Step 2: Create placeholder tokens.css to keep import resolving**

Create `src/styles/tokens.css`:

```css
/* tokens — will be populated in Phase 1 */
:root {
  --void: #080B07;
  --glow: #9DD968;
}
body { background: var(--void); color: #fff; margin: 0; }
```

- [ ] **Step 3: Run dev server**

```bash
npm run dev
```

Expected: server starts on `http://localhost:5173`. Open it; you see "Altitude Pro — scaffold running" on a dark background.

- [ ] **Step 4: Stop dev server**

Ctrl-C.

---

### Task 0.5: Git init, connect remote, first commit

**Files:**
- Create: `.git/` (via `git init`)

- [ ] **Step 1: Initialize git**

```bash
cd "/Users/maxbrustein/Documents/Altitude Pro"
git init
git branch -M main
```

- [ ] **Step 2: Connect remote**

```bash
git remote add origin https://github.com/maxbrustein/altitude-pro.git
```

- [ ] **Step 3: Stage and commit scaffold**

```bash
git add .gitignore README.md package.json package-lock.json vite.config.js index.html src archive
git commit -m "chore: scaffold Vite project, archive v10"
```

- [ ] **Step 4: Push (confirm with user before running)**

**ASK USER FIRST:** "Ready to push to `maxbrustein/altitude-pro`? This will be the first commit on the remote."

If yes:

```bash
git push -u origin main
```

Expected: Vercel auto-deploy triggers. Preview URL appears in GitHub repo's Deployments tab within ~1 minute.

- [ ] **Step 5: Verify Vercel deploy**

Open `https://altitude-pro.vercel.app` (or the preview URL from Vercel dashboard). You should see "Altitude Pro — scaffold running."

If Vercel doesn't auto-detect Vite, the dashboard's Build Settings need:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

---

## Phase 1 — CSS Split

**Goal:** Move all 690 lines of CSS from `archive/altitude-pro-v10.html` into `src/styles/`, split by concern. No visual changes. The app page still says "scaffold running" — CSS rules exist but most have nothing to apply to yet. Visual verification happens in Phase 2 when HTML is ported.

### Task 1.1: Extract and categorize CSS

**Files:**
- Modify: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Create: `src/styles/quiz.css`
- Modify: `src/main.js`

- [ ] **Step 1: Open v10 CSS reference**

Open `archive/altitude-pro-v10.html` lines 7–696 (the `<style>` block) as the source of truth.

- [ ] **Step 2: Populate tokens.css**

Move into `src/styles/tokens.css`:
- `@import url('https://fonts.googleapis.com/css2?...')` — keep in HTML (already there), remove from CSS
- All `:root { --void:...; --glow:...; }` custom property definitions
- Any `@font-face` declarations if present

Target size: ~30–50 lines. Contains ONLY variable declarations.

- [ ] **Step 3: Populate base.css**

Move into `src/styles/base.css`:
- `*`, `*::before`, `*::after` resets
- `html`, `body`, `#app` base styles
- Global typography (`h1`–`h6`, `p`, `a`, `table`, `th`, `td`, `strong`, `code`)
- Generic utility rules with no component prefix

Target size: ~80–120 lines.

- [ ] **Step 4: Populate layout.css**

Move into `src/styles/layout.css`:
- `header`, `.logo`, `.logo-name`, `.nav-tabs`, `.nav-tab`
- `.main`, `.sidebar`, `.content`
- `.breadcrumb`, `.bc-select`, `.bc-label`, `.bc-val`, `.bc-arrow`, `.bc-sep`
- `.bottom-nav`, `.overlay`, `.sheet`, `.sheet-*` (mobile bottom sheet)
- All `@media (max-width: ...)` rules for responsive layout

Target size: ~200–250 lines.

- [ ] **Step 5: Populate components.css**

Move into `src/styles/components.css`:
- `.sb-area`, `.sb-head`, `.sb-tasks`, `.sb-task`, `.sb-task.active` (sidebar list items)
- `.study-area`, `.area-banner`, `.area-eyebrow`, `.area-title`, `.area-refs`
- `.task-section`, `.task-hdr`, `.task-badge`, `.task-title`, `.task-anchor`
- `.subsec-lbl`, `.src-tag`, `.far`
- `.fact-grid`, `.fact-card`, `.fact-card.hi`, `.fact-card.warn`, `.fact-title`, `.fact-body`, `.fact-ref`
- `.hl`, `.hl-r`, `.callout`, `.mnemonic` (inline/callout content styling)

Target size: ~200–250 lines.

- [ ] **Step 6: Populate quiz.css**

Move into `src/styles/quiz.css`:
- `.quiz-setup`, `.quiz-*`, `.chip`, `.chip.active`
- `.q-card`, `.q-choice`, `.q-choice.correct`, `.q-choice.wrong`
- `.q-progress`, `.q-result`, `.q-grade`, `.q-diff-dot`

Target size: ~80–120 lines.

- [ ] **Step 7: Import all stylesheets from main.js**

Replace `src/main.js` imports section:

```js
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

const app = document.getElementById('app');
app.innerHTML = `
  <div style="padding:24px;color:var(--glow);font-family:Outfit,sans-serif;">
    <h1>Altitude Pro — CSS split complete</h1>
  </div>
`;
```

- [ ] **Step 8: Run dev server**

```bash
npm run dev
```

Expected: page loads without CSS errors in the console. You see "Altitude Pro — CSS split complete" — styling is minimal because HTML is minimal, but no errors.

- [ ] **Step 9: Verify no CSS was lost**

Compare total line count of your 5 new files against the v10 `<style>` block (~690 lines). The sum should be close (within 10%) — small drift from formatting is OK, large drift (>50 lines missing) means something was skipped.

```bash
wc -l src/styles/*.css
```

- [ ] **Step 10: Commit**

```bash
git add src/styles src/main.js
git commit -m "refactor(css): split monolithic CSS into tokens/base/layout/components/quiz"
```

---

## Phase 2 — JS Modules (Shell Only)

**Goal:** Port the current inline JS (~575 lines) into ES modules while keeping the body HTML unchanged (all task content still inline in `index.html`). At the end of this phase, the app behaves *identically to v10* — you can click through areas, scroll tasks, take quizzes, use mobile nav. The difference: JS is now in focused modules.

**Approach:** Copy the v10 `<body>` into `index.html` wholesale (replacing the placeholder `<div id="app">`), then port the v10 `<script>` content into modules that re-attach behavior on boot.

### Task 2.1: Port v10 body HTML into index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Copy v10 body into index.html**

Replace the current `<body>…</body>` in `index.html` with the full body from `archive/altitude-pro-v10.html` (lines 698–2542 — the entire body *except* the `<script>` block). Keep the `<head>` as-is in `index.html`. After the body content, keep `<script type="module" src="/src/main.js"></script>` as the last line before `</body>`.

- [ ] **Step 2: Replace inline onclick handlers with data attributes**

Inline JS handlers (e.g., `onclick="switchMode('study')"`) won't reach global scope once JS is moduled. Do a find-and-replace pass on `index.html`:

| Find | Replace |
|---|---|
| `onclick="switchMode('study')"` | `data-action="mode" data-mode="study"` |
| `onclick="switchMode('quiz')"` | `data-action="mode" data-mode="quiz"` |
| `onclick="openSheet('section')"` | `data-action="sheet" data-sheet="section"` |
| `onclick="openSheet('task')"` | `data-action="sheet" data-sheet="task"` |
| `onclick="if(event.target===this)closeSheet()"` | `data-action="sheet-overlay"` |

Any other `onclick=` attributes get the same treatment — convert to `data-action=` with a descriptive value. Record each unique action you see; they become cases in a central click dispatcher in `main.js`.

- [ ] **Step 3: Run dev server**

```bash
npm run dev
```

Expected: page renders the full v10 layout and content, but nothing is interactive yet (no JS is wiring up the buttons). Sidebar empty, bottom nav empty — those were built by JS that hasn't been ported yet.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "refactor: move v10 body HTML into index.html, convert inline handlers to data attributes"
```

---

### Task 2.2: Port sidebar builder

**Files:**
- Create: `src/views/sidebar.js`

Reference: `buildSidebar()` function in v10 JS (line 2543+). It builds a list of areas and their tasks from a hardcoded array.

- [ ] **Step 1: Create src/views/sidebar.js**

```js
// src/views/sidebar.js
// Phase 2: uses hardcoded area/task data (same as v10).
// Phase 3 will swap this to read from manifest.json.

const AREAS = [
  // COPY THE `areas` / `sections` array from v10 JS VERBATIM.
  // It's a list like:
  //   { id:'a1', label:'I · PREFLIGHT PREP', tasks:[{id:'ia', label:'A · PILOT QUALS'}, ...] }
  // Paste the full array here.
];

let curTaskId = null;
const openSections = new Set(['a1']); // first area open by default

export function initSidebar(root) {
  buildSidebar(root);
  root.addEventListener('click', handleClick);
}

function buildSidebar(root) {
  root.innerHTML = AREAS.map(area => {
    const isOpen = openSections.has(area.id);
    const tasksHtml = isOpen ? area.tasks.map(t => `
      <div class="sb-task ${t.id === curTaskId ? 'active' : ''}" data-task-id="${t.id}" data-area-id="${area.id}">
        ${t.label}
      </div>
    `).join('') : '';
    return `
      <div class="sb-area ${isOpen ? 'open' : ''}">
        <div class="sb-head" data-area-id="${area.id}">${area.label}</div>
        <div class="sb-tasks">${tasksHtml}</div>
      </div>
    `;
  }).join('');
}

function handleClick(e) {
  const head = e.target.closest('.sb-head');
  if (head) {
    toggleArea(head.dataset.areaId, e.currentTarget);
    return;
  }
  const task = e.target.closest('.sb-task');
  if (task) {
    goToTask(task.dataset.areaId, task.dataset.taskId, e.currentTarget);
  }
}

function toggleArea(areaId, root) {
  if (openSections.has(areaId)) openSections.delete(areaId);
  else openSections.add(areaId);
  buildSidebar(root);
}

function goToTask(areaId, taskId, root) {
  curTaskId = taskId;
  openSections.add(areaId);
  buildSidebar(root);
  // scroll target into view
  const el = document.getElementById(`t-${taskId}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

- [ ] **Step 2: Copy the AREAS constant from v10**

Open `archive/altitude-pro-v10.html`, find the area/sections data structure (search for `buildSidebar` or `sections = [`), copy the array verbatim into the `AREAS` const at the top of `sidebar.js`.

- [ ] **Step 3: Wire into main.js**

Update `src/main.js`:

```js
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

import { initSidebar } from './views/sidebar.js';

const sidebarRoot = document.getElementById('sidebar');
if (sidebarRoot) initSidebar(sidebarRoot);
```

- [ ] **Step 4: Verify in dev server**

```bash
npm run dev
```

Expected: sidebar renders with all 11 areas. Clicking an area header toggles it open/closed. Clicking a task scrolls the content pane to that task.

- [ ] **Step 5: Commit**

```bash
git add src/views/sidebar.js src/main.js
git commit -m "refactor: extract sidebar builder into src/views/sidebar.js"
```

---

### Task 2.3: Port mode switcher + content area navigation

**Files:**
- Create: `src/views/mode-switch.js`
- Modify: `src/main.js`

Reference: `switchMode()` function in v10 JS.

- [ ] **Step 1: Create src/views/mode-switch.js**

```js
// src/views/mode-switch.js
// Switches between Study Guide and Quiz modes at the top-level.

export function initModeSwitch() {
  document.addEventListener('click', handleClick);
  applyMode('study');
}

function handleClick(e) {
  const btn = e.target.closest('[data-action="mode"]');
  if (!btn) return;
  applyMode(btn.dataset.mode);
}

function applyMode(mode) {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  const content = document.querySelector('.content');
  const quiz = document.querySelector('.quiz-setup, #quiz-page');
  if (mode === 'study') {
    if (content) content.style.display = '';
    if (quiz) quiz.style.display = 'none';
  } else {
    if (content) content.style.display = 'none';
    if (quiz) quiz.style.display = '';
  }
}
```

Note: exact selectors depend on what the v10 HTML uses for the quiz container. Inspect the copied body in `index.html` to confirm the quiz container's id/class, and adjust the selectors accordingly.

- [ ] **Step 2: Wire into main.js**

```js
import { initModeSwitch } from './views/mode-switch.js';
// ...
initModeSwitch();
```

- [ ] **Step 3: Verify in dev server**

Clicking "Study Guide" / "Quiz" in the header toggles between the two views.

- [ ] **Step 4: Commit**

```bash
git add src/views/mode-switch.js src/main.js
git commit -m "refactor: extract mode switcher into src/views/mode-switch.js"
```

---

### Task 2.4: Port mobile navigation (breadcrumb + bottom sheet + bottom nav)

**Files:**
- Create: `src/views/mobile-nav.js`
- Modify: `src/main.js`

Reference: v10 functions `openSheet`, `closeSheet`, `buildBnavMobile`, `activateSection`, and the scroll listener on `.content` that updates the breadcrumb.

- [ ] **Step 1: Create src/views/mobile-nav.js**

```js
// src/views/mobile-nav.js
// Breadcrumb + bottom sheet picker + bottom nav for mobile.

import { AREAS } from './sidebar-data.js'; // see note below

let activeAreaId = 'a1';
let activeTaskId = 'ia';

export function initMobileNav() {
  buildBottomNav();
  document.addEventListener('click', handleClick);
  const content = document.querySelector('.content');
  if (content) content.addEventListener('scroll', updateBreadcrumbFromScroll);
  activateSection(activeAreaId);
}

function buildBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  nav.innerHTML = `
    <button data-action="mode" data-mode="study" class="active">Study</button>
    <button data-action="mode" data-mode="quiz">Quiz</button>
  `;
}

function handleClick(e) {
  const sheetBtn = e.target.closest('[data-action="sheet"]');
  if (sheetBtn) { openSheet(sheetBtn.dataset.sheet); return; }
  const overlay = e.target.closest('[data-action="sheet-overlay"]');
  if (overlay && e.target === overlay) { closeSheet(); return; }
  const pick = e.target.closest('.sheet-item');
  if (pick) { handlePick(pick.dataset.type, pick.dataset.value); }
}

function openSheet(type) {
  const overlay = document.getElementById('sheet-overlay');
  if (!overlay) return;
  const items = type === 'section'
    ? AREAS.map(a => `<div class="sheet-item" data-type="section" data-value="${a.id}">${a.label}</div>`).join('')
    : (AREAS.find(a => a.id === activeAreaId)?.tasks || []).map(t => `<div class="sheet-item" data-type="task" data-value="${t.id}">${t.label}</div>`).join('');
  overlay.innerHTML = `<div class="sheet">${items}</div>`;
  overlay.classList.add('open');
}

function closeSheet() {
  const overlay = document.getElementById('sheet-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.innerHTML = '';
}

function handlePick(type, value) {
  if (type === 'section') {
    activeAreaId = value;
    activateSection(value);
  } else {
    activeTaskId = value;
    const el = document.getElementById(`t-${value}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  updateBreadcrumb();
  closeSheet();
}

function activateSection(areaId) {
  document.querySelectorAll('.study-area').forEach(el => {
    el.classList.toggle('active', el.id === `pg-${areaId}`);
  });
  const content = document.querySelector('.content');
  if (content) content.scrollTop = 0;
}

function updateBreadcrumb() {
  const area = AREAS.find(a => a.id === activeAreaId);
  const task = area?.tasks.find(t => t.id === activeTaskId);
  const secVal = document.getElementById('bc-section-val');
  const taskVal = document.getElementById('bc-task-val');
  if (secVal && area) secVal.textContent = area.label;
  if (taskVal && task) taskVal.textContent = task.label;
}

function updateBreadcrumbFromScroll() {
  const tasks = document.querySelectorAll(`#pg-${activeAreaId} .task-anchor`);
  const vh = window.innerHeight;
  let current = null;
  for (const t of tasks) {
    const rect = t.getBoundingClientRect();
    if (rect.top < vh * 0.45) current = t;
    else break;
  }
  if (current) {
    const id = current.id.replace(/^t-/, '');
    if (id !== activeTaskId) {
      activeTaskId = id;
      updateBreadcrumb();
    }
  }
}
```

- [ ] **Step 2: Share area data**

The mobile nav and sidebar both need the AREAS list. Extract it from `sidebar.js` into a shared module:

Create `src/views/sidebar-data.js`:

```js
// Temporary hardcoded data — replaced by manifest.json in Phase 3.
export const AREAS = [
  // MOVE the AREAS const from src/views/sidebar.js HERE verbatim.
];
```

Then in `src/views/sidebar.js`:

```js
import { AREAS } from './sidebar-data.js';
// delete the local AREAS const; keep everything else
```

- [ ] **Step 3: Wire into main.js**

```js
import { initMobileNav } from './views/mobile-nav.js';
// ...
initMobileNav();
```

- [ ] **Step 4: Verify in dev server**

- Desktop: resize to narrow width (< 900px). Breadcrumb appears at top. Tap SECTION → bottom sheet opens with area list. Tap an area → sheet closes, content switches to that area. Tap TASK → sheet opens with task list for current area. Scroll the content — breadcrumb's TASK label updates to match the visible task.
- Verify bottom-nav has "Study" / "Quiz" buttons that still switch modes.

- [ ] **Step 5: Commit**

```bash
git add src/views/mobile-nav.js src/views/sidebar-data.js src/views/sidebar.js src/main.js
git commit -m "refactor: extract mobile nav into src/views/mobile-nav.js"
```

---

### Task 2.5: Port quiz engine

**Files:**
- Create: `src/views/quiz.js`
- Modify: `src/main.js`

Reference: in v10 JS, the quiz engine is the large block defining `questions = [...]`, `quizState`, `startQuiz`, `renderQuestion`, `handleAnswer`, `endQuiz`, etc.

- [ ] **Step 1: Create src/views/quiz.js**

```js
// src/views/quiz.js
// Phase 2: still uses the hardcoded questions array from v10.
// Phase 3 will swap this to load from content/certs/ppl/quiz/*.json.

const QUESTIONS = [
  // COPY the full `questions = [...]` array from v10 JS VERBATIM here.
];

const TOPICS = [
  // COPY the topic definitions (ids, labels, counts) from v10 JS if present,
  // or derive from the questions array.
];

let quizState = null;

export function initQuiz(root) {
  renderSetup(root);
  root.addEventListener('click', handleClick);
}

function renderSetup(root) {
  // PASTE the quiz setup HTML-building logic from v10, adapted to template literals.
  // Produce: length chips (10/20/30/50/75/100/All), topic chips with counts, a Start button.
}

function handleClick(e) {
  const lenChip = e.target.closest('[data-quiz-length]');
  if (lenChip) { /* toggle length selection */ return; }
  const topicChip = e.target.closest('[data-quiz-topic]');
  if (topicChip) { /* toggle topic selection */ return; }
  const startBtn = e.target.closest('[data-action="quiz-start"]');
  if (startBtn) { startQuiz(); return; }
  const choice = e.target.closest('.q-choice');
  if (choice && !quizState?.answered) { selectAnswer(Number(choice.dataset.idx)); return; }
  const nextBtn = e.target.closest('[data-action="quiz-next"]');
  if (nextBtn) { nextQuestion(); return; }
}

// Port startQuiz, renderQuestion, selectAnswer, nextQuestion, renderResult
// from v10 verbatim, adjusting DOM queries as needed.
```

- [ ] **Step 2: Copy QUESTIONS and TOPICS verbatim**

From v10 JS, locate the questions array (search for `questions = [` or `Q1:` or `topic:`). Copy the full array into `QUESTIONS` at the top of `quiz.js`. Do the same for the topics list if defined separately.

- [ ] **Step 3: Port internal quiz functions**

Port these v10 functions into `quiz.js` private functions. Behavior must match exactly:
- `startQuiz()` — filters questions by selected topics, sorts by difficulty, picks N, initializes `quizState`.
- `renderQuestion()` — renders the question card HTML with progress bar, difficulty dot, question text, four choices.
- `selectAnswer(idx)` — marks correct/wrong, updates difficulty (3 correct → +1, 1 wrong → −1), shows explanation.
- `nextQuestion()` — advances the cursor, either renders next question or calls `renderResult()`.
- `renderResult()` — shows score, letter grade, correct/wrong breakdown.

- [ ] **Step 4: Wire into main.js**

```js
import { initQuiz } from './views/quiz.js';
// ...
const quizRoot = document.querySelector('.quiz-setup') || document.getElementById('quiz-page');
if (quizRoot) initQuiz(quizRoot);
```

- [ ] **Step 5: Verify in dev server**

- Switch to Quiz mode.
- Pick length 10, pick one topic. Click Start.
- Answer through all 10 questions. Verify correct/wrong styling (green/red), explanation, difficulty indicator adjusts, final result screen shows.
- Behavior must match v10 exactly.

- [ ] **Step 6: Commit**

```bash
git add src/views/quiz.js src/main.js
git commit -m "refactor: extract quiz engine into src/views/quiz.js"
```

---

### Task 2.6: End-to-end verification of Phase 2

- [ ] **Step 1: Full parity check**

Run the app and verify **every** behavior matches v10:

- [ ] Header logo renders correctly
- [ ] Study Guide / Quiz mode switch works (desktop + mobile)
- [ ] Sidebar shows 11 areas, clicking headers toggles expand/collapse
- [ ] Sidebar task clicks scroll content into view and highlight active task
- [ ] Desktop area banner + all fact cards render in original styling
- [ ] Mobile: breadcrumb updates on scroll
- [ ] Mobile: bottom sheet opens for section/task pickers
- [ ] Mobile: bottom nav Study/Quiz switch works
- [ ] Quiz: setup panel (length + topics), start, answer, result — all work
- [ ] Adaptive difficulty: run a quiz with 3 correct in a row, verify difficulty increments (check the dot indicator on questions)
- [ ] No console errors or 404s in browser DevTools

- [ ] **Step 2: Production build check**

```bash
npm run build
npm run preview
```

Open the preview URL. Run the parity check again on the production build. It must pass identically.

- [ ] **Step 3: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: Phase 2 parity regressions"
```

(Skip if no fixes needed.)

---

## Phase 3 — Data-Driven Sidebar and Quiz

**Goal:** Replace the hardcoded `AREAS` and `QUESTIONS` arrays with JSON files under `content/certs/ppl/`. Sidebar reads `manifest.json`. Quiz reads 7 topic JSON files. Task body content stays inline HTML (Phase 4's job). Add Vitest and write real unit tests for the content-loading module.

### Task 3.1: Set up Vitest

**Files:**
- Create: `vitest.config.js`
- Create: `tests/setup.js`

- [ ] **Step 1: Add Vitest config**

Create `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
});
```

- [ ] **Step 2: Install jsdom**

```bash
npm install --save-dev jsdom
```

- [ ] **Step 3: Create empty setup file**

Create `tests/setup.js`:

```js
// Extend here if needed (e.g. global mocks)
```

- [ ] **Step 4: Verify Vitest runs**

```bash
npm run test -- --run
```

Expected: "No test files found" — that's fine, it means Vitest is configured.

---

### Task 3.2: Write failing tests for content.loadManifest

**Files:**
- Create: `tests/content.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/content.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('content.loadManifest', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns the manifest object for ppl', async () => {
    const { loadManifest } = await import('../src/content.js');
    const manifest = await loadManifest('ppl');
    expect(manifest.cert).toBe('ppl');
    expect(manifest.areas).toBeInstanceOf(Array);
    expect(manifest.areas.length).toBe(11);
  });

  it('every task has id, letter, title, and references', async () => {
    const { loadManifest } = await import('../src/content.js');
    const manifest = await loadManifest('ppl');
    const allTasks = manifest.areas.flatMap(a => a.tasks);
    expect(allTasks.length).toBe(40);
    for (const task of allTasks) {
      expect(task.id).toMatch(/^[IVX]+-[A-Z]$/);
      expect(task.letter).toMatch(/^[A-Z]$/);
      expect(task.title).toBeTruthy();
      expect(task.references).toBeInstanceOf(Array);
    }
  });

  it('caches the manifest (second call returns identical object)', async () => {
    const { loadManifest } = await import('../src/content.js');
    const first = await loadManifest('ppl');
    const second = await loadManifest('ppl');
    expect(second).toBe(first); // same reference
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
npm run test -- --run
```

Expected: FAIL with "Cannot find module '../src/content.js'" or similar.

---

### Task 3.3: Create manifest.json

**Files:**
- Create: `content/certs/ppl/manifest.json`

- [ ] **Step 1: Build manifest.json from v10 data**

Using the v10 HTML's area/task structure as the source of truth, build the manifest. The 11 areas (I–IX, XI, XII) and 40 tasks are visible in v10 as `<div class="study-area" id="pg-aN">` with nested `<div class="task-section" id="t-iN">`. Task titles live in `<span class="task-title">`, references in `<div class="area-refs">` (for the area) and `<span class="src-tag">` tags (for tasks).

Structure:

```json
{
  "cert": "ppl",
  "title": "Private Pilot — ACS FAA-S-ACS-6C",
  "areas": [
    {
      "id": "I",
      "title": "Preflight Preparation",
      "tasks": [
        { "id": "I-A", "letter": "A", "title": "Pilot Qualifications", "references": ["14 CFR 61", "14 CFR 91", "AC 68-1"] },
        { "id": "I-B", "letter": "B", "title": "Airworthiness Requirements", "references": ["14 CFR 91.203", "14 CFR 91.213"] },
        { "id": "I-C", "letter": "C", "title": "Weather Information", "references": ["AC 00-6", "AC 00-45"] },
        { "id": "I-D", "letter": "D", "title": "Cross-Country Flight Planning", "references": ["14 CFR 91.103"] },
        { "id": "I-E", "letter": "E", "title": "National Airspace System", "references": ["14 CFR 71", "14 CFR 91", "AIM"] },
        { "id": "I-F", "letter": "F", "title": "Performance and Limitations", "references": ["POH/AFM"] },
        { "id": "I-G", "letter": "G", "title": "Operation of Systems", "references": ["POH/AFM", "FAA-H-8083-25"] },
        { "id": "I-H", "letter": "H", "title": "Human Factors", "references": ["FAA-H-8083-25", "AIM"] }
      ]
    },
    { "id": "II", "title": "Preflight Procedures", "tasks": [ /* ... */ ] },
    { "id": "III", "title": "Airport and Seaplane Base Operations", "tasks": [ /* ... */ ] },
    { "id": "IV", "title": "Takeoffs, Landings, and Go-Arounds", "tasks": [ /* ... */ ] },
    { "id": "V", "title": "Performance and Ground Reference Maneuvers", "tasks": [ /* ... */ ] },
    { "id": "VI", "title": "Navigation", "tasks": [ /* ... */ ] },
    { "id": "VII", "title": "Slow Flight and Stalls", "tasks": [ /* ... */ ] },
    { "id": "VIII", "title": "Basic Instrument Maneuvers", "tasks": [ /* ... */ ] },
    { "id": "IX", "title": "Emergency Operations", "tasks": [ /* ... */ ] },
    { "id": "XI", "title": "Multiengine Operations", "tasks": [ /* ... */ ] },
    { "id": "XII", "title": "Postflight Procedures", "tasks": [ /* ... */ ] }
  ]
}
```

Fill in every task for areas II–XII by inspecting the corresponding `<div class="study-area">` sections in `archive/altitude-pro-v10.html`.

Task IDs are `<Area roman>-<Task letter>`, e.g., `II-A`, `IX-B`. The `letter` field is just the letter.

---

### Task 3.4: Implement src/content.js and make tests pass

**Files:**
- Create: `src/content.js`

- [ ] **Step 1: Write content.js**

```js
// src/content.js
// Loads cert manifests, task markdown, and quiz topic JSON.
// In-memory cache; content is bundled by Vite so loads are synchronous after first.

const manifestCache = new Map();
const quizCache = new Map();

// Vite: import all manifests at build time
const manifests = import.meta.glob('/content/certs/*/manifest.json', { eager: true, import: 'default' });

export async function loadManifest(cert) {
  if (manifestCache.has(cert)) return manifestCache.get(cert);
  const key = `/content/certs/${cert}/manifest.json`;
  const manifest = manifests[key];
  if (!manifest) throw new Error(`No manifest for cert: ${cert}`);
  manifestCache.set(cert, manifest);
  return manifest;
}

// Quiz topic JSONs — bundled too
const quizFiles = import.meta.glob('/content/certs/*/quiz/*.json', { eager: true, import: 'default' });

export async function loadQuiz(cert, topic) {
  const key = `${cert}:${topic}`;
  if (quizCache.has(key)) return quizCache.get(key);
  const path = `/content/certs/${cert}/quiz/${topic}.json`;
  const data = quizFiles[path];
  if (!data) throw new Error(`No quiz for ${cert}/${topic}`);
  quizCache.set(key, data);
  return data;
}

export async function loadAllQuizTopics(cert) {
  const prefix = `/content/certs/${cert}/quiz/`;
  return Object.entries(quizFiles)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, data]) => ({ topic: path.slice(prefix.length, -5), data }));
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test -- --run
```

Expected: the `loadManifest` tests PASS. The "caches the manifest" test passes because `import.meta.glob` returns the same object reference on each call.

`import.meta.glob` works in Vitest because `vitest/config` runs the test transform through Vite's plugin pipeline — the same pipeline the dev server uses. No extra config needed.

- [ ] **Step 3: Commit**

```bash
git add tests/content.test.js content/certs/ppl/manifest.json src/content.js
git commit -m "feat(content): add manifest.json and content.loadManifest with tests"
```

---

### Task 3.5: Rewrite sidebar + mobile nav to use manifest

**Files:**
- Modify: `src/views/sidebar.js`
- Modify: `src/views/mobile-nav.js`
- Delete: `src/views/sidebar-data.js`
- Modify: `src/main.js`

- [ ] **Step 1: Update main.js to load manifest at boot**

```js
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

import { loadManifest } from './content.js';
import { initSidebar } from './views/sidebar.js';
import { initMobileNav } from './views/mobile-nav.js';
import { initModeSwitch } from './views/mode-switch.js';
import { initQuiz } from './views/quiz.js';

async function boot() {
  const manifest = await loadManifest('ppl');

  const sidebarRoot = document.getElementById('sidebar');
  if (sidebarRoot) initSidebar(sidebarRoot, manifest);

  initMobileNav(manifest);
  initModeSwitch();

  const quizRoot = document.querySelector('.quiz-setup') || document.getElementById('quiz-page');
  if (quizRoot) await initQuiz(quizRoot);
}

boot();
```

- [ ] **Step 2: Update sidebar.js to take manifest as a parameter**

Change the signature from `initSidebar(root)` to `initSidebar(root, manifest)`. Replace references to the old `AREAS` with `manifest.areas`. Update the DOM template to use the new field names:

```js
export function initSidebar(root, manifest) {
  const state = { curTaskId: null, openSections: new Set([manifest.areas[0].id]) };
  buildSidebar(root, manifest, state);
  root.addEventListener('click', e => handleClick(e, root, manifest, state));
}

function buildSidebar(root, manifest, state) {
  root.innerHTML = manifest.areas.map(area => {
    const isOpen = state.openSections.has(area.id);
    const tasksHtml = isOpen ? area.tasks.map(t => `
      <div class="sb-task ${t.id === state.curTaskId ? 'active' : ''}" data-task-id="${t.id}" data-area-id="${area.id}">
        <span class="sb-task-letter">${t.letter}</span> ${t.title}
      </div>
    `).join('') : '';
    return `
      <div class="sb-area ${isOpen ? 'open' : ''}">
        <div class="sb-head" data-area-id="${area.id}">
          <span class="sb-area-id">${area.id}</span> ${area.title}
        </div>
        <div class="sb-tasks">${tasksHtml}</div>
      </div>
    `;
  }).join('');
}
// handleClick, toggleArea, goToTask — update to thread `manifest` and `state` as parameters
// and use the new id format (area.id like "I" instead of "a1")
```

**Important: the v10 body HTML still uses old element IDs like `id="pg-a1"` and `id="t-ia"`.** Keep those IDs for now — Phase 4 regenerates the body HTML from markdown and these old IDs go away then. Renaming them now would be thrown-away work.

Add this mapping to top of `sidebar.js`:

```js
const AREA_DOM_ID = {
  I: 'a1', II: 'a2', III: 'a3', IV: 'a4', V: 'a5',
  VI: 'a6', VII: 'a7', VIII: 'a8', IX: 'a9', XI: 'a11', XII: 'a12',
};
function taskDomId(taskId) {
  // "I-A" → "ia", "XII-D" → "xiid" — match v10's convention
  return taskId.toLowerCase().replace('-', '');
}
```

Use these helpers wherever scroll targets are computed.

- [ ] **Step 3: Update mobile-nav.js similarly**

Take `manifest` as parameter, replace `AREAS` usage with `manifest.areas`, use the same `AREA_DOM_ID` + `taskDomId` helpers (or import them from sidebar.js if exported).

- [ ] **Step 4: Delete sidebar-data.js**

```bash
rm src/views/sidebar-data.js
```

- [ ] **Step 5: Verify in dev server**

```bash
npm run dev
```

Run the same parity check as Phase 2 Task 2.6. All behaviors must still work. The sidebar should render identically but now from `manifest.json`.

- [ ] **Step 6: Commit**

```bash
git add src/main.js src/views/sidebar.js src/views/mobile-nav.js
git rm src/views/sidebar-data.js
git commit -m "feat: drive sidebar and mobile nav from manifest.json"
```

---

### Task 3.6: Write failing test for quiz loading

**Files:**
- Modify: `tests/content.test.js`

- [ ] **Step 1: Add tests for quiz loading**

```js
// append to tests/content.test.js
describe('content.loadQuiz', () => {
  it('loads regulations topic with >= 40 questions', async () => {
    const { loadQuiz } = await import('../src/content.js');
    const quiz = await loadQuiz('ppl', 'regulations');
    expect(quiz.topic).toBe('regulations');
    expect(quiz.questions.length).toBeGreaterThanOrEqual(40);
  });

  it('every question has required fields', async () => {
    const { loadQuiz } = await import('../src/content.js');
    const quiz = await loadQuiz('ppl', 'weather');
    for (const q of quiz.questions) {
      expect(q.id).toMatch(/^[a-z]+-\d{3}$/);
      expect(Array.isArray(q.taskIds)).toBe(true);
      expect(q.taskIds.every(id => /^[IVX]+-[A-Z]$/.test(id))).toBe(true);
      expect([1, 2, 3, 4, 5]).toContain(q.difficulty);
      expect(q.choices.length).toBe(4);
      expect([0, 1, 2, 3]).toContain(q.answer);
      expect(q.explanation).toBeTruthy();
    }
  });

  it('loadAllQuizTopics returns all 7 topics', async () => {
    const { loadAllQuizTopics } = await import('../src/content.js');
    const topics = await loadAllQuizTopics('ppl');
    const names = topics.map(t => t.topic).sort();
    expect(names).toEqual([
      'aeromedical', 'airspace', 'maneuvers', 'navigation',
      'regulations', 'systems', 'weather'
    ]);
    const total = topics.reduce((sum, t) => sum + t.data.questions.length, 0);
    expect(total).toBeGreaterThanOrEqual(352);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
npm run test -- --run
```

Expected: FAIL because quiz JSON files don't exist yet.

---

### Task 3.7: Extract quiz questions into 7 JSON files with taskIds

**Files:**
- Create: `content/certs/ppl/quiz/regulations.json`
- Create: `content/certs/ppl/quiz/weather.json`
- Create: `content/certs/ppl/quiz/airspace.json`
- Create: `content/certs/ppl/quiz/navigation.json`
- Create: `content/certs/ppl/quiz/maneuvers.json`
- Create: `content/certs/ppl/quiz/systems.json`
- Create: `content/certs/ppl/quiz/aeromedical.json`

**Source:** the `QUESTIONS` array at the top of `src/views/quiz.js` (copied from v10 JS in Phase 2 Task 2.5).

- [ ] **Step 1: Split questions by topic**

Group the 352 questions by their `topic` field. Write a one-time extraction script or do it manually:

```bash
# Optional helper — run from repo root, outputs 7 files
node -e "
const { QUESTIONS } = await import('./src/views/quiz.js');
const fs = require('fs');
const byTopic = {};
for (const q of QUESTIONS) {
  (byTopic[q.topic] ||= []).push(q);
}
for (const [topic, questions] of Object.entries(byTopic)) {
  const file = {
    topic,
    title: topic[0].toUpperCase() + topic.slice(1),
    questions: questions.map(q => ({ ...q, taskIds: q.taskIds || [] })),
  };
  fs.writeFileSync(\`content/certs/ppl/quiz/\${topic}.json\`, JSON.stringify(file, null, 2));
}
"
```

Note: `src/views/quiz.js` is an ES module — `node -e` with top-level await requires Node 20+. If it fails, extract the `QUESTIONS` array to a standalone `.js` or `.json` file first, or do the split in a Vitest one-shot.

- [ ] **Step 2: Re-ID questions to use the `<topic-prefix>-<3-digit>` pattern**

If v10 IDs don't match `/^[a-z]+-\d{3}$/`, update them. E.g., `q123` → `reg-001` (or whatever the topic prefix is). Prefixes:
- regulations → `reg`
- weather → `wx`
- airspace → `air`
- navigation → `nav`
- maneuvers → `man`
- systems → `sys`
- aeromedical → `med`

- [ ] **Step 3: Add `taskIds` to each question**

This is the step that takes real judgment. For each question, decide which ACS task(s) it tests. Examples:

| Question topic | Example content | `taskIds` |
|---|---|---|
| regulations | VFR visibility minima | `["I-E"]` (Airspace) |
| weather | METAR decoding | `["I-C"]` (Weather Info) |
| airspace | Class B entry requirements | `["I-E"]` |
| navigation | TVMDC conversion | `["I-D", "VI-A"]` (XC Planning + Navigation) |
| maneuvers | Slow flight config | `["VII-A"]` |
| systems | Pitot-static blockage | `["I-G"]` |
| aeromedical | Hypoxia types | `["I-H"]` |

Some questions will map to 2+ tasks (airspace entry rules touch both I-E *and* regulations). Default to 1; use 2 only when genuinely needed.

**Shortcut:** do a first pass by topic → most-likely-task (reg → I-E, wx → I-C, etc.). Hand-adjust outliers on a second pass. Half a day of focused work.

- [ ] **Step 4: Example regulations.json snippet**

```json
{
  "topic": "regulations",
  "title": "Regulations",
  "questions": [
    {
      "id": "reg-001",
      "taskIds": ["I-E"],
      "difficulty": 2,
      "q": "What is the minimum flight visibility for VFR in Class E airspace below 10,000 MSL?",
      "choices": ["1 SM", "3 SM", "5 SM", "10 SM"],
      "answer": 1,
      "explanation": "14 CFR 91.155 requires 3 SM visibility for VFR in Class E below 10,000 MSL.",
      "ref": "14 CFR 91.155"
    }
  ]
}
```

- [ ] **Step 5: Run tests**

```bash
npm run test -- --run
```

Expected: all 3 quiz tests pass. Total questions across 7 files ≥ 352.

- [ ] **Step 6: Commit**

```bash
git add content/certs/ppl/quiz tests/content.test.js
git commit -m "feat(content): extract quiz questions into 7 topic JSON files with taskIds"
```

---

### Task 3.8: Rewrite quiz engine to load from JSON

**Files:**
- Modify: `src/views/quiz.js`
- Modify: `src/main.js`

- [ ] **Step 1: Remove hardcoded QUESTIONS array from quiz.js**

Replace the `const QUESTIONS = [ ... ]` block at the top with an initializer that pulls from `content.js`:

```js
import { loadAllQuizTopics } from '../content.js';

let QUESTIONS = [];
let TOPICS = [];

export async function initQuiz(root) {
  const topics = await loadAllQuizTopics('ppl');
  QUESTIONS = topics.flatMap(({ topic, data }) =>
    data.questions.map(q => ({ ...q, topic }))
  );
  TOPICS = topics.map(({ topic, data }) => ({
    id: topic,
    label: data.title,
    count: data.questions.length,
  }));
  renderSetup(root);
  root.addEventListener('click', handleClick);
}

// startQuiz, renderQuestion, etc. remain unchanged — they read from QUESTIONS
```

- [ ] **Step 2: Verify in dev server**

```bash
npm run dev
```

- Switch to Quiz mode. Setup panel appears with 7 topic chips, each showing count. Start a quiz. Answer questions. Difficulty adaptation still works. Result screen still works. Identical behavior to Phase 2.

- [ ] **Step 3: Verify production build**

```bash
npm run build
npm run preview
```

Open preview URL, run quiz. Network tab should show NO additional requests for quiz JSON (Vite bundled them into the JS chunk).

- [ ] **Step 4: Commit**

```bash
git add src/views/quiz.js src/main.js
git commit -m "feat(quiz): load questions from topic JSON files via content module"
```

---

## Phase 3 Completion Checklist

- [ ] `npm run test -- --run` — all tests pass
- [ ] `npm run build` — succeeds without errors or warnings
- [ ] `npm run preview` — production build works identically to dev
- [ ] Manual parity check against v10 — every behavior from Phase 2 Task 2.6's checklist still works
- [ ] Sidebar is driven by `content/certs/ppl/manifest.json` (try editing a task title there — it updates in the UI)
- [ ] Quiz is driven by 7 topic JSON files under `content/certs/ppl/quiz/` (try editing a question's text there — it updates in the UI)
- [ ] No hardcoded content in `src/views/`
- [ ] Git: all work committed, pushed to `origin/main`, Vercel auto-deploy green

---

## What's Next (NOT in this plan)

After Phases 0–3 are deployed and stable, the following phases get their own plans:

- **Phase 4 — Markdown extraction:** 40 task markdown files + extraction script. The spec's largest open decision (extraction approach) gets decided here based on what was learned in Phase 3.
- **Phase 5 — Hash routing:** `#/area/I/task/C` URLs.
- **Phase 6 — Progress tracking:** `state.js` + localStorage adapter + UI accents (checkmarks in sidebar, last quiz score display).
- **Phase 7 — Ship switch:** formally cut over to the new build and retire v10.

Each of those gets brainstormed briefly (any decisions deferred from this plan?) and then written as its own implementation plan.
