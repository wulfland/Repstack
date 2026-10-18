# E2E helpers

- `skip-onboarding.ts` — `skipOnboarding(page)` gets past the first-run wizard;
  `completeOnboarding(page, opts)` fills it in; `resetToFreshState(page)` wipes the DB.
- `seed-workout.ts` — `seedWorkout(page)` writes one completed workout (Bench Press,
  Barbell Row) directly into IndexedDB. Reload the page afterwards, then open
  Progress → the workout card → detail modal.

Feature flags: open the app with `/?ff=flag_a,flag_b` (see `src/lib/featureFlags.ts`).
