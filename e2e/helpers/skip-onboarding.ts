import { Page } from '@playwright/test';

/**
 * Helper to skip the onboarding flow in E2E tests
 * This should be called after page.goto() when testing main app functionality
 */
export async function skipOnboarding(page: Page): Promise<void> {
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');
  
  // Check if we're on the onboarding screen by looking for the welcome message
  const isOnboarding = await page.locator('text=Build Muscle with Science').isVisible({ timeout: 3000 }).catch(() => false);
  
  if (isOnboarding) {
    // Click "Skip Setup" to bypass onboarding entirely
    const skipButton = page.locator('button:has-text("Skip Setup")');
    await skipButton.click();
    
    // Wait for the main app to load
    await page.waitForSelector('text=Workout Session', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  }
  
  // Also check if we're at a later onboarding step
  const skipSetupVisible = await page.locator('button:has-text("Skip Setup")').isVisible({ timeout: 1000 }).catch(() => false);
  if (skipSetupVisible) {
    await page.locator('button:has-text("Skip Setup")').click();
    await page.waitForSelector('text=Workout Session', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
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
  
  await page.waitForLoadState('networkidle');
  
  // Check if we're on onboarding
  const isOnboarding = await page.locator('text=Build Muscle with Science').isVisible({ timeout: 3000 }).catch(() => false);
  
  if (!isOnboarding) {
    return; // Already past onboarding
  }
  
  // Step 1: Welcome - Click Get Started
  await page.click('button:has-text("Get Started")');
  
  // Step 2: Profile Setup
  await page.waitForSelector('text=Set Up Your Profile', { timeout: 5000 });
  await page.fill('input#name', name);
  await page.click(`input[value="${experienceLevel}"]`);
  await page.click(`input[value="${unitSystem}"]`);
  await page.click('button:has-text("Continue")');
  
  // Step 3: Training Split (optional - skip it)
  await page.waitForSelector('text=Choose Your Training Split', { timeout: 5000 });
  if (trainingSplit) {
    await page.click(`input[value="${trainingSplit}"]`);
    await page.click('button:has-text("Continue")');
  } else {
    await page.click('button:has-text("Skip for now")');
  }
  
  // Step 4: First Exercise (optional - skip it)
  await page.waitForSelector('text=Add Your First Exercise', { timeout: 5000 });
  await page.click('button:has-text("Skip for now")');
  
  // Step 5: Quick Tour - Skip it
  await page.waitForSelector('text=Quick Tour', { timeout: 5000 });
  await page.click('button:has-text("Skip Tour")');
  
  // Wait for main app
  await page.waitForSelector('text=Workout Session', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
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
