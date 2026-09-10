import { test as baseTest, expect } from "@playwright/experimental-ct-react";
import type { Locator, Page } from "@playwright/test";
import type { ReactElement } from "react";
import { getCellId, ScreenshotMatrix } from "./ScreenshotMatrix";
import type {
  HookContext,
  MatrixScreenshotTestOptions,
  UseMatrixScreenshotTestOptions,
} from "./types";

/**
 * Builds the `executeMatrixScreenshotTest` helper the component tests use.
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

  /**
   * Mounts every combination on its own, so a hook can hover, focus or open it
   * before the capture. Each cell is screenshotted separately and the images
   * are then stitched into a single matrix that is compared as a whole.
   */
  const testWithIsolation = <TColumn extends string, TRow extends string>(
    options: MatrixScreenshotTestOptions<TColumn, TRow, TContext>,
  ) => {
    test(options.name, async ({ mount, page, browserName, context }) => {
      const timeoutPerScreenshot = 25 * 1000;
      test.setTimeout(options.columns.length * options.rows.length * timeoutPerScreenshot);

      const captureCell = async (element: ReactElement, column: TColumn, row: TRow) => {
        // Reset any pointer/focus state the previous cell left behind.
        await page.getByRole("document").focus();
        await page.getByRole("document").hover({ position: { x: 0, y: 0 }, force: true });
        await page.mouse.up();

        const component = await mount(element);

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
        await component.unmount();

        return { box, id: getCellId(row, column), screenshot };
      };

      const cells = new Map<string, Awaited<ReturnType<typeof captureCell>>>();

      for (const row of options.rows) {
        for (const column of options.columns) {
          const removePadding = options.removePadding ?? globalOptions.defaults?.removePadding;
          const wrapped = (
            <div
              style={{
                display: "grid",
                width: "max-content",
                padding: removePadding ? undefined : "1rem",
              }}
            >
              {options.component(column, row)}
            </div>
          );

          const cell = await captureCell(wrapped, column, row);
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

      const prepared = Array.from(cells.values()).map(({ box, id }) => {
        let onLoad: () => void = () => {};
        const loaded = new Promise<void>((resolve) => (onLoad = resolve));
        return [
          loaded,
          <img
            key={id}
            width={box?.width}
            height={box?.height}
            style={{ gridArea: id }}
            src={`${SCREENSHOT_ROUTE}?id=${id}`}
            alt={id}
            onLoad={onLoad}
          />,
        ] as const;
      });

      const matrix = await mount(
        ScreenshotMatrix({
          columns: options.columns,
          rows: options.rows,
          name: options.name,
          browserName,
          children: prepared.map(([, image]) => image),
        }),
      );

      await Promise.all(prepared.map(([loaded]) => loaded));

      await expect(() => expect(matrix).toHaveScreenshot(`${options.name}.png`)).toPass();

      await Promise.all([matrix.unmount(), page.unroute(`${SCREENSHOT_ROUTE}*`)]);
    });
  };

  /** Mounts every combination at once — no hooks, but a single render pass. */
  const testWithoutIsolation = <TColumn extends string, TRow extends string>(
    options: MatrixScreenshotTestOptions<TColumn, TRow, TContext>,
  ) => {
    test(options.name, async ({ mount, browserName }) => {
      const children = options.rows.flatMap((row) =>
        options.columns.map((column) => {
          const removePadding = options.removePadding ?? globalOptions.defaults?.removePadding;
          return (
            <div
              key={getCellId(row, column)}
              style={{
                display: "grid",
                gridArea: getCellId(row, column),
                width: "max-content",
                padding: removePadding ? undefined : "1rem",
              }}
            >
              {options.component(column, row)}
            </div>
          );
        }),
      );

      const matrix = await mount(
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

/**
 * Grows the component box to cover absolutely positioned content (a popover, a
 * dropdown) so the screenshot includes it instead of clipping it away.
 */
export const adjustSizeToAbsolutePosition = async (component: Locator) => {
  await expect(component).toBeVisible();

  await component.evaluate((element) => {
    element.style.height = `${element.scrollHeight}px`;
    element.style.width = `${element.scrollWidth}px`;
  });
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
    const box = (await component.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
  }
};

export type * from "./types";
