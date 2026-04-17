# Altitude Pro

Private pilot checkride study app — single-page web app covering ACS FAA-S-ACS-6C.

## Dev

```bash
npm install
npm run dev        # start Vite dev server
npm run build      # production build → dist/
npm run preview    # preview production build
npm run test       # run Vitest
```

## Structure

- `src/` — app code (entry, router, state, views, styles)
- `content/certs/ppl/` — ACS content (manifest, task markdown, quiz JSON)
- `archive/` — legacy single-file version
- `docs/superpowers/` — specs and implementation plans

Deployed via Vercel auto-deploy from `main`: https://altitude-pro.vercel.app
