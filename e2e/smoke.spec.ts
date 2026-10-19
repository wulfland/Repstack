import { test, expect } from '@playwright/test';
import { skipOnboarding } from './helpers/skip-onboarding';

/**
 * Production smoke test.
 *
 * Run by .github/workflows/health-check.yml every five minutes against the
 * live GitHub Pages URL (BASE_URL). It must fail when the page is served but
 * the app does not render (for example when the built asset paths are wrong),
 * which a plain HTTP probe cannot detect.
 */

test.describe('Smoke', () => {
  test('should display the home page', async ({ page }) => {
    const failedAssets: string[] = [];
    page.on('response', (response) => {
      const url = response.url();
      if (response.status() >= 400 && /\.(js|css)(\?|$)/.test(url)) {
        failedAssets.push(`${response.status()} ${url}`);
      }
    });

    await page.goto('');
    await skipOnboarding(page);

    // The status bar only exists once the React app has rendered.
    await expect(page.locator('.status-bar')).toBeVisible({ timeout: 10000 });

    const content = await page.content();
    expect(content.toLowerCase()).toContain('repstack');

    expect(failedAssets, 'JS/CSS assets failed to load').toEqual([]);
  });
});
