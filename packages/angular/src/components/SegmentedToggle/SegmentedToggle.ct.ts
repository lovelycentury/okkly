import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { SegmentedToggleColor } from "./SegmentedToggle";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly SegmentedToggleColor[];

const RANGE_ITEMS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const RANGE = `[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }]`;
const FORMATTING = `[{ label: 'Bold', value: 'bold' }, { label: 'Italic', value: 'italic' }]`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "SegmentedToggle (colors)",
    columns: COLORS,
    rows: ["none-selected", "one-selected", "disabled"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-segmented-toggle [items]="${RANGE}" color="${column}"${
        row === "disabled" ? " disabled" : ""
      }${row === "one-selected" ? ` value="week"` : ""} />`,
  });

  executeMatrixScreenshotTest({
    name: "SegmentedToggle (modes)",
    columns: ["exclusive", "multi", "per-item-disabled"],
    rows: ["default", "hover"],
    hooks: {
      beforeEach: async (component, _page, _column, row) => {
        if (row === "hover") await component.getByRole("button").first().hover();
      },
    },
    component: (column) =>
      column === "multi"
        ? `<okkly-segmented-toggle [exclusive]="false" [value]="['bold']" [items]="${FORMATTING}" />`
        : `<okkly-segmented-toggle value="day" [items]="${
            column === "per-item-disabled"
              ? `[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week', disabled: true }]`
              : RANGE
          }" />`,
  });
});

test("should render one button per item inside a group", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-segmented-toggle [items]="state().items" />`, {
    items: RANGE_ITEMS,
  });

  // ASSERT — the group role sits on the component root itself.
  await expect(component).toHaveRole("group");
  await expect(component.getByRole("button")).toHaveText(["Day", "Week", "Month"]);
});

test("should render with no modifier classes by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-segmented-toggle [items]="state().items" />`, {
    items: RANGE_ITEMS,
  });

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-segmented-toggle");
});

test("should mark the active segment from value", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-segmented-toggle [items]="state().items" value="week" />`,
    { items: RANGE_ITEMS },
  );

  // ASSERT
  const week = component.getByRole("button", { name: "Week" });
  await expect(week).toHaveClass(/okkly-segmented-toggle__segment--active/);
  await expect(week).toHaveAttribute("aria-pressed", "true");
  await expect(component.getByRole("button", { name: "Day" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("should apply the color modifier only for non-default colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-segmented-toggle [items]="state().items" [color]="state().color" />`,
    { items: RANGE_ITEMS, color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-segmented-toggle--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-segmented-toggle--color-/);
});

test("should emit the selected value in exclusive mode", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-segmented-toggle [items]="state().items" value="day" (valueChange)="record('value', $event)" />`,
    { items: RANGE_ITEMS },
  );

  // ACT
  await component.getByRole("button", { name: "Month" }).click();

  // ASSERT
  expect(await recordedEvents("value")).toEqual(["month"]);
  await expect(component.getByRole("button", { name: "Month" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(component.getByRole("button", { name: "Day" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("should toggle values in multi-select mode", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-segmented-toggle [exclusive]="false" [value]="['bold']" [items]="${FORMATTING}" (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("button", { name: "Italic" }).click();
  await component.getByRole("button", { name: "Bold" }).click();

  // ASSERT — each click toggles against the selection the last one left.
  expect(await recordedEvents("value")).toEqual([["bold", "italic"], ["italic"]]);
  await expect(component.getByRole("button", { name: "Italic" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("should respect per-item disabled", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-segmented-toggle [items]="[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week', disabled: true }]" />`,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Week" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Day" })).toBeEnabled();
});

test("should disable every segment", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-segmented-toggle [items]="state().items" disabled />`,
    { items: RANGE_ITEMS },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-segmented-toggle--disabled/);
  for (const button of await component.getByRole("button").all()) {
    await expect(button).toBeDisabled();
  }
});

test("should render an icon segment named by ariaLabel", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-segmented-toggle [items]="state().items" />`, {
    items: [{ value: "grid", icon: MOCK_PLAYWRIGHT_ICON, ariaLabel: "Grid view" }],
  });
  const segment = component.getByRole("button", { name: "Grid view" });

  // ASSERT
  await expect(segment.locator(".okkly-segmented-toggle__icon svg")).toBeVisible();
  await expect(segment.locator(".okkly-segmented-toggle__icon")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});
