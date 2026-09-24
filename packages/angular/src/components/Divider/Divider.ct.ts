import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { DividerTextAlign, DividerVariant } from "./Divider";

const VARIANTS = ["fullWidth", "inset", "middle"] as const satisfies readonly DividerVariant[];
const ALIGNMENTS = ["left", "center", "right"] as const satisfies readonly DividerTextAlign[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Divider (variants)",
    columns: VARIANTS,
    rows: ["plain", "with-label"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="width: 16rem"><okkly-divider variant="${column}">${
        row === "with-label" ? "<span okklyDividerLabel>OR</span>" : ""
      }</okkly-divider></div>`,
  });

  executeMatrixScreenshotTest({
    name: "Divider (label alignment)",
    columns: ALIGNMENTS,
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) =>
      `<div style="width: 16rem"><okkly-divider textAlign="${column}"><span okklyDividerLabel>Section</span></okkly-divider></div>`,
  });

  executeMatrixScreenshotTest({
    name: "Divider (vertical)",
    columns: ["default"],
    rows: ["default"],
    fastNoIsolation: true,
    component: () =>
      `<div style="display: flex; align-items: center; gap: 0.75rem; height: 3rem">
        <span>12 open</span>
        <okkly-divider orientation="vertical" flexItem />
        <span>4 merged</span>
      </div>`,
  });
});

test("should render a horizontal separator by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-divider />`);

  // ASSERT
  await expect(component).toHaveRole("separator");
  await expect(component).not.toHaveAttribute("aria-orientation");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-divider--horizontal/);
  await expect(component).not.toHaveClass(/okkly-divider--(vertical|inset|middle|with-label)/);
  await expect(component.locator(".okkly-divider__label")).toHaveCount(0);
});

test("should render a labeled divider as a separator", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-divider><span okklyDividerLabel>OR</span></okkly-divider>`,
  );

  // ASSERT
  await expect(component).toHaveRole("separator");
  await expect(component).toHaveText("OR");
  await expect(component).toHaveClass(/okkly-divider--with-label/);
  await expect(component.locator(".okkly-divider__label")).toHaveText("OR");
});

test("should add and drop the label as it is projected and removed", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-divider>
      @if (state().withLabel) {
        <span okklyDividerLabel>OR</span>
      }
    </okkly-divider>`,
    { withLabel: false },
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-divider--with-label/);

  // ACT
  await update({ withLabel: true });

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--with-label/);
  await expect(component.locator(".okkly-divider__label")).toHaveText("OR");

  // ACT
  await update({ withLabel: false });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-divider--with-label/);
  await expect(component.locator(".okkly-divider__label")).toHaveCount(0);
});

test("should render the vertical orientation", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-divider orientation="vertical" flexItem />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--vertical/);
  await expect(component).toHaveClass(/okkly-divider--flex-item/);
  await expect(component).toHaveAttribute("aria-orientation", "vertical");
});

test("should not show a label on a vertical divider", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-divider orientation="vertical"><span okklyDividerLabel>OR</span></okkly-divider>`,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-divider--with-label/);
  await expect(component.locator(".okkly-divider__label")).toHaveCount(0);
});

test("should apply the variant modifiers", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-divider [variant]="state().variant" />`, {
    variant: "inset",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--inset/);

  // ACT
  await update({ variant: "middle" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--middle/);

  // ACT
  await update({ variant: "fullWidth" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-divider--(inset|middle)/);
});

test("should apply the textAlign modifier on labeled dividers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-divider textAlign="left"><span okklyDividerLabel>Left</span></okkly-divider>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--align-left/);
});
