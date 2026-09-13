import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Button from "./Button.vue";
import type { ButtonColor, ButtonSize, ButtonVariant } from "./Button.vue";

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

const label = { default: "Click me" };

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
    args: (column) => ({ props: { variant: column }, slots: { default: "Button" } }),
  });

  executeMatrixScreenshotTest({
    name: "Button (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: Button,
    args: (column, row) => ({
      props: { variant: row, color: column },
      slots: { default: "Button" },
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
        default: "Button",
        ...(row === "with-icons"
          ? { "start-icon": MOCK_PLAYWRIGHT_ICON, "end-icon": MOCK_PLAYWRIGHT_ICON }
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
      slots: { default: "Button" },
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

test.describe("icon slots", () => {
  test("should not render the icon slots when they are empty", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Button, { slots: label });

    // ASSERT
    await expect(component.locator(".okkly-button__icon")).toHaveCount(0);
  });

  test("should render the icon slots once they are filled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Button, {
      slots: {
        ...label,
        "start-icon": '<span data-testid="start-icon" />',
        "end-icon": '<span data-testid="end-icon" />',
      },
    });

    // ASSERT
    await expect(component.getByTestId("start-icon")).toBeAttached();
    await expect(component.getByTestId("end-icon")).toBeAttached();
    await expect(component.locator(".okkly-button__icon")).toHaveCount(2);
  });
});

test("should fire click", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE — `click` is not an emit: it falls through to the <button>, so it
  // is passed as the `onClick` listener prop rather than through `on`. Not a
  // declared prop either, hence the cast.
  const component = await mount(Button, {
    props: { onClick: () => (clicks += 1) } as never,
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
      slots: { ...label, "start-icon": "<span />", "end-icon": "<span />" },
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

  test("should drop the href while disabled", async ({ mount }) => {
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

  test("should not render the ripple overlay while disabled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Button, { props: { disabled: true }, slots: label });

    // ASSERT
    await expect(component).toBeDisabled();
    await expect(component.locator(".okkly-ripple")).toHaveCount(0);
  });
});
