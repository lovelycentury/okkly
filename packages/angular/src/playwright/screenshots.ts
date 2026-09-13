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
