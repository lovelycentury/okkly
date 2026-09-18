import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Radio from "./Radio.vue";
import type { RadioColor, RadioSize } from "./Radio.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly RadioColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly RadioSize[];

const slots = { label: "Email" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Radio (states)",
    columns: ["unselected", "selected"],
    rows: ["default", "hover", "focus-visible", "disabled"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: Radio,
    args: (column, row) => ({
      props: { checked: column === "selected", disabled: row === "disabled" },
      slots,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Radio (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: Radio,
    args: (column, row) => ({
      props: { color: column, size: row, checked: true },
      slots: { label: "Label" },
    }),
  });
});

test("should render a labeled radio", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, { slots: { label: "Remember me" } });

  // ASSERT
  await expect(component.getByRole("radio")).toHaveAccessibleName("Remember me");
});

test("should reflect the checked prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, { props: { checked: true }, slots });

  // ASSERT
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, { slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-radio\b/);
  await expect(component).not.toHaveClass(/okkly-radio--color-/);
  await expect(component).not.toHaveClass(/okkly-radio--(small|large)/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, { props: { size: "small" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-radio--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-radio--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, { props: { color: "dante" }, slots });

  // ASSERT
  await expect(component).toHaveClass(/okkly-radio--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-radio--color-/);
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, { props: { disabled: true }, slots });

  // ASSERT
  await expect(component.getByRole("radio")).toBeDisabled();
});

test("should fire change with checked=true", async ({ mount }) => {
  const changes: boolean[] = [];

  // ARRANGE
  const component = await mount(Radio, {
    slots,
    on: { change: (_event: unknown, checked: unknown) => changes.push(checked as boolean) },
  });

  // ACT
  await component.getByRole("radio").click();

  // ASSERT
  expect(changes).toEqual([true]);
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should select when the label text is clicked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, { slots: { label: "Remember me" } });

  // ACT — the native <label> association is what makes this work.
  await component.locator(".okkly-radio__label").click();

  // ASSERT
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should not render the label when the slot is empty", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Radio, {
    props: { "aria-label": "Remember me" } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-radio__label")).toHaveCount(0);
});

test("should merge a consumer's class onto the label and fall other attributes through to the input", async ({
  mount,
}) => {
  // ARRANGE — none of these are declared props, so Vue treats them as
  // fall-through attributes: `class` merges onto the outer <label>, the rest
  // reach the <input> because Radio binds `$attrs` there.
  const attrs = { class: "custom", "data-testid": "email", "aria-label": "Email" };
  const component = await mount(Radio, { props: attrs as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-radio/);
  await expect(component).toHaveClass(/custom/);
  await expect(component).not.toHaveAttribute("data-testid");
  const input = component.getByRole("radio");
  await expect(input).toHaveAttribute("data-testid", "email");
  await expect(input).toHaveAccessibleName("Email");
});
