import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import DateTimeField from "./DateTimeField.vue";
import type { DateTimeFieldColor, DateTimeFieldSize } from "./DateTimeField.types";

const COLORS = ["primary", "dante"] as const satisfies readonly DateTimeFieldColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly DateTimeFieldSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "DateTimeField (states)",
    columns: ["empty", "filled", "error", "disabled"],
    rows: ["default", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: DateTimeField,
    args: (column) => ({
      props: {
        defaultValue: column === "filled" ? new Date(2024, 7, 12, 14, 30) : undefined,
        error: column === "error",
        disabled: column === "disabled",
      },
      slots: {
        label: "Date & time",
        ...(column === "error" ? { "helper-text": "Required" } : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "DateTimeField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required"],
    fastNoIsolation: true,
    component: DateTimeField,
    args: (column, row) => ({
      props: {
        size: column,
        color: row === "dante" ? "dante" : "primary",
        required: row === "required",
        defaultValue: new Date(2024, 7, 12, 14, 30),
      },
      slots: { label: "Date & time" },
    }),
  });
});

test("should render with the default classes and no modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(DateTimeField, { slots: { label: "Date & time" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-date-time-field/);
  await expect(component).not.toHaveClass(
    /okkly-date-time-field--(small|large|error|full-width|color-)/,
  );
});

test("should apply the error modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(DateTimeField, {
    props: { error: true },
    slots: { label: "Date & time", "helper-text": "Required" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-date-time-field--error/);
});

test("should report a Date once a full date-time is typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE — the mask inserts the separators, so only digits are typed.
  const component = await mount(DateTimeField, {
    slots: { label: "Date & time" },
    on: { "update:modelValue": (value: Date | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("120820241430");

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveValue("12.08.2024, 14:30");
  const value = changes.at(-1)!;
  expect(value).toBeInstanceOf(Date);
  expect([
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    value.getHours(),
    value.getMinutes(),
  ]).toEqual([2024, 7, 12, 14, 30]);
});

test("should report null when the input is cleared", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(DateTimeField, {
    props: { defaultValue: new Date(2024, 7, 12, 14, 30) },
    slots: { label: "Date & time" },
    on: { "update:modelValue": (value: Date | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").fill("");

  // ASSERT
  expect(changes.at(-1)).toBeNull();
});

test("should not report null while an incomplete date-time is being typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(DateTimeField, {
    slots: { label: "Date & time" },
    on: { "update:modelValue": (value: Date | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("1208202414");

  // ASSERT — a half-typed value is not a value, and it is not a clear either.
  expect(changes).toEqual([]);
});

test("should open the date-time picker from the picker button", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(DateTimeField, { slots: { label: "Date & time" } });

  // ACT
  await component.getByRole("button", { name: "Open date time picker" }).click();

  // ASSERT — the popover portals out of the field.
  await expect(page.locator(".okkly-date-time-picker")).toBeVisible();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(DateTimeField, {
    props: { required: true },
    slots: { label: "Date & time" },
  });

  // ASSERT
  await expect(component.locator(".okkly-date-time-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
