import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Modal from "./Modal.vue";

// Modal portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 640, height: 400 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Modal (backdrop)",
    columns: ["with-backdrop", "hidden-backdrop"],
    rows: ["default"],
    screenshotTarget: "page",
    component: Modal,
    args: (column) => ({
      props: { open: true, hideBackdrop: column === "hidden-backdrop" },
      slots: {
        default: `<div style="padding: 1.5rem; border-radius: 12px; background: var(--okkly-bg-surface); border: 1px solid var(--okkly-border-subtle)">Your own dialog</div>`,
      },
    }),
  });
});

test("should portal its content to document.body when open", async ({ mount, page }) => {
  // ARRANGE
  await mount(Modal, { props: { open: true }, slots: { default: "<div>Body</div>" } });

  // ASSERT — portalled, so it lives outside the mount point Vue was handed.
  await expect(page.locator("#root")).toBeEmpty();
  await expect(page.locator("body > .okkly-modal")).toBeAttached();
  await expect(page.getByText("Body")).toBeVisible();
});

test("should render nothing when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(Modal, { props: { open: false }, slots: { default: "<div>Hidden</div>" } });

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
});

test("should keep content mounted but hidden with keepMounted", async ({ mount, page }) => {
  // ARRANGE
  await mount(Modal, {
    props: { open: false, keepMounted: true },
    slots: { default: "<div>Kept</div>" },
  });

  // ASSERT
  await expect(page.getByText("Kept")).toBeAttached();
  await expect(page.locator(".okkly-modal")).toHaveClass(/okkly-modal--hidden/);
});

test("should emit close on backdrop click and on Escape", async ({ mount, page }) => {
  const reasons: string[] = [];

  // ARRANGE
  await mount(Modal, {
    props: { open: true },
    slots: { default: "<div>Panel</div>" },
    on: { close: (_event: unknown, reason: unknown) => reasons.push(reason as string) },
  });

  // ACT
  await page.locator(".okkly-modal__backdrop").click();

  // ASSERT
  expect(reasons).toEqual(["backdropClick"]);

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(() => expect(reasons).toEqual(["backdropClick", "escapeKeyDown"])).toPass();
});

test("should honour disableEscapeKeyDown and hideBackdrop", async ({ mount, page }) => {
  const reasons: string[] = [];

  // ARRANGE
  await mount(Modal, {
    props: { open: true, disableEscapeKeyDown: true, hideBackdrop: true },
    slots: { default: "<div>Panel</div>" },
    on: { close: (_event: unknown, reason: unknown) => reasons.push(reason as string) },
  });

  // ASSERT
  await expect(page.locator(".okkly-modal__backdrop")).toHaveCount(0);

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  expect(reasons).toEqual([]);
});

test("should render inline when disablePortal is set", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(Modal, {
    props: { open: true, disablePortal: true },
    slots: { default: "<div>Inline</div>" },
  });

  // ASSERT — the modal is now inside the mount root itself rather than a child of body.
  await expect(component).toHaveClass(/okkly-modal/);
  await expect(page.locator("#root .okkly-modal")).toBeAttached();
  await expect(page.locator("body > .okkly-modal")).toHaveCount(0);
});

test("should move focus in on open and restore it on close", async ({ mount, page }) => {
  // ARRANGE — a real trigger outside the modal, so there is somewhere to go back to.
  await page.evaluate(() => {
    const trigger = document.createElement("button");
    trigger.id = "outside-trigger";
    trigger.textContent = "Trigger";
    document.body.append(trigger);
    trigger.focus();
  });

  const component = await mount(Modal, { props: { open: false } });

  // ACT
  await component.update({
    props: { open: true },
    slots: { default: `<button type="button">Inside</button>` },
  });

  // ASSERT
  await expect(page.getByRole("button", { name: "Inside" })).toBeFocused();

  // ACT
  await component.update({ props: { open: false } });

  // ASSERT
  await expect(page.locator("#outside-trigger")).toBeFocused();
});

test("should leave initial focus alone with disableAutoFocus", async ({ mount, page }) => {
  // ARRANGE
  await page.evaluate(() => {
    const trigger = document.createElement("button");
    trigger.id = "outside-trigger";
    trigger.textContent = "Trigger";
    document.body.append(trigger);
    trigger.focus();
  });

  // ACT
  await mount(Modal, {
    props: { open: true, disableAutoFocus: true },
    slots: { default: `<button type="button">Inside</button>` },
  });

  // ASSERT
  await expect(page.locator("#outside-trigger")).toBeFocused();
});

test("should apply backdropClass and still fire close on backdrop click", async ({
  mount,
  page,
}) => {
  let clicks = 0;

  // ARRANGE
  await mount(Modal, {
    props: { open: true, backdropClass: "custom" },
    slots: { default: "<div>Panel</div>" },
    on: { close: () => (clicks += 1) },
  });
  const backdrop = page.locator(".okkly-modal__backdrop");

  // ASSERT
  await expect(backdrop).toHaveClass(/custom/);

  // ACT
  await backdrop.click();

  // ASSERT
  expect(clicks).toBe(1);
});

test("should lock body scroll only while open and not disabled", async ({ mount, page }) => {
  const overflow = () => page.evaluate(() => document.body.style.overflow);

  // ARRANGE
  const component = await mount(Modal, {
    props: { open: true },
    slots: { default: "<div>Panel</div>" },
  });

  // ASSERT
  expect(await overflow()).toBe("hidden");

  // ACT
  await component.update({ props: { open: true, disableScrollLock: true } });

  // ASSERT
  expect(await overflow()).not.toBe("hidden");
});
