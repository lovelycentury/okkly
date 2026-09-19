import { expect, type Locator, type Page } from "@playwright/test";
import { test as baseTest } from "../harness";
import { getCellId, ScreenshotMatrix } from "./ScreenshotMatrix";
import type {
  HookContext,
  MatrixScreenshotTestOptions,
  UseMatrixScreenshotTestOptions,
} from "./types";

/**
 * Builds the `executeMatrixScreenshotTest` helper the component tests use — a
 * port of `@okkly/react`'s, taking Angular templates where that one takes JSX.
 *
 * One matrix produces exactly one committed baseline image holding every
 * column/row variant of a component. That keeps the snapshot count low enough
 * to review by eye, and a regression shows up as a labelled cell in the diff
 * rather than as a wall of near-identical files.
 */
export const useMatrixScreenshotTest = <TContext extends HookContext = HookContext>(
  globalOptions: UseMatrixScreenshotTestOptions<TContext> = {},
) => {
  const test = globalOptions.test ?? baseTest;

  /** The box each cell is rendered in; `gridArea` places it inside a matrix. */
  const wrapCell = (template: string, removePadding: boolean | undefined, gridArea?: string) => {
    const style = [
      "display: grid",
      "width: max-content",
      !removePadding && "padding: 1rem",
      gridArea && `grid-area: ${gridArea}`,
    ]
      .filter(Boolean)
      .join("; ");
    return `<div style="${style}">${template}</div>`;
  };

  /**
   * Mounts every combination on its own, so a hook can hover, focus or open it
   * before the capture. Each cell is screenshotted separately and the images
   * are then stitched into a single matrix that is compared as a whole.
   */
  const testWithIsolation = <TColumn extends string, TRow extends string>(
    options: MatrixScreenshotTestOptions<TColumn, TRow, TContext>,
  ) => {
    test(options.name, async ({ mountTemplate, unmount, page, browserName, context }) => {
      const timeoutPerScreenshot = 25 * 1000;
      test.setTimeout(options.columns.length * options.rows.length * timeoutPerScreenshot);

      const removePadding = options.removePadding ?? globalOptions.defaults?.removePadding;

      const captureCell = async (template: string, column: TColumn, row: TRow) => {
        // Reset any pointer/focus state the previous cell left behind.
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
        await page.mouse.move(0, 0);
        await page.mouse.up();

        const component = await mountTemplate(template);

        await globalOptions.defaults?.hooks?.beforeEach?.(
          component,
          page,
          column,
          row,
          options.context,
        );
        await options.hooks?.beforeEach?.(component, page, column, row, options.context);

        // An overlay portals out of the mount root, so those cells photograph
        // the whole viewport instead of the component's own (empty) box.
        const capturePage = options.screenshotTarget === "page";
        const screenshotOptions = {
          animations: "disabled" as const,
          ...globalOptions.defaults?.screenshotOptions,
          ...options.screenshotOptions,
        };
        const screenshot = capturePage
          ? await page.screenshot(screenshotOptions)
          : await component.screenshot(screenshotOptions);

        // Browsers differ in device pixel ratio, so the raw image can come back
        // at 2x. Read the CSS box and size the <img> with it below.
        const box = capturePage ? page.viewportSize() : await component.boundingBox();

        await globalOptions.defaults?.hooks?.afterEach?.(
          component,
          page,
          column,
          row,
          options.context,
        );
        await options.hooks?.afterEach?.(component, page, column, row, options.context);
        await unmount();

        return { box, id: getCellId(row, column), screenshot };
      };

      const cells = new Map<string, Awaited<ReturnType<typeof captureCell>>>();

      for (const row of options.rows) {
        for (const column of options.columns) {
          const cell = await captureCell(
            wrapCell(options.component(column, row), removePadding),
            column,
            row,
          );
          cells.set(cell.id, cell);
        }
      }

      // Serve the captured PNGs back to the page so the matrix can display them
      // as plain <img> elements.
      const SCREENSHOT_ROUTE = "/_playwright-matrix-screenshot";

      await context.route(`${SCREENSHOT_ROUTE}*`, (route, request) => {
        const id = new URL(request.url()).searchParams.get("id") ?? "";
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: cells.get(id)?.screenshot,
        });
      });

      const images = Array.from(cells.values()).map(
        ({ box, id }) =>
          `<img width="${box?.width ?? ""}" height="${box?.height ?? ""}" style="grid-area: ${id}" src="${SCREENSHOT_ROUTE}?id=${id}" alt="${id}" />`,
      );

      const matrix = await mountTemplate(
        ScreenshotMatrix({
          columns: options.columns,
          rows: options.rows,
          name: options.name,
          browserName,
          children: images,
        }),
      );

      await page.waitForFunction(() =>
        Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
      );

      await expect(() => expect(matrix).toHaveScreenshot(`${options.name}.png`)).toPass();

      await Promise.all([unmount(), context.unroute(`${SCREENSHOT_ROUTE}*`)]);
    });
  };

  /** Mounts every combination at once — no hooks, but a single render pass. */
  const testWithoutIsolation = <TColumn extends string, TRow extends string>(
    options: MatrixScreenshotTestOptions<TColumn, TRow, TContext>,
  ) => {
    test(options.name, async ({ mountTemplate, browserName }) => {
      const removePadding = options.removePadding ?? globalOptions.defaults?.removePadding;
      const children = options.rows.flatMap((row) =>
        options.columns.map((column) =>
          wrapCell(options.component(column, row), removePadding, getCellId(row, column)),
        ),
      );

      const matrix = await mountTemplate(
        ScreenshotMatrix({
          columns: options.columns,
          rows: options.rows,
          name: options.name,
          browserName,
          children,
        }),
      );

      await expect(() => expect(matrix).toHaveScreenshot(`${options.name}.png`)).toPass();
    });
  };

  const executeMatrixScreenshotTest = <TColumn extends string, TRow extends string>(
    options: MatrixScreenshotTestOptions<TColumn, TRow, TContext>,
  ) => {
    if (options.fastNoIsolation) testWithoutIsolation(options);
    else testWithIsolation(options);
  };

  return { executeMatrixScreenshotTest };
};

export type UseFocusStateHooksOptions = {
  component: Locator;
  page: Page;
  /** One of `"hover"`, `"active"` or `"focus-visible"`; anything else is a no-op. */
  state: string;
};

/**
 * Puts a component into an interaction state before a capture, so one matrix
 * row can show default / hover / active / focus-visible side by side.
 */
export const useFocusStateHooks = async ({ component, page, state }: UseFocusStateHooksOptions) => {
  if (state === "hover") {
    await component.hover();
  }
  if (state === "focus-visible") {
    await page.keyboard.press("Tab");
  }
  if (state === "active") {
    const box = await component.boundingBox();
    if (!box) throw new Error("Cannot press an element with no layout box");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
  }
};

export type * from "./types";
