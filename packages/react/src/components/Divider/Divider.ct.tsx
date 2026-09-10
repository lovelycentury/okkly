import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Divider } from "./Divider";
import type { DividerTextAlign, DividerVariant } from "./Divider";

const VARIANTS = ["fullWidth", "inset", "middle"] as const satisfies readonly DividerVariant[];
const ALIGNMENTS = ["left", "center", "right"] as const satisfies readonly DividerTextAlign[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Divider (variants)",
    columns: VARIANTS,
    rows: ["plain", "with-label"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "16rem" }}>
        {row === "with-label" ? (
          <Divider variant={column}>OR</Divider>
        ) : (
          <Divider variant={column} />
        )}
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Divider (label alignment)",
    columns: ALIGNMENTS,
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => (
      <div style={{ width: "16rem" }}>
        <Divider textAlign={column}>Section</Divider>
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Divider (vertical)",
    columns: ["default"],
    rows: ["default"],
    fastNoIsolation: true,
    component: () => (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "3rem" }}>
        <span>12 open</span>
        <Divider orientation="vertical" flexItem />
        <span>4 merged</span>
      </div>
    ),
  });
});

test("should render a horizontal <hr> by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Divider />);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("HR");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-divider--horizontal/);
  await expect(component).not.toHaveClass(/okkly-divider--(vertical|inset|middle)/);
});

test("should render a labeled divider as a separator", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Divider>OR</Divider>);

  // ASSERT
  await expect(component).toHaveRole("separator");
  await expect(component).toHaveText("OR");
  await expect(component).toHaveClass(/okkly-divider--with-label/);
});

test("should render the vertical orientation", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Divider orientation="vertical" flexItem />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--vertical/);
  await expect(component).toHaveClass(/okkly-divider--flex-item/);
});

test("should apply the variant modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Divider variant="inset" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--inset/);

  // ACT
  await component.update(<Divider variant="middle" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--middle/);

  // ACT
  await component.update(<Divider variant="fullWidth" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-divider--(inset|middle)/);
});

test("should apply the textAlign modifier on labeled dividers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Divider textAlign="left">Left</Divider>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--align-left/);
});
