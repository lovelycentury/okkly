import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { IconColor, IconSize } from "./Icon";

const COLORS = [
  "inherit",
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
  "muted",
] as const satisfies readonly IconColor[];
const SIZES = ["small", "medium", "large", "inherit"] as const satisfies readonly IconSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Icon (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-icon name="iconStar" color="${column}" fontSize="${row}" />`,
  });

  executeMatrixScreenshotTest({
    name: "Icon (inline with text)",
    columns: SIZES,
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) =>
      `<span style="font-size: 1rem">before <okkly-icon name="iconStar" fontSize="${column}" /> after</span>`,
  });
});

test("should render a decorative icon with no modifier classes by default", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-icon name="iconStar" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-icon");
  await expect(component).toHaveAttribute("aria-hidden", "true");
  await expect(component).not.toHaveAttribute("role");
  expect(
    await component.locator("svg").evaluate((element) => element instanceof SVGSVGElement),
  ).toBe(true);
});

test("should render the same markup whether the icon arrives by name or by value", async ({
  mountTemplate,
}) => {
  // ARRANGE — MOCK_PLAYWRIGHT_ICON is the `iconStar` markup, so resolving the
  // name must land on exactly what passing the markup directly produces.
  const component = await mountTemplate(
    `<div><okkly-icon class="by-name" name="iconStar" /><okkly-icon class="by-value" [icon]="state().icon" /></div>`,
    { icon: MOCK_PLAYWRIGHT_ICON },
  );
  const markup = (selector: string) =>
    component.locator(selector).evaluate((element) => element.innerHTML.trim());

  // ASSERT — trimmed, because the packaged asset keeps its file's trailing newline.
  const byName = await markup(".by-name");
  expect(byName).toContain("<svg");
  expect(byName).toBe(await markup(".by-value"));
});

test("should prefer icon over name when both are set", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-icon name="iconSearch" [icon]="state().icon" />`, {
    icon: `<svg class="chosen" viewBox="0 0 24 24"></svg>`,
  });

  // ASSERT
  await expect(component.locator("svg.chosen")).toBeAttached();
  await expect(component.locator("svg")).toHaveCount(1);
});

test("should swap the glyph when the name changes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-icon [name]="state().name" />`, {
    name: "iconStar",
  });
  const before = await component.evaluate((element) => element.innerHTML);

  // ACT
  await update({ name: "iconSearch" });

  // ASSERT
  await expect.poll(() => component.evaluate((element) => element.innerHTML)).not.toBe(before);
  await expect(component.locator("svg")).toHaveCount(1);
});

test("should apply size modifiers and clear them back to the default", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-icon name="iconStar" [fontSize]="state().fontSize" />`,
    { fontSize: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--small/);

  // ACT
  await update({ fontSize: "large" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--large/);

  // ACT
  await update({ fontSize: "inherit" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--inherit/);

  // ACT
  await update({ fontSize: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon--/);
});

test("should apply colour modifiers and clear them back to inherit", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-icon name="iconStar" [color]="state().color" />`, {
    color: "danger",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--color-danger/);

  // ACT
  await update({ color: "inherit" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon--color-/);
});

test("should become an image with a name once titleAccess is given", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-icon name="iconStar" titleAccess="Favourite" />`);

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("Favourite");
  await expect(component).not.toHaveAttribute("aria-hidden");
});

test("should keep the element's own class and attributes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-icon name="iconStar" data-testid="glyph" class="custom" />`,
  );

  // ASSERT
  await expect(component).toHaveClass(/custom/);
  await expect(component).toHaveClass(/okkly-icon/);
  await expect(component).toHaveAttribute("data-testid", "glyph");
});

test("should paint the glyph with the surrounding text colour by default", async ({
  mountTemplate,
}) => {
  // ARRANGE — `currentColor` in the asset is what makes `color="inherit"` work.
  const component = await mountTemplate(
    `<span style="color: rgb(255, 0, 0)"><okkly-icon name="iconStar" /></span>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-icon")).toHaveCSS("color", "rgb(255, 0, 0)");
});
