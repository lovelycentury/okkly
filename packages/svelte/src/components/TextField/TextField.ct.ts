import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import TextField from "./TextField.svelte";
import type { TextFieldColor, TextFieldSize } from "./TextField.svelte";

const COLORS = [
  "primary",
  "secondary",
  "dante",
  "violet",
  "ember",
  "ice",
  "contrast",
] as const satisfies readonly TextFieldColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly TextFieldSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "TextField (states)",
    columns: ["default", "filled", "error", "disabled"],
    rows: ["default", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: TextField,
    args: (column) => ({
      props: {
        placeholder: "you@example.com",
        value: column === "filled" ? "hello@okkly.dev" : undefined,
        error: column === "error",
        disabled: column === "disabled",
      },
      slots: {
        label: "Email",
        ...(column === "error" ? { helperText: "That address looks wrong" } : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "TextField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required", "no-label"],
    // Isolated: the accent color only shows on a focused field, and a page can
    // focus one field at a time.
    hooks: {
      beforeEach: async (component, page) =>
        useFocusStateHooks({ component, page, state: "focus-visible" }),
    },
    component: TextField,
    args: (column, row) => ({
      props: {
        placeholder: "you@example.com",
        size: column,
        color: (COLORS as readonly string[]).includes(row) ? (row as TextFieldColor) : "primary",
        required: row === "required",
        hideLabel: row === "no-label",
      },
      slots: { label: "Email" },
    }),
  });
});

test("should render a labeled input linked by for/id", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, { slots: { label: "Email" } });

  // ASSERT
  const input = component.getByRole("textbox");
  await expect(input).toHaveAccessibleName("Email");
  const [forAttribute, id] = await Promise.all([
    component.locator("label").getAttribute("for"),
    input.getAttribute("id"),
  ]);
  expect(forAttribute).toBe(id);
});

test("should visually hide the label but keep it accessible", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { hideLabel: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component.locator(".okkly-text-field__label")).toHaveClass(
    /okkly-text-field__label--hidden/,
  );
  await expect(component.getByRole("textbox")).toHaveAccessibleName("Email");
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { size: "small" },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-field--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { color: "dante" },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-field--color-/);
});

test("should apply the error modifier and mark aria-invalid", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { error: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should apply the full-width modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { fullWidth: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--full-width/);
});

test("should render helperText and link it via aria-describedby", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    slots: { label: "Email", helperText: "We'll never share it" },
  });

  // ASSERT
  const describedBy = await component.getByRole("textbox").getAttribute("aria-describedby");
  await expect(component.locator(`#${describedBy}`)).toHaveText("We'll never share it");
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { disabled: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    props: { required: true },
    slots: { label: "Email" },
  });

  // ASSERT
  await expect(component.locator(".okkly-text-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});

test("should fire oninput as the user types", async ({ mount }) => {
  let changes = 0;

  // ARRANGE
  const component = await mount(TextField, {
    props: { oninput: () => (changes += 1) },
    slots: { label: "Email" },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("abc");

  // ASSERT
  expect(changes).toBe(3);
  await expect(component.getByRole("textbox")).toHaveValue("abc");
});
