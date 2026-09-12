import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { DateTimePicker } from "./DateTimePicker";
import type { Locator, Page } from "@playwright/test";
import type { DateTimePickerColor } from "./DateTimePicker";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly DateTimePickerColor[];

/** A fixed instant, so nothing here moves with the wall clock. */
const NOV_8_2024 = new Date(2024, 10, 8, 9, 0);

/**
 * The wheels scroll smoothly, and it is the settled scroll position — not the
 * key press — that the picker turns back into a value. Wait for the column to
 * stop moving before acting on it, or a still-animating wheel can report an
 * intermediate row.
 */
const waitForWheelToSettle = async (wheel: Locator, page: Page) => {
  await expect(async () => {
    const before = await wheel.evaluate((element) => element.scrollTop);
    await page.waitForTimeout(50);
    const after = await wheel.evaluate((element) => element.scrollTop);
    expect(after).toBe(before);
  }).toPass();
};

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "DateTimePicker (colors)",
    columns: COLORS,
    rows: ["24h", "12h"],
    fastNoIsolation: true,
    component: (column, row) => (
      <DateTimePicker color={column} format={row as "24h" | "12h"} defaultValue={NOV_8_2024} />
    ),
  });

  executeMatrixScreenshotTest({
    name: "DateTimePicker (states)",
    columns: ["empty", "selected", "with-timezone"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => (
      <DateTimePicker
        defaultValue={column === "empty" ? null : NOV_8_2024}
        timezoneLabel={column === "with-timezone" ? "GMT+2" : undefined}
      />
    ),
  });
});

test("should render a Calendar and a TimePicker with no date selected", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateTimePicker defaultValue={null} />);

  // ASSERT
  await expect(component.locator(".okkly-calendar")).toBeAttached();
  await expect(component.locator(".okkly-time-picker")).toBeAttached();
  await expect(component).toContainText("No date selected");
});

test("should apply no color modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateTimePicker />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-date-time-picker/);
  await expect(component.locator(".okkly-calendar")).not.toHaveClass(/--color-/);
  await expect(component.locator(".okkly-time-picker")).not.toHaveClass(/--color-/);
});

test("should share its color with the calendar, the wheels and Confirm", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateTimePicker color="dante" />);

  // ASSERT — the wheels and the button take a modifier class; the calendar has
  // no colour prop, so its share arrives as a tone variable instead.
  expect(
    await component
      .locator(".okkly-calendar")
      .evaluate((element) => element.style.getPropertyValue("--okkly-calendar-tone")),
  ).toBe("var(--okkly-accent-dante)");
  await expect(component.locator(".okkly-time-picker")).toHaveClass(
    /okkly-time-picker--color-dante/,
  );
  await expect(component.locator(".okkly-button")).toHaveClass(/okkly-button--color-dante/);
});

test("should show the formatted summary once a day is selected", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateTimePicker defaultValue={new Date(2024, 10, 8, 0, 0)} />);

  // ASSERT
  await expect(component).toContainText("Nov 8, 2024 · 00:00");
});

test("should combine a picked day with the wheel time and fire onChange", async ({ mount }) => {
  const changes: Date[] = [];

  // ARRANGE
  const component = await mount(
    <DateTimePicker defaultValue={null} onChange={(value) => changes.push(value as Date)} />,
  );

  // ACT
  await component.getByRole("button", { name: "15", exact: true }).first().click();

  // ASSERT
  expect(changes).toHaveLength(1);
  expect(changes[0].getDate()).toBe(15);
  expect(changes[0].getHours()).toBe(0);
  expect(changes[0].getMinutes()).toBe(0);
});

test("should only update the draft when a wheel moves before any day is picked", async ({
  mount,
  page,
}) => {
  const changes: Date[] = [];

  // ARRANGE
  const component = await mount(
    <DateTimePicker defaultValue={null} onChange={(value) => changes.push(value as Date)} />,
  );
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT
  await hours.focus();
  await page.keyboard.press("ArrowUp");

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "1");
  expect(changes).toEqual([]);
});

test("should carry the dialed-in draft time over once a day is picked", async ({ mount, page }) => {
  const changes: Date[] = [];

  // ARRANGE
  const component = await mount(
    <DateTimePicker defaultValue={null} onChange={(value) => changes.push(value as Date)} />,
  );
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT — settle on each step before the next, then let the wheel come to rest
  // before picking the day: both the extra key press and the day click can
  // otherwise land while the smooth scroll is still in flight.
  await hours.focus();
  await page.keyboard.press("ArrowUp");
  await expect(hours).toHaveAttribute("aria-valuenow", "1");
  await waitForWheelToSettle(hours, page);
  await page.keyboard.press("ArrowUp");
  await expect(hours).toHaveAttribute("aria-valuenow", "2");
  await waitForWheelToSettle(hours, page);
  await component.getByRole("button", { name: "20", exact: true }).first().click();

  // ASSERT
  const value = changes.at(-1)!;
  expect(value.getDate()).toBe(20);
  expect(value.getHours()).toBe(2);
});

test("should commit a new combined value when a wheel moves after a day is picked", async ({
  mount,
  page,
}) => {
  const changes: Date[] = [];

  // ARRANGE
  const component = await mount(
    <DateTimePicker defaultValue={NOV_8_2024} onChange={(value) => changes.push(value as Date)} />,
  );
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT
  await hours.focus();
  await page.keyboard.press("ArrowUp");

  // ASSERT
  const value = changes.at(-1)!;
  expect([value.getFullYear(), value.getMonth(), value.getDate(), value.getHours()]).toEqual([
    2024, 10, 8, 10,
  ]);
});

test("should disable Confirm until a day is selected, then report the value", async ({ mount }) => {
  const confirmed: Date[] = [];

  // ARRANGE
  const component = await mount(
    <DateTimePicker defaultValue={null} onConfirm={(value) => confirmed.push(value as Date)} />,
  );
  const confirm = component.getByRole("button", { name: /Confirm/ });

  // ASSERT
  await expect(confirm).toBeDisabled();

  // ACT
  await component.getByRole("button", { name: "15", exact: true }).first().click();

  // ASSERT
  await expect(confirm).toBeEnabled();

  // ACT
  await confirm.click();

  // ASSERT
  expect(confirmed).toHaveLength(1);
  expect(confirmed[0].getDate()).toBe(15);
});

test("should render the timezone chip only when timezoneLabel is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateTimePicker />);

  // ASSERT
  await expect(component).not.toContainText("GMT+2");

  // ACT
  await component.update(<DateTimePicker timezoneLabel="GMT+2" />);

  // ASSERT
  await expect(component).toContainText("GMT+2");
});

test("should stay fully controlled when value is supplied", async ({ mount }) => {
  const changes: Date[] = [];
  const onChange = (value: unknown) => changes.push(value as Date);

  // ARRANGE
  const component = await mount(
    <DateTimePicker value={new Date(2024, 10, 8, 0, 0)} onChange={onChange} />,
  );

  // ASSERT
  await expect(component).toContainText("Nov 8, 2024 · 00:00");

  // ACT
  await component.getByRole("button", { name: "15", exact: true }).first().click();

  // ASSERT — it does not move on its own; the parent decides via `value`.
  expect(changes).toHaveLength(1);
  await expect(component).toContainText("Nov 8, 2024 · 00:00");

  // ACT
  await component.update(
    <DateTimePicker value={new Date(2024, 10, 15, 0, 0)} onChange={onChange} />,
  );

  // ASSERT
  await expect(component).toContainText("Nov 15, 2024 · 00:00");
});

test("should format the summary to match the format prop", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <DateTimePicker defaultValue={new Date(2024, 10, 8, 13, 0)} format="24h" />,
  );

  // ASSERT
  await expect(component).toContainText("Nov 8, 2024 · 13:00");

  // ACT — switching format re-dials the Hours/AM-PM wheels; wait for both to
  // settle before reading the summary, same as elsewhere in this file, or the
  // assertion can catch an intermediate scroll position.
  await component.update(
    <DateTimePicker defaultValue={new Date(2024, 10, 8, 13, 0)} format="12h" />,
  );
  const hours = component.getByRole("spinbutton", { name: "Hours" });
  const amPm = component.getByRole("spinbutton", { name: "AM/PM" });
  await waitForWheelToSettle(hours, page);
  await waitForWheelToSettle(amPm, page);

  // ASSERT
  await expect(component).toContainText("Nov 8, 2024 · 01:00 PM");
  await expect(hours).toHaveAttribute("aria-valuenow", "1");
  await expect(amPm).toHaveAttribute("aria-valuenow", "1");
});

test("should use custom labels for the summary, empty state and confirm button", async ({
  mount,
}) => {
  // ARRANGE
  const component = await mount(
    <DateTimePicker
      defaultValue={null}
      summaryLabel="Time slot"
      emptyLabel="Pick a day"
      confirmLabel="Book it"
    />,
  );

  // ASSERT
  await expect(component).toContainText("Time slot");
  await expect(component).toContainText("Pick a day");
  await expect(component.getByRole("button", { name: /Book it/ })).toBeVisible();
});

test("should render no shortcut chips column", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateTimePicker defaultValue={NOV_8_2024} />);

  // ASSERT
  await expect(component.locator(".okkly-date-time-picker__chips")).toHaveCount(0);
  await expect(component.locator(".okkly-calendar__chips")).toHaveCount(0);
});
