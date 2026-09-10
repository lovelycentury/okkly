import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { Chip } from "./Chip";
import { Icon } from "../Icon/Icon";
import type { ChipSize, ChipVariant } from "./Chip";

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
    component: (column, row) => (
      <Chip
        label="Fintech"
        variant={column}
        selected={row === "selected"}
        disabled={row === "disabled"}
        onClick={() => {}}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Chip (sizes)",
    columns: SIZES,
    rows: ["plain", "dot", "icon", "removable"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Chip
        label="Fintech"
        size={column}
        dot={row === "dot"}
        icon={row === "icon" ? <Icon icon={MOCK_PLAYWRIGHT_ICON} /> : undefined}
        removable={row === "removable"}
        onRemove={row === "removable" ? () => {} : undefined}
      />
    ),
  });
});

test("should render its label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Chip label="Fintech" />);

  // ASSERT
  await expect(component.locator(".okkly-chip__label")).toHaveText("Fintech");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Chip label="Fintech" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-chip/);
  await expect(component).not.toHaveClass(/okkly-chip--(solid|outline|accent|dante)/);
  await expect(component).not.toHaveClass(/okkly-chip--(small|large)/);
});

test("should apply the variant modifier only for non-default variants", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Chip label="Fintech" variant="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--dante/);

  // ACT
  await component.update(<Chip label="Fintech" variant="glass" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip--(solid|outline|accent|dante)/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Chip label="Fintech" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--small/);

  // ACT
  await component.update(<Chip label="Fintech" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip--(small|large)/);
});

test("should apply the selected modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Chip label="Fintech" selected />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--selected/);
});

test("should render a leading dot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Chip label="Available" dot />);

  // ASSERT
  await expect(component.locator(".okkly-chip__dot")).toBeAttached();
});

test("should render a leading icon and suppress the dot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Chip label="Starred" dot icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />} />,
  );

  // ASSERT
  await expect(component.locator(".glyph")).toBeVisible();
  await expect(component.locator(".okkly-chip__dot")).toHaveCount(0);
});

test.describe("interactive", () => {
  test("should not be a button without onClick", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Chip label="Fintech" />);

    // ASSERT
    await expect(component).not.toHaveAttribute("role", "button");
    await expect(component).not.toHaveClass(/okkly-chip--interactive/);
  });

  test("should get button semantics and fire onClick when clickable", async ({ mount }) => {
    let clicks = 0;

    // ARRANGE
    const component = await mount(<Chip label="Fintech" onClick={() => (clicks += 1)} />);

    // ASSERT
    await expect(component).toHaveRole("button");
    await expect(component).toHaveClass(/okkly-chip--interactive/);

    // ACT
    await component.click();

    // ASSERT
    expect(clicks).toBe(1);
  });

  test("should fire onClick on Enter and Space", async ({ mount, page }) => {
    let clicks = 0;

    // ARRANGE
    const component = await mount(<Chip label="Fintech" onClick={() => (clicks += 1)} />);

    // ACT
    await component.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press(" ");

    // ASSERT
    expect(clicks).toBe(2);
  });
});

test.describe("removable", () => {
  test("should render a trailing remove button and fire onRemove", async ({ mount }) => {
    let removes = 0;

    // ARRANGE
    const component = await mount(
      <Chip label="Mobile" removable onRemove={() => (removes += 1)} />,
    );

    // ACT
    await component.getByRole("button", { name: "Remove" }).click();

    // ASSERT
    expect(removes).toBe(1);
  });

  test("should not fire the chip's onClick when removing", async ({ mount }) => {
    const events: string[] = [];

    // ARRANGE
    const component = await mount(
      <Chip
        label="Mobile"
        removable
        onClick={() => events.push("click")}
        onRemove={() => events.push("remove")}
      />,
    );

    // ACT
    await component.getByRole("button", { name: "Remove" }).click();

    // ASSERT
    expect(events).toEqual(["remove"]);
  });

  test("should use a custom removeLabel", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Chip label="Mobile" removable removeLabel="Remove Mobile" onRemove={() => {}} />,
    );

    // ASSERT
    await expect(component.getByRole("button", { name: "Remove Mobile" })).toBeVisible();
  });
});

test.describe("disabled", () => {
  test("should mark the chip aria-disabled and drop button semantics", async ({ mount }) => {
    let clicks = 0;

    // ARRANGE
    const component = await mount(<Chip label="Fintech" onClick={() => (clicks += 1)} disabled />);

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
    const component = await mount(<Chip label="Mobile" removable disabled onRemove={() => {}} />);

    // ASSERT
    await expect(component.getByRole("button", { name: "Remove" })).toBeDisabled();
  });
});
