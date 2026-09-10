import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { Checkbox } from "./Checkbox";
import type { CheckboxColor, CheckboxSize } from "./Checkbox";

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
] as const satisfies readonly CheckboxColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly CheckboxSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Checkbox (states)",
    columns: ["unchecked", "checked", "indeterminate"],
    rows: ["default", "hover", "focus-visible", "disabled"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column, row) => (
      <Checkbox
        label="Remember me"
        checked={column === "checked"}
        indeterminate={column === "indeterminate"}
        disabled={row === "disabled"}
        readOnly
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Checkbox (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => (
      <Checkbox label="Label" color={column} size={row} checked readOnly />
    ),
  });
});

test("should render a labeled checkbox", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Checkbox label="Remember me" />);

  // ASSERT
  await expect(component.getByRole("checkbox")).toHaveAccessibleName("Remember me");
});

test("should reflect the checked prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Checkbox label="Remember me" checked readOnly />);

  // ASSERT
  await expect(component.getByRole("checkbox")).toBeChecked();
});

test("should set the indeterminate DOM property", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Checkbox label="Select all" indeterminate />);

  // ASSERT — `indeterminate` is a property, never an HTML attribute.
  const input = component.getByRole("checkbox");
  expect(await input.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(true);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Checkbox label="Remember me" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-checkbox--small/);

  // ACT
  await component.update(<Checkbox label="Remember me" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-checkbox--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Checkbox label="Remember me" color="danger" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-checkbox--color-danger/);

  // ACT
  await component.update(<Checkbox label="Remember me" color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-checkbox--color-/);
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Checkbox label="Remember me" disabled />);

  // ASSERT
  await expect(component.getByRole("checkbox")).toBeDisabled();
});

test("should fire onChange with the new checked value", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(
    <Checkbox label="Remember me" onChange={(_event, checked) => changes.push(checked)} />,
  );

  // ACT
  await component.getByRole("checkbox").click();

  // ASSERT
  expect(changes).toEqual([true]);
});

test("should toggle when the label text is clicked", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(
    <Checkbox label="Remember me" onChange={(_event, checked) => changes.push(checked)} />,
  );

  // ACT — the native <label> association is what makes this work.
  await component.locator(".okkly-checkbox__label").click();

  // ASSERT
  expect(changes).toEqual([true]);
  await expect(component.getByRole("checkbox")).toBeChecked();
});
