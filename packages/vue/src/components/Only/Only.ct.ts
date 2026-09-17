import { expect, test } from "../../playwright/a11y";
import Only from "./Only.vue";

/**
 * `Only` is a viewport gate, so there is nothing to photograph — its whole
 * contract is "is the child in the DOM at this width". The tests resize the
 * real browser instead of stubbing `matchMedia`.
 *
 * Breakpoints come from the component itself: sm at 769px, md at 993px and
 * lg at 1441px.
 */

test("should render its slot when both bounds match", async ({ mount, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 850, height: 600 });
  const component = await mount(Only, {
    props: { from: "sm", to: "md" } as never,
    slots: { default: "Between sm and md" },
  });

  // ASSERT
  await expect(component).toHaveText("Between sm and md");
});

test("should render nothing when the viewport is below `from`", async ({ mount, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 600, height: 600 });
  await mount(Only, {
    props: { from: "sm", to: "md" } as never,
    slots: { default: "Between sm and md" },
  });

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should render nothing when the viewport is at or above `to`", async ({ mount, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 1100, height: 600 });
  await mount(Only, {
    props: { from: "sm", to: "md" } as never,
    slots: { default: "Between sm and md" },
  });

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});

test("should enforce only the lower bound when `to` is omitted", async ({ mount, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 1600, height: 600 });
  const component = await mount(Only, {
    props: { from: "lg" } as never,
    slots: { default: "lg and up" },
  });

  // ASSERT
  await expect(component).toHaveText("lg and up");
});

test("should always render when neither bound is given", async ({ mount, page }) => {
  // ARRANGE
  await page.setViewportSize({ width: 320, height: 600 });
  const component = await mount(Only, { slots: { default: "Always visible" } });

  // ASSERT
  await expect(component).toHaveText("Always visible");
});

test("should react to a viewport change after mounting", async ({ mount, page }) => {
  // ARRANGE — the media query listener is the point: this is what a static
  // snapshot could never exercise, because there is no real viewport to resize.
  await page.setViewportSize({ width: 1600, height: 600 });
  const component = await mount(Only, {
    props: { from: "lg" } as never,
    slots: { default: "lg and up" },
  });

  // ASSERT
  await expect(component).toBeVisible();

  // ACT
  await page.setViewportSize({ width: 500, height: 600 });

  // ASSERT
  await expect(page.locator("#root")).toBeEmpty();
});
