import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { useFocusStateHooks } from "../../playwright/matrix";
import TextArea from "./TextArea.vue";
import type { TextAreaColor, TextAreaSize } from "./TextArea.types";

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
    component: TextArea,
    args: (column) => ({
      props: {
        placeholder: "Say something",
        modelValue: column === "filled" ? "A short note." : undefined,
        error: column === "error",
        disabled: column === "disabled",
      },
      slots: {
        label: "Message",
        ...(column === "error" ? { "helper-text": "Message is required" } : {}),
      },
    }),
  });

  executeMatrixScreenshotTest({
    name: "TextArea (sizes)",
    columns: SIZES,
    rows: [...COLORS, "with-counter", "required"],
    fastNoIsolation: true,
    component: TextArea,
    args: (column, row) => ({
      props: {
        size: column,
        color: row === "dante" ? "dante" : "primary",
        maxLength: row === "with-counter" ? 280 : undefined,
        required: row === "required",
        modelValue: row === "with-counter" ? "Hello" : undefined,
      },
      slots: { label: "Message" },
    }),
  });
});

test("should render with the default classes and no modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, { slots: { label: "Message" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-text-area/);
  await expect(component).not.toHaveClass(
    /okkly-text-area--(small|large|color-|error|full-width|resize-|autosize)/,
  );
});

test("should apply size modifiers only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, {
    props: { size: "small" },
    slots: { label: "Message" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--small/);

  // ACT
  await component.update({ props: { size: "large" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--large/);

  // ACT
  await component.update({ props: { size: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-area--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, {
    props: { color: "dante" },
    slots: { label: "Message" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--color-dante/);

  // ACT
  await component.update({ props: { color: "primary" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-area--color-/);
});

test("should apply the error modifier and mark aria-invalid", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, {
    props: { error: true },
    slots: { label: "Message" },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should show a character counter when maxLength is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, {
    props: { maxLength: 280, modelValue: "Hello" },
    slots: { label: "Message" },
  });

  // ASSERT
  await expect(component).toContainText("5 / 280");

  // ACT
  await component.getByRole("textbox").fill("Hello world");

  // ASSERT — the counter tracks what is actually in the field.
  await expect(component).toContainText("11 / 280");
});

test("should link the helper text and the counter via aria-describedby", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, {
    props: { maxLength: 280 },
    slots: { label: "Message", "helper-text": "Markdown supported" },
  });

  // ASSERT — the helper comes first, then the counter.
  const describedBy = await component.getByRole("textbox").getAttribute("aria-describedby");
  const [helperId, counterId] = describedBy!.split(" ");
  await expect(component.locator(`#${helperId}`)).toHaveText("Markdown supported");
  await expect(component.locator(`#${counterId}`)).toHaveText("0 / 280");
});

test("should update the model as the user types", async ({ mount }) => {
  let changes = 0;
  let lastValue = "";

  // ARRANGE — `modelValue` is left unset so `defineModel` keeps its own local
  // state (an uncontrolled textarea, mirroring the React version); the
  // listener only counts, since typed text is read off the textarea afterwards.
  const component = await mount(TextArea, {
    slots: { label: "Message" },
    on: {
      "update:modelValue": (value: unknown) => {
        changes += 1;
        lastValue = value as string;
      },
    },
  });

  // ACT
  await component.getByRole("textbox").pressSequentially("Hello");

  // ASSERT
  expect(changes).toBe(5);
  expect(lastValue).toBe("Hello");
  await expect(component.getByRole("textbox")).toHaveValue("Hello");
});

test("should disable the textarea", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, {
    props: { disabled: true },
    slots: { label: "Message" },
  });

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
});

test("should show a required asterisk after the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(TextArea, {
    props: { required: true },
    slots: { label: "Message" },
  });

  // ASSERT
  await expect(component.locator(".okkly-text-area__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});

test("should not render the footer when there is no helper text or maxLength", async ({
  mount,
}) => {
  // ARRANGE
  const component = await mount(TextArea, { slots: { label: "Message" } });

  // ASSERT
  await expect(component.locator(".okkly-text-area__footer")).toHaveCount(0);
});

test("should merge a consumer's class onto the field and fall other attributes through to the textarea", async ({
  mount,
}) => {
  // ARRANGE — none of these are declared props, so Vue treats them as
  // fall-through attributes: `class` merges onto the root, the rest reach the
  // <textarea> because TextArea binds `$attrs` there.
  const attrs = { class: "custom", "data-testid": "message-input", placeholder: "Say something" };
  const component = await mount(TextArea, { props: attrs, slots: { label: "Message" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area/);
  await expect(component).toHaveClass(/custom/);
  await expect(component).not.toHaveAttribute("data-testid");
  const textarea = component.locator("textarea");
  await expect(textarea).toHaveAttribute("data-testid", "message-input");
  await expect(textarea).toHaveAttribute("placeholder", "Say something");
});
