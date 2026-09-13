import { defineConfig, devices } from "@playwright/test";

// Screenshots assert against a fixed rendering, so pin the timezone/locale the
// browser sees rather than trusting the host/CI default.
process.env.TZ = "Europe/Berlin";

// One above `@okkly/react`'s `ctPort`, so both packages' suites can run at once.
const PORT = 3101;
const baseURL = `http://localhost:${PORT}`;

/**
 * Component tests mount the real component in a real browser, so the tests
 * exercise the same CSS the package ships instead of a jsdom approximation of
 * it. Each component owns one `*.ct.ts` next to its source, as in
 * `@okkly/react`.
 *
 * Playwright ships no component-test runner for Angular
 * (`@playwright/experimental-ct-*` exists only for React, Vue and Svelte), so
 * the mount harness is our own: `playwright/index.html`, served by Vite with
 * the Angular plugin, compiles each test's template into a throwaway host
 * component. `src/playwright/harness.ts` exposes it as a `mount` fixture.
 */
export default defineConfig({
  testDir: "./src",
  testMatch: "**/*.ct.ts",

  /**
   * SCREENSHOTS
   *
   * @see https://playwright.dev/docs/screenshots
   */
  snapshotDir: "./playwright/snapshots",
  // Drop the per-test-file folder Playwright would otherwise insert: the
  // matrix name is already unique inside a component's directory.
  snapshotPathTemplate: "{snapshotDir}/{testFileDir}/{arg}-{projectName}-{platform}{ext}",
  // Snapshots are pixel-exact per platform, so a developer's macOS run would
  // otherwise fight CI's Linux baselines. Only CI compares them; refresh a
  // baseline with `PW_UPDATE_SNAPSHOTS=true`.
  ignoreSnapshots: !process.env.CI,
  updateSnapshots: process.env.PW_UPDATE_SNAPSHOTS === "true" ? "changed" : "none",
  expect: {
    toHaveScreenshot: {
      threshold: process.env.PW_UPDATE_SNAPSHOTS === "true" ? 0.1 : 0.2,
    },
  },

  /**
   * FAILURE HANDLING
   *
   * No retries on purpose: a test that only passes on the second attempt is
   * flaky, and a flaky test must be fixed rather than papered over.
   */
  timeout: 45 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,

  /**
   * SHARDING — enabled only when CI sets both variables.
   *
   * @see https://playwright.dev/docs/test-sharding
   */
  shard:
    process.env.CI && process.env.PW_SHARD && process.env.PW_TOTAL_SHARDS
      ? { current: +process.env.PW_SHARD, total: +process.env.PW_TOTAL_SHARDS }
      : null,

  reporter: process.env.CI ? [["dot"], ["blob"]] : [["html", { open: "never" }]],

  webServer: {
    command: "pnpm exec vite --config playwright/vite.config.ts",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  use: {
    baseURL,
    screenshot: process.env.CI ? "only-on-failure" : "off",
    trace: process.env.CI ? "retain-on-failure" : "off",
    video: process.env.CI ? "retain-on-failure" : "off",
    locale: "en-US",
    timezoneId: "Europe/Berlin",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
