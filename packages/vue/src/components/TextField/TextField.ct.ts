import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import TextField from "./TextField.vue";
import type { TextFieldColor, TextFieldSize } from "./TextField.vue";

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
        modelValue: column === "filled" ? "hello@okryshto.dev" : undefined,
        error: column === "error",
        disabled: column === "disabled",
      },
      slots: {
        label: "Email",
        ...(column === "error" ? { "helper-text": "That address looks wrong" } : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "TextField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required", "no-label"],
    fastNoIsolation: true,
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
  const component = await mount(TextField, { props: { size: "small" }, slots: { label: "Email" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--small/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-field--(small|large)/);
});

for (const color of COLORS.filter((c) => c !== "primary")) {
  test(`should apply the ${color} color modifier`, async ({ mount }) => {
    // ARRANGE
    const component = await mount(TextField, { props: { color }, slots: { label: "Email" } });

    // ASSERT
    await expect(component).toHaveClass(new RegExp(`okkly-text-field--color-${color}`));
  });
}

test("should apply no color modifier for the default primary color", async ({ mount }) => {
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
  const component = await mount(TextField, { props: { error: true }, slots: { label: "Email" } });

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

test("should render helper text and link it via aria-describedby", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextField, {
    slots: { label: "Email", "helper-text": "We'll never share it" },
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

test("should update the model as the user types", async ({ mount }) => {
  let changes = 0;
  let lastValue = "";

  // ARRANGE — `modelValue` is left unset so `defineModel` keeps its own local
  // state (an uncontrolled input, mirroring the React version); the listener
  // only counts, since typed text is read off the input afterwards.
  const component = await mount(TextField, {
    slots: { label: "Email" },
    on: {
      "update:modelValue": (value: unknown) => {
        changes += 1;
        lastValue = value as string;
      },
    },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("abc");

  // ASSERT
  expect(changes).toBe(3);
  expect(lastValue).toBe("abc");
  await expect(component.getByRole("textbox")).toHaveValue("abc");
});
