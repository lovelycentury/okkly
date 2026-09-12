import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Drawer } from "./Drawer";
import { Button } from "../Button/Button";
import type { DrawerAnchor } from "./Drawer";

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
    component: (column) => (
      <Drawer open anchor={column}>
        <div style={{ padding: "1rem" }}>Navigation panel</div>
      </Drawer>
    ),
  });
});

test("should render when open", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Drawer open anchor="right">
      <div>Drawer content</div>
    </Drawer>,
  );

  // ASSERT
  await expect(page.getByRole("dialog")).toContainText("Drawer content");
  await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--open/);
  await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--anchor-right/);
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Drawer open={false}>
      <div>Hidden</div>
    </Drawer>,
  );

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
});

test("should call onClose on backdrop click and on Escape", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(
    <Drawer open onClose={() => (closes += 1)}>
      <div>Panel</div>
    </Drawer>,
  );
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
  await mount(
    <Drawer open onClose={() => {}}>
      <Button>Inside</Button>
    </Drawer>,
  );

  // ASSERT
  await expect(page.getByRole("button", { name: "Inside" })).toBeFocused();
});

test("should stay mounted until the slide-out transition finishes", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <Drawer open onClose={() => {}}>
      <div>Drawer</div>
    </Drawer>,
  );

  // ASSERT
  await expect(page.getByText("Drawer")).toBeVisible();

  // ACT
  await component.update(
    <Drawer open={false} onClose={() => {}}>
      <div>Drawer</div>
    </Drawer>,
  );

  // ASSERT — it unmounts on its own once the real CSS transition ends, which is
  // something jsdom could only fake with a synthetic transitionEnd event.
  await expect(page.getByText("Drawer")).toHaveCount(0);
});

test.describe("variant", () => {
  test("permanent renders regardless of open and ignores onClose triggers", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    let closes = 0;
    await mount(
      <Drawer variant="permanent" open={false} onClose={() => (closes += 1)}>
        <div>Sidebar</div>
      </Drawer>,
    );

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
    const component = await mount(
      <Drawer variant="persistent" anchor="left" open={false} onClose={() => {}}>
        <div>Sidebar</div>
      </Drawer>,
    );
    const root = page.locator(".okkly-drawer");

    // ASSERT — present but collapsed, not slid off-screen.
    await expect(page.getByText("Sidebar")).toBeAttached();
    await expect(root).not.toHaveClass(/okkly-drawer--open/);
    expect((await root.boundingBox())?.width).toBe(0);
    await expect(page.locator(".okkly-modal__backdrop")).toHaveCount(0);

    // ACT
    await component.update(
      <Drawer variant="persistent" anchor="left" open onClose={() => {}}>
        <div>Sidebar</div>
      </Drawer>,
    );

    // ASSERT — expands in place; no transitionend-driven unmount to wait on.
    await expect(root).toHaveClass(/okkly-drawer--open/);
    await expect(async () => {
      expect((await root.boundingBox())?.width).toBeGreaterThan(200);
    }).toPass();
  });
});
