import { describe, it, expect } from 'vitest';
import { buildSitemap, buildRobots } from '../scripts/lib/seo-sitemap.js';

const manifest = {
  areas: [
    { id: 'I', title: 'Preflight', tasks: [
      { id: 'I-A', slug: 'pilot-qualifications' },
      { id: 'I-B', slug: 'airworthiness-requirements' },
    ]}
  ]
};

describe('buildSitemap', () => {
  it('includes the root URL with priority 1.0', () => {
    const xml = buildSitemap(manifest);
    expect(xml).toContain('<loc>https://altitudepro.org/</loc>');
    expect(xml).toContain('<priority>1.0</priority>');
  });

  it('lists every task as a study page', () => {
    const xml = buildSitemap(manifest);
    expect(xml).toContain('<loc>https://altitudepro.org/study/pilot-qualifications</loc>');
    expect(xml).toContain('<loc>https://altitudepro.org/study/airworthiness-requirements</loc>');
  });

  it('does NOT include /app', () => {
    const xml = buildSitemap(manifest);
    expect(xml).not.toContain('/app</loc>');
  });

  it('is valid XML starting with xml declaration', () => {
    const xml = buildSitemap(manifest);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('</urlset>');
  });
});

describe('buildRobots', () => {
  it('allows all user agents on all paths', () => {
    const txt = buildRobots();
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Allow: /');
  });
  it('includes sitemap URL', () => {
    const txt = buildRobots();
    expect(txt).toContain('Sitemap: https://altitudepro.org/sitemap.xml');
  });
});
