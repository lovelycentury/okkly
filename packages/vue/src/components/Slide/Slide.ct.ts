import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Slide from "./Slide.vue";
import type { SlideDirection } from "./Slide.types";

const DIRECTIONS = ["up", "down", "left", "right"] as const satisfies readonly SlideDirection[];
const content = { default: "<div>Slide content</div>" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Slide (directions)",
    columns: DIRECTIONS,
    rows: ["entered"],
    fastNoIsolation: true,
    component: Slide,
    args: (column) => ({
      props: { in: true, direction: column, appear: false },
      slots: {
        default: `<div style="padding: 0.5rem; background: var(--okkly-bg-surface)">Slide content</div>`,
      },
    }),
  });
});

test("should render its slot when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slide, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Slide content");
});

test("should not render the slot when in is false", async ({ mount, page }) => {
  // ARRANGE
  await mount(Slide, { props: { in: false }, slots: content });

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should use the down direction by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slide, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toHaveClass(/okkly-slide--down/);
});

test("should apply the direction modifier for each direction", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slide, {
    props: { in: true, direction: "left" },
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-slide--left/);
});

test("should settle at transform: none once entered", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slide, {
    props: { in: true, direction: "up", timeout: 50 },
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveCSS("transform", "none");
});

test("should keep the slot mounted but hidden when keepMounted is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slide, {
    props: { in: false, keepMounted: true },
    slots: content,
  });

  // ASSERT
  await expect(component).toBeAttached();
  await expect(component).toHaveCSS("display", "none");
});

test("should merge a consumer's class onto the slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Slide, {
    props: { in: true, class: "custom-class" } as never,
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-slide/);
  await expect(component).toHaveClass(/custom-class/);
});
