import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import NumberInput from "./NumberInput.vue";
import type { NumberInputColor, NumberInputControls, NumberInputSize } from "./NumberInput.types";

const COLORS = ["primary", "dante"] as const satisfies readonly NumberInputColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly NumberInputSize[];
const CONTROLS = ["stepper", "chevrons"] as const satisfies readonly NumberInputControls[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "NumberInput (states)",
    columns: ["default", "at-max", "error", "disabled"],
    rows: ["default", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: NumberInput,
    args: (column) => ({
      props: {
        defaultValue: column === "at-max" ? 99 : 12,
        min: 1,
        max: 99,
        error: column === "error",
        disabled: column === "disabled",
      } as never,
      slots: {
        label: "Quantity",
        ...(column === "error" ? { "helper-text": "Must be 1–99" } : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "NumberInput (sizes)",
    columns: SIZES,
    rows: [...CONTROLS, ...COLORS, "required"],
    fastNoIsolation: true,
    component: NumberInput,
    args: (column, row) => ({
      props: {
        defaultValue: 12,
        size: column,
        controls: row === "chevrons" ? "chevrons" : "stepper",
        color: row === "dante" ? "dante" : "primary",
        required: row === "required",
      } as never,
      slots: { label: "Quantity" },
    }),
  });
});

test("should render a labeled input with stepper controls", async ({ mount }) => {
  // ARRANGE
  const component = await mount(NumberInput, {
    props: { defaultValue: 12 } as never,
    slots: { label: "Quantity" },
  });

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveAccessibleName("Quantity");
  await expect(component.getByRole("button", { name: "Increase value" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeVisible();
});

test("should render with no modifier classes at the defaults", async ({ mount }) => {
  // ARRANGE
  const component = await mount(NumberInput, {
    props: { defaultValue: 12 } as never,
    slots: { label: "Quantity" },
  });

  // ASSERT
  expect(await component.evaluate((element) => element.className)).toBe(
    "okkly-component okkly-number-input",
  );
});

test("should step up and down via the control buttons", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE
  const component = await mount(NumberInput, {
    props: { defaultValue: 5, step: 2 } as never,
    slots: { label: "Quantity" },
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("button", { name: "Increase value" }).click();

  // ASSERT
  expect(changes.at(-1)).toBe(7);

  // ACT
  await component.getByRole("button", { name: "Decrease value" }).click();

  // ASSERT
  expect(changes.at(-1)).toBe(5);
});

test("should step with ArrowUp and ArrowDown", async ({ mount, page }) => {
  const changes: (number | null)[] = [];

  // ARRANGE
  const component = await mount(NumberInput, {
    props: { defaultValue: 10 } as never,
    slots: { label: "Quantity" },
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").focus();
  await page.keyboard.press("ArrowUp");

  // ASSERT
  expect(changes.at(-1)).toBe(11);

  // ACT
  await page.keyboard.press("ArrowDown");

  // ASSERT
  expect(changes.at(-1)).toBe(10);
});

test("should clamp to min and max when stepping", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE — already at the ceiling.
  const component = await mount(NumberInput, {
    props: { defaultValue: 99, min: 1, max: 99 } as never,
    slots: { label: "Quantity" },
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("button", { name: "Increase value" }).click({ force: true });

  // ASSERT
  expect(changes).toEqual([]);

  // ARRANGE — `defaultValue` is uncontrolled, so a re-render would keep 99;
  // remount to start again at the floor.
  await component.unmount();
  const atMin = await mount(NumberInput, {
    props: { defaultValue: 1, min: 1, max: 99 } as never,
    slots: { label: "Quantity" },
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });

  // ACT
  await atMin.getByRole("button", { name: "Decrease value" }).click({ force: true });

  // ASSERT
  expect(changes).toEqual([]);
});

test("should disable the steppers at the bounds", async ({ mount }) => {
  // ARRANGE
  const component = await mount(NumberInput, {
    props: { defaultValue: 99, min: 1, max: 99 } as never,
    slots: { label: "Quantity" },
  });

  // ASSERT
  await expect(component.getByRole("button", { name: "Increase value" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeEnabled();

  // ARRANGE — `defaultValue` is uncontrolled, so remount rather than re-render.
  await component.unmount();
  const atMin = await mount(NumberInput, {
    props: { defaultValue: 1, min: 1, max: 99 } as never,
    slots: { label: "Quantity" },
  });

  // ASSERT
  await expect(atMin.getByRole("button", { name: "Decrease value" })).toBeDisabled();
  await expect(atMin.getByRole("button", { name: "Increase value" })).toBeEnabled();
});

test("should disable the input and both steppers when disabled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(NumberInput, {
    props: { defaultValue: 12, disabled: true } as never,
    slots: { label: "Quantity" },
  });

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
  await expect(component.getByRole("button", { name: "Increase value" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeDisabled();
});

test("should apply the error modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(NumberInput, {
    props: { error: true } as never,
    slots: { label: "Quantity", "helper-text": "Must be 1–99" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-number-input--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should parse an emptied input as null", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE
  const component = await mount(NumberInput, {
    props: { defaultValue: 12 } as never,
    slots: { label: "Quantity" },
    on: { "update:modelValue": (value: number | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").fill("");

  // ASSERT
  expect(changes.at(-1)).toBeNull();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(NumberInput, {
    props: { required: true } as never,
    slots: { label: "Quantity" },
  });

  // ASSERT
  await expect(component.locator(".okkly-number-input__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
