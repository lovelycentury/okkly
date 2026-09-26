import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type { ChipSize, ChipVariant } from "./Chip";

const VARIANTS = [
  "glass",
  "solid",
  "outline",
  "accent",
  "dante",
] as const satisfies readonly ChipVariant[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ChipSize[];

const icon = (className = "") =>
  MOCK_PLAYWRIGHT_ICON.replace(
    "<svg",
    `<svg okklyChipIcon${className ? ` class="${className}"` : ""}`,
  );

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Chip (variants)",
    columns: VARIANTS,
    rows: ["default", "selected", "disabled", "hover"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column, row) =>
      `<okkly-chip label="Fintech" variant="${column}" clickable${row === "selected" ? " selected" : ""}${
        row === "disabled" ? " disabled" : ""
      } />`,
  });

  executeMatrixScreenshotTest({
    name: "Chip (sizes)",
    columns: SIZES,
    rows: ["plain", "dot", "icon", "removable"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-chip label="Fintech" size="${column}"${row === "dot" ? " dot" : ""}${
        row === "removable" ? " removable" : ""
      }>${row === "icon" ? icon() : ""}</okkly-chip>`,
  });
});

test("should render its label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-chip label="Fintech" />`);

  // ASSERT
  await expect(component.locator(".okkly-chip__label")).toHaveText("Fintech");
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-chip label="Fintech" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-chip");
  await expect(component.locator(".okkly-chip__icon")).toBeHidden();
});

test("should apply the variant modifier only for non-default variants", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-chip label="Fintech" [variant]="state().variant" />`,
    {
      variant: "dante",
    },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--dante/);

  // ACT
  await update({ variant: "glass" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip--(solid|outline|accent|dante)/);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-chip label="Fintech" [size]="state().size" />`, {
    size: "small",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip--(small|large)/);
});

test("should apply the selected modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-chip label="Fintech" selected />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip--selected/);
});

test("should render a leading dot", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-chip label="Available" dot />`);

  // ASSERT
  await expect(component.locator(".okkly-chip__dot")).toBeAttached();
});

test("should render a leading icon and suppress the dot", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-chip label="Starred" dot>${icon("glyph")}</okkly-chip>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-chip__icon .glyph")).toBeVisible();
  await expect(component.locator(".okkly-chip__dot")).toHaveCount(0);
});

test.describe("clickable", () => {
  test("should not be a button unless clickable", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-chip label="Fintech" />`);

    // ASSERT
    await expect(component).not.toHaveAttribute("role");
    await expect(component).not.toHaveAttribute("tabindex");
    await expect(component).not.toHaveClass(/okkly-chip--interactive/);
  });

  test("should get button semantics and fire click", async ({ mountTemplate, recordedEvents }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip label="Fintech" clickable (click)="record('click')" />`,
    );

    // ASSERT
    await expect(component).toHaveRole("button");
    await expect(component).toHaveAccessibleName("Fintech");
    await expect(component).toHaveAttribute("aria-pressed", "false");
    await expect(component).toHaveClass(/okkly-chip--interactive/);

    // ACT
    await component.click();

    // ASSERT
    expect(await recordedEvents("click")).toHaveLength(1);
  });

  test("should fire click on Enter and Space", async ({ mountTemplate, page, recordedEvents }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip label="Fintech" clickable (click)="record('click')" />`,
    );

    // ACT
    await component.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press(" ");

    // ASSERT
    expect(await recordedEvents("click")).toHaveLength(2);
  });

  test("should reflect selected as aria-pressed", async ({ mountTemplate, update }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip label="Fintech" clickable [selected]="state().selected" />`,
      { selected: false },
    );

    // ACT
    await update({ selected: true });

    // ASSERT
    await expect(component).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("removable", () => {
  test("should render a trailing remove button and emit removed", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip label="Mobile" removable (removed)="record('removed')" />`,
    );

    // ACT
    await component.getByRole("button", { name: "Remove" }).click();

    // ASSERT
    expect(await recordedEvents("removed")).toHaveLength(1);
  });

  test("should not fire the chip's click when removing", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip label="Mobile" removable clickable (click)="record('click')" (removed)="record('removed')" />`,
    );

    // ACT
    await component.getByRole("button", { name: "Remove" }).click();

    // ASSERT
    expect(await recordedEvents("removed")).toHaveLength(1);
    expect(await recordedEvents("click")).toHaveLength(0);
  });

  test("should use a custom removeLabel", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip label="Mobile" removable removeLabel="Remove Mobile" />`,
    );

    // ASSERT
    await expect(component.getByRole("button", { name: "Remove Mobile" })).toBeVisible();
  });
});

test.describe("disabled", () => {
  test("should mark the chip aria-disabled and drop button semantics", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip label="Fintech" clickable disabled (click)="record('click')" />`,
    );

    // ASSERT
    await expect(component).toHaveAttribute("aria-disabled", "true");
    await expect(component).not.toHaveAttribute("role");
    await expect(component).not.toHaveClass(/okkly-chip--interactive/);
    await expect(component).toHaveCSS("pointer-events", "none");

    // ACT — a real click cannot land on a `pointer-events: none` element, so
    // dispatch one directly to prove the handler is guarded in JS too.
    await component.dispatchEvent("click");

    // ASSERT
    expect(await recordedEvents("click")).toHaveLength(0);
  });

  test("should disable the remove button", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-chip label="Mobile" removable disabled />`);

    // ASSERT
    await expect(component.getByRole("button", { name: "Remove" })).toBeDisabled();
  });
});
