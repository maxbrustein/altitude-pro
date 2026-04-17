import { describe, it, expect, beforeEach, vi } from 'vitest';

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
});
