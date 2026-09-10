import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { Icon } from "./Icon";
import type { IconColor, IconSize } from "./Icon";

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
    component: (column, row) => <Icon name="iconStar" color={column} fontSize={row} />,
  });

  executeMatrixScreenshotTest({
    name: "Icon (inline with text)",
    columns: SIZES,
    rows: ["default"],
    fastNoIsolation: true,
    component: (column) => (
      <span style={{ fontSize: "1rem" }}>
        before <Icon name="iconStar" fontSize={column} /> after
      </span>
    ),
  });
});

test("should render a decorative icon with no modifier classes by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Icon name="iconStar" />);

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
  const byName = await mount(<Icon name="iconStar" />);
  const nameMarkup = await byName.evaluate((element) => element.innerHTML.trim());
  await byName.unmount();

  const byValue = await mount(<Icon icon={MOCK_PLAYWRIGHT_ICON} />);
  const valueMarkup = await byValue.evaluate((element) => element.innerHTML.trim());

  // ASSERT — the browser normalises both sides identically as it parses them.
  // Trimmed, because the packaged asset keeps the trailing newline of its file.
  expect(nameMarkup).toContain("<svg");
  expect(nameMarkup).toBe(valueMarkup);
});

test("should apply size modifiers and clear them back to the default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Icon name="iconStar" fontSize="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--small/);

  // ACT
  await component.update(<Icon name="iconStar" fontSize="large" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--large/);

  // ACT
  await component.update(<Icon name="iconStar" fontSize="inherit" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--inherit/);

  // ACT
  await component.update(<Icon name="iconStar" fontSize="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon--/);
});

test("should apply colour modifiers and clear them back to inherit", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Icon name="iconStar" color="danger" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-icon--color-danger/);

  // ACT
  await component.update(<Icon name="iconStar" color="inherit" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-icon--color-/);
});

test("should become an image with a name once titleAccess is given", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Icon name="iconStar" titleAccess="Favourite" />);

  // ASSERT
  await expect(component).toHaveRole("img");
  await expect(component).toHaveAccessibleName("Favourite");
  await expect(component).not.toHaveAttribute("aria-hidden");
});

test("should pass unknown props through to the rendered element", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Icon name="iconStar" data-testid="glyph" className="custom" />);

  // ASSERT
  await expect(component).toHaveClass(/custom/);
  await expect(component).toHaveAttribute("data-testid", "glyph");
});

test("should paint the glyph with the surrounding text colour by default", async ({ mount }) => {
  // ARRANGE — `currentColor` in the asset is what makes `color="inherit"` work.
  const component = await mount(
    <span style={{ color: "rgb(255, 0, 0)" }}>
      <Icon name="iconStar" />
    </span>,
  );

  // ASSERT
  await expect(component.locator(".okkly-icon")).toHaveCSS("color", "rgb(255, 0, 0)");
});
