import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Icon } from "../Icon/Icon";

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
    hooks: {
      beforeEach: async (_component, page) => {
        await page.getByRole("button").hover();
        await page.getByRole("tooltip").waitFor();
      },
    },
    component: (column, row) => (
      <div style={{ display: "grid", placeItems: "center", width: "480px", height: "300px" }}>
        <Tooltip
          title="Copy to clipboard"
          placement={column as "top" | "bottom" | "left" | "right"}
          arrow={row === "with-arrow"}
          enterDelay={0}
        >
          <Button>Hover</Button>
        </Tooltip>
      </div>
    ),
  });
});

test("should render only the trigger while closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Tooltip title="Hint">
      <Button>Hover</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.getByRole("button", { name: "Hover" })).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should show on hover and hide on leave", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Tooltip title="Copied" enterDelay={0} leaveDelay={0}>
      <Button>Hover</Button>
    </Tooltip>,
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

test("should open on focus and close on blur", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Tooltip title="Keyboard reachable">
      <Button>Focus me</Button>
    </Tooltip>,
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

test("should describe its trigger while open", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Tooltip title="Saved" enterDelay={0}>
      <Button>Hover</Button>
    </Tooltip>,
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

test("should name a trigger that has no name of its own", async ({ mount, page }) => {
  // ARRANGE — an icon button used to be announced as a bare "button": all the
  // tooltip contributed was `aria-describedby`, and only while it was open. The
  // name has to be there before anyone hovers.
  await mount(
    <Tooltip title="Settings">
      <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} />
    </Tooltip>,
  );
  const trigger = page.getByRole("button");

  // ASSERT
  await expect(trigger).toHaveAccessibleName("Settings");
  await expect(trigger).toHaveAttribute("aria-label", "Settings");
  await expect(trigger).not.toHaveAttribute("aria-describedby");
});

test("should leave a trigger that already has a name alone", async ({ mount, page }) => {
  // ARRANGE — renaming it to the tooltip's words would break "label in name":
  // the user says "click Publish" and the control is no longer called that.
  await mount(
    <Tooltip title="Makes your edits public">
      <Button>Publish</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.getByRole("button", { name: "Publish" })).not.toHaveAttribute("aria-label");
});

test("should describe rather than name when asked to", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Tooltip title="Settings" describeChild>
      <IconButton icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} />} aria-label="Open settings" />
    </Tooltip>,
  );

  // ASSERT
  await expect(page.getByRole("button")).toHaveAccessibleName("Open settings");
});

test("should support a controlled open state", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <Tooltip title="Controlled" open={false} disableHoverListener>
      <Button>Open</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);

  // ACT
  await component.update(
    <Tooltip title="Controlled" open disableHoverListener>
      <Button>Open</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.getByRole("tooltip")).toBeVisible();
});

test("should render an arrow by default and drop it on request", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(
    <Tooltip title="With" enterDelay={0} open>
      <Button>Hover</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.locator(".okkly-tooltip__arrow")).toBeAttached();

  // ACT
  await component.update(
    <Tooltip title="Without" enterDelay={0} arrow={false} open>
      <Button>Hover</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.locator(".okkly-tooltip__arrow")).toHaveCount(0);
});

/** An empty title renders nothing at all, as in MUI. */
test("should stay closed when the title is empty", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Tooltip title="" open>
      <Button>Hover</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should honour disableHoverListener and disableFocusListener", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Tooltip title="Never" enterDelay={0} disableHoverListener disableFocusListener>
      <Button>Hover</Button>
    </Tooltip>,
  );
  const trigger = page.getByRole("button", { name: "Hover" });

  // ACT
  await trigger.hover();
  await trigger.focus();

  // ASSERT
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("should fire onOpen and onClose", async ({ mount, page }) => {
  const events: string[] = [];

  // ARRANGE
  await mount(
    <Tooltip
      title="Events"
      enterDelay={0}
      leaveDelay={0}
      onOpen={() => events.push("open")}
      onClose={() => events.push("close")}
    >
      <Button>Hover</Button>
    </Tooltip>,
  );

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
  await mount(
    <Tooltip title="Reach me" enterDelay={0} placement="bottom">
      <Button>Hover</Button>
    </Tooltip>,
  );
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
  await mount(
    <Tooltip title="Reach me" enterDelay={0} leaveDelay={0} placement="bottom">
      <Button>Hover</Button>
    </Tooltip>,
  );
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
  const component = await mount(
    <Tooltip title="Interactive" enterDelay={0} open>
      <Button>Hover</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.locator(".okkly-tooltip")).toHaveClass(/okkly-tooltip--interactive/);

  // ACT
  await component.update(
    <Tooltip title="Plain" enterDelay={0} interactive={false} open>
      <Button>Hover</Button>
    </Tooltip>,
  );

  // ASSERT
  await expect(page.locator(".okkly-tooltip")).not.toHaveClass(/okkly-tooltip--interactive/);
  await expect(page.locator(".okkly-tooltip")).toHaveCSS("pointer-events", "none");
});

test("should keep the trigger's own handlers working", async ({ mount, page }) => {
  let enters = 0;

  // ARRANGE
  await mount(
    <Tooltip title="Wrapped" enterDelay={0}>
      <Button onMouseEnter={() => (enters += 1)}>Hover</Button>
    </Tooltip>,
  );

  // ACT
  await page.getByRole("button", { name: "Hover" }).hover();

  // ASSERT
  await expect(() => expect(enters).toBe(1)).toPass();
});
