import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Fab from "./Fab.vue";
import type { FabColor, FabSize, FabVariant } from "./Fab.types";

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

const icon = { default: MOCK_PLAYWRIGHT_ICON };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Fab (variants)",
    columns: VARIANTS,
    rows: ["default", "hover", "active", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: Fab,
    args: (column) => ({
      props: { variant: column, "aria-label": "Add" } as never,
      slots: icon,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Fab (colors)",
    columns: COLORS,
    rows: [...VARIANTS, "extended"],
    fastNoIsolation: true,
    component: Fab,
    args: (column, row) => ({
      props: {
        color: column,
        variant: row === "soft" ? "soft" : "standard",
        "aria-label": row === "extended" ? undefined : "Add",
      } as never,
      slots: row === "extended" ? { ...icon, label: "New track" } : icon,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Fab (sizes)",
    columns: SIZES,
    rows: ["icon-only", "extended", "disabled"],
    fastNoIsolation: true,
    component: Fab,
    args: (column, row) => ({
      props: {
        size: column,
        disabled: row === "disabled",
        "aria-label": row === "extended" ? undefined : "Add",
      } as never,
      slots: row === "extended" ? { ...icon, label: "New track" } : icon,
    }),
  });
});

test("should render as a circular icon button by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fab, {
    props: { "aria-label": "Add" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveRole("button");
  await expect(component).toHaveAccessibleName("Add");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-fab/);
  await expect(component).not.toHaveClass(/okkly-fab--extended/);
  await expect(component.locator(".okkly-fab__icon")).toBeVisible();
});

test("should apply the color modifier only for non-default colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fab, {
    props: { "aria-label": "Add", color: "dante" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-fab--color-/);
});

test("should apply the soft variant modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fab, {
    props: { "aria-label": "Edit", variant: "soft" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--soft/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fab, {
    props: { "aria-label": "Add", size: "small" } as never,
    slots: icon,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-fab--(small|large)/);
});

test("should become an extended pill once the label slot is filled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Fab, { slots: { ...icon, label: "New track" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-fab--extended/);
  await expect(component).toHaveAccessibleName("New track");
});

test("should fire click", async ({ mount }) => {
  let clicks = 0;

  // ARRANGE — `click` is not an emit: it falls through to the rendered
  // element, so it is passed as the `onClick` listener prop rather than
  // through `on`. Not a declared prop either, hence the cast.
  const component = await mount(Fab, {
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
    const component = await mount(Fab, {
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
    const component = await mount(Fab, {
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
    const component = await mount(Fab, {
      props: { "aria-label": "Add", href: "#test-section", disabled: true } as never,
      slots: icon,
    });

    // ASSERT
    await expect(component).not.toHaveAttribute("href");
    await expect(component).toHaveAttribute("aria-disabled", "true");
  });
});
