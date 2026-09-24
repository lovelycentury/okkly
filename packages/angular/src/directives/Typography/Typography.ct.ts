import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import type { TypographyAlign, TypographyColor, TypographyVariant } from "./Typography";

const VARIANTS = [
  "display-2xl",
  "display-xl",
  "display-lg",
  "h1",
  "h2",
  "h3",
  "h4",
  "body-lg",
  "body-md",
  "body-sm",
  "label-md",
  "label-sm",
  "caption",
  "overline",
  "mono-sm",
] as const satisfies readonly TypographyVariant[];

const COLORS = [
  "inherit",
  "primary",
  "secondary",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
] as const satisfies readonly TypographyColor[];

const ALIGNS = ["left", "center", "right"] as const satisfies readonly TypographyAlign[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Typography (scale)",
    columns: ["default"],
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (_column, row) => `<p okklyTypography variant="${row}">Aa — the quick brown fox</p>`,
  });

  executeMatrixScreenshotTest({
    name: "Typography (colors)",
    columns: COLORS,
    rows: ["body-md", "h3", "overline"],
    fastNoIsolation: true,
    component: (column, row) =>
      `<p okklyTypography variant="${row}" color="${column}">Aa — the quick brown fox</p>`,
  });

  executeMatrixScreenshotTest({
    name: "Typography (modifiers)",
    columns: ALIGNS,
    rows: ["plain", "gutter-bottom", "no-wrap"],
    fastNoIsolation: true,
    component: (column, row) => {
      const gutterBottom = row === "gutter-bottom" ? " gutterBottom" : "";
      const noWrap = row === "no-wrap" ? " noWrap" : "";
      return `<div style="max-width: 12rem"><p okklyTypography align="${column}"${gutterBottom}${noWrap}>Aa — the quick brown fox jumps over the lazy dog</p></div>`;
    },
  });
});

test("should put the base classes, and nothing else, on the element", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<p okklyTypography>Content</p>`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-typography");
  await expect(component).toHaveText("Content");
});

test("should decorate whatever element it sits on, which keeps its own attributes", async ({
  mountTemplate,
}) => {
  // ARRANGE — the counterpart of React's `as`
  const component = await mountTemplate(`<a okklyTypography variant="h1" href="/docs">Docs</a>`);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("A");
  await expect(component).toHaveAttribute("href", "/docs");
  await expect(component).toHaveClass(/okkly-typography--h1/);
});

test("should apply the variant modifier only for non-body-md variants", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<p okklyTypography [variant]="state().variant">Content</p>`,
    { variant: "h1" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--h1/);

  // ACT
  await update({ variant: "body-md" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-typography--/);
});

test("should apply the color modifier only for non-inherit colors", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<p okklyTypography [color]="state().color">Content</p>`, {
    color: "accent",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--color-accent/);

  // ACT
  await update({ color: "inherit" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-typography--color-/);
});

test("should apply the align modifier only for non-inherit alignments", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<p okklyTypography [align]="state().align">Content</p>`, {
    align: "center",
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--align-center/);

  // ACT
  await update({ align: "inherit" });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-typography--align-/);
});

test("should apply the gutter-bottom and no-wrap modifiers", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<p okklyTypography gutterBottom noWrap>Content</p>`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--gutter-bottom/);
  await expect(component).toHaveClass(/okkly-typography--no-wrap/);
});

test("should combine variant, color, align and modifier classes together", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<h3 okklyTypography variant="h3" color="danger" align="right" gutterBottom>Content</h3>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--h3/);
  await expect(component).toHaveClass(/okkly-typography--color-danger/);
  await expect(component).toHaveClass(/okkly-typography--align-right/);
  await expect(component).toHaveClass(/okkly-typography--gutter-bottom/);
});

test("should merge the element's own class with its own", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<p okklyTypography variant="h1" class="custom"></p>`);

  // ASSERT
  await expect(component).toHaveClass(/\bcustom\b/);
  await expect(component).toHaveClass(/\bokkly-typography--h1\b/);
});
