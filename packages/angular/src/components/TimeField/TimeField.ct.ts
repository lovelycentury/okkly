import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { TimeFieldSize } from "./TimeField";

const SIZES = ["small", "medium", "large"] as const satisfies readonly TimeFieldSize[];

function timeAt(h: number, m: number): Date {
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

const FILLED_TIME = timeAt(14, 30);

// The picker portals to `document.body`, so the open-state cell photographs
// the viewport, not the component box.
test.use({ viewport: { width: 420, height: 420 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "TimeField (sizes)",
    columns: SIZES,
    rows: ["empty", "filled", "error", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => `
      <div style="width: 12rem">
        <okkly-time-field
          label="Time"
          size="${column}"
          ${row === "empty" ? "" : '[value]="state().value"'}
          ${row === "error" ? 'error helperText="Enter a valid time"' : ""}
          ${row === "disabled" ? "disabled" : ""}
        />
      </div>
    `,
    hooks: {
      beforeEach: async (_component, page) => {
        await page.evaluate((value) => window.okklyHarness?.update({ value }), FILLED_TIME);
      },
    },
  });

  executeMatrixScreenshotTest({
    name: "TimeField (open)",
    columns: ["default"],
    rows: ["default"],
    screenshotTarget: "page",
    component: () => `
      <div style="width: 12rem; padding: 1rem">
        <okkly-time-field label="Time" open />
      </div>
    `,
  });
});

test("should render a labelled text input and a trigger button", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-field label="Time" />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeVisible();
  await expect(component.getByRole("button", { name: "Open time picker" })).toBeVisible();
});

test("should commit a fully typed HH:MM value", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-time-field label="Time" (valueChange)="record('change', $event)" />`,
  );
  const input = component.getByRole("textbox");

  // ACT
  await input.pressSequentially("1430");

  // ASSERT
  await expect(input).toHaveValue("14:30");
  const events = await recordedEvents("change");
  expect(events.length).toBeGreaterThan(0);
  const last = events.at(-1) as Date;
  expect(new Date(last).getHours()).toBe(14);
  expect(new Date(last).getMinutes()).toBe(30);
});

test("should not commit an incomplete typed value", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-time-field label="Time" (valueChange)="record('change', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("14");

  // ASSERT
  expect(await recordedEvents("change")).toEqual([]);
});

test("should commit null when the input is cleared", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-time-field label="Time" [value]="state().value" (valueChange)="record('change', $event)" />`,
    {
      value: (() => {
        const d = new Date();
        d.setHours(14, 30, 0, 0);
        return d;
      })(),
    },
  );
  const input = component.getByRole("textbox");

  // ACT
  await input.fill("");
  await input.dispatchEvent("input");

  // ASSERT
  const events = await recordedEvents("change");
  expect(events.at(-1)).toBeNull();
});

test("should open the picker from the trigger and commit a picked time", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-time-field label="Time" [value]="state().value" (valueChange)="record('change', $event)" />`,
    {
      value: (() => {
        const d = new Date();
        d.setHours(9, 30, 0, 0);
        return d;
      })(),
    },
  );

  // ACT
  await component.getByRole("button", { name: "Open time picker" }).click();
  // Playwright's regex `hasText` matches the row's raw (untrimmed) text node,
  // which carries the template's own indentation whitespace — an anchored
  // `/^11$/` never matches it. `getByText(..., { exact: true })` normalizes
  // whitespace before comparing, so it does. Scoped to the "Hours" spinbutton
  // specifically, since "11" is also a valid minute value.
  await page.getByRole("spinbutton", { name: "Hours" }).getByText("11", { exact: true }).click();

  // ASSERT
  const input = component.getByRole("textbox");
  await expect(input).toHaveValue("11:30");
  const events = await recordedEvents("change");
  const last = new Date(events.at(-1) as Date);
  expect(last.getHours()).toBe(11);
});

test("should re-sync the displayed text when a controlled value changes externally", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  const morning = (() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  })();
  const evening = (() => {
    const d = new Date();
    d.setHours(21, 45, 0, 0);
    return d;
  })();
  const component = await mountTemplate(
    `<okkly-time-field label="Time" [value]="state().value" />`,
    {
      value: morning,
    },
  );
  const input = component.getByRole("textbox");
  await expect(input).toHaveValue("09:00");

  // ACT
  await page.evaluate((next) => window.okklyHarness?.update({ value: next }), evening);

  // ASSERT
  await expect(input).toHaveValue("21:45");
});

test("should disable the input and the trigger", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-field label="Time" disabled />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
  await expect(component.getByRole("button", { name: "Open time picker" })).toBeDisabled();
});

test("should mark the field required", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-time-field label="Time" required />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
