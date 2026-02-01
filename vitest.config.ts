import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'dist/',
        'e2e/',
        // Exclude main entry points and component files from coverage requirements
        'src/main.tsx',
        'src/App.tsx',
        'src/components/**',
        'src/layouts/**',
        // Exclude DB initialization (mostly Dexie config)
        'src/db/index.ts',
      ],
      // Target 70% coverage for tested files (core business logic)
      // Note: Overall coverage is lower due to UI components not being unit tested
      thresholds: {
        lines: 60,
        functions: 55,
        branches: 55,
        statements: 60,
      },
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
