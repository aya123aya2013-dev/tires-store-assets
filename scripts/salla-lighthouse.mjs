import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import lighthouse from 'lighthouse';
import { fileURLToPath } from 'node:url';

process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('../output/playwright/browsers', import.meta.url));
const { chromium } = await import('@playwright/test');

// Local fixture only. No production URL, API session, checkout or credentials.
const server = await createServer({ configFile: 'tests/salla/vite.config.ts', server: { port: 4179 } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ channel: 'chromium', headless: true, args: ['--remote-debugging-port=9228'] });
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { const response = await fetch('http://127.0.0.1:9228/json/version'); if (response.ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error('Local Chromium did not start');
  await mkdir('output/playwright/lighthouse', { recursive: true });
  for (const lang of ['ar', 'en']) {
    const result = await lighthouse(`http://127.0.0.1:4179/?lang=${lang}`, {
      port: 9228, output: ['html', 'json'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      blockedUrlPatterns: ['https://*', 'http://api.*'],
    });
    if (!result) throw new Error('Lighthouse returned no result');
    await writeFile(`output/playwright/lighthouse/${lang}.html`, result.report[0]);
    await writeFile(`output/playwright/lighthouse/${lang}.json`, result.report[1]);
    console.log(lang, Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, value.score])));
  }
} finally {
  await browser?.close();
  await server.close();
}
