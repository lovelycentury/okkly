import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { ChipGroupColor } from "./ChipGroup";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
] as const satisfies readonly ChipGroupColor[];

const OPTIONS = `
  <okkly-chip okklyChipGroupOption="design" label="Design" />
  <okkly-chip okklyChipGroupOption="engineering" label="Engineering" />
  <okkly-chip okklyChipGroupOption="research" label="Research" />`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "ChipGroup (colors)",
    columns: COLORS,
    rows: ["none-selected", "one-selected", "disabled"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-chip-group color="${column}"${row === "disabled" ? " disabled" : ""} [value]="${
        row === "one-selected" ? "['design']" : "[]"
      }">${OPTIONS}</okkly-chip-group>`,
  });

  executeMatrixScreenshotTest({
    name: "ChipGroup (modes)",
    columns: ["multi", "exclusive", "removable"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => {
      if (column === "removable")
        return `<okkly-chip-group>
          <okkly-chip label="Design" removable /><okkly-chip label="Engineering" removable /><okkly-chip label="Research" removable />
        </okkly-chip-group>`;
      return column === "exclusive"
        ? `<okkly-chip-group exclusive value="design">${OPTIONS}</okkly-chip-group>`
        : `<okkly-chip-group [value]="['design', 'research']">${OPTIONS}</okkly-chip-group>`;
    },
  });
});

test("should render its options as chips", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-chip-group>${OPTIONS}</okkly-chip-group>`);

  // ASSERT
  await expect(component).toHaveRole("group");
  await expect(component.locator(".okkly-chip__label")).toHaveText([
    "Design",
    "Engineering",
    "Research",
  ]);
  await expect(component.getByRole("button", { name: "Design" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-chip-group><okkly-chip okklyChipGroupOption="design" label="Design" /></okkly-chip-group>`,
  );

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-chip-group");
});

test("should apply a color modifier only for non-primary tones", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-chip-group [color]="state().color"><okkly-chip label="Design" /></okkly-chip-group>`,
    { color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-chip-group--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-chip-group--color-/);
});

test("should leave chips without the option marker alone", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-chip-group><okkly-chip label="Custom" /></okkly-chip-group>`,
  );

  // ASSERT
  await expect(component).not.toHaveAttribute("role");
  await expect(component.locator(".okkly-chip__label")).toHaveText("Custom");
  await expect(component.locator(".okkly-chip")).not.toHaveAttribute("role");
});

test.describe("selection", () => {
  test("should reflect a bound multi value", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip-group [value]="['design']">${OPTIONS}</okkly-chip-group>`,
    );
    const chips = component.locator(".okkly-chip");

    // ASSERT
    await expect(chips.nth(0)).toHaveClass(/okkly-chip--selected/);
    await expect(chips.nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(chips.nth(1)).not.toHaveClass(/okkly-chip--selected/);
  });

  test("should toggle multi selection and emit valueChange", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip-group [value]="[]" (valueChange)="record('change', $event)">${OPTIONS}</okkly-chip-group>`,
    );

    // ACT
    await component.getByRole("button", { name: "Design" }).click();

    // ASSERT
    expect(await recordedEvents("change")).toEqual([["design"]]);
  });

  test("should keep the selection itself when nothing binds it", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-chip-group>${OPTIONS}</okkly-chip-group>`);
    const design = component.getByRole("button", { name: "Design" });

    // ACT
    await design.click();
    await component.getByRole("button", { name: "Research" }).click();
    await design.click();

    // ASSERT
    await expect(design).toHaveAttribute("aria-pressed", "false");
    await expect(component.getByRole("button", { name: "Research" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("should switch exclusive selection and emit valueChange", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip-group exclusive value="design" (valueChange)="record('change', $event)">${OPTIONS}</okkly-chip-group>`,
    );

    // ACT
    await component.getByRole("button", { name: "Engineering" }).click();

    // ASSERT
    expect(await recordedEvents("change")).toEqual(["engineering"]);
    await expect(component.getByRole("button", { name: "Engineering" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(component.getByRole("button", { name: "Design" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("should toggle with the keyboard", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-chip-group>${OPTIONS}</okkly-chip-group>`);
    const design = component.getByRole("button", { name: "Design" });

    // ACT
    await design.focus();
    await page.keyboard.press("Enter");

    // ASSERT
    await expect(design).toHaveAttribute("aria-pressed", "true");
  });

  test("should use a chip's own selected while the group has no value", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip-group>
        <okkly-chip okklyChipGroupOption="design" label="Design" selected />
        <okkly-chip okklyChipGroupOption="engineering" label="Engineering" />
      </okkly-chip-group>`,
    );
    const chips = component.locator(".okkly-chip");

    // ASSERT
    await expect(chips.nth(0)).toHaveClass(/okkly-chip--selected/);
    await expect(chips.nth(1)).not.toHaveClass(/okkly-chip--selected/);
  });
});

test.describe("disabled", () => {
  test("should mark the group disabled and block chip clicks", async ({
    mountTemplate,
    recordedEvents,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-chip-group disabled [value]="[]" (valueChange)="record('change', $event)">
        <okkly-chip okklyChipGroupOption="design" label="Design" />
      </okkly-chip-group>`,
    );
    const chip = component.locator(".okkly-chip");

    // ASSERT
    await expect(component).toHaveClass(/okkly-chip-group--disabled/);
    await expect(chip).toHaveCSS("pointer-events", "none");
    await expect(chip).toHaveAttribute("aria-disabled", "true");

    // ACT — the chip is unclickable in CSS, so dispatch directly to prove the
    // handler is guarded in JS as well.
    await chip.dispatchEvent("click");

    // ASSERT
    expect(await recordedEvents("change")).toEqual([]);
  });
});

test("should let a removable chip report its own removal", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-chip-group><okkly-chip label="Design" removable (removed)="record('removed', 'Design')" /></okkly-chip-group>`,
  );

  // ACT
  await component.getByRole("button", { name: "Remove" }).click();

  // ASSERT
  expect(await recordedEvents("removed")).toEqual(["Design"]);
});
