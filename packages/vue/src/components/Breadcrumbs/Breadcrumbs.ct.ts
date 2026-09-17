import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import Breadcrumbs from "./Breadcrumbs.vue";
import type { BreadcrumbItem } from "./Breadcrumbs.types";

const ITEMS: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Button" },
];

const LONG_PATH: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Okryshto", href: "/projects/okkly" },
  { label: "Packages", href: "/projects/okkly/packages" },
  { label: "react", href: "/projects/okkly/packages/react" },
  { label: "Button" },
];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Breadcrumbs (variants)",
    columns: ["default", "custom-separator", "with-icons", "single-crumb"],
    rows: ["default"],
    fastNoIsolation: true,
    component: Breadcrumbs,
    args: (column) => ({
      props: {
        items:
          column === "single-crumb"
            ? [{ label: "Button" }]
            : column === "with-icons"
              ? ITEMS.map((item) => ({ ...item, icon: MOCK_PLAYWRIGHT_ICON }))
              : ITEMS,
      } as never,
      slots: (column === "custom-separator" ? { separator: "/" } : {}) as Record<string, string>,
    }),
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
    component: Breadcrumbs,
    args: () => ({ props: { items: LONG_PATH, maxItems: 4 } as never }),
  });
});

test("should render every crumb", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Breadcrumbs, { props: { items: ITEMS } as never });

  // ASSERT
  await expect(component).toContainText("Home");
  await expect(component).toContainText("Components");
  await expect(component).toContainText("Button");
});

test("should render every non-last crumb that has an href as a link", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Breadcrumbs, { props: { items: ITEMS } as never });

  // ASSERT
  await expect(component.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(component.getByRole("link", { name: "Components" })).toHaveAttribute(
    "href",
    "/components",
  );
});

test("should render the last crumb as plain text with aria-current", async ({ mount }) => {
  // ARRANGE — the trailing crumb is where you already are, so its href is ignored.
  const component = await mount(Breadcrumbs, {
    props: { items: [...ITEMS.slice(0, 2), { label: "Button", href: "/button" }] } as never,
  });

  // ASSERT
  await expect(component.getByRole("link", { name: "Button" })).toHaveCount(0);
  await expect(component.getByText("Button")).toHaveAttribute("aria-current", "page");
});

test("should render a crumb without href as plain text even when it is not last", async ({
  mount,
}) => {
  // ARRANGE
  const component = await mount(Breadcrumbs, {
    props: {
      items: [{ label: "Home", href: "/" }, { label: "No link" }, { label: "Button" }],
    } as never,
  });

  // ASSERT
  await expect(component.getByRole("link", { name: "No link" })).toHaveCount(0);
});

test("should render a chevron separator between crumbs by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Breadcrumbs, { props: { items: ITEMS } as never });

  // ASSERT
  await expect(component.locator(".okkly-breadcrumbs__separator")).toHaveCount(ITEMS.length - 1);
});

test("should render a custom separator", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Breadcrumbs, {
    props: { items: ITEMS } as never,
    slots: { separator: "/" },
  });

  // ASSERT
  await expect(component.locator(".okkly-breadcrumbs__separator")).toHaveText(["/", "/"]);
});

test("should render a leading icon per crumb when provided", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Breadcrumbs, {
    props: {
      items: [{ label: "Home", href: "/", icon: MOCK_PLAYWRIGHT_ICON }, { label: "Button" }],
    } as never,
  });

  // ASSERT
  await expect(component.locator(".okkly-breadcrumbs__icon")).toBeVisible();
});

test("should wrap everything in a nav with an accessible breadcrumb label", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Breadcrumbs, { props: { items: ITEMS } as never });

  // ASSERT — the navigation landmark is the component root itself.
  await expect(component).toHaveRole("navigation");
  await expect(component).toHaveAccessibleName("breadcrumb");
});

test.describe("collapsing", () => {
  test("should collapse the middle crumbs behind an ellipsis past maxItems", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Breadcrumbs, {
      props: { items: LONG_PATH, maxItems: 4 } as never,
    });

    // ASSERT
    await expect(component).toContainText("Home");
    await expect(component).toContainText("Button");
    await expect(component).not.toContainText("Okryshto");
    await expect(component.getByRole("button", { name: "Show all crumbs" })).toBeVisible();
  });

  test("should expand to every crumb when the ellipsis is activated", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Breadcrumbs, {
      props: { items: LONG_PATH, maxItems: 4 } as never,
    });

    // ACT
    await component.getByRole("button", { name: "Show all crumbs" }).click();

    // ASSERT
    await expect(component).toContainText("Okryshto");
    await expect(component.getByRole("button", { name: "Show all crumbs" })).toHaveCount(0);
  });

  test("should not collapse when the item count fits within maxItems", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Breadcrumbs, { props: { items: ITEMS, maxItems: 8 } as never });

    // ASSERT
    await expect(component.getByRole("button", { name: "Show all crumbs" })).toHaveCount(0);
  });

  test("should respect itemsBeforeCollapse and itemsAfterCollapse", async ({ mount }) => {
    // ARRANGE
    const component = await mount(Breadcrumbs, {
      props: {
        items: LONG_PATH,
        maxItems: 4,
        itemsBeforeCollapse: 2,
        itemsAfterCollapse: 2,
      } as never,
    });

    // ASSERT
    await expect(component).toContainText("Home");
    await expect(component).toContainText("Projects");
    await expect(component).toContainText("react");
    await expect(component).toContainText("Button");
    await expect(component).not.toContainText("Okryshto");
    await expect(component).not.toContainText("Packages");
  });
});
