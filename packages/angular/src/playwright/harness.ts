import { test as base, type Locator } from "@playwright/test";

/** What `playwright/index.ts` puts on `window` for the fixtures below to drive. */
export type OkklyHarness = {
  /** Replaces whatever is mounted with a host component built from `template`. */
  mount: (template: string) => Promise<void>;
  unmount: () => Promise<void>;
};

declare global {
  interface Window {
    okklyHarness?: OkklyHarness;
  }
}

export type HarnessFixtures = {
  /**
   * Mounts an Angular template in the harness page and returns its root
   * element. Every public export of the package is in scope. The counterpart
   * of `@playwright/experimental-ct-react`'s `mount`, with a template string
   * in place of JSX.
   */
  mountTemplate: (template: string) => Promise<Locator>;
  /** Destroys whatever `mount` rendered. */
  unmount: () => Promise<void>;
};

export const test = base.extend<HarnessFixtures>({
  mountTemplate: async ({ page }, use) => {
    await page.goto("/");
    await page.waitForFunction(() => window.okklyHarness !== undefined);
    await use(async (template) => {
      await page.evaluate((markup) => window.okklyHarness?.mount(markup), template);
      return page.locator("#root > * > *").first();
    });
  },
  unmount: async ({ page }, use) => {
    await use(async () => {
      await page.evaluate(() => window.okklyHarness?.unmount());
    });
  },
});

export { expect } from "@playwright/test";
