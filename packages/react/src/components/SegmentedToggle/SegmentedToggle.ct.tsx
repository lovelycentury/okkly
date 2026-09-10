import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { SegmentedToggle } from "./SegmentedToggle";
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

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "SegmentedToggle (colors)",
    columns: COLORS,
    rows: ["none-selected", "one-selected", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <SegmentedToggle
        items={RANGE_ITEMS}
        color={column}
        disabled={row === "disabled"}
        value={row === "one-selected" ? "week" : undefined}
      />
    ),
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
      column === "multi" ? (
        <SegmentedToggle
          exclusive={false}
          value={["bold"]}
          onChange={() => {}}
          items={[
            { label: "Bold", value: "bold" },
            { label: "Italic", value: "italic" },
          ]}
        />
      ) : (
        <SegmentedToggle
          value="day"
          onChange={() => {}}
          items={
            column === "per-item-disabled"
              ? [
                  { label: "Day", value: "day" },
                  { label: "Week", value: "week", disabled: true },
                ]
              : RANGE_ITEMS
          }
        />
      ),
  });
});

test("should render one button per item inside a group", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SegmentedToggle items={RANGE_ITEMS} />);

  // ASSERT — the group role sits on the component root itself.
  await expect(component).toHaveRole("group");
  await expect(component.getByRole("button")).toHaveText(["Day", "Week", "Month"]);
});

test("should render with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SegmentedToggle items={RANGE_ITEMS} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-segmented-toggle/);
  await expect(component).not.toHaveClass(/okkly-segmented-toggle--color-/);
  await expect(component).not.toHaveClass(/okkly-segmented-toggle--disabled/);
});

test("should mark the active segment from value", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SegmentedToggle items={RANGE_ITEMS} value="week" />);

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
  const component = await mount(<SegmentedToggle items={RANGE_ITEMS} color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-segmented-toggle--color-dante/);

  // ACT
  await component.update(<SegmentedToggle items={RANGE_ITEMS} color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-segmented-toggle--color-/);
});

test("should fire onChange with the selected value in exclusive mode", async ({ mount }) => {
  const changes: (string | string[])[] = [];

  // ARRANGE
  const component = await mount(
    <SegmentedToggle items={RANGE_ITEMS} value="day" onChange={(value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("button", { name: "Month" }).click();

  // ASSERT
  expect(changes).toEqual(["month"]);
});

test("should toggle values in multi-select mode", async ({ mount }) => {
  const changes: (string | string[])[] = [];

  // ARRANGE
  const component = await mount(
    <SegmentedToggle
      exclusive={false}
      value={["bold"]}
      onChange={(value) => changes.push(value)}
      items={[
        { label: "Bold", value: "bold" },
        { label: "Italic", value: "italic" },
      ]}
    />,
  );

  // ACT
  await component.getByRole("button", { name: "Italic" }).click();
  await component.getByRole("button", { name: "Bold" }).click();

  // ASSERT — the value is controlled, so each click reports against ["bold"].
  expect(changes).toEqual([["bold", "italic"], []]);
});

test("should update the selection in uncontrolled exclusive mode", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SegmentedToggle items={RANGE_ITEMS} defaultValue="day" />);

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
  const component = await mount(
    <SegmentedToggle
      items={[
        { label: "Day", value: "day" },
        { label: "Week", value: "week", disabled: true },
      ]}
    />,
  );

  // ASSERT
  await expect(component.getByRole("button", { name: "Week" })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Day" })).toBeEnabled();
});
