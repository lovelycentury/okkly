import {
  BOX_MATRICES,
  BOX_RESPONSIVE_LAYOUT,
  BOX_SYSTEM_PROP_CASES,
  boxInContainer,
  boxSwatch,
  type BoxTestProps,
  type BoxTree,
} from "@okkly/shared/testing";
import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";

// The cases and matrix layouts are @okkly/shared's, so every framework's Box is
// held to the same behaviour and renders the same screenshots.

/** A template binding: `[p]="2"`, `[flexDirection]="{'base':'column','md':'row'}"`. */
const binding = (name: string, value: unknown) =>
  `[${name}]="${JSON.stringify(value).replaceAll('"', "'")}"`;

/** A `div` decorated with `okklyBox`, every prop bound. */
const box = (props: BoxTestProps, content = "") =>
  `<div okklyBox ${Object.entries(props)
    .map(([name, value]) => binding(name, value))
    .join(" ")}>${content}</div>`;

/** Renders a shared test layout — the counterpart of @okkly/react's `renderTree`. */
const renderTree = ({ outer, inner, swatches }: BoxTree) => {
  const content = swatches.map((color) => box(boxSwatch(color))).join("");
  return box(outer, inner ? box(inner, content) : content);
};

test.describe("Screenshot tests", () => {
  for (const matrix of BOX_MATRICES) {
    const capture = () =>
      executeMatrixScreenshotTest({
        name: matrix.name,
        columns: matrix.columns,
        rows: matrix.rows,
        fastNoIsolation: true,
        component: (column, row) => renderTree(matrix.cell(column, row)),
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

test("should put the base classes, and nothing else, on the element", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<div okklyBox>Content</div>`);

  // ASSERT
  await expect(component).toHaveAttribute("class", "okkly-component okkly-box");
  await expect(component).toHaveText("Content");
});

test("should decorate whatever element it sits on, which keeps its own attributes", async ({
  mountTemplate,
}) => {
  // ARRANGE — the counterpart of React's `as`
  const component = await mountTemplate(`<a okklyBox href="/docs" [p]="2">Docs</a>`);

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("A");
  await expect(component).toHaveAttribute("href", "/docs");
  await expect(component).toHaveCSS("padding-top", "8px");
});

test("should leave no attribute behind for a bound system prop", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyBox [p]="2" [color]="'text.primary'" [width]="10" [display]="'flex'" [container]="true" data-testid="box"></div>`,
  );

  // ASSERT
  for (const attribute of ["p", "color", "width", "display", "container"])
    await expect(component).not.toHaveAttribute(attribute);
  await expect(component).toHaveAttribute("data-testid", "box");
});

test("should read a numeric attribute as a number", async ({ mountTemplate }) => {
  // ARRANGE — `p="2"` is the string "2", read as the step 2 rather than as CSS
  const component = await mountTemplate(
    `<div okklyBox width="200"><div okklyBox p="2" width="0.5"></div></div>`,
  );

  // ASSERT
  const inner = component.locator(".okkly-box");
  await expect(inner).toHaveCSS("padding-top", "8px");
  await expect(inner).toHaveCSS("width", "100px");
});

test("should merge the element's own class and style with its own", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<div okklyBox [p]="2" class="custom" style="opacity: 0.5"></div>`,
  );

  // ASSERT
  await expect(component).toHaveClass(/\bcustom\b/);
  await expect(component).toHaveClass(/\bokkly-box--p\b/);
  await expect(component).toHaveCSS("padding-top", "8px");
  await expect(component).toHaveCSS("opacity", "0.5");
});

test.describe("every system prop", () => {
  for (const [prop, [value, property, expected]] of Object.entries(BOX_SYSTEM_PROP_CASES)) {
    test(`should set ${property} from ${prop}=${JSON.stringify(value)}`, async ({
      mountTemplate,
    }) => {
      // ARRANGE
      const component = await mountTemplate(`<div okklyBox [${prop}]="state().value"></div>`, {
        value,
      });

      // ASSERT
      await expect(component).toHaveCSS(property, expected);
    });
  }
});

test.describe("spacing", () => {
  test("should let a longhand refine its shorthand", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<div okklyBox [p]="2" [pt]="5"></div>`);

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "20px");
    await expect(component).toHaveCSS("padding-bottom", "8px");
  });

  test("should set only the inline axis for mx", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<div okklyBox [mx]="3"></div>`);

    // ASSERT
    await expect(component).toHaveCSS("margin-left", "12px");
    await expect(component).toHaveCSS("margin-right", "12px");
    await expect(component).toHaveCSS("margin-top", "0px");
  });

  test("should accept negative steps and raw CSS", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<div okklyBox [mt]="-2" mb="1.5rem"></div>`);

    // ASSERT
    await expect(component).toHaveCSS("margin-top", "-8px");
    await expect(component).toHaveCSS("margin-bottom", "24px");
  });

  test("should rescale numeric steps when the spacing unit is overridden", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<div okklyBox [p]="2" style="--okkly-space-unit: 0.5rem"></div>`,
    );

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "16px");
  });
});

test.describe("sizing", () => {
  test("should read a fraction as a percentage of the container", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      renderTree({ outer: { width: 200 }, inner: { width: 0.5, height: 10 }, swatches: [] }),
    );

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("width", "100px");
  });
});

test.describe("colors", () => {
  test("should resolve a token path to the token's value", async ({ mountTemplate, page }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<div okklyBox bgcolor="bg.surface-raised" color="accent.dante"></div>`,
    );
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

  test("should draw a numeric border solid, and let borderColor recolor it", async ({
    mountTemplate,
    update,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<div okklyBox [border]="2" [borderColor]="state().color"></div>`,
    );

    // ASSERT
    await expect(component).toHaveCSS("border-top-style", "solid");
    await expect(component).toHaveCSS("border-top-width", "2px");

    // ACT
    await update({ color: "rgb(1, 2, 3)" });

    // ASSERT
    await expect(component).toHaveCSS("border-top-color", "rgb(1, 2, 3)");
  });
});

test.describe("responsive values", () => {
  test("should use the base value below the breakpoint", async ({ mountTemplate, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 600, height: 400 });
    const component = await mountTemplate(box(BOX_RESPONSIVE_LAYOUT));

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "4px");
    await expect(component).toHaveCSS("flex-direction", "column");
  });

  test("should switch to the breakpoint's value from its min-width up", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE
    await page.setViewportSize({ width: 1000, height: 400 });
    const component = await mountTemplate(box(BOX_RESPONSIVE_LAYOUT));

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "16px");
    await expect(component).toHaveCSS("flex-direction", "row");
  });

  test("should let the widest matching breakpoint win", async ({ mountTemplate, page }) => {
    // ARRANGE
    await page.setViewportSize({ width: 1500, height: 400 });
    const component = await mountTemplate(box({ p: { base: 1, sm: 2, lg: 6 } }));

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "24px");
  });
});

test.describe("container queries", () => {
  test("should make `container` a query container, not an attribute", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<div okklyBox [container]="true"></div>`);

    // ASSERT
    await expect(component).toHaveCSS("container-type", "inline-size");
    await expect(component).toHaveClass(/okkly-box--container/);
    await expect(component).not.toHaveAttribute("container");
  });

  test("should use the base value in a container narrower than the key", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(renderTree(boxInContainer(400)));

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("flex-direction", "column");
  });

  test("should switch at the container's width, whatever the viewport", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE — a viewport narrower than the container's @md
    await page.setViewportSize({ width: 600, height: 400 });
    const component = await mountTemplate(renderTree(boxInContainer(700)));

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("flex-direction", "row");
  });

  test("should let a container value win over a viewport value", async ({
    mountTemplate,
    page,
  }) => {
    // ARRANGE — both `md` (viewport) and `@sm` (container) match
    await page.setViewportSize({ width: 1200, height: 400 });
    const component = await mountTemplate(renderTree(boxInContainer(500)));

    // ASSERT
    await expect(component.locator(".okkly-box")).toHaveCSS("padding-top", "12px");
  });

  test("should never answer to its own container", async ({ mountTemplate, page }) => {
    // ARRANGE — the Box is a container itself, with no container around it
    await page.setViewportSize({ width: 1200, height: 400 });
    const component = await mountTemplate(
      box({ container: true, width: 700, p: { base: 1, "@md": 4 } }),
    );

    // ASSERT
    await expect(component).toHaveCSS("padding-top", "4px");
  });
});
