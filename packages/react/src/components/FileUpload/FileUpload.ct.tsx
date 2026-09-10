import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import {
  CustomRowFileUpload,
  StatusFileUpload,
} from "../../playwright/fixtures/FileUploadFixtures";
import { FileUpload } from "./FileUpload";
import type { Locator } from "@playwright/test";
import type { FileUploadSize } from "./FileUpload";

const SIZES = ["large", "medium", "small"] as const satisfies readonly FileUploadSize[];

/** A file of a given size, built without ever touching the real filesystem. */
const file = (name: string, size: number, mimeType = "image/png") => ({
  name,
  mimeType,
  buffer: Buffer.alloc(size, "x"),
});

/** Puts files on the hidden `<input type="file">`, as a real picker would. */
const selectFiles = (component: Locator, files: ReturnType<typeof file>[]) =>
  component.locator('input[type="file"]').setInputFiles(files);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "FileUpload (sizes)",
    columns: SIZES,
    rows: ["empty", "with-file", "disabled"],
    hooks: {
      beforeEach: async (component, _page, _column, row) => {
        if (row === "with-file") await selectFiles(component, [file("cover.png", 1024)]);
      },
    },
    component: (column, row) => (
      <div style={{ width: "20rem" }}>
        <FileUpload multiple label="Upload" size={column} disabled={row === "disabled"} />
      </div>
    ),
  });

  executeMatrixScreenshotTest({
    name: "FileUpload (validation)",
    columns: ["valid", "wrong-type", "too-large"],
    rows: ["default"],
    hooks: {
      beforeEach: async (component, _page, column) => {
        if (column === "wrong-type") {
          await selectFiles(component, [file("notes.txt", 10, "text/plain")]);
        } else if (column === "too-large") {
          await selectFiles(component, [file("big.png", 4 * 1024 * 1024)]);
        } else {
          await selectFiles(component, [file("cover.png", 1024)]);
        }
      },
    },
    component: () => (
      <div style={{ width: "20rem" }}>
        <FileUpload multiple accept={[".png"]} maxSize="1MiB" />
      </div>
    ),
  });
});

test("should render the large drop zone by default, with no modifier classes", async ({
  mount,
}) => {
  // ARRANGE
  const component = await mount(<FileUpload label="Upload" />);

  // ASSERT
  await expect(component).toContainText("Click to upload");
  await expect(component).not.toHaveClass(/okkly-file-upload--/);
});

test("should apply the size modifier for medium and small", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<FileUpload size="medium" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-file-upload--medium/);

  // ACT
  await component.update(<FileUpload size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-file-upload--small/);

  // ACT
  await component.update(<FileUpload size="large" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-file-upload--(medium|small)/);
});

test("should select a single file and report it as a single value", async ({ mount }) => {
  const reported: unknown[] = [];

  // ARRANGE — a single-file upload hands back the File itself, not an array.
  // A `File` cannot cross back into Node, so the payload's *shape* is checked
  // here and its contents are read off the rendered list.
  const component = await mount(<FileUpload onChange={(value) => reported.push(value)} />);

  // ACT
  await selectFiles(component, [file("cover.png", 1024)]);

  // ASSERT
  expect(reported).toHaveLength(1);
  expect(Array.isArray(reported[0])).toBe(false);
  await expect(component.locator(".okkly-file-upload__file-name")).toHaveText(["cover.png"]);
});

test("should append files when multiple is enabled and report an array", async ({ mount }) => {
  const lengths: number[] = [];

  // ARRANGE — `File` objects do not survive the trip back to Node, so the
  // callback contributes the count and the list contributes the names.
  const component = await mount(
    <FileUpload multiple onChange={(value) => lengths.push((value as File[]).length)} />,
  );

  // ACT
  await selectFiles(component, [file("a.png", 1024)]);
  await selectFiles(component, [file("b.png", 2048)]);

  // ASSERT
  expect(lengths).toEqual([1, 2]);
  await expect(component.locator(".okkly-file-upload__file-name")).toHaveText(["a.png", "b.png"]);
});

test("should replace the selection when replace is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<FileUpload multiple replace />);

  // ACT
  await selectFiles(component, [file("a.png", 1024)]);
  await selectFiles(component, [file("b.png", 2048)]);

  // ASSERT — the second pick supersedes the first rather than adding to it.
  await expect(component.locator(".okkly-file-upload__file-name")).toHaveText(["b.png"]);
});

test("should keep a file with a disallowed type and mark it", async ({ mount }) => {
  // ARRANGE — the file stays in the list so the user can see what was rejected.
  const component = await mount(<FileUpload accept={[".png"]} />);

  // ACT
  await selectFiles(component, [file("notes.txt", 10, "text/plain")]);

  // ASSERT
  await expect(component).toContainText("notes.txt");
  await expect(component).toContainText(".txt files are not allowed");
  await expect(component).toHaveClass(/okkly-file-upload--error/);
  await expect(component.locator(".okkly-file-upload__file")).toHaveClass(
    /okkly-file-upload__file--error/,
  );
});

test("should mark files exceeding maxSize, formatted in decimal notation", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<FileUpload maxSize="1MiB" />);

  // ACT
  await selectFiles(component, [file("big.png", 4 * 1024 * 1024)]);

  // ASSERT
  await expect(component).toContainText("Exceeds the max. file size of 1 MB");
});

test("should mark files beyond maxCount and maxTotalSize", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<FileUpload multiple maxCount={1} maxTotalSize={2000} />);

  // ACT
  await selectFiles(component, [file("a.png", 900), file("b.png", 1500)]);

  // ASSERT
  await expect(component).toContainText("Exceeds the max. total size of 2 KB");
});

test("should remove a file from the list", async ({ mount }) => {
  const lengths: number[] = [];

  // ARRANGE
  const component = await mount(
    <FileUpload multiple onChange={(value) => lengths.push((value as File[]).length)} />,
  );
  await selectFiles(component, [file("cover.png", 1024)]);

  // ACT
  await component.getByRole("button", { name: "Remove cover.png" }).click();

  // ASSERT
  expect(lengths.at(-1)).toBe(0);
  await expect(component).not.toContainText("cover.png");
});

test("should show the required error once shown and clear it on selection", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<FileUpload required showError />);

  // ASSERT
  await expect(component).toContainText("Please select a file.");

  // ACT
  await selectFiles(component, [file("cover.png", 1024)]);

  // ASSERT
  await expect(component).not.toContainText("Please select a file.");
});

test("should hide validation messages until the user interacts", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<FileUpload required />);

  // ASSERT
  await expect(component).not.toContainText("Please select a file.");
});

test("should set the custom validity of the underlying input", async ({ mount }) => {
  let validityChanges = 0;

  // ARRANGE
  const component = await mount(
    <FileUpload required onValidityChange={() => (validityChanges += 1)} />,
  );
  const input = component.locator('input[type="file"]');

  // ASSERT — a real constraint-validation message, set on the real input.
  expect(await input.evaluate((element: HTMLInputElement) => element.validationMessage)).toBe(
    "Please select a file.",
  );
  expect(validityChanges).toBeGreaterThan(0);
});

test("should support controlled usage", async ({ mount }) => {
  // ARRANGE — a controlled empty value ignores whatever the picker returns.
  const component = await mount(<FileUpload multiple value={[]} onChange={() => {}} />);

  // ACT
  await selectFiles(component, [file("cover.png", 1024)]);

  // ASSERT — the parent never fed the file back, so nothing is listed.
  await expect(component).not.toContainText("cover.png");
});

test("should add files dropped onto the drop zone", async ({ mount, page }) => {
  // ARRANGE
  const component = await mount(<FileUpload />);

  // ACT — a real DataTransfer drop, which jsdom could only simulate.
  const dataTransfer = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["x"], "dropped.png", { type: "image/png" }));
    return transfer;
  });
  await component.locator(".okkly-file-upload__dropzone").dispatchEvent("drop", { dataTransfer });

  // ASSERT
  await expect(component.locator(".okkly-file-upload__file-name")).toHaveText(["dropped.png"]);
});

test("should honour the list type", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<FileUpload multiple listType="hidden" />);
  await selectFiles(component, [file("cover.png", 1024)]);

  // ASSERT
  await expect(component.locator(".okkly-file-upload__list")).toHaveCount(0);

  // ACT
  await component.update(<FileUpload multiple listType="maxHeight" />);

  // ASSERT
  await expect(component.locator(".okkly-file-upload__list")).toHaveClass(
    /okkly-file-upload__list--max-height/,
  );

  // ACT
  await component.update(<FileUpload multiple listType="button" />);
  await component.getByRole("button", { name: "Hide files" }).click();

  // ASSERT
  await expect(component.locator(".okkly-file-upload__list")).toHaveCount(0);
});

test("should render a custom row via renderFile", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<CustomRowFileUpload />);
  await selectFiles(component, [file("cover.png", 1024)]);

  // ASSERT — the custom row replaces the built-in one, remove button included.
  await expect(component).toContainText("custom cover.png");
  await expect(component.getByRole("button", { name: "Remove cover.png" })).toHaveCount(0);
});

test("should show an external status with a progress bar", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<StatusFileUpload text="Uploading…" progress={40} />);
  await selectFiles(component, [file("cover.png", 1024)]);

  // ASSERT
  await expect(component).toContainText("Uploading…");
  await expect(component.locator(".okkly-file-upload__progress-bar")).toHaveAttribute(
    "style",
    /width:\s*40%/,
  );
});

test("should disable the drop zone and the remove button", async ({ mount }) => {
  // ARRANGE — select first, then disable: the picker is unreachable once off.
  const component = await mount(<FileUpload multiple />);
  await selectFiles(component, [file("cover.png", 1024)]);

  // ACT
  await component.update(<FileUpload multiple disabled />);

  // ASSERT
  await expect(component.getByRole("button", { name: /click to upload/i })).toBeDisabled();
  await expect(component.getByRole("button", { name: "Remove cover.png" })).toBeDisabled();
});
