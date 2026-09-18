import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import DividerFixture from "../../playwright/fixtures/DividerFixture.vue";
import Divider from "./Divider.vue";
import type { DividerTextAlign, DividerVariant } from "./Divider.types";

const VARIANTS = ["fullWidth", "inset", "middle"] as const satisfies readonly DividerVariant[];
const ALIGNMENTS = ["left", "center", "right"] as const satisfies readonly DividerTextAlign[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Divider (variants)",
    columns: VARIANTS,
    rows: ["plain", "with-label"],
    fastNoIsolation: true,
    component: DividerFixture,
    args: (column, row) => ({
      props: { variant: column, label: row === "with-label" ? "OR" : undefined } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Divider (label alignment)",
    columns: ALIGNMENTS,
    rows: ["default"],
    fastNoIsolation: true,
    component: DividerFixture,
    args: (column) => ({ props: { textAlign: column, label: "Section" } as never }),
  });

  executeMatrixScreenshotTest({
    name: "Divider (vertical)",
    columns: ["default"],
    rows: ["default"],
    fastNoIsolation: true,
    component: DividerFixture,
    args: () => ({ props: { vertical: true } as never }),
  });
});

test("should render a horizontal <hr> by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Divider);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("HR");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-divider--horizontal/);
  await expect(component).not.toHaveClass(/okkly-divider--(vertical|inset|middle)/);
});

test("should render a labeled divider as a separator", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Divider, { slots: { default: "OR" } });

  // ASSERT
  await expect(component).toHaveRole("separator");
  await expect(component).toHaveText("OR");
  await expect(component).toHaveClass(/okkly-divider--with-label/);
});

test("should render the vertical orientation", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Divider, { props: { orientation: "vertical", flexItem: true } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--vertical/);
  await expect(component).toHaveClass(/okkly-divider--flex-item/);
});

test("should apply the variant modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Divider, { props: { variant: "inset" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--inset/);

  // ACT
  await component.update({ props: { variant: "middle" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--middle/);

  // ACT
  await component.update({ props: { variant: "fullWidth" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-divider--(inset|middle)/);
});

test("should apply the textAlign modifier on labeled dividers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Divider, {
    props: { textAlign: "left" },
    slots: { default: "Left" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-divider--align-left/);
});
