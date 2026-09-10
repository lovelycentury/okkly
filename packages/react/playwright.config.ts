import { fileURLToPath } from "node:url";
import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/experimental-ct-react";
import react from "@vitejs/plugin-react";

export type DefineOkklyPlaywrightConfigOptions = {
  /**
   * Run the tests in every browser okkly targets, or only in Chromium.
   *
   * @default "single"
   */
  browsers?: "all" | "single";
  /** Custom overrides for the Playwright config. */
  overrides?: PlaywrightTestConfig;
};

/**
 * Component tests mount the real component in a real browser, so the tests
 * exercise the same CSS the package ships instead of a jsdom approximation of
 * it. Each component owns one `*.ct.tsx` next to its source.
 *
 * @see https://playwright.dev/docs/test-components
 */
const getDefaultConfig = (options?: DefineOkklyPlaywrightConfigOptions) => {
  const config = {
    testDir: "./src",
    testMatch: "**/*.ct.?(c|m)[jt]s?(x)",

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
    use: {
      screenshot: process.env.CI ? "only-on-failure" : "off",
      trace: process.env.CI ? "retain-on-failure" : "off",
      video: process.env.CI ? "retain-on-failure" : "off",
      locale: "en-US",
      timezoneId: "Europe/Berlin",
      ctPort: 3100,
      ctViteConfig: {
        plugins: [react()],
        resolve: {
          alias: {
            // The component tests import from the sources, never from `dist`.
            "@okkly/react": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
          },
        },
      },
    },

    projects: [
      { name: "chromium", use: { ...devices["Desktop Chrome"] } },
      { name: "firefox", use: { ...devices["Desktop Firefox"] } },
      { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ],
  } satisfies PlaywrightTestConfig;

  if ((options?.browsers ?? "single") === "single") {
    config.projects = config.projects.filter(({ name }) => name === "chromium");
  }

  return config;
};

export default defineConfig(getDefaultConfig(), {});
