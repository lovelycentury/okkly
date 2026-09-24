import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column, row) =>
      `<okkly-alert severity="${column}" variant="${row}" title="Heads up" style="width: 20rem">A new version is available.</okkly-alert>`,
  });

  executeMatrixScreenshotTest({
    name: "Alert (slots)",
    columns: ["default", "action", "closable", "action-and-close"],
    rows: ["with-title", "message-only", "no-icon"],
    fastNoIsolation: true,
    component: (column, row) => {
      const title = row === "with-title" ? ` title="Approaching your quota"` : "";
      const icon = row === "no-icon" ? ` icon="false"` : "";
      const closable = column === "closable" || column === "action-and-close" ? " closable" : "";
      const action =
        column === "action" || column === "action-and-close"
          ? `<button okklyButton okklyAlertAction variant="ghost" size="small">Retry</button>`
          : "";
      return `<okkly-alert severity="warning"${title}${icon}${closable} style="width: 22rem">You have used 940 of 1,000 monthly builds.${action}</okkly-alert>`;
    },
  });
});

test("should render the title and the message", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-alert title="Heads up" severity="info">A new version is available.</okkly-alert>`,
  );

  // ASSERT
  await expect(component).toHaveRole("alert");
  await expect(component).not.toHaveAttribute("title");
  await expect(component.locator(".okkly-alert__title")).toHaveText("Heads up");
  await expect(component.locator(".okkly-alert__message")).toHaveText(
    "A new version is available.",
  );
});

test("should apply the default classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-alert title="Info">Message</okkly-alert>`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-alert");
});

test("should apply the severity modifier only for non-default severities", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-alert [severity]="state().severity">Saved</okkly-alert>`,
    { severity: "success" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--success/);

  // ACT
  await update({ severity: "info" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-alert--success/);
});

test("should apply variant modifiers for outlined and filled", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-alert [variant]="state().variant">Message</okkly-alert>`,
    { variant: "outlined" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--outlined/);

  // ACT
  await update({ variant: "filled" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--filled/);

  // ACT
  await update({ variant: "standard" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-alert--(outlined|filled)/);
});

test.describe("icon", () => {
  test("should show the severity's icon by default", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-alert severity="danger">Failed</okkly-alert>`);

    // ASSERT
    await expect(
      component.locator(".okkly-alert__icon .okkly-severity-icon--danger"),
    ).toBeAttached();
  });

  test("should hide the icon when icon is false", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-alert icon="false">No icon</okkly-alert>`);

    // ASSERT
    await expect(component.locator(".okkly-alert__icon")).toHaveCount(0);
  });

  test("should replace the severity icon with a projected one", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-alert><span okklyAlertIcon class="custom">🚀</span>Launched</okkly-alert>`,
    );

    // ASSERT
    await expect(component.locator(".okkly-alert__icon .custom")).toBeVisible();
    await expect(component.locator(".okkly-severity-icon")).toHaveCount(0);
    await expect(component.locator(".okkly-alert__message")).toHaveText("Launched");
  });
});

test("should collapse the message when nothing is projected", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-alert title="Title only" />`);

  // ASSERT
  await expect(component.locator(".okkly-alert__message")).toBeHidden();
});

test("should render the action and close controls", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-alert title="Alert" closable (close)="record('close')">
      Message
      <button okklyAlertAction type="button" (click)="record('undo')">Undo</button>
    </okkly-alert>`,
  );

  // ASSERT
  await expect(
    component.locator(".okkly-alert__action").getByRole("button", { name: "Undo" }),
  ).toBeVisible();

  // ACT
  await component.getByRole("button", { name: "Undo" }).click();
  await component.getByRole("button", { name: "Close" }).click();

  // ASSERT
  expect(await recordedEvents("undo")).toHaveLength(1);
  expect(await recordedEvents("close")).toHaveLength(1);
});

test("should render no close button unless closable", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-alert>Message</okkly-alert>`);

  // ASSERT
  await expect(component.getByRole("button", { name: "Close" })).toHaveCount(0);
});
