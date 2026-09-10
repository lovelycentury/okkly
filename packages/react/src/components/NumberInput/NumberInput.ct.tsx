import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { NumberInput } from "./NumberInput";
import type { NumberInputColor, NumberInputControls, NumberInputSize } from "./NumberInput";

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
    component: (column) => (
      <NumberInput
        label="Quantity"
        defaultValue={column === "at-max" ? 99 : 12}
        min={1}
        max={99}
        error={column === "error"}
        disabled={column === "disabled"}
        helperText={column === "error" ? "Must be 1–99" : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "NumberInput (sizes)",
    columns: SIZES,
    rows: [...CONTROLS, ...COLORS, "required"],
    fastNoIsolation: true,
    component: (column, row) => (
      <NumberInput
        label="Quantity"
        defaultValue={12}
        size={column}
        controls={row === "chevrons" ? "chevrons" : "stepper"}
        color={row === "dante" ? "dante" : "primary"}
        required={row === "required"}
      />
    ),
  });
});

test("should render a labeled input with stepper controls", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<NumberInput label="Quantity" defaultValue={12} />);

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveAccessibleName("Quantity");
  await expect(component.getByRole("button", { name: "Increase value" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeVisible();
});

test("should render with no modifier classes at the defaults", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<NumberInput label="Quantity" defaultValue={12} />);

  // ASSERT
  expect(await component.evaluate((element) => element.className)).toBe(
    "okkly-component okkly-number-input",
  );
});

test("should step up and down via the control buttons", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE
  const component = await mount(
    <NumberInput
      label="Quantity"
      defaultValue={5}
      step={2}
      onChange={(value) => changes.push(value)}
    />,
  );

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
  const component = await mount(
    <NumberInput label="Quantity" defaultValue={10} onChange={(value) => changes.push(value)} />,
  );

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
  const component = await mount(
    <NumberInput
      label="Quantity"
      defaultValue={99}
      min={1}
      max={99}
      onChange={(value) => changes.push(value)}
    />,
  );

  // ACT
  await component.getByRole("button", { name: "Increase value" }).click({ force: true });

  // ASSERT
  expect(changes).toEqual([]);

  // ARRANGE — `defaultValue` is uncontrolled, so a re-render would keep 99;
  // remount to start again at the floor.
  await component.unmount();
  const atMin = await mount(
    <NumberInput
      label="Quantity"
      defaultValue={1}
      min={1}
      max={99}
      onChange={(value) => changes.push(value)}
    />,
  );

  // ACT
  await atMin.getByRole("button", { name: "Decrease value" }).click({ force: true });

  // ASSERT
  expect(changes).toEqual([]);
});

test("should disable the steppers at the bounds", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <NumberInput label="Quantity" defaultValue={99} min={1} max={99} />,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Increase value" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeEnabled();

  // ARRANGE — `defaultValue` is uncontrolled, so remount rather than re-render.
  await component.unmount();
  const atMin = await mount(<NumberInput label="Quantity" defaultValue={1} min={1} max={99} />);

  // ASSERT
  await expect(atMin.getByRole("button", { name: "Decrease value" })).toBeDisabled();
  await expect(atMin.getByRole("button", { name: "Increase value" })).toBeEnabled();
});

test("should disable the input and both steppers when disabled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<NumberInput label="Quantity" defaultValue={12} disabled />);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
  await expect(component.getByRole("button", { name: "Increase value" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeDisabled();
});

test("should apply the error modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<NumberInput label="Quantity" error helperText="Must be 1–99" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-number-input--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should parse an emptied input as null", async ({ mount }) => {
  const changes: (number | null)[] = [];

  // ARRANGE
  const component = await mount(
    <NumberInput label="Quantity" defaultValue={12} onChange={(value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("textbox").fill("");

  // ASSERT
  expect(changes.at(-1)).toBeNull();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<NumberInput label="Quantity" required />);

  // ASSERT
  await expect(component.locator(".okkly-number-input__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
