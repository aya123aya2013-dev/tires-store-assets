import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  // Prevent every external request, including Salla API, media and telemetry.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' && url.port === '4178' ? route.continue() : route.abort();
  });
});

for (const lang of ['ar', 'en']) {
  test(`smoke: Salla multilingual fields and link-picker arrays (${lang})`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?lang=${lang}`);
    await expect(page.locator('.is-on h2')).toHaveText(lang === 'ar' ? 'بنر 1' : 'Banner 1');
    await expect(page.locator('.is-on a')).toHaveAttribute('href', '/category/1');
    await page.locator('.tc-banner__dots button').nth(1).click();
    await expect(page.locator('.is-on h2')).toHaveText(lang === 'ar' ? 'بنر 2' : 'Banner 2');
    expect(errors).toEqual([]);
    await page.screenshot({ path: `output/playwright/hero-${lang}-${test.info().project.name}.png`, fullPage: true });
  });
}

test('smoke: empty Salla collection does not crash', async ({ page }) => {
  await page.goto('/?case=empty');
  await expect(page.locator('.tc-banner--empty')).toBeVisible();
});

test('audit: mobile-image-only merchant slide remains visible', async ({ page }) => {
  await page.goto('/?case=mobileOnly');
  await expect(page.locator('.tc-banner__slide')).toHaveCount(1);
});

for (const name of ['bilingualRows', 'nullRows']) {
  test(`audit: Salla ${name} payload renders without crashing`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?case=${name}`);
    await expect(page.locator('.tc')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('audit: deleting slides in Salla editor preserves a visible active slide', async ({ page }) => {
  await page.goto('/');
  await page.locator('.tc-banner__dots button').nth(2).click();
  await expect(page.locator('.is-on h2')).toHaveText('بنر 3');
  await page.evaluate(() => {
    const win = window as unknown as { sallaQaSetData: (data: unknown) => void };
    const image = document.querySelector('img')!.src;
    win.sallaQaSetData({ image_mode: true, slides_autoplay: false, slides: [{ image, title: 'Remaining' }] });
  });
  await expect(page.locator('.tc-banner__slide')).toHaveCount(1);
  await expect(page.locator('.tc-banner__slide h2')).toHaveText('Remaining');
  await expect(page.locator('.tc-banner__slide.is-on')).toHaveCount(1);
});

test('audit: axe WCAG accessibility of Salla hero', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.tc-banner')).toBeVisible();
  const result = await new AxeBuilder({ page }).include('.tc').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await testInfo.attach('axe.json', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  expect(result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
