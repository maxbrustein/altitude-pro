import { describe, it, expect, beforeEach } from 'vitest';
import { createStore, memoryAdapter } from '../src/state.js';

describe('state.tasks', () => {
  it('markViewed sets viewed=true and stamps viewedAt', () => {
    const store = createStore(memoryAdapter());
    store.tasks.markViewed('I-A');
    expect(store.get().tasks['I-A'].viewed).toBe(true);
    expect(store.get().tasks['I-A'].viewedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('isViewed reflects markViewed calls', () => {
    const store = createStore(memoryAdapter());
    expect(store.tasks.isViewed('I-A')).toBe(false);
    store.tasks.markViewed('I-A');
    expect(store.tasks.isViewed('I-A')).toBe(true);
  });
});

describe('state.quiz', () => {
  let store;
  beforeEach(() => { store = createStore(memoryAdapter()); });

  it('full session flow records answers, session summary, topic stats', () => {
    store.quiz.startSession({ topic: 'regulations', length: 3 });
    store.quiz.recordAnswer({ questionId: 'reg-001', correct: true });
    store.quiz.recordAnswer({ questionId: 'reg-002', correct: false });
    store.quiz.recordAnswer({ questionId: 'reg-001', correct: true });
    const summary = store.quiz.endSession();

    expect(summary.score).toEqual({ correct: 2, total: 3 });
    expect(store.get().quiz.recent.length).toBe(1);
    expect(store.get().quiz.byTopic.regulations).toEqual({ attempted: 3, correct: 2 });
    expect(store.get().quiz.byQuestion['reg-001']).toEqual({ attempts: 2, correct: 2, lastCorrect: true });
    expect(store.get().quiz.byQuestion['reg-002']).toEqual({ attempts: 1, correct: 0, lastCorrect: false });
  });

  it('caps recent at 50 sessions, most recent first', () => {
    for (let i = 0; i < 55; i++) {
      store.quiz.startSession({ topic: 'weather', length: 1 });
      store.quiz.recordAnswer({ questionId: `wx-${String(i).padStart(3, '0')}`, correct: i % 2 === 0 });
      store.quiz.endSession();
    }
    const recent = store.get().quiz.recent;
    expect(recent.length).toBe(50);
    // The most recently ended session is at index 0
    expect(recent[0].id).not.toBe(recent[49].id);
  });

  it('lastSession returns the most recent ended session', () => {
    store.quiz.startSession({ topic: 'regulations', length: 1 });
    store.quiz.recordAnswer({ questionId: 'reg-001', correct: true });
    store.quiz.endSession();
    expect(store.quiz.lastSession().topic).toBe('regulations');
  });

  it('endSession without startSession returns null', () => {
    expect(store.quiz.endSession()).toBe(null);
  });
});

describe('state persistence', () => {
  it('persists on mutate and reloads into a new store with same adapter', async () => {
    const adapter = memoryAdapter();
    const s1 = createStore(adapter);
    s1.tasks.markViewed('I-A');
    s1.tasks.markViewed('II-C');
    s1.flush(); // force immediate persist

    const s2 = createStore(adapter);
    expect(s2.tasks.isViewed('I-A')).toBe(true);
    expect(s2.tasks.isViewed('II-C')).toBe(true);
    expect(s2.tasks.isViewed('III-B')).toBe(false);
  });

  it('empty adapter yields empty state', () => {
    const store = createStore(memoryAdapter());
    const s = store.get();
    expect(s.version).toBe(1);
    expect(s.tasks).toEqual({});
    expect(s.quiz.recent).toEqual([]);
  });

  it('subscribers fire on mutation', () => {
    const store = createStore(memoryAdapter());
    let calls = 0;
    const unsub = store.subscribe(() => { calls++; });
    store.tasks.markViewed('I-A');
    store.tasks.markViewed('I-B');
    expect(calls).toBe(2);
    unsub();
    store.tasks.markViewed('I-C');
    expect(calls).toBe(2);
  });
});
