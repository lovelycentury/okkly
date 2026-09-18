import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Alert from "./Alert.vue";
import type { AlertSeverity, AlertVariant } from "./Alert.types";

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
    component: Alert,
    args: (column, row) => ({
      props: { severity: column, variant: row, style: "width: 20rem" } as never,
      slots: { title: "Heads up", default: "A new version is available." },
    }),
  });

  executeMatrixScreenshotTest({
    name: "Alert (slots)",
    columns: ["default", "action", "closable", "action-and-close"],
    rows: ["with-title", "message-only", "no-icon"],
    fastNoIsolation: true,
    component: Alert,
    args: (column, row) => ({
      props: {
        severity: "warning",
        icon: row === "no-icon" ? false : undefined,
        style: "width: 22rem",
        onClose: column === "closable" || column === "action-and-close" ? () => {} : undefined,
      } as never,
      slots: {
        ...(row === "with-title" ? { title: "Approaching your quota" } : {}),
        default: "You have used 940 of 1,000 monthly builds.",
        ...(column === "action" || column === "action-and-close"
          ? { action: `<button type="button">Retry</button>` }
          : {}),
      },
    }),
  });
});

test("should render the title and the message", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Alert, {
    props: { severity: "info" } as never,
    slots: { title: "Heads up", default: "A new version is available." },
  });

  // ASSERT
  await expect(component).toHaveRole("alert");
  await expect(component.locator(".okkly-alert__title")).toHaveText("Heads up");
  await expect(component.locator(".okkly-alert__message")).toHaveText(
    "A new version is available.",
  );
});

test("should apply the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Alert, {
    slots: { title: "Info", default: "Message" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-alert/);
  await expect(component).not.toHaveClass(
    /okkly-alert--(success|warning|danger|dante|outlined|filled)/,
  );
});

test("should apply the severity modifier only for non-default severities", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Alert, {
    props: { severity: "success" } as never,
    slots: { default: "Saved" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--success/);

  // ACT
  await component.update({ props: { severity: "info" } as never });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-alert--success/);
});

test("should apply variant modifiers for outlined and filled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Alert, {
    props: { variant: "outlined" } as never,
    slots: { default: "Outline" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--outlined/);

  // ACT
  await component.update({ props: { variant: "filled" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-alert--filled/);

  // ACT
  await component.update({ props: { variant: "standard" } as never });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-alert--(outlined|filled)/);
});

test("should render the default severity icon when icon is unset", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Alert, { slots: { default: "Message" } });

  // ASSERT
  await expect(component.locator(".okkly-alert__icon")).toHaveCount(1);
  await expect(component.locator(".okkly-alert__icon .okkly-severity-icon")).toBeAttached();
});

test("should hide the icon when icon is false", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Alert, {
    props: { icon: false } as never,
    slots: { default: "No icon" },
  });

  // ASSERT
  await expect(component.locator(".okkly-alert__icon")).toHaveCount(0);
});

test("should render the action slot and a working close button", async ({ mount }) => {
  const clicks: string[] = [];

  // ARRANGE
  const component = await mount(Alert, {
    props: { onClose: () => clicks.push("close") } as never,
    slots: {
      title: "Alert",
      default: "Message",
      action: `<button type="button">Undo</button>`,
    },
  });

  // ASSERT — the action slot renders as-is, next to the close button.
  await expect(component.getByRole("button", { name: "Undo" })).toBeVisible();

  // ACT
  await component.getByRole("button", { name: "Close" }).click();

  // ASSERT
  expect(clicks).toEqual(["close"]);
});
