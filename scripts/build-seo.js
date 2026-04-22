#!/usr/bin/env node
// Altitude Pro SEO prerender orchestrator.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { validateManifestSlugs } from './lib/seo-slugs.js';
import { transformTaskHtml } from './lib/seo-transform.js';
import { renderPage } from './lib/seo-template.js';
import { buildSitemap, buildRobots } from './lib/seo-sitemap.js';
import { buildVercelJson } from './lib/seo-vercel.js';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const MANIFEST_PATH = path.join(ROOT, 'content/certs/ppl/manifest.json');
const TASKS_DIR = path.join(ROOT, 'content/certs/ppl/tasks');
const OUT_STUDY_DIR = path.join(ROOT, 'public/study');
const OUT_ROOT = path.join(ROOT, 'public');
const VERCEL_JSON_PATH = path.join(ROOT, 'vercel.json');

function gitLastmod(taskId) {
  try {
    const filename = `${taskId}.html`;
    const date = execSync(`git log -1 --format=%cs -- content/certs/ppl/tasks/${filename}`, {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    return date || null;
  } catch {
    return null;
  }
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  const slugErrors = validateManifestSlugs(manifest);
  if (slugErrors.length) {
    console.error('Slug validation failed:');
    slugErrors.forEach(e => console.error('  ' + e));
    process.exit(1);
  }

  fs.mkdirSync(OUT_STUDY_DIR, { recursive: true });

  let emitted = 0;
  let anchorsEmitted = 0;
  const lastmodByTaskId = {};

  for (const area of manifest.areas) {
    for (const task of area.tasks) {
      const partialPath = path.join(TASKS_DIR, `${task.id}.html`);
      if (!fs.existsSync(partialPath)) {
        console.error(`Missing task partial: ${partialPath}`);
        process.exit(1);
      }
      const raw = fs.readFileSync(partialPath, 'utf8');
      const { title, body, subsections, factCards } = transformTaskHtml(raw);

      const idMatches = body.match(/\bid="([^"]+)"/g) || [];
      const ids = idMatches.map(m => m.slice(4, -1));
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (dupes.length) {
        console.error(`${task.id}: duplicate anchor ids after transform: ${[...new Set(dupes)].join(', ')}`);
        process.exit(1);
      }

      const html = renderPage({
        task: { ...task, title: title || task.title },
        area,
        body,
        subsections,
        factCards,
        manifest,
      });

      const outPath = path.join(OUT_STUDY_DIR, `${task.slug}.html`);
      fs.writeFileSync(outPath, html);
      emitted++;
      anchorsEmitted += ids.length;

      const lastmod = gitLastmod(task.id);
      if (lastmod) lastmodByTaskId[task.id] = lastmod;
    }
  }

  fs.writeFileSync(path.join(OUT_ROOT, 'sitemap.xml'), buildSitemap(manifest, lastmodByTaskId));
  fs.writeFileSync(path.join(OUT_ROOT, 'robots.txt'), buildRobots());
  fs.writeFileSync(VERCEL_JSON_PATH, buildVercelJson(manifest));

  console.log(`SEO build: ${emitted} study pages, ${anchorsEmitted} anchors, sitemap + robots + vercel.json updated.`);
}

main();
