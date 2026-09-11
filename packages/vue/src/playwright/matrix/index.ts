import { test as baseTest, expect } from "@playwright/experimental-ct-vue";
import type { Locator, Page } from "@playwright/test";
import { defineComponent, h } from "vue";
import { getCellId } from "./gridArea";
import ScreenshotMatrix from "./ScreenshotMatrix.vue";
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

  /** Turns raw slot markup into the render-function slots `h()` expects. */
  const toSlotFns = (slots?: Record<string, string>) =>
    slots
      ? Object.fromEntries(Object.entries(slots).map(([name, markup]) => [name, () => markup]))
      : undefined;

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

      const removePadding = options.removePadding ?? globalOptions.defaults?.removePadding;

      const captureCell = async (column: TColumn, row: TRow) => {
        // Reset any pointer/focus state the previous cell left behind.
        await page.getByRole("document").focus();
        await page.getByRole("document").hover({ position: { x: 0, y: 0 }, force: true });
        await page.mouse.up();

        // Vue's mount API has no wrapping-element option, so the padding cell
        // React gets from a wrapping `<div>` is applied to the mount root instead.
        await page.evaluate((padded) => {
          const root = document.getElementById("root");
          if (!root) return;
          root.style.display = "grid";
          root.style.width = "max-content";
          root.style.padding = padded ? "1rem" : "";
        }, !removePadding);

        const { props, slots, on } = options.args(column, row);
        const component = await mount(options.component, { props, slots, on } as never);

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
          const cell = await captureCell(column, row);
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

      const imagesMarkup = Array.from(cells.values())
        .map(
          ({ box, id }) =>
            `<img width="${box?.width ?? ""}" height="${box?.height ?? ""}" style="grid-area: ${id}" src="${SCREENSHOT_ROUTE}?id=${id}" alt="${id}" />`,
        )
        .join("");

      const matrix = await mount(ScreenshotMatrix, {
        props: { columns: options.columns, rows: options.rows, name: options.name, browserName },
        slots: { default: imagesMarkup },
      });

      await matrix.locator("img").evaluateAll((images) =>
        Promise.all(
          images.map((image) => {
            const img = image as HTMLImageElement;
            return img.complete || new Promise((resolve) => img.addEventListener("load", resolve));
          }),
        ),
      );

      await expect(() => expect(matrix).toHaveScreenshot(`${options.name}.png`)).toPass();

      await Promise.all([matrix.unmount(), page.unroute(`${SCREENSHOT_ROUTE}*`)]);
    });
  };

  /** Mounts every combination at once — no hooks, but a single render pass. */
  const testWithoutIsolation = <TColumn extends string, TRow extends string>(
    options: MatrixScreenshotTestOptions<TColumn, TRow, TContext>,
  ) => {
    test(options.name, async ({ mount, browserName }) => {
      const removePadding = options.removePadding ?? globalOptions.defaults?.removePadding;

      // A synthetic wrapper: Vue's mount() needs a single component reference,
      // so every cell's live component is composed into one tree here via `h()`
      // rather than passed to `mount()` as separate elements.
      const Wrapper = defineComponent({
        render: () =>
          h(
            ScreenshotMatrix,
            { name: options.name, columns: options.columns, rows: options.rows, browserName },
            {
              default: () =>
                options.rows.flatMap((row) =>
                  options.columns.map((column) => {
                    // `on` is dropped here: this path renders static visual
                    // variants only, with no interaction to record, and Vue's
                    // `h()` needs listener keys (`onClick`) rather than
                    // Playwright's raw event names (`click`).
                    const { props, slots } = options.args(column, row);
                    return h(
                      "div",
                      {
                        key: getCellId(row, column),
                        style: {
                          display: "grid",
                          gridArea: getCellId(row, column),
                          width: "max-content",
                          padding: removePadding ? undefined : "1rem",
                        },
                      },
                      [h(options.component, props, toSlotFns(slots))],
                    );
                  }),
                ),
            },
          ),
      });

      const matrix = await mount(Wrapper);
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
