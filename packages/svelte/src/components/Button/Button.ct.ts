import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Button from "./Button.svelte";
import type { ButtonColor, ButtonSize, ButtonVariant } from "./Button.svelte";

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

const label = { children: "Click me" };
const icons = {
  startIcon: '<span data-testid="start-icon"></span>',
  endIcon: '<span data-testid="end-icon"></span>',
};

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Button (variants)",
    columns: VARIANTS,
    rows: INTERACTION_ROWS,
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: Button,
    args: (column) => ({ props: { variant: column }, slots: { children: "Button" } }),
  });

  executeMatrixScreenshotTest({
    name: "Button (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: Button,
    args: (column, row) => ({
      props: { variant: row, color: column },
      slots: { children: "Button" },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Button (sizes)",
    columns: SIZES,
    rows: ["pill", "rounded", "with-icons", "full-width"],
    fastNoIsolation: true,
    component: Button,
    args: (column, row) => ({
      props: {
        size: column,
        shape: row === "rounded" ? "rounded" : "pill",
        fullWidth: row === "full-width",
      },
      slots: {
        children: "Button",
        ...(row === "with-icons"
          ? { startIcon: MOCK_PLAYWRIGHT_ICON, endIcon: MOCK_PLAYWRIGHT_ICON }
          : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Button (states)",
    columns: ["default", "disabled", "loading"],
    rows: ["center", "start", "end"],
    fastNoIsolation: true,
    component: Button,
    args: (column, row) => ({
      props: {
        disabled: column === "disabled",
        loading: column === "loading",
        loadingPosition: row,
      },
      slots: { children: "Button" },
    }),
  });
});

test("should render its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Button, { slots: label });

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Click me");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Button, { slots: label });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-button--primary/);
  await expect(component).not.toHaveClass(/okkly-button--color-/);
  await expect(component).not.toHaveClass(/okkly-button--(small|large)/);
  await expect(component).not.toHaveClass(/okkly-button--rounded/);
});

test("should apply the variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Button, { props: { variant: "ghost" }, slots: label });

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--ghost/);
});

test("should apply a color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Button, { props: { color: "dante" }, slots: label });

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Button, { props: { size: "small" }, slots: label });

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button--(small|large)/);
});

test("should apply the rounded and full-width modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Button, {
    props: { shape: "rounded", fullWidth: true },
    slots: label,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--rounded/);
  await expect(component).toHaveClass(/okkly-button--full-width/);
});

test("should keep a consumer's own class alongside the modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Button, { props: { class: "my-button" }, slots: label });

  // ASSERT
  await expect(component).toHaveClass(/okkly-button/);
  await expect(component).toHaveClass(/my-button/);
});

test.describe("icon snippets", () => {
  test("should not render the icon slots without snippets", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Button, { slots: label });

    // ASSERT
    await expect(component.locator(".okkly-button__icon")).toHaveCount(0);
  });

  test("should render the icon slots when snippets are passed", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Button, { slots: { ...label, ...icons } });

    // ASSERT
    await expect(component.getByTestId("start-icon")).toBeAttached();
    await expect(component.getByTestId("end-icon")).toBeAttached();
    await expect(component.locator(".okkly-button__icon")).toHaveCount(2);
  });
});

test("should fire onclick", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(Button, {
    props: { onclick: () => (clicks += 1) },
    slots: label,
  });

  // ACT
  await component.click();

  // ASSERT
  expect(clicks).toBe(1);
});

test.describe("loading", () => {
  test("should disable the button, show the spinner and hide the label in the center", async ({
    mount,
  }) => {
    // ARRANGE
    const component = await mount(Button, { props: { loading: true }, slots: label });

    // ASSERT
    await expect(component).toBeDisabled();
    await expect(component.locator(".okkly-button__spinner").first()).toBeAttached();
    await expect(component.locator(".okkly-button__label--hidden")).toHaveCount(1);
  });

  test("should replace the start icon with the spinner when loading from the start", async ({
    mount,
  }) => {
    // ARRANGE
    const component = await mount(Button, {
      props: { loading: true, loadingPosition: "start" },
      slots: { ...label, ...icons },
    });

    // ASSERT
    await expect(component.locator(".okkly-button__icon")).toHaveCount(1);
    await expect(component.locator(".okkly-button__label--hidden")).toHaveCount(0);
  });
});

test.describe("href", () => {
  test("should render an anchor", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Button, {
      props: { href: "https://okkly.dev" },
      slots: label,
    });

    // ASSERT
    await expect(component).toHaveRole("link");
    await expect(component).toHaveAttribute("href", "https://okkly.dev");
  });

  test("should drop the href and leave the tab order while disabled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Button, {
      props: { href: "https://okkly.dev" },
      slots: label,
    });

    // ACT
    await component.update({ props: { disabled: true } });

    // ASSERT
    await expect(component).not.toHaveAttribute("href");
    await expect(component).toHaveAttribute("aria-disabled", "true");
    await expect(component).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("ripple", () => {
  test("should paint a ripple on press and clear it on release", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(Button, { slots: label });

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

  test("should not ripple while disabled", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(Button, { props: { disabled: true }, slots: label });

    // ACT
    await component.hover({ force: true });
    await page.mouse.down();

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(0);
  });

  test("should not ripple when the ripple is turned off", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(Button, { props: { disableRipple: true }, slots: label });

    // ACT
    await component.hover();
    await page.mouse.down();

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(0);
  });
});
