import type { CSSProperties } from "react";
import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Box } from "./Box";
import type { BoxColorToken, BoxSystemProps } from "./Box.types";

const SPACING_STEPS = ["0", "1", "2", "4", "8"] as const;

const COLOR_TOKENS = [
  "accent.primary",
  "accent.dante",
  "bg.surface-raised",
  "border.strong",
  "feedback.success",
] as const satisfies readonly BoxColorToken[];

/**
 * One case per system prop: the value to pass, a computed CSS property it must
 * set, and the value that property must compute to. `satisfies` makes a system
 * prop without a case a type error.
 */
const EVERY_SYSTEM_PROP = {
  m: [2, "margin-top", "8px"],
  mx: [2, "margin-left", "8px"],
  my: [2, "margin-bottom", "8px"],
  mt: [2, "margin-top", "8px"],
  mr: [2, "margin-right", "8px"],
  mb: [2, "margin-bottom", "8px"],
  ml: [2, "margin-left", "8px"],
  p: [2, "padding-top", "8px"],
  px: [2, "padding-right", "8px"],
  py: [2, "padding-top", "8px"],
  pt: [2, "padding-top", "8px"],
  pr: [2, "padding-right", "8px"],
  pb: [2, "padding-bottom", "8px"],
  pl: [2, "padding-left", "8px"],
  gap: [2, "column-gap", "8px"],
  rowGap: [2, "row-gap", "8px"],
  columnGap: [2, "column-gap", "8px"],
  display: ["flex", "display", "flex"],
  flexDirection: ["column", "flex-direction", "column"],
  flexWrap: ["wrap", "flex-wrap", "wrap"],
  alignItems: ["center", "align-items", "center"],
  justifyContent: ["space-between", "justify-content", "space-between"],
  alignSelf: ["flex-end", "align-self", "flex-end"],
  flexGrow: [2, "flex-grow", "2"],
  flexShrink: [0, "flex-shrink", "0"],
  flexBasis: [40, "flex-basis", "40px"],
  width: [40, "width", "40px"],
  height: [40, "height", "40px"],
  minWidth: [40, "min-width", "40px"],
  maxWidth: [40, "max-width", "40px"],
  minHeight: [40, "min-height", "40px"],
  maxHeight: [40, "max-height", "40px"],
  bgcolor: ["rgb(1, 2, 3)", "background-color", "rgb(1, 2, 3)"],
  color: ["rgb(1, 2, 3)", "color", "rgb(1, 2, 3)"],
  border: [3, "border-top-width", "3px"],
  borderColor: ["rgb(1, 2, 3)", "border-top-color", "rgb(1, 2, 3)"],
  borderRadius: [2, "border-top-left-radius", "8px"],
} as const satisfies Record<keyof BoxSystemProps, readonly [string | number, string, string]>;

// A plain function rather than a component: Playwright can only mount
// components imported from their own modules, never ones declared in a test.
const swatch = (color: BoxColorToken = "accent.primary") => (
  <Box width={24} height={24} bgcolor={color} borderRadius={1} />
);

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Box (spacing)",
    columns: SPACING_STEPS,
    rows: ["padding", "margin", "gap"],
    fastNoIsolation: true,
    component: (column, row) => {
      const step = Number(column);
      if (row === "padding")
        return (
          <Box bgcolor="bg.surface-raised" border={1} borderColor="border.strong" p={step}>
            {swatch()}
          </Box>
        );
      if (row === "margin")
        return (
          <Box display="flex" bgcolor="bg.inset" border={1} borderColor="border.strong">
            <Box m={step}>{swatch("accent.secondary")}</Box>
          </Box>
        );
      return (
        <Box display="flex" gap={step}>
          {swatch()}
          {swatch("accent.secondary")}
          {swatch("accent.dante")}
        </Box>
      );
    },
  });

  executeMatrixScreenshotTest({
    name: "Box (colors)",
    columns: COLOR_TOKENS,
    rows: ["bgcolor", "borderColor"],
    fastNoIsolation: true,
    component: (column, row) =>
      row === "bgcolor" ? (
        <Box width={48} height={32} bgcolor={column} borderRadius={2} />
      ) : (
        <Box width={48} height={32} border={2} borderColor={column} borderRadius={2} />
      ),
  });

  // One layout in three container widths, in one viewport: the layout follows
  // its container — stacked, then a row from `@md` (640px).
  executeMatrixScreenshotTest({
    name: "Box (container queries)",
    columns: ["320", "560", "720"],
    rows: ["card"],
    fastNoIsolation: true,
    component: (column) => (
      <Box container width={Number(column)} bgcolor="bg.inset">
        <Box
          display="flex"
          flexDirection={{ base: "column", "@md": "row" }}
          gap={{ base: 1, "@sm": 3 }}
          p={{ base: 2, "@md": 4 }}
          bgcolor="bg.surface-raised"
        >
          {swatch()}
          {swatch("accent.secondary")}
          {swatch("accent.dante")}
        </Box>
      </Box>
    ),
  });

  // The same responsive layout below and above `md` (993px): stacked, then a row.
  for (const width of [480, 1024]) {
    test.describe(`at ${width}px`, () => {
      test.use({ viewport: { width, height: 480 } });

      executeMatrixScreenshotTest({
        name: `Box (responsive, ${width}px)`,
        columns: ["layout"],
        rows: ["default"],
        fastNoIsolation: true,
        component: () => (
          <Box
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            gap={{ base: 1, md: 4 }}
            p={{ base: 2, md: 6 }}
            bgcolor="bg.surface-raised"
          >
            {swatch()}
            {swatch("accent.secondary")}
            {swatch("accent.dante")}
          </Box>
        ),
      });
    });
  }
});

test("should render a div with the base classes and nothing else", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Box>Content</Box>);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("DIV");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-box");
  await expect(component).toHaveText("Content");
});

test("should render the element passed as `as`, with its own attributes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Box as="a" href="/docs" p={2}>
      Docs
    </Box>,
  );

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("A");
  await expect(component).toHaveAttribute("href", "/docs");
  await expect(component).toHaveCSS("padding-top", "8px");
});

test("should keep system props off the element's attributes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Box p={2} color="text.primary" width={10} display="flex" data-testid="box" />,
  );

  // ASSERT
  for (const attribute of ["p", "color", "width", "display"])
    await expect(component).not.toHaveAttribute(attribute);
  await expect(component).toHaveAttribute("data-testid", "box");
});

test("should merge a consumer's className and style after its own", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Box p={2} className="custom" style={{ opacity: 0.5 }} />);

  // ASSERT
  await expect(component).toHaveClass("okkly-component okkly-box okkly-box--p custom");
  await expect(component).toHaveCSS("padding-top", "8px");
  await expect(component).toHaveCSS("opacity", "0.5");
});

test.describe("every system prop", () => {
  for (const [prop, [value, property, expected]] of Object.entries(EVERY_SYSTEM_PROP)) {
    test(`should set ${property} from ${prop}={${JSON.stringify(value)}}`, async ({ mount }) => {
      // ARRANGE
      const component = await mount(<Box {...({ [prop]: value } as BoxSystemProps)} />);

      // ASSERT
      await expect(component).toHaveCSS(property, expected);
    });
  }
});

test.describe("spacing", () => {
  test("should let a longhand refine its shorthand", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Box p={2} pt={5} />);

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "20px");
    await expect(component).toHaveCSS("padding-bottom", "8px");
  });

  test("should set only the inline axis for mx", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Box mx={3} />);

    // ASSERT
    await expect(component).toHaveCSS("margin-left", "12px");
    await expect(component).toHaveCSS("margin-right", "12px");
    await expect(component).toHaveCSS("margin-top", "0px");
  });

  test("should accept negative steps and raw CSS", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Box mt={-2} mb="1.5rem" />);

    // ASSERT
    await expect(component).toHaveCSS("margin-top", "-8px");
    await expect(component).toHaveCSS("margin-bottom", "24px");
  });

  test("should rescale numeric steps when the spacing unit is overridden", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Box p={2} style={{ "--okkly-space-unit": "0.5rem" } as CSSProperties} />,
    );

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "16px");
  });
});

test.describe("sizing", () => {
  test("should read a fraction as a percentage of the container", async ({ mount }) => {
    // ARRANGE
    const component = await mount(
      <Box width={200}>
        <Box width={0.5} height={10} />
      </Box>,
    );

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("width", "100px");
  });
});

test.describe("colors", () => {
  test("should resolve a token path to the token's value", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(<Box bgcolor="bg.surface-raised" color="accent.dante" />);
    const tokenValue = (token: string) =>
      page.evaluate((name) => {
        const probe = document.createElement("div");
        probe.style.color = `var(${name})`;
        document.body.append(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      }, token);

    // ASSERT
    await expect(component).toHaveCSS(
      "background-color",
      await tokenValue("--okkly-bg-surface-raised"),
    );
    await expect(component).toHaveCSS("color", await tokenValue("--okkly-accent-dante"));
  });

  test("should draw a numeric border solid, and let borderColor recolor it", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Box border={2} />);

    // ASSERT
    await expect(component).toHaveCSS("border-top-style", "solid");
    await expect(component).toHaveCSS("border-top-width", "2px");

    // ACT
    await component.update(<Box border={2} borderColor="rgb(1, 2, 3)" />);

    // ASSERT
    await expect(component).toHaveCSS("border-top-color", "rgb(1, 2, 3)");
  });
});

test.describe("responsive values", () => {
  const layout = (
    <Box p={{ base: 1, md: 4 }} flexDirection={{ base: "column", md: "row" }} display="flex" />
  );

  test("should use the base value below the breakpoint", async ({ mount, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 600, height: 400 });
    const component = await mount(layout);

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "4px");
    await expect(component).toHaveCSS("flex-direction", "column");
  });

  test("should switch to the breakpoint's value from its min-width up", async ({ mount, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 1000, height: 400 });
    const component = await mount(layout);

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "16px");
    await expect(component).toHaveCSS("flex-direction", "row");
  });

  test("should let the widest matching breakpoint win", async ({ mount, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 1500, height: 400 });
    const component = await mount(<Box p={{ base: 1, sm: 2, lg: 6 }} />);

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "24px");
  });
});

test.describe("container queries", () => {
  /** A container Box of the given width, around a Box that responds to it. */
  const inContainer = (width: number) => (
    <Box container width={width}>
      <Box
        display="flex"
        flexDirection={{ base: "column", "@md": "row" }}
        p={{ base: 1, md: 2, "@sm": 3 }}
      />
    </Box>
  );

  test("should make `container` a query container, not an attribute", async ({ mount }) => {
    // ARRANGE
    const component = await mount(<Box container />);

    // ASSERT
    await expect(component).toHaveCSS("container-type", "inline-size");
    await expect(component).toHaveClass(/okkly-box--container/);
    await expect(component).not.toHaveAttribute("container");
  });

  test("should use the base value in a container narrower than the key", async ({ mount }) => {
    // ARRANGE
    const component = await mount(inContainer(400));

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("flex-direction", "column");
  });

  test("should switch at the container's width, whatever the viewport", async ({ mount, page }) => {
    // ARRANGE — a viewport narrower than the container's @md
    await page.setViewportSize({ width: 600, height: 400 });
    const component = await mount(inContainer(700));

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("flex-direction", "row");
  });

  test("should let a container value win over a viewport value", async ({ mount, page }) => {
    // ARRANGE — both `md` (viewport) and `@sm` (container) match
    await page.setViewportSize({ width: 1200, height: 400 });
    const component = await mount(inContainer(500));

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("padding-top", "12px");
  });

  test("should never answer to its own container", async ({ mount, page }) => {
    // ARRANGE — the Box is a container itself, with no container around it
    await page.setViewportSize({ width: 1200, height: 400 });
    const component = await mount(<Box container width={700} p={{ base: 1, "@md": 4 }} />);

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "4px");
  });
});
