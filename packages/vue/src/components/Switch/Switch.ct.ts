import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Switch from "./Switch.vue";
import type { SwitchColor, SwitchSize } from "./Switch.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly SwitchColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SwitchSize[];

const slots = { label: "Notifications" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Switch (states)",
    columns: ["off", "on"],
    rows: ["default", "hover", "focus-visible", "disabled"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: Switch,
    args: (column, row) => ({
      props: { modelValue: column === "on", disabled: row === "disabled" },
      slots,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Switch (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: Switch,
    args: (column, row) => ({
      props: { color: column, size: row, modelValue: true },
      slots: { label: "Label" },
    }),
  });
});

test("should render a switch control", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, {
    props: { "aria-label": "Enable notifications" } as never,
  });

  // ASSERT
  await expect(component.getByRole("switch")).toHaveAccessibleName("Enable notifications");
});

test("should render with a label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, { slots });

  // ASSERT
  await expect(component.getByRole("switch")).toHaveAccessibleName("Notifications");
});

test("should reflect the modelValue prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, { props: { modelValue: true }, slots });

  // ASSERT
  await expect(component.getByRole("switch")).toBeChecked();
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, { slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-switch\b/);
  await expect(component).not.toHaveClass(/okkly-switch--color-/);
  await expect(component).not.toHaveClass(/okkly-switch--(small|large)/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, { props: { size: "small" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-switch--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-switch--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, { props: { color: "dante" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-switch--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-switch--color-/);
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, { props: { disabled: true }, slots });

  // ASSERT
  await expect(component.getByRole("switch")).toBeDisabled();
});

test.describe("label slot", () => {
  test("should not render the label when the slot is empty", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Switch, {
      props: { "aria-label": "Enable notifications" } as never,
    });

    // ASSERT
    await expect(component.locator(".okkly-switch__label")).toHaveCount(0);
  });

  test("should render the label once the slot is filled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Switch, { slots });

    // ASSERT
    await expect(component.locator(".okkly-switch__label")).toHaveText("Notifications");
  });

  test("should toggle when the label text is clicked", async ({ mount }) => {
    // ARRANGE — the native <label> association is what makes this work.
    const component = await mount(Switch, { slots });

    // ACT
    await component.locator(".okkly-switch__label").click();

    // ASSERT
    await expect(component.getByRole("switch")).toBeChecked();
  });
});

test("should update the model when toggled", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(Switch, {
    slots,
    on: { "update:modelValue": (checked: unknown) => changes.push(checked as boolean) },
  });

  // ACT
  await component.getByRole("switch").click();

  // ASSERT
  expect(changes).toEqual([true]);
});

test("should toggle with the keyboard", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Switch, { slots });

  // ACT
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");

  // ASSERT
  await expect(component.getByRole("switch")).toBeChecked();
});

test("should be a checkbox input carrying the switch role", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Switch, { slots });
  const input = component.getByRole("switch");

  // ASSERT
  await expect(input).toHaveAttribute("type", "checkbox");
  await expect(input).toHaveAttribute("role", "switch");
});

test("should merge a consumer's class onto the label and fall other attributes through to the input", async ({
  mount,
}) => {
  // ARRANGE — none of these are declared props, so Vue treats them as
  // fall-through attributes: `class` merges onto the outer <label>, the rest
  // reach the <input> because Switch binds `$attrs` there.
  const attrs = { class: "custom", "data-testid": "notifications", "aria-label": "Notifications" };
  const component = await mount(Switch, { props: attrs as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-switch/);
  await expect(component).toHaveClass(/custom/);
  await expect(component).not.toHaveAttribute("data-testid");
  const input = component.getByRole("switch");
  await expect(input).toHaveAttribute("data-testid", "notifications");
  await expect(input).toHaveAccessibleName("Notifications");
});
