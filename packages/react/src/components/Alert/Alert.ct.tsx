import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Alert } from "./Alert";
import { Button } from "../Button/Button";
import type { AlertSeverity, AlertVariant } from "./Alert";

const SEVERITIES = [
  "info",
  "success",
  "warning",
  "danger",
  "dante",
] as const satisfies readonly AlertSeverity[];
const VARIANTS = ["standard", "outlined", "filled"] as const satisfies readonly AlertVariant[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Alert (severities)",
    columns: SEVERITIES,
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (column, row) => (
      <Alert severity={column} variant={row} title="Heads up" style={{ width: "20rem" }}>
        A new version is available.
      </Alert>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Alert (slots)",
    columns: ["default", "action", "closable", "action-and-close"],
    rows: ["with-title", "message-only", "no-icon"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Alert
        severity="warning"
        title={row === "with-title" ? "Approaching your quota" : undefined}
        icon={row === "no-icon" ? false : undefined}
        action={
          column === "action" || column === "action-and-close" ? (
            <Button variant="ghost" size="small">
              Retry
            </Button>
          ) : undefined
        }
        onClose={column === "closable" || column === "action-and-close" ? () => {} : undefined}
        style={{ width: "22rem" }}
      >
        You have used 940 of 1,000 monthly builds.
      </Alert>
    ),
  });
});

test("should render the title and the message", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Alert title="Heads up" severity="info">
      A new version is available.
    </Alert>,
  );

  // ASSERT
  await expect(component).toHaveRole("alert");
  await expect(component.locator(".okkly-alert__title")).toHaveText("Heads up");
  await expect(component.locator(".okkly-alert__message")).toHaveText(
    "A new version is available.",
  );
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Alert title="Info">Message</Alert>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-alert/);
  await expect(component).not.toHaveClass(
    /okkly-alert--(success|warning|danger|dante|outlined|filled)/,
  );
});

test("should apply the severity modifier only for non-default severities", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Alert severity="success">Saved</Alert>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--success/);

  // ACT
  await component.update(<Alert severity="info">Info</Alert>);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-alert--success/);
});

test("should apply variant modifiers for outlined and filled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Alert variant="outlined">Outline</Alert>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--outlined/);

  // ACT
  await component.update(<Alert variant="filled">Filled</Alert>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--filled/);

  // ACT
  await component.update(<Alert variant="standard">Standard</Alert>);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-alert--(outlined|filled)/);
});

test("should hide the icon when icon is false", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Alert icon={false}>No icon</Alert>);

  // ASSERT
  await expect(component.locator(".okkly-alert__icon")).toHaveCount(0);
});

test("should render the action and close controls", async ({ mount }) => {
  const clicks: string[] = [];

  // ARRANGE
  const component = await mount(
    <Alert
      title="Alert"
      action={
        <button type="button" onClick={() => clicks.push("undo")}>
          Undo
        </button>
      }
      onClose={() => clicks.push("close")}
    >
      Message
    </Alert>,
  );

  // ACT
  await component.getByRole("button", { name: "Undo" }).click();
  await component.getByRole("button", { name: "Close" }).click();

  // ASSERT
  expect(clicks).toEqual(["undo", "close"]);
});
