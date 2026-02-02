/**
 * Accessibility tests for WCAG 2.1 AA compliance
 * Tests keyboard navigation, screen reader support, and focus management
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { skipOnboarding } from './helpers/skip-onboarding';

test.describe('Accessibility - WCAG 2.1 AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Skip onboarding to get to the main app
    await skipOnboarding(page);
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper HTML lang attribute', async ({ page }) => {
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('en');
  });

  test('should have skip link that is keyboard accessible', async ({ page }) => {
    // Tab to skip link
    await page.keyboard.press('Tab');
    
    // Check if skip link is visible when focused
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveText('Skip to main content');
    
    // Activate skip link
    await page.keyboard.press('Enter');
    
    // Verify focus moved to main content
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('should support full keyboard navigation in header', async ({ page }) => {
    // Tab through navigation links
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First nav link
    
    const firstNavLink = page.locator('.nav-desktop .nav-link').first();
    await expect(firstNavLink).toBeFocused();
    
    // Navigate through all nav links
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Verify we can navigate backwards
    await page.keyboard.press('Shift+Tab');
    const lastNavLink = page.locator('.nav-desktop .nav-link').nth(3);
    await expect(lastNavLink).toBeFocused();
  });

  test('should indicate current page with aria-current', async ({ page }) => {
    // Check that current page has aria-current="page"
    const activeLink = page.locator('.nav-link.active').first();
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    
    // Get computed styles of focused element
    const focusedElement = page.locator(':focus');
    const outline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
      };
    });
    
    // Verify focus indicator exists
    expect(outline.outlineStyle).not.toBe('none');
    expect(parseFloat(outline.outlineWidth)).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels on mobile navigation', async ({ page }) => {
    // Check mobile nav has proper label
    const mobileNav = page.locator('.nav-mobile');
    await expect(mobileNav).toHaveAttribute('aria-label', 'Mobile navigation');
    
    // Check individual mobile nav items have labels
    const mobileNavLinks = page.locator('.nav-mobile-link');
    const count = await mobileNavLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = mobileNavLinks.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.length).toBeGreaterThan(0);
    }
  });

  test('should have aria-hidden on decorative icons', async ({ page }) => {
    const decorativeIcons = page.locator('.nav-mobile-icon');
    const count = await decorativeIcons.count();
    
    for (let i = 0; i < count; i++) {
      await expect(decorativeIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('exercises page should be accessible', async ({ page }) => {
    // Navigate to exercises
    await page.click('text=Exercises');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('settings page should be accessible', async ({ page }) => {
    // Navigate to settings
    await page.click('text=Settings');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Dialog/Modal Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipOnboarding(page);
    await page.waitForLoadState('networkidle');
  });

  test('exercise form dialog should have proper ARIA attributes', async ({ page }) => {
    // Navigate to exercises page
    await page.click('text=Exercises');
    await page.waitForTimeout(500);
    
    // Open create exercise dialog
    const createButton = page.locator('button:has-text("Create Exercise")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(300);
      
      // Check dialog has proper ARIA attributes
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      
      // Check dialog is labeled
      const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');
      expect(ariaLabelledBy).toBeTruthy();
    }
  });

  test('dialog should trap focus', async ({ page }) => {
    // Navigate to exercises
    await page.click('text=Exercises');
    await page.waitForTimeout(500);
    
    const createButton = page.locator('button:has-text("Create Exercise")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(300);
      
      // Get all focusable elements in dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // Verify dialog has focusable elements and focus is within dialog
      const focusableElements = dialog.locator('button, input, select, textarea');
      const count = await focusableElements.count();
      expect(count).toBeGreaterThan(0);
      
      // Tab through elements and verify focus stays within dialog
      for (let i = 0; i < count + 2; i++) {
        await page.keyboard.press('Tab');
        // Get currently focused element
        const focusedInDialog = await dialog.locator(':focus').count();
        expect(focusedInDialog).toBe(1); // Focus should always be within dialog
      }
    }
  });

  test('dialog should close on ESC key', async ({ page }) => {
    // Navigate to exercises
    await page.click('text=Exercises');
    await page.waitForTimeout(500);
    
    const createButton = page.locator('button:has-text("Create Exercise")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(300);
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // Press ESC
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      
      // Dialog should be closed
      await expect(dialog).not.toBeVisible();
    }
  });
});

test.describe('Form Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipOnboarding(page);
    await page.waitForLoadState('networkidle');
  });

  test('form inputs should have associated labels', async ({ page }) => {
    // Navigate to exercises
    await page.click('text=Exercises');
    await page.waitForTimeout(500);
    
    const createButton = page.locator('button:has-text("Create Exercise")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(300);
      
      // Check that all inputs have labels
      const inputs = page.locator('input[type="text"], select, textarea');
      const count = await inputs.count();
      
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    }
  });

  test('required fields should be marked with aria-required', async ({ page }) => {
    // Navigate to exercises
    await page.click('text=Exercises');
    await page.waitForTimeout(500);
    
    const createButton = page.locator('button:has-text("Create Exercise")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(300);
      
      // Check required inputs have aria-required
      const requiredInputs = page.locator('input[required]');
      const count = await requiredInputs.count();
      
      for (let i = 0; i < count; i++) {
        const input = requiredInputs.nth(i);
        const ariaRequired = await input.getAttribute('aria-required');
        expect(ariaRequired).toBe('true');
      }
    }
  });

  test('form errors should be announced to screen readers', async ({ page }) => {
    // Navigate to exercises
    await page.click('text=Exercises');
    await page.waitForTimeout(500);
    
    const createButton = page.locator('button:has-text("Create Exercise")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(300);
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(300);
      
      // Check if error message has proper ARIA attributes
      const errorMessage = page.locator('.form-error');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toHaveAttribute('role', 'alert');
        await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      }
    }
  });
});

test.describe('Color Contrast', () => {
  test('should meet minimum color contrast ratios', async ({ page }) => {
    await page.goto('/');
    await skipOnboarding(page);
    await page.waitForLoadState('networkidle');
    
    // Run axe with color-contrast rule
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Reduced Motion Support', () => {
  test('should respect prefers-reduced-motion', async ({ page, context }) => {
    // Set reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      });
    });
    
    await page.goto('/');
    await skipOnboarding(page);
    await page.waitForLoadState('networkidle');
    
    // Verify reduced motion CSS is applied
    const animationDuration = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return style.transitionDuration;
    });
    
    // With reduced motion, animations should be instant or nearly instant
    // CSS may report either '0s' or '0.01ms' depending on browser
    expect(['0s', '0.01ms', '0.001ms']).toContain(animationDuration);
  });
});
