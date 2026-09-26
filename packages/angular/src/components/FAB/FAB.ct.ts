import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { FabColor, FabSize, FabVariant } from "./FAB";

const VARIANTS = ["standard", "soft"] as const satisfies readonly FabVariant[];
const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly FabColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly FabSize[];

const glyph = (className = "") =>
  MOCK_PLAYWRIGHT_ICON.replace("<svg", className ? `<svg class="${className}"` : "<svg");

/** An extended FAB's text, or the icon-only one's accessible name. */
const naming = (extended: boolean) => (extended ? `label="New track"` : `aria-label="Add"`);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Fab (variants)",
    columns: VARIANTS,
    rows: ["default", "hover", "active", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) =>
      `<button okklyFab variant="${column}" aria-label="Add">${glyph()}</button>`,
  });

  executeMatrixScreenshotTest({
    name: "Fab (colors)",
    columns: COLORS,
    rows: [...VARIANTS, "extended"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyFab color="${column}" variant="${row === "soft" ? "soft" : "standard"}" ${naming(
        row === "extended",
      )}>${glyph()}</button>`,
  });

  executeMatrixScreenshotTest({
    name: "Fab (sizes)",
    columns: SIZES,
    rows: ["icon-only", "extended", "disabled"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyFab size="${column}"${row === "disabled" ? " disabled" : ""} ${naming(
        row === "extended",
      )}>${glyph()}</button>`,
  });
});

test("should render as a circular icon button by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyFab aria-label="Add">${glyph("glyph")}</button>`,
  );

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Add");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-fab");
  await expect(component.locator(".okkly-fab__icon .glyph")).toBeVisible();
  await expect(component.locator(".okkly-fab__icon")).toHaveAttribute("aria-hidden", "true");
  await expect(component.locator(".okkly-fab__label")).toHaveCount(0);
});

test("should apply the color modifier only for non-default colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyFab aria-label="Add" [color]="state().color">${glyph()}</button>`,
    { color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-fab--color-/);
});

test("should apply the soft variant modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyFab aria-label="Edit" variant="soft">${glyph()}</button>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--soft/);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyFab aria-label="Add" [size]="state().size">${glyph()}</button>`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-fab--(small|large)/);
});

test("should become an extended pill once a label is set", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<button okklyFab label="New track">${glyph()}</button>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--extended/);
  await expect(component).toHaveAccessibleName("New track");
  await expect(component.locator(".okkly-fab__label")).toHaveText("New track");
});

test("should fire click", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyFab aria-label="Add" (click)="record('click')">${glyph()}</button>`,
  );

  // ACT
  await component.click();

  // ASSERT
  expect(await recordedEvents("click")).toHaveLength(1);
});

test.describe("ripple", () => {
  test("should paint a ripple on press", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(`<button okklyFab aria-label="Add">${glyph()}</button>`);

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
      `<button okklyFab aria-label="Add" disableRipple>${glyph()}</button>`,
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
      `<button okklyFab aria-label="Add" disabled (click)="record('click')">${glyph()}</button>`,
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
      `<a okklyFab aria-label="Add" href="#test-section">${glyph()}</a>`,
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
      `<a okklyFab aria-label="Add" href="#test-section" disabled (click)="record('click')">${glyph()}</a>`,
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
