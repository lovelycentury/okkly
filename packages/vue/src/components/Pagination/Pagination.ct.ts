import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Pagination from "./Pagination.vue";
import type { PaginationColor, PaginationShape, PaginationSize } from "./Pagination.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly PaginationColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly PaginationSize[];
const SHAPES = ["circular", "rounded"] as const satisfies readonly PaginationShape[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Pagination (colors)",
    columns: COLORS,
    rows: SHAPES,
    fastNoIsolation: true,
    component: Pagination,
    args: (column, row) => ({
      props: { count: 5, modelValue: 2, color: column, shape: row } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Pagination (sizes)",
    columns: SIZES,
    rows: ["default", "boundary-buttons", "windowed", "disabled"],
    fastNoIsolation: true,
    component: Pagination,
    args: (column, row) => ({
      props: {
        size: column,
        count: row === "windowed" ? 20 : 5,
        modelValue: row === "windowed" ? 10 : 2,
        showFirstButton: row === "boundary-buttons",
        showLastButton: row === "boundary-buttons",
        disabled: row === "disabled",
      } as never,
    }),
  });
});

test("should render prev/next and page buttons inside a navigation landmark", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Pagination, { props: { count: 10, modelValue: 2 } as never });

  // ASSERT — the navigation landmark is the component root itself.
  await expect(component).toHaveRole("navigation");
  await expect(component).toHaveAccessibleName("pagination");
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Go to page 2" })).toHaveClass(
    /okkly-pagination__button--active/,
  );
});

test("should render with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Pagination, { props: { count: 5, modelValue: 1 } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-pagination/);
  await expect(component).not.toHaveClass(/okkly-pagination--color-/);
  await expect(component).not.toHaveClass(/okkly-pagination--size-/);
  await expect(component).not.toHaveClass(/okkly-pagination--shape-circular/);
  await expect(component).not.toHaveClass(/okkly-pagination--disabled/);
});

test("should apply the size, shape, color and disabled modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Pagination, {
    props: { count: 5, modelValue: 1, size: "large" } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--size-large/);

  // ACT
  await component.update({ props: { count: 5, modelValue: 1, shape: "circular" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--shape-circular/);

  // ACT
  await component.update({ props: { count: 5, modelValue: 1, color: "dante" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--color-dante/);

  // ACT
  await component.update({ props: { count: 5, modelValue: 1, disabled: true } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--disabled/);
});

test("should fire update:modelValue when a page is selected", async ({ mount }) => {
  const changes: number[] = [];

  // ARRANGE
  const component = await mount(Pagination, {
    props: { count: 10, modelValue: 2 } as never,
    on: { "update:modelValue": (...args: unknown[]) => changes.push(args[0] as number) },
  });

  // ACT
  await component.getByRole("button", { name: "Go to page 3" }).click();

  // ASSERT
  expect(changes).toEqual([3]);
});

test("should disable previous on the first page and next on the last", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Pagination, { props: { count: 5, modelValue: 1 } as never });

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeEnabled();

  // ACT
  await component.update({ props: { count: 5, modelValue: 5 } as never });

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeEnabled();
});

test("should render first/last buttons when requested", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Pagination, {
    props: { count: 10, modelValue: 5, showFirstButton: true, showLastButton: true } as never,
  });

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to first page" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Go to last page" })).toBeVisible();
});

test("should return the full range when the page count is small", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Pagination, { props: { count: 4, modelValue: 2 } as never });

  // ASSERT — page buttons are the ones named "Go to page N".
  await expect(component.getByRole("button", { name: /^Go to page / })).toHaveText([
    "1",
    "2",
    "3",
    "4",
  ]);
  await expect(component.locator(".okkly-pagination__ellipsis")).toHaveCount(0);
});

test("should window the range behind two ellipses for large page counts", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Pagination, {
    props: { count: 20, modelValue: 8, siblingCount: 1, boundaryCount: 1 } as never,
  });

  // ASSERT — first, the current page and its siblings, then the last.
  await expect(component.getByRole("button", { name: /^Go to page / })).toHaveText([
    "1",
    "7",
    "8",
    "9",
    "20",
  ]);
  await expect(component.locator(".okkly-pagination__ellipsis")).toHaveCount(2);
});
