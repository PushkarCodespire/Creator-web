import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Increased from default 5000ms — many tests render heavy Ant Design components
    // under CPU contention from parallel workers, causing false timeouts
    testTimeout: 15000,
    // Limit parallel workers to avoid CPU starvation on large suites
    // Vitest 4: poolOptions was removed; maxWorkers is now a top-level test option
    maxWorkers: 4,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],
      reportOnFailure: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/vite-env.d.ts',
      ],
    },
  },
});
