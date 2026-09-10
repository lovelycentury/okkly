import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { IconButton } from "./IconButton";
import { Icon } from "../Icon/Icon";
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

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "IconButton (variants)",
    columns: VARIANTS,
    rows: ["default", "hover", "active", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) => (
      <IconButton variant={column} icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Star" />
    ),
  });

  executeMatrixScreenshotTest({
    name: "IconButton (colors)",
    columns: COLORS,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) => (
      <IconButton
        variant={row}
        color={column}
        icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
        aria-label="Star"
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "IconButton (sizes)",
    columns: SIZES,
    rows: ["default", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <IconButton
        size={column}
        disabled={row === "disabled"}
        icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
        aria-label="Star"
      />
    ),
  });
});

test("should render as a square icon button with no variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />} aria-label="Add" />,
  );

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Add");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-icon-button/);
  await expect(component).not.toHaveClass(/okkly-icon-button--(ghost|glass|solid)/);
  await expect(component.locator(".glyph")).toBeVisible();
});

test("should accept children when icon is omitted", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <IconButton aria-label="Add">
      <Icon icon={MOCK_PLAYWRIGHT_ICON} className="child-glyph" />
    </IconButton>,
  );

  // ASSERT
  await expect(component.locator(".child-glyph")).toBeVisible();
});

test("should apply variant modifiers only for non-ghost variants", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" variant="glass" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--glass/);

  // ACT
  await component.update(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" variant="solid" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--solid/);

  // ACT
  await component.update(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" variant="ghost" />,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--(ghost|glass|solid)/);
});

test("should apply a color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" color="dante" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--color-dante/);

  // ACT
  await component.update(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" color="primary" />,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--color-/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" size="small" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--small/);

  // ACT
  await component.update(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" size="large" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon-button--large/);

  // ACT
  await component.update(
    <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" size="medium" />,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon-button--(small|large)/);
});

test("should fire onClick", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(
    <IconButton
      icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
      aria-label="Add"
      onClick={() => (clicks += 1)}
    />,
  );

  // ACT
  await component.click();

  // ASSERT
  expect(clicks).toBe(1);
});

test.describe("disabled", () => {
  test("should disable the button and skip the ripple overlay", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" disabled />,
    );

    // ASSERT
    await expect(component).toBeDisabled();
    await expect(component.locator(".okkly-ripple")).toHaveCount(0);
  });
});

test.describe("href", () => {
  test("should render an <a> instead of a <button>", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <IconButton
        icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
        aria-label="Add"
        href="#test-section"
      />,
    );

    // ASSERT
    await expect(component).toHaveRole("link");
    await expect(component).toHaveAccessibleName("Add");
    await expect(component).toHaveAttribute("href", "#test-section");
  });

  test("should drop href and mark aria-disabled when disabled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <IconButton
        icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
        aria-label="Add"
        href="#test-section"
        disabled
      />,
    );

    // ASSERT
    await expect(component).not.toHaveAttribute("href");
    await expect(component).toHaveAttribute("aria-disabled", "true");
  });
});
