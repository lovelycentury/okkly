import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column, row) =>
      `<okkly-radio label="Email"${column === "selected" ? " checked" : ""}${
        row === "disabled" ? " disabled" : ""
      } />`,
  });

  executeMatrixScreenshotTest({
    name: "Radio (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-radio label="Label" color="${column}" size="${row}" name="${column}-${row}" checked />`,
  });
});

test("should render a labeled radio", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-radio label="Remember me" />`);

  // ASSERT
  await expect(component.getByRole("radio")).toHaveAccessibleName("Remember me");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-radio");
});

test("should reflect the checked input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-radio label="Remember me" checked />`);

  // ASSERT
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-radio label="A" [size]="state().size" />`, {
    size: "small",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-radio--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-radio--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-radio label="A" [color]="state().color" />`, {
    color: "dante",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-radio--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-radio--color-/);
});

test("should disable the input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-radio label="A" disabled />`);

  // ASSERT
  await expect(component.getByRole("radio")).toBeDisabled();
});

test("should emit checkedChange with true when selected", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio label="A" (checkedChange)="record('checked', $event)" />`,
  );

  // ACT
  await component.getByRole("radio").click();

  // ASSERT
  expect(await recordedEvents("checked")).toEqual([true]);
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should select when the label text is clicked", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-radio label="Remember me" />`);

  // ACT — the native <label for> association is what makes this work.
  await component.locator(".okkly-radio__label").click();

  // ASSERT
  await expect(component.getByRole("radio")).toBeChecked();
});

test("should forward name, value, id and aria-label to the native input", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-radio id="plan-pro" name="plan" value="pro" aria-label="Pro plan" />`,
  );
  const input = component.getByRole("radio");

  // ASSERT
  await expect(input).toHaveAccessibleName("Pro plan");
  await expect(input).toHaveAttribute("id", "plan-pro");
  await expect(input).toHaveAttribute("name", "plan");
  await expect(input).toHaveAttribute("value", "pro");
  await expect(component).not.toHaveAttribute("id");
  await expect(component).not.toHaveAttribute("name");
});
