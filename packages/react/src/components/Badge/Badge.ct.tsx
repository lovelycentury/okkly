import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import { Badge } from "./Badge";
import { Avatar } from "../Avatar/Avatar";
import type { BadgeColor } from "./Badge";

const COLORS = [
  "primary",
  "dante",
  "indigo",
  "violet",
  "ember",
  "ice",
  "success",
  "warning",
  "danger",
] as const satisfies readonly BadgeColor[];

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Badge (colors)",
    columns: COLORS,
    rows: ["standalone", "dot", "anchored"],
    fastNoIsolation: true,
    component: (column, row) =>
      row === "anchored" ? (
        <Badge badgeContent={5} color={column}>
          <Avatar initials="OK" />
        </Badge>
      ) : (
        <Badge badgeContent={5} color={column} variant={row === "dot" ? "dot" : "standard"} />
      ),
  });

  executeMatrixScreenshotTest({
    name: "Badge (placement)",
    columns: ["top-right", "top-left", "bottom-right", "bottom-left"],
    rows: ["circular", "rectangular"],
    fastNoIsolation: true,
    component: (column, row) => {
      const [vertical, horizontal] = column.split("-") as ["top" | "bottom", "left" | "right"];
      return (
        <Badge
          badgeContent={8}
          color="danger"
          overlap={row}
          anchorOrigin={{ vertical, horizontal }}
        >
          <Avatar initials="OK" shape={row === "circular" ? "circle" : "rounded"} />
        </Badge>
      );
    },
  });
});

test("should render a standalone neutral pill by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Badge badgeContent={5} />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-badge--standalone/);
  await expect(component).not.toHaveClass(/okkly-badge--color-/);
  await expect(component.getByTestId("badge-content")).toHaveText("5");
});

test("should apply a color modifier only when color is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Badge badgeContent={3} color="danger" />);

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--color-danger/);

  // ACT
  await component.update(<Badge badgeContent={3} />);

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-badge--color-/);
});

test("should cap numeric overflow at max+", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Badge badgeContent={120} max={99} color="danger" />);

  // ASSERT
  await expect(component.getByTestId("badge-content")).toHaveText("99+");
});

test("should hide zero counts", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Badge badgeContent={0} />);

  // ASSERT
  await expect(component.getByTestId("badge-content")).toHaveClass(
    /okkly-badge__content--invisible/,
  );
});

test("should render a dot variant without text", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Badge variant="dot" color="success" />);
  const content = component.getByTestId("badge-content");

  // ASSERT
  await expect(content).toHaveClass(/okkly-badge__content--dot/);
  await expect(content).toBeEmpty();
});

test("should anchor to its children", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Badge badgeContent={2} color="primary">
      <Avatar initials="OK" />
    </Badge>,
  );

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-badge--standalone/);
  await expect(component.getByText("OK")).toBeVisible();
  await expect(component.getByTestId("badge-content")).toHaveText("2");
});

test("should apply overlap and anchor origin classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(
    <Badge
      badgeContent={1}
      overlap="rectangular"
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <span>Anchor</span>
    </Badge>,
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--overlap-rectangular/);
  await expect(component.getByTestId("badge-content")).toHaveClass(/okkly-badge__content--bottom/);
  await expect(component.getByTestId("badge-content")).toHaveClass(/okkly-badge__content--left/);
});

test("should hide the badge when invisible", async ({ mount }) => {
  // ARRANGE
  const component = await mount(<Badge badgeContent={4} invisible />);

  // ASSERT
  await expect(component.getByTestId("badge-content")).toHaveClass(
    /okkly-badge__content--invisible/,
  );
});
