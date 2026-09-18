import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import TooltipComponentTrigger from "../../playwright/fixtures/TooltipComponentTrigger.vue";
import TooltipIconButtonTrigger from "../../playwright/fixtures/TooltipIconButtonTrigger.vue";
import TooltipTriggerHandler from "../../playwright/fixtures/TooltipTriggerHandler.vue";
import Tooltip from "./Tooltip.vue";

// Tooltip renders a fragment — the cloned trigger plus a bubble portalled to
// `document.body` — so there is no single mount root to scope locators to.
// Everything is queried off the page, and each screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 480, height: 300 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Tooltip (placements)",
    columns: ["top", "bottom", "left", "right"],
    rows: ["with-arrow", "without-arrow"],
    screenshotTarget: "page",
    component: Tooltip,
    hooks: {
      beforeEach: async (_component, page) => {
        await page.getByRole("button").hover();
        await page.getByRole("tooltip").waitFor();
      },
    },
    args: (column, row) => ({
      props: {
        title: "Copy to clipboard",
        placement: column,
        arrow: row === "with-arrow",
        enterDelay: 0,
        style: "display: grid; place-items: center; width: 480px; height: 300px",
      } as never,
      slots: { default: `<button type="button">Hover</button>` },
    }),
  });
});

test("should render only the trigger while closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: { title: "Hint" } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });

  // ASSERT
  await expect(page.getByRole("button", { name: "Hover" })).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should show on hover and hide on leave", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: { title: "Copied", enterDelay: 0, leaveDelay: 0 } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });

  // ACT
  await page.getByRole("button", { name: "Hover" }).hover();

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveText("Copied");

  // ACT — move the pointer well clear of both the trigger and the bubble.
  await page.mouse.move(5, 290);

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should open on focus and close on blur", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: { title: "Keyboard reachable" } as never,
    slots: { default: `<button type="button">Focus me</button>` },
  });
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

test("should describe its trigger while open", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: { title: "Saved", enterDelay: 0 } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });
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

test("should name a trigger that has no name of its own", async ({ mount }) => {
  // ARRANGE — an icon button used to be announced as a bare "button": all the
  // tooltip contributed was `aria-describedby`, and only while it was open. The
  // name has to be there before anyone hovers.
  const component = await mount(TooltipIconButtonTrigger, {
    props: { title: "Settings" },
  });
  const trigger = component.getByRole("button");

  // ASSERT
  await expect(trigger).toHaveAccessibleName("Settings");
  await expect(trigger).toHaveAttribute("aria-label", "Settings");
  await expect(trigger).not.toHaveAttribute("aria-describedby");
});

test("should leave a trigger that already has a name alone", async ({ mount, page }) => {
  // ARRANGE — renaming it to the tooltip's words would break "label in name":
  // the user says "click Publish" and the control is no longer called that.
  await mount(Tooltip, {
    props: { title: "Makes your edits public" } as never,
    slots: { default: `<button type="button">Publish</button>` },
  });

  // ASSERT
  await expect(page.getByRole("button", { name: "Publish" })).not.toHaveAttribute("aria-label");
});

test("should anchor to a component trigger, not just a plain element", async ({ mount, page }) => {
  // ARRANGE — a `<Button>` trigger's cloned vnode ref resolves to its
  // component *instance*, not its DOM node; the anchor has to unwrap `$el`
  // from that instance, or the tooltip silently anchors to nothing and
  // renders in the document's top-left corner instead of by the trigger.
  const component = await mount(TooltipComponentTrigger);
  const trigger = component.getByRole("button", { name: "Hover" });
  const tooltip = page.getByRole("tooltip");

  // ASSERT — the trigger keeps its own text as its accessible name...
  await expect(trigger).toHaveAccessibleName("Hover");
  await expect(trigger).not.toHaveAttribute("aria-label");

  // ...and the tooltip lands next to the trigger's real bounding box, not at
  // the viewport origin.
  const triggerBox = (await trigger.boundingBox())!;
  const tooltipBox = (await tooltip.boundingBox())!;
  expect(Math.abs(tooltipBox.x - triggerBox.x)).toBeLessThan(triggerBox.width + 100);
  expect(tooltipBox.y).toBeGreaterThan(20);
});

test("should describe rather than name when asked to", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TooltipIconButtonTrigger, {
    props: { title: "Settings", describeChild: true, ariaLabel: "Open settings" },
  });

  // ASSERT
  await expect(component.getByRole("button")).toHaveAccessibleName("Open settings");
});

test("should support a controlled open state", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Tooltip, {
    props: { title: "Controlled", open: false, disableHoverListener: true } as never,
    slots: { default: `<button type="button">Open</button>` },
  });

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);

  // ACT
  await component.update({
    props: { title: "Controlled", open: true, disableHoverListener: true } as never,
  });

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();
});

test("should render an arrow by default and drop it on request", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Tooltip, {
    props: { title: "With", enterDelay: 0, open: true } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });

  // ASSERT
  await expect(page.locator(".okkly-tooltip__arrow")).toBeAttached();

  // ACT
  await component.update({
    props: { title: "Without", enterDelay: 0, arrow: false, open: true } as never,
  });

  // ASSERT
  await expect(page.locator(".okkly-tooltip__arrow")).toHaveCount(0);
});

/** An empty title renders nothing at all, as in MUI. */
test("should stay closed when the title is empty", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: { title: "", open: true } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should honour disableHoverListener and disableFocusListener", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: {
      title: "Never",
      enterDelay: 0,
      disableHoverListener: true,
      disableFocusListener: true,
    } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });
  const trigger = page.getByRole("button", { name: "Hover" });

  // ACT
  await trigger.hover();
  await trigger.focus();

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should fire open and close events", async ({ mount, page }) => {
  const events: string[] = [];

  // ARRANGE
  await mount(Tooltip, {
    props: {
      title: "Events",
      enterDelay: 0,
      leaveDelay: 0,
      onOpen: () => events.push("open"),
      onClose: () => events.push("close"),
    } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });

  // ACT
  await page.getByRole("button", { name: "Hover" }).hover();

  // ASSERT
  await expect(() => expect(events).toContain("open")).toPass();

  // ACT
  await page.mouse.move(5, 290);

  // ASSERT
  await expect(() => expect(events).toContain("close")).toPass();
});

/**
 * The trip from trigger to bubble crosses a gap that belongs to neither, so
 * leaving the trigger always schedules a close. Arriving in the bubble has to
 * cancel it, or an interactive tooltip can never actually be reached.
 */
test("should stay open when the pointer moves into it", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: { title: "Reach me", enterDelay: 0, placement: "bottom" } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });
  await page.getByRole("button", { name: "Hover" }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();

  // ACT — a real pointer journey across the gap and into the bubble.
  await page.locator(".okkly-tooltip").hover();
  await page.waitForTimeout(250);

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();
});

test("should close once the pointer leaves the tooltip too", async ({ mount, page }) => {
  // ARRANGE
  await mount(Tooltip, {
    props: { title: "Reach me", enterDelay: 0, leaveDelay: 0, placement: "bottom" } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });
  await page.getByRole("button", { name: "Hover" }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.locator(".okkly-tooltip").hover();

  // ACT
  await page.mouse.move(5, 290);

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should take pointer events only when interactive", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Tooltip, {
    props: { title: "Interactive", enterDelay: 0, open: true } as never,
    slots: { default: `<button type="button">Hover</button>` },
  });

  // ASSERT
  await expect(page.locator(".okkly-tooltip")).toHaveClass(/okkly-tooltip--interactive/);

  // ACT
  await component.update({
    props: { title: "Plain", enterDelay: 0, interactive: false, open: true } as never,
  });

  // ASSERT
  await expect(page.locator(".okkly-tooltip")).not.toHaveClass(/okkly-tooltip--interactive/);
  await expect(page.locator(".okkly-tooltip")).toHaveCSS("pointer-events", "none");
});

test("should keep the trigger's own handlers working", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(TooltipTriggerHandler);

  // ACT
  await page.getByRole("button", { name: "Hover" }).hover();

  // ASSERT
  await expect(component.getByTestId("enter-count")).toHaveText("1");
});
