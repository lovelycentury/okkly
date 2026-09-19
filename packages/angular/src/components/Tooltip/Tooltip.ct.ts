import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { TooltipPlacement } from "./Tooltip";

const PLACEMENTS = [
  "top",
  "bottom",
  "left",
  "right",
] as const satisfies readonly TooltipPlacement[];

// The tooltip directive sits on the trigger and portals its bubble to
// `document.body`, so there is no single mount root to scope locators to.
// Everything is queried off the page, and each screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 480, height: 300 } });

const stage = (trigger: string) =>
  `<div style="display: grid; place-items: center; width: 480px; height: 300px">${trigger}</div>`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Tooltip (placements)",
    columns: PLACEMENTS,
    rows: ["with-arrow", "without-arrow"],
    screenshotTarget: "page",
    hooks: {
      beforeEach: async (_component, page) => {
        await page.getByRole("button").hover();
        await page.getByRole("tooltip").waitFor();
      },
    },
    component: (column, row) =>
      stage(`<button
        type="button"
        okklyTooltip="Copy to clipboard"
        okklyTooltipPlacement="${column}"
        [okklyTooltipArrow]="${row === "with-arrow"}"
        okklyTooltipEnterDelay="0"
      >Hover</button>`),
  });
});

test("should render only the trigger while closed", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(`<button type="button" okklyTooltip="Hint">Hover</button>`);

  // ASSERT
  await expect(page.getByRole("button", { name: "Hover" })).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should show on hover and hide on leave", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button type="button" okklyTooltip="Copied" okklyTooltipEnterDelay="0" okklyTooltipLeaveDelay="0">Hover</button>`,
    ),
  );

  // ACT
  await page.getByRole("button", { name: "Hover" }).hover();

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveText("Copied");

  // ACT — move the pointer well clear of both the trigger and the bubble.
  await page.mouse.move(5, 290);

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should open on focus and close on blur", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(`<button type="button" okklyTooltip="Keyboard reachable">Focus me</button>`),
  );
  const trigger = page.getByRole("button", { name: "Focus me" });

  // ACT
  await trigger.focus();

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();

  // ACT
  await trigger.blur();

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should not let a pending hover-open reopen it after a blur", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE — a pointer resting on the trigger (where CI's cursor starts) puts
  // an open on the clock for `enterDelay`. Focus and blur then settle the
  // matter within that window, so the stale timer must not fire afterwards.
  await mountTemplate(
    stage(`<button type="button" okklyTooltip="Keyboard reachable">Focus me</button>`),
  );
  const trigger = page.getByRole("button", { name: "Focus me" });

  // ACT
  await trigger.hover();
  await trigger.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await trigger.blur();

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should describe its trigger while open", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(`<button type="button" okklyTooltip="Saved" okklyTooltipEnterDelay="0">Hover</button>`),
  );
  const trigger = page.getByRole("button", { name: "Hover" });

  // ASSERT
  await expect(trigger).not.toHaveAttribute("aria-describedby");

  // ACT
  await trigger.hover();

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();
  const describedBy = await trigger.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.getByRole("tooltip")).toHaveAttribute("id", describedBy!);
});

test("should name a trigger that has no name of its own", async ({ mountTemplate, page }) => {
  // ARRANGE — an icon button used to be announced as a bare "button": all the
  // tooltip contributed was `aria-describedby`, and only while it was open. The
  // name has to be there before anyone hovers.
  await mountTemplate(
    stage(
      `<button type="button" okklyTooltip="Settings"><svg width="16" height="16"></svg></button>`,
    ),
  );
  const trigger = page.getByRole("button");

  // ASSERT
  await expect(trigger).toHaveAccessibleName("Settings");
  await expect(trigger).toHaveAttribute("aria-label", "Settings");
  await expect(trigger).not.toHaveAttribute("aria-describedby");
});

test("should leave a trigger that already has a name alone", async ({ mountTemplate, page }) => {
  // ARRANGE — renaming it to the tooltip's words would break "label in name":
  // the user says "click Publish" and the control is no longer called that.
  await mountTemplate(
    stage(`<button type="button" okklyTooltip="Makes your edits public">Publish</button>`),
  );

  // ASSERT
  await expect(page.getByRole("button", { name: "Publish" })).not.toHaveAttribute("aria-label");
});

test("should keep a trigger's own aria-label as its name", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button type="button" aria-label="Open settings" okklyTooltip="Settings"><svg width="16" height="16"></svg></button>`,
    ),
  );

  // ASSERT
  await expect(page.getByRole("button")).toHaveAccessibleName("Open settings");
});

test("should describe rather than name when asked to", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button type="button" okklyTooltip="Settings" okklyTooltipDescribeChild><svg width="16" height="16"></svg></button>`,
    ),
  );

  // ASSERT
  await expect(page.getByRole("button")).not.toHaveAttribute("aria-label");
});

test("should support a controlled open state", async ({ mountTemplate, update, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="Controlled"
        [okklyTooltipOpen]="!!state().open"
        okklyTooltipDisableHoverListener
      >Open</button>`,
    ),
    { open: false },
  );

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);

  // ACT
  await update({ open: true });

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();
});

test("should render an arrow by default and drop it on request", async ({
  mountTemplate,
  update,
  page,
}) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="With"
        [okklyTooltipOpen]="true"
        [okklyTooltipArrow]="!!state().arrow"
      >Hover</button>`,
    ),
    { arrow: true },
  );

  // ASSERT
  await expect(page.locator(".okkly-tooltip__arrow")).toBeAttached();

  // ACT
  await update({ arrow: false });

  // ASSERT
  await expect(page.locator(".okkly-tooltip__arrow")).toHaveCount(0);
  await expect(page.locator(".okkly-tooltip__popup")).toHaveClass(/okkly-tooltip__popup--no-arrow/);
});

/** An empty title renders nothing at all, as in MUI. */
test("should stay closed when the title is empty", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(`<button type="button" okklyTooltip="" [okklyTooltipOpen]="true">Hover</button>`),
  );

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should honour disableHoverListener and disableFocusListener", async ({
  mountTemplate,
  page,
}) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="Never"
        okklyTooltipEnterDelay="0"
        okklyTooltipDisableHoverListener
        okklyTooltipDisableFocusListener
      >Hover</button>`,
    ),
  );
  const trigger = page.getByRole("button", { name: "Hover" });

  // ACT
  await trigger.hover();
  await trigger.focus();

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should emit its open and close outputs", async ({ mountTemplate, page, recordedEvents }) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="Events"
        okklyTooltipEnterDelay="0"
        okklyTooltipLeaveDelay="0"
        (okklyTooltipOpened)="record('opened')"
        (okklyTooltipClosed)="record('closed')"
      >Hover</button>`,
    ),
  );

  // ACT
  await page.getByRole("button", { name: "Hover" }).hover();

  // ASSERT
  await expect(async () => expect(await recordedEvents("opened")).toHaveLength(1)).toPass();

  // ACT
  await page.mouse.move(5, 290);

  // ASSERT
  await expect(async () => expect(await recordedEvents("closed")).toHaveLength(1)).toPass();
});

test("should render rich content from a template title", async ({ mountTemplate, page }) => {
  // ARRANGE — React passes a `ReactNode` title; the Angular counterpart is a
  // `TemplateRef`, which is also what makes the tooltip label its trigger
  // through `aria-labelledby` rather than a flat `aria-label`.
  await mountTemplate(
    stage(
      `<ng-template #rich>Reachable — this <a href="#yes">link</a> can be clicked</ng-template>
       <button type="button" [okklyTooltip]="rich" [okklyTooltipOpen]="true">Hover</button>`,
    ),
  );
  const trigger = page.getByRole("button", { name: "Hover" });

  // ASSERT
  await expect(page.getByRole("tooltip").getByRole("link", { name: "link" })).toBeVisible();
  await expect(trigger).not.toHaveAttribute("aria-label");
});

/**
 * The trip from trigger to bubble crosses a gap that belongs to neither, so
 * leaving the trigger always schedules a close. Arriving in the bubble has to
 * cancel it, or an interactive tooltip can never actually be reached.
 */
test("should stay open when the pointer moves into it", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="Reach me"
        okklyTooltipEnterDelay="0"
        okklyTooltipPlacement="bottom"
      >Hover</button>`,
    ),
  );
  await page.getByRole("button", { name: "Hover" }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();

  // ACT — a real pointer journey across the gap and into the bubble.
  await page.locator(".okkly-tooltip").hover();
  await page.waitForTimeout(250);

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();
});

test("should close once the pointer leaves the tooltip too", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="Reach me"
        okklyTooltipEnterDelay="0"
        okklyTooltipLeaveDelay="0"
        okklyTooltipPlacement="bottom"
      >Hover</button>`,
    ),
  );
  await page.getByRole("button", { name: "Hover" }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.locator(".okkly-tooltip").hover();

  // ACT
  await page.mouse.move(5, 290);

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should take pointer events only when interactive", async ({
  mountTemplate,
  update,
  page,
}) => {
  // ARRANGE
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="Interactive"
        [okklyTooltipOpen]="true"
        [okklyTooltipInteractive]="!!state().interactive"
      >Hover</button>`,
    ),
    { interactive: true },
  );

  // ASSERT
  await expect(page.locator(".okkly-tooltip")).toHaveClass(/okkly-tooltip--interactive/);

  // ACT
  await update({ interactive: false });

  // ASSERT
  await expect(page.locator(".okkly-tooltip")).not.toHaveClass(/okkly-tooltip--interactive/);
  await expect(page.locator(".okkly-tooltip")).toHaveCSS("pointer-events", "none");
});

test("should keep the trigger's own handlers working", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE — the directive listens on the host, so a consumer's own binding
  // for the same event still runs.
  await mountTemplate(
    stage(
      `<button
        type="button"
        okklyTooltip="Hint"
        okklyTooltipEnterDelay="0"
        (mouseenter)="record('mouseenter')"
      >Hover</button>`,
    ),
  );

  // ACT
  await page.getByRole("button", { name: "Hover" }).hover();

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();
  expect(await recordedEvents("mouseenter")).toHaveLength(1);
});

test("should follow a flip with its arrow", async ({ mountTemplate, page }) => {
  // ARRANGE — asked for the top, but pinned against the top edge of the
  // viewport, so Popper.js flips it. `data-popper-placement` has to name where
  // it ended up, since that is what the arrow's CSS keys off.
  await mountTemplate(
    `<button
      type="button"
      style="position: fixed; top: 0; left: 200px"
      okklyTooltip="Flipped"
      okklyTooltipPlacement="top"
      [okklyTooltipOpen]="true"
    >Hover</button>`,
  );

  // ASSERT
  await expect(page.locator(".okkly-tooltip__popup")).toHaveAttribute(
    "data-popper-placement",
    "bottom",
  );
  await expect(page.locator(".okkly-tooltip__popup")).toHaveClass(/okkly-tooltip__popup--bottom/);
});
