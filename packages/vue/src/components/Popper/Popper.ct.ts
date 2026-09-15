import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import AnchoredPopper from "../../playwright/fixtures/AnchoredPopper.vue";
import Popper from "./Popper.vue";
import type { PopperPlacement } from "./Popper.types";

const PLACEMENTS = ["top", "bottom", "left", "right"] as const satisfies readonly PopperPlacement[];

// Popper portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 320 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Popper (placements)",
    columns: PLACEMENTS,
    rows: ["default"],
    screenshotTarget: "page",
    component: AnchoredPopper,
    hooks: {
      beforeEach: async (component) => {
        await component.getByRole("button", { name: "Toggle" }).click();
      },
    },
    args: (column) => ({ props: { placement: column }, slots: { default: "A hover card" } }),
  });
});

test("should render its default slot when open with an anchor", async ({ mount, page }) => {
  // ARRANGE
  await mount(AnchoredPopper, { props: { defaultOpen: true } });

  // ASSERT — the panel portals to document.body, so it is queried off the page.
  await expect(page.locator(".okkly-popper")).toBeVisible();
  await expect(page.getByText("Popper content")).toBeVisible();
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(AnchoredPopper, { slots: { default: "Hidden" } });

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
  await expect(page.locator(".okkly-popper")).toHaveCount(0);
});

test("should keep its content mounted but hidden with keepMounted", async ({ mount, page }) => {
  // ARRANGE
  await mount(AnchoredPopper, { props: { keepMounted: true }, slots: { default: "Kept" } });

  // ASSERT
  await expect(page.getByText("Kept")).toBeAttached();
  await expect(page.locator(".okkly-popper")).toHaveCSS("display", "none");
});

test("should toggle from its trigger", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(AnchoredPopper, { slots: { default: "Panel" } });
  const trigger = component.getByRole("button", { name: "Toggle" });

  // ACT
  await trigger.click();

  // ASSERT
  await expect(page.getByText("Panel")).toBeVisible();

  // ACT
  await trigger.click();

  // ASSERT
  await expect(page.getByText("Panel")).toHaveCount(0);
});

test("should position itself against its anchor", async ({ mount, page }) => {
  // ARRANGE — this is the part a DOM-less test could not cover at all: without
  // layout there are no boxes for Popper.js to place anything against.
  const component = await mount(AnchoredPopper, {
    props: { placement: "bottom" },
    slots: { default: "Panel" },
  });
  await component.getByRole("button", { name: "Toggle" }).click();

  // ASSERT
  const anchor = (await component.getByRole("button", { name: "Toggle" }).boundingBox())!;
  const popper = (await page.locator(".okkly-popper").boundingBox())!;
  expect(popper.y).toBeGreaterThanOrEqual(anchor.y + anchor.height);
  await expect(page.locator(".okkly-popper")).toHaveAttribute("data-popper-placement", "bottom");
});

test("should stay visible when transition is set", async ({ mount, page }) => {
  // ARRANGE — the transition machinery itself (in/onEnter/onExited through the
  // default slot's scope) is exercised end-to-end by Popover, which is built
  // on this. This only pins that `transition` does not stop it rendering.
  await mount(Popper, { props: { open: true, transition: true }, slots: { default: "Animated" } });

  // ASSERT
  await expect(page.getByText("Animated")).toBeVisible();
});
