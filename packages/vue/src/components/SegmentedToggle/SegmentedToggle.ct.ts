import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import SegmentedToggle from "./SegmentedToggle.vue";
import SegmentedToggleFixture from "../../playwright/fixtures/SegmentedToggleFixture.vue";
import type { SegmentedToggleColor } from "./SegmentedToggle.types";

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

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "SegmentedToggle (colors)",
    columns: COLORS,
    rows: ["none-selected", "one-selected", "disabled"],
    fastNoIsolation: true,
    component: SegmentedToggle,
    args: (column, row) => ({
      props: {
        items: RANGE_ITEMS,
        color: column,
        disabled: row === "disabled",
        modelValue: row === "one-selected" ? "week" : undefined,
      } as never,
    }),
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
    component: SegmentedToggle,
    args: (column) =>
      column === "multi"
        ? {
            props: {
              exclusive: false,
              modelValue: ["bold"],
              items: [
                { label: "Bold", value: "bold" },
                { label: "Italic", value: "italic" },
              ],
            } as never,
            on: { "update:modelValue": () => {} },
          }
        : {
            props: {
              modelValue: "day",
              items:
                column === "per-item-disabled"
                  ? [
                      { label: "Day", value: "day" },
                      { label: "Week", value: "week", disabled: true },
                    ]
                  : RANGE_ITEMS,
            } as never,
            on: { "update:modelValue": () => {} },
          },
  });
});

test("should render one button per item inside a group", async ({ mount }) => {
  // ARRANGE
  const component = await mount(SegmentedToggle, { props: { items: RANGE_ITEMS } });

  // ASSERT — the group role sits on the component root itself.
  await expect(component).toHaveRole("group");
  await expect(component.getByRole("button")).toHaveText(["Day", "Week", "Month"]);
});

test("should render with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(SegmentedToggle, { props: { items: RANGE_ITEMS } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-segmented-toggle/);
  await expect(component).not.toHaveClass(/okkly-segmented-toggle--color-/);
  await expect(component).not.toHaveClass(/okkly-segmented-toggle--disabled/);
});

test("should mark the active segment from modelValue", async ({ mount }) => {
  // ARRANGE
  const component = await mount(SegmentedToggle, {
    props: { items: RANGE_ITEMS, modelValue: "week" } as never,
  });

  // ASSERT
  const week = component.getByRole("button", { name: "Week" });
  await expect(week).toHaveClass(/okkly-segmented-toggle__segment--active/);
  await expect(week).toHaveAttribute("aria-pressed", "true");
  await expect(component.getByRole("button", { name: "Day" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("should apply the color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(SegmentedToggle, {
    props: { items: RANGE_ITEMS, color: "dante" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-segmented-toggle--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-segmented-toggle--color-/);
});

test("should fire update:modelValue with the selected value in exclusive mode", async ({
  mount,
}) => {
  const changes: (string | string[])[] = [];

  // ARRANGE
  const component = await mount(SegmentedToggle, {
    props: { items: RANGE_ITEMS, modelValue: "day" } as never,
    on: { "update:modelValue": (value: string | string[]) => changes.push(value) },
  });

  // ACT
  await component.getByRole("button", { name: "Month" }).click();

  // ASSERT
  expect(changes).toEqual(["month"]);
});

test("should toggle values in multi-select mode", async ({ mount }) => {
  const changes: (string | string[])[] = [];

  // ARRANGE — SegmentedToggleFixture binds `:model-value`/`@update:model-value`
  // together in a real template so the fixed prop genuinely wins; see its
  // doc comment for why mounting SegmentedToggle directly can't exercise this.
  const component = await mount(SegmentedToggleFixture, {
    props: {
      exclusive: false,
      modelValue: ["bold"],
      items: [
        { label: "Bold", value: "bold" },
        { label: "Italic", value: "italic" },
      ],
    } as never,
    on: { change: (value: string | string[]) => changes.push(value) },
  });

  // ACT
  await component.getByRole("button", { name: "Italic" }).click();
  await component.getByRole("button", { name: "Bold" }).click();

  // ASSERT — the value is controlled, so each click reports against ["bold"].
  expect(changes).toEqual([["bold", "italic"], []]);
});

test("should update the selection in uncontrolled exclusive mode", async ({ mount }) => {
  // ARRANGE
  const component = await mount(SegmentedToggle, {
    props: { items: RANGE_ITEMS, defaultValue: "day" } as never,
  });

  // ACT
  await component.getByRole("button", { name: "Week" }).click();

  // ASSERT
  await expect(component.getByRole("button", { name: "Week" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(component.getByRole("button", { name: "Day" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("should respect per-item disabled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(SegmentedToggle, {
    props: {
      items: [
        { label: "Day", value: "day" },
        { label: "Week", value: "week", disabled: true },
      ],
    },
  });

  // ASSERT
  await expect(component.getByRole("button", { name: "Week" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Day" })).toBeEnabled();
});
