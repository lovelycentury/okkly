import { test as base, type Locator } from "@playwright/test";

/** The values a mounted template binds to, as `state().<key>`. */
export type HarnessState = Record<string, unknown>;

/** One output a template reported through `record(name, value)`. */
export type HarnessEvent = { name: string; value?: unknown };

/** What `playwright/index.ts` puts on `window` for the fixtures below to drive. */
export type OkklyHarness = {
  /** Replaces whatever is mounted with a host component built from `template`. */
  mount: (template: string, state?: HarnessState) => Promise<void>;
  unmount: () => Promise<void>;
  /** Patches the host's `state` and re-renders. */
  update: (patch: HarnessState) => Promise<void>;
  /** Every output recorded since the last `mount`, oldest first. */
  events: () => HarnessEvent[];
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
   *
   * Bind an input a test changes later to `state().<key>` and pass its starting
   * value in `state`; report an output with `record('<name>', $event)`.
   */
  mountTemplate: (template: string, state?: HarnessState) => Promise<Locator>;
  /** Destroys whatever `mount` rendered. */
  unmount: () => Promise<void>;
  /**
   * Patches the mounted template's `state` and re-renders — the counterpart of
   * React's `component.update()`.
   */
  update: (patch: HarnessState) => Promise<void>;
  /**
   * The values the template passed to `record(name, …)`, oldest first — the
   * counterpart of a callback prop. Record only serializable values.
   */
  recordedEvents: (name: string) => Promise<unknown[]>;
};

export const test = base.extend<HarnessFixtures>({
  mountTemplate: async ({ page }, use) => {
    await page.goto("/");
    await page.waitForFunction(() => window.okklyHarness !== undefined);
    await use(async (template, state = {}) => {
      await page.evaluate(
        ([markup, initialState]) => window.okklyHarness?.mount(markup, initialState),
        [template, state] as const,
      );
      return page.locator("#root > * > *").first();
    });
  },
  unmount: async ({ page }, use) => {
    await use(async () => {
      await page.evaluate(() => window.okklyHarness?.unmount());
    });
  },
  update: async ({ page }, use) => {
    await use(async (patch) => {
      await page.evaluate((statePatch) => window.okklyHarness?.update(statePatch), patch);
    });
  },
  recordedEvents: async ({ page }, use) => {
    await use((name) =>
      page.evaluate(
        (eventName) =>
          (window.okklyHarness?.events() ?? [])
            .filter((event) => event.name === eventName)
            .map((event) => event.value),
        name,
      ),
    );
  },
});

export { expect } from "@playwright/test";
