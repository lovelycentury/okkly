import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { TimePickerColor } from "./TimePicker";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly TimePickerColor[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "TimePicker (colors)",
    columns: COLORS,
    rows: ["24h", "12h"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-time-picker [value]="{ h: 9, m: 30 }" color="${column}" format="${row === "12h" ? "12h" : "24h"}" />`,
  });
});

test("should render the default classes with no color modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-picker [value]="{ h: 9, m: 30 }" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-time-picker");
});

test("should apply the color modifier for a non-primary color", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-time-picker [value]="{ h: 9, m: 30 }" color="dante" />`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-time-picker--color-dante/);
});

test("should render hour and minute spinbuttons, with no AM/PM column by default", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-picker [value]="{ h: 9, m: 30 }" />`);

  // ASSERT
  const hours = component.getByRole("spinbutton", { name: "Hours" });
  const minutes = component.getByRole("spinbutton", { name: "Minutes" });
  await expect(hours).toHaveAttribute("aria-valuenow", "9");
  await expect(hours).toHaveAttribute("aria-valuemin", "0");
  await expect(hours).toHaveAttribute("aria-valuemax", "23");
  await expect(minutes).toHaveAttribute("aria-valuenow", "30");
  await expect(component.getByRole("spinbutton", { name: "AM/PM" })).toHaveCount(0);
});

test("should default the value to { h: 0, m: 0 } when unset", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-picker />`);

  // ASSERT
  await expect(component.getByRole("spinbutton", { name: "Hours" })).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(component.getByRole("spinbutton", { name: "Minutes" })).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
});

test("should commit a value by clicking a row and report it through valueChange", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-time-picker [value]="{ h: 9, m: 30 }" (valueChange)="record('change', $event)" />`,
  );
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT — a row close to the current one, so it's already on screen and the
  // click needs no scroll-into-view of its own (which would fire a native
  // scroll event ahead of the click and could double-report the value).
  await hours.getByText("11", { exact: true }).click();

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "11");
  expect(await recordedEvents("change")).toEqual([{ h: 11, m: 30 }]);
});

test("should navigate hours with the keyboard: ArrowUp, ArrowDown, Home, End", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-picker [value]="{ h: 9, m: 30 }" />`);
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT
  await hours.focus();
  await page.keyboard.press("ArrowUp");

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "10");

  // ACT
  await page.keyboard.press("ArrowDown");

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "9");

  // ACT
  await page.keyboard.press("ArrowDown");

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "8");

  // ACT
  await page.keyboard.press("End");

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "23");

  // ACT
  await page.keyboard.press("Home");

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "0");
});

test("should clamp ArrowUp/ArrowDown at the ends of the column", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-picker [value]="{ h: 23, m: 0 }" />`);
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT
  await hours.focus();
  await page.keyboard.press("ArrowUp");

  // ASSERT — 23 is the last hour; there is nothing past it to step to.
  await expect(hours).toHaveAttribute("aria-valuenow", "23");
});

test("should split the hour column into 1-12 plus AM/PM in 12h format, without touching the 24h value", async ({
  mountTemplate,
}) => {
  // ARRANGE — 14:15 is 2:15 PM.
  const component = await mountTemplate(
    `<okkly-time-picker [value]="{ h: 14, m: 15 }" format="12h" />`,
  );
  const hours = component.getByRole("spinbutton", { name: "Hours" });
  const meridiem = component.getByRole("spinbutton", { name: "AM/PM" });

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "2");
  await expect(hours).toHaveAttribute("aria-valuemin", "1");
  await expect(hours).toHaveAttribute("aria-valuemax", "12");
  await expect(meridiem).toHaveAttribute("aria-valuenow", "1");
  await expect(meridiem).toHaveAttribute("aria-valuetext", "PM");
});

test("should round-trip hour 12 through PM without producing 0 or 24", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE — noon.
  const component = await mountTemplate(
    `<okkly-time-picker [value]="{ h: 12, m: 0 }" format="12h" (valueChange)="record('change', $event)" />`,
  );
  const hours = component.getByRole("spinbutton", { name: "Hours" });
  const meridiem = component.getByRole("spinbutton", { name: "AM/PM" });

  // ASSERT — noon reads as 12 PM, not 0 or 24.
  await expect(hours).toHaveAttribute("aria-valuenow", "12");
  await expect(meridiem).toHaveAttribute("aria-valuetext", "PM");

  // ACT — switch to AM: 12 PM (h=12) becomes 12 AM (h=0), not 24 or -12.
  await meridiem.getByText("AM", { exact: true }).click();

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "12");
  await expect(meridiem).toHaveAttribute("aria-valuetext", "AM");
  expect(await recordedEvents("change")).toEqual([{ h: 0, m: 0 }]);
});

test("should only offer minute values at the given step", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-time-picker [value]="{ h: 12, m: 0 }" step="15" />`,
  );
  const minutes = component.getByRole("spinbutton", { name: "Minutes" });

  // ASSERT
  await expect(minutes.getByText("15", { exact: true })).toBeVisible();
  await expect(minutes.getByText("07", { exact: true })).toHaveCount(0);
  await expect(minutes).toHaveAttribute("aria-valuemax", "45");
});

test("should snap an out-of-step controlled minute value to the nearest step", async ({
  mountTemplate,
}) => {
  // ARRANGE — 22 is not a multiple of 15; nearest is 15.
  const component = await mountTemplate(
    `<okkly-time-picker [value]="{ h: 12, m: 22 }" step="15" />`,
  );

  // ASSERT
  await expect(component.getByRole("spinbutton", { name: "Minutes" })).toHaveAttribute(
    "aria-valuenow",
    "15",
  );
});

test("should update the displayed selection when a controlled value changes externally", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-picker [value]="state().time" />`, {
    time: { h: 9, m: 30 },
  });
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT
  await update({ time: { h: 18, m: 45 } });

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "18");
  await expect(component.getByRole("spinbutton", { name: "Minutes" })).toHaveAttribute(
    "aria-valuenow",
    "45",
  );
});
