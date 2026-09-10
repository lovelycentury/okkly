import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Spinner } from "./Spinner";
import type { SpinnerColor, SpinnerSize } from "./Spinner";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
] as const satisfies readonly SpinnerColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SpinnerSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Spinner (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => <Spinner color={column} size={row} />,
  });

  executeMatrixScreenshotTest({
    name: "Spinner (thickness)",
    columns: ["2", "4", "6"],
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => <Spinner thickness={Number(column)} size={row} />,
  });
});

test("should render with an accessible loading label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Spinner />);

  // ASSERT — the status role sits on the component root itself.
  await expect(component).toHaveRole("status");
  await expect(component).toHaveAccessibleName("Loading");
});

test("should apply the default classes without modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Spinner />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-spinner/);
  await expect(component).not.toHaveClass(/okkly-spinner--(small|large|dante|indigo)/);
});

test("should apply size modifiers only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Spinner size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-spinner--small/);

  // ACT
  await component.update(<Spinner size="large" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-spinner--large/);

  // ACT
  await component.update(<Spinner size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-spinner--(small|large)/);
});

test("should apply color modifiers only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Spinner color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-spinner--dante/);

  // ACT
  await component.update(<Spinner color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-spinner--dante/);
});
