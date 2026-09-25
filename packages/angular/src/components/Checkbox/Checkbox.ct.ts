import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column, row) =>
      `<okkly-checkbox label="Remember me"${column === "checked" ? " checked" : ""}${
        column === "indeterminate" ? " indeterminate" : ""
      }${row === "disabled" ? " disabled" : ""} />`,
  });

  executeMatrixScreenshotTest({
    name: "Checkbox (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-checkbox label="Label" color="${column}" size="${row}" checked />`,
  });
});

test("should render a labeled checkbox", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-checkbox label="Remember me" />`);

  // ASSERT
  await expect(component.getByRole("checkbox")).toHaveAccessibleName("Remember me");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-checkbox");
});

test("should reflect the checked input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-checkbox label="Remember me" checked />`);

  // ASSERT
  await expect(component.getByRole("checkbox")).toBeChecked();
});

test("should set the indeterminate DOM property", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-checkbox label="Select all" indeterminate />`);

  // ASSERT — `indeterminate` is a property, never an HTML attribute.
  const input = component.getByRole("checkbox");
  expect(await input.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(true);
});

test("should clear indeterminate when the user toggles", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox label="Select all" indeterminate (indeterminateChange)="record('indeterminate', $event)" />`,
  );
  const input = component.getByRole("checkbox");

  // ACT
  await input.click();

  // ASSERT
  expect(await input.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(false);
  expect(await recordedEvents("indeterminate")).toEqual([false]);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox label="Remember me" [size]="state().size" />`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-checkbox--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-checkbox--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox label="Remember me" [color]="state().color" />`,
    { color: "danger" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-checkbox--color-danger/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-checkbox--color-/);
});

test("should disable the input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-checkbox label="Remember me" disabled />`);

  // ASSERT
  await expect(component.getByRole("checkbox")).toBeDisabled();
});

test("should emit checkedChange with the new checked value", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox label="Remember me" (checkedChange)="record('checked', $event)" />`,
  );

  // ACT
  await component.getByRole("checkbox").click();
  await component.getByRole("checkbox").click();

  // ASSERT
  expect(await recordedEvents("checked")).toEqual([true, false]);
});

test("should toggle when the label text is clicked", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox label="Remember me" (checkedChange)="record('checked', $event)" />`,
  );

  // ACT — the native <label for> association is what makes this work.
  await component.locator(".okkly-checkbox__label").click();

  // ASSERT
  expect(await recordedEvents("checked")).toEqual([true]);
  await expect(component.getByRole("checkbox")).toBeChecked();
});

test("should follow a two-way bound value", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox label="Remember me" [checked]="state().checked" />`,
    { checked: false },
  );
  const input = component.getByRole("checkbox");

  // ACT
  await update({ checked: true });

  // ASSERT
  await expect(input).toBeChecked();
});

test("should forward name, value, id and aria-label to the native input", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-checkbox id="terms" name="terms" value="accepted" aria-label="Accept the terms" />`,
  );
  const input = component.getByRole("checkbox");

  // ASSERT
  await expect(input).toHaveAccessibleName("Accept the terms");
  await expect(input).toHaveAttribute("id", "terms");
  await expect(input).toHaveAttribute("name", "terms");
  await expect(input).toHaveAttribute("value", "accepted");
  await expect(component).not.toHaveAttribute("id");
  await expect(component).not.toHaveAttribute("aria-label");
});

test("should give every checkbox its own input id", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div><okkly-checkbox label="One" /><okkly-checkbox label="Two" /></div>`,
  );

  // ASSERT
  const ids = await component
    .locator("input")
    .evaluateAll((inputs) => inputs.map((input) => input.id));
  expect(new Set(ids).size).toBe(2);
});
