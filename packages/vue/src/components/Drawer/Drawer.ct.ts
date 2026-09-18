import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import DrawerWithButtonChild from "../../playwright/fixtures/DrawerWithButtonChild.vue";
import DrawerWithStateProbe from "../../playwright/fixtures/DrawerWithStateProbe.vue";
import Drawer from "./Drawer.vue";
import type { DrawerAnchor } from "./Drawer.types";

const ANCHORS = ["left", "right", "top", "bottom"] as const satisfies readonly DrawerAnchor[];

// Drawer portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 640, height: 400 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Drawer (anchors)",
    columns: ANCHORS,
    rows: ["default"],
    screenshotTarget: "page",
    component: Drawer,
    args: (column) => ({
      props: { open: true, anchor: column } as never,
      slots: { default: `<div style="padding: 1rem">Navigation panel</div>` },
    }),
  });
});

test("should render when open", async ({ mount, page }) => {
  // ARRANGE
  await mount(Drawer, {
    props: { open: true, anchor: "right" } as never,
    slots: { default: "Drawer content" },
  });

  // ASSERT
  await expect(page.getByRole("dialog")).toContainText("Drawer content");
  await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--open/);
  await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--anchor-right/);
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(Drawer, {
    props: { open: false } as never,
    slots: { default: "Hidden" },
  });

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
});

test("should emit close on backdrop click and on Escape", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(Drawer, {
    props: { open: true, onClose: () => (closes += 1) } as never,
    slots: { default: "Panel" },
  });
  const backdrop = page.locator(".okkly-modal__backdrop");

  // ASSERT — the backdrop belongs to Modal and is a plain div, not a labelled
  // button. A scrim is not a control, and a focusable one put "Close drawer"
  // first in the tab order of every drawer in the app.
  expect(await backdrop.evaluate((element) => element.tagName)).toBe("DIV");

  // ACT — the drawer is anchored right, so the paper covers the right half of
  // the scrim. Aim at the exposed left side.
  await backdrop.click({ position: { x: 80, y: 200 } });

  // ASSERT
  expect(closes).toBe(1);

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(() => expect(closes).toBe(2)).toPass();
});

test("should trap focus inside the paper", async ({ mount, page }) => {
  // ARRANGE
  await mount(DrawerWithButtonChild);

  // ASSERT
  await expect(page.getByRole("button", { name: "Inside" })).toBeFocused();
});

test("should stay mounted until the slide-out transition finishes", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Drawer, {
    props: { open: true, onClose: () => {} } as never,
    slots: { default: "Drawer" },
  });

  // ASSERT
  await expect(page.getByText("Drawer")).toBeVisible();

  // ACT
  await component.update({ props: { open: false, onClose: () => {} } as never });

  // ASSERT — it unmounts on its own once the real CSS transition ends.
  await expect(page.getByText("Drawer")).toHaveCount(0);
});

test.describe("variant", () => {
  test("permanent renders regardless of open and ignores close triggers", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    let closes = 0;
    await mount(Drawer, {
      props: { variant: "permanent", open: false, onClose: () => (closes += 1) } as never,
      slots: { default: "Sidebar" },
    });

    // ASSERT — always in the DOM, no portal, no backdrop.
    await expect(page.getByText("Sidebar")).toBeVisible();
    await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--open/);
    await expect(page.locator(".okkly-modal__backdrop")).toHaveCount(0);

    // ACT
    await page.keyboard.press("Escape");

    // ASSERT — nothing to dismiss.
    expect(closes).toBe(0);
    await expect(page.getByText("Sidebar")).toBeVisible();
  });

  test("persistent stays mounted while closed and collapses instead of sliding off-screen", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    const component = await mount(Drawer, {
      props: { variant: "persistent", anchor: "left", open: false, onClose: () => {} } as never,
      slots: { default: "Sidebar" },
    });
    const root = page.locator(".okkly-drawer");

    // ASSERT — present but collapsed, not slid off-screen.
    await expect(page.getByText("Sidebar")).toBeAttached();
    await expect(root).not.toHaveClass(/okkly-drawer--open/);
    expect((await root.boundingBox())?.width).toBe(0);
    await expect(page.locator(".okkly-modal__backdrop")).toHaveCount(0);

    // ACT
    await component.update({
      props: { variant: "persistent", anchor: "left", open: true, onClose: () => {} } as never,
    });

    // ASSERT — expands in place; no transitionend-driven unmount to wait on.
    await expect(root).toHaveClass(/okkly-drawer--open/);
    await expect(async () => {
      expect((await root.boundingBox())?.width).toBeGreaterThan(200);
    }).toPass();
  });
});

test.describe("mini", () => {
  const rootWidth = async (page: import("@playwright/test").Page) =>
    Math.round((await page.locator(".okkly-drawer").boundingBox())?.width ?? Number.NaN);

  test("persistent should switch between closed, the short view and fully open", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    const component = await mount(Drawer, {
      props: {
        variant: "persistent",
        anchor: "left",
        open: true,
        mini: true,
        onClose: () => {},
      } as never,
      slots: { default: "Sidebar" },
    });
    const root = page.locator(".okkly-drawer");

    // ASSERT — short view: 4.5rem.
    await expect(root).toHaveClass(/okkly-drawer--mini/);
    await expect.poll(() => rootWidth(page)).toBe(72);

    // ACT
    await component.update({
      props: {
        variant: "persistent",
        anchor: "left",
        open: true,
        mini: false,
        onClose: () => {},
      } as never,
    });

    // ASSERT — fully open: 20rem.
    await expect(root).not.toHaveClass(/okkly-drawer--mini/);
    await expect.poll(() => rootWidth(page)).toBe(320);

    // ACT — `mini` does not keep a closed drawer showing.
    await component.update({
      props: {
        variant: "persistent",
        anchor: "left",
        open: false,
        mini: true,
        onClose: () => {},
      } as never,
    });

    // ASSERT
    await expect(root).not.toHaveClass(/okkly-drawer--mini/);
    await expect.poll(() => rootWidth(page)).toBe(0);
  });

  test("should clip a right rail toward its anchored edge", async ({ mount, page }) => {
    // ARRANGE
    await mount(Drawer, {
      props: {
        variant: "persistent",
        anchor: "right",
        open: true,
        mini: true,
        onClose: () => {},
      } as never,
      slots: { default: "Sidebar" },
    });
    const root = page.locator(".okkly-drawer");
    const paper = page.locator(".okkly-drawer__paper");

    // ASSERT — the paper's right edge lines up with the rail's, so the part
    // left showing is the one next to the screen edge.
    await expect.poll(() => rootWidth(page)).toBe(72);
    const rootBox = await root.boundingBox();
    const paperBox = await paper.boundingBox();
    expect(Math.round((paperBox?.x ?? 0) + (paperBox?.width ?? 0))).toBe(
      Math.round((rootBox?.x ?? 0) + (rootBox?.width ?? 0)),
    );
  });

  test("should be ignored outside the persistent variant", async ({ mount, page }) => {
    // ARRANGE
    await mount(Drawer, {
      props: { variant: "permanent", anchor: "left", mini: true } as never,
      slots: { default: "Sidebar" },
    });

    // ASSERT
    await expect(page.locator(".okkly-drawer")).not.toHaveClass(/okkly-drawer--mini/);
    await expect.poll(() => rootWidth(page)).toBe(320);
  });

  test("useDrawerState should report the drawer's state to its content", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    const component = await mount(DrawerWithStateProbe, {
      props: { variant: "persistent", anchor: "left", open: true, mini: true } as never,
    });

    // ASSERT
    await expect(page.getByTestId("drawer-state")).toHaveText("open mini persistent left");

    // ACT
    await component.update({
      props: { variant: "persistent", anchor: "left", open: true, mini: false } as never,
    });

    // ASSERT
    await expect(page.getByTestId("drawer-state")).toHaveText("open full persistent left");
  });
});
