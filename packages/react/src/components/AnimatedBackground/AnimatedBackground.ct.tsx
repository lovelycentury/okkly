import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { AnimatedBackground } from "./AnimatedBackground";
import type { BackgroundPreset } from "./AnimatedBackground";

const PRESETS = [
  "aurora",
  "midnight",
  "neon",
  "void",
] as const satisfies readonly BackgroundPreset[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "AnimatedBackground (presets)",
    columns: PRESETS,
    rows: ["plain", "scrim"],
    // The scene animates continuously; `animations: "disabled"` freezes it on
    // the first frame, which is what makes the baseline reproducible.
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "14rem", height: "9rem", position: "relative" }}>
        <AnimatedBackground preset={column} scrim={row === "scrim"} quality="medium" />
      </div>
    ),
  });
});

test("should render the scene svg once mounted on the client", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground />);

  // ASSERT
  await expect(component.locator(".okkly-animated-background__svg")).toBeAttached();
});

test("should draw every layer", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground />);

  // ASSERT
  for (const layer of ["cloud", "star", "beacon", "spark"]) {
    expect(
      await component.locator(`.okkly-animated-background__${layer}`).count(),
      layer,
    ).toBeGreaterThan(0);
  }
  await expect(component.locator(".okkly-animated-background__grain")).toBeAttached();
});

test("should default to aurora with no preset modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-animated-background/);
  await expect(component).not.toHaveClass(/okkly-animated-background--(midnight|neon|void)/);
});

test("should apply the preset modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground preset="neon" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-animated-background--neon/);
});

test("should scale the star field with quality", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground quality="low" />);
  const stars = component.locator(".okkly-animated-background__star");
  const low = await stars.count();

  // ACT
  await component.update(<AnimatedBackground quality="high" />);

  // ASSERT
  expect(await stars.count()).toBeGreaterThan(low);
});

test("should drop the firework layer when disabled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground fireworks />);
  const spokes = component.locator(".okkly-animated-background__spoke");

  // ASSERT
  expect(await spokes.count()).toBeGreaterThan(0);

  // ACT
  await component.update(<AnimatedBackground fireworks={false} />);

  // ASSERT
  await expect(spokes).toHaveCount(0);
});

test("should render the scrim only when requested", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground />);

  // ASSERT
  await expect(component.locator(".okkly-animated-background__scrim")).toHaveCount(0);

  // ACT
  await component.update(<AnimatedBackground scrim />);

  // ASSERT
  await expect(component.locator(".okkly-animated-background__scrim")).toBeAttached();
});

test("should opt out of reduced motion with a modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<AnimatedBackground respectReducedMotion={false} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-animated-background--force-motion/);
});

test("should settle on a still frame under prefers-reduced-motion", async ({ mount, page }) => {
  // ARRANGE — jsdom had no way to evaluate this media query at all.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const component = await mount(<AnimatedBackground />);

  // ASSERT — the scene drops its animations entirely and rests on the calm frame.
  await expect(component.locator(".okkly-animated-background__cloud").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(component.locator(".okkly-animated-background__star").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("should keep animating under reduced motion when told to force it", async ({
  mount,
  page,
}) => {
  // ARRANGE
  await page.emulateMedia({ reducedMotion: "reduce" });
  const component = await mount(<AnimatedBackground respectReducedMotion={false} />);

  // ASSERT
  await expect(component.locator(".okkly-animated-background__cloud").first()).not.toHaveCSS(
    "animation-name",
    "none",
  );
});

test("should render children above the scene", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <AnimatedBackground>
      <h1>Hero copy</h1>
    </AnimatedBackground>,
  );

  // ASSERT
  await expect(component.getByRole("heading", { name: "Hero copy" })).toBeVisible();
});

test("should keep the star field stable between renders", async ({ mount }) => {
  // ARRANGE — the positions are seeded, not random, so a re-render must not
  // reshuffle the sky.
  const component = await mount(<AnimatedBackground />);
  const positions = () =>
    component
      .locator(".okkly-animated-background__star")
      .evaluateAll((nodes) =>
        nodes.map((node) => `${node.getAttribute("cx")},${node.getAttribute("cy")}`).join("|"),
      );
  const before = await positions();

  // ACT
  await component.update(<AnimatedBackground />);

  // ASSERT
  expect(await positions()).toBe(before);
});
