import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { RichEditor } from "./RichEditor";
import type { RichEditorColor, RichEditorToolbar } from "./RichEditor";

const COLORS = ["primary", "dante"] as const satisfies readonly RichEditorColor[];
const TOOLBARS = ["full", "compact", "none"] as const satisfies readonly RichEditorToolbar[];

const SAMPLE = "<p>The quick brown fox.</p>";

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "RichEditor (toolbars)",
    columns: TOOLBARS,
    rows: COLORS,
    hooks: {
      // Tiptap mounts asynchronously; wait for the editor surface before capture.
      beforeEach: async (component) => {
        await component.locator(".ProseMirror").waitFor();
      },
    },
    component: (column, row) => (
      <div style={{ width: "24rem" }}>
        <RichEditor label="Description" toolbar={column} color={row} defaultValue={SAMPLE} />
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "RichEditor (states)",
    columns: ["default", "error", "disabled", "readonly"],
    rows: ["default"],
    hooks: {
      beforeEach: async (component) => {
        await component.locator(".ProseMirror").waitFor();
      },
    },
    component: (column) => (
      <div style={{ width: "24rem" }}>
        <RichEditor
          label="Description"
          defaultValue={SAMPLE}
          error={column === "error"}
          disabled={column === "disabled"}
          readonly={column === "readonly"}
          helperText={column === "error" ? "Description is required" : undefined}
        />
      </div>
    ),
  });
});

test("should render the label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<RichEditor label="Description" />);

  // ASSERT
  await expect(component).toContainText("Description");
});

test("should render with default classes and no modifier classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<RichEditor label="Description" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-rich-editor/);
  await expect(component).not.toHaveClass(
    /okkly-rich-editor--(error|disabled|readonly|color-|not-full-width)/,
  );
});

test("should apply the error modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<RichEditor label="Description" error />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-rich-editor--error/);
});

test("should disable editing and mark aria-disabled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RichEditor label="Description" disabled defaultValue="<p>Hi</p>" />,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-rich-editor--disabled/);
  const prose = component.locator(".ProseMirror");
  await expect(prose).toHaveAttribute("contenteditable", "false");
  await expect(prose).toHaveAttribute("aria-disabled", "true");
});

test("should show the toolbar buttons when not readonly", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<RichEditor label="Description" />);

  // ASSERT
  await expect(component.getByRole("toolbar", { name: "Formatting" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Bold" })).toBeVisible();
  await expect(component.getByRole("button", { name: "Italic" })).toBeVisible();
});

test("should hide the toolbar when readonly", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <RichEditor label="Description" readonly defaultValue="<p>Locked</p>" />,
  );

  // ASSERT
  await expect(component.getByRole("toolbar", { name: "Formatting" })).toHaveCount(0);
  await expect(component).toContainText("Read-only");
});

test("should fire onChange when the content changes", async ({ mount }) => {
  const values: string[] = [];

  // ARRANGE
  const component = await mount(
    <RichEditor label="Description" onChange={(value) => values.push(String(value))} />,
  );

  // ACT
  await component.getByRole("button", { name: "Horizontal rule" }).click();

  // ASSERT
  await expect(() => {
    expect(values.at(-1)).toMatch(/hr/i);
  }).toPass();
});

test("should apply a mark to the text the user actually selected", async ({ mount, page }) => {
  // ARRANGE — a real selection over real text, which jsdom could not produce:
  // ProseMirror reads the live document selection to decide what to wrap.
  const component = await mount(<RichEditor label="Description" defaultValue="<p>bold me</p>" />);
  const prose = component.locator(".ProseMirror");
  await prose.click();
  await page.keyboard.press("ControlOrMeta+a");

  // ACT
  await component.getByRole("button", { name: "Bold" }).click();

  // ASSERT
  await expect(prose.locator("strong")).toHaveText("bold me");
});
