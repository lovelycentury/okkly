import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { IconButtonColor, IconButtonSize, IconButtonVariant } from "./IconButton";

const VARIANTS = ["ghost", "glass", "solid"] as const satisfies readonly IconButtonVariant[];
const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly IconButtonColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly IconButtonSize[];

const glyph = (className = "") =>
  MOCK_PLAYWRIGHT_ICON.replace("<svg", className ? `<svg class="${className}"` : "<svg");

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "IconButton (variants)",
    columns: VARIANTS,
    rows: ["default", "hover", "active", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) =>
      `<button okklyIconButton variant="${column}" aria-label="Star">${glyph()}</button>`,
  });

  executeMatrixScreenshotTest({
    name: "IconButton (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyIconButton variant="${row}" color="${column}" aria-label="Star">${glyph()}</button>`,
  });

  executeMatrixScreenshotTest({
    name: "IconButton (sizes)",
    columns: SIZES,
    rows: ["default", "disabled"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyIconButton size="${column}"${
        row === "disabled" ? " disabled" : ""
      } aria-label="Star">${glyph()}</button>`,
  });
});

test("should render as a square icon button with no variant modifier", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyIconButton aria-label="Add">${glyph("glyph")}</button>`,
  );

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Add");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-icon-button");
  await expect(component.locator(".okkly-icon-button__icon .glyph")).toBeVisible();
  await expect(component.locator(".okkly-icon-button__icon")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("should apply variant modifiers only for non-ghost variants", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyIconButton aria-label="Add" [variant]="state().variant">${glyph()}</button>`,
    { variant: "glass" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--glass/);

  // ACT
  await update({ variant: "solid" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--solid/);

  // ACT
  await update({ variant: "ghost" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--(ghost|glass|solid)/);
});

test("should apply a color modifier only for non-default colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyIconButton aria-label="Add" [color]="state().color">${glyph()}</button>`,
    { color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyIconButton aria-label="Add" [size]="state().size">${glyph()}</button>`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--small/);

  // ACT
  await update({ size: "large" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--large/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--(small|large)/);
});

test("should fire click", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyIconButton aria-label="Add" (click)="record('click')">${glyph()}</button>`,
  );

  // ACT
  await component.click();

  // ASSERT
  expect(await recordedEvents("click")).toHaveLength(1);
});

test.describe("ripple", () => {
  test("should paint a ripple on press", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<button okklyIconButton aria-label="Add">${glyph()}</button>`,
    );

    // ACT
    await component.hover();
    await page.mouse.down();

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(1);

    // ACT
    await page.mouse.up();

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(0);
  });

  test("should not ripple when disableRipple is set", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<button okklyIconButton aria-label="Add" disableRipple>${glyph()}</button>`,
    );

    // ACT
    await component.hover();
    await page.mouse.down();

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(0);
  });
});

test.describe("disabled", () => {
  test("should disable the button, swallow clicks and skip the ripple", async ({
    mountTemplate,
    page,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<button okklyIconButton aria-label="Add" disabled (click)="record('click')">${glyph()}</button>`,
    );

    // ASSERT
    await expect(component).toBeDisabled();

    // ACT
    await component.hover({ force: true });
    await page.mouse.down();
    await component.click({ force: true });

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(0);
    expect(await recordedEvents("click")).toHaveLength(0);
  });
});

test.describe("as a link", () => {
  test("should render as a link with its own href", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<a okklyIconButton aria-label="Add" href="#test-section">${glyph()}</a>`,
    );

    // ASSERT
    await expect(component).toHaveRole("link");
    await expect(component).toHaveAccessibleName("Add");
    await expect(component).toHaveAttribute("href", "#test-section");
  });

  test("should mark a disabled link aria-disabled and swallow clicks", async ({
    mountTemplate,
    page,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<a okklyIconButton aria-label="Add" href="#test-section" disabled (click)="record('click')">${glyph()}</a>`,
    );

    // ASSERT
    await expect(component).toHaveAttribute("aria-disabled", "true");
    await expect(component).toHaveAttribute("tabindex", "-1");

    // ACT — Playwright treats aria-disabled as not clickable, so force it the way a mouse would.
    await component.click({ force: true });

    // ASSERT
    expect(new URL(page.url()).hash).toBe("");
    expect(await recordedEvents("click")).toHaveLength(0);
  });
});
