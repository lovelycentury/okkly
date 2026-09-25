import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column, row) =>
      `<okkly-switch label="Notifications"${column === "on" ? " checked" : ""}${
        row === "disabled" ? " disabled" : ""
      } />`,
  });

  executeMatrixScreenshotTest({
    name: "Switch (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-switch label="Label" color="${column}" size="${row}" checked />`,
  });
});

test("should render a switch control", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch aria-label="Notifications" />`);

  // ASSERT
  await expect(component.getByRole("switch")).toBeVisible();
  await expect(component.getByRole("switch")).toHaveAccessibleName("Notifications");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-switch");
});

test("should render with a label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="Enable notifications" />`);

  // ASSERT
  await expect(component.getByRole("switch")).toHaveAccessibleName("Enable notifications");
  await expect(component.locator(".okkly-switch__label")).toHaveText("Enable notifications");
});

test("should reflect the checked input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="On" checked />`);

  // ASSERT
  await expect(component.getByRole("switch")).toBeChecked();
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="A" [size]="state().size" />`, {
    size: "small",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-switch--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-switch--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="A" [color]="state().color" />`, {
    color: "dante",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-switch--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-switch--color-/);
});

test("should disable the input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="A" disabled />`);

  // ASSERT
  await expect(component.getByRole("switch")).toBeDisabled();
});

test("should emit checkedChange with the new checked value", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-switch label="A" (checkedChange)="record('checked', $event)" />`,
  );

  // ACT
  await component.getByRole("switch").click();
  await component.getByRole("switch").click();

  // ASSERT
  expect(await recordedEvents("checked")).toEqual([true, false]);
});

test("should toggle when the label text is clicked", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="Dark mode" />`);

  // ACT — the native <label for> association is what makes this work.
  await component.locator(".okkly-switch__label").click();

  // ASSERT
  await expect(component.getByRole("switch")).toBeChecked();
});

test("should be a checkbox input carrying the switch role", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="A" />`);

  // ASSERT
  const input = component.locator("input");
  await expect(input).toHaveAttribute("type", "checkbox");
  await expect(input).toHaveAttribute("role", "switch");
});

test("should toggle with the Space key", async ({ mountTemplate, page }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="A" />`);

  // ACT
  await component.getByRole("switch").focus();
  await page.keyboard.press(" ");

  // ASSERT
  await expect(component.getByRole("switch")).toBeChecked();
});

test("should follow the bound value", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-switch label="A" [checked]="state().on" />`, {
    on: false,
  });

  // ACT
  await update({ on: true });

  // ASSERT
  await expect(component.getByRole("switch")).toBeChecked();
});
