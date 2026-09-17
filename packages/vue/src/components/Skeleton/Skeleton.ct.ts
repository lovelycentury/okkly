import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Skeleton from "./Skeleton.vue";
import type { SkeletonVariant } from "./Skeleton.types";

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
    // The animations are frozen by `animations: "disabled"`, so the rows differ
    // only by the class they carry — a still frame is enough.
    fastNoIsolation: true,
    component: Skeleton,
    args: (column, row) => ({
      props: {
        variant: column,
        animation: row === "none" ? false : row,
        width: column === "circular" ? 48 : 160,
        height: 48,
      } as never,
    }),
  });
});

test("should render the text variant with a pulse by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Skeleton);

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton/);
  await expect(component).toHaveClass(/okkly-skeleton--pulse/);
  await expect(component).not.toHaveClass(/okkly-skeleton--(circular|rectangular|rounded)/);
});

test("should apply variant modifiers for non-text shapes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Skeleton, { props: { variant: "circular" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--circular/);

  // ACT
  await component.update({ props: { variant: "rectangular" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--rectangular/);

  // ACT
  await component.update({ props: { variant: "rounded" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--rounded/);

  // ACT
  await component.update({ props: { variant: "text" } as never });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-skeleton--(circular|rectangular|rounded)/);
});

test("should apply the animation modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Skeleton, { props: { animation: "wave" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-skeleton--wave/);
  await expect(component).not.toHaveClass(/okkly-skeleton--pulse/);

  // ACT
  await component.update({ props: { animation: false } as never });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-skeleton--(pulse|wave)/);
});

test("should set width and height through CSS variables", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Skeleton, {
    props: { variant: "rectangular", width: 200, height: 40 } as never,
  });

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
