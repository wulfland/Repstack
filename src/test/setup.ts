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

// Node 22+ ships its own `localStorage` global that is a non-functional stub
// unless --localstorage-file is set, and it shadows jsdom's implementation.
// Replace it with a small in-memory Storage so tests behave like CI (Node 20).
if (
  typeof localStorage === 'undefined' ||
  typeof localStorage.clear !== 'function'
) {
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
