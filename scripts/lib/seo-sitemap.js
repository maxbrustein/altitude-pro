import { SITE_ORIGIN } from './seo-template.js';

export function buildSitemap(manifest, lastmodByTaskId = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `  <url>
    <loc>${SITE_ORIGIN}/</loc>
    <priority>1.0</priority>
  </url>`,
  ];
  for (const area of manifest.areas) {
    for (const t of area.tasks) {
      const lastmod = lastmodByTaskId[t.id] || today;
      urls.push(`  <url>
    <loc>${SITE_ORIGIN}/study/${t.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export function buildRobots() {
  return `User-agent: *
Allow: /
Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
}
