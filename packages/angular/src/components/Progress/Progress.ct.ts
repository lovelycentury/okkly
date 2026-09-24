import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { ProgressColor, ProgressSize } from "./Progress";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
] as const satisfies readonly ProgressColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly ProgressSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Progress (colors)",
    columns: COLORS,
    rows: ["linear", "circular"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<div style="${row === "linear" ? "width: 10rem" : ""}"><okkly-progress type="${row}" value="65" color="${column}" /></div>`,
  });

  executeMatrixScreenshotTest({
    name: "Progress (sizes)",
    columns: SIZES,
    rows: ["linear", "circular", "circular-with-label", "indeterminate"],
    fastNoIsolation: true,
    component: (column, row) => {
      const circular = row.startsWith("circular");
      const variant = row === "indeterminate" ? "indeterminate" : "determinate";
      const value = row === "indeterminate" ? "" : ` value="65"`;
      const label = row === "circular-with-label" ? " showLabel" : "";
      return `<div style="${circular ? "" : "width: 10rem"}"><okkly-progress type="${
        circular ? "circular" : "linear"
      }" size="${column}" variant="${variant}"${value}${label} /></div>`;
    },
  });
});

test("should render a linear progressbar carrying its value", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-progress value="60" aria-label="Upload" />`);

  // ASSERT
  await expect(component).toHaveRole("progressbar");
  await expect(component).toHaveAccessibleName("Upload");
  await expect(component).toHaveAttribute("aria-valuenow", "60");
  await expect(component).toHaveAttribute("aria-valuemin", "0");
  await expect(component).toHaveAttribute("aria-valuemax", "100");
  await expect(component).toHaveClass(/okkly-progress--linear/);
  await expect(component.locator(".okkly-progress__bar")).toHaveCSS("width", /px$/);
});

test("should apply the default classes without modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-progress value="40" />`);

  // ASSERT
  await expect(component).toHaveAttribute(
    "class",
    "okkly-component okkly-progress okkly-progress--linear",
  );
});

test("should omit aria-valuenow when indeterminate", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-progress variant="indeterminate" />`);

  // ASSERT
  await expect(component).not.toHaveAttribute("aria-valuenow");
  await expect(component).toHaveClass(/okkly-progress--indeterminate/);
});

test("should apply the size and color modifiers", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-progress value="50" [size]="state().size" [color]="state().color" />`,
    { size: "small", color: "success" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-progress--small/);
  await expect(component).toHaveClass(/okkly-progress--success/);

  // ACT
  await update({ size: "medium", color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-progress--(small|success)/);
});

test("should render circular progress with a label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-progress type="circular" value="70" showLabel />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-progress--circular/);
  await expect(component).toContainText("70%");
});

test("should hide the circular label while indeterminate", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-progress type="circular" variant="indeterminate" showLabel />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-progress__label")).toHaveCount(0);
});

test("should clamp the value between 0 and 100", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-progress [value]="state().value" />`, {
    value: 150,
  });

  // ASSERT
  await expect(component).toHaveAttribute("aria-valuenow", "100");

  // ACT
  await update({ value: -10 });

  // ASSERT
  await expect(component).toHaveAttribute("aria-valuenow", "0");
});
