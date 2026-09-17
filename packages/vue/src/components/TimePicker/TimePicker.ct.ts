import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import TimePicker from "./TimePicker.vue";
import TimePickerFixture from "../../playwright/fixtures/TimePickerFixture.vue";
import type { TimePickerColor, TimePickerFormat, TimePickerValue } from "./TimePicker.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly TimePickerColor[];
const FORMATS = ["24h", "12h"] as const satisfies readonly TimePickerFormat[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "TimePicker (colors)",
    columns: COLORS,
    rows: FORMATS,
    fastNoIsolation: true,
    component: TimePicker,
    args: (column, row) => ({
      props: { color: column, format: row, defaultValue: { h: 14, m: 30 } },
    }),
  });

  executeMatrixScreenshotTest({
    name: "TimePicker (steps)",
    columns: ["1", "5", "15"],
    rows: FORMATS,
    fastNoIsolation: true,
    component: TimePicker,
    args: (column, row) => ({
      props: { step: Number(column), format: row, defaultValue: { h: 9, m: 30 } },
    }),
  });
});

test("should render an hours and a minutes wheel defaulting to 0:00", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TimePicker);

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

test("should apply the color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TimePicker, { props: { color: "dante" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-time-picker--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-time-picker--color-/);
});

test("should clamp the initial minute value to the nearest step", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TimePicker, {
    props: { step: 15, defaultValue: { h: 1, m: 37 } },
  });

  // ASSERT
  await expect(component.getByRole("spinbutton", { name: "Minutes" })).toHaveAttribute(
    "aria-valuenow",
    "30",
  );
});

test.describe("uncontrolled keyboard interaction", () => {
  test("should increase the hour on ArrowUp and fire update:modelValue", async ({
    mount,
    page,
  }) => {
    const changes: TimePickerValue[] = [];

    // ARRANGE
    const component = await mount(TimePicker, {
      props: { defaultValue: { h: 5, m: 0 } },
      on: { "update:modelValue": (value: TimePickerValue) => changes.push(value) },
    });
    const hours = component.getByRole("spinbutton", { name: "Hours" });

    // ACT
    await hours.focus();
    await page.keyboard.press("ArrowUp");

    // ASSERT
    await expect(hours).toHaveAttribute("aria-valuenow", "6");
    expect(changes.at(-1)).toEqual({ h: 6, m: 0 });
  });

  test("should decrease the minute by one step on ArrowDown", async ({ mount, page }) => {
    const changes: TimePickerValue[] = [];

    // ARRANGE
    const component = await mount(TimePicker, {
      props: { step: 5, defaultValue: { h: 0, m: 10 } },
      on: { "update:modelValue": (value: TimePickerValue) => changes.push(value) },
    });
    const minutes = component.getByRole("spinbutton", { name: "Minutes" });

    // ACT
    await minutes.focus();
    await page.keyboard.press("ArrowDown");

    // ASSERT
    await expect(minutes).toHaveAttribute("aria-valuenow", "5");
    expect(changes.at(-1)).toEqual({ h: 0, m: 5 });
  });

  test("should clamp at the ends instead of wrapping", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(TimePicker, { props: { defaultValue: { h: 23, m: 0 } } });
    const hours = component.getByRole("spinbutton", { name: "Hours" });

    // ACT
    await hours.focus();
    await page.keyboard.press("ArrowUp");

    // ASSERT
    await expect(hours).toHaveAttribute("aria-valuenow", "23");
  });

  test("should jump to the first and last value with Home and End", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(TimePicker, { props: { defaultValue: { h: 5, m: 0 } } });
    const hours = component.getByRole("spinbutton", { name: "Hours" });

    // ACT
    await hours.focus();
    await page.keyboard.press("End");

    // ASSERT
    await expect(hours).toHaveAttribute("aria-valuenow", "23");

    // ACT
    await page.keyboard.press("Home");

    // ASSERT
    await expect(hours).toHaveAttribute("aria-valuenow", "0");
  });
});

test("should select a value when its slide is clicked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TimePicker, { props: { defaultValue: { h: 0, m: 0 } } });
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ACT
  await hours.getByText("05", { exact: true }).click();

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "5");
});

test("should stay fully controlled when modelValue is supplied", async ({ mount, page }) => {
  const changes: TimePickerValue[] = [];

  // ARRANGE — TimePickerFixture binds `:model-value`/`@update:model-value`
  // together in a real template so the fixed prop genuinely wins; see its
  // doc comment for why mounting TimePicker directly can't exercise this.
  const component = await mount(TimePickerFixture, {
    props: { modelValue: { h: 1, m: 0 } },
    on: { change: (value: TimePickerValue) => changes.push(value) },
  });
  const hours = component.getByRole("spinbutton", { name: "Hours" });

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "1");

  // ACT
  await hours.focus();
  await page.keyboard.press("ArrowUp");

  // ASSERT — it does not move on its own; the parent decides via `modelValue`.
  expect(changes.at(-1)).toEqual({ h: 2, m: 0 });
  await expect(hours).toHaveAttribute("aria-valuenow", "1");

  // ACT
  await component.update({ props: { modelValue: { h: 2, m: 0 } } });

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "2");
});

test("should hide the AM/PM wheel in the default 24h format", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TimePicker);

  // ASSERT
  await expect(component.getByRole("spinbutton", { name: "AM/PM" })).toHaveCount(0);
});

test("should split the hour wheel into 1–12 plus AM/PM when format is 12h", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TimePicker, {
    props: { format: "12h", defaultValue: { h: 13, m: 0 } },
  });
  const hours = component.getByRole("spinbutton", { name: "Hours" });
  const meridiem = component.getByRole("spinbutton", { name: "AM/PM" });

  // ASSERT
  await expect(hours).toHaveAttribute("aria-valuenow", "1");
  await expect(hours).toHaveAttribute("aria-valuemax", "12");
  await expect(meridiem).toHaveAttribute("aria-valuenow", "1");
  await expect(meridiem.getByText("PM", { exact: true }).first()).toBeAttached();
});

test("should flip the underlying hour by 12 when AM/PM changes", async ({ mount }) => {
  const changes: TimePickerValue[] = [];

  // ARRANGE
  const component = await mount(TimePicker, {
    props: { format: "12h", defaultValue: { h: 9, m: 15 } },
    on: { "update:modelValue": (value: TimePickerValue) => changes.push(value) },
  });

  // ACT
  await component
    .getByRole("spinbutton", { name: "AM/PM" })
    .getByText("PM", { exact: true })
    .click();

  // ASSERT — the minute is untouched.
  expect(changes.at(-1)).toEqual({ h: 21, m: 15 });
});

test("should keep the current AM/PM when the 1–12 hour wheel changes", async ({ mount }) => {
  const changes: TimePickerValue[] = [];

  // ARRANGE
  const component = await mount(TimePicker, {
    props: { format: "12h", defaultValue: { h: 21, m: 0 } },
    on: { "update:modelValue": (value: TimePickerValue) => changes.push(value) },
  });

  // ACT
  await component
    .getByRole("spinbutton", { name: "Hours" })
    .getByText("05", { exact: true })
    .click();

  // ASSERT — 5 PM, not 5 AM.
  expect(changes.at(-1)).toEqual({ h: 17, m: 0 });
});
