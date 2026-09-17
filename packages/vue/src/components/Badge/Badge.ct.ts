import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Badge from "./Badge.vue";
import type { BadgeColor } from "./Badge.types";

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
    component: Badge,
    args: (column, row) => ({
      props: {
        badgeContent: 5,
        color: column,
        variant: row === "dot" ? "dot" : "standard",
      } as never,
      slots: row === "anchored" ? { default: `<span>OK</span>` } : undefined,
    }),
  });

  executeMatrixScreenshotTest({
    name: "Badge (placement)",
    columns: ["top-right", "top-left", "bottom-right", "bottom-left"],
    rows: ["circular", "rectangular"],
    fastNoIsolation: true,
    component: Badge,
    args: (column, row) => {
      const [vertical, horizontal] = column.split("-") as ["top" | "bottom", "left" | "right"];
      return {
        props: {
          badgeContent: 8,
          color: "danger",
          overlap: row,
          anchorOrigin: { vertical, horizontal },
        } as never,
        slots: { default: `<span>OK</span>` },
      };
    },
  });
});

test("should render a standalone neutral pill by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, { props: { badgeContent: 5 } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-badge--standalone/);
  await expect(component).not.toHaveClass(/okkly-badge--color-/);
  await expect(component.getByTestId("badge-content")).toHaveText("5");
});

test("should apply a color modifier only when color is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, {
    props: { badgeContent: 3 } as never,
  });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-badge--color-/);

  // ACT
  await component.update({ props: { badgeContent: 3, color: "danger" } as never });

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--color-danger/);
});

test("should cap numeric overflow at max+", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, {
    props: { badgeContent: 120, max: 99, color: "danger" } as never,
  });

  // ASSERT
  await expect(component.getByTestId("badge-content")).toHaveText("99+");
});

test("should hide zero counts", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, { props: { badgeContent: 0 } as never });

  // ASSERT
  await expect(component.getByTestId("badge-content")).toHaveClass(
    /okkly-badge__content--invisible/,
  );
});

test("should render a dot variant without text", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, { props: { variant: "dot", color: "success" } as never });
  const content = component.getByTestId("badge-content");

  // ASSERT
  await expect(content).toHaveClass(/okkly-badge__content--dot/);
  await expect(content).toBeEmpty();
});

test("should anchor to its default slot", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, {
    props: { badgeContent: 2, color: "primary" } as never,
    slots: { default: `<span>OK</span>` },
  });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-badge--standalone/);
  await expect(component.getByText("OK")).toBeVisible();
  await expect(component.getByTestId("badge-content")).toHaveText("2");
});

test("should apply overlap and anchor origin classes", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, {
    props: {
      badgeContent: 1,
      overlap: "rectangular",
      anchorOrigin: { vertical: "bottom", horizontal: "left" },
    } as never,
    slots: { default: `<span>Anchor</span>` },
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--overlap-rectangular/);
  await expect(component.getByTestId("badge-content")).toHaveClass(/okkly-badge__content--bottom/);
  await expect(component.getByTestId("badge-content")).toHaveClass(/okkly-badge__content--left/);
});

test("should hide the badge when invisible", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Badge, {
    props: { badgeContent: 4, invisible: true } as never,
  });

  // ASSERT
  await expect(component.getByTestId("badge-content")).toHaveClass(
    /okkly-badge__content--invisible/,
  );
});
