import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { SeverityIconSeverity, SeverityIconShape, SeverityIconSize } from "./SeverityIcon";

const SEVERITIES = [
  "success",
  "info",
  "warning",
  "danger",
  "primary",
  "neutral",
] as const satisfies readonly SeverityIconSeverity[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SeverityIconSize[];
const SHAPES = ["circle", "rounded"] as const satisfies readonly SeverityIconShape[];

const glyph = MOCK_PLAYWRIGHT_ICON.replace("<svg", `<svg okklySeverityIconGlyph class="glyph"`);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "SeverityIcon (severities)",
    columns: SEVERITIES,
    rows: SHAPES,
    fastNoIsolation: true,
    component: (column, row) => `<okkly-severity-icon severity="${column}" shape="${row}" />`,
  });

  executeMatrixScreenshotTest({
    name: "SeverityIcon (sizes)",
    columns: SIZES,
    rows: [...SHAPES, "custom-icon"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-severity-icon size="${column}" shape="${row === "rounded" ? "rounded" : "circle"}">${
        row === "custom-icon" ? glyph : ""
      }</okkly-severity-icon>`,
  });
});

test("should render with the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-severity-icon />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-severity-icon");
  await expect(component.locator(".okkly-severity-icon__icon svg")).toBeAttached();
});

test("should apply a severity modifier only for non-info severities", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-severity-icon [severity]="state().severity" />`, {
    severity: "success",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-severity-icon--success/);

  // ACT
  await update({ severity: "info" });

  // ASSERT
  await expect(component).not.toHaveClass(
    /okkly-severity-icon--(success|warning|danger|primary|neutral)/,
  );
});

test("should apply size modifiers only for non-medium sizes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-severity-icon [size]="state().size" />`, {
    size: "small",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-severity-icon--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-severity-icon--(small|large)/);
});

test("should apply the rounded shape modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-severity-icon shape="rounded" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-severity-icon--rounded/);
});

test("should render a custom glyph instead of the built-in one", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-severity-icon>${glyph}</okkly-severity-icon>`);

  // ASSERT — the built-in glyph is replaced, not layered underneath.
  await expect(component.locator(".okkly-severity-icon__icon .glyph")).toBeVisible();
  await expect(component.locator(".okkly-severity-icon__icon > svg")).toHaveCount(1);
});

test("should pick a distinct default glyph per severity", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-severity-icon [severity]="state().severity" />`, {
    severity: "success",
  });
  const path = component.locator(".okkly-severity-icon__icon svg path").first();

  // ASSERT — and the glyph is real SVG, not an HTML element named `path`.
  await expect(path).toHaveAttribute("d", /9 17/);
  expect(await path.evaluate((element) => element instanceof SVGPathElement)).toBe(true);

  // ACT
  await update({ severity: "danger" });

  // ASSERT
  await expect(path).toHaveAttribute("d", /6 18/);
});

test.describe("accessibility", () => {
  test("should hide an unlabelled icon from assistive tech", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-severity-icon severity="danger" />`);

    // ASSERT
    await expect(component).toHaveAttribute("aria-hidden", "true");
    await expect(component).not.toHaveAttribute("aria-label");
  });

  test("should expose a labelled icon as a named image", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-severity-icon severity="danger" label="Failed" />`,
    );

    // ASSERT
    await expect(component).toHaveRole("img");
    await expect(component).toHaveAccessibleName("Failed");
    await expect(component).not.toHaveAttribute("aria-hidden");
  });
});
