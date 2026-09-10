import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { StatCard } from "./StatCard";
import { Icon } from "../Icon/Icon";
import type { StatCardColor, StatCardSize } from "./StatCard";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly StatCardColor[];
const SIZES = ["sm", "md", "lg"] as const satisfies readonly StatCardSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "StatCard (colors)",
    columns: COLORS,
    rows: ["plain", "accent"],
    fastNoIsolation: true,
    component: (column, row) => (
      <StatCard
        value="1,284"
        label="Active users"
        color={column}
        accent={row === "accent"}
        trend={{ value: "+5%", up: true }}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "StatCard (sizes)",
    columns: SIZES,
    rows: ["bare", "trend-up", "trend-down", "icon-and-description"],
    fastNoIsolation: true,
    component: (column, row) => (
      <StatCard
        size={column}
        value="1,284"
        label="Active users"
        trend={
          row === "trend-up"
            ? { value: "+5%", up: true }
            : row === "trend-down"
              ? { value: "-2%", up: false }
              : undefined
        }
        description={row === "icon-and-description" ? "Last 30 days" : undefined}
        icon={row === "icon-and-description" ? <Icon icon={MOCK_PLAYWRIGHT_ICON} /> : undefined}
      />
    ),
  });
});

test("should render the value and label with no modifiers by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<StatCard value="42" label="Active users" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-stat-card/);
  await expect(component).not.toHaveClass(/okkly-stat-card--(sm|lg|accent|color-)/);
  await expect(component.locator(".okkly-stat-card__value")).toHaveText("42");
  await expect(component.locator(".okkly-stat-card__label")).toHaveText("Active users");
});

test("should apply the size, accent and color modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <StatCard value="1" label="Metric" size="sm" accent color="dante" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-stat-card--sm/);
  await expect(component).toHaveClass(/okkly-stat-card--accent/);
  await expect(component).toHaveClass(/okkly-stat-card--color-dante/);

  // ACT
  await component.update(<StatCard value="1" label="Metric" size="lg" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-stat-card--lg/);
  await expect(component).not.toHaveClass(/okkly-stat-card--accent/);
});

test("should render the trend badge direction", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <StatCard value="100" label="Views" trend={{ value: "+5%", up: true }} />,
  );
  const trend = component.locator(".okkly-stat-card__trend");

  // ASSERT
  await expect(trend).toHaveClass(/okkly-stat-card__trend--up/);
  await expect(trend).toContainText("+5%");

  // ACT
  await component.update(
    <StatCard value="100" label="Views" trend={{ value: "-2%", up: false }} />,
  );

  // ASSERT
  await expect(trend).toHaveClass(/okkly-stat-card__trend--down/);
  await expect(trend).toContainText("-2%");
});

test("should render the icon and description slots", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <StatCard
      value="9"
      label="Score"
      description="Last 30 days"
      icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />}
    />,
  );

  // ASSERT
  await expect(component.locator(".glyph")).toBeVisible();
  await expect(component.locator(".okkly-stat-card__description")).toHaveText("Last 30 days");
});
