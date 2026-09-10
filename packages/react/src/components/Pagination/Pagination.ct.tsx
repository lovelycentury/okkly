import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Pagination } from "./Pagination";
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
    component: (column, row) => (
      <Pagination count={5} page={2} color={column} shape={row} onChange={() => {}} />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Pagination (sizes)",
    columns: SIZES,
    rows: ["default", "boundary-buttons", "windowed", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Pagination
        size={column}
        count={row === "windowed" ? 20 : 5}
        page={row === "windowed" ? 10 : 2}
        showFirstButton={row === "boundary-buttons"}
        showLastButton={row === "boundary-buttons"}
        disabled={row === "disabled"}
        onChange={() => {}}
      />
    ),
  });
});

test("should render prev/next and page buttons inside a navigation landmark", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Pagination count={10} page={2} />);

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
  const component = await mount(<Pagination count={5} page={1} />);

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
  const component = await mount(<Pagination count={5} page={1} size="large" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--size-large/);

  // ACT
  await component.update(<Pagination count={5} page={1} shape="circular" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--shape-circular/);

  // ACT
  await component.update(<Pagination count={5} page={1} color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--color-dante/);

  // ACT
  await component.update(<Pagination count={5} page={1} disabled />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-pagination--disabled/);
});

test("should fire onChange when a page is selected", async ({ mount }) => {
  const changes: number[] = [];

  // ARRANGE
  const component = await mount(
    <Pagination count={10} page={2} onChange={(_event, page) => changes.push(page)} />,
  );

  // ACT
  await component.getByRole("button", { name: "Go to page 3" }).click();

  // ASSERT
  expect(changes).toEqual([3]);
});

test("should disable previous on the first page and next on the last", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Pagination count={5} page={1} />);

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeEnabled();

  // ACT
  await component.update(<Pagination count={5} page={5} />);

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to next page" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Go to previous page" })).toBeEnabled();
});

test("should render first/last buttons when requested", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Pagination count={10} page={5} showFirstButton showLastButton />);

  // ASSERT
  await expect(component.getByRole("button", { name: "Go to first page" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Go to last page" })).toBeVisible();
});

test("should return the full range when the page count is small", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Pagination count={4} page={2} />);

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
  const component = await mount(
    <Pagination count={20} page={8} siblingCount={1} boundaryCount={1} />,
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
