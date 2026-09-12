import { expect, test } from "../../playwright/a11y";
import { ControlledSwipeableDrawer } from "../../playwright/fixtures/SwipeableDrawerFixtures";

test.use({ viewport: { width: 400, height: 400 } });

test("should open on an edge swipe past the hysteresis threshold", async ({ mount, page }) => {
  // ARRANGE
  await mount(<ControlledSwipeableDrawer anchor="left" />);

  // ACT — press inside the left edge strip and drag well past halfway.
  await page.mouse.move(5, 200);
  await page.mouse.down();
  await page.mouse.move(60, 200);
  await page.mouse.move(180, 200);
  await page.mouse.up();

  // ASSERT
  await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--open/);
  await expect(page.getByTestId("opens")).toHaveText("1");
});

test("should spring back closed on a short edge swipe", async ({ mount, page }) => {
  // ARRANGE
  await mount(<ControlledSwipeableDrawer anchor="left" />);

  // ACT — a drag that never crosses the hysteresis threshold. The pause before
  // release matters: a release logged immediately after the move would read as
  // an implausibly fast fling and open anyway, whatever the distance.
  await page.mouse.move(5, 200);
  await page.mouse.down();
  await page.mouse.move(30, 200);
  await page.waitForTimeout(150);
  await page.mouse.up();

  // ASSERT — `keepMounted` internally (the paper's own size has to stay
  // measurable for the next gesture) and the paper opts back into
  // `visibility: visible` so its own exit transition can play, so neither DOM
  // presence nor CSS visibility says "closed" here — the `--open` class (and
  // the transform it drives, sliding the paper off-screen) does.
  await expect(page.locator(".okkly-drawer")).not.toHaveClass(/okkly-drawer--open/);
  await expect(page.getByTestId("opens")).toHaveText("0");
});

test("should not react to a plain tap on the edge strip", async ({ mount, page }) => {
  // ARRANGE
  await mount(<ControlledSwipeableDrawer anchor="left" />);

  // ACT
  await page.mouse.move(5, 200);
  await page.mouse.down();
  await page.mouse.up();

  // ASSERT
  await expect(page.getByTestId("opens")).toHaveText("0");
});

test("should close on a drag past hysteresis while open", async ({ mount, page }) => {
  // ARRANGE
  await mount(<ControlledSwipeableDrawer anchor="left" />);
  await page.mouse.move(5, 200);
  await page.mouse.down();
  await page.mouse.move(180, 200);
  await page.mouse.up();
  await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--open/);

  // ACT — drag the open panel back toward the closed edge, past halfway of
  // its own 320px width, pausing before release so it reads as a deliberate
  // drag rather than a fling.
  await page.mouse.move(150, 200);
  await page.mouse.down();
  await page.mouse.move(50, 200);
  await page.mouse.move(-30, 200);
  await page.waitForTimeout(150);
  await page.mouse.up();

  // ASSERT
  await expect(page.locator(".okkly-drawer")).not.toHaveClass(/okkly-drawer--open/);
  await expect(page.getByTestId("closes")).toHaveText("1");
});

test("should disable the edge strip via disableSwipeToOpen", async ({ mount, page }) => {
  // ARRANGE
  await mount(<ControlledSwipeableDrawer anchor="left" disableSwipeToOpen />);

  // ASSERT
  await expect(page.locator(".okkly-swipeable-drawer__edge")).toHaveCount(0);

  // ACT — a drag starting where the edge strip would have been.
  await page.mouse.move(5, 200);
  await page.mouse.down();
  await page.mouse.move(180, 200);
  await page.mouse.up();

  // ASSERT — nothing was there to catch the gesture.
  await expect(page.getByTestId("opens")).toHaveText("0");
});

test("should track drag progress live before release", async ({ mount, page }) => {
  // ARRANGE
  await mount(<ControlledSwipeableDrawer anchor="left" />);
  const paper = page.locator(".okkly-drawer__paper");

  // ACT
  await page.mouse.move(5, 200);
  await page.mouse.down();
  await page.mouse.move(120, 200);

  // ASSERT — mid-drag, the paper sits somewhere between closed and open,
  // matching the finger rather than one of the two settled states.
  const matrix = await paper.evaluate((element) => getComputedStyle(element).transform);
  expect(matrix).not.toBe("none");
  const translateX = Number(matrix.match(/matrix\(([^,]+,){4}\s*([^,]+),/)?.[2]);
  expect(translateX).toBeLessThan(0);
  expect(translateX).toBeGreaterThan(-240);

  await page.mouse.up();
});
