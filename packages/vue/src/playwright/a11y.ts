import { AxeBuilder } from "@axe-core/playwright";
import { test as base } from "@playwright/experimental-ct-vue";
import type { Page } from "@playwright/test";

export { expect } from "@playwright/experimental-ct-vue";

/** The WCAG levels every okkly component is held to. */
export const A11Y_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Axe rules switched off for every scan.
 *
 * `color-contrast` is disabled because a mounted component sits on the bare
 * harness body rather than on the surface it is designed for, so axe measures
 * a contrast pair the component never actually renders against.
 */
export const DEFAULT_DISABLED_AXE_RULES = ["color-contrast"];

/** An `AxeBuilder` carrying the okkly configuration. */
export const createAxeBuilder = (page: Page) =>
  new AxeBuilder({ page }).withTags(A11Y_TAGS).disableRules(DEFAULT_DISABLED_AXE_RULES);

export type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

/**
 * The base `test` for every component test, extended with a consistently
 * configured axe builder.
 *
 * @see https://playwright.dev/docs/accessibility-testing#using-a-test-fixture-for-common-axe-configuration
 */
export const test: ReturnType<typeof base.extend<AxeFixture>> = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => createAxeBuilder(page));
  },
});
