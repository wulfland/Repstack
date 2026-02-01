/**
 * Script to capture screenshots of the onboarding flow
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureOnboardingScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = join(__dirname, '../screenshots');
  try {
    mkdirSync(screenshotsDir, { recursive: true });
  } catch {
    // Directory exists
  }

  console.log('Starting screenshot capture...');

  // Navigate to app
  await page.goto('http://localhost:5173/');

  // Clear database to ensure onboarding shows
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('RepstackDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  });

  await page.reload();
  await page.waitForTimeout(2000);

  // Screenshot 1: Welcome screen
  console.log('Capturing welcome screen...');
  await page.screenshot({
    path: join(screenshotsDir, '01-onboarding-welcome.png'),
    fullPage: true,
  });

  // Screenshot 2: Profile setup
  console.log('Capturing profile setup...');
  await page.click('button:has-text("Get Started")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(screenshotsDir, '02-onboarding-profile.png'),
    fullPage: true,
  });

  // Fill in some data to show interaction
  await page.fill('input#name', 'Alex Johnson');
  await page.click('input[value="intermediate"]');
  await page.click('input[value="metric"]');
  await page.screenshot({
    path: join(screenshotsDir, '02b-onboarding-profile-filled.png'),
    fullPage: true,
  });

  // Screenshot 3: Training split
  console.log('Capturing training split...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(screenshotsDir, '03-onboarding-split.png'),
    fullPage: true,
  });

  // Select a split
  await page.click('input[value="push_pull_legs"]');
  await page.screenshot({
    path: join(screenshotsDir, '03b-onboarding-split-selected.png'),
    fullPage: true,
  });

  // Screenshot 4: First exercise
  console.log('Capturing first exercise prompt...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(screenshotsDir, '04-onboarding-first-exercise.png'),
    fullPage: true,
  });

  // Screenshot 5: Quick tour
  console.log('Capturing quick tour...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(screenshotsDir, '05-onboarding-tour-1.png'),
    fullPage: true,
  });

  // Next slide
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(screenshotsDir, '05b-onboarding-tour-2.png'),
    fullPage: true,
  });

  // Complete onboarding
  console.log('Completing onboarding...');
  await page.click('button:has-text("Skip Tour")');
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: join(screenshotsDir, '06-main-app-after-onboarding.png'),
    fullPage: true,
  });

  console.log('Screenshots captured successfully!');
  console.log(`Screenshots saved to: ${screenshotsDir}`);

  await browser.close();
}

captureOnboardingScreenshots().catch(console.error);
