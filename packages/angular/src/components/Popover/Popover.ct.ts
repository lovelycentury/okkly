import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { PopperPlacement } from "../Popper/Popper";

const PLACEMENTS = ["top", "bottom", "left", "right"] as const satisfies readonly PopperPlacement[];

// Popover portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 520, height: 320 } });

/**
 * The counterpart of `@okkly/react`'s `AnchoredPopover` fixture: a trigger that
 * toggles the harness's own `state`, and a popover anchored to it. `close`
 * flips the state back and records the reason, so the trigger stays a plain
 * toggle — exactly what a consumer writes.
 */
const anchoredPopover = (attributes = "", content = "Panel") => `
  <div style="display: grid; place-items: center; width: 520px; height: 320px">
    <button #trigger type="button" (click)="state.set({ open: !state().open })">
      <span>Toggle</span>
    </button>
    <okkly-popover
      [open]="!!state().open"
      [anchorEl]="trigger"
      (close)="record('close', $event.reason); state.set({ open: false })"
      ${attributes}
    >${content}</okkly-popover>
  </div>`;

/** A popover with no trigger at all, anchored to a fixed point in the viewport. */
const positionedPopover = (attributes = "", content = "Panel") => `
  <okkly-popover
    [open]="state().open !== false"
    [anchorPosition]="{ top: 80, left: 80 }"
    (close)="record('close', $event.reason)"
    ${attributes}
  >${content}</okkly-popover>`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Popover (placements)",
    columns: PLACEMENTS,
    rows: ["default"],
    screenshotTarget: "page",
    hooks: {
      beforeEach: async (component) => {
        await component.getByRole("button", { name: "Toggle" }).click();
      },
    },
    component: (column) => anchoredPopover(`placement="${column}"`, "A filter panel"),
  });
});

test("should render when open with an anchorPosition", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(positionedPopover("", "Panel content"));

  // ASSERT
  await expect(page.getByText("Panel content")).toBeVisible();
  await expect(page.locator(".okkly-popover")).toHaveClass(/okkly-popover--open/);
  await expect(page.locator(".okkly-popover__paper")).toBeAttached();
});

test("should not render when closed", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(positionedPopover("", "Hidden"), { open: false });

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
});

test("should emit close on Escape with the escapeKeyDown reason", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  await mountTemplate(positionedPopover());

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(async () =>
    expect(await recordedEvents("close")).toEqual(["escapeKeyDown"]),
  ).toPass();
});

test("should close on a click away, reported as backdropClick", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  await mountTemplate(positionedPopover());

  // ACT — a corner of the page, well clear of the paper.
  await page.mouse.click(5, 300);

  // ASSERT
  await expect(async () =>
    expect(await recordedEvents("close")).toEqual(["backdropClick"]),
  ).toPass();
});

/**
 * Click-outside listens on mousedown, which lands before the anchor's own
 * click. Treating the anchor as "outside" therefore closed the popover and let
 * the trigger reopen it in the same gesture, so it never appeared to close at
 * all.
 */
test("should ignore a press on the anchor so the trigger stays a toggle", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(anchoredPopover(), { open: true });
  const trigger = component.getByRole("button", { name: "Toggle" });

  // ACT — the label is a child of the anchor, so this also covers the nested case.
  await trigger.click();

  // ASSERT — the toggle closed it itself; the click-away guard never fired.
  expect(await recordedEvents("close")).toEqual([]);
  await expect(page.getByText("Panel")).toHaveCount(0);

  // ACT — reopen, then press somewhere genuinely outside.
  await trigger.click();
  await expect(page.getByText("Panel")).toBeVisible();
  await page.mouse.click(5, 300);

  // ASSERT
  await expect(async () =>
    expect(await recordedEvents("close")).toEqual(["backdropClick"]),
  ).toPass();
});

test("should render an opt-in backdrop that closes on click", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  await mountTemplate(positionedPopover('[hideBackdrop]="false"'));
  const backdrop = page.locator(".okkly-popover__backdrop");

  // ASSERT
  await expect(backdrop).toBeAttached();

  // ACT
  await backdrop.click({ position: { x: 5, y: 300 } });

  // ASSERT
  await expect(async () =>
    expect(await recordedEvents("close")).toEqual(["backdropClick"]),
  ).toPass();
});

test("should have no backdrop by default", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(positionedPopover());

  // ASSERT
  await expect(page.locator(".okkly-popover__backdrop")).toHaveCount(0);
});

test("should render its paper surface, grown into place", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(positionedPopover("", "Grown"));
  const paper = page.locator(".okkly-popover__paper");

  // ASSERT
  await expect(paper).toBeAttached();
  await expect(page.getByText("Grown")).toBeVisible();
  // The Grow transition settles on the entered style rather than leaving the
  // paper at the scale it started from.
  await expect(async () =>
    expect(await paper.evaluate((element) => element.style.transform)).toBe("none"),
  ).toPass();
});

test("should stay mounted for the whole way out", async ({ mountTemplate, update, page }) => {
  // ARRANGE — closing runs the Grow exit on the paper, and the popper has to
  // stay positioned until that exit reports back that it has finished.
  await mountTemplate(positionedPopover('[transitionDuration]="200"'));
  const paper = page.locator(".okkly-popover__paper");
  await expect(paper).toBeAttached();

  // ACT
  await update({ open: false });

  // ASSERT — still there, on its way out.
  await expect(paper).toBeAttached();
  await expect(async () =>
    expect(await paper.evaluate((element) => element.style.opacity)).toBe("0"),
  ).toPass();

  // ASSERT — and gone once the exit has run its course.
  await expect(page.locator(".okkly-popover")).toHaveCount(0);
});

test("should stretch the paper to the anchor with matchAnchorWidth", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div style="display: grid; place-items: center; width: 520px; height: 320px">
      <button #trigger type="button" style="width: 300px">Toggle</button>
      <okkly-popover [open]="true" [anchorEl]="trigger" matchAnchorWidth>Panel</okkly-popover>
    </div>`,
  );

  // ASSERT
  const anchor = (await component.getByRole("button", { name: "Toggle" }).boundingBox())!;
  const popper = (await page.locator(".okkly-popover").boundingBox())!;
  expect(popper.width).toBeCloseTo(anchor.width, 0);
});
