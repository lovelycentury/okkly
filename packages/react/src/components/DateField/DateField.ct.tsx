import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { DateField } from "./DateField";
import type { DateFieldColor, DateFieldSize } from "./DateField";

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
    component: (column) => (
      <DateField
        label="Date"
        defaultValue={column === "filled" ? new Date(2024, 7, 12) : undefined}
        error={column === "error"}
        disabled={column === "disabled"}
        helperText={column === "error" ? "Required" : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "DateField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required"],
    fastNoIsolation: true,
    component: (column, row) => (
      <DateField
        label="Date"
        size={column}
        color={row === "dante" ? "dante" : "primary"}
        required={row === "required"}
        defaultValue={new Date(2024, 7, 12)}
      />
    ),
  });
});

test("should render with the default className and no modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateField label="Date" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-date-field/);
  await expect(component).not.toHaveClass(
    /okkly-date-field--(small|large|error|full-width|color-)/,
  );
});

test("should apply the error modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateField label="Date" error helperText="Required" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-date-field--error/);
});

test("should call onChange with a Date once a full valid date is typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE — the mask inserts the separators, so only digits are typed.
  const component = await mount(
    <DateField label="Date" onChange={(value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("12082024");

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveValue("12.08.2024");
  const value = changes.at(-1)!;
  expect(value).toBeInstanceOf(Date);
  expect([value.getFullYear(), value.getMonth(), value.getDate()]).toEqual([2024, 7, 12]);
});

test("should call onChange with null when the input is cleared", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(
    <DateField
      label="Date"
      defaultValue={new Date(2024, 7, 12)}
      onChange={(value) => changes.push(value)}
    />,
  );

  // ACT
  await component.getByRole("textbox").fill("");

  // ASSERT
  expect(changes.at(-1)).toBeNull();
});

test("should not report null while an incomplete date is being typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(
    <DateField label="Date" onChange={(value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("1208");

  // ASSERT — a half-typed date is not a value, and it is not a clear either.
  expect(changes).toEqual([]);
});

test("should open the calendar popover from the calendar button", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(<DateField label="Date" />);

  // ACT
  await component.getByRole("button", { name: "Open calendar" }).click();

  // ASSERT — the popover portals out of the field.
  await expect(page.locator(".okkly-calendar")).toBeVisible();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<DateField label="Date" required />);

  // ASSERT
  await expect(component.locator(".okkly-date-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
