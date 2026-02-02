import { test, expect } from '@playwright/test';
import { skipOnboarding } from './helpers/skip-onboarding';

/**
 * E2E tests for offline functionality
 * Tests the PWA's ability to work completely offline
 */

test.describe('Offline Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('/');
    
    // Skip onboarding to get to the main app
    await skipOnboarding(page);
    
    // Wait for the main app content to render (status-bar indicates main app is loaded)
    await page.locator('.status-bar').waitFor({ state: 'visible', timeout: 10000 });
    
    // Give service worker time to cache assets
    await page.waitForTimeout(1000);
  });

  test('should display the app when online', async ({ page }) => {
    // Verify app loads normally when online
    const content = await page.content();
    expect(content.toLowerCase()).toContain('repstack');
    
    // Check for online status indicator (already waited for status-bar in beforeEach)
    const status = page.locator('.status');
    await expect(status).toBeVisible({ timeout: 5000 });
    await expect(status).toHaveClass(/online/);
  });

  test('should show service worker is registered', async ({ page }) => {
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test('should work offline after initial load', async ({ page, context }) => {
    // First, ensure the app loads and service worker caches everything
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Wait a bit for offline mode to register
    await page.waitForTimeout(500);
    
    // Check for offline status indicator
    const status = page.locator('.status');
    await expect(status).toHaveClass(/offline/, { timeout: 5000 });
    
    // Navigate to different pages to test they load from cache
    const exercisesLink = page.locator('a[href*="exercise"]').first();
    if (await exercisesLink.isVisible()) {
      await exercisesLink.click();
      await page.waitForTimeout(500);
      
      // Should still see content
      const content = await page.content();
      expect(content.toLowerCase()).toContain('exercise');
    }
    
    // Navigate to mesocycles
    const mesocyclesLink = page.locator('a[href*="mesocycle"]').first();
    if (await mesocyclesLink.isVisible()) {
      await mesocyclesLink.click();
      await page.waitForTimeout(500);
      
      // Should still see content
      const content = await page.content();
      expect(content.toLowerCase()).toContain('mesocycle');
    }
    
    // Navigate back to home/workout
    const workoutLink = page.locator('a[href*="workout"], a:has-text("Workout")').first();
    if (await workoutLink.isVisible()) {
      await workoutLink.click();
      await page.waitForTimeout(500);
    }
    
    // App should still be functional
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain('repstack');
  });

  test('should persist data in IndexedDB offline', async ({ page, context }) => {
    // Create an exercise while online
    const exercisesLink = page.locator('a[href*="exercise"]').first();
    if (await exercisesLink.isVisible()) {
      await exercisesLink.click();
      await page.waitForTimeout(1000);
      
      // Look for create exercise button
      const createBtn = page.locator('button:has-text("Create Exercise"), button:has-text("Add Exercise")').first();
      
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(500);
        
        // Fill in exercise details
        const nameInput = page.locator('input[name="name"], input#name, input[placeholder*="name"]').first();
        if (await nameInput.isVisible()) {
          const exerciseName = `Offline Test ${Date.now()}`;
          await nameInput.fill(exerciseName);
          
          // Submit the form
          const saveBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await page.waitForTimeout(1000);
            
            // Verify exercise was created
            const pageContent = await page.content();
            expect(pageContent).toContain(exerciseName);
            
            // Now go offline
            await context.setOffline(true);
            await page.waitForTimeout(1000);
            
            // Exercise should still be visible
            await page.reload();
            await page.waitForTimeout(2000);
            
            const offlineContent = await page.content();
            expect(offlineContent).toContain(exerciseName);
          }
        }
      }
    }
  });

  test('should handle app restart while offline', async ({ page, context }) => {
    // Load app while online
    await page.waitForTimeout(1000);
    
    // Go offline
    await context.setOffline(true);
    
    // Reload the page (simulating app restart)
    await page.reload();
    
    // Wait for app to load from cache
    await page.locator('.status-bar').waitFor({ state: 'visible', timeout: 10000 });
    
    // App should load from cache
    const content = await page.content();
    expect(content.toLowerCase()).toContain('repstack');
    
    // Offline indicator should be visible
    const status = page.locator('.status');
    await expect(status).toHaveClass(/offline/, { timeout: 5000 });
  });

  test('should handle transition from online to offline gracefully', async ({ page, context }) => {
    // Verify we start online
    const status = page.locator('.status');
    await expect(status).toHaveClass(/online/, { timeout: 5000 });
    
    // Go offline
    await context.setOffline(true);
    
    // Wait for transition
    await page.waitForTimeout(500);
    
    // Should show offline indicator
    await expect(status).toHaveClass(/offline/, { timeout: 5000 });
    
    // App should still be functional
    const content = await page.content();
    expect(content.toLowerCase()).toContain('repstack');
    
    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(500);
    
    // Should show online indicator again
    await expect(status).toHaveClass(/online/, { timeout: 5000 });
  });

  test('should not show error messages when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    
    // Navigate around the app
    const nav = page.locator('nav a, .nav a');
    const linkCount = await nav.count();
    
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      await nav.nth(i).click();
      await page.waitForTimeout(1000);
      
      // Check for error messages
      const errorMessages = page.locator('.error, [class*="error"], [role="alert"]');
      const errorCount = await errorMessages.count();
      
      // If errors exist, check they're not network-related
      if (errorCount > 0) {
        const errorText = await errorMessages.first().textContent();
        expect(errorText?.toLowerCase()).not.toContain('network');
        expect(errorText?.toLowerCase()).not.toContain('fetch');
        expect(errorText?.toLowerCase()).not.toContain('connection');
      }
    }
  });

  test('should support PWA installation', async ({ page }) => {
    // Verify the app has proper PWA manifest configuration
    // The test environment might not support all PWA features,
    // but we can verify the manifest is linked
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    expect(manifestLink).toBeGreaterThan(0);
  });

  test('should have proper manifest configuration', async ({ page }) => {
    // Fetch and validate manifest
    const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestUrl).toBeTruthy();
    
    if (manifestUrl) {
      const response = await page.goto(new URL(manifestUrl, page.url()).href);
      expect(response?.status()).toBe(200);
      
      const manifest = await response?.json();
      expect(manifest?.name).toBeTruthy();
      expect(manifest?.short_name).toBeTruthy();
      expect(manifest?.display).toBe('standalone');
      expect(manifest?.icons?.length).toBeGreaterThan(0);
      expect(manifest?.start_url).toBeTruthy();
    }
  });
});

test.describe('Offline Data Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await page.waitForTimeout(200);
    await page.waitForTimeout(2000);
  });

  test('should allow workout logging while offline', async ({ page, context }) => {
    // Go offline immediately
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    
    // Try to access workout section
    const workoutLink = page.locator('a:has-text("Workout"), button:has-text("Start Workout")').first();
    
    if (await workoutLink.isVisible()) {
      await workoutLink.click();
      await page.waitForTimeout(1000);
      
      // Should be able to interact with workout UI
      const content = await page.content();
      expect(content.toLowerCase()).toMatch(/workout|exercise/);
    }
  });

  test('should allow viewing progress while offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    
    // Navigate to progress/history
    const progressLink = page.locator('a[href*="progress"], a:has-text("Progress")').first();
    
    if (await progressLink.isVisible()) {
      await progressLink.click();
      await page.waitForTimeout(1000);
      
      // Should show progress content
      const content = await page.content();
      expect(content.toLowerCase()).toMatch(/progress|history/);
    }
  });

  test('should allow mesocycle management while offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    
    // Navigate to mesocycles
    const mesocycleLink = page.locator('a[href*="mesocycle"]').first();
    
    if (await mesocycleLink.isVisible()) {
      await mesocycleLink.click();
      await page.waitForTimeout(1000);
      
      // Should show mesocycle content
      const content = await page.content();
      expect(content.toLowerCase()).toContain('mesocycle');
    }
  });
});
