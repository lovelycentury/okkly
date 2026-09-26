import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column) =>
      `<okkly-number-input label="Quantity" [value]="${column === "at-max" ? 99 : 12}" min="1" max="99"${
        column === "error" ? ` error helperText="Must be 1–99"` : ""
      }${column === "disabled" ? " disabled" : ""} />`,
  });

  executeMatrixScreenshotTest({
    name: "NumberInput (sizes)",
    columns: SIZES,
    rows: [...CONTROLS, ...COLORS, "required"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-number-input label="Quantity" [value]="12" size="${column}" controls="${
        row === "chevrons" ? "chevrons" : "stepper"
      }" color="${row === "dante" ? "dante" : "primary"}"${row === "required" ? " required" : ""} />`,
  });
});

test("should render a labeled input with stepper controls", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-number-input label="Quantity" [value]="12" />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveAccessibleName("Quantity");
  await expect(component.getByRole("textbox")).toHaveValue("12");
  await expect(component.getByRole("textbox")).toHaveAttribute("inputmode", "decimal");
  await expect(component.getByRole("button", { name: "Increase value" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeVisible();
});

test("should render with no modifier classes at the defaults", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-number-input label="Quantity" [value]="12" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-number-input");
  await expect(component.locator(".okkly-number-input__controls")).not.toHaveClass(/--chevrons/);
});

test("should step up and down via the control buttons", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" [value]="5" step="2" (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("button", { name: "Increase value" }).click();

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(7);
  await expect(component.getByRole("textbox")).toHaveValue("7");

  // ACT
  await component.getByRole("button", { name: "Decrease value" }).click();

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(5);
});

test("should step with ArrowUp and ArrowDown", async ({ mountTemplate, page, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" [value]="10" (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").focus();
  await page.keyboard.press("ArrowUp");

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(11);

  // ACT
  await page.keyboard.press("ArrowDown");

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(10);
});

test("should keep the steppers out of the tab order", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-number-input label="Quantity" />`);

  // ASSERT
  await expect(component.getByRole("button", { name: "Increase value" })).toHaveAttribute(
    "tabindex",
    "-1",
  );
});

test("should clamp to min and max when stepping", async ({
  mountTemplate,
  recordedEvents,
  update,
}) => {
  // ARRANGE — already at the ceiling.
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" [value]="state().value" min="1" max="99" (valueChange)="record('value', $event)" />`,
    { value: 99 },
  );

  // ACT
  await component.getByRole("button", { name: "Increase value" }).click({ force: true });

  // ASSERT
  expect(await recordedEvents("value")).toEqual([]);

  // ACT — at the floor.
  await update({ value: 1 });
  await component.getByRole("button", { name: "Decrease value" }).click({ force: true });

  // ASSERT
  expect(await recordedEvents("value")).toEqual([]);
});

test("should disable the steppers at the bounds", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" [value]="state().value" min="1" max="99" />`,
    { value: 99 },
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Increase value" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeEnabled();

  // ACT
  await update({ value: 1 });

  // ASSERT
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Increase value" })).toBeEnabled();
});

test("should disable the input and both steppers when disabled", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" [value]="12" disabled />`,
  );

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
  await expect(component.getByRole("button", { name: "Increase value" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Decrease value" })).toBeDisabled();
});

test("should apply the error modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" error helperText="Must be 1–99" />`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-number-input--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  await expect(component.getByRole("textbox")).toHaveAccessibleDescription("Must be 1–99");
});

test("should apply the chevrons layout", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" controls="chevrons" />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-number-input__controls")).toHaveClass(
    /okkly-number-input__controls--chevrons/,
  );
});

test("should parse typed text, and an emptied input as null", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" [value]="12" (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").fill("42");

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBe(42);

  // ACT
  await component.getByRole("textbox").fill("");

  // ASSERT
  expect((await recordedEvents("value")).at(-1)).toBeNull();
});

test("should clamp a typed value into range on blur", async ({ mountTemplate, page }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-number-input label="Quantity" [value]="12" min="1" max="99" />`,
  );
  const textbox = component.getByRole("textbox");

  // ACT
  await textbox.fill("150");

  // ASSERT — the draft stays as typed while focused.
  await expect(textbox).toHaveValue("150");

  // ACT
  await page.keyboard.press("Tab");

  // ASSERT
  await expect(textbox).toHaveValue("99");
});

test("should show a required asterisk after the label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-number-input label="Quantity" required />`);

  // ASSERT
  await expect(component.locator(".okkly-number-input__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
