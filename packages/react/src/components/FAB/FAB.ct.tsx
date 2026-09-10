import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { Fab } from "./FAB";
import { Icon } from "../Icon/Icon";
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

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Fab (variants)",
    columns: VARIANTS,
    rows: ["default", "hover", "active", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) => (
      <Fab variant={column} icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Fab (colors)",
    columns: COLORS,
    rows: [...VARIANTS, "extended"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Fab
        color={column}
        variant={row === "soft" ? "soft" : "standard"}
        icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
        label={row === "extended" ? "New track" : undefined}
        aria-label={row === "extended" ? undefined : "Add"}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Fab (sizes)",
    columns: SIZES,
    rows: ["icon-only", "extended", "disabled"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Fab
        size={column}
        disabled={row === "disabled"}
        icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />}
        label={row === "extended" ? "New track" : undefined}
        aria-label={row === "extended" ? undefined : "Add"}
      />
    ),
  });
});

test("should render as a circular icon button by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />} aria-label="Add" />,
  );

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Add");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-fab/);
  await expect(component).not.toHaveClass(/okkly-fab--extended/);
  await expect(component.locator(".glyph")).toBeVisible();
});

test("should apply the color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" color="dante" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--color-dante/);

  // ACT
  await component.update(
    <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" color="primary" />,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-fab--color-/);
});

test("should apply the soft variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Edit" variant="soft" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--soft/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" size="small" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--small/);

  // ACT
  await component.update(
    <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" size="medium" />,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-fab--(small|large)/);
});

test("should become an extended pill once a label is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} label="New track" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--extended/);
  await expect(component).toHaveAccessibleName("New track");
});

test("should fire onClick", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE
  const component = await mount(
    <Fab
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
      <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" disabled />,
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
      <Fab icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Add" href="#test-section" />,
    );

    // ASSERT
    await expect(component).toHaveRole("link");
    await expect(component).toHaveAccessibleName("Add");
    await expect(component).toHaveAttribute("href", "#test-section");
  });

  test("should drop href and mark aria-disabled when disabled", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Fab
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
