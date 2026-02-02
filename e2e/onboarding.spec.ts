/**
 * End-to-end tests for user onboarding flow
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('User Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test to ensure fresh onboarding
    await page.goto('/');
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('RepstackDB');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    });
    // Wait a moment for the database to be fully deleted
    await page.waitForTimeout(500);
    // Reload page to trigger fresh onboarding
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome screen on first launch', async ({ page }) => {
    // Wait for onboarding to load - use the heading specifically
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('text=Evidence-Based Hypertrophy Training')
    ).toBeVisible();

    // Check for welcome screen elements
    await expect(page.locator('text=Build Muscle with Science')).toBeVisible();
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
    await expect(page.locator('button:has-text("Skip Setup")')).toBeVisible();
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Wait for welcome screen - use the heading specifically
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });

    // Step 1: Welcome screen - Click Get Started
    await page.click('button:has-text("Get Started")');

    // Step 2: Profile Setup
    await expect(page.locator('text=Set Up Your Profile')).toBeVisible();

    // Fill in profile information
    await page.fill('input#name', 'Test User');
    await page.click('input[value="intermediate"]');
    await page.click('input[value="imperial"]');
    await page.click('button:has-text("Continue")');

    // Step 3: Training Split (optional)
    await expect(page.locator('text=Choose Your Training Split')).toBeVisible();
    // Click the label containing the Upper/Lower option to select it
    await page.click('label:has(input[value="upper_lower"])');
    await page.click('button:has-text("Continue")');

    // Step 4: First Exercise (optional)
    await expect(page.locator('text=Add Your First Exercise')).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Step 5: Quick Tour
    await expect(page.locator('text=Quick Tour')).toBeVisible();
    await expect(page.locator('text=Log Workouts')).toBeVisible();

    // Navigate through tour
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Exercise Library')).toBeVisible();

    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Mesocycle Programs')).toBeVisible();

    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Track Progress')).toBeVisible();

    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Customize Settings')).toBeVisible();

    // Complete onboarding
    await page.click('button:has-text("Get Started")');

    // Should now be on the main app - check for main header or navigation
    await expect(page.locator('nav.nav-desktop')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should allow skipping onboarding from welcome screen', async ({
    page,
  }) => {
    // Wait for welcome screen
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });

    // Click skip
    await page.click('button:has-text("Skip Setup")');

    // Should go directly to main app - check for main header or navigation
    await expect(page.locator('nav.nav-desktop')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should allow skipping optional steps', async ({ page }) => {
    // Wait for welcome screen
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });

    // Complete required steps
    await page.click('button:has-text("Get Started")');

    // Profile setup (required)
    await expect(page.locator('text=Set Up Your Profile')).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Skip training split
    await expect(page.locator('text=Choose Your Training Split')).toBeVisible();
    await page.click('button:has-text("Skip for now")');

    // Skip first exercise
    await expect(page.locator('text=Add Your First Exercise')).toBeVisible();
    await page.click('button:has-text("Skip for now")');

    // Skip tour
    await expect(page.locator('text=Quick Tour')).toBeVisible();
    await page.click('button:has-text("Skip Tour")');

    // Should be on main app - check for main header or navigation
    await expect(page.locator('nav.nav-desktop')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should allow navigating back through onboarding steps', async ({
    page,
  }) => {
    // Wait for welcome screen
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });

    // Go to profile setup
    await page.click('button:has-text("Get Started")');
    await expect(page.locator('text=Set Up Your Profile')).toBeVisible();

    // Go to training split
    await page.click('button:has-text("Continue")');
    await expect(page.locator('text=Choose Your Training Split')).toBeVisible();

    // Go back to profile
    await page.click('button:has-text("Back")');
    await expect(page.locator('text=Set Up Your Profile')).toBeVisible();

    // Go back to welcome (should be first step)
    await page.click('button:has-text("Back")');
    await expect(page.locator('text=Build Muscle with Science')).toBeVisible();
  });

  test('should show progress indicator with correct step count', async ({
    page,
  }) => {
    // Wait for welcome screen
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });

    // Check progress indicator on first step
    await expect(page.locator('text=Step 1 of 5')).toBeVisible();

    // Go to next step
    await page.click('button:has-text("Get Started")');
    await expect(page.locator('text=Step 2 of 5')).toBeVisible();

    // Check progress dots
    const progressDots = page.locator('.progress-dot');
    await expect(progressDots).toHaveCount(5);
  });

  test('should persist onboarding completion', async ({ page }) => {
    // Complete onboarding
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Skip Setup")');

    // Wait for main app - check for main header or navigation
    await expect(page.locator('nav.nav-desktop')).toBeVisible({
      timeout: 5000,
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should not show onboarding again - check for main header or navigation
    await expect(page.locator('nav.nav-desktop')).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator('text=Build Muscle with Science')
    ).not.toBeVisible();
  });

  test('should allow re-running onboarding from settings', async ({ page }) => {
    // Skip onboarding first
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Skip Setup")');

    // Wait for main app - check for main header or navigation
    await expect(page.locator('nav.nav-desktop')).toBeVisible({
      timeout: 5000,
    });

    // Go to settings - click text link (works for both mobile and desktop)
    await page.click('a:has-text("Settings")');
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Click re-run onboarding
    await page.click('button:has-text("Re-run Onboarding")');

    // Should show onboarding again
    await expect(page.locator('text=Build Muscle with Science')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should be accessible', async ({ page }) => {
    // Wait for welcome screen
    await expect(page.locator('h1.logo-text')).toBeVisible({ timeout: 10000 });

    // Run accessibility tests on welcome screen
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Go to profile setup and test
    await page.click('button:has-text("Get Started")');
    await expect(page.locator('text=Set Up Your Profile')).toBeVisible();

    const profileScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(profileScanResults.violations).toEqual([]);
  });
});
