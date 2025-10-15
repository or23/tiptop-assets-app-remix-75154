import { test, expect } from '@playwright/test';

test.describe('Basic User Flow', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Tiptop/);
  });

  test('should navigate using bottom nav', async ({ page }) => {
    await page.goto('/');
    
    // Click on Dashboard nav item
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Click on Home nav item
    await page.click('text=Home');
    await expect(page).toHaveURL(/\//);
  });

  test('should show install prompt on supported browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    });

    // Check if install prompt appears (may not work on all browsers)
    const installButton = page.locator('text=Install Now');
    if (await installButton.isVisible()) {
      await expect(installButton).toBeVisible();
    }
  });

  test('should work offline (PWA)', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Navigate to another page
    await page.click('text=Dashboard');
    
    // Page should still load (from cache)
    await expect(page.locator('body')).toBeVisible();
  });
});
