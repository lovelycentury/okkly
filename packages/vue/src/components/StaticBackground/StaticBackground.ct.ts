import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import StaticBackground from "./StaticBackground.vue";
import type { StaticBackgroundPreset, StaticBackgroundQuality } from "./StaticBackground.types";

const PRESETS = [
  "aurora",
  "midnight",
  "neon",
  "void",
] as const satisfies readonly StaticBackgroundPreset[];
const QUALITIES = ["low", "medium", "high"] as const satisfies readonly StaticBackgroundQuality[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "StaticBackground (presets)",
    columns: PRESETS,
    rows: ["plain", "scrim"],
    fastNoIsolation: true,
    component: StaticBackground,
    args: (column, row) => ({
      props: {
        preset: column,
        scrim: row === "scrim",
        quality: "medium",
        style: "width: 14rem; height: 9rem; position: relative",
      } as never,
    }),
  });

  executeMatrixScreenshotTest({
    name: "StaticBackground (quality)",
    columns: QUALITIES,
    rows: ["default"],
    fastNoIsolation: true,
    component: StaticBackground,
    args: (column) => ({
      props: { quality: column, style: "width: 14rem; height: 9rem; position: relative" } as never,
    }),
  });
});

test("should render the scene svg with no mount step", async ({ mount }) => {
  // ARRANGE
  const component = await mount(StaticBackground);

  // ASSERT
  await expect(component.locator(".okkly-static-background__svg")).toBeAttached();
});

test("should draw every layer", async ({ mount }) => {
  // ARRANGE
  const component = await mount(StaticBackground);

  // ASSERT
  for (const layer of ["cloud", "star"]) {
    expect(
      await component.locator(`.okkly-static-background__${layer}`).count(),
      layer,
    ).toBeGreaterThan(0);
  }
  await expect(component.locator(".okkly-static-background__grain")).toBeAttached();
  await expect(component.locator(".okkly-static-background__bloom")).toBeAttached();
});

test("should default to aurora with no preset modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(StaticBackground);

  // ASSERT
  await expect(component).toHaveClass(/okkly-static-background/);
  await expect(component).not.toHaveClass(/okkly-static-background--(midnight|neon|void)/);
});

test("should apply the preset modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(StaticBackground, { props: { preset: "neon" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-static-background--neon/);
});

test("should scale the star field with quality", async ({ mount }) => {
  // ARRANGE
  const component = await mount(StaticBackground, { props: { quality: "low" } as never });
  const stars = component.locator(".okkly-static-background__star");
  const low = await stars.count();

  // ACT
  await component.update({ props: { quality: "high" } as never });

  // ASSERT
  expect(await stars.count()).toBeGreaterThan(low);
});

test("should render the scrim only when requested", async ({ mount }) => {
  // ARRANGE
  const component = await mount(StaticBackground);

  // ASSERT
  await expect(component.locator(".okkly-static-background__scrim")).toHaveCount(0);

  // ACT
  await component.update({ props: { scrim: true } as never });

  // ASSERT
  await expect(component.locator(".okkly-static-background__scrim")).toBeAttached();
});

test("should hold still, with no animation on any layer", async ({ mount }) => {
  // ARRANGE — this is the whole point of the static variant: it is the frame
  // an email client, a print view or a reduced-motion reader gets.
  const component = await mount(StaticBackground);

  // ASSERT
  await expect(component.locator(".okkly-static-background__cloud").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(component.locator(".okkly-static-background__star").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("should render its default slot above the scene", async ({ mount }) => {
  // ARRANGE
  const component = await mount(StaticBackground, {
    slots: { default: "<h1>Hero copy</h1>" },
  });

  // ASSERT
  await expect(component.getByRole("heading", { name: "Hero copy" })).toBeVisible();
});

test("should keep the star field stable between renders", async ({ mount }) => {
  // ARRANGE — the positions are seeded, not random, so a re-render must not
  // reshuffle the sky.
  const component = await mount(StaticBackground);
  const positions = () =>
    component
      .locator(".okkly-static-background__star")
      .evaluateAll((nodes) =>
        nodes.map((node) => `${node.getAttribute("cx")},${node.getAttribute("cy")}`).join("|"),
      );
  const before = await positions();

  // ACT
  await component.update({ props: {} as never });

  // ASSERT
  expect(await positions()).toBe(before);
});
