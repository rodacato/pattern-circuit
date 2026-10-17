import { defineConfig, devices } from '@playwright/test'

export const COURSE_PORT = 4393
export const HOST_PORT = 5180

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: `http://localhost:${COURSE_PORT}`,
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // The circuit is a WebGL canvas: headless CI has no GPU, so it renders in software.
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
      },
    },
  ],
  webServer: [
    // The production build, as published: the dev server re-optimizes Pixi mid-run and breaks its dynamic imports.
    { command: `npx vite build && npx vite preview --port ${COURSE_PORT} --strictPort`, url: `http://localhost:${COURSE_PORT}`, reuseExistingServer: false, timeout: 120_000 },
    { command: 'npx vite --config host-test/vite.config.ts', url: `http://localhost:${HOST_PORT}`, reuseExistingServer: false, timeout: 60_000 },
  ],
})
