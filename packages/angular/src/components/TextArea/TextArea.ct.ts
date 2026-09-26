import { expect, test } from "../../playwright/harness";
import { useFocusStateHooks } from "../../playwright/matrix";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
    component: (column) =>
      `<okkly-text-area label="Message" placeholder="Say something"${
        column === "filled" ? ` value="A short note."` : ""
      }${column === "error" ? ` error helperText="Message is required"` : ""}${
        column === "disabled" ? " disabled" : ""
      } />`,
  });

  executeMatrixScreenshotTest({
    name: "TextArea (sizes)",
    columns: SIZES,
    rows: [...COLORS, "with-counter", "required"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<okkly-text-area label="Message" size="${column}" color="${
        row === "dante" ? "dante" : "primary"
      }"${row === "with-counter" ? ` maxLength="280" value="Hello"` : ""}${
        row === "required" ? " required" : ""
      } />`,
  });
});

test("should render with the default classes and no modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-area label="Message" />`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-text-area");
  await expect(component.getByRole("textbox", { name: "Message" })).toHaveAttribute("rows", "3");
  await expect(component.locator(".okkly-text-area__footer")).toHaveCount(0);
});

test("should apply size modifiers only for non-medium sizes", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-area label="Message" [size]="state().size" />`,
    { size: "small" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--small/);

  // ACT
  await update({ size: "large" });

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--large/);

  // ACT
  await update({ size: "medium" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-area--(small|large)/);
});

test("should apply a color modifier only for non-primary colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-area label="Message" [color]="state().color" />`,
    { color: "dante" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--color-dante/);

  // ACT
  await update({ color: "primary" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-text-area--color-/);
});

test("should apply the fullWidth, resize and autosize modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-area label="Message" fullWidth resize="none" autosize />`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--full-width/);
  await expect(component).toHaveClass(/okkly-text-area--resize-none/);
  await expect(component).toHaveClass(/okkly-text-area--autosize/);
});

test("should apply the error modifier and mark aria-invalid", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-area label="Message" error />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-text-area--error/);
  await expect(component.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

test("should show a character counter when maxLength is set", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-area label="Message" maxLength="280" value="Hello" />`,
  );

  // ASSERT
  await expect(component).toContainText("5 / 280");
  await expect(component.getByRole("textbox")).toHaveAttribute("maxlength", "280");

  // ACT
  await component.getByRole("textbox").fill("Hello world");

  // ASSERT — the counter tracks what is actually in the field.
  await expect(component).toContainText("11 / 280");
});

test("should link the helper text and the counter via aria-describedby", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-area label="Message" helperText="Markdown supported" maxLength="280" />`,
  );

  // ASSERT — the helper comes first, then the counter.
  const describedBy = await component.getByRole("textbox").getAttribute("aria-describedby");
  const [helperId, counterId] = describedBy!.split(" ");
  await expect(component.locator(`#${helperId}`)).toHaveText("Markdown supported");
  await expect(component.locator(`#${counterId}`)).toHaveText("0 / 280");
});

test("should emit valueChange with the typed value", async ({ mountTemplate, recordedEvents }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-area label="Message" (valueChange)="record('value', $event)" />`,
  );

  // ACT
  await component.getByRole("textbox").pressSequentially("Hello");

  // ASSERT
  expect(await recordedEvents("value")).toEqual(["H", "He", "Hel", "Hell", "Hello"]);
  await expect(component.getByRole("textbox")).toHaveValue("Hello");
});

test("should put id and name on the native textarea", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-text-area label="Message" id="message" name="message" />`,
  );
  const textarea = component.getByRole("textbox", { name: "Message" });

  // ASSERT
  await expect(textarea).toHaveAttribute("id", "message");
  await expect(textarea).toHaveAttribute("name", "message");
  await expect(component).not.toHaveAttribute("id");
});

test("should disable the textarea", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-area label="Message" disabled />`);

  // ASSERT
  await expect(component.getByRole("textbox")).toBeDisabled();
});

test("should show a required asterisk after the label", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-text-area label="Message" required />`);

  // ASSERT
  await expect(component.locator(".okkly-text-area__required")).toHaveText("*");
  await expect(component.getByRole("textbox")).toHaveAttribute("required", "");
});

test.describe("autosize", () => {
  test("should grow with the content up to maxRows, then scroll", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-text-area label="Message" autosize rows="2" maxRows="4" />`,
    );
    const textarea = component.getByRole("textbox");
    const height = async () => (await textarea.boundingBox())!.height;
    const initial = await height();

    // ACT
    await textarea.fill("1\n2\n3");

    // ASSERT
    await expect.poll(height).toBeGreaterThan(initial);
    await expect(textarea).toHaveCSS("overflow-y", "hidden");

    // ACT
    const grown = await height();
    await textarea.fill("1\n2\n3\n4\n5\n6\n7\n8");

    // ASSERT — capped at four lines, with the rest scrolling.
    await expect.poll(height).toBeGreaterThan(grown);
    const capped = await height();
    await textarea.press("Enter");
    expect(await height()).toBe(capped);
    await expect(textarea).toHaveCSS("overflow-y", "auto");
  });
});
