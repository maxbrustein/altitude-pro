// Progress state (tasks viewed + quiz session history) with a pluggable
// storage adapter. Today: localStorage. Later: swap in a Supabase adapter
// implementing the same persist(state) / load() contract without touching
// callers.
//
// Shape documented in docs/superpowers/specs/2026-04-16-altitude-pro-restructure-design.md

const STORAGE_KEY = 'altitudepro:progress';
const CURRENT_VERSION = 1;
const RECENT_SESSION_CAP = 50;
const PERSIST_DEBOUNCE_MS = 200;

function emptyState() {
  return {
    version: CURRENT_VERSION,
    updatedAt: null,
    tasks: {},
    quiz: {
      recent: [],
      byTopic: {},
      byQuestion: {},
    },
  };
}

function ulid() {
  // Small, no-deps ULID-ish: timestamp + random. Sorts chronologically.
  const t = Date.now().toString(36).padStart(9, '0');
  const r = Math.random().toString(36).slice(2, 10);
  return `sess-${t}${r}`;
}

// ── Adapters ──

export const localStorageAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  persist(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or localStorage unavailable — silently drop.
    }
  },
  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  },
};

// In-memory adapter for tests.
export function memoryAdapter() {
  let blob = null;
  return {
    load() { return blob; },
    persist(state) { blob = JSON.parse(JSON.stringify(state)); },
    clear() { blob = null; },
  };
}

// ── Store ──

export function createStore(adapter = localStorageAdapter) {
  let state = loadOrInit();
  let currentSession = null;  // active quiz session (not yet ended)
  const listeners = new Set();
  let persistTimer = null;

  function loadOrInit() {
    const loaded = adapter.load();
    if (!loaded) return emptyState();
    // Simple forward-compat: if stored version is less than CURRENT_VERSION,
    // future migrations go here. For now every shape is v1.
    if (loaded.version !== CURRENT_VERSION) return migrate(loaded);
    return loaded;
  }

  function migrate(loaded) {
    // Placeholder — no migrations needed yet.
    return { ...emptyState(), ...loaded, version: CURRENT_VERSION };
  }

  function touch() {
    state.updatedAt = new Date().toISOString();
    notify();
    schedulePersist();
  }

  function notify() {
    for (const fn of listeners) fn(state);
  }

  function schedulePersist() {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      persistTimer = null;
      adapter.persist(state);
    }, PERSIST_DEBOUNCE_MS);
  }

  function flushPersist() {
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    adapter.persist(state);
  }

  return {
    get() { return state; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    flush: flushPersist,

    tasks: {
      markViewed(taskId) {
        if (!state.tasks[taskId]) state.tasks[taskId] = {};
        state.tasks[taskId].viewed = true;
        state.tasks[taskId].viewedAt = new Date().toISOString();
        touch();
      },
      isViewed(taskId) {
        return !!state.tasks[taskId]?.viewed;
      },
    },

    quiz: {
      startSession({ topic, length, taskFilter = null }) {
        currentSession = {
          id: ulid(),
          startedAt: new Date().toISOString(),
          topic: topic || 'mixed',
          taskFilter,
          length,
          correct: 0,
          total: 0,
        };
        return currentSession.id;
      },
      recordAnswer({ questionId, correct }) {
        if (!currentSession) return;
        currentSession.total++;
        if (correct) currentSession.correct++;
        if (!state.quiz.byQuestion[questionId]) {
          state.quiz.byQuestion[questionId] = { attempts: 0, correct: 0, lastCorrect: false };
        }
        const qs = state.quiz.byQuestion[questionId];
        qs.attempts++;
        if (correct) qs.correct++;
        qs.lastCorrect = !!correct;
        touch();
      },
      endSession() {
        if (!currentSession) return null;
        const summary = {
          id: currentSession.id,
          endedAt: new Date().toISOString(),
          topic: currentSession.topic,
          taskFilter: currentSession.taskFilter,
          length: currentSession.length,
          score: { correct: currentSession.correct, total: currentSession.total },
        };
        state.quiz.recent.unshift(summary);
        if (state.quiz.recent.length > RECENT_SESSION_CAP) {
          state.quiz.recent.length = RECENT_SESSION_CAP;
        }
        const topicKey = summary.topic;
        if (!state.quiz.byTopic[topicKey]) state.quiz.byTopic[topicKey] = { attempted: 0, correct: 0 };
        state.quiz.byTopic[topicKey].attempted += summary.score.total;
        state.quiz.byTopic[topicKey].correct += summary.score.correct;
        currentSession = null;
        touch();
        return summary;
      },
      lastSession() {
        return state.quiz.recent[0] || null;
      },
      abandonSession() {
        currentSession = null;
      },
    },
  };
}

// Default singleton for browser code. Tests use createStore(memoryAdapter()).
export const state = createStore();
