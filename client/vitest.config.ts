import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [], // We can import @testing-library/jest-dom inline inside the test files
  },
});
