# Testing Guide for Repstack

This document describes the testing infrastructure and how to run tests for the Repstack application.

## Testing Stack

- **Unit Testing**: [Vitest](https://vitest.dev/) - Fast unit test framework with great TypeScript support
- **E2E Testing**: [Playwright](https://playwright.dev/) - End-to-end testing across browsers
- **Code Coverage**: Vitest with v8 coverage provider
- **Database Mocking**: fake-indexeddb for IndexedDB operations

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (great for development)
npm run test:ui

# Run tests once (for CI)
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests (builds app first)
npm run test:e2e

# Run E2E tests with UI (interactive mode)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

## Test Structure

```
src/
├── lib/
│   ├── validation.ts              # Business logic
│   ├── validation.test.ts         # Unit tests
│   ├── progressTracking.ts
│   ├── progressTracking.test.ts
│   ├── mesocycleUtils.ts
│   └── mesocycleUtils.test.ts
├── db/
│   ├── service.ts                 # Database operations
│   └── service.test.ts            # Integration tests
└── test/
    └── setup.ts                    # Test configuration

e2e/
├── accessibility.spec.ts          # Accessibility tests
├── mesocycle.spec.ts              # Mesocycle workflow tests
└── offline.spec.ts                # Offline functionality tests
```

## Test Categories

### Unit Tests (Vitest)

**Validation Tests** (`validation.test.ts`) - 74 tests
- Type guards for data types
- Data validation for all models
- Input sanitization
- Edge cases and error conditions

**Progress Tracking Tests** (`progressTracking.test.ts`) - 36 tests
- 1RM calculations (Epley & Brzycki formulas)
- Volume calculations (set, exercise, workout)
- Personal records tracking
- Training statistics
- Progress trends

**Mesocycle Utils Tests** (`mesocycleUtils.test.ts`) - 39 tests
- Week calculations
- Progress updates
- Mesocycle completion checks
- Split day rotation
- Database integration

**Database Service Tests** (`service.test.ts`) - 28 tests
- CRUD operations for all entities
- Data validation integration
- Transaction flows
- Error handling

### Integration Tests

Integration tests are included within the service tests and test the complete flow of data through the application layers.

### E2E Tests (Playwright)

**Accessibility Tests** (`accessibility.spec.ts`)
- WCAG compliance checks
- Keyboard navigation
- Screen reader compatibility
- Focus management

**Mesocycle Tests** (`mesocycle.spec.ts`)
- Complete mesocycle creation flow
- Exercise configuration
- Workout logging
- Progress tracking

**Offline Tests** (`offline.spec.ts`)
- Service worker functionality
- Offline data access
- Data persistence

## Coverage Requirements

We maintain the following coverage thresholds for core business logic:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

Current coverage for core business logic (`src/lib`):
- **Overall**: 95%+ ✅

Note: Coverage requirements exclude UI components, test files, and configuration files.

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { calculateOneRepMax } from '../lib/progressTracking';

describe('calculateOneRepMax', () => {
  it('should calculate 1RM using Epley formula', () => {
    // 100kg for 5 reps should be ~116.67kg 1RM
    expect(calculateOneRepMax(100, 5)).toBeCloseTo(116.67, 1);
  });

  it('should return 0 for invalid inputs', () => {
    expect(calculateOneRepMax(0, 5)).toBe(0);
    expect(calculateOneRepMax(100, 0)).toBe(0);
  });
});
```

### Database Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../db';
import { createExercise, getExercise } from '../db/service';

describe('Exercise CRUD', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should create and retrieve an exercise', async () => {
    const id = await createExercise({
      name: 'Bench Press',
      category: 'barbell',
      muscleGroups: ['chest', 'triceps'],
      isCustom: true,
    });

    const exercise = await getExercise(id);
    expect(exercise?.name).toBe('Bench Press');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should create a new exercise', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Exercises');
  await page.click('text=Add Exercise');
  
  await page.fill('[name="name"]', 'Squat');
  await page.selectOption('[name="category"]', 'barbell');
  await page.check('[value="quads"]');
  
  await page.click('text=Save');
  
  await expect(page.locator('text=Squat')).toBeVisible();
});
```

## CI/CD Integration

Tests run automatically on:
- Every pull request
- Every push to main branch
- Before deployment

### CI Workflow

1. Install dependencies
2. Run linter
3. Check formatting
4. Type check
5. **Run unit tests**
6. **Generate coverage report**
7. Build application
8. Run E2E tests (after deployment)

Coverage reports are uploaded to Codecov for tracking over time.

## Best Practices

### Unit Tests
- Test one thing per test case
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions

### E2E Tests
- Test critical user paths
- Keep tests independent
- Use data-testid for stable selectors
- Clean up test data
- Test offline scenarios

### Database Tests
- Always clean up before/after tests
- Test complete flows, not just happy paths
- Verify data integrity
- Test concurrent operations

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test validation.test.ts

# Run tests matching pattern
npm test -- --grep "1RM"

# Debug with UI
npm run test:ui
```

### E2E Tests

```bash
# Debug with Playwright Inspector
npm run test:e2e:headed

# Use Playwright UI mode
npm run test:e2e:ui

# Generate trace for failed tests
npm run test:e2e -- --trace on
```

## Troubleshooting

### Tests are slow
- Run specific test files instead of all tests
- Use `test.skip()` to temporarily disable slow tests
- Check for unnecessary async operations

### IndexedDB errors
- Make sure `fake-indexeddb` is properly set up in test config
- Clean up database in `beforeEach`/`afterEach` hooks
- Check for hanging promises

### E2E tests fail intermittently
- Increase timeouts for slow operations
- Use proper wait conditions (`page.waitForSelector`)
- Check for race conditions
- Ensure test data is properly set up

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/)
- [Kent C. Dodds - Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
