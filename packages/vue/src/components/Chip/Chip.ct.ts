import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import Chip from "./Chip.vue";
import type { ChipSize, ChipVariant } from "./Chip.types";

const VARIANTS = [
  "glass",
  "solid",
  "outline",
  "accent",
  "dante",
] as const satisfies readonly ChipVariant[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ChipSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Chip (variants)",
    columns: VARIANTS,
    rows: ["default", "selected", "disabled", "hover"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: Chip,
    args: (column, row) => ({
      props: {
        variant: column,
        selected: row === "selected",
        disabled: row === "disabled",
        onClick: () => {},
      } as never,
      slots: { default: "Fintech" },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Chip (sizes)",
    columns: SIZES,
    rows: ["plain", "dot", "icon", "removable"],
    fastNoIsolation: true,
    component: Chip,
    args: (column, row) => ({
      props: { size: column, dot: row === "dot", removable: row === "removable" },
      slots: {
        default: "Fintech",
        ...(row === "icon" ? { icon: MOCK_PLAYWRIGHT_ICON } : {}),
      },
    }),
  });
});

test("should render its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Chip, { slots: { default: "Fintech" } });

  // ASSERT
  await expect(component.locator(".okkly-chip__label")).toHaveText("Fintech");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Chip, { slots: { default: "Fintech" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-chip\b/);
  await expect(component).not.toHaveClass(/okkly-chip--(solid|outline|accent|dante)/);
  await expect(component).not.toHaveClass(/okkly-chip--(small|large)/);
});

test("should apply the variant modifier only for non-default variants", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Chip, {
    props: { variant: "dante" },
    slots: { default: "Fintech" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--dante/);

  // ACT
  await component.update({ props: { variant: "glass" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip--(solid|outline|accent|dante)/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Chip, { props: { size: "small" }, slots: { default: "Fintech" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip--(small|large)/);
});

test("should apply the selected modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Chip, {
    props: { selected: true },
    slots: { default: "Fintech" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--selected/);
});

test("should render a leading dot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Chip, { props: { dot: true }, slots: { default: "Available" } });

  // ASSERT
  await expect(component.locator(".okkly-chip__dot")).toBeAttached();
});

test("should render a leading icon and suppress the dot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Chip, {
    props: { dot: true },
    slots: { default: "Starred", icon: MOCK_PLAYWRIGHT_ICON },
  });

  // ASSERT
  await expect(component.locator(".okkly-chip__icon")).toBeVisible();
  await expect(component.locator(".okkly-chip__dot")).toHaveCount(0);
});

test.describe("interactive", () => {
  test("should not be a button without a click listener", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Chip, { slots: { default: "Fintech" } });

    // ASSERT
    await expect(component).not.toHaveAttribute("role", "button");
    await expect(component).not.toHaveClass(/okkly-chip--interactive/);
  });

  test("should get button semantics and fire click when clickable", async ({ mount }) => {
    let clicks = 0;

    // ARRANGE — `click` is not an emit: it falls through to the root, but is
    // read by hand rather than left to fall through, hence the cast.
    const component = await mount(Chip, {
      props: { onClick: () => (clicks += 1) } as never,
      slots: { default: "Fintech" },
    });

    // ASSERT
    await expect(component).toHaveRole("button");
    await expect(component).toHaveClass(/okkly-chip--interactive/);

    // ACT
    await component.click();

    // ASSERT
    expect(clicks).toBe(1);
  });

  test("should fire click on Enter and Space", async ({ mount, page }) => {
    let clicks = 0;

    // ARRANGE
    const component = await mount(Chip, {
      props: { onClick: () => (clicks += 1) } as never,
      slots: { default: "Fintech" },
    });

    // ACT
    await component.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press(" ");

    // ASSERT
    expect(clicks).toBe(2);
  });
});

test.describe("removable", () => {
  test("should render a trailing remove button and fire remove", async ({ mount }) => {
    let removes = 0;

    // ARRANGE
    const component = await mount(Chip, {
      props: { removable: true },
      slots: { default: "Mobile" },
      on: { remove: () => (removes += 1) },
    });

    // ACT
    await component.getByRole("button", { name: "Remove" }).click();

    // ASSERT
    expect(removes).toBe(1);
  });

  test("should not fire the chip's click when removing", async ({ mount }) => {
    const events: string[] = [];

    // ARRANGE
    const component = await mount(Chip, {
      props: { removable: true, onClick: () => events.push("click") } as never,
      slots: { default: "Mobile" },
      on: { remove: () => events.push("remove") },
    });

    // ACT
    await component.getByRole("button", { name: "Remove" }).click();

    // ASSERT
    expect(events).toEqual(["remove"]);
  });

  test("should use a custom removeLabel", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Chip, {
      props: { removable: true, removeLabel: "Remove Mobile" },
      slots: { default: "Mobile" },
    });

    // ASSERT
    await expect(component.getByRole("button", { name: "Remove Mobile" })).toBeVisible();
  });
});

test.describe("disabled", () => {
  test("should mark the chip aria-disabled and drop button semantics", async ({ mount }) => {
    let clicks = 0;

    // ARRANGE
    const component = await mount(Chip, {
      props: { disabled: true, onClick: () => (clicks += 1) } as never,
      slots: { default: "Fintech" },
    });

    // ASSERT
    await expect(component).toHaveAttribute("aria-disabled", "true");
    await expect(component).not.toHaveClass(/okkly-chip--interactive/);
    await expect(component).toHaveCSS("pointer-events", "none");

    // ACT — a real click cannot land on a `pointer-events: none` element, so
    // dispatch one directly to prove the handler is guarded in JS too.
    await component.dispatchEvent("click");

    // ASSERT
    expect(clicks).toBe(0);
  });

  test("should disable the remove button", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Chip, {
      props: { removable: true, disabled: true },
      slots: { default: "Mobile" },
    });

    // ASSERT
    await expect(component.getByRole("button", { name: "Remove" })).toBeDisabled();
  });
});
