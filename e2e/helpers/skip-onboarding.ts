import { Page } from '@playwright/test';

/**
 * Helper to skip the onboarding flow in E2E tests
 * This should be called after page.goto() when testing main app functionality
 */
export async function skipOnboarding(page: Page): Promise<void> {
  // Wait for initial DOM and React to render
  await page.waitForLoadState('domcontentloaded');
  
  // Give React time to hydrate and render
  await page.waitForTimeout(500);
  
  // Check if we're on the onboarding page
  const skipButton = page.locator('button:has-text("Skip Setup")');
  
  // Try to click the skip button if it exists
  try {
    // Wait for skip button with shorter timeout
    await skipButton.waitFor({ state: 'visible', timeout: 3000 });
    await skipButton.click();
    
    // After clicking, wait for main nav to appear
    await page.locator('.nav-desktop, nav.nav, .layout').first().waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // Skip button not found - might already be past onboarding or on different page
    // Check if main app is already visible
    const mainNav = page.locator('.nav-desktop, nav.nav, .layout').first();
    try {
      await mainNav.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // Neither onboarding nor main app visible - throw clear error
      throw new Error('Could not skip onboarding: neither Skip button nor main app visible');
    }
  }
}

/**
 * Helper to complete onboarding with default options
 * Useful for tests that need a fully configured app state
 */
export async function completeOnboarding(page: Page, options?: {
  name?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  unitSystem?: 'metric' | 'imperial';
  trainingSplit?: 'push_pull_legs' | 'upper_lower' | 'full_body' | 'bro_split';
}): Promise<void> {
  const {
    name = 'Test User',
    experienceLevel = 'intermediate',
    unitSystem = 'metric',
    trainingSplit = 'push_pull_legs'
  } = options || {};
  
  await page.waitForLoadState('domcontentloaded');
  
  // Check if we're on onboarding
  const isOnboarding = await page.locator('text=Build Muscle with Science').isVisible({ timeout: 2000 }).catch(() => false);
  
  if (!isOnboarding) {
    return; // Already past onboarding
  }
  
  // Step 1: Welcome - Click Get Started
  await page.click('button:has-text("Get Started")');
  
  // Step 2: Profile Setup
  await page.locator('text=Set Up Your Profile').waitFor({ timeout: 3000 });
  await page.fill('input#name', name);
  await page.click(`input[value="${experienceLevel}"]`);
  await page.click(`input[value="${unitSystem}"]`);
  await page.click('button:has-text("Continue")');
  
  // Step 3: Training Split (optional - skip it)
  await page.locator('text=Choose Your Training Split').waitFor({ timeout: 3000 });
  if (trainingSplit) {
    await page.click(`label:has(input[value="${trainingSplit}"])`);
    await page.click('button:has-text("Continue")');
  } else {
    await page.click('button:has-text("Skip for now")');
  }
  
  // Step 4: First Exercise (optional - skip it)
  await page.locator('text=Add Your First Exercise').waitFor({ timeout: 3000 });
  await page.click('button:has-text("Skip for now")');
  
  // Step 5: Quick Tour - Skip it
  await page.locator('text=Quick Tour').waitFor({ timeout: 3000 });
  await page.click('button:has-text("Skip Tour")');
  
  // Wait for main app
  await page.locator('nav, .nav-desktop, header').first().waitFor({ timeout: 5000 });
}

/**
 * Helper to clear the database and ensure fresh onboarding state
 */
export async function resetToFreshState(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('RepstackDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  });
}
