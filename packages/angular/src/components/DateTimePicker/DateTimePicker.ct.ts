import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

// A fixed date/time, so every baseline is deterministic regardless of the
// day the suite happens to run on. Angular template expressions cannot call
// `new`, so every `Date` a test needs is built here and handed to the
// template through `state()`, never inline in a template string.
const JUNE_15_1430 = new Date(2024, 5, 15, 14, 30);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "DateTimePicker (states)",
    columns: ["empty", "filled", "12h"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => {
      if (column === "empty") return `<okkly-date-time-picker />`;
      if (column === "12h")
        return `<okkly-date-time-picker [value]="state().value" format="12h" />`;
      return `<okkly-date-time-picker [value]="state().value" />`;
    },
    hooks: {
      beforeEach: async (component, page, column) => {
        if (column === "empty") return;
        await page.evaluate(([value]) => window.okklyHarness?.update({ value }), [
          JUNE_15_1430,
        ] as const);
      },
    },
  });
});

test("should render nothing selected by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-time-picker />`);

  // ASSERT
  await expect(component).toContainText("No date selected");
  await expect(component.getByRole("button", { name: "Confirm" })).toBeDisabled();
});

test("should show a formatted summary once a value is set", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-date-time-picker [value]="state().value" />`, {
    value: JUNE_15_1430,
  });

  // ASSERT
  await expect(component).toContainText("Jun 15, 2024");
  await expect(component).toContainText("14:30");
  await expect(component.getByRole("button", { name: "Confirm" })).toBeEnabled();
});

test("should carry a dialed-in time over once a day is picked", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-time-picker (valueChange)="record('change', $event)" />`,
  );

  // ACT — dial a minute before any day is picked: nothing should commit yet.
  await component
    .getByRole("spinbutton", { name: "Minutes" })
    .getByText("05", { exact: true })
    .click();
  expect(await recordedEvents("change")).toEqual([]);

  // ACT — now pick a day: the commit carries the already-dialed minute.
  await component.getByRole("button", { name: "15", exact: true }).click();

  // ASSERT
  const events = await recordedEvents("change");
  expect(events).toHaveLength(1);
  expect((events[0] as Date).getMinutes()).toBe(5);
});

test("should emit change on every pick but confirm only on the Confirm button", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-time-picker [value]="state().value" (valueChange)="record('change', $event)" (confirm)="record('confirm', $event)" />`,
    { value: JUNE_15_1430 },
  );

  // ACT — a minute close to the current one (30), so it's already on screen
  // and the click needs no scroll-into-view of its own (which would fire a
  // native scroll event ahead of the click and could double-report the value
  // — the same reasoning `TimePicker.ct.ts` documents for its own row click).
  await component
    .getByRole("spinbutton", { name: "Minutes" })
    .getByText("31", { exact: true })
    .click();

  // ASSERT — the wheel nudge is a change, not yet a confirm.
  expect(await recordedEvents("change")).toHaveLength(1);
  expect(await recordedEvents("confirm")).toEqual([]);

  // ACT
  await component.getByRole("button", { name: "Confirm" }).click();

  // ASSERT
  expect(await recordedEvents("confirm")).toHaveLength(1);
});

test("should render a trailing timezone chip when timezoneLabel is set", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-time-picker [value]="state().value" timezoneLabel="GMT+2" />`,
    { value: JUNE_15_1430 },
  );

  // ASSERT
  await expect(component.locator(".okkly-chip")).toContainText("GMT+2");
});

test("should switch to a 12h hour wheel with an AM/PM column", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-date-time-picker [value]="state().value" format="12h" />`,
    { value: JUNE_15_1430 },
  );

  // ASSERT
  await expect(component.getByRole("spinbutton", { name: "AM/PM" })).toHaveAttribute(
    "aria-valuetext",
    "PM",
  );
});
