import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import IconButton from "./IconButton.vue";
import type { IconButtonColor, IconButtonSize, IconButtonVariant } from "./IconButton.types";

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

const icon = { default: MOCK_PLAYWRIGHT_ICON };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "IconButton (variants)",
    columns: VARIANTS,
    rows: ["default", "hover", "active", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: IconButton,
    args: (column) => ({
      props: { variant: column, "aria-label": "Star" } as never,
      slots: icon,
    }),
  });

  executeMatrixScreenshotTest({
    name: "IconButton (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: IconButton,
    args: (column, row) => ({
      props: { variant: row, color: column, "aria-label": "Star" } as never,
      slots: icon,
    }),
  });

  executeMatrixScreenshotTest({
    name: "IconButton (sizes)",
    columns: SIZES,
    rows: ["default", "disabled"],
    fastNoIsolation: true,
    component: IconButton,
    args: (column, row) => ({
      props: { size: column, disabled: row === "disabled", "aria-label": "Star" } as never,
      slots: icon,
    }),
  });
});

test("should render as a square icon button with no variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(IconButton, {
    props: { "aria-label": "Add" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Add");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-icon-button/);
  await expect(component).not.toHaveClass(/okkly-icon-button--(ghost|glass|solid)/);
  await expect(component.locator(".okkly-icon-button__icon")).toBeVisible();
});

test("should apply variant modifiers only for non-ghost variants", async ({ mount }) => {
  // ARRANGE
  const component = await mount(IconButton, {
    props: { "aria-label": "Add", variant: "glass" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--glass/);

  // ACT
  await component.update({ props: { variant: "solid" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--solid/);

  // ACT
  await component.update({ props: { variant: "ghost" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--(ghost|glass|solid)/);
});

test("should apply a color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(IconButton, {
    props: { "aria-label": "Add", color: "dante" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(IconButton, {
    props: { "aria-label": "Add", size: "small" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--small/);

  // ACT
  await component.update({ props: { size: "large" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--large/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--(small|large)/);
});

test("should fire click", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE — `click` is not an emit: it falls through to the rendered
  // element, so it is passed as the `onClick` listener prop rather than
  // through `on`. Not a declared prop either, hence the cast.
  const component = await mount(IconButton, {
    props: { "aria-label": "Add", onClick: () => (clicks += 1) } as never,
    slots: icon,
  });

  // ACT
  await component.click();

  // ASSERT
  expect(clicks).toBe(1);
});

test.describe("disabled", () => {
  test("should disable the button and skip the ripple overlay", async ({ mount }) => {
    // ARRANGE
    const component = await mount(IconButton, {
      props: { "aria-label": "Add", disabled: true } as never,
      slots: icon,
    });

    // ASSERT
    await expect(component).toBeDisabled();
    await expect(component.locator(".okkly-ripple")).toHaveCount(0);
  });
});

test.describe("href", () => {
  test("should render an <a> instead of a <button>", async ({ mount }) => {
    // ARRANGE
    const component = await mount(IconButton, {
      props: { "aria-label": "Add", href: "#test-section" } as never,
      slots: icon,
    });

    // ASSERT
    await expect(component).toHaveRole("link");
    await expect(component).toHaveAccessibleName("Add");
    await expect(component).toHaveAttribute("href", "#test-section");
  });

  test("should drop href and mark aria-disabled when disabled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(IconButton, {
      props: { "aria-label": "Add", href: "#test-section", disabled: true } as never,
      slots: icon,
    });

    // ASSERT
    await expect(component).not.toHaveAttribute("href");
    await expect(component).toHaveAttribute("aria-disabled", "true");
  });
});

test.describe("ripple", () => {
  test("should paint a ripple on press and clear it on release", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(IconButton, {
      props: { "aria-label": "Add" } as never,
      slots: icon,
    });

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
});
