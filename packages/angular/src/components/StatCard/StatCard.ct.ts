import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
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

const glyph = (className = "") =>
  MOCK_PLAYWRIGHT_ICON.replace(
    "<svg",
    `<svg okklyStatCardIcon${className ? ` class="${className}"` : ""}`,
  );

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "StatCard (colors)",
    columns: COLORS,
    rows: ["plain", "accent"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-stat-card value="1,284" label="Active users" color="${column}"${
        row === "accent" ? " accent" : ""
      } [trend]="{ value: '+5%', up: true }" />`,
  });

  executeMatrixScreenshotTest({
    name: "StatCard (sizes)",
    columns: SIZES,
    rows: ["bare", "trend-up", "trend-down", "icon-and-description"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-stat-card size="${column}" value="1,284" label="Active users"${
        row === "trend-up"
          ? ` [trend]="{ value: '+5%', up: true }"`
          : row === "trend-down"
            ? ` [trend]="{ value: '-2%', up: false }"`
            : ""
      }${row === "icon-and-description" ? ` description="Last 30 days"` : ""}>${
        row === "icon-and-description" ? glyph() : ""
      }</okkly-stat-card>`,
  });
});

test("should render the value and label with no modifiers by default", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-stat-card value="42" label="Active users" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-stat-card");
  await expect(component.locator(".okkly-stat-card__value")).toHaveText("42");
  await expect(component.locator(".okkly-stat-card__label")).toHaveText("Active users");
  await expect(component.locator(".okkly-stat-card__header")).toHaveCount(0);
  await expect(component.locator(".okkly-stat-card__trend")).toHaveCount(0);
  await expect(component.locator(".okkly-stat-card__description")).toHaveCount(0);
});

test("should apply the size, accent and color modifiers", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stat-card value="1" label="Metric" [size]="state().size" [accent]="state().accent" [color]="state().color" />`,
    { size: "sm", accent: true, color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-stat-card--sm/);
  await expect(component).toHaveClass(/okkly-stat-card--accent/);
  await expect(component).toHaveClass(/okkly-stat-card--color-dante/);

  // ACT
  await update({ size: "lg", accent: false, color: "primary" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-stat-card--lg/);
  await expect(component).not.toHaveClass(/okkly-stat-card--(accent|color-)/);
});

test("should render the trend badge direction and speak it", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stat-card value="100" label="Views" [trend]="state().trend" />`,
    { trend: { value: "+5%", up: true } },
  );
  const trend = component.locator(".okkly-stat-card__trend");

  // ASSERT
  await expect(trend).toHaveClass(/okkly-stat-card__trend--up/);
  await expect(trend).toContainText("+5%");
  await expect(component.getByRole("img", { name: "Up +5%" })).toBeVisible();

  // ACT
  await update({ trend: { value: "-2%", up: false } });

  // ASSERT
  await expect(trend).toHaveClass(/okkly-stat-card__trend--down/);
  await expect(trend).toContainText("-2%");
  await expect(component.getByRole("img", { name: "Down -2%" })).toBeVisible();
});

test("should render the icon and description slots", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stat-card value="9" label="Score" description="Last 30 days">${glyph("glyph")}</okkly-stat-card>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-stat-card__icon .glyph")).toBeVisible();
  await expect(component.locator(".okkly-stat-card__description")).toHaveText("Last 30 days");
});

test("should render projected content inside the value", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-stat-card value="€12,480" label="Revenue"><span class="unit"> /mo</span></okkly-stat-card>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-stat-card__value .unit")).toBeVisible();
  await expect(component.locator(".okkly-stat-card__value")).toHaveText("€12,480 /mo");
});
