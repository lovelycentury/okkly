import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Progress from "./Progress.vue";
import type { ProgressColor, ProgressSize } from "./Progress.types";

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
    component: Progress,
    args: (column, row) => ({
      props: {
        type: row,
        value: 65,
        color: column,
        style: row === "linear" ? "width: 10rem" : undefined,
      } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Progress (sizes)",
    columns: SIZES,
    rows: ["linear", "circular", "circular-with-label", "indeterminate"],
    fastNoIsolation: true,
    component: Progress,
    args: (column, row) => ({
      props: {
        type: row.startsWith("circular") ? "circular" : "linear",
        size: column,
        variant: row === "indeterminate" ? "indeterminate" : "determinate",
        value: row === "indeterminate" ? undefined : 65,
        showLabel: row === "circular-with-label",
        style: row.startsWith("circular") ? undefined : "width: 10rem",
      } as never,
    }),
  });
});

test("should render a linear progressbar carrying its value", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Progress, { props: { value: 60 } as never });

  // ASSERT — the progressbar role sits on the component root itself.
  await expect(component).toHaveRole("progressbar");
  await expect(component).toHaveAttribute("aria-valuenow", "60");
  await expect(component).toHaveClass(/okkly-progress--linear/);
});

test("should apply the default classes without modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Progress, { props: { value: 40 } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-progress/);
  await expect(component).not.toHaveClass(/okkly-progress--(indeterminate|small|large|dante)/);
});

test("should omit aria-valuenow when indeterminate", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Progress, { props: { variant: "indeterminate" } as never });

  // ASSERT
  await expect(component).not.toHaveAttribute("aria-valuenow");
  await expect(component).toHaveClass(/okkly-progress--indeterminate/);
});

test("should apply the size and color modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Progress, {
    props: { value: 50, size: "small", color: "success" } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-progress--small/);
  await expect(component).toHaveClass(/okkly-progress--success/);

  // ACT
  await component.update({ props: { value: 50, size: "medium", color: "primary" } as never });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-progress--(small|success)/);
});

test("should render circular progress with a label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Progress, {
    props: { type: "circular", value: 70, showLabel: true } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-progress--circular/);
  await expect(component).toContainText("70%");
});

test("should clamp the value between 0 and 100", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Progress, { props: { value: 150 } as never });

  // ASSERT
  await expect(component).toHaveAttribute("aria-valuenow", "100");

  // ACT
  await component.update({ props: { value: -10 } as never });

  // ASSERT
  await expect(component).toHaveAttribute("aria-valuenow", "0");
});
