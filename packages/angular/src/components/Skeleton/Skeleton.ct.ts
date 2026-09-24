import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { SkeletonVariant } from "./Skeleton";

const VARIANTS = [
  "text",
  "circular",
  "rectangular",
  "rounded",
] as const satisfies readonly SkeletonVariant[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Skeleton (variants)",
    columns: VARIANTS,
    rows: ["pulse", "wave", "none"],
    // The animations are frozen for screenshots, so the rows differ only by the
    // class they carry — a still frame is enough.
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-skeleton variant="${column}" animation="${row === "none" ? "false" : row}" width="${
        column === "circular" ? 48 : 160
      }" height="48" />`,
  });
});

test("should render the text variant with a pulse by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-skeleton />`);

  // ASSERT
  await expect(component).toHaveAttribute(
    "class",
    "okkly-component okkly-skeleton okkly-skeleton--pulse",
  );
  await expect(component).toHaveAttribute("aria-hidden", "true");
});

test("should apply variant modifiers for non-text shapes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-skeleton [variant]="state().variant" />`, {
    variant: "circular",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--circular/);

  // ACT
  await update({ variant: "rectangular" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--rectangular/);

  // ACT
  await update({ variant: "rounded" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--rounded/);

  // ACT
  await update({ variant: "text" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-skeleton--(circular|rectangular|rounded)/);
});

test("should apply the animation modifiers", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-skeleton [animation]="state().animation" />`, {
    animation: "wave",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--wave/);
  await expect(component).not.toHaveClass(/okkly-skeleton--pulse/);

  // ACT
  await update({ animation: false });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-skeleton--(pulse|wave)/);
});

test('should read animation="false" as no animation', async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-skeleton animation="false" />`);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-skeleton--(pulse|wave|false)/);
});

test("should set width and height through CSS variables", async ({ mountTemplate }) => {
  // ARRANGE — a numeric attribute reads as pixels, as a binding would
  const component = await mountTemplate(
    `<okkly-skeleton variant="rectangular" width="200" [height]="40" />`,
  );

  // ASSERT — numbers are converted to rem against the 16px root.
  const custom = await component.evaluate((element) => ({
    width: (element as HTMLElement).style.getPropertyValue("--okkly-skeleton-width"),
    height: (element as HTMLElement).style.getPropertyValue("--okkly-skeleton-height"),
  }));
  expect(custom).toEqual({ width: "12.5rem", height: "2.5rem" });

  // ASSERT — and they reach the rendered box.
  const box = (await component.boundingBox())!;
  expect(Math.round(box.width)).toBe(200);
  expect(Math.round(box.height)).toBe(40);
});

test("should pass a CSS length through untouched", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-skeleton width="60%" height="4rem" />`);

  // ASSERT
  const custom = await component.evaluate((element) =>
    (element as HTMLElement).style.getPropertyValue("--okkly-skeleton-width"),
  );
  expect(custom).toBe("60%");
});
