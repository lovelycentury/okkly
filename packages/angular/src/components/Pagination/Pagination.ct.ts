import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { PaginationColor, PaginationShape, PaginationSize } from "./Pagination";

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
    component: (column, row) =>
      `<okkly-pagination [count]="5" [page]="2" color="${column}" shape="${row}" />`,
  });

  executeMatrixScreenshotTest({
    name: "Pagination (sizes)",
    columns: SIZES,
    rows: ["default", "boundary-buttons", "windowed", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => `
      <okkly-pagination
        size="${column}"
        [count]="${row === "windowed" ? 20 : 5}"
        [page]="${row === "windowed" ? 10 : 2}"
        ${row === "boundary-buttons" ? "showFirstButton showLastButton" : ""}
        ${row === "disabled" ? "disabled" : ""}
      />
    `,
  });
});

test("should render prev/next and page buttons inside a navigation landmark", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-pagination [count]="10" [page]="2" />`);

  // ASSERT — the navigation landmark is the component root itself.
  await expect(component).toHaveRole("navigation");
  await expect(component).toHaveAccessibleName("pagination");
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Go to page 2" })).toHaveClass(
    /okkly-pagination__button--active/,
  );
});

test("should render with no modifier classes by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-pagination [count]="5" [page]="1" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-pagination/);
  await expect(component).not.toHaveClass(/okkly-pagination--color-/);
  await expect(component).not.toHaveClass(/okkly-pagination--size-/);
  await expect(component).not.toHaveClass(/okkly-pagination--shape-circular/);
  await expect(component).not.toHaveClass(/okkly-pagination--disabled/);
});

test("should apply the size, shape, color and disabled modifiers", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-pagination
      [count]="5"
      [page]="1"
      [size]="state().size"
      [shape]="state().shape"
      [color]="state().color"
      [disabled]="state().disabled"
    />`,
    { size: "large", shape: "rounded", color: "primary", disabled: false },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--size-large/);

  // ACT
  await update({ shape: "circular" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--shape-circular/);

  // ACT
  await update({ color: "dante" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--color-dante/);

  // ACT
  await update({ disabled: true });

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--disabled/);
});

test("should move the page model when a page button is clicked", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-pagination [count]="10" [page]="2" (pageChange)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("button", { name: "Go to page 3" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual([3]);
});

test("should disable previous on the first page and next on the last", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-pagination [count]="5" [page]="state().page" />`, {
    page: 1,
  });

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeEnabled();

  // ACT
  await update({ page: 5 });

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeEnabled();
});

test("should render first/last buttons when requested", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-pagination [count]="10" [page]="5" showFirstButton showLastButton />`,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to first page" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Go to last page" })).toBeVisible();
});

test("should return the full range when the page count is small", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-pagination [count]="4" [page]="2" />`);

  // ASSERT — page buttons are the ones named "Go to page N".
  await expect(component.getByRole("button", { name: /^Go to page / })).toHaveText([
    "1",
    "2",
    "3",
    "4",
  ]);
  await expect(component.locator(".okkly-pagination__ellipsis")).toHaveCount(0);
});

test("should window the range behind two ellipses for large page counts", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-pagination [count]="20" [page]="8" [siblingCount]="1" [boundaryCount]="1" />`,
  );

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
