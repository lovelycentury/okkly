import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

// A fixed month, so every baseline is deterministic regardless of the day the
// suite happens to run on. Angular template expressions cannot call `new`, so
// every `Date` a test needs is built here and handed to the template through
// `state()`, never inline in a template string.
const JUNE_1 = new Date(2024, 5, 1);
const JUNE_15 = new Date(2024, 5, 15);
const JUNE_10 = new Date(2024, 5, 10);
const JUNE_18 = new Date(2024, 5, 18);
const JUNE_5 = new Date(2024, 5, 5);
const JUNE_25 = new Date(2024, 5, 25);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Calendar (views)",
    columns: ["day", "month", "year"],
    rows: ["default"],
    component: () => `<okkly-calendar [value]="state().value" [month]="state().month" />`,
    hooks: {
      beforeEach: async (component, page, column) => {
        await page.evaluate(([value, month]) => window.okklyHarness?.update({ value, month }), [
          JUNE_15,
          JUNE_1,
        ] as const);
        if (column === "day") return;
        await component.locator(".okkly-calendar__title--button").click();
        if (column === "month") {
          await component.locator(".okkly-calendar__period-cell").first().click();
        }
      },
    },
  });

  executeMatrixScreenshotTest({
    name: "Calendar (states)",
    columns: ["single", "range"],
    rows: ["default", "bounded"],
    component: (column, row) => {
      const bounds = row === "bounded" ? `[min]="state().min" [max]="state().max"` : "";
      if (column === "single") {
        return `<okkly-calendar [value]="state().value" [month]="state().month" ${bounds} />`;
      }
      return `<okkly-calendar mode="range" [value]="state().range" [month]="state().month" ${bounds} />`;
    },
    hooks: {
      beforeEach: async (component, page) => {
        await page.evaluate(
          ([value, range, month, min, max]) =>
            window.okklyHarness?.update({ value, range, month, min, max }),
          [JUNE_15, [JUNE_10, JUNE_18], JUNE_1, JUNE_5, JUNE_25] as const,
        );
      },
    },
  });
});

test("should render the visible month's weekday and day cells", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-calendar [month]="state().month" />`, {
    month: JUNE_1,
  });

  // ASSERT
  await expect(component).toContainText("June 2024");
  await expect(component.getByRole("button", { name: "15", exact: true })).toBeVisible();
});

test("should select a date in single mode and emit the new value", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-calendar [month]="state().month" (valueChange)="record('valueChange', $event)" />`,
    { month: JUNE_1 },
  );

  // ACT
  await component.getByRole("button", { name: "15", exact: true }).click();

  // ASSERT
  const events = await recordedEvents("valueChange");
  expect(events).toHaveLength(1);
  expect(events[0]).toBeInstanceOf(Date);
  expect((events[0] as Date).getDate()).toBe(15);
  await expect(component.getByRole("button", { name: "15", exact: true })).toHaveClass(
    /okkly-calendar__day--selected/,
  );
});

test("should build a range across two clicks, ordering it regardless of click direction", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-calendar mode="range" [month]="state().month" (valueChange)="record('valueChange', $event)" />`,
    { month: JUNE_1 },
  );

  // ACT — clicked out of order; the pair still commits start-before-end.
  await component.getByRole("button", { name: "18", exact: true }).click();
  await component.getByRole("button", { name: "10", exact: true }).click();

  // ASSERT
  const events = await recordedEvents("valueChange");
  expect(events).toHaveLength(1);
  const [start, end] = events[0] as [Date, Date];
  expect(start.getDate()).toBe(10);
  expect(end.getDate()).toBe(18);
  await expect(component.getByRole("button", { name: "10", exact: true })).toHaveClass(
    /okkly-calendar__day--range-start/,
  );
  await expect(component.getByRole("button", { name: "18", exact: true })).toHaveClass(
    /okkly-calendar__day--range-end/,
  );
});

test("should start a new range on a third click after a pair is committed", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-calendar mode="range" [value]="state().range" [month]="state().month" />`,
    { range: [JUNE_10, JUNE_18], month: JUNE_1 },
  );

  // ACT
  await component.getByRole("button", { name: "20", exact: true }).click();

  // ASSERT — the old pair's end is no longer painted; only the new armed start is.
  await expect(component.getByRole("button", { name: "18", exact: true })).not.toHaveClass(
    /okkly-calendar__day--range-end/,
  );
  await expect(component.getByRole("button", { name: "20", exact: true })).toHaveClass(
    /okkly-calendar__day--range-start/,
  );
});

test("should disable dates outside min/max", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-calendar [month]="state().month" [min]="state().min" [max]="state().max" />`,
    { month: JUNE_1, min: JUNE_5, max: JUNE_25 },
  );

  // ASSERT — "26" rather than a day past the 25th: June 2024 starts on a
  // Saturday, so with the default Monday week start the grid's only outside
  // (adjacent-month) days are May's, at the low end (27–31); "26" stays
  // uniquely June's own cell.
  await expect(component.getByRole("button", { name: "3", exact: true })).toBeDisabled();
  await expect(component.getByRole("button", { name: "26", exact: true })).toBeDisabled();
  await expect(component.getByRole("button", { name: "15", exact: true })).toBeEnabled();
});

test("should drill from day view to year view to month view via the header", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-calendar [month]="state().month" />`, {
    month: JUNE_1,
  });

  // ACT
  await component.locator(".okkly-calendar__title--button").click();

  // ASSERT — year view: a page of years, none of them a header button anymore.
  await expect(component.getByRole("button", { name: "2024", exact: true })).toBeVisible();
  await expect(component.locator(".okkly-calendar__title--button")).toHaveCount(0);

  // ACT
  await component.getByRole("button", { name: "2024", exact: true }).click();

  // ASSERT — month view, still on 2024, back to a clickable header.
  await expect(component.getByRole("button", { name: "Jun", exact: true })).toBeVisible();

  // ACT
  await component.getByRole("button", { name: "Jun", exact: true }).click();

  // ASSERT — back to day view, now showing June.
  await expect(component).toContainText("June 2024");
});

test("should navigate months with the prev/next buttons", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-calendar [month]="state().month" />`, {
    month: JUNE_1,
  });

  // ACT
  await component.getByRole("button", { name: /next month/i }).click();

  // ASSERT
  await expect(component).toContainText("July 2024");

  // ACT
  await component.getByRole("button", { name: /previous month/i }).click();
  await component.getByRole("button", { name: /previous month/i }).click();

  // ASSERT
  await expect(component).toContainText("May 2024");
});

test('should respect weekStart="sun"', async ({ mountTemplate }) => {
  // ARRANGE — `mountTemplate` replaces whatever is mounted, so the two
  // variants are asserted one at a time rather than compared side by side.
  const monWeek = await mountTemplate(
    `<okkly-calendar [month]="state().month" weekStart="mon" />`,
    { month: JUNE_1 },
  );

  // ASSERT
  await expect(monWeek.locator(".okkly-calendar__weekday").first()).toHaveText("Mo");

  // ARRANGE
  const sunWeek = await mountTemplate(
    `<okkly-calendar [month]="state().month" weekStart="sun" />`,
    { month: JUNE_1 },
  );

  // ASSERT
  await expect(sunWeek.locator(".okkly-calendar__weekday").first()).toHaveText("Su");
});

test("should mark today with aria-current and a dot", async ({ mountTemplate }) => {
  // ARRANGE — no [month], so the default internal month is the current one.
  const component = await mountTemplate(`<okkly-calendar />`);

  // ASSERT
  const today = component.locator('[aria-current="date"]');
  await expect(today).toHaveCount(1);
  await expect(today.locator(".okkly-calendar__day-dot")).toBeVisible();
});

test("should apply the accent tone as a CSS variable", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-calendar color="dante" />`);

  // ASSERT — resolves to whatever --okkly-accent-dante itself resolves to,
  // without hardcoding that token's value here.
  const [tone, dante] = await component.evaluate((el) => {
    const style = getComputedStyle(el);
    return [
      style.getPropertyValue("--okkly-calendar-tone").trim(),
      style.getPropertyValue("--okkly-accent-dante").trim(),
    ];
  });
  expect(tone).not.toBe("");
  expect(tone).toBe(dante);
});

test("should not set a tone override for the default primary color", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-calendar />`);

  // ASSERT — no inline override; the design-system default takes over.
  const inlineTone = await component.evaluate((el) =>
    (el as HTMLElement).style.getPropertyValue("--okkly-calendar-tone"),
  );
  expect(inlineTone).toBe("");
});
