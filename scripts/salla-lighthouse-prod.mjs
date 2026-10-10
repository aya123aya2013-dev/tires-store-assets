// Lighthouse on the PRODUCTION build of the local hero fixture (minified, code-split) — the dev-server run in
// salla-lighthouse.mjs measures Vite's dev bundle (unminified React, HMR client), which is far slower than a
// published theme. Still a local fixture: no Salla API, no real store, no credentials.
import { mkdir, writeFile } from 'node:fs/promises';
import { build, preview } from 'vite';
import lighthouse from 'lighthouse';
import { fileURLToPath } from 'node:url';

process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('../output/playwright/browsers', import.meta.url));
const { chromium } = await import('@playwright/test');

const outDir = fileURLToPath(new URL('../output/playwright/fixture-dist', import.meta.url));
await build({ configFile: 'tests/salla/vite.config.ts', logLevel: 'warn', build: { outDir, emptyOutDir: true } });
const server = await preview({ configFile: 'tests/salla/vite.config.ts', root: outDir, build: { outDir }, preview: { host: '127.0.0.1', port: 4180, strictPort: true } });
let browser;
try {
  browser = await chromium.launch({ channel: 'chromium', headless: true, args: ['--remote-debugging-port=9229'] });
  for (let attempt = 0; attempt < 40; attempt++) {
    try { if ((await fetch('http://127.0.0.1:9229/json/version')).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  await mkdir('output/playwright/lighthouse', { recursive: true });
  for (const lang of ['ar', 'en']) {
    const result = await lighthouse(`http://127.0.0.1:4180/?lang=${lang}`, {
      port: 9229, output: ['html', 'json'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      blockedUrlPatterns: ['https://*', 'http://api.*'],
    });
    if (!result) throw new Error('Lighthouse returned no result');
    await writeFile(`output/playwright/lighthouse/prod-${lang}.html`, result.report[0]);
    await writeFile(`output/playwright/lighthouse/prod-${lang}.json`, result.report[1]);
    const a = result.lhr.audits;
    console.log(lang, Object.fromEntries(Object.entries(result.lhr.categories).map(([k, v]) => [k, v.score])),
      { fcp: a['first-contentful-paint'].displayValue, lcp: a['largest-contentful-paint'].displayValue, tbt: a['total-blocking-time'].displayValue, cls: a['cumulative-layout-shift'].displayValue });
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
