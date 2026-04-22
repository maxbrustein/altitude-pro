// Study page HTML skeleton + schema markup.

export const SITE_ORIGIN = 'https://altitudepro.org';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildIntro(task, subsections) {
  const subs = subsections.slice(0, 3).join(', ').toLowerCase() || task.title.toLowerCase();
  return `Everything you need to know about ${task.title} for your private pilot checkride. Aligned to FAA-S-ACS-6C Task ${task.id}, covering ${subs}.`;
}

function buildReferenceLinks(refs) {
  return refs.join(', ');
}

function articleSchema(task, intro) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: task.title,
    description: intro,
    author: { '@type': 'Organization', name: 'Altitude Pro' },
    publisher: { '@type': 'Organization', name: 'Altitude Pro' },
    educationalLevel: 'Student Pilot',
    about: 'Private Pilot Certificate',
  };
}

function faqSchema(factCards) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: factCards.map(c => ({
      '@type': 'Question',
      name: c.question,
      acceptedAnswer: { '@type': 'Answer', text: c.answer },
    })),
  };
}

function areaNav(manifest) {
  if (!manifest.areas || manifest.areas.length === 0) return '';
  return manifest.areas.map(area => `
    <div class="area-group">
      <h3>Area ${area.id} — ${esc(area.title)}</h3>
      <ul>
        ${area.tasks.map(t => `<li><a href="/study/${t.slug}">${esc(t.title)}</a></li>`).join('')}
      </ul>
    </div>`).join('');
}

export function renderPage({ task, area, body, subsections, factCards, manifest }) {
  const intro = buildIntro(task, subsections);
  const metaDesc = intro.length > 160 ? intro.slice(0, 157) + '...' : intro;
  const canonical = `${SITE_ORIGIN}/study/${task.slug}`;
  const title = `${task.title} — Private Pilot Study Guide | Altitude Pro`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/study/assets/study.css">
  <meta property="og:title" content="${esc(task.title)} — Private Pilot Study Guide">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <script type="application/ld+json">
${JSON.stringify(articleSchema(task, intro), null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(faqSchema(factCards), null, 2)}
  </script>
</head>
<body class="study-page">
  <header class="study-header">
    <a class="logo" href="/">Altitude<span>Pro</span></a>
    <nav>
      <a href="/study/" class="active">Study Guide</a>
      <a href="/app" class="cta">Open App →</a>
    </nav>
  </header>

  <nav class="breadcrumb-trail" aria-label="breadcrumb">
    <a href="/">Home</a> ›
    <a href="/study/">ACS Study Guide</a> ›
    <span>Area ${esc(area.id)}: ${esc(area.title)}</span> ›
    <span aria-current="page">${esc(task.title)}</span>
  </nav>

  <main class="study-main">
    <h1>${esc(task.title)}</h1>
    <p class="subtitle">Private Pilot ACS · Area ${esc(area.id)} · Task ${esc(task.letter)} · ${esc(buildReferenceLinks(task.references || []))}</p>
    <p class="intro">${esc(intro)}</p>
    ${body}
  </main>

  <section class="study-cta-inline" aria-label="Practice this topic">
    <div class="cta-inner">
      <div class="cta-label">Practice what you just read</div>
      <div class="cta-body">Altitude Pro has quiz questions on ${esc(task.title)} — full bank, free.</div>
      <div class="cta-actions">
        <a class="btn-bright" href="/app#/quiz">Open the App →</a>
        <button class="btn-dismiss" data-action="dismiss-inline-cta">Keep reading</button>
      </div>
    </div>
  </section>

  <section class="study-cta-footer" aria-label="Start studying">
    <h2>You've studied ${esc(task.title)}</h2>
    <p>Ready to test yourself? Altitude Pro has practice questions on this exact topic — adaptive difficulty, ACS references, just like the real oral.</p>
    <a class="btn-bright" href="/app#/quiz">Start studying — Free →</a>
  </section>

  <footer class="study-footer">
    <nav class="sitemap" aria-label="All study pages">
      ${areaNav(manifest)}
    </nav>
    <p class="disclaimer">Not affiliated with the FAA. Content for study purposes only; always verify against official FAA sources.</p>
  </footer>

  <script defer src="/study/assets/study.js"></script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}
