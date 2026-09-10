import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Snackbar } from "./Snackbar";
import { Button } from "../Button/Button";
import type { SnackbarAnchorHorizontal, SnackbarAnchorVertical } from "./Snackbar";

const VERTICALS = ["top", "bottom"] as const satisfies readonly SnackbarAnchorVertical[];
const HORIZONTALS = [
  "left",
  "center",
  "right",
] as const satisfies readonly SnackbarAnchorHorizontal[];

// The snackbar portals to `document.body`, so every cell photographs the
// viewport. A small one keeps the baselines readable.
test.use({ viewport: { width: 640, height: 360 } });

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Snackbar (placement)",
    columns: HORIZONTALS,
    rows: VERTICALS,
    screenshotTarget: "page",
    component: (column, row) => (
      <Snackbar
        open
        message="Draft saved"
        severity="success"
        autoHideDuration={0}
        anchorOrigin={{ vertical: row, horizontal: column }}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "Snackbar (severities)",
    columns: ["success", "info", "warning", "danger"],
    rows: ["plain", "with-action"],
    screenshotTarget: "page",
    component: (column, row) => (
      <Snackbar
        open
        autoHideDuration={0}
        severity={column as "success" | "info" | "warning" | "danger"}
        message="3 projects were archived"
        action={
          row === "with-action" ? (
            <Button variant="ghost" size="small">
              Undo
            </Button>
          ) : undefined
        }
      />
    ),
  });
});

test("should render the message when open", async ({ mount, page }) => {
  // ARRANGE — the snackbar portals to document.body, so it is queried off the
  // page rather than from inside the mount root.
  await mount(<Snackbar open message="Saved" severity="success" autoHideDuration={0} />);

  // ASSERT
  await expect(page.getByRole("alert")).toContainText("Saved");
});

test("should not render when closed", async ({ mount, page }) => {
  // ARRANGE
  await mount(<Snackbar open={false} message="Hidden" autoHideDuration={0} />);

  // ASSERT
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("should call onClose on Escape", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(
    <Snackbar open message="Dismiss me" onClose={() => (closes += 1)} autoHideDuration={0} />,
  );

  // ACT
  await page.keyboard.press("Escape");

  // ASSERT
  await expect(() => expect(closes).toBe(1)).toPass();
});

test("should auto hide after the given duration", async ({ mount }) => {
  let closes = 0;

  // ARRANGE
  await mount(
    <Snackbar open message="Auto hide" onClose={() => (closes += 1)} autoHideDuration={100} />,
  );

  // ASSERT
  await expect(() => expect(closes).toBe(1)).toPass();
});

test("should not auto hide when the duration is zero", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(
    <Snackbar open message="Persistent" onClose={() => (closes += 1)} autoHideDuration={0} />,
  );

  // ASSERT — still there after well past any plausible timer.
  await expect(page.getByRole("alert")).toBeVisible();
  await page.waitForTimeout(300);
  expect(closes).toBe(0);
  await expect(page.getByRole("alert")).toBeVisible();
});

test("should dismiss through its close button", async ({ mount, page }) => {
  let closes = 0;

  // ARRANGE
  await mount(<Snackbar open message="Saved" onClose={() => (closes += 1)} autoHideDuration={0} />);

  // ACT
  await page.getByRole("button", { name: "Close" }).click();

  // ASSERT
  expect(closes).toBe(1);
});
