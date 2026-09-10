import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { Tabs } from "./Tabs";
import { Icon } from "../Icon/Icon";
import type { TabsColor, TabsOrientation } from "./Tabs";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly TabsColor[];
const ORIENTATIONS = ["horizontal", "vertical"] as const satisfies readonly TabsOrientation[];

const ITEMS = [
  { label: "Overview", value: "overview" },
  { label: "Activity", value: "activity" },
  { label: "Settings", value: "settings", disabled: true },
];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Tabs (colors)",
    columns: COLORS,
    rows: ORIENTATIONS,
    fastNoIsolation: true,
    component: (column, row) => (
      <Tabs items={ITEMS} value="activity" color={column} orientation={row} />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Tabs (variants)",
    columns: ["standard", "scrollable", "with-icons"],
    rows: ["default", "hover"],
    hooks: {
      beforeEach: async (component, _page, _column, row) => {
        if (row === "hover") await component.getByRole("tab").first().hover();
      },
    },
    component: (column) => (
      <div style={{ width: "20rem" }}>
        <Tabs
          variant={column === "scrollable" ? "scrollable" : "standard"}
          value="overview"
          items={
            column === "with-icons"
              ? ITEMS.map((item) => ({ ...item, icon: <Icon icon={MOCK_PLAYWRIGHT_ICON} /> }))
              : column === "scrollable"
                ? [
                    ...ITEMS,
                    { label: "Integrations", value: "integrations" },
                    { label: "Billing", value: "billing" },
                    { label: "Members", value: "members" },
                  ]
                : ITEMS
          }
        />
        {/*
          The active tab points `aria-controls` at a panel the consumer owns, so
          the panel has to exist here too — a tablist mounted on its own would
          reference a missing id and fail the accessibility scan for a fault
          that only the test harness had.
        */}
        <div id="okkly-tabpanel-overview" role="tabpanel" aria-labelledby="okkly-tab-overview">
          Overview panel
        </div>
      </div>
    ),
  });
});

test("should render a tablist with one tab per item", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Tabs items={ITEMS} value="overview" />);

  // ASSERT
  await expect(component.getByRole("tablist")).toBeVisible();
  await expect(component.getByRole("tab")).toHaveText(["Overview", "Activity", "Settings"]);
});

test("should render with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Tabs items={ITEMS} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-tabs/);
  await expect(component).not.toHaveClass(/okkly-tabs--color-/);
  await expect(component).not.toHaveClass(/okkly-tabs--scrollable/);
  await expect(component).not.toHaveClass(/okkly-tabs--vertical/);
});

test("should mark the active tab with aria-selected and a modifier class", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Tabs items={ITEMS} value="activity" />);

  // ASSERT
  const active = component.getByRole("tab", { name: "Activity" });
  await expect(active).toHaveClass(/okkly-tabs__tab--active/);
  await expect(active).toHaveAttribute("aria-selected", "true");
  await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
});

test("should apply the variant, orientation and color modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Tabs items={ITEMS} variant="scrollable" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--scrollable/);
  await expect(component.locator(".okkly-tabs__scroller")).toBeVisible();

  // ACT
  await component.update(<Tabs items={ITEMS} orientation="vertical" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--vertical/);

  // ACT
  await component.update(<Tabs items={ITEMS} color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--color-dante/);

  // ACT
  await component.update(<Tabs items={ITEMS} color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-tabs--color-/);
});

test("should fire onChange with the selected tab value", async ({ mount }) => {
  const changes: string[] = [];

  // ARRANGE
  const component = await mount(
    <Tabs items={ITEMS} value="overview" onChange={(_event, value) => changes.push(value)} />,
  );

  // ACT
  await component.getByRole("tab", { name: "Activity" }).click();

  // ASSERT
  expect(changes).toEqual(["activity"]);
});

test("should update the selection in uncontrolled mode", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Tabs items={ITEMS} defaultValue="overview" />);

  // ACT
  await component.getByRole("tab", { name: "Activity" }).click();

  // ASSERT
  await expect(component.getByRole("tab", { name: "Activity" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
});

test("should disable individual tabs", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Tabs items={ITEMS} />);

  // ASSERT
  await expect(component.getByRole("tab", { name: "Settings" })).toBeDisabled();
});

test("should render a leading icon when provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Tabs
      items={[
        {
          label: "Home",
          value: "home",
          icon: <Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />,
        },
      ]}
    />,
  );

  // ASSERT
  await expect(component.locator(".glyph")).toBeVisible();
});
