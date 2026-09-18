import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Checkbox from "./Checkbox.vue";
import type { CheckboxColor, CheckboxSize } from "./Checkbox.types";

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

const slots = { label: "Remember me" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Checkbox (states)",
    columns: ["unchecked", "checked", "indeterminate"],
    rows: ["default", "hover", "focus-visible", "disabled"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: Checkbox,
    args: (column, row) => ({
      props: {
        modelValue: column === "checked",
        indeterminate: column === "indeterminate",
        disabled: row === "disabled",
      },
      slots,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Checkbox (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: Checkbox,
    args: (column, row) => ({
      props: { color: column, size: row, modelValue: true },
      slots: { label: "Label" },
    }),
  });
});

test("should render a labeled checkbox", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Checkbox, { slots });

  // ASSERT
  await expect(component.getByRole("checkbox")).toHaveAccessibleName("Remember me");
});

test("should reflect the modelValue prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Checkbox, { props: { modelValue: true }, slots });

  // ASSERT
  await expect(component.getByRole("checkbox")).toBeChecked();
});

test("should set the indeterminate DOM property", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Checkbox, {
    props: { indeterminate: true },
    slots: { label: "Select all" },
  });

  // ASSERT — `indeterminate` is a property, never an HTML attribute.
  const input = component.getByRole("checkbox");
  expect(await input.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(true);
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Checkbox, { slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-checkbox\b/);
  await expect(component).not.toHaveClass(/okkly-checkbox--color-/);
  await expect(component).not.toHaveClass(/okkly-checkbox--(small|large)/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Checkbox, { props: { size: "small" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-checkbox--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-checkbox--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Checkbox, { props: { color: "danger" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-checkbox--color-danger/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-checkbox--color-/);
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Checkbox, { props: { disabled: true }, slots });

  // ASSERT
  await expect(component.getByRole("checkbox")).toBeDisabled();
});

test.describe("label slot", () => {
  test("should not render the label when the slot is empty", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Checkbox, { props: { "aria-label": "Remember me" } as never });

    // ASSERT
    await expect(component.locator(".okkly-checkbox__label")).toHaveCount(0);
  });

  test("should render the label once the slot is filled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Checkbox, { slots });

    // ASSERT
    await expect(component.locator(".okkly-checkbox__label")).toHaveText("Remember me");
  });

  test("should toggle when the label text is clicked", async ({ mount }) => {
    // ARRANGE — the native <label> association is what makes this work.
    const component = await mount(Checkbox, { slots });

    // ACT
    await component.locator(".okkly-checkbox__label").click();

    // ASSERT
    await expect(component.getByRole("checkbox")).toBeChecked();
  });
});

test("should update the model when toggled", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(Checkbox, {
    slots,
    on: { "update:modelValue": (checked: unknown) => changes.push(checked as boolean) },
  });

  // ACT
  await component.getByRole("checkbox").click();

  // ASSERT
  expect(changes).toEqual([true]);
});

test("should toggle with the keyboard", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Checkbox, { slots });

  // ACT
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");

  // ASSERT
  await expect(component.getByRole("checkbox")).toBeChecked();
});

test("should merge a consumer's class onto the label and fall other attributes through to the input", async ({
  mount,
}) => {
  // ARRANGE — none of these are declared props, so Vue treats them as
  // fall-through attributes: `class` merges onto the outer <label>, the rest
  // reach the <input> because Checkbox binds `$attrs` there.
  const attrs = { class: "custom", "data-testid": "remember-me", "aria-label": "Remember me" };
  const component = await mount(Checkbox, { props: attrs as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-checkbox/);
  await expect(component).toHaveClass(/custom/);
  await expect(component).not.toHaveAttribute("data-testid");
  const input = component.getByRole("checkbox");
  await expect(input).toHaveAttribute("data-testid", "remember-me");
  await expect(input).toHaveAccessibleName("Remember me");
});
