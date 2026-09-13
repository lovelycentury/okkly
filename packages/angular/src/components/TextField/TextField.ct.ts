import type { Locator } from "@playwright/test";
import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column) =>
      `<okkly-text-field label="Email" placeholder="you@example.com"${
        column === "filled" ? ' value="hello@okkly.dev"' : ""
      }${column === "error" ? ' error helperText="That address looks wrong"' : ""}${
        column === "disabled" ? " disabled" : ""
      } />`,
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
    component: (column, row) => {
      const color = (COLORS as readonly string[]).includes(row) ? row : "primary";
      return `<okkly-text-field label="Email" size="${column}" color="${color}"${
        row === "required" ? " required" : ""
      }${row === "no-label" ? " hideLabel" : ""} placeholder="you@example.com" />`;
    },
  });
});

/** `<okkly-text-field>` itself carries no class — the field's block is the `div[okklyField]` inside. */
const field = (component: Locator) => component.locator(".okkly-text-field");

test("should render a labeled input linked by for/id", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-field label="Email" />`);

  // ASSERT
  const input = component.getByRole("textbox");
  await expect(input).toHaveAccessibleName("Email");
  const [forAttribute, id] = await Promise.all([
    component.locator("label").getAttribute("for"),
    input.getAttribute("id"),
  ]);
  expect(forAttribute).toBe(id);
});

test("should visually hide the label but keep it accessible", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-field label="Email" hideLabel />`);

  // ASSERT
  await expect(component.locator(".okkly-text-field__label")).toHaveClass(
    /okkly-text-field__label--hidden/,
  );
  await expect(component.getByRole("textbox")).toHaveAccessibleName("Email");
});

test("should apply a size modifier only for non-medium sizes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-field label="Email" [size]="state().size" />`,
    { size: "small" },
  );

  // ASSERT
  await expect(field(component)).toHaveClass(/okkly-text-field--small/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(field(component)).not.toHaveClass(/okkly-text-field--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-field label="Email" [color]="state().color" />`,
    { color: "dante" },
  );

  // ASSERT
  await expect(field(component)).toHaveClass(/okkly-text-field--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(field(component)).not.toHaveClass(/okkly-text-field--color-/);
});

test("should apply the error modifier and mark aria-invalid", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-field label="Email" error />`);

  // ASSERT
  await expect(field(component)).toHaveClass(/okkly-text-field--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should apply the full-width modifier", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-field label="Email" fullWidth />`);

  // ASSERT
  await expect(field(component)).toHaveClass(/okkly-text-field--full-width/);
});

test("should render helperText and link it via aria-describedby", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-field label="Email" helperText="We'll never share it" />`,
  );

  // ASSERT
  const describedBy = await component.getByRole("textbox").getAttribute("aria-describedby");
  await expect(component.locator(`#${describedBy}`)).toHaveText("We'll never share it");
});

test("should disable the input", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-field label="Email" disabled />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
});

test("should show a required asterisk after the label and mark the input required", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-field label="Email" required />`);

  // ASSERT
  await expect(component.locator(".okkly-text-field__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});

test("should update the value model as the user types", async ({
  mountTemplate,
  recordedEvents,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-field label="Email" (valueChange)="record('valueChange', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("abc");

  // ASSERT
  expect(await recordedEvents("valueChange")).toEqual(["a", "ab", "abc"]);
  await expect(component.getByRole("textbox")).toHaveValue("abc");
});

test.describe("adornments", () => {
  test("should not render an adornment slot when nothing is projected into it", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-text-field label="Email" />`);

    // ASSERT
    await expect(component.locator(".okkly-text-field__adornment")).toHaveCount(0);
  });

  // Both adornments are present from creation, never toggled: see the doc
  // comment on `OkklyTextField` for the projection limitation that avoids.
  test("should render projected start and end adornments inside the border", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-text-field label="Amount">
        <span okklyTextFieldStartAdornment data-testid="start-adornment">$</span>
        <span okklyTextFieldEndAdornment data-testid="end-adornment">USD</span>
      </okkly-text-field>`,
    );

    // ASSERT
    await expect(component.locator(".okkly-text-field__adornment")).toHaveCount(2);
    await expect(component.getByTestId("start-adornment")).toHaveText("$");
    await expect(component.getByTestId("end-adornment")).toHaveText("USD");
  });
});
