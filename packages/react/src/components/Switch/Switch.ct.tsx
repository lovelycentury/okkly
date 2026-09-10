import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { Switch } from "./Switch";
import type { SwitchColor, SwitchSize } from "./Switch";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly SwitchColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SwitchSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Switch (states)",
    columns: ["off", "on"],
    rows: ["default", "hover", "focus-visible", "disabled"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column, row) => (
      <Switch
        label="Notifications"
        checked={column === "on"}
        disabled={row === "disabled"}
        readOnly
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Switch (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => <Switch label="Label" color={column} size={row} checked readOnly />,
  });
});

test("should render a switch control", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Switch aria-label="Enable notifications" />);

  // ASSERT
  await expect(component.getByRole("switch")).toHaveAccessibleName("Enable notifications");
});

test("should render with a label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Switch label="Enable notifications" />);

  // ASSERT
  await expect(component.getByRole("switch")).toHaveAccessibleName("Enable notifications");
});

test("should reflect the checked prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Switch label="Enable notifications" checked readOnly />);

  // ASSERT
  await expect(component.getByRole("switch")).toBeChecked();
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Switch label="Enable notifications" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-switch--small/);

  // ACT
  await component.update(<Switch label="Enable notifications" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-switch--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Switch label="Enable notifications" color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-switch--color-dante/);

  // ACT
  await component.update(<Switch label="Enable notifications" color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-switch--color-/);
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Switch label="Enable notifications" disabled />);

  // ASSERT
  await expect(component.getByRole("switch")).toBeDisabled();
});

test("should fire onChange with the new checked value", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(
    <Switch label="Enable notifications" onChange={(_event, checked) => changes.push(checked)} />,
  );

  // ACT
  await component.getByRole("switch").click();

  // ASSERT
  expect(changes).toEqual([true]);
  await expect(component.getByRole("switch")).toBeChecked();
});

test("should toggle when the label text is clicked", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(
    <Switch label="Enable notifications" onChange={(_event, checked) => changes.push(checked)} />,
  );

  // ACT — the native <label> association is what makes this work.
  await component.locator(".okkly-switch__label").click();

  // ASSERT
  expect(changes).toEqual([true]);
});

test("should be a checkbox input carrying the switch role", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Switch label="Enable notifications" />);
  const input = component.getByRole("switch");

  // ASSERT
  await expect(input).toHaveAttribute("type", "checkbox");
  await expect(input).toHaveAttribute("role", "switch");
});
