import type { Page } from "@playwright/test";
import { createAxeBuilder, DEFAULT_DISABLED_AXE_RULES, expect, test } from "./a11y";
import { useMatrixScreenshotTest } from "./matrix";

export type OkklyMatrixScreenshotHookContext = {
  /**
   * Axe rules to switch off for this matrix on top of the global defaults.
   *
   * **Use sparingly** — always leave a comment saying why the rule cannot hold
   * for the mounted fragment.
   *
   * @see https://playwright.dev/docs/accessibility-testing#disabling-individual-scan-rules
   */
  disabledAccessibilityRules?: string[];
};

/**
 * Every matrix screenshot doubles as an accessibility test: after each cell is
 * captured, axe scans the very DOM that was photographed. A component is only
 * signed off once it both looks right and scans clean.
 */
export const { executeMatrixScreenshotTest } =
  useMatrixScreenshotTest<OkklyMatrixScreenshotHookContext>({
    test,
    defaults: {
      hooks: {
        afterEach: async (_component, page, column, row, context) => {
          const axeBuilder = createAxeBuilder(page);

          if (context?.disabledAccessibilityRules?.length) {
            axeBuilder.disableRules(
              DEFAULT_DISABLED_AXE_RULES.concat(context.disabledAccessibilityRules),
            );
          }

          const results = await axeBuilder.analyze();

          expect(
            results.violations,
            `should pass accessibility checks for ${column} ${row}`,
          ).toEqual([]);
        },
      },
    },
  });

/**
 * A stand-in glyph for components that take an icon slot. Inlined rather than
 * imported from `@okkly/icons` because a test file's non-component imports are
 * evaluated in Node, where the package's `?raw` SVG imports do not resolve.
 *
 * Equivalent to `import { iconStar } from "@okkly/icons"`.
 */
export const MOCK_PLAYWRIGHT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.3a.5.5 0 0 1 .9 0l2.3 4.7 5.2.7a.5.5 0 0 1 .3.9l-3.8 3.6.9 5.2a.5.5 0 0 1-.8.5L12 20.3l-4.6 2.4a.5.5 0 0 1-.8-.5l.9-5.2-3.8-3.6a.5.5 0 0 1 .3-.9l5.2-.7z"/></svg>`;

/**
 * A stand-in image for components that take a `src`. Served from a route mock
 * rather than the network, so the tests neither hit the internet nor produce a
 * different pixel on every run.
 */
export const MOCK_PLAYWRIGHT_IMAGE_URL = "/mock-image.svg";

export const MOCK_PLAYWRIGHT_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" fill="#2b2f3a"/><circle cx="48" cy="38" r="16" fill="#5b6478"/><path d="M16 96c0-17.7 14.3-32 32-32s32 14.3 32 32z" fill="#5b6478"/></svg>`;

/** A deliberately unreachable URL, for the fallback/error paths. */
export const MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL = "/mock-broken-image.png";

/**
 * Registers the image mocks. Call it before mounting a component that renders
 * `MOCK_PLAYWRIGHT_IMAGE_URL` or `MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL`.
 */
export const defineImageMockRoutes = async (page: Page) => {
  await page.route(MOCK_PLAYWRIGHT_IMAGE_URL, (route) =>
    route.fulfill({ body: MOCK_PLAYWRIGHT_IMAGE, contentType: "image/svg+xml" }),
  );
  await page.route(MOCK_PLAYWRIGHT_BROKEN_IMAGE_URL, (route) => route.abort());
};
