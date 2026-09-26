import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { ButtonColor, ButtonSize, ButtonVariant } from "./Button";

const VARIANTS = [
  "primary",
  "gradient",
  "secondary",
  "soft",
  "ghost",
  "glass",
] as const satisfies readonly ButtonVariant[];
const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly ButtonColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ButtonSize[];

const INTERACTION_ROWS = ["default", "hover", "active", "focus-visible"] as const;

const icon = (slot: "okklyButtonStartIcon" | "okklyButtonEndIcon") =>
  MOCK_PLAYWRIGHT_ICON.replace("<svg", `<svg ${slot}`);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Button (variants)",
    columns: VARIANTS,
    rows: INTERACTION_ROWS,
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) => `<button okklyButton variant="${column}">Button</button>`,
  });

  executeMatrixScreenshotTest({
    name: "Button (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyButton variant="${row}" color="${column}">Button</button>`,
  });

  executeMatrixScreenshotTest({
    name: "Button (sizes)",
    columns: SIZES,
    rows: ["pill", "rounded", "with-icons", "full-width"],
    fastNoIsolation: true,
    component: (column, row) => {
      const shape = row === "rounded" ? "rounded" : "pill";
      const fullWidth = row === "full-width" ? " fullWidth" : "";
      const withIcons = row === "with-icons";
      return `<button okklyButton size="${column}" shape="${shape}"${fullWidth}>${
        withIcons ? icon("okklyButtonStartIcon") : ""
      }Button${withIcons ? icon("okklyButtonEndIcon") : ""}</button>`;
    },
  });

  executeMatrixScreenshotTest({
    name: "Button (states)",
    columns: ["default", "disabled", "loading"],
    rows: ["center", "start", "end"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<button okklyButton${column === "disabled" ? " disabled" : ""}${
        column === "loading" ? " loading" : ""
      } loadingPosition="${row}">Button</button>`,
  });
});

test("should render its label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<button okklyButton>Click me</button>`);

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Click me");
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<button okklyButton>Click me</button>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-button--primary/);
  await expect(component).not.toHaveClass(/okkly-button--color-/);
  await expect(component).not.toHaveClass(/okkly-button--(small|large)/);
  await expect(component).not.toHaveClass(/okkly-button--rounded/);
});

test("should apply the variant modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<button okklyButton variant="ghost">Click me</button>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--ghost/);
});

test("should apply a color modifier only for non-default colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyButton [color]="state().color">Click me</button>`,
    { color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyButton [size]="state().size">Click me</button>`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button--(small|large)/);
});

test("should apply the rounded and full-width modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyButton shape="rounded" fullWidth>Click me</button>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--rounded/);
  await expect(component).toHaveClass(/okkly-button--full-width/);
});

test("should collapse the icon slots until something is projected into them", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyButton>
      @if (state().withIcons) {
        <span okklyButtonStartIcon data-testid="start-icon"></span>
        <span okklyButtonEndIcon data-testid="end-icon"></span>
      }
      Click me
    </button>`,
    { withIcons: false },
  );
  const slots = component.locator(".okkly-button__icon");

  // ASSERT
  await expect(slots).toHaveCount(2);
  await expect(slots.first()).toHaveCSS("display", "none");
  await expect(slots.last()).toHaveCSS("display", "none");

  // ACT
  await update({ withIcons: true });

  // ASSERT
  await expect(component.getByTestId("start-icon")).toBeAttached();
  await expect(component.getByTestId("end-icon")).toBeAttached();
  await expect(slots.first()).not.toHaveCSS("display", "none");
  await expect(slots.last()).not.toHaveCSS("display", "none");
});

test("should fire click", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<button okklyButton (click)="record('click')">Click me</button>`,
  );

  // ACT
  await component.click();

  // ASSERT
  expect(await recordedEvents("click")).toHaveLength(1);
});

test.describe("disabled", () => {
  test("should disable the native button and swallow clicks", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<button okklyButton disabled (click)="record('click')">Click me</button>`,
    );

    // ASSERT
    await expect(component).toBeDisabled();

    // ACT
    await component.click({ force: true });

    // ASSERT
    expect(await recordedEvents("click")).toHaveLength(0);
  });

  test("should mark a disabled link aria-disabled and swallow clicks", async ({
    mountTemplate,
    page,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<a okklyButton href="#test-section" disabled (click)="record('click')">Click me</a>`,
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

  test("should swallow clicks on a loading link too", async ({ mountTemplate, recordedEvents }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<a okklyButton href="#test-section" loading (click)="record('click')">Click me</a>`,
    );

    // ACT
    await component.click({ force: true });

    // ASSERT
    expect(await recordedEvents("click")).toHaveLength(0);
  });
});

test.describe("loading", () => {
  test("should disable the button, show the spinner and hide the label in the center", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(`<button okklyButton loading>Click me</button>`);

    // ASSERT
    await expect(component).toBeDisabled();
    await expect(component.locator(".okkly-button__spinner").first()).toBeAttached();
    await expect(component.locator(".okkly-button__label--hidden")).toHaveCount(1);
  });

  test("should replace the start icon with the spinner when loading from the start", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<button okklyButton loading loadingPosition="start">
        <span okklyButtonStartIcon></span>
        <span okklyButtonEndIcon></span>
        Click me
      </button>`,
    );
    const slots = component.locator(".okkly-button__icon");

    // ASSERT
    await expect(slots.first()).toHaveCSS("display", "none");
    await expect(slots.last()).not.toHaveCSS("display", "none");
    await expect(component.locator(".okkly-button__label--hidden")).toHaveCount(0);
  });
});

test.describe("ripple", () => {
  test("should paint a ripple on press and clear it on release", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE
    const component = await mountTemplate(`<button okklyButton>Click me</button>`);

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

  test("should not ripple while disabled", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(`<button okklyButton disabled>Click me</button>`);

    // ACT
    await component.hover({ force: true });
    await page.mouse.down();

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(0);
  });
});
