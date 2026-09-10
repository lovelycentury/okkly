import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Typography } from "./Typography";
import type { TypographyColor, TypographyVariant } from "./Typography";

/**
 * Mirrors `TYPOGRAPHY_VARIANTS` in Typography.tsx. It is spelled out again here
 * rather than imported: a component test's non-component imports are evaluated
 * in Node, where the component's SCSS import cannot resolve. The `satisfies`
 * clause keeps the two in step — a renamed variant fails to compile.
 */
const VARIANT_ELEMENTS = {
  "display-2xl": "H1",
  "display-xl": "H1",
  "display-lg": "H2",
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  "body-lg": "P",
  "body-md": "P",
  "body-sm": "P",
  "label-md": "SPAN",
  "label-sm": "SPAN",
  caption: "SPAN",
  overline: "SPAN",
  "mono-sm": "CODE",
} as const satisfies Record<TypographyVariant, string>;

const VARIANTS = Object.keys(VARIANT_ELEMENTS) as TypographyVariant[];

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

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Typography (scale)",
    columns: ["default"],
    rows: VARIANTS,
    fastNoIsolation: true,
    component: (_column, row) => <Typography variant={row}>The quick brown fox</Typography>,
  });

  executeMatrixScreenshotTest({
    name: "Typography (colors)",
    columns: COLORS,
    rows: ["body-md", "h3", "overline"],
    fastNoIsolation: true,
    component: (column, row) => (
      <Typography variant={row as TypographyVariant} color={column}>
        Sample
      </Typography>
    ),
  });

  executeMatrixScreenshotTest({
    name: "Typography (modifiers)",
    columns: ["left", "center", "right"],
    rows: ["plain", "gutter-bottom", "no-wrap"],
    fastNoIsolation: true,
    component: (column, row) => (
      <div style={{ width: "12rem" }}>
        <Typography
          align={column as "left" | "center" | "right"}
          gutterBottom={row === "gutter-bottom"}
          noWrap={row === "no-wrap"}
        >
          A line of copy long enough to need wrapping
        </Typography>
      </div>
    ),
  });
});

test("should render body-md as a paragraph with no modifier classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Typography>Copy</Typography>);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("P");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-typography/);
  await expect(component).not.toHaveClass(/okkly-typography--/);
});

test("should map every variant to its default element", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Typography>Text</Typography>);

  for (const [variant, tag] of Object.entries(VARIANT_ELEMENTS)) {
    // ACT
    await component.update(<Typography variant={variant as TypographyVariant}>Text</Typography>);

    // ASSERT
    expect(await component.evaluate((element) => element.tagName), variant).toBe(tag);
  }
});

test("should apply the variant modifier for every step except the default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Typography variant="display-2xl">Hero</Typography>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--display-2xl/);

  // ACT
  await component.update(<Typography variant="overline">Eyebrow</Typography>);

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--overline/);
  await expect(component).not.toHaveClass(/okkly-typography--display-2xl/);

  // ACT
  await component.update(<Typography variant="body-md">Copy</Typography>);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-typography--/);
});

test("should render the element given to `as` instead of the variant default", async ({
  mount,
}) => {
  // ARRANGE
  const component = await mount(
    <Typography variant="h1" as="div">
      Heading that is not an h1
    </Typography>,
  );

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("DIV");
  await expect(component).toHaveClass(/okkly-typography--h1/);
});

test("should accept the props of the element it renders as", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Typography as="a" href="#test-section" variant="label-md">
      Link
    </Typography>,
  );

  // ASSERT
  await expect(component).toHaveRole("link");
  await expect(component).toHaveAttribute("href", "#test-section");
});

test("should apply colour, alignment and layout modifiers", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Typography color="danger" align="center" gutterBottom noWrap>
      Copy
    </Typography>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-typography--color-danger/);
  await expect(component).toHaveClass(/okkly-typography--align-center/);
  await expect(component).toHaveClass(/okkly-typography--gutter-bottom/);
  await expect(component).toHaveClass(/okkly-typography--no-wrap/);

  // ACT
  await component.update(<Typography>Copy</Typography>);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-typography--/);
});
