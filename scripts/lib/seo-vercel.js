// Generates vercel.json content from the manifest.
// Rewrites: /app/:path* → /app/index.html (SPA fallback)
// Redirects:
//   /                 → /app   (302, not permanent — marketing home will replace later)
//   /study/<alias>    → /study/<canonical>   (301 per alias)

export function buildVercelJson(manifest) {
  const config = {
    cleanUrls: true,
    trailingSlash: false,
    rewrites: [
      { source: '/app/:path*', destination: '/app/index.html' },
    ],
    redirects: [
      { source: '/', destination: '/app', permanent: false },
    ],
  };

  for (const area of manifest.areas) {
    for (const t of area.tasks) {
      for (const alias of (t.aliases || [])) {
        config.redirects.push({
          source: `/study/${alias}`,
          destination: `/study/${t.slug}`,
          permanent: true,
        });
      }
    }
  }

  return JSON.stringify(config, null, 2) + '\n';
}
