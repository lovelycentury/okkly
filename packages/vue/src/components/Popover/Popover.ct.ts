import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import AnchoredPopover from "../../playwright/fixtures/AnchoredPopover.vue";
import Popover from "./Popover.vue";

// Popover portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 320 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Popover (placements)",
    columns: ["top", "bottom", "left", "right"],
    rows: ["default"],
    screenshotTarget: "page",
    component: AnchoredPopover,
    hooks: {
      beforeEach: async (component) => {
        await component.getByRole("button", { name: "Toggle" }).click();
      },
    },
    args: (column) => ({
      props: { placement: column as "top" | "bottom" | "left" | "right" },
      slots: { default: "A filter panel" },
    }),
  });
});

test("should render when open with an anchorPosition", async ({ mount, page }) => {
  // ARRANGE
  await mount(Popover, {
    props: { open: true, anchorPosition: { top: 100, left: 100 } },
    slots: { default: "Panel content" },
  });

  // ASSERT
  await expect(page.getByText("Panel content")).toBeVisible();
  await expect(page.locator(".okkly-popover")).toHaveClass(/okkly-popover--open/);
  await expect(page.locator(".okkly-popover__paper")).toBeAttached();
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(Popover, {
    props: { open: false, anchorPosition: { top: 0, left: 0 } },
    slots: { default: "Hidden" },
  });

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
});

test("should emit close on Escape with the escapeKeyDown reason", async ({ mount, page }) => {
  const reasons: string[] = [];

  // ARRANGE
  await mount(Popover, {
    props: { open: true, anchorPosition: { top: 80, left: 80 } },
    slots: { default: "Panel" },
    on: { close: (_event: unknown, reason: unknown) => reasons.push(reason as string) },
  });

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(() => expect(reasons).toEqual(["escapeKeyDown"])).toPass();
});

test("should close on a click away, reported as backdropClick", async ({ mount, page }) => {
  const reasons: string[] = [];

  // ARRANGE
  await mount(Popover, {
    props: { open: true, anchorPosition: { top: 80, left: 80 } },
    slots: { default: "Panel" },
    on: { close: (_event: unknown, reason: unknown) => reasons.push(reason as string) },
  });

  // ACT — a corner of the page, well clear of the paper.
  await page.mouse.click(5, 300);

  // ASSERT
  await expect(() => expect(reasons).toEqual(["backdropClick"])).toPass();
});

/**
 * Click-outside listens on mousedown, which lands before the anchor's own
 * click. Treating the anchor as "outside" therefore closed the popover and let
 * the trigger reopen it in the same gesture, so it never appeared to close at
 * all.
 */
test("should ignore a press on the anchor so the trigger stays a toggle", async ({
  mount,
  page,
}) => {
  const reasons: string[] = [];

  // ARRANGE
  const component = await mount(AnchoredPopover, {
    props: { defaultOpen: true },
    slots: { default: "Panel" },
    on: { closeReason: (reason: unknown) => reasons.push(reason as string) },
  });

  // ACT — the label is a child of the anchor, so this also covers the nested case.
  await component.getByRole("button", { name: "Toggle" }).click();

  // ASSERT — the toggle closed it itself; the click-away guard never fired.
  expect(reasons).toEqual([]);
  await expect(page.getByText("Panel")).toHaveCount(0);

  // ACT — reopen, then press somewhere genuinely outside.
  await component.getByRole("button", { name: "Toggle" }).click();
  await expect(page.getByText("Panel")).toBeVisible();
  await page.mouse.click(5, 300);

  // ASSERT
  await expect(() => expect(reasons).toEqual(["backdropClick"])).toPass();
});

test("should render an opt-in backdrop that closes on click", async ({ mount, page }) => {
  const reasons: string[] = [];

  // ARRANGE
  await mount(Popover, {
    props: { open: true, anchorPosition: { top: 10, left: 10 }, hideBackdrop: false },
    slots: { default: "Panel" },
    on: { close: (_event: unknown, reason: unknown) => reasons.push(reason as string) },
  });
  const backdrop = page.locator(".okkly-popover__backdrop");

  // ASSERT
  await expect(backdrop).toBeAttached();

  // ACT
  await backdrop.click({ position: { x: 5, y: 300 } });

  // ASSERT
  await expect(() => expect(reasons).toEqual(["backdropClick"])).toPass();
});

test("should have no backdrop by default", async ({ mount, page }) => {
  // ARRANGE
  await mount(Popover, {
    props: { open: true, anchorPosition: { top: 10, left: 10 } },
    slots: { default: "Panel" },
  });

  // ASSERT
  await expect(page.locator(".okkly-popover__backdrop")).toHaveCount(0);
});

test("should render its paper surface", async ({ mount, page }) => {
  // ARRANGE
  await mount(Popover, {
    props: { open: true, anchorPosition: { top: 40, left: 40 } },
    slots: { default: "Grown" },
  });

  // ASSERT
  await expect(page.locator(".okkly-popover__paper")).toBeAttached();
  await expect(page.getByText("Grown")).toBeVisible();
});
