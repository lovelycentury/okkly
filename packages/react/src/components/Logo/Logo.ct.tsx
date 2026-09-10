import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Logo } from "./Logo";
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
    component: (column, row) => <Logo tone={column} variant={row} />,
  });

  executeMatrixScreenshotTest({
    name: "Logo (layouts)",
    columns: LAYOUTS,
    rows: ["with-label", "emblem-only"],
    fastNoIsolation: true,
    component: (column, row) => <Logo layout={column} showLabel={row === "with-label"} />,
  });
});

test("should render the default wordmark", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo />);

  // ASSERT
  await expect(component).toContainText("okkly");
});

test("should render a custom label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo label="Acme Inc." />);

  // ASSERT
  await expect(component).toContainText("Acme Inc.");
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-logo/);
  await expect(component).not.toHaveClass(/okkly-logo--(compact|stacked)/);
  await expect(component).not.toHaveClass(/okkly-logo--tone-/);
});

test("should apply a layout modifier only for non-horizontal layouts", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo layout="compact" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--compact/);

  // ACT
  await component.update(<Logo layout="horizontal" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-logo--(compact|stacked)/);
});

test("should apply a tone modifier only for non-multi tones", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo tone="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--tone-dante/);

  // ACT
  await component.update(<Logo tone="mint" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--tone-mint/);

  // ACT
  await component.update(<Logo tone="multi" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-logo--tone-/);
});

test("should apply a variant modifier only for non-filled variants", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo variant="outlined" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--outlined/);

  // ACT
  await component.update(<Logo variant="pure" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-logo--pure/);

  // ACT
  await component.update(<Logo variant="filled" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-logo--(filled|outlined|pure)/);
});

test("should crop the viewBox to the glyph for the pure variant", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo variant="pure" />);

  // ASSERT
  await expect(component.locator(".okkly-logo__emblem")).toHaveAttribute(
    "viewBox",
    "18.28125 19.125 37.125 37.125",
  );
});

test("should drop the gradient for flat tones", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo tone="dante" />);

  // ASSERT
  await expect(component.locator("linearGradient")).toHaveCount(0);
});

test("should hide the wordmark when showLabel is false", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo showLabel={false} />);

  // ASSERT
  await expect(component).not.toContainText("okkly");
  await expect(component.locator(".okkly-logo__emblem")).toBeAttached();
});

test("should override the emblem size via the size prop", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Logo size={80} />);

  // ASSERT — a number is read as pixels.
  expect(
    await component.evaluate((element) =>
      element.style.getPropertyValue("--okkly-logo-emblem-size"),
    ),
  ).toBe("80px");

  // ACT
  await component.update(<Logo size="4rem" />);

  // ASSERT — a string is passed straight through.
  expect(
    await component.evaluate((element) =>
      element.style.getPropertyValue("--okkly-logo-emblem-size"),
    ),
  ).toBe("4rem");
});

test("should use unique gradient ids across instances", async ({ mount }) => {
  // ARRANGE — duplicate ids would make one logo paint with the other's fill.
  const component = await mount(
    <div>
      <Logo />
      <Logo />
    </div>,
  );

  // ASSERT
  const ids = await component
    .locator("linearGradient")
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(ids.length).toBeGreaterThan(0);
  expect(new Set(ids).size).toBe(ids.length);
});
