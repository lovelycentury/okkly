import {
  BOX_MATRICES,
  BOX_RESPONSIVE_LAYOUT,
  BOX_SYSTEM_PROP_CASES,
  boxInContainer,
} from "@okkly/shared/testing";
import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import BoxFixture from "../../playwright/fixtures/BoxFixture.vue";
import Box from "./Box.vue";

// The cases and matrix layouts are @okkly/shared's, so every framework's Box is
// held to the same behaviour and renders the same screenshots. `BoxFixture`
// renders a layout (`{ outer, inner, swatches }`) the way @okkly/react's
// `renderTree` does.

test.describe("Screenshot tests", () => {
  for (const matrix of BOX_MATRICES) {
    const capture = () =>
      executeMatrixScreenshotTest({
        name: matrix.name,
        columns: matrix.columns,
        rows: matrix.rows,
        fastNoIsolation: true,
        component: BoxFixture,
        args: (column, row) => ({ props: matrix.cell(column, row) }),
      });

    const viewport = matrix.viewport;
    if (!viewport) capture();
    else
      test.describe(`at ${viewport.width}px`, () => {
        test.use({ viewport });
        capture();
      });
  }
});

test("should render a div with the base classes and nothing else", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Box, { slots: { default: "Content" } });

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("DIV");
  await expect(component).toHaveAttribute("class", "okkly-component okkly-box");
  await expect(component).toHaveText("Content");
});

test("should render the element passed as `as`, with its own attributes", async ({ mount }) => {
  // ARRANGE — `href` is not a prop, so it falls through to the element
  const component = await mount(Box, {
    props: { as: "a", href: "/docs", p: 2 } as never,
    slots: { default: "Docs" },
  });

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("A");
  await expect(component).toHaveAttribute("href", "/docs");
  await expect(component).toHaveCSS("padding-top", "8px");
});

test("should keep system props off the element's attributes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Box, {
    props: {
      p: 2,
      color: "text.primary",
      width: 10,
      display: "flex",
      container: true,
      "data-testid": "box",
    } as never,
  });

  // ASSERT
  for (const attribute of ["p", "color", "width", "display", "container"])
    await expect(component).not.toHaveAttribute(attribute);
  await expect(component).toHaveAttribute("data-testid", "box");
});

test("should merge a consumer's class and style after its own", async ({ mount }) => {
  // ARRANGE — `class` and `style` fall through and merge with the root's own
  const component = await mount(Box, {
    props: { p: 2, class: "custom", style: { opacity: "0.5" } } as never,
  });

  // ASSERT
  await expect(component).toHaveClass("okkly-component okkly-box okkly-box--p custom");
  await expect(component).toHaveCSS("padding-top", "8px");
  await expect(component).toHaveCSS("opacity", "0.5");
});

test.describe("every system prop", () => {
  for (const [prop, [value, property, expected]] of Object.entries(BOX_SYSTEM_PROP_CASES)) {
    test(`should set ${property} from ${prop}=${JSON.stringify(value)}`, async ({ mount }) => {
      // ARRANGE
      const component = await mount(Box, { props: { [prop]: value } });

      // ASSERT
      await expect(component).toHaveCSS(property, expected);
    });
  }
});

test.describe("spacing", () => {
  test("should let a longhand refine its shorthand", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Box, { props: { p: 2, pt: 5 } });

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "20px");
    await expect(component).toHaveCSS("padding-bottom", "8px");
  });

  test("should set only the inline axis for mx", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Box, { props: { mx: 3 } });

    // ASSERT
    await expect(component).toHaveCSS("margin-left", "12px");
    await expect(component).toHaveCSS("margin-right", "12px");
    await expect(component).toHaveCSS("margin-top", "0px");
  });

  test("should accept negative steps and raw CSS", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Box, { props: { mt: -2, mb: "1.5rem" } });

    // ASSERT
    await expect(component).toHaveCSS("margin-top", "-8px");
    await expect(component).toHaveCSS("margin-bottom", "24px");
  });

  test("should rescale numeric steps when the spacing unit is overridden", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Box, {
      props: { p: 2, style: { "--okkly-space-unit": "0.5rem" } } as never,
    });

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "16px");
  });
});

test.describe("sizing", () => {
  test("should read a fraction as a percentage of the container", async ({ mount }) => {
    // ARRANGE
    const component = await mount(BoxFixture, {
      props: { outer: { width: 200 }, inner: { width: 0.5, height: 10 }, swatches: [] },
    });

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("width", "100px");
  });
});

test.describe("colors", () => {
  test("should resolve a token path to the token's value", async ({ mount, page }) => {
    // ARRANGE
    const component = await mount(Box, {
      props: { bgcolor: "bg.surface-raised", color: "accent.dante" },
    });
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
    const component = await mount(Box, { props: { border: 2 } });

    // ASSERT
    await expect(component).toHaveCSS("border-top-style", "solid");
    await expect(component).toHaveCSS("border-top-width", "2px");

    // ACT
    await component.update({ props: { border: 2, borderColor: "rgb(1, 2, 3)" } });

    // ASSERT
    await expect(component).toHaveCSS("border-top-color", "rgb(1, 2, 3)");
  });
});

test.describe("responsive values", () => {
  test("should use the base value below the breakpoint", async ({ mount, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 600, height: 400 });
    const component = await mount(Box, { props: BOX_RESPONSIVE_LAYOUT });

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "4px");
    await expect(component).toHaveCSS("flex-direction", "column");
  });

  test("should switch to the breakpoint's value from its min-width up", async ({ mount, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 1000, height: 400 });
    const component = await mount(Box, { props: BOX_RESPONSIVE_LAYOUT });

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "16px");
    await expect(component).toHaveCSS("flex-direction", "row");
  });

  test("should let the widest matching breakpoint win", async ({ mount, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 1500, height: 400 });
    const component = await mount(Box, { props: { p: { base: 1, sm: 2, lg: 6 } } });

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "24px");
  });
});

test.describe("container queries", () => {
  test("should make `container` a query container, not an attribute", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Box, { props: { container: true } });

    // ASSERT
    await expect(component).toHaveCSS("container-type", "inline-size");
    await expect(component).toHaveClass(/okkly-box--container/);
    await expect(component).not.toHaveAttribute("container");
  });

  test("should use the base value in a container narrower than the key", async ({ mount }) => {
    // ARRANGE
    const component = await mount(BoxFixture, { props: boxInContainer(400) });

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("flex-direction", "column");
  });

  test("should switch at the container's width, whatever the viewport", async ({ mount, page }) => {
    // ARRANGE — a viewport narrower than the container's @md
    await page.setViewportSize({ width: 600, height: 400 });
    const component = await mount(BoxFixture, { props: boxInContainer(700) });

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("flex-direction", "row");
  });

  test("should let a container value win over a viewport value", async ({ mount, page }) => {
    // ARRANGE — both `md` (viewport) and `@sm` (container) match
    await page.setViewportSize({ width: 1200, height: 400 });
    const component = await mount(BoxFixture, { props: boxInContainer(500) });

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("padding-top", "12px");
  });

  test("should never answer to its own container", async ({ mount, page }) => {
    // ARRANGE — the Box is a container itself, with no container around it
    await page.setViewportSize({ width: 1200, height: 400 });
    const component = await mount(Box, {
      props: { container: true, width: 700, p: { base: 1, "@md": 4 } },
    });

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "4px");
  });
});
