import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import type {
  InlineActionColor,
  InlineActionFill,
  InlineActionSize,
  InlineActionState,
} from "./InlineAction";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
] as const satisfies readonly InlineActionColor[];
const FILLS = [
  "filled",
  "soft",
  "outline",
  "gradient",
  "glass",
] as const satisfies readonly InlineActionFill[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly InlineActionSize[];
const STATES = [
  "default",
  "filled",
  "success",
  "error",
] as const satisfies readonly InlineActionState[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "InlineAction (fills)",
    columns: FILLS,
    rows: SIZES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-inline-action fill="${column}" size="${row}" value="a@b.dev" />`,
  });

  executeMatrixScreenshotTest({
    name: "InlineAction (colors)",
    columns: COLORS,
    rows: STATES,
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-inline-action color="${column}" state="${row}" value="a@b.dev"${
        row === "error" ? ` message="That address doesn't look right"` : ""
      } />`,
  });

  executeMatrixScreenshotTest({
    name: "InlineAction (states)",
    columns: ["default", "loading", "readonly", "disabled"],
    rows: ["default", "focus-visible"],
    hooks: {
      beforeEach: async (_component, page, _column, row) => {
        if (row === "focus-visible") await page.keyboard.press("Tab");
      },
    },
    // The control carries no label of its own — naming the input is the
    // consumer's job, so the matrix does it the way a real caller would.
    component: (column) =>
      `<okkly-inline-action aria-label="Email address" value="a@b.dev"${
        column === "loading" ? ` loading action="Sending…"` : ""
      }${column === "readonly" ? " readonly" : ""}${column === "disabled" ? " disabled" : ""} />`,
  });
});

test("should render the input and the action button", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-inline-action placeholder="you@company.com" />`);

  // ASSERT
  await expect(component.getByPlaceholder("you@company.com")).toBeVisible();
  await expect(component.getByRole("button", { name: "Copy" })).toBeVisible();
  await expect(component).toHaveAttribute("class", "okkly-component okkly-inline-action");
});

test("should put id, name and aria-label on the native input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-inline-action id="email" name="email" aria-label="Email address" />`,
  );
  const textbox = component.getByRole("textbox", { name: "Email address" });

  // ASSERT
  await expect(textbox).toHaveAttribute("id", "email");
  await expect(textbox).toHaveAttribute("name", "email");
  await expect(component).not.toHaveAttribute("id");
  await expect(component).not.toHaveAttribute("aria-label");
});

test("should emit valueChange when typing", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-inline-action (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("abc");

  // ASSERT
  expect(await recordedEvents("value")).toEqual(["a", "ab", "abc"]);
  await expect(component.getByRole("textbox")).toHaveValue("abc");
});

test("should emit actionClick when the button is clicked", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-inline-action value="a@b.dev" (actionClick)="record('action')" />`,
  );

  // ACT
  await component.getByRole("button", { name: "Copy" }).click();

  // ASSERT
  expect(await recordedEvents("action")).toHaveLength(1);
});

test("should render a projected action icon in place of the arrow", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-inline-action>${MOCK_PLAYWRIGHT_ICON.replace("<svg", `<svg okklyInlineActionIcon class="glyph"`)}</okkly-inline-action>`,
  );

  // ASSERT
  await expect(component.locator(".okkly-inline-action__icon .glyph")).toBeVisible();
  await expect(component.locator(".okkly-inline-action__icon svg")).toHaveCount(1);
});

test.describe("effective state priority (disabled > loading > readonly > state)", () => {
  test("should let disabled win over an explicit state", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-inline-action value="a@b.dev" state="success" disabled />`,
    );

    // ASSERT
    await expect(component.getByRole("textbox")).toBeDisabled();
    await expect(component.getByRole("button", { name: "Copy" })).toBeDisabled();
    await expect(component).not.toHaveClass(/okkly-inline-action--state-success/);
  });

  test("should show a spinner instead of the action icon while loading", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-inline-action value="a@b.dev" loading action="Sending…" />`,
    );

    // ASSERT
    await expect(component.locator(".okkly-inline-action__spinner")).toBeAttached();
    await expect(component.locator(".okkly-inline-action__icon")).toHaveCount(0);
    await expect(component.getByRole("button", { name: "Sending…" })).toBeVisible();
  });

  test("should lock the button and mark the input read-only", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-inline-action value="a@b.dev" readonly />`);

    // ASSERT
    await expect(component.getByRole("textbox")).toHaveAttribute("readonly", "");
    await expect(component.getByRole("button", { name: "Copy (locked)" })).toBeDisabled();
    await expect(component).toHaveClass(/okkly-inline-action--state-readonly/);
  });

  test("should not emit actionClick while read-only", async ({ mountTemplate, recordedEvents }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-inline-action value="a@b.dev" readonly (actionClick)="record('action')" />`,
    );

    // ACT
    await component.getByRole("button").click({ force: true });

    // ASSERT
    expect(await recordedEvents("action")).toHaveLength(0);
  });
});

test("should show the message caption only when provided, tinted by state", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-inline-action value="a@b.dev" [state]="state().state" [message]="state().message" />`,
    { state: "default", message: undefined },
  );

  // ASSERT
  await expect(component.locator(".okkly-inline-action__message")).toHaveCount(0);
  await expect(component.getByRole("textbox")).not.toHaveAttribute("aria-describedby");

  // ACT
  await update({ state: "error", message: "That address doesn't look right" });

  // ASSERT
  const message = component.locator(".okkly-inline-action__message");
  await expect(message).toHaveText("That address doesn't look right");
  await expect(message).toHaveClass(/okkly-inline-action__message--error/);
  await expect(message.locator(".okkly-inline-action__message-icon")).toBeAttached();
  await expect(component.getByRole("textbox")).toHaveAccessibleDescription(
    "That address doesn't look right",
  );
});

test("should apply a color modifier only when color is explicitly set", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE — with no `color`, the control inherits the surrounding section tone.
  const component = await mountTemplate(
    `<okkly-inline-action value="a@b.dev" [color]="state().color" />`,
    { color: undefined },
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-inline-action--color-/);

  // ACT
  await update({ color: "dante" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-inline-action--color-dante/);
});

test("should apply a fill modifier only for non-filled fills", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-inline-action value="a@b.dev" [fill]="state().fill" />`,
    { fill: "glass" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-inline-action--fill-glass/);

  // ACT
  await update({ fill: "filled" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-inline-action--fill-/);
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-inline-action value="a@b.dev" [size]="state().size" />`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-inline-action--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-inline-action--(small|large)/);
});
