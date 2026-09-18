import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import DateField from "./DateField.vue";
import type { DateFieldColor, DateFieldSize } from "./DateField.types";

const COLORS = ["primary", "dante"] as const satisfies readonly DateFieldColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly DateFieldSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "DateField (states)",
    columns: ["empty", "filled", "error", "disabled"],
    rows: ["default", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: DateField,
    args: (column) => ({
      props: {
        defaultValue: column === "filled" ? new Date(2024, 7, 12) : undefined,
        error: column === "error",
        disabled: column === "disabled",
      },
      slots: {
        label: "Date",
        ...(column === "error" ? { "helper-text": "Required" } : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "DateField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required"],
    fastNoIsolation: true,
    component: DateField,
    args: (column, row) => ({
      props: {
        size: column,
        color: row === "dante" ? "dante" : "primary",
        required: row === "required",
        defaultValue: new Date(2024, 7, 12),
      },
      slots: { label: "Date" },
    }),
  });
});

test("should render with the default classes and no modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(DateField, { slots: { label: "Date" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-date-field/);
  await expect(component).not.toHaveClass(
    /okkly-date-field--(small|large|error|full-width|color-)/,
  );
});

test("should apply the error modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(DateField, {
    props: { error: true },
    slots: { label: "Date", "helper-text": "Required" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-date-field--error/);
});

test("should report a Date once a full valid date is typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE — the mask inserts the separators, so only digits are typed.
  const component = await mount(DateField, {
    slots: { label: "Date" },
    on: { "update:modelValue": (value: Date | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("12082024");

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveValue("12.08.2024");
  const value = changes.at(-1)!;
  expect(value).toBeInstanceOf(Date);
  expect([value.getFullYear(), value.getMonth(), value.getDate()]).toEqual([2024, 7, 12]);
});

test("should report null when the input is cleared", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(DateField, {
    props: { defaultValue: new Date(2024, 7, 12) },
    slots: { label: "Date" },
    on: { "update:modelValue": (value: Date | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").fill("");

  // ASSERT
  expect(changes.at(-1)).toBeNull();
});

test("should not report null while an incomplete date is being typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(DateField, {
    slots: { label: "Date" },
    on: { "update:modelValue": (value: Date | null) => changes.push(value) },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("1208");

  // ASSERT — a half-typed date is not a value, and it is not a clear either.
  expect(changes).toEqual([]);
});

test("should open the calendar popover from the calendar button", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(DateField, { slots: { label: "Date" } });

  // ACT
  await component.getByRole("button", { name: "Open calendar" }).click();

  // ASSERT — the popover portals out of the field.
  await expect(page.locator(".okkly-calendar")).toBeVisible();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(DateField, {
    props: { required: true },
    slots: { label: "Date" },
  });

  // ASSERT
  await expect(component.locator(".okkly-date-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
