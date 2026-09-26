import type { Page } from "@playwright/test";
import { useMatrixScreenshotTest } from "./matrix";

export const { executeMatrixScreenshotTest } = useMatrixScreenshotTest();

/**
 * A stand-in glyph for components that take an icon slot — the same star
 * `@okkly/react`'s tests use. Add the slot's marker attribute before
 * projecting it, e.g. `MOCK_PLAYWRIGHT_ICON.replace("<svg", "<svg okklyButtonStartIcon")`.
 *
 * Equivalent to `import { iconStar } from "@okkly/icons"`.
 */
export const MOCK_PLAYWRIGHT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.3a.5.5 0 0 1 .9 0l2.3 4.7 5.2.7a.5.5 0 0 1 .3.9l-3.8 3.6.9 5.2a.5.5 0 0 1-.8.5L12 20.3l-4.6 2.4a.5.5 0 0 1-.8-.5l.9-5.2-3.8-3.6a.5.5 0 0 1 .3-.9l5.2-.7z"/></svg>`;

/** A local image URL the mocks below answer with a neutral silhouette, as in `@okkly/react`. */
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
