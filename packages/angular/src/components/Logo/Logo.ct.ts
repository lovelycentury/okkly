import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { LogoLayout, LogoTone, LogoVariant } from "./Logo";

const LAYOUTS = ["compact", "horizontal", "stacked"] as const satisfies readonly LogoLayout[];
const TONES = [
  "multi",
  "mint",
  "indigo",
  "dante",
  "violet",
  "ember",
] as const satisfies readonly LogoTone[];
const VARIANTS = ["filled", "outlined", "pure"] as const satisfies readonly LogoVariant[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Logo (tones)",
    columns: TONES,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) => `<okkly-logo tone="${column}" variant="${row}" />`,
  });

  executeMatrixScreenshotTest({
    name: "Logo (layouts)",
    columns: LAYOUTS,
    rows: ["with-label", "emblem-only"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-logo layout="${column}" [showLabel]="${row === "with-label"}" />`,
  });
});

test("should render the default wordmark", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo />`);

  // ASSERT
  await expect(component).toContainText("okkly");
  await expect(component.locator(".okkly-logo__emblem")).toHaveAttribute("aria-hidden", "true");
});

test("should render a custom label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo label="Acme Inc." />`);

  // ASSERT
  await expect(component).toContainText("Acme Inc.");
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-logo");
});

test("should apply a layout modifier only for non-horizontal layouts", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo [layout]="state().layout" />`, {
    layout: "compact",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--compact/);

  // ACT
  await update({ layout: "horizontal" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-logo--(compact|stacked)/);
});

test("should apply a tone modifier only for non-multi tones", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo [tone]="state().tone" />`, {
    tone: "dante",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--tone-dante/);

  // ACT
  await update({ tone: "mint" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--tone-mint/);

  // ACT
  await update({ tone: "multi" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-logo--tone-/);
});

test("should apply a variant modifier only for non-filled variants", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo [variant]="state().variant" />`, {
    variant: "outlined",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--outlined/);

  // ACT
  await update({ variant: "pure" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--pure/);

  // ACT
  await update({ variant: "filled" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-logo--(filled|outlined|pure)/);
});

test("should crop the viewBox to the glyph for the pure variant", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo variant="pure" />`);

  // ASSERT
  await expect(component.locator(".okkly-logo__emblem")).toHaveAttribute(
    "viewBox",
    "18.28125 19.125 37.125 37.125",
  );
  await expect(component.locator("circle")).toHaveCount(0);
});

test("should paint with the gradient for the multi tone", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo />`);
  const gradient = component.locator("linearGradient");

  // ASSERT
  await expect(gradient).toHaveCount(1);
  const id = await gradient.getAttribute("id");
  await expect(component.locator("circle")).toHaveAttribute("fill", `url(#${id})`);
});

test("should drop the gradient for flat tones", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo tone="dante" />`);

  // ASSERT
  await expect(component.locator("linearGradient")).toHaveCount(0);
});

test("should hide the wordmark when showLabel is false", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo [showLabel]="false" />`);

  // ASSERT
  await expect(component).not.toContainText("okkly");
  await expect(component.locator(".okkly-logo__emblem")).toBeAttached();
});

test("should override the emblem size via the size input", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-logo [size]="state().size" />`, { size: 80 });
  const emblemSize = () =>
    component.evaluate((element) => element.style.getPropertyValue("--okkly-logo-emblem-size"));

  // ASSERT — a number is read as pixels.
  expect(await emblemSize()).toBe("80px");

  // ACT
  await update({ size: "4rem" });

  // ASSERT — a string is passed straight through.
  expect(await emblemSize()).toBe("4rem");
});

test("should use unique gradient ids across instances", async ({ mountTemplate }) => {
  // ARRANGE — duplicate ids would make one logo paint with the other's fill.
  const component = await mountTemplate(`<div><okkly-logo /><okkly-logo /></div>`);

  // ASSERT
  const ids = await component
    .locator("linearGradient")
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(ids.length).toBe(2);
  expect(new Set(ids).size).toBe(ids.length);
});
