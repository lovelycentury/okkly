import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import Icon from "./Icon.vue";
import type { IconColor, IconSize } from "./Icon.types";

const COLORS = [
  "inherit",
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
  "muted",
] as const satisfies readonly IconColor[];
const SIZES = ["small", "medium", "large", "inherit"] as const satisfies readonly IconSize[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Icon (colors)",
    columns: COLORS,
    rows: SIZES,
    fastNoIsolation: true,
    component: Icon,
    args: (column, row) => ({ props: { name: "iconStar", color: column, fontSize: row } as never }),
  });

  executeMatrixScreenshotTest({
    name: "Icon (inline with text)",
    columns: SIZES,
    rows: ["default"],
    fastNoIsolation: true,
    component: Icon,
    args: (column) => ({ props: { name: "iconStar", fontSize: column } as never }),
  });
});

test("should render a decorative icon with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Icon, { props: { name: "iconStar" } });

  // ASSERT
  expect(await component.evaluate((element) => element.tagName)).toBe("SPAN");
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-icon/);
  await expect(component).not.toHaveClass(/okkly-icon--/);
  await expect(component).toHaveAttribute("aria-hidden", "true");
  await expect(component.locator("svg")).toBeAttached();
});

test("should render the same markup whether the icon arrives by name or by value", async ({
  mount,
}) => {
  // ARRANGE — MOCK_PLAYWRIGHT_ICON is the `iconStar` markup, so resolving the
  // name must land on exactly what passing the markup directly produces.
  const byName = await mount(Icon, { props: { name: "iconStar" } });
  const nameMarkup = await byName.evaluate((element) => element.innerHTML.trim());
  await byName.unmount();

  const byValue = await mount(Icon, { props: { icon: MOCK_PLAYWRIGHT_ICON } });
  const valueMarkup = await byValue.evaluate((element) => element.innerHTML.trim());

  // ASSERT — the browser normalises both sides identically as it parses them.
  expect(nameMarkup).toContain("<svg");
  expect(nameMarkup).toBe(valueMarkup);
});

test("should apply size modifiers and clear them back to the default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Icon, { props: { name: "iconStar", fontSize: "small" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--small/);

  // ACT
  await component.update({ props: { fontSize: "large" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--large/);

  // ACT
  await component.update({ props: { fontSize: "inherit" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--inherit/);

  // ACT
  await component.update({ props: { fontSize: "medium" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon--/);
});

test("should apply colour modifiers and clear them back to inherit", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Icon, { props: { name: "iconStar", color: "danger" } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--color-danger/);

  // ACT
  await component.update({ props: { color: "inherit" } });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon--color-/);
});

test("should become an image with a name once titleAccess is given", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Icon, { props: { name: "iconStar", titleAccess: "Favourite" } });

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("Favourite");
  await expect(component).not.toHaveAttribute("aria-hidden");
});

test("should pass unknown props through to the rendered element", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Icon, {
    props: { name: "iconStar", "data-testid": "glyph", class: "custom" } as never,
  });

  // ASSERT
  await expect(component).toHaveClass(/custom/);
  await expect(component).toHaveAttribute("data-testid", "glyph");
});

test("should paint the glyph with the surrounding text colour by default", async ({ mount }) => {
  // ARRANGE — `currentColor` in the asset is what makes `color="inherit"` work.
  const component = await mount(Icon, {
    props: { name: "iconStar", style: "color: rgb(255, 0, 0)" } as never,
  });

  // ASSERT
  await expect(component).toHaveCSS("color", "rgb(255, 0, 0)");
});
