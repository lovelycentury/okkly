import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import TabsFixture from "../../playwright/fixtures/TabsFixture.vue";
import TabsWithPanel from "../../playwright/fixtures/TabsWithPanel.vue";
import Tabs from "./Tabs.vue";
import type { TabItem, TabsColor, TabsOrientation } from "./Tabs.types";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly TabsColor[];
const ORIENTATIONS = ["horizontal", "vertical"] as const satisfies readonly TabsOrientation[];

const ITEMS: TabItem[] = [
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
    component: Tabs,
    args: (column, row) => ({
      props: { items: ITEMS, modelValue: "activity", color: column, orientation: row } as never,
    }),
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
    component: TabsWithPanel,
    args: (column) => ({
      props: {
        variant: column === "scrollable" ? "scrollable" : "standard",
        modelValue: "overview",
        items:
          column === "with-icons"
            ? ITEMS.map((item) => ({ ...item, icon: MOCK_PLAYWRIGHT_ICON }))
            : column === "scrollable"
              ? [
                  ...ITEMS,
                  { label: "Integrations", value: "integrations" },
                  { label: "Billing", value: "billing" },
                  { label: "Members", value: "members" },
                ]
              : ITEMS,
      } as never,
    }),
  });
});

test("should render a tablist with one tab per item", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Tabs, { props: { items: ITEMS, modelValue: "overview" } as never });

  // ASSERT
  await expect(component.getByRole("tablist")).toBeVisible();
  await expect(component.getByRole("tab")).toHaveText(["Overview", "Activity", "Settings"]);
});

test("should render with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Tabs, { props: { items: ITEMS } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-tabs/);
  await expect(component).not.toHaveClass(/okkly-tabs--color-/);
  await expect(component).not.toHaveClass(/okkly-tabs--scrollable/);
  await expect(component).not.toHaveClass(/okkly-tabs--vertical/);
});

test("should mark the active tab with aria-selected and a modifier class", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Tabs, { props: { items: ITEMS, modelValue: "activity" } as never });

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
  const component = await mount(Tabs, { props: { items: ITEMS, variant: "scrollable" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--scrollable/);
  await expect(component.locator(".okkly-tabs__scroller")).toBeVisible();

  // ACT
  await component.update({ props: { items: ITEMS, orientation: "vertical" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--vertical/);

  // ACT
  await component.update({ props: { items: ITEMS, color: "dante" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--color-dante/);

  // ACT
  await component.update({ props: { items: ITEMS, color: "primary" } as never });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-tabs--color-/);
});

test("should fire update:modelValue with the selected tab value", async ({ mount }) => {
  const changes: string[] = [];

  // ARRANGE
  const component = await mount(Tabs, {
    props: { items: ITEMS, modelValue: "overview" } as never,
    on: { "update:modelValue": (...args: unknown[]) => changes.push(args[0] as string) },
  });

  // ACT
  await component.getByRole("tab", { name: "Activity" }).click();

  // ASSERT
  expect(changes).toEqual(["activity"]);
});

test("should update the selection in uncontrolled mode", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Tabs, {
    props: { items: ITEMS, defaultValue: "overview" } as never,
  });

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
  const component = await mount(Tabs, { props: { items: ITEMS } as never });

  // ASSERT
  await expect(component.getByRole("tab", { name: "Settings" })).toBeDisabled();
});

test("should render a leading icon when provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Tabs, {
    props: {
      items: [{ label: "Home", value: "home", icon: MOCK_PLAYWRIGHT_ICON }],
    } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-tabs__icon")).toBeVisible();
});

test.describe("keyboard navigation", () => {
  test("should move to the next tab with ArrowRight and skip disabled tabs", async ({
    mount,
    page,
  }) => {
    const changes: string[] = [];

    // ARRANGE
    const component = await mount(Tabs, {
      props: { items: ITEMS, modelValue: "activity" } as never,
      on: { "update:modelValue": (...args: unknown[]) => changes.push(args[0] as string) },
    });

    // ACT — Settings is disabled, so ArrowRight from Activity wraps to Overview.
    await component.getByRole("tab", { name: "Activity" }).focus();
    await page.keyboard.press("ArrowRight");

    // ASSERT
    expect(changes).toEqual(["overview"]);
    await expect(component.getByRole("tab", { name: "Overview" })).toBeFocused();
  });

  test("should move to the previous tab with ArrowLeft", async ({ mount, page }) => {
    const changes: string[] = [];

    // ARRANGE
    const component = await mount(Tabs, {
      props: { items: ITEMS, modelValue: "activity" } as never,
      on: { "update:modelValue": (...args: unknown[]) => changes.push(args[0] as string) },
    });

    // ACT
    await component.getByRole("tab", { name: "Activity" }).focus();
    await page.keyboard.press("ArrowLeft");

    // ASSERT
    expect(changes).toEqual(["overview"]);
  });

  test("should use ArrowDown/ArrowUp instead when vertical", async ({ mount, page }) => {
    const changes: string[] = [];

    // ARRANGE
    const component = await mount(Tabs, {
      props: { items: ITEMS, modelValue: "overview", orientation: "vertical" } as never,
      on: { "update:modelValue": (...args: unknown[]) => changes.push(args[0] as string) },
    });

    // ACT
    await component.getByRole("tab", { name: "Overview" }).focus();
    await page.keyboard.press("ArrowDown");

    // ASSERT
    expect(changes).toEqual(["activity"]);
  });

  test("should jump to the first and last enabled tab with Home and End", async ({
    mount,
    page,
  }) => {
    const changes: string[] = [];

    // ARRANGE — Settings is disabled, so End lands on Activity. Uses the
    // fixture since this test needs the model to actually advance between
    // the two key presses — a root `mount()` prop stays fixed across them.
    const component = await mount(TabsFixture, {
      props: { items: ITEMS, initialValue: "overview" } as never,
      on: { change: (...args: unknown[]) => changes.push(args[0] as string) },
    });

    // ACT
    await component.getByRole("tab", { name: "Overview" }).focus();
    await page.keyboard.press("End");

    // ASSERT
    expect(changes).toEqual(["activity"]);

    // ACT
    await page.keyboard.press("Home");

    // ASSERT
    expect(changes).toEqual(["activity", "overview"]);
  });

  test("should only keep the active tab in the tab order", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Tabs, {
      props: { items: ITEMS, modelValue: "activity" } as never,
    });

    // ASSERT
    await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    await expect(component.getByRole("tab", { name: "Activity" })).toHaveAttribute("tabindex", "0");
  });
});
