import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { Button } from "./Button";
import { Icon } from "../Icon/Icon";
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

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Button (variants)",
    columns: VARIANTS,
    rows: INTERACTION_ROWS,
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) => <Button variant={column}>Button</Button>,
  });

  executeMatrixScreenshotTest({
    name: "Button (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) => (
      <Button variant={row} color={column}>
        Button
      </Button>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Button (sizes)",
    columns: SIZES,
    rows: ["pill", "rounded", "with-icons", "full-width"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Button
        size={column}
        shape={row === "rounded" ? "rounded" : "pill"}
        fullWidth={row === "full-width"}
        startIcon={row === "with-icons" ? <Icon icon={MOCK_PLAYWRIGHT_ICON} /> : undefined}
        endIcon={row === "with-icons" ? <Icon icon={MOCK_PLAYWRIGHT_ICON} /> : undefined}
      >
        Button
      </Button>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Button (states)",
    columns: ["default", "disabled", "loading"],
    rows: ["center", "start", "end"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Button disabled={column === "disabled"} loading={column === "loading"} loadingPosition={row}>
        Button
      </Button>
    ),
  });
});

test("should render its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Button>Click me</Button>);

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Click me");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Button>Click me</Button>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-button--primary/);
  await expect(component).not.toHaveClass(/okkly-button--color-/);
  await expect(component).not.toHaveClass(/okkly-button--(small|large)/);
  await expect(component).not.toHaveClass(/okkly-button--rounded/);
});

test("should apply the variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Button variant="ghost">Click me</Button>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--ghost/);
});

test("should apply a color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Button color="dante">Click me</Button>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--color-dante/);

  // ACT
  await component.update(<Button color="primary">Click me</Button>);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Button size="small">Click me</Button>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--small/);

  // ACT
  await component.update(<Button size="medium">Click me</Button>);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-button--(small|large)/);
});

test("should apply the rounded and full-width modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Button shape="rounded" fullWidth>
      Click me
    </Button>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-button--rounded/);
  await expect(component).toHaveClass(/okkly-button--full-width/);
});

test("should render start and end icons", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Button
      startIcon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="start-icon" />}
      endIcon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="end-icon" />}
    >
      Click me
    </Button>,
  );

  // ASSERT
  await expect(component.locator(".start-icon")).toBeVisible();
  await expect(component.locator(".end-icon")).toBeVisible();
});

test("should fire onClick", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(<Button onClick={() => (clicks += 1)}>Click me</Button>);

  // ACT
  await component.click();

  // ASSERT
  expect(clicks).toBe(1);
});

test.describe("disabled", () => {
  test("should disable the button and skip the ripple overlay", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Button disabled>Click me</Button>);

    // ASSERT
    await expect(component).toBeDisabled();
    await expect(component.locator(".okkly-ripple")).toHaveCount(0);
  });
});

test.describe("loading", () => {
  test("should disable the button and show the spinner", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Button loading>Click me</Button>);

    // ASSERT
    await expect(component).toBeDisabled();
    await expect(component.locator(".okkly-button__spinner").first()).toBeAttached();
  });

  test("should visually hide the label at the default loading position", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Button loading>Click me</Button>);

    // ASSERT
    await expect(component.locator(".okkly-button__label")).toHaveClass(
      /okkly-button__label--hidden/,
    );
  });

  test("should keep the label visible for start/end loading positions", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Button loading loadingPosition="start">
        Click me
      </Button>,
    );

    // ASSERT
    await expect(component.locator(".okkly-button__label")).not.toHaveClass(
      /okkly-button__label--hidden/,
    );
  });
});

test.describe("disableRipple", () => {
  test("should render the ripple overlay by default", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Button>Click me</Button>);

    // ASSERT
    await expect(component.locator(".okkly-ripple")).toBeAttached();
  });

  test("should skip the ripple overlay when disabled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Button disableRipple>Click me</Button>);

    // ASSERT
    await expect(component.locator(".okkly-ripple")).toHaveCount(0);
  });

  test("should spawn one ripple element per click", async ({ mount, page }) => {
    // Stretch the animation so the elements are still there to count.
    await page.addStyleTag({
      content: ".okkly-ripple__element { animation-duration: 999999s; }",
    });

    // ARRANGE
    const component = await mount(<Button>Click me</Button>);

    // ACT
    await component.click({ position: { x: 8, y: 12 } });
    await component.click({ position: { x: 16, y: 16 } });

    // ASSERT
    await expect(component.locator(".okkly-ripple__element")).toHaveCount(2);
  });
});

test.describe("href", () => {
  test("should render an <a> instead of a <button>", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Button href="#test-section">Click me</Button>);

    // ASSERT
    await expect(component).toHaveRole("link");
    await expect(component).toHaveAccessibleName("Click me");
    await expect(component).toHaveAttribute("href", "#test-section");
  });

  test("should navigate when clicked", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(<Button href="#test-section">Click me</Button>);

    // ACT
    await component.click();

    // ASSERT
    await expect(page).toHaveURL(/#test-section$/);
  });

  test("should drop href and mark aria-disabled when disabled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Button href="#test-section" disabled>
        Click me
      </Button>,
    );

    // ASSERT
    await expect(component).not.toHaveAttribute("href");
    await expect(component).toHaveAttribute("aria-disabled", "true");
  });
});
