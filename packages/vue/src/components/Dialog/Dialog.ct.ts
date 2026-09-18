import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import DialogFixture from "../../playwright/fixtures/DialogFixture.vue";
import Dialog from "./Dialog.vue";
import DialogTitle from "./DialogTitle.vue";
import DialogContent from "./DialogContent.vue";
import DialogActions from "./DialogActions.vue";
import DialogClose from "./DialogClose.vue";
import type { DialogMaxWidth } from "./Dialog.types";

const MAX_WIDTHS = ["xs", "sm", "md", "lg", "xl"] as const satisfies readonly DialogMaxWidth[];

const titleAndContent =
  '<h2 class="okkly-dialog__title">Delete this project?</h2>' +
  '<div class="okkly-dialog__content">This cannot be undone.</div>';

// Dialog portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 720, height: 440 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Dialog (max widths)",
    columns: MAX_WIDTHS,
    rows: ["default"],
    screenshotTarget: "page",
    component: Dialog,
    args: (column) => ({
      props: { open: true, maxWidth: column },
      slots: { default: titleAndContent },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Dialog (layouts)",
    columns: ["bare", "with-close", "with-actions", "full-screen"],
    rows: ["default"],
    screenshotTarget: "page",
    component: DialogFixture,
    args: (column) => ({
      props: {
        defaultOpen: true,
        fullScreen: column === "full-screen",
        showClose: column === "with-close",
        showActions: column === "with-actions",
      },
    }),
  });
});

test("should render when open", async ({ mount, page }) => {
  // ARRANGE
  await mount(Dialog, { props: { open: true }, slots: { default: titleAndContent } });

  // ASSERT
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Delete this project?");
  await expect(page.getByRole("dialog")).toContainText("This cannot be undone.");
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(Dialog, { props: { open: false }, slots: { default: titleAndContent } });

  // ASSERT
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("should emit close on backdrop click and on Escape", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(Dialog, {
    props: { open: true },
    slots: { default: titleAndContent },
    on: { close: () => (closes += 1) },
  });

  // ACT — clicking beside the paper lands on the container, which sits above
  // the backdrop. That is the element MUI dismisses from too.
  await page.locator(".okkly-dialog__container").click({ position: { x: 4, y: 4 } });

  // ASSERT
  expect(closes).toBe(1);

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(() => expect(closes).toBe(2)).toPass();
});

test("should apply the maxWidth modifier", async ({ mount, page }) => {
  // ARRANGE
  await mount(Dialog, {
    props: { open: true, maxWidth: "lg" },
    slots: { default: titleAndContent },
  });

  // ASSERT
  await expect(page.locator(".okkly-dialog")).toHaveClass(/okkly-dialog--max-width-lg/);
});

test("should not close when the click starts inside the paper", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(Dialog, {
    props: { open: true },
    slots: { default: titleAndContent },
    on: { close: () => (closes += 1) },
  });

  // ACT
  await page.getByText("This cannot be undone.").click();

  // ASSERT
  expect(closes).toBe(0);
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("should forward Modal props such as keepMounted", async ({ mount, page }) => {
  // ARRANGE
  await mount(Dialog, {
    props: { open: false, keepMounted: true },
    slots: { default: titleAndContent },
  });

  // ASSERT
  await expect(page.getByText("Delete this project?")).toBeAttached();
  await expect(page.locator(".okkly-modal")).toHaveClass(/okkly-modal--hidden/);
});

test("should apply the fullScreen modifier", async ({ mount, page }) => {
  // ARRANGE
  await mount(Dialog, {
    props: { open: true, fullScreen: true },
    slots: { default: titleAndContent },
  });

  // ASSERT
  await expect(page.locator(".okkly-dialog")).toHaveClass(/okkly-dialog--full-screen/);
});

test("should close through the DialogClose button", async ({ mount, page }) => {
  // ARRANGE
  await mount(DialogFixture, { props: { defaultOpen: true, showClose: true } });

  // ASSERT
  await expect(page.getByRole("dialog")).toBeVisible();

  // ACT
  await page.getByRole("button", { name: "Close" }).click();

  // ASSERT
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("should close through actions inside DialogActions", async ({ mount, page }) => {
  // ARRANGE
  await mount(DialogFixture, { props: { defaultOpen: true, showActions: true } });

  // ASSERT
  await expect(page.locator(".okkly-dialog__actions")).toBeVisible();

  // ACT
  await page.getByRole("button", { name: "Delete" }).click();

  // ASSERT
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("should report backdropClick and escapeKeyDown through the fixture", async ({
  mount,
  page,
}) => {
  const reasons: string[] = [];

  // ARRANGE
  const component = await mount(DialogFixture, {
    on: { closeReason: (reason: unknown) => reasons.push(reason as string) },
  });

  // ACT
  await component.getByRole("button", { name: "Toggle" }).click();
  await page.locator(".okkly-dialog__container").click({ position: { x: 4, y: 4 } });

  // ASSERT
  await expect(() => expect(reasons).toEqual(["backdropClick"])).toPass();

  // ACT
  await component.getByRole("button", { name: "Toggle" }).click();
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(() => expect(reasons).toEqual(["backdropClick", "escapeKeyDown"])).toPass();
});

test.describe("DialogTitle", () => {
  test("should render an h2 with its class and content", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(DialogTitle, { slots: { default: "Delete this project?" } });

    // ASSERT
    await expect(component).toHaveClass(/okkly-dialog__title/);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText("Delete this project?");
  });
});

test.describe("DialogContent", () => {
  test("should render its class and content", async ({ mount }) => {
    // ARRANGE
    const component = await mount(DialogContent, { slots: { default: "Body copy" } });

    // ASSERT
    await expect(component).toHaveClass(/okkly-dialog__content/);
    await expect(component).toHaveText("Body copy");
  });
});

test.describe("DialogActions", () => {
  test("should render its class and content", async ({ mount }) => {
    // ARRANGE
    const component = await mount(DialogActions, {
      slots: { default: '<button type="button">Cancel</button>' },
    });

    // ASSERT
    await expect(component).toHaveClass(/okkly-dialog__actions/);
    await expect(component.getByRole("button", { name: "Cancel" })).toBeVisible();
  });
});

test.describe("DialogClose", () => {
  test("should render a button labelled Close with an icon", async ({ mount, page }) => {
    // ARRANGE
    await mount(DialogClose);

    // ASSERT
    const button = page.getByRole("button", { name: "Close" });
    await expect(button).toHaveClass(/okkly-dialog__close/);
    await expect(button.locator("svg")).toBeAttached();
  });

  test("should emit a native click", async ({ mount, page }) => {
    let clicks = 0;

    // ARRANGE — `click` is not an emit: it falls through to the <button>, so
    // it is passed as the `onClick` listener prop rather than through `on`.
    // Not a declared prop either, hence the cast.
    await mount(DialogClose, { props: { onClick: () => (clicks += 1) } as never });

    // ACT
    await page.getByRole("button", { name: "Close" }).click();

    // ASSERT
    expect(clicks).toBe(1);
  });
});
