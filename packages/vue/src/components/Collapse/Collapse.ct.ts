import { expect, test } from "../../playwright/a11y";
import { executeMatrixScreenshotTest } from "../../playwright/screenshots";
import Collapse from "./Collapse.vue";
import type { CollapseOrientation } from "./Collapse.types";

const ORIENTATIONS = ["vertical", "horizontal"] as const satisfies readonly CollapseOrientation[];
const content = { default: "<div>Collapse content</div>" };

test.describe("Screenshot tests", () => {
  executeMatrixScreenshotTest({
    name: "Collapse (states)",
    columns: ["entered", "exited", "collapsed-size"],
    rows: ORIENTATIONS,
    fastNoIsolation: true,
    component: Collapse,
    args: (column, row) => ({
      props: {
        in: column === "entered",
        orientation: row,
        collapsedSize: column === "collapsed-size" ? 40 : undefined,
        appear: false,
      },
      slots: {
        default: `<div style="padding: 0.5rem; background: var(--okkly-bg-surface)">Collapse content</div>`,
      },
    }),
  });
});

test("should render its slot when in is true", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toContainText("Collapse content");
});

test("should use the vertical orientation by default", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--vertical/);
});

test("should use the horizontal orientation when asked", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, {
    props: { in: true, orientation: "horizontal" },
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--horizontal/);
});

test("should keep collapsedSize as the minimum dimension", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, {
    props: { in: false, collapsedSize: 40, appear: false },
    slots: { default: `<div style="height: 200px">Collapse content</div>` },
  });

  // ASSERT — a closed panel still occupies its collapsed size.
  await expect(component).toHaveCSS("min-height", "40px");
  const box = (await component.boundingBox())!;
  expect(Math.round(box.height)).toBe(40);
});

test("should render the wrapper structure", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, { props: { in: true }, slots: content });

  // ASSERT
  await expect(component.locator(".okkly-collapse__wrapper")).toBeAttached();
  await expect(component.locator(".okkly-collapse__wrapper-inner")).toBeAttached();
});

test("should unmount its content when in is false and unmountOnExit is set", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, {
    props: { in: false, unmountOnExit: true, appear: false },
    slots: content,
  });

  // ASSERT
  await expect(component).not.toContainText("Collapse content");
});

test("should fire enter then entered on initial mount when in starts true", async ({
  mount,
  page,
}) => {
  // ARRANGE — a `component.update()` re-mount does not carry the `on:` emit
  // listeners from the original `mount()` forward, so this is checked on the
  // initial-mount case instead.
  const calls: string[] = [];
  await mount(Collapse, {
    props: { in: true, timeout: 50 },
    slots: { default: `<div style="height: 80px">Collapse content</div>` },
    on: { enter: () => calls.push("enter"), entered: () => calls.push("entered") },
  });
  await page.waitForTimeout(200);

  // ASSERT
  expect(calls).toEqual(["enter", "entered"]);
});

test("should apply the entered class once settled", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, {
    props: { in: false, timeout: 30, appear: false },
    slots: { default: `<div style="height: 40px">Collapse content</div>` },
  });
  await expect(component).not.toHaveClass(/okkly-collapse--entered/);

  // ACT
  await component.update({ props: { in: true, timeout: 30, appear: false } });

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse--entered/, { timeout: 2000 });
});

test("should apply a custom className", async ({ mount }) => {
  // ARRANGE
  const component = await mount(Collapse, {
    props: { in: true, class: "custom-class" } as never,
    slots: content,
  });

  // ASSERT
  await expect(component).toHaveClass(/okkly-collapse/);
  await expect(component).toHaveClass(/custom-class/);
});
