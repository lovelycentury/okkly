import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
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

/**
 * A JS array-literal source string, not `JSON.stringify` — an SVG's own
 * double-quoted attributes survive `JSON.stringify` as escaped `\"`
 * sequences, which Angular's expression lexer (fed the raw attribute text
 * once it is HTML-attribute-decoded) does not accept the way a real JS
 * parser would, and fails to compile the mounted template. Single-quoting
 * every string here sidesteps that, matching `SegmentedToggle.ct.ts`'s
 * `RANGE`/`FORMATTING` constants — except the icon's own SVG markup, whose
 * `"`s are HTML-entity-escaped so they cannot prematurely close the outer
 * double-quoted `[items]="..."` attribute; the HTML parser decodes them back
 * to literal `"` before Angular's expression lexer ever sees them, and a
 * plain `"` inside a single-quoted JS string needs no escaping there.
 */
const itemsLiteral = (
  items: readonly { label: string; value: string; disabled?: boolean; icon?: string }[],
) =>
  `[${items
    .map(
      (item) =>
        `{ label: '${item.label}', value: '${item.value}'${
          item.disabled ? ", disabled: true" : ""
        }${item.icon ? `, icon: '${item.icon.replace(/"/g, "&quot;")}'` : ""} }`,
    )
    .join(", ")}]`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Tabs (colors)",
    columns: COLORS,
    rows: ORIENTATIONS,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-tabs [items]="${itemsLiteral(ITEMS)}" value="activity" color="${column}" orientation="${row}" />`,
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
    component: (column) => {
      const items =
        column === "with-icons"
          ? ITEMS.map((item) => ({ ...item, icon: MOCK_PLAYWRIGHT_ICON }))
          : column === "scrollable"
            ? [
                ...ITEMS,
                { label: "Integrations", value: "integrations" },
                { label: "Billing", value: "billing" },
                { label: "Members", value: "members" },
              ]
            : ITEMS;
      return `
        <div style="width: 20rem">
          <okkly-tabs
            variant="${column === "scrollable" ? "scrollable" : "standard"}"
            value="overview"
            [items]="${itemsLiteral(items)}"
          />
          <div id="okkly-tabpanel-overview" role="tabpanel" aria-labelledby="okkly-tab-overview">
            Overview panel
          </div>
        </div>
      `;
    },
  });
});

test("should render a tablist with one tab per item", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-tabs [items]="state().items" value="overview" />`, {
    items: ITEMS,
  });

  // ASSERT
  await expect(component.getByRole("tablist")).toBeVisible();
  await expect(component.getByRole("tab")).toHaveText(["Overview", "Activity", "Settings"]);
});

test("should render with no modifier classes by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-tabs [items]="state().items" />`, {
    items: ITEMS,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-tabs/);
  await expect(component).not.toHaveClass(/okkly-tabs--color-/);
  await expect(component).not.toHaveClass(/okkly-tabs--scrollable/);
  await expect(component).not.toHaveClass(/okkly-tabs--vertical/);
});

test("should mark the active tab with aria-selected and a modifier class", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-tabs [items]="state().items" value="activity" />`, {
    items: ITEMS,
  });

  // ASSERT
  const active = component.getByRole("tab", { name: "Activity" });
  await expect(active).toHaveClass(/okkly-tabs__tab--active/);
  await expect(active).toHaveAttribute("aria-selected", "true");
  await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
});

test("should apply the variant, orientation and color modifiers", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-tabs [items]="state().items" [variant]="state().variant" [orientation]="state().orientation" [color]="state().color" />`,
    { items: ITEMS, variant: "scrollable", orientation: "horizontal", color: "primary" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--scrollable/);
  await expect(component.locator(".okkly-tabs__scroller")).toBeVisible();

  // ACT
  await update({ orientation: "vertical" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--vertical/);

  // ACT
  await update({ color: "dante" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-tabs--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-tabs--color-/);
});

test("should emit valueChange with the selected tab value", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-tabs [items]="state().items" value="overview" (valueChange)="record('change', $event)" />`,
    { items: ITEMS },
  );

  // ACT
  await component.getByRole("tab", { name: "Activity" }).click();

  // ASSERT
  expect(await recordedEvents("change")).toEqual(["activity"]);
});

test("should update the selection when unbound", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-tabs [items]="state().items" />`, {
    items: ITEMS,
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

test("should disable individual tabs", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-tabs [items]="state().items" />`, {
    items: ITEMS,
  });

  // ASSERT
  await expect(component.getByRole("tab", { name: "Settings" })).toBeDisabled();
});

test("should render a leading icon when provided", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-tabs [items]="state().items" />`, {
    items: [{ label: "Home", value: "home", icon: MOCK_PLAYWRIGHT_ICON }],
  });

  // ASSERT
  await expect(component.locator(".okkly-tabs__icon svg")).toBeVisible();
});

test.describe("keyboard navigation", () => {
  test("should move and select with ArrowRight/ArrowLeft in horizontal tabs", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-tabs [items]="state().items" value="overview" />`,
      { items: ITEMS },
    );
    const overview = component.getByRole("tab", { name: "Overview" });
    await overview.focus();

    // ACT — Settings is disabled, so ArrowRight from Activity wraps back to Overview.
    await overview.press("ArrowRight");

    // ASSERT
    await expect(component.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(component.getByRole("tab", { name: "Activity" })).toBeFocused();

    // ACT
    await component.getByRole("tab", { name: "Activity" }).press("ArrowRight");

    // ASSERT — wraps past the disabled Settings tab back to Overview.
    await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // ACT
    await component.getByRole("tab", { name: "Overview" }).press("ArrowLeft");

    // ASSERT
    await expect(component.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("should jump to the first and last enabled tab with Home/End", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-tabs [items]="state().items" value="activity" />`,
      { items: ITEMS },
    );

    // ACT
    await component.getByRole("tab", { name: "Activity" }).press("End");

    // ASSERT — Settings is disabled, so End lands on the last enabled tab (Activity itself).
    await expect(component.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // ACT
    await component.getByRole("tab", { name: "Activity" }).press("Home");

    // ASSERT
    await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("should use ArrowDown/ArrowUp when vertical", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-tabs [items]="state().items" value="overview" orientation="vertical" />`,
      { items: ITEMS },
    );

    // ACT
    await component.getByRole("tab", { name: "Overview" }).press("ArrowDown");

    // ASSERT
    await expect(component.getByRole("tab", { name: "Activity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // ACT
    await component.getByRole("tab", { name: "Activity" }).press("ArrowUp");

    // ASSERT
    await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("should only make the active tab tabbable", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-tabs [items]="state().items" value="activity" />`,
      { items: ITEMS },
    );

    // ASSERT
    await expect(component.getByRole("tab", { name: "Activity" })).toHaveAttribute("tabindex", "0");
    await expect(component.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });
});
