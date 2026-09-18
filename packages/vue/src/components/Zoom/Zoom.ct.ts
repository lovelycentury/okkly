import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Zoom from "./Zoom.vue";

const content = { default: "<div>Zoom content</div>" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Zoom (states)",
    columns: ["entered", "exited"],
    rows: ["default", "keep-mounted"],
    fastNoIsolation: true,
    component: Zoom,
    args: (column, row) => ({
      props: { in: column === "entered", keepMounted: row === "keep-mounted", appear: false },
      slots: {
        default: `<div style="padding: 0.5rem; background: var(--okkly-bg-surface)">Zoom content</div>`,
      },
    }),
  });
});

test("should render its slot when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Zoom, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toBeVisible();
  await expect(component).toHaveText("Zoom content");
});

test("should not render the slot when in is false", async ({ mount, page }) => {
  // ARRANGE
  await mount(Zoom, { props: { in: false }, slots: content });

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should keep the slot mounted but hidden when keepMounted is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Zoom, {
    props: { in: false, keepMounted: true },
    slots: content,
  });

  // ASSERT
  await expect(component).toBeAttached();
  await expect(component).toHaveCSS("display", "none");
});

test("should apply the okkly-zoom class to the slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Zoom, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toHaveClass(/okkly-zoom/);
});

test("should start at scale(0) and settle at none", async ({ mount }) => {
  // ARRANGE — closed and kept mounted, so the resting transform is the
  // zeroed-out scale. `display: none` on the element makes the *computed*
  // transform report "none" regardless, so the inline style is what's checked.
  const component = await mount(Zoom, { props: { in: false, keepMounted: true }, slots: content });

  // ASSERT
  await expect(component).toHaveAttribute("style", /transform:\s*scale\(0\)/);

  // ACT
  await component.update({ props: { in: true, keepMounted: true } });

  // ASSERT
  await expect(component).toHaveCSS("transform", "none");
});

test("should merge a consumer's class onto the slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Zoom, {
    props: { in: true, class: "custom-class" } as never,
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-zoom/);
  await expect(component).toHaveClass(/custom-class/);
});
