import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Dialog, DialogActions, DialogClose, DialogContent, DialogTitle } from "./Dialog";
import { Button } from "../Button/Button";
import type { DialogMaxWidth } from "./Dialog";

const MAX_WIDTHS = ["xs", "sm", "md", "lg", "xl"] as const satisfies readonly DialogMaxWidth[];

// Dialog portals to `document.body`, so every screenshot cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 720, height: 440 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Dialog (max widths)",
    columns: MAX_WIDTHS,
    rows: ["default"],
    screenshotTarget: "page",
    component: (column) => (
      <Dialog open maxWidth={column}>
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogContent>This cannot be undone.</DialogContent>
      </Dialog>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Dialog (layouts)",
    columns: ["bare", "with-close", "with-actions", "full-screen"],
    rows: ["default"],
    screenshotTarget: "page",
    component: (column) => (
      <Dialog open fullScreen={column === "full-screen"} maxWidth="sm">
        {column === "with-close" && <DialogClose />}
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogContent>This cannot be undone.</DialogContent>
        {column === "with-actions" && (
          <DialogActions>
            <Button variant="ghost" size="small">
              Cancel
            </Button>
            <Button color="dante" size="small">
              Delete
            </Button>
          </DialogActions>
        )}
      </Dialog>
    ),
  });
});

test("should render when open", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Dialog open>
      <DialogTitle>Title</DialogTitle>
      <DialogContent>Body</DialogContent>
    </Dialog>,
  );

  // ASSERT
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Title");
  await expect(page.getByRole("dialog")).toContainText("Body");
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Dialog open={false}>
      <DialogTitle>Hidden</DialogTitle>
    </Dialog>,
  );

  // ASSERT
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("should call onClose on backdrop click and on Escape", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(
    <Dialog open onClose={() => (closes += 1)}>
      <DialogTitle>Close me</DialogTitle>
    </Dialog>,
  );

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
  await mount(
    <Dialog open maxWidth="lg">
      <DialogTitle>Wide</DialogTitle>
    </Dialog>,
  );

  // ASSERT
  await expect(page.locator(".okkly-dialog")).toHaveClass(/okkly-dialog--max-width-lg/);
});

test("should not close when the click starts inside the paper", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(
    <Dialog open onClose={() => (closes += 1)}>
      <DialogTitle>Stay open</DialogTitle>
    </Dialog>,
  );

  // ACT
  await page.getByText("Stay open").click();

  // ASSERT
  expect(closes).toBe(0);
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("should forward Modal props such as keepMounted", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Dialog open={false} keepMounted>
      <DialogTitle>Kept</DialogTitle>
    </Dialog>,
  );

  // ASSERT
  await expect(page.getByText("Kept")).toBeAttached();
  await expect(page.locator(".okkly-modal")).toHaveClass(/okkly-modal--hidden/);
});

test("should apply the fullScreen modifier", async ({ mount, page }) => {
  // ARRANGE
  await mount(
    <Dialog open fullScreen>
      <DialogTitle>Full</DialogTitle>
    </Dialog>,
  );

  // ASSERT
  await expect(page.locator(".okkly-dialog")).toHaveClass(/okkly-dialog--full-screen/);
});

test("should close through the DialogClose button", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  const component = await mount(
    <Dialog open onClose={() => (closes += 1)}>
      <DialogClose onClick={() => (closes += 1)} />
      <DialogTitle>Dialog</DialogTitle>
    </Dialog>,
  );

  // ACT
  await page.getByRole("button", { name: "Close" }).click();

  // ASSERT
  expect(closes).toBe(1);

  // ACT — the parent owns `open`, so closing is its job.
  await component.update(
    <Dialog open={false} onClose={() => (closes += 1)}>
      <DialogClose onClick={() => (closes += 1)} />
      <DialogTitle>Dialog</DialogTitle>
    </Dialog>,
  );

  // ASSERT
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
