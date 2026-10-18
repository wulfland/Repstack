---
name: verify
description: Build Repstack, start it, drive the current change in a real browser with Playwright and report PASS/FAIL per step. Use after a UI change, before opening a PR, or when asked to verify.
---

# Verify the running app

Unit tests prove the logic. This proves the screen. Run every step; do not
skip a failing step to reach the next one. Finish with the report format at
the bottom, nothing else. If `$ARGUMENTS` contains `full`, also run the whole
existing e2e suite in step 5.

## 1. Static checks (stop here on failure)

```bash
npm run type-check && npm run lint && npm run format:check && npm run test:run
```

## 2. Work out what to verify

`git diff --name-only main...HEAD` plus `git status --short`. From the files
touched, decide the user journey that exercises the change, and which feature
flags it needs (`src/lib/featureFlags.ts`). If nothing in `src/` changed, say
so and stop with the static results.

## 3. Write a throwaway Playwright spec

Create `e2e/verify.tmp.spec.ts` (gitignored). Use the helpers:

```ts
import { test, expect } from '@playwright/test';
import { skipOnboarding } from './helpers/skip-onboarding';
import { seedWorkout } from './helpers/seed-workout';

test('change works in the running app', async ({ page }) => {
  await page.goto('/?ff=<flags>'); // enables flags, persists to localStorage
  await skipOnboarding(page);
  await seedWorkout(page); // one completed workout, if the journey needs one
  await page.reload();
  await skipOnboarding(page);
  await page.getByRole('link', { name: 'Progress' }).first().click();
  await page.locator('.workout-card').first().click();
  await expect(
    page.getByRole('heading', { name: 'Workout Details' })
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/verify/01-detail.png' });
  // ... then the change itself
});
```

Rules for the spec:
- Reach the feature the way a user would (nav → page → card → modal).
- Prefer `getByRole` with a name. Plain `getByText('Bench Press')` hits the
  exercise dropdown too and fails strict mode. Grant clipboard permission when the
  change copies: `test.use({ permissions: ['clipboard-read', 'clipboard-write'] })`
  and assert with `page.evaluate(() => navigator.clipboard.readText())`.
- Also assert the flag-**off** case once: without `?ff=`, the control is absent.
- One screenshot per step into `test-results/verify/NN-<step>.png`.

## 4. Build and drive it

`npx playwright test e2e/verify.tmp.spec.ts --headed --project=chromium`
Playwright builds and serves the app itself (`npm run preview` on :4173 via
`playwright.config.ts`). `--headed` shows the browser; drop it when running
unattended. Run the suite with `npx playwright test` only when asked (`full`).

## 5. Clean up

Delete `e2e/verify.tmp.spec.ts`. Leave `test-results/verify/` for the report.

## Report (print exactly this shape)

```
/verify — <branch> — <N> s

| Step                    | Result | Note                       |
|-------------------------|--------|----------------------------|
| type-check, lint, format| PASS   |                            |
| unit tests              | PASS   | 184 tests                  |
| build + preview         | PASS   |                            |
| flag off: control absent| PASS   |                            |
| flag on: <journey>      | PASS   | test-results/verify/03.png |

Overall: PASS
```

On FAIL, include the failing assertion and the screenshot path, and stop.
