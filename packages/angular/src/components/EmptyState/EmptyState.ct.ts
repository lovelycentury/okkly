import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { EmptyStateColor, EmptyStateSize } from "./EmptyState";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "danger",
] as const satisfies readonly EmptyStateColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly EmptyStateSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "EmptyState (colors)",
    columns: COLORS,
    rows: ["with-action", "without-action"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-empty-state color="${column}" title="No projects yet" description="Create one to get started.">${
        row === "with-action"
          ? `<button okklyButton okklyEmptyStateAction size="small">Create</button>`
          : ""
      }</okkly-empty-state>`,
  });

  executeMatrixScreenshotTest({
    name: "EmptyState (sizes)",
    columns: SIZES,
    rows: ["default", "custom-icon"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-empty-state size="${column}" title="No results" description="Try a different query.">${
        row === "custom-icon"
          ? MOCK_PLAYWRIGHT_ICON.replace("<svg", "<svg okklyEmptyStateIcon")
          : ""
      }</okkly-empty-state>`,
  });
});

test("should render the title and the description", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-empty-state title="No results" description="Try a different query." />`,
  );

  // ASSERT
  await expect(component.getByRole("heading", { level: 4 })).toHaveText("No results");
  await expect(component).toContainText("Try a different query.");
  await expect(component).not.toHaveAttribute("title");
});

test("should leave the description out when it is not set", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-empty-state title="Empty" />`);

  // ASSERT
  await expect(component.locator(".okkly-empty-state__description")).toHaveCount(0);
  await expect(component.locator(".okkly-empty-state__action")).toHaveCount(0);
});

test("should apply the default classes without modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-empty-state title="Empty" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-empty-state/);
  await expect(component).not.toHaveClass(/okkly-empty-state--(small|large|dante|indigo|danger)/);
});

test("should apply size modifiers for non-medium sizes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-empty-state title="Empty" [size]="state().size" />`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-empty-state--small/);

  // ACT
  await update({ size: "large" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-empty-state--large/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-empty-state--(small|large)/);
});

test("should apply the color modifier and render the action slot", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-empty-state title="Empty" color="dante">
      <button okklyButton okklyEmptyStateAction size="small">Create</button>
    </okkly-empty-state>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-empty-state--dante/);
  await expect(
    component.locator(".okkly-empty-state__action").getByRole("button", { name: "Create" }),
  ).toBeVisible();
});

test("should draw the default icon in the color's severity", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-empty-state title="Empty" [color]="state().color" [severity]="state().severity" />`,
    { color: "danger", severity: undefined },
  );
  const icon = component.locator(".okkly-severity-icon");

  // ASSERT
  await expect(icon).toHaveClass(/okkly-severity-icon--danger/);

  // ACT
  await update({ color: "primary", severity: "warning" });

  // ASSERT — severity picks the glyph regardless of the tone.
  await expect(icon).toHaveClass(/okkly-severity-icon--warning/);
});

test("should render a custom icon in place of the default one", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-empty-state title="Empty">
      <okkly-icon okklyEmptyStateIcon class="glyph" [icon]="state().icon" />
    </okkly-empty-state>`,
    { icon: MOCK_PLAYWRIGHT_ICON },
  );

  // ASSERT
  await expect(component.locator(".okkly-empty-state__icon .glyph")).toBeVisible();
  await expect(component.locator(".okkly-severity-icon")).toHaveCount(0);
});
