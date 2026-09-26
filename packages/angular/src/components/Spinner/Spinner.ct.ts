import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { SpinnerColor, SpinnerSize } from "./Spinner";

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
] as const satisfies readonly SpinnerColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SpinnerSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Spinner (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => `<okkly-spinner color="${column}" size="${row}" />`,
  });

  executeMatrixScreenshotTest({
    name: "Spinner (thickness)",
    columns: ["2", "4", "6"],
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) => `<okkly-spinner thickness="${column}" size="${row}" />`,
  });
});

test("should render with an accessible loading label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-spinner />`);

  // ASSERT
  await expect(component).toHaveRole("status");
  await expect(component).toHaveAccessibleName("Loading");
});

test("should replace the default label with the consumer's aria-label", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-spinner aria-label="Loading your projects" />`);

  // ASSERT
  await expect(component).toHaveAccessibleName("Loading your projects");
});

test("should apply the default classes without modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-spinner />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-spinner");
});

test("should apply size modifiers only for non-medium sizes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-spinner [size]="state().size" />`, {
    size: "small",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-spinner--small/);

  // ACT
  await update({ size: "large" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-spinner--large/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-spinner--(small|large)/);
});

test("should apply color modifiers only for non-primary colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-spinner [color]="state().color" />`, {
    color: "dante",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-spinner--dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-spinner--dante/);
});

test("should size the ring stroke from the preset or the thickness override", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-spinner size="large" [thickness]="state().thickness" />`,
    { thickness: undefined },
  );
  const arc = component.locator(".okkly-spinner__arc");

  // ASSERT
  await expect(arc).toHaveAttribute("stroke-width", "4");

  // ACT
  await update({ thickness: 6 });

  // ASSERT
  await expect(arc).toHaveAttribute("stroke-width", "6");
  await expect(arc).toHaveAttribute("r", "17");
});
