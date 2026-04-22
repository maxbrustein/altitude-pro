import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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

  it('caches the manifest (second call returns identical reference)', async () => {
    const { loadManifest } = await import('../src/content.js');
    const first = await loadManifest('ppl');
    const second = await loadManifest('ppl');
    expect(second).toBe(first);
  });

  it('throws on unknown cert', async () => {
    const { loadManifest } = await import('../src/content.js');
    await expect(loadManifest('nonexistent')).rejects.toThrow(/No manifest/);
  });

  it('every task has a non-empty slug', async () => {
    const { loadManifest } = await import('../src/content.js');
    const manifest = await loadManifest('ppl');
    const allTasks = manifest.areas.flatMap(a => a.tasks);
    for (const task of allTasks) {
      expect(task.slug, `${task.id}`).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
    }
  });

  it('all task slugs are unique across the manifest', async () => {
    const { loadManifest } = await import('../src/content.js');
    const manifest = await loadManifest('ppl');
    const slugs = manifest.areas.flatMap(a => a.tasks.map(t => t.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('aliases (when present) are arrays of slug-shaped strings', async () => {
    const { loadManifest } = await import('../src/content.js');
    const manifest = await loadManifest('ppl');
    const allTasks = manifest.areas.flatMap(a => a.tasks);
    for (const task of allTasks) {
      if (task.aliases !== undefined) {
        expect(Array.isArray(task.aliases), `${task.id}`).toBe(true);
        for (const alias of task.aliases) {
          expect(alias, `${task.id}`).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/);
        }
      }
    }
  });

  it('all aliases are unique and do not collide with any canonical slug', async () => {
    const { loadManifest } = await import('../src/content.js');
    const manifest = await loadManifest('ppl');
    const allTasks = manifest.areas.flatMap(a => a.tasks);
    const slugs = new Set(allTasks.map(t => t.slug));
    const seenAliases = new Set();
    for (const task of allTasks) {
      for (const alias of (task.aliases || [])) {
        expect(slugs.has(alias), `alias "${alias}" collides with a canonical slug`).toBe(false);
        expect(seenAliases.has(alias), `alias "${alias}" duplicated across tasks`).toBe(false);
        seenAliases.add(alias);
      }
    }
  });
});

describe('content.loadQuiz', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('loads regulations topic with >= 40 questions', async () => {
    const { loadQuiz } = await import('../src/content.js');
    const quiz = await loadQuiz('ppl', 'regulations');
    expect(quiz.topic).toBe('regulations');
    expect(quiz.questions.length).toBeGreaterThanOrEqual(40);
  });

  it('every question has required fields across all topics', async () => {
    const { loadAllQuizTopics } = await import('../src/content.js');
    const topics = await loadAllQuizTopics('ppl');
    for (const { topic, data } of topics) {
      for (const q of data.questions) {
        expect(q.id, `${topic}: ${q.q}`).toMatch(/^[a-z]+-\d{3}$/);
        expect(Array.isArray(q.taskIds), `${topic}: ${q.id}`).toBe(true);
        expect(q.taskIds.every(id => /^[IVX]+-[A-Z]$/.test(id)), `${topic}: ${q.id} taskIds=${JSON.stringify(q.taskIds)}`).toBe(true);
        expect([1, 2, 3, 4, 5]).toContain(q.difficulty);
        expect(q.choices.length).toBe(4);
        expect([0, 1, 2, 3]).toContain(q.answer);
        expect(q.explanation).toBeTruthy();
      }
    }
  });

  it('loadAllQuizTopics returns all 7 topics with >= 352 questions total', async () => {
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

describe('vercel.json routing', () => {
  it('has a 302 redirect from / to /app', () => {
    const vercelJson = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));
    const rootRedirect = vercelJson.redirects.find(r => r.source === '/');
    expect(rootRedirect).toBeDefined();
    expect(rootRedirect.destination).toBe('/app');
    expect(rootRedirect.permanent).toBe(false);
  });

  it('has SPA rewrite for /app/:path*', () => {
    const vercelJson = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));
    expect(vercelJson.rewrites.some(r => r.source === '/app/:path*')).toBe(true);
  });
});
