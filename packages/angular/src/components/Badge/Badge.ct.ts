import { expect, test } from "../../playwright/harness";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
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
      row === "anchored"
        ? `<okkly-badge badgeContent="5" color="${column}"><okkly-avatar initials="OK" /></okkly-badge>`
        : `<okkly-badge badgeContent="5" color="${column}" variant="${row === "dot" ? "dot" : "standard"}" />`,
  });

  executeMatrixScreenshotTest({
    name: "Badge (placement)",
    columns: ["top-right", "top-left", "bottom-right", "bottom-left"],
    rows: ["circular", "rectangular"],
    fastNoIsolation: true,
    component: (column, row) => {
      const [vertical, horizontal] = column.split("-");
      return `<okkly-badge badgeContent="8" color="danger" overlap="${row}" [anchorOrigin]="{ vertical: '${vertical}', horizontal: '${horizontal}' }">
        <okkly-avatar initials="OK" shape="${row === "circular" ? "circle" : "rounded"}" />
      </okkly-badge>`;
    },
  });
});

test("should render a standalone neutral pill by default", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-badge badgeContent="5" />`);

  // ASSERT
  await expect(component).toHaveClass(/okkly-component/);
  await expect(component).toHaveClass(/okkly-badge--standalone/);
  await expect(component).not.toHaveClass(/okkly-badge--color-/);
  await expect(component.locator(".okkly-badge__content")).toHaveText("5");
  await expect(component.locator(".okkly-badge__anchor")).toBeHidden();
});

test("should apply a color modifier only when color is set", async ({ mountTemplate, update }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-badge badgeContent="3" [color]="state().color" />`,
    { color: "danger" },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--color-danger/);

  // ACT
  await update({ color: undefined });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-badge--color-/);
});

test("should cap numeric overflow at max+", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-badge badgeContent="120" max="99" color="danger" />`,
  );

  // ASSERT
  await expect(component.locator(".okkly-badge__content")).toHaveText("99+");
});

test("should hide zero counts", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-badge badgeContent="0" />`);
  const content = component.locator(".okkly-badge__content");

  // ASSERT
  await expect(content).toHaveClass(/okkly-badge__content--invisible/);
  await expect(content).toHaveAttribute("aria-hidden", "true");
});

test("should show a text label as-is", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-badge badgeContent="New" color="success" />`);

  // ASSERT
  await expect(component.locator(".okkly-badge__content")).toHaveText("New");
  await expect(component.locator(".okkly-badge__content")).not.toHaveAttribute("aria-hidden");
});

test("should render a dot variant without text", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-badge variant="dot" color="success" badgeContent="4" />`,
  );
  const content = component.locator(".okkly-badge__content");

  // ASSERT
  await expect(content).toHaveClass(/okkly-badge__content--dot/);
  await expect(content).not.toHaveClass(/okkly-badge__content--invisible/);
  await expect(content).toBeEmpty();
  await expect(content).toHaveAttribute("aria-hidden", "true");
});

test("should anchor to its projected content", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-badge badgeContent="2" color="primary"><okkly-avatar initials="OK" /></okkly-badge>`,
  );
  const content = component.locator(".okkly-badge__content");

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-badge--standalone/);
  await expect(component.getByText("OK")).toBeVisible();
  await expect(content).toHaveText("2");
  await expect(content).toHaveClass(/okkly-badge__content--top/);
  await expect(content).toHaveClass(/okkly-badge__content--right/);
});

test("should switch between anchored and standalone as content comes and goes", async ({
  mountTemplate,
  update,
}) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-badge badgeContent="2">
      @if (state().withAnchor) {
        <okkly-avatar initials="OK" />
      }
    </okkly-badge>`,
    { withAnchor: false },
  );

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--standalone/);

  // ACT
  await update({ withAnchor: true });

  // ASSERT
  await expect(component).not.toHaveClass(/okkly-badge--standalone/);
  await expect(component.locator(".okkly-badge__content")).toHaveClass(/okkly-badge__content--top/);

  // ACT
  await update({ withAnchor: false });

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--standalone/);
});

test("should apply overlap and anchor origin classes", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(
    `<okkly-badge badgeContent="1" overlap="rectangular" [anchorOrigin]="{ vertical: 'bottom', horizontal: 'left' }">
      <span>Anchor</span>
    </okkly-badge>`,
  );
  const content = component.locator(".okkly-badge__content");

  // ASSERT
  await expect(component).toHaveClass(/okkly-badge--overlap-rectangular/);
  await expect(content).toHaveClass(/okkly-badge__content--bottom/);
  await expect(content).toHaveClass(/okkly-badge__content--left/);
});

test("should hide the badge when invisible", async ({ mountTemplate }) => {
  // ARRANGE
  const component = await mountTemplate(`<okkly-badge badgeContent="4" invisible />`);

  // ASSERT
  await expect(component.locator(".okkly-badge__content")).toHaveClass(
    /okkly-badge__content--invisible/,
  );
});
