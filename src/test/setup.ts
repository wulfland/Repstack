/**
 * Test setup file for Vitest
 * Configures global test environment including IndexedDB mocking
 */

import { beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';

// Mock crypto.randomUUID for consistent IDs in tests
if (typeof crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => Math.random().toString(36).substring(2, 15),
  } as Crypto;
} else if (!crypto.randomUUID) {
  crypto.randomUUID = () => Math.random().toString(36).substring(2, 15);
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
