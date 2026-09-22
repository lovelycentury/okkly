import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

// Modal portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 640, height: 400 } });

const surface = `<div style="padding: 1.5rem; border-radius: 12px; background: var(--okkly-bg-surface); border: 1px solid var(--okkly-border-subtle)">Your own dialog</div>`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Modal (backdrop)",
    columns: ["with-backdrop", "hidden-backdrop"],
    rows: ["default"],
    screenshotTarget: "page",
    component: (column) =>
      `<okkly-modal open ${column === "hidden-backdrop" ? "hideBackdrop" : ""}>${surface}</okkly-modal>`,
  });
});

test("should portal its content to document.body when open", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(`<okkly-modal open><div>Body</div></okkly-modal>`);

  // ASSERT — portalled, so it lives outside the host the harness mounted into.
  await expect(page.locator("body > .okkly-modal")).toBeAttached();
  await expect(page.locator("#root .okkly-modal")).toHaveCount(0);
  await expect(page.getByText("Body")).toBeVisible();
});

test("should render nothing when closed", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(`<okkly-modal [open]="false"><div>Hidden</div></okkly-modal>`);

  // ASSERT
  await expect(page.getByText("Hidden")).toHaveCount(0);
});

test("should keep content mounted but hidden with keepMounted", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(`<okkly-modal [open]="false" keepMounted><div>Kept</div></okkly-modal>`);

  // ASSERT
  await expect(page.getByText("Kept")).toBeAttached();
  await expect(page.locator(".okkly-modal")).toHaveClass(/okkly-modal--hidden/);
  await expect(page.locator(".okkly-modal")).toHaveAttribute("aria-hidden", "true");
});

test("should emit close on backdrop click and on Escape", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  await mountTemplate(
    `<okkly-modal open (close)="record('close', $event.reason)"><div>Panel</div></okkly-modal>`,
  );

  // ACT
  await page.locator(".okkly-modal__backdrop").click();

  // ASSERT
  expect(await recordedEvents("close")).toEqual(["backdropClick"]);

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(async () =>
    expect(await recordedEvents("close")).toEqual(["backdropClick", "escapeKeyDown"]),
  ).toPass();
});

test("should honour disableEscapeKeyDown and hideBackdrop", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  await mountTemplate(
    `<okkly-modal open disableEscapeKeyDown hideBackdrop (close)="record('close', $event.reason)">
      <div>Panel</div>
    </okkly-modal>`,
  );

  // ASSERT
  await expect(page.locator(".okkly-modal__backdrop")).toHaveCount(0);

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  expect(await recordedEvents("close")).toEqual([]);
});

test("should render inline when disablePortal is set", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(`<okkly-modal open disablePortal><div>Inline</div></okkly-modal>`);

  // ASSERT — the modal is now inside the mount root itself rather than a child of body.
  await expect(page.locator("#root .okkly-modal")).toBeAttached();
  await expect(page.locator("body > .okkly-modal")).toHaveCount(0);
});

test("should move focus in on open and restore it on close", async ({
  mountTemplate,
  update,
  page,
}) => {
  // ARRANGE — a real trigger outside the modal, so there is somewhere to go back to.
  await mountTemplate(
    `<button #outside type="button" (click)="state.set({ open: true })">Trigger</button>
     <okkly-modal [open]="!!state().open"><button type="button">Inside</button></okkly-modal>`,
    { open: false },
  );
  const trigger = page.getByRole("button", { name: "Trigger" });

  // ACT
  await trigger.click();

  // ASSERT
  await expect(page.getByRole("button", { name: "Inside" })).toBeFocused();

  // ACT
  await update({ open: false });

  // ASSERT
  await expect(trigger).toBeFocused();
});

test("should leave initial focus alone with disableAutoFocus", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    `<button #outside type="button" (click)="state.set({ open: true })">Trigger</button>
     <okkly-modal [open]="!!state().open" disableAutoFocus>
       <button type="button">Inside</button>
     </okkly-modal>`,
    { open: false },
  );
  const trigger = page.getByRole("button", { name: "Trigger" });

  // ACT
  await trigger.click();

  // ASSERT
  await expect(trigger).toBeFocused();
});

test("should keep Tab inside the modal", async ({ mountTemplate, page }) => {
  // ARRANGE
  await mountTemplate(
    `<button type="button">Outside</button>
     <okkly-modal open>
       <button type="button">First</button>
       <button type="button">Last</button>
     </okkly-modal>`,
  );

  // ASSERT
  await expect(page.getByRole("button", { name: "First" })).toBeFocused();

  // ACT
  await page.keyboard.press("Tab");

  // ASSERT
  await expect(page.getByRole("button", { name: "Last" })).toBeFocused();

  // ACT — past the last one, so the trap has to wrap rather than let go.
  await page.keyboard.press("Tab");

  // ASSERT
  await expect(page.getByRole("button", { name: "First" })).toBeFocused();
});

test("should apply backdropClass and still fire close on backdrop click", async ({
  mountTemplate,
  page,
  recordedEvents,
}) => {
  // ARRANGE
  await mountTemplate(
    `<okkly-modal open backdropClass="custom" (close)="record('close', $event.reason)">
      <div>Panel</div>
    </okkly-modal>`,
  );
  const backdrop = page.locator(".okkly-modal__backdrop");

  // ASSERT
  await expect(backdrop).toHaveClass(/custom/);

  // ACT
  await backdrop.click();

  // ASSERT
  expect(await recordedEvents("close")).toHaveLength(1);
});

test("should lock body scroll only while open and not disabled", async ({
  mountTemplate,
  update,
  page,
}) => {
  const overflow = () => page.evaluate(() => document.body.style.overflow);

  // ARRANGE
  await mountTemplate(
    `<okkly-modal open [disableScrollLock]="!!state().unlock"><div>Panel</div></okkly-modal>`,
    { unlock: false },
  );

  // ASSERT
  expect(await overflow()).toBe("hidden");

  // ACT
  await update({ unlock: true });

  // ASSERT
  expect(await overflow()).not.toBe("hidden");
});
