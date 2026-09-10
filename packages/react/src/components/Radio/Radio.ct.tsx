import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { Radio } from "./Radio";
import type { RadioColor, RadioSize } from "./Radio";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly RadioColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly RadioSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Radio (states)",
    columns: ["unselected", "selected"],
    rows: ["default", "hover", "focus-visible", "disabled"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column, row) => (
      <Radio label="Email" checked={column === "selected"} disabled={row === "disabled"} readOnly />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Radio (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => <Radio label="Label" color={column} size={row} checked readOnly />,
  });
});

test("should render a labeled radio", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Radio label="Remember me" />);

  // ASSERT
  await expect(component.getByRole("radio")).toHaveAccessibleName("Remember me");
});

test("should reflect the checked prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Radio label="Remember me" checked readOnly />);

  // ASSERT
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Radio label="A" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-radio--small/);

  // ACT
  await component.update(<Radio label="A" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-radio--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Radio label="A" color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-radio--color-dante/);

  // ACT
  await component.update(<Radio label="A" color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-radio--color-/);
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Radio label="A" disabled />);

  // ASSERT
  await expect(component.getByRole("radio")).toBeDisabled();
});

test("should fire onChange with checked=true", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(
    <Radio label="A" onChange={(_event, checked) => changes.push(checked)} />,
  );

  // ACT
  await component.getByRole("radio").click();

  // ASSERT
  expect(changes).toEqual([true]);
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should select when the label text is clicked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Radio label="Remember me" />);

  // ACT — the native <label> association is what makes this work.
  await component.locator(".okkly-radio__label").click();

  // ASSERT
  await expect(component.getByRole("radio")).toBeChecked();
});
