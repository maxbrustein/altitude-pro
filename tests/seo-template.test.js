import { describe, it, expect } from 'vitest';
import { renderPage, SITE_ORIGIN } from '../scripts/lib/seo-template.js';

const fixture = {
  task: {
    id: 'I-A',
    letter: 'A',
    title: 'Pilot Qualifications',
    slug: 'pilot-qualifications',
    references: ['14 CFR 61', '14 CFR 91'],
  },
  area: { id: 'I', title: 'Preflight Preparation' },
  body: '<h2 id="cert">Certificate Requirements</h2><section class="fact-card" id="a"><h3>A</h3><div class="fact-body">body</div></section>',
  subsections: ['Certificate Requirements', 'Medical', 'Currency'],
  factCards: [{ question: 'A', answer: 'body' }],
  manifest: { areas: [] },
};

describe('renderPage', () => {
  it('sets <title>, meta description, canonical', () => {
    const html = renderPage(fixture);
    expect(html).toContain('<title>Pilot Qualifications');
    expect(html).toMatch(/<meta name="description" content="[^"]{50,160}"/);
    expect(html).toContain(`<link rel="canonical" href="${SITE_ORIGIN}/study/pilot-qualifications">`);
  });

  it('renders h1 matching task title', () => {
    const html = renderPage(fixture);
    expect(html).toMatch(/<h1>Pilot Qualifications<\/h1>/);
  });

  it('includes OG tags', () => {
    const html = renderPage(fixture);
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('<meta property="og:url"');
    expect(html).toContain('<meta property="og:type" content="article">');
  });

  it('includes Article schema', () => {
    const html = renderPage(fixture);
    expect(html).toContain('"@type": "Article"');
    expect(html).toContain('"headline": "Pilot Qualifications"');
  });

  it('includes FAQPage schema with one Question per fact card', () => {
    const html = renderPage(fixture);
    expect(html).toContain('"@type": "FAQPage"');
    expect(html).toContain('"name": "A"');
  });

  it('includes the transformed body inside <main>', () => {
    const html = renderPage(fixture);
    expect(html).toContain('<main class="study-main">');
    expect(html).toContain('Certificate Requirements');
  });

  it('includes header with link to /app', () => {
    const html = renderPage(fixture);
    expect(html).toContain('href="/app"');
  });

  it('generates breadcrumb showing area and task', () => {
    const html = renderPage(fixture);
    expect(html).toContain('Area I: Preflight Preparation');
    expect(html).toContain('Pilot Qualifications');
  });

  it('links to /study/assets/study.css and study.js', () => {
    const html = renderPage(fixture);
    expect(html).toContain('href="/study/assets/study.css"');
    expect(html).toContain('src="/study/assets/study.js"');
  });

  it('includes vercel analytics script', () => {
    const html = renderPage(fixture);
    expect(html).toContain('/_vercel/insights/script.js');
  });
});
