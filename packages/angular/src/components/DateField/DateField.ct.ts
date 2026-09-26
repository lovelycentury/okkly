import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

// A fixed date, so every baseline is deterministic regardless of the day the
// suite happens to run on. Angular template expressions cannot call `new`, so
// every `Date` a test needs is built here and handed to the template through
// `state()`, never inline in a template string.
const JUNE_15 = new Date(2024, 5, 15);
const JUNE_1 = new Date(2024, 5, 1);
const JUNE_30 = new Date(2024, 5, 30);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "DateField (states)",
    columns: ["default", "filled", "error", "disabled"],
    rows: ["default"],
    component: (column) =>
      `<okkly-date-field label="Birthday"${
        column === "filled" ? ' [value]="state().value"' : ""
      }${column === "error" ? ' error helperText="That date looks wrong"' : ""}${
        column === "disabled" ? ' disabled [value]="state().value"' : ""
      } />`,
    hooks: {
      beforeEach: async (component, page) => {
        await page.evaluate((value) => window.okklyHarness?.update({ value }), JUNE_15);
      },
    },
  });

  executeMatrixScreenshotTest({
    name: "DateField (open)",
    columns: ["closed", "open"],
    rows: ["default"],
    component: () => `<okkly-date-field label="Birthday" [value]="state().value" />`,
    hooks: {
      beforeEach: async (component, page, column) => {
        await page.evaluate((value) => window.okklyHarness?.update({ value }), JUNE_15);
        if (column === "open")
          await component.getByRole("button", { name: "Open calendar" }).click();
      },
    },
  });
});

test("should render a labeled masked input linked by for/id", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-field label="Birthday" />`);

  // ASSERT
  const input = component.getByRole("textbox");
  await expect(input).toHaveAccessibleName("Birthday");
  await expect(input).toHaveAttribute("placeholder", "dd.mm.yyyy");
});

test("should mask typed digits into dd.mm.yyyy and commit a complete date", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-field label="Birthday" (valueChange)="record('change', $event)" />`,
  );
  const input = component.getByRole("textbox");

  // ACT
  await input.pressSequentially("15062024");

  // ASSERT
  await expect(input).toHaveValue("15.06.2024");
  expect(await recordedEvents("change")).toEqual([JUNE_15]);
});

test("should not commit while the typed date is incomplete", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-field label="Birthday" (valueChange)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("1506");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([]);
});

test("should commit null when the input is cleared", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-field label="Birthday" [value]="state().value" (valueChange)="record('change', $event)" />`,
    { value: JUNE_15 },
  );
  const input = component.getByRole("textbox");
  await expect(input).toHaveValue("15.06.2024");

  // ACT
  await input.fill("");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([null]);
});

test("should re-sync the displayed text when the value changes externally", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-field label="Birthday" [value]="state().value" />`,
    {
      value: null,
    },
  );
  const input = component.getByRole("textbox");
  await expect(input).toHaveValue("");

  // ACT
  await update({ value: JUNE_15 });

  // ASSERT
  await expect(input).toHaveValue("15.06.2024");
});

test("should open the calendar from the trigger, pick a day, commit it, and close", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE — `OkklyDateField` exposes no `month` input (matching react), so
  // the popup always opens on today's month; picking "today" itself is the
  // only day whose date this test can predict without one.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expectedText = [
    String(today.getDate()).padStart(2, "0"),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getFullYear()),
  ].join(".");
  const component = await mountTemplate(
    `<okkly-date-field label="Birthday" (valueChange)="record('change', $event)" />`,
  );
  const trigger = component.getByRole("button", { name: "Open calendar" });

  // ACT
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await component.page().locator(".okkly-calendar__day--today").click();

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveValue(expectedText);
  expect(await recordedEvents("change")).toEqual([today]);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("should constrain min/max bounds through to the calendar popup", async ({ mountTemplate }) => {
  // ARRANGE — a June 2024 range that necessarily excludes whatever "today" is,
  // so every day in the popup's (always-current-month) grid is disabled.
  const component = await mountTemplate(
    `<okkly-date-field label="Birthday" [min]="state().min" [max]="state().max" />`,
    { min: JUNE_1, max: JUNE_30 },
  );

  // ACT
  await component.getByRole("button", { name: "Open calendar" }).click();

  // ASSERT
  const today = component.page().locator(".okkly-calendar__day--today");
  await expect(today).toBeDisabled();
});

test("should disable the input and the trigger", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-field label="Birthday" disabled />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
  await expect(component.getByRole("button", { name: "Open calendar" })).toBeDisabled();
});

test("should show a required asterisk and mark the input required", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-field label="Birthday" required />`);

  // ASSERT
  await expect(component.locator(".okkly-date-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
