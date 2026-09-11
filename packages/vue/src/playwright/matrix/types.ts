import type { test } from "@playwright/experimental-ct-vue";
import type { LocatorScreenshotOptions } from "playwright-core";
import type { Component } from "vue";

export type HookContext = Record<PropertyKey, unknown>;

export type TestArgs = Parameters<Parameters<typeof test>[2]>[0];

/**
 * What to mount for one column/row combination. Vue's `mount()` takes the
 * component reference and its props/slots/listeners separately — there is no
 * single "element" the way React's `component(column, row)` returns one, so
 * the builder returns this bag instead.
 */
export type MatrixCellArgs = {
  props?: Record<string, unknown>;
  /** Slot content, as the raw markup Playwright's Vue mount compiles. */
  slots?: Record<string, string>;
  on?: Record<string, (...args: unknown[]) => void>;
};

export type UseMatrixScreenshotTestOptions<TContext extends HookContext = HookContext> = {
  /**
   * Defaults applied to every matrix screenshot, merged with the options of
   * the individual test.
   */
  defaults?: Partial<
    Pick<
      MatrixScreenshotTestOptions<string, string, TContext>,
      "removePadding" | "hooks" | "screenshotOptions"
    >
  >;
  /**
   * A custom `test` function, e.g. one carrying extra fixtures.
   *
   * @see https://playwright.dev/docs/test-fixtures#creating-a-fixture
   */
  test?: typeof test;
};

export type MatrixScreenshotTestOptions<
  TColumn extends string = string,
  TRow extends string = string,
  TContext extends HookContext = HookContext,
> = {
  /** Shown above the matrix and used as the snapshot filename. */
  name: string;
  columns: readonly TColumn[];
  rows: readonly TRow[];
  /** The component under test. */
  component: Component;
  /** Builds the props/slots/listeners for one column/row combination. */
  args: (column: TColumn, row: TRow) => MatrixCellArgs;
  /**
   * Mount every combination at once instead of one at a time. Much faster, but
   * the hooks are skipped — so it cannot capture hover/focus/active states.
   */
  fastNoIsolation?: boolean;
  /** Callbacks around each individual capture. */
  hooks?: ScreenshotTestHooks<TColumn, TRow, TContext>;
  /** Drop the `1rem` padding drawn around each cell. */
  removePadding?: boolean;
  /**
   * Passed to every hook. Useful for per-matrix options such as relaxing one
   * accessibility rule.
   */
  context?: TContext;
  /** Forwarded to Playwright's `.screenshot()`. Animations are disabled by default. */
  screenshotOptions?: LocatorScreenshotOptions;
  /**
   * What to photograph for each cell.
   *
   * `"component"` (the default) captures the mounted element. Use `"page"` for
   * a component that portals its content to `document.body` — an overlay is not
   * inside the mount root, so capturing the component would photograph an empty
   * box. Only meaningful without `fastNoIsolation`, since every cell needs the
   * viewport to itself.
   */
  screenshotTarget?: "component" | "page";
};

export type ScreenshotTestHook<
  TColumn extends string,
  TRow extends string,
  TContext extends HookContext = HookContext,
> = (
  component: TestArgs["mount"] extends (...args: never[]) => Promise<infer R> ? R : never,
  page: TestArgs["page"],
  column: TColumn,
  row: TRow,
  context?: TContext,
) => Promise<void>;

export type ScreenshotTestHooks<
  TColumn extends string,
  TRow extends string,
  TContext extends HookContext = HookContext,
> = Partial<{
  /**
   * Runs before each individual capture — hover, focus, open a flyout, assert
   * something. Focus and mouse are reset before every combination.
   */
  beforeEach: ScreenshotTestHook<TColumn, TRow, TContext>;
  /** Runs after each capture, e.g. to undo what `beforeEach` set up. */
  afterEach: ScreenshotTestHook<TColumn, TRow, TContext>;
}>;
