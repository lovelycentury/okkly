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

test.describe("peek", () => {
  test("should leave peekSize pixels on screen while closed", async ({ mount, page }) => {
    // ARRANGE
    await mount(<ControlledSwipeableDrawer anchor="left" peekSize={40} disableDiscovery />);
    const paper = page.locator(".okkly-drawer__paper");

    // ASSERT — the paper's right edge sits 40px into the viewport.
    await expect
      .poll(async () => {
        const box = await paper.boundingBox();
        return box ? Math.round(box.x + box.width) : Number.NaN;
      })
      .toBe(40);
    await expect(page.locator(".okkly-drawer")).not.toHaveClass(/okkly-drawer--open/);
  });

  test("should play the discovery hint once: hidden, overshoot, then settle", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    await mount(<ControlledSwipeableDrawer anchor="left" peekSize={40} />);
    const paper = page.locator(".okkly-drawer__paper");
    const rightEdge = async () => {
      const box = await paper.boundingBox();
      return box ? box.x + box.width : Number.NaN;
    };

    // ASSERT — starts fully hidden, slides out past `peekSize`, settles back on it.
    expect(await rightEdge()).toBeLessThanOrEqual(1);
    await expect.poll(rightEdge, { intervals: [25] }).toBeGreaterThan(50);
    await expect.poll(async () => Math.round(await rightEdge())).toBe(40);
  });

  test("should open on a drag that starts on the peeking sliver", async ({ mount, page }) => {
    // ARRANGE
    await mount(<ControlledSwipeableDrawer anchor="left" peekSize={40} disableDiscovery />);

    // ACT — press on the visible sliver, past the edge strip it covers.
    await page.mouse.move(30, 200);
    await page.mouse.down();
    await page.mouse.move(120, 200);
    await page.mouse.move(260, 200);
    await page.mouse.up();

    // ASSERT
    await expect(page.locator(".okkly-drawer")).toHaveClass(/okkly-drawer--open/);
    await expect(page.getByTestId("opens")).toHaveText("1");
  });
});

test.describe("handle", () => {
  test("should sit on the inward edge and open on a drag from it", async ({ mount, page }) => {
    // ARRANGE
    await mount(
      <ControlledSwipeableDrawer anchor="left" peekSize={40} disableDiscovery showHandle />,
    );
    const handle = page.locator(".okkly-swipeable-drawer__handle");

    // ASSERT — a vertical bar for a side drawer, inside the visible sliver,
    // centred along the edge. The 8px inset is measured inside the paper's
    // 1px border on that edge, hence the extra pixel.
    const box = await handle.boundingBox();
    expect(box?.width).toBe(4);
    expect(box?.height).toBe(32);
    expect(Math.round((box?.x ?? 0) + (box?.width ?? 0))).toBe(40 - 1 - 8);
    expect(Math.round((box?.y ?? 0) + (box?.height ?? 0) / 2)).toBe(200);

    // ACT
    await page.mouse.move((box?.x ?? 0) + 2, 200);
    await page.mouse.down();
    await page.mouse.move(150, 200);
    await page.mouse.move(280, 200);
    await page.mouse.up();

    // ASSERT
    await expect(page.getByTestId("opens")).toHaveText("1");
  });

  test("should lie horizontally along a bottom sheet's top edge at handlePosition", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    await mount(
      <ControlledSwipeableDrawer
        anchor="bottom"
        peekSize={40}
        disableDiscovery
        showHandle
        handlePosition="start"
        handleLength={48}
        handleThickness={6}
        handleColor="rgb(255, 0, 0)"
      />,
    );
    const handle = page.locator(".okkly-swipeable-drawer__handle");
    const paper = page.locator(".okkly-drawer__paper");

    // ASSERT
    await expect
      .poll(async () => Math.round((await paper.boundingBox())?.y ?? Number.NaN))
      .toBe(400 - 40);
    const box = await handle.boundingBox();
    expect(box?.width).toBe(48);
    expect(box?.height).toBe(6);
    expect(Math.round(box?.x ?? 0)).toBe(16);
    // Inset measured inside the sheet's 1px top border.
    expect(Math.round(box?.y ?? 0)).toBe(400 - 40 + 1 + 8);
    await expect(handle).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("handleDragOnly should ignore the sliver and edge strip but not the handle", async ({
    mount,
    page,
  }) => {
    // ARRANGE
    await mount(
      <ControlledSwipeableDrawer
        anchor="left"
        peekSize={40}
        disableDiscovery
        showHandle
        handleDragOnly
      />,
    );

    // ASSERT — no edge strip to catch anything.
    await expect(page.locator(".okkly-swipeable-drawer__edge")).toHaveCount(0);

    // ACT — drag from the sliver, well away from the centred handle. Paused
    // before release, like the hysteresis tests above: release logged right
    // after the move can otherwise read as an implausibly fast fling.
    await page.mouse.move(20, 60);
    await page.mouse.down();
    await page.mouse.move(280, 60);
    await page.waitForTimeout(150);
    await page.mouse.up();

    // ASSERT
    await expect(page.getByTestId("opens")).toHaveText("0");

    // ACT — the same drag from the handle.
    const handle = page.locator(".okkly-swipeable-drawer__handle");
    await expect.poll(() => handle.boundingBox()).not.toBeNull();
    const box = await handle.boundingBox();
    await page.mouse.move((box?.x ?? 0) + 2, 200);
    await page.mouse.down();
    await page.mouse.move(280, 200);
    await page.waitForTimeout(150);
    await page.mouse.up();

    // ASSERT
    await expect(page.getByTestId("opens")).toHaveText("1");
  });
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
