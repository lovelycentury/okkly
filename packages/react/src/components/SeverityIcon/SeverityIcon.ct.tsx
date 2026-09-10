import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest, MOCK_PLAYWRIGHT_ICON } from "../../playwright/screenshots";
import { SeverityIcon } from "./SeverityIcon";
import { Icon } from "../Icon/Icon";
import type { SeverityIconSeverity, SeverityIconShape, SeverityIconSize } from "./SeverityIcon";

const SEVERITIES = [
  "success",
  "info",
  "warning",
  "danger",
  "primary",
  "neutral",
] as const satisfies readonly SeverityIconSeverity[];
const SIZES = ["small", "medium", "large"] as const satisfies readonly SeverityIconSize[];
const SHAPES = ["circle", "rounded"] as const satisfies readonly SeverityIconShape[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "SeverityIcon (severities)",
    columns: SEVERITIES,
    rows: SHAPES,
    fastNoIsolation: true,
    component: (column, row) => <SeverityIcon severity={column} shape={row} />,
  });

  executeMatrixScreenshotTest({
    name: "SeverityIcon (sizes)",
    columns: SIZES,
    rows: [...SHAPES, "custom-icon"],
    fastNoIsolation: true,
    component: (column, row) => (
      <SeverityIcon
        size={column}
        shape={row === "rounded" ? "rounded" : "circle"}
        icon={row === "custom-icon" ? <Icon icon={MOCK_PLAYWRIGHT_ICON} /> : undefined}
      />
    ),
  });
});

test("should render with the default classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SeverityIcon />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-severity-icon/);
  await expect(component).not.toHaveClass(
    /okkly-severity-icon--(success|warning|danger|primary|neutral|small|large|rounded)/,
  );
  await expect(component.locator(".okkly-severity-icon__icon svg")).toBeAttached();
});

test("should apply a severity modifier only for non-info severities", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SeverityIcon severity="success" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-severity-icon--success/);

  // ACT
  await component.update(<SeverityIcon severity="info" />);

  // ASSERT
  await expect(component).not.toHaveClass(
    /okkly-severity-icon--(success|warning|danger|primary|neutral)/,
  );
});

test("should apply size modifiers only for non-medium sizes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SeverityIcon size="small" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-severity-icon--small/);

  // ACT
  await component.update(<SeverityIcon size="medium" />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-severity-icon--(small|large)/);
});

test("should apply the rounded shape modifier", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SeverityIcon shape="rounded" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-severity-icon--rounded/);
});

test("should render a custom icon override", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <SeverityIcon icon={<Icon icon={MOCK_PLAYWRIGHT_ICON} className="glyph" />} />,
  );

  // ASSERT — the built-in glyph is replaced, not layered underneath.
  await expect(component.locator(".glyph")).toBeVisible();
  await expect(component.locator(".okkly-severity-icon__icon > svg")).toHaveCount(0);
});

test("should pick a distinct default glyph per severity", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<SeverityIcon severity="success" />);
  const path = component.locator(".okkly-severity-icon__icon svg path").first();

  // ASSERT
  await expect(path).toHaveAttribute("d", /9 17/);

  // ACT
  await component.update(<SeverityIcon severity="danger" />);

  // ASSERT
  await expect(path).toHaveAttribute("d", /6 18/);
});
