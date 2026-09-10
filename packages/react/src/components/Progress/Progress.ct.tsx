import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Progress } from "./Progress";
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
    component: (column, row) => (
      <div style={{ width: row === "linear" ? "10rem" : undefined }}>
        <Progress type={row} value={65} color={column} />
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Progress (sizes)",
    columns: SIZES,
    rows: ["linear", "circular", "circular-with-label", "indeterminate"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: row.startsWith("circular") ? undefined : "10rem" }}>
        <Progress
          type={row.startsWith("circular") ? "circular" : "linear"}
          size={column}
          variant={row === "indeterminate" ? "indeterminate" : "determinate"}
          value={row === "indeterminate" ? undefined : 65}
          showLabel={row === "circular-with-label"}
        />
      </div>
    ),
  });
});

test("should render a linear progressbar carrying its value", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Progress value={60} />);

  // ASSERT — the progressbar role sits on the component root itself.
  await expect(component).toHaveRole("progressbar");
  await expect(component).toHaveAttribute("aria-valuenow", "60");
  await expect(component).toHaveClass(/okkly-progress--linear/);
});

test("should apply the default classes without modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Progress value={40} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-progress/);
  await expect(component).not.toHaveClass(/okkly-progress--(indeterminate|small|large|dante)/);
});

test("should omit aria-valuenow when indeterminate", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Progress variant="indeterminate" />);

  // ASSERT
  await expect(component).not.toHaveAttribute("aria-valuenow");
  await expect(component).toHaveClass(/okkly-progress--indeterminate/);
});

test("should apply the size and color modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Progress value={50} size="small" color="success" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-progress--small/);
  await expect(component).toHaveClass(/okkly-progress--success/);

  // ACT
  await component.update(<Progress value={50} size="medium" color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-progress--(small|success)/);
});

test("should render circular progress with a label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Progress type="circular" value={70} showLabel />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-progress--circular/);
  await expect(component).toContainText("70%");
});

test("should clamp the value between 0 and 100", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Progress value={150} />);

  // ASSERT
  await expect(component).toHaveAttribute("aria-valuenow", "100");

  // ACT
  await component.update(<Progress value={-10} />);

  // ASSERT
  await expect(component).toHaveAttribute("aria-valuenow", "0");
});
