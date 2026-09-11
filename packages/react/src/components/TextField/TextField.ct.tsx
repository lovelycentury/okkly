import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { TextField } from "./TextField";
import type { TextFieldColor, TextFieldSize } from "./TextField";

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
    component: (column) => (
      <TextField
        label="Email"
        placeholder="you@example.com"
        defaultValue={column === "filled" ? "hello@okryshto.dev" : undefined}
        error={column === "error"}
        disabled={column === "disabled"}
        helperText={column === "error" ? "That address looks wrong" : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "TextField (sizes)",
    columns: SIZES,
    rows: [...COLORS, "required", "no-label"],
    fastNoIsolation: true,
    component: (column, row) => (
      <TextField
        label="Email"
        size={column}
        color={(COLORS as readonly string[]).includes(row) ? (row as TextFieldColor) : "primary"}
        required={row === "required"}
        hideLabel={row === "no-label"}
        placeholder="you@example.com"
      />
    ),
  });
});

test("should render a labeled input linked by htmlFor/id", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" />);

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
  const component = await mount(<TextField label="Email" hideLabel />);

  // ASSERT
  await expect(component.locator(".okkly-text-field__label")).toHaveClass(
    /okkly-text-field__label--hidden/,
  );
  await expect(component.getByRole("textbox")).toHaveAccessibleName("Email");
});

test("should apply a size modifier only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--small/);

  // ACT
  await component.update(<TextField label="Email" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-field--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--color-dante/);

  // ACT
  await component.update(<TextField label="Email" color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-field--color-/);
});

test("should apply a color modifier for every accent color", async ({ mount }) => {
  const colors = COLORS.filter((c) => c !== "primary");
  const component = await mount(<TextField label="Email" color={colors[0]} />);

  for (const color of colors) {
    // ACT
    await component.update(<TextField label="Email" color={color} />);

    // ASSERT
    await expect(component).toHaveClass(new RegExp(`okkly-text-field--color-${color}`));
  }
});

test("should apply the error modifier and mark aria-invalid", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" error />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should apply the full-width modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" fullWidth />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-field--full-width/);
});

test("should render helperText and link it via aria-describedby", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" helperText="We'll never share it" />);

  // ASSERT
  const describedBy = await component.getByRole("textbox").getAttribute("aria-describedby");
  await expect(component.locator(`#${describedBy}`)).toHaveText("We'll never share it");
});

test("should disable the input", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" disabled />);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextField label="Email" required />);

  // ASSERT
  await expect(component.locator(".okkly-text-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});

test("should fire onChange as the user types", async ({ mount }) => {
  let changes = 0;

  // ARRANGE — the handler only counts: a React SyntheticEvent does not survive
  // the trip back to Node, so the typed text is read off the input instead.
  const component = await mount(<TextField label="Email" onChange={() => (changes += 1)} />);

  // ACT
  await component.getByRole("textbox").pressSequentially("abc");

  // ASSERT
  expect(changes).toBe(3);
  await expect(component.getByRole("textbox")).toHaveValue("abc");
});
