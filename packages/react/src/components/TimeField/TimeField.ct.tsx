import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { TimeField } from "./TimeField";
import type { TimeFieldColor, TimeFieldSize } from "./TimeField";

const COLORS = ["primary", "dante"] as const satisfies readonly TimeFieldColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly TimeFieldSize[];

/** A fixed instant, so the screenshots do not move with the clock. */
const AT_1430 = new Date(2024, 7, 12, 14, 30);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "TimeField (states)",
    columns: ["empty", "filled", "error", "disabled"],
    rows: ["default", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) => (
      <TimeField
        label="Time"
        defaultValue={column === "filled" ? AT_1430 : undefined}
        error={column === "error"}
        disabled={column === "disabled"}
        helperText={column === "error" ? "Required" : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "TimeField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required"],
    fastNoIsolation: true,
    component: (column, row) => (
      <TimeField
        label="Time"
        size={column}
        color={row === "dante" ? "dante" : "primary"}
        required={row === "required"}
        defaultValue={AT_1430}
      />
    ),
  });
});

test("should render with the default className and no modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TimeField label="Time" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-time-field/);
  await expect(component).not.toHaveClass(
    /okkly-time-field--(small|large|error|full-width|color-)/,
  );
});

test("should apply the error modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TimeField label="Time" error helperText="Required" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-time-field--error/);
});

test("should call onChange with a Date once a full time is typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE — the mask inserts the colon, so only digits are typed.
  const component = await mount(
    <TimeField label="Time" onChange={(value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("1430");

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveValue("14:30");
  const value = changes.at(-1)!;
  expect(value).toBeInstanceOf(Date);
  expect([value.getHours(), value.getMinutes()]).toEqual([14, 30]);
});

test("should call onChange with null when the input is cleared", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(
    <TimeField label="Time" defaultValue={AT_1430} onChange={(value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("textbox").fill("");

  // ASSERT
  expect(changes.at(-1)).toBeNull();
});

test("should not report null while an incomplete time is being typed", async ({ mount }) => {
  const changes: (Date | null)[] = [];

  // ARRANGE
  const component = await mount(
    <TimeField label="Time" onChange={(value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("14");

  // ASSERT — a half-typed time is not a value, and it is not a clear either.
  expect(changes).toEqual([]);
});

test("should open the time picker from the clock button", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(<TimeField label="Time" />);

  // ACT
  await component.getByRole("button", { name: "Open time picker" }).click();

  // ASSERT — the popover portals out of the field.
  await expect(page.locator(".okkly-time-picker")).toBeVisible();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TimeField label="Time" required />);

  // ASSERT
  await expect(component.locator(".okkly-time-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
