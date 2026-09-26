import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

// A fixed date/time, so every baseline is deterministic regardless of the
// day the suite happens to run on. Angular template expressions cannot call
// `new`, so every `Date` a test needs is built here and handed to the
// template through `state()`, never inline in a template string.
const JUNE_15_1430 = new Date(2024, 5, 15, 14, 30);
const JUNE_1 = new Date(2024, 5, 1);
const JUNE_30_2359 = new Date(2024, 5, 30, 23, 59);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "DateTimeField (states)",
    columns: ["default", "filled", "error", "disabled"],
    rows: ["default"],
    component: (column) =>
      `<okkly-date-time-field label="Meeting"${
        column === "filled" ? ' [value]="state().value"' : ""
      }${column === "error" ? ' error helperText="That date looks wrong"' : ""}${
        column === "disabled" ? ' disabled [value]="state().value"' : ""
      } />`,
    hooks: {
      beforeEach: async (component, page) => {
        await page.evaluate((value) => window.okklyHarness?.update({ value }), JUNE_15_1430);
      },
    },
  });

  executeMatrixScreenshotTest({
    name: "DateTimeField (open)",
    columns: ["closed", "open"],
    rows: ["default"],
    component: () => `<okkly-date-time-field label="Meeting" [value]="state().value" />`,
    hooks: {
      beforeEach: async (component, page, column) => {
        await page.evaluate((value) => window.okklyHarness?.update({ value }), JUNE_15_1430);
        if (column === "open")
          await component.getByRole("button", { name: "Open date time picker" }).click();
      },
    },
  });
});

test("should render a labeled masked input linked by for/id", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-time-field label="Meeting" />`);

  // ASSERT
  const input = component.getByRole("textbox");
  await expect(input).toHaveAccessibleName("Meeting");
  await expect(input).toHaveAttribute("placeholder", "dd.mm.yyyy, HH:mm");
});

test("should mask typed digits into dd.mm.yyyy, HH:mm and commit a complete date+time", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-time-field label="Meeting" (valueChange)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("150620241430");

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveValue("15.06.2024, 14:30");
  expect(await recordedEvents("change")).toEqual([JUNE_15_1430]);
});

test("should not commit while the typed date+time is incomplete", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-time-field label="Meeting" (valueChange)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("1506202414");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([]);
});

test("should commit null when the input is cleared", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-time-field label="Meeting" [value]="state().value" (valueChange)="record('change', $event)" />`,
    { value: JUNE_15_1430 },
  );
  const input = component.getByRole("textbox");
  await expect(input).toHaveValue("15.06.2024, 14:30");

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
    `<okkly-date-time-field label="Meeting" [value]="state().value" />`,
    { value: null },
  );
  const input = component.getByRole("textbox");
  await expect(input).toHaveValue("");

  // ACT
  await update({ value: JUNE_15_1430 });

  // ASSERT
  await expect(input).toHaveValue("15.06.2024, 14:30");
});

test("should update the text on every pick but only close on the picker's Confirm button", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE — `OkklyDateTimeField` exposes no `month` input (matching react),
  // so the popup always opens on today's month; picking "today" itself is
  // the only day whose date this test can predict without one.
  const today = new Date();
  const component = await mountTemplate(
    `<okkly-date-time-field label="Meeting" (valueChange)="record('change', $event)" />`,
  );
  const trigger = component.getByRole("button", { name: "Open date time picker" });

  // ACT
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await component.page().locator(".okkly-calendar__day--today").click();

  // ASSERT — picking a day commits and updates the text, but leaves the
  // popover open: only the picker's own Confirm button closes it.
  expect(await recordedEvents("change")).toHaveLength(1);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  // ACT
  await component.page().getByRole("button", { name: "Confirm" }).click();

  // ASSERT
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  const text = await component.getByRole("textbox").inputValue();
  expect(text.startsWith(String(today.getDate()).padStart(2, "0"))).toBe(true);
});

test("should constrain min/max bounds through to the embedded calendar", async ({
  mountTemplate,
}) => {
  // ARRANGE — a June 2024 range that necessarily excludes whatever "today" is,
  // so every day in the popup's (always-current-month) grid is disabled.
  const component = await mountTemplate(
    `<okkly-date-time-field label="Meeting" [min]="state().min" [max]="state().max" />`,
    { min: JUNE_1, max: JUNE_30_2359 },
  );

  // ACT
  await component.getByRole("button", { name: "Open date time picker" }).click();

  // ASSERT
  const today = component.page().locator(".okkly-calendar__day--today");
  await expect(today).toBeDisabled();
});

test("should disable the input and the trigger", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-time-field label="Meeting" disabled />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
  await expect(component.getByRole("button", { name: "Open date time picker" })).toBeDisabled();
});

test("should show a required asterisk and mark the input required", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-time-field label="Meeting" required />`);

  // ASSERT
  await expect(component.locator(".okkly-date-time-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
