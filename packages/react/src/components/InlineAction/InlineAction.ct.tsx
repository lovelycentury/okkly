import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { InlineAction } from "./InlineAction";
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
    component: (column, row) => <InlineAction fill={column} size={row} defaultValue="a@b.dev" />,
  });

  executeMatrixScreenshotTest({
    name: "InlineAction (colors)",
    columns: COLORS,
    rows: STATES,
    fastNoIsolation: true,
    component: (column, row) => (
      <InlineAction
        color={column}
        state={row}
        defaultValue="a@b.dev"
        message={row === "error" ? "That address doesn't look right" : undefined}
      />
    ),
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
    component: (column) => (
      <InlineAction
        aria-label="Email address"
        defaultValue="a@b.dev"
        loading={column === "loading"}
        readonly={column === "readonly"}
        disabled={column === "disabled"}
        action={column === "loading" ? "Sending…" : undefined}
      />
    ),
  });
});

test("should render the input and the action button", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<InlineAction placeholder="you@company.com" />);

  // ASSERT
  await expect(component.getByPlaceholder("you@company.com")).toBeVisible();
  await expect(component.getByRole("button", { name: "Copy" })).toBeVisible();
});

test("should fire onChange when typing", async ({ mount }) => {
  let changes = 0;

  // ARRANGE
  const component = await mount(<InlineAction onChange={() => (changes += 1)} />);

  // ACT
  await component.getByRole("textbox").pressSequentially("abc");

  // ASSERT
  expect(changes).toBe(3);
  await expect(component.getByRole("textbox")).toHaveValue("abc");
});

test("should fire onAction when the button is clicked", async ({ mount }) => {
  let actions = 0;

  // ARRANGE
  const component = await mount(
    <InlineAction defaultValue="a@b.dev" onAction={() => (actions += 1)} />,
  );

  // ACT
  await component.getByRole("button", { name: "Copy" }).click();

  // ASSERT
  expect(actions).toBe(1);
});

test.describe("effective state priority (disabled > loading > readonly > state)", () => {
  test("should let disabled win over an explicit state prop", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<InlineAction defaultValue="a@b.dev" state="success" disabled />);

    // ASSERT
    await expect(component.getByRole("textbox")).toBeDisabled();
    await expect(component.getByRole("button", { name: "Copy" })).toBeDisabled();
  });

  test("should show a spinner instead of the action icon while loading", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <InlineAction defaultValue="a@b.dev" loading action="Sending…" />,
    );

    // ASSERT
    await expect(component.locator(".okkly-inline-action__spinner")).toBeAttached();
    await expect(component.getByRole("button", { name: "Sending…" })).toBeVisible();
  });

  test("should lock the button and mark the input read-only", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<InlineAction defaultValue="a@b.dev" readonly />);

    // ASSERT
    await expect(component.getByRole("textbox")).toHaveAttribute("readonly", "");
    await expect(component.getByRole("button")).toBeDisabled();
  });

  test("should not fire onAction while read-only", async ({ mount }) => {
    let actions = 0;

    // ARRANGE
    const component = await mount(
      <InlineAction defaultValue="a@b.dev" readonly onAction={() => (actions += 1)} />,
    );

    // ACT
    await component.getByRole("button").click({ force: true });

    // ASSERT
    expect(actions).toBe(0);
  });
});

test("should show the message caption only when provided, tinted by state", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<InlineAction defaultValue="a@b.dev" />);

  // ASSERT
  await expect(component.locator(".okkly-inline-action__message")).toHaveCount(0);

  // ACT
  await component.update(
    <InlineAction defaultValue="a@b.dev" state="error" message="That address doesn't look right" />,
  );

  // ASSERT
  const message = component.locator(".okkly-inline-action__message");
  await expect(message).toHaveText("That address doesn't look right");
  await expect(message).toHaveClass(/okkly-inline-action__message--error/);
});

test("should apply a color modifier only when color is explicitly set", async ({ mount }) => {
  // ARRANGE — with no `color`, the control inherits the surrounding section tone.
  const component = await mount(<InlineAction defaultValue="a@b.dev" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-inline-action--color-/);

  // ACT
  await component.update(<InlineAction defaultValue="a@b.dev" color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-inline-action--color-dante/);
});

test("should apply a fill modifier only for non-filled fills", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<InlineAction defaultValue="a@b.dev" fill="glass" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-inline-action--fill-glass/);

  // ACT
  await component.update(<InlineAction defaultValue="a@b.dev" fill="filled" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-inline-action--fill-/);
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<InlineAction defaultValue="a@b.dev" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-inline-action--small/);

  // ACT
  await component.update(<InlineAction defaultValue="a@b.dev" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-inline-action--(small|large)/);
});
