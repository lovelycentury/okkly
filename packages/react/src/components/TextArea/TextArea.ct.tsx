import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import { TextArea } from "./TextArea";
import type { TextAreaColor, TextAreaSize } from "./TextArea";

const COLORS = ["primary", "dante"] as const satisfies readonly TextAreaColor[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly TextAreaSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "TextArea (states)",
    columns: ["default", "filled", "error", "disabled"],
    rows: ["default", "hover", "focus-visible"],
    hooks: {
      beforeEach: async (component, page, _column, row) =>
        useFocusStateHooks({ component, page, state: row }),
    },
    component: (column) => (
      <TextArea
        label="Message"
        placeholder="Say something"
        defaultValue={column === "filled" ? "A short note." : undefined}
        error={column === "error"}
        disabled={column === "disabled"}
        helperText={column === "error" ? "Message is required" : undefined}
      />
    ),
  });

  executeMatrixScreenshotTest({
    name: "TextArea (sizes)",
    columns: SIZES,
    rows: [...COLORS, "with-counter", "required"],
    fastNoIsolation: true,
    component: (column, row) => (
      <TextArea
        label="Message"
        size={column}
        color={row === "dante" ? "dante" : "primary"}
        maxLength={row === "with-counter" ? 280 : undefined}
        required={row === "required"}
        defaultValue={row === "with-counter" ? "Hello" : undefined}
      />
    ),
  });
});

test("should render with the default classes and no modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextArea label="Message" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-text-area/);
  await expect(component).not.toHaveClass(
    /okkly-text-area--(small|large|color-|error|full-width|resize-|autosize)/,
  );
});

test("should apply size modifiers only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextArea label="Message" size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--small/);

  // ACT
  await component.update(<TextArea label="Message" size="large" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--large/);

  // ACT
  await component.update(<TextArea label="Message" size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-area--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextArea label="Message" color="dante" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--color-dante/);

  // ACT
  await component.update(<TextArea label="Message" color="primary" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-area--color-/);
});

test("should apply the error modifier and mark aria-invalid", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextArea label="Message" error />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should show a character counter when maxLength is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextArea label="Message" maxLength={280} defaultValue="Hello" />);

  // ASSERT
  await expect(component).toContainText("5 / 280");

  // ACT
  await component.getByRole("textbox").fill("Hello world");

  // ASSERT — the counter tracks what is actually in the field.
  await expect(component).toContainText("11 / 280");
});

test("should link the helper text and the counter via aria-describedby", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <TextArea label="Message" helperText="Markdown supported" maxLength={280} />,
  );

  // ASSERT — the helper comes first, then the counter.
  const describedBy = await component.getByRole("textbox").getAttribute("aria-describedby");
  const [helperId, counterId] = describedBy!.split(" ");
  await expect(component.locator(`#${helperId}`)).toHaveText("Markdown supported");
  await expect(component.locator(`#${counterId}`)).toHaveText("0 / 280");
});

test("should fire onChange with the typed value", async ({ mount }) => {
  let changes = 0;

  // ARRANGE — the handler only counts: a React SyntheticEvent does not survive
  // the trip back to Node, so the typed text is read off the textarea instead.
  const component = await mount(<TextArea label="Message" onChange={() => (changes += 1)} />);

  // ACT
  await component.getByRole("textbox").pressSequentially("Hello");

  // ASSERT
  expect(changes).toBe(5);
  await expect(component.getByRole("textbox")).toHaveValue("Hello");
});

test("should disable the textarea", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextArea label="Message" disabled />);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<TextArea label="Message" required />);

  // ASSERT
  await expect(component.locator(".okkly-text-area__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});
