import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { EmptyState } from "./EmptyState";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
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
    component: (column, row) => (
      <EmptyState
        color={column}
        title="No projects yet"
        description="Create one to get started."
        action={row === "with-action" ? <Button size="small">Create</Button> : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "EmptyState (sizes)",
    columns: SIZES,
    rows: ["default", "custom-icon"],
    fastNoIsolation: true,
    component: (column, row) => (
      <EmptyState
        size={column}
        title="No results"
        description="Try a different query."
        icon={row === "custom-icon" ? <Icon icon={MOCK_PLAYWRIGHT_ICON} /> : undefined}
      />
    ),
  });
});

test("should render the title and the description", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <EmptyState title="No results" description="Try a different query." />,
  );

  // ASSERT
  await expect(component.getByRole("heading", { level: 4 })).toHaveText("No results");
  await expect(component).toContainText("Try a different query.");
});

test("should apply the default classes without modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<EmptyState title="Empty" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-empty-state/);
  await expect(component).not.toHaveClass(/okkly-empty-state--(small|large|dante|indigo|danger)/);
});

test("should apply size modifiers for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<EmptyState title="Empty" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-empty-state--small/);

  // ACT
  await component.update(<EmptyState title="Empty" size="large" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-empty-state--large/);

  // ACT
  await component.update(<EmptyState title="Empty" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-empty-state--(small|large)/);
});

test("should apply the color modifier and render the action slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <EmptyState title="Empty" color="dante" action={<Button size="small">Create</Button>} />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-empty-state--dante/);
  await expect(component.getByRole("button", { name: "Create" })).toBeVisible();
});

test("should render a custom icon", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <EmptyState title="Empty" icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />} />,
  );

  // ASSERT
  await expect(component.locator(".glyph")).toBeVisible();
});
