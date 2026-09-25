import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";

const ITEMS = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Button" },
];

const LONG_PATH = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Okryshto", href: "/projects/okkly" },
  { label: "Packages", href: "/projects/okkly/packages" },
  { label: "react", href: "/projects/okkly/packages/react" },
  { label: "Button" },
];

/**
 * The items as a template literal. An icon is the `glyph` template the matrix
 * declares next to the component, as SVG markup cannot sit in an attribute.
 */
const literal = (items: readonly { label: string; href?: string }[], icon = false) =>
  `[${items
    .map(
      ({ label, href }) =>
        `{ label: '${label}'${href ? `, href: '${href}'` : ""}${icon ? ", icon: glyph" : ""} }`,
    )
    .join(", ")}]`;

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Breadcrumbs (variants)",
    columns: ["default", "custom-separator", "with-icons", "single-crumb"],
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) =>
      `<div>
        <ng-template #glyph>${MOCK_PLAYWRIGHT_ICON}</ng-template>
        <okkly-breadcrumbs [items]="${
          column === "single-crumb"
            ? literal([{ label: "Button" }])
            : literal(ITEMS, column === "with-icons")
        }"${column === "custom-separator" ? ` separator="/"` : ""} />
      </div>`,
  });

  executeMatrixScreenshotTest({
    name: "Breadcrumbs (collapsed)",
    columns: ["collapsed", "expanded"],
    rows: ["default"],
    hooks: {
      beforeEach: async (component, _page, column) => {
        if (column === "expanded") {
          await component.getByRole("button", { name: "Show all crumbs" }).click();
        }
      },
    },
    component: () => `<okkly-breadcrumbs [items]="${literal(LONG_PATH)}" [maxItems]="4" />`,
  });
});

test("should render every crumb", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-breadcrumbs [items]="state().items" />`, {
    items: ITEMS,
  });

  // ASSERT
  await expect(component).toContainText("Home");
  await expect(component).toContainText("Components");
  await expect(component).toContainText("Button");
});

test("should render every non-last crumb that has an href as a link", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-breadcrumbs [items]="state().items" />`, {
    items: ITEMS,
  });

  // ASSERT
  await expect(component.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(component.getByRole("link", { name: "Components" })).toHaveAttribute(
    "href",
    "/components",
  );
});

test("should render the last crumb as plain text with aria-current", async ({ mountTemplate }) => {
  // ARRANGE — the trailing crumb is where you already are, so its href is ignored.
  const component = await mountTemplate(`<okkly-breadcrumbs [items]="state().items" />`, {
    items: [...ITEMS.slice(0, 2), { label: "Button", href: "/button" }],
  });

  // ASSERT
  await expect(component.getByRole("link", { name: "Button" })).toHaveCount(0);
  await expect(component.getByText("Button")).toHaveAttribute("aria-current", "page");
});

test("should render a crumb without href as plain text even when it is not last", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-breadcrumbs [items]="state().items" />`, {
    items: [{ label: "Home", href: "/" }, { label: "No link" }, { label: "Button" }],
  });

  // ASSERT
  await expect(component.getByRole("link", { name: "No link" })).toHaveCount(0);
  await expect(component.getByText("No link")).not.toHaveAttribute("aria-current");
});

test("should render a chevron separator between crumbs by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-breadcrumbs [items]="state().items" />`, {
    items: ITEMS,
  });
  const separators = component.locator(".okkly-breadcrumbs__separator");

  // ASSERT
  await expect(separators).toHaveCount(ITEMS.length - 1);
  await expect(separators.first().locator("svg")).toBeAttached();
  await expect(separators.first()).toHaveAttribute("aria-hidden", "true");
});

test("should render a custom separator", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-breadcrumbs [items]="state().items" separator="/" />`,
    { items: ITEMS },
  );

  // ASSERT
  await expect(component.locator(".okkly-breadcrumbs__separator")).toHaveText(["/", "/"]);
});

test("should render a separator template in every gap", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-breadcrumbs [items]="state().items">
      <ng-template okklyBreadcrumbsSeparator><b class="custom-separator">›</b></ng-template>
    </okkly-breadcrumbs>`,
    { items: ITEMS },
  );

  // ASSERT
  await expect(component.locator(".okkly-breadcrumbs__separator .custom-separator")).toHaveCount(2);
});

test.describe("icon", () => {
  test("should render a leading icon per crumb from SVG markup", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(`<okkly-breadcrumbs [items]="state().items" />`, {
      items: [{ label: "Home", href: "/", icon: MOCK_PLAYWRIGHT_ICON }, { label: "Button" }],
    });
    const icon = component.locator(".okkly-breadcrumbs__icon");

    // ASSERT
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(icon.locator("svg")).toBeVisible();
  });

  test("should render a leading icon per crumb from a template", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<div>
        <ng-template #glyph><okkly-icon class="glyph" name="iconHome" /></ng-template>
        <okkly-breadcrumbs [items]="[{ label: 'Home', href: '/', icon: glyph }, { label: 'Button' }]" />
      </div>`,
    );

    // ASSERT
    await expect(component.locator(".okkly-breadcrumbs__icon .glyph")).toBeVisible();
  });
});

test("should be a navigation landmark with an accessible breadcrumb label", async ({
  mountTemplate,
}) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-breadcrumbs [items]="state().items" />`, {
    items: ITEMS,
  });

  // ASSERT — the navigation landmark is the component root itself.
  await expect(component).toHaveRole("navigation");
  await expect(component).toHaveAccessibleName("breadcrumb");
  await expect(component).toHaveClass(/okkly-component okkly-breadcrumbs/);
});

test.describe("collapsing", () => {
  test("should collapse the middle crumbs behind an ellipsis past maxItems", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-breadcrumbs [items]="state().items" maxItems="4" />`,
      { items: LONG_PATH },
    );

    // ASSERT
    await expect(component).toContainText("Home");
    await expect(component).toContainText("Button");
    await expect(component).not.toContainText("Okryshto");
    await expect(component.getByRole("button", { name: "Show all crumbs" })).toBeVisible();
  });

  test("should expand to every crumb when the ellipsis is activated", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-breadcrumbs [items]="state().items" [maxItems]="4" />`,
      { items: LONG_PATH },
    );

    // ACT
    await component.getByRole("button", { name: "Show all crumbs" }).click();

    // ASSERT
    await expect(component).toContainText("Okryshto");
    await expect(component.getByRole("button", { name: "Show all crumbs" })).toHaveCount(0);
  });

  test("should not collapse when the item count fits within maxItems", async ({
    mountTemplate,
  }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-breadcrumbs [items]="state().items" [maxItems]="8" />`,
      { items: ITEMS },
    );

    // ASSERT
    await expect(component.getByRole("button", { name: "Show all crumbs" })).toHaveCount(0);
  });

  test("should respect itemsBeforeCollapse and itemsAfterCollapse", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-breadcrumbs [items]="state().items" [maxItems]="4" [itemsBeforeCollapse]="2" [itemsAfterCollapse]="2" />`,
      { items: LONG_PATH },
    );

    // ASSERT
    await expect(component).toContainText("Home");
    await expect(component).toContainText("Projects");
    await expect(component).toContainText("react");
    await expect(component).toContainText("Button");
    await expect(component).not.toContainText("Okryshto");
    await expect(component).not.toContainText("Packages");
  });

  test("should name the ellipsis with expandAriaLabel", async ({ mountTemplate }) => {
    // ARRANGE
    const component = await mountTemplate(
      `<okkly-breadcrumbs [items]="state().items" [maxItems]="4" expandAriaLabel="Show path" />`,
      { items: LONG_PATH },
    );

    // ASSERT
    await expect(component.getByRole("button", { name: "Show path" })).toBeVisible();
  });
});
